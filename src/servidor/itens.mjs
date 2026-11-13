// Itens no privado: bolsa detalhada (o que cada item faz e quantos usos tem), equipar, usar, loja e descanso.
import { item, efeitoItem, podeEquipar, estoque, precoVenda, CONSUMIVEIS, descricaoEquipClasse, bonusEquip, HABILIDADE_ITEM } from "../regras/itens.mjs";
import { REGIAO, REGIOES, normal } from "../regras/exploracao.mjs";
import { MUNDO } from "../mundo/mundo.mjs";
import { rodape } from "./textos.mjs";

const SLOT = { arma: "arma", armadura: "armadura", acessorio: "acessório" };

/** Linhas da bolsa em ordem estável: equipados, consumíveis, equipamentos guardados, materiais. */
export function ordenarBolsa(linhas) {
  const peso = (l) => { const it = item(l.item_id); return l.equipado ? 0 : it?.tipo === "consumivel" ? 1 : it?.tipo === "equipamento" ? 2 : 3; };
  return [...linhas].sort((a, b) => peso(a) - peso(b) || a.item_id.localeCompare(b.item_id));
}

function achar(linhasOuItens, alvo, nomeDe) {
  const t = normal(alvo);
  if (/^\d+$/.test(t)) return linhasOuItens[Number(t) - 1] ?? null;
  return linhasOuItens.find((x) => normal(nomeDe(x)) === t) ?? linhasOuItens.find((x) => normal(nomeDe(x)).includes(t)) ?? null;
}

export function criarItens({ db, agora }) {
  const bolsa = (j) => db.query("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1", [j.id]).then(ordenarBolsa);
  const tipoLoja = (j) => {
    const r = MUNDO[j.regiao_atual];
    if (!r?.locais.some((l) => l.servicos?.includes("loja"))) return null;
    return r.tipo === "capital" ? "completa" : "simples";
  };
  const temDescanso = (j) => MUNDO[j.regiao_atual]?.locais.some((l) => l.servicos?.includes("descanso"));

  /** Atributos como ficam agora, com tudo que está equipado (é o que vale nas lutas e o que a ficha mostra). */
  const totais = async (j) => {
    const b = bonusEquip(await db.query("select item_id, equipado from jogo.inventario where jogador_id = $1 and equipado", [j.id])), a = j.atributos ?? {};
    return `*Seus atributos agora*\n${["FOR", "DEF", "MAG", "RES", "VEL", "SOR"].map((k) => `${k} ${(a[k] ?? 0) + (b[k] ?? 0)}${b[k] ? ` _(+${b[k]})_` : ""}`).join(" · ")}\n${rodape("já vale nas lutas", "ficha mostra tudo")}`;
  };

  return async function comando(j, t, para) {
    const dizer = (texto) => ({ tratado: true, saidas: [{ para, texto }] });
    let m;

    if (/^(itens|item|bolsa|mochila|inventario|minha bolsa|meus itens)$/.test(t)) {
      const linhas = await bolsa(j);
      if (!linhas.length) return dizer(`*Sua bolsa*\n\nVazia.\n\n${rodape(`${j.ryo} ryō`)}`);
      const txt = linhas.map((l, i) => {
        const it = item(l.item_id);
        const usos = it?.tipo === "consumivel" ? `${l.qtd} ${l.qtd === 1 ? "uso" : "usos"}` : l.qtd > 1 ? `×${l.qtd}` : null;
        return `*${i + 1}* ${it?.nome ?? l.item_id}${l.equipado ? " _(equipado)_" : ""}${usos ? ` — ${usos}` : ""}\n   _${efeitoItem(it) || "—"}_`;
      }).join("\n");
      const b = bonusEquip(linhas);
      return dizer(`*Sua bolsa*\n\n${txt}\n\n${rodape(`${j.ryo} ryō`, Object.keys(b).length ? `equipamento: ${Object.entries(b).map(([k, v]) => `${k} +${v}`).join(" ")}` : null)}\n` +
        rodape("equipar <nº> · usar <nº> · vender <nº> (numa loja)"));
    }

    if ((m = t.match(/^(equipar|vestir|empunhar)\s+(.+)$/))) {
      const linhas = await bolsa(j);
      const l = achar(linhas, m[2], (x) => item(x.item_id)?.nome ?? x.item_id);
      if (!l) return dizer("Você não tem isso na bolsa. Veja com *itens*.");
      const it = item(l.item_id);
      const erro = podeEquipar(j, it);
      if (erro) return dizer(erro);
      await db.script(async (q) => {
        await q("begin");
        try {
          const outros = linhas.filter((x) => x.equipado && item(x.item_id)?.slot === it.slot).map((x) => x.item_id);
          if (outros.length) await q("update jogo.inventario set equipado = false where jogador_id = $1 and item_id = any($2)", [j.id, outros]);
          await q("update jogo.inventario set equipado = true where jogador_id = $1 and item_id = $2", [j.id, it.id]);
          await q("commit");
        } catch (e) { await q("rollback"); throw e; }
      });
      const hab = HABILIDADE_ITEM[it.id];
      return dizer(`Você equipa *${it.nome}*.\n${rodape(efeitoItem(it), `ocupa: ${SLOT[it.slot]}`)}${hab ? `\n\n*Nova habilidade nas suas lutas: ${hab.nome}* — ${hab.resumo}.\n_Ela se soma às que você já tem e vale enquanto o item estiver equipado._` : ""}\n\n${await totais(j)}`);
    }
    if ((m = t.match(/^(desequipar|guardar|tirar)\s+(.+)$/))) {
      const linhas = (await bolsa(j)).filter((x) => x.equipado);
      const l = achar(linhas, m[2], (x) => item(x.item_id)?.nome ?? x.item_id);
      if (!l) return dizer("Isso não está equipado.");
      await db.query("update jogo.inventario set equipado = false where jogador_id = $1 and item_id = $2", [j.id, l.item_id]);
      return dizer(`Você guarda *${item(l.item_id).nome}* na bolsa.\n\n${await totais(j)}`);
    }

    if ((m = t.match(/^(usar|beber|comer|ler)\s+(.+)$/))) {
      const linhas = await bolsa(j);
      const l = achar(linhas, m[2], (x) => item(x.item_id)?.nome ?? x.item_id);
      const c = l && CONSUMIVEIS[l.item_id];
      if (!l) return dizer("Você não tem isso na bolsa. Veja com *itens*.");
      if (l.item_id === "pergaminho-terra") return { tratado: false, saidas: [], pergaminhoTerra: true };
      if (l.item_id === "reliquia-fera") return { tratado: false, saidas: [], reliquiaFera: true };
      if (!c) return dizer(item(l.item_id)?.tipo === "equipamento" ? `Isso se equipa: *equipar ${item(l.item_id).nome.toLowerCase()}*.` : "Isso não se usa assim.");
      if (!c.fora) return dizer(`${c.nome} só serve durante uma luta.`);
      const partes = [];
      const set = {};
      if (c.cura) { const v = Math.min(j.hp_max - j.hp, Math.round(j.hp_max * c.cura)); set.hp = j.hp + v; partes.push(`+${v} de vida`); }
      if (c.mana) { const v = Math.min(j.mp_max - j.mp, Math.round(j.mp_max * c.mana)); set.mp = j.mp + v; partes.push(`+${v} de mana`); }
      if (c.vigor) { set.vigor = Math.min(100, j.vigor + c.vigor); partes.push(`vigor ${set.vigor}/100`); }
      if (c.curaFerida) {
        const feridas = (j.efeitos ?? []).filter((x) => x.tipo === "ferida" && +new Date(x.ate) > agora());
        if (!feridas.length) return dizer("Você não tem nenhuma ferida para tratar.");
        set.efeitos = JSON.stringify((j.efeitos ?? []).filter((x) => x !== feridas[0])); partes.push(`ferida curada (${feridas[0].atributo})`);
      }
      if (c.retorno) {
        const reino = REGIAO.get(j.regiao_atual)?.reino;
        const capital = REGIOES.find((r) => r.reino === reino && MUNDO[r.id]?.tipo === "capital");
        if (!capital || capital.id === j.regiao_atual) return dizer("O pergaminho não reage. Você já está na capital (ou este lugar não tem uma).");
        const viagem = await db.query("select 1 from jogo.viagens where jogador_id = $1 and concluida_em is null", [j.id]);
        if (viagem.length) return dizer("Termine a viagem atual primeiro.");
        set.regiao_atual = capital.id; set.local_atual = null; partes.push(`você está em ${capital.nome}`);
      }
      if (!partes.length || (c.cura && !c.mana && set.hp === j.hp) || (c.mana && !c.cura && set.mp === j.mp)) return dizer("Você não precisa disso agora.");
      const usado = await db.query(`with u as (delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1),
        d as (update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2 and qtd > 1 returning 1)
        select (select count(*) from u) + (select count(*) from d) as n`, [j.id, l.item_id]);
      if (!Number(usado[0].n)) return dizer("Você não tem mais isso.");
      const cols = Object.keys(set);
      await db.query(`update jogo.jogadores set ${cols.map((k, i) => `${k} = $${i + 2}`).join(", ")} where id = $1`, [j.id, ...cols.map((k) => set[k])]);
      Object.assign(j, set);
      return { tratado: true, mudouRegiao: Boolean(set.regiao_atual), saidas: [{ para, texto: `Você usa *${c.nome}*.${c.retorno ? " As letras queimam em azul e o mundo dobra ao seu redor." : ""}\n${rodape(...partes, l.qtd > 1 ? `restam ${l.qtd - 1}` : "era o último")}` }] };
    }

    if ((m = t.match(/^(?:loja|comprar|mercado|vender)(?:\s+(?:de\s+)?(pocoes|pocao|consumiveis|armas?|armaduras?|acessorios?))?$/))) {
      const tipo = tipoLoja(j);
      if (!tipo) return dizer("Não há loja por aqui. Procure uma vila ou cidade.");
      // Abas: o número de cada item é sempre o mesmo, com ou sem filtro (comprar <nº> não muda)
      const aba = !m[1] ? null : /^poc|^cons/.test(m[1]) ? "consumivel" : /^armad/.test(m[1]) ? "armadura" : /^arma/.test(m[1]) ? "arma" : "acessorio";
      const lista = estoque(tipo, j).map((it, i) => ({ it, n: i + 1 })).filter(({ it }) => !aba || (aba === "consumivel" ? it.tipo === "consumivel" : it.slot === aba));
      if (!lista.length) return dizer("Esta loja não tem nada desse tipo para a sua classe agora. Veja tudo com *loja*.");
      const txt = lista.map(({ it, n }) => `*${n}* ${it.nome} — ${it.preco} ryō\n   _${efeitoItem(it)}_`).join("\n");
      return dizer(`*Loja*${aba ? ` — ${{ consumivel: "poções e utilidades", arma: "armas", armadura: "armaduras", acessorio: "acessórios" }[aba]}` : ""}\n_${j.classe} usa: ${descricaoEquipClasse(j.classe)}_\n\n${txt}\n\n${rodape(`você tem ${j.ryo} ryō`, "comprar <nº> [quantidade]", "vender <nº da sua bolsa>", aba ? null : "abas: loja poções · loja armas · loja armaduras")}`);
    }
    if ((m = t.match(/^comprar\s+(\d+)(?:\s+(\d+))?$/))) {
      const tipo = tipoLoja(j);
      if (!tipo) return dizer("Não há loja por aqui.");
      const it = estoque(tipo, j)[Number(m[1]) - 1];
      if (!it) return dizer("A loja não tem esse número. Veja a lista com *loja*.");
      const qtd = it.tipo === "equipamento" ? 1 : Math.max(1, Math.min(20, Number(m[2] ?? 1)));
      const total = it.preco * qtd;
      const pago = await db.query("update jogo.jogadores set ryo = ryo - $2 where id = $1 and ryo >= $2 returning ryo", [j.id, total]);
      if (!pago.length) return dizer(`Custa ${total} ryō e você tem ${j.ryo}. O vendedor recolhe a mercadoria com um sorriso amarelo.`);
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, $3, $4, '{}')
        on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + excluded.qtd`, [j.id, it.id, it.tipo, qtd]);
      j.ryo = pago[0].ryo;
      return dizer(`Você compra *${it.nome}*${qtd > 1 ? ` ×${qtd}` : ""}.\n${rodape(`−${total} ryō`, `restam ${j.ryo}`, it.tipo === "equipamento" ? `para usar: equipar ${it.nome.toLowerCase()}` : null)}`);
    }
    if ((m = t.match(/^vender\s+(.+)$/))) {
      if (!tipoLoja(j)) return dizer("Não há loja por aqui.");
      const linhas = await bolsa(j);
      const l = achar(linhas, m[1], (x) => item(x.item_id)?.nome ?? x.item_id);
      if (!l) return dizer("Você não tem isso. Veja com *itens*.");
      const it = item(l.item_id), v = precoVenda(it);
      if (!v) return dizer("Ninguém aqui teria como pagar por isso — nem deveria.");
      if (l.equipado) return dizer("Desequipe antes de vender.");
      const ok = await db.query(`with u as (delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 and not equipado returning 1),
        d as (update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2 and qtd > 1 returning 1)
        select (select count(*) from u) + (select count(*) from d) as n`, [j.id, l.item_id]);
      if (!Number(ok[0].n)) return dizer("Você não tem mais isso.");
      const r = await db.query("update jogo.jogadores set ryo = ryo + $2 where id = $1 returning ryo", [j.id, v]);
      j.ryo = r[0].ryo;
      return dizer(`Você vende *${it.nome}*.\n${rodape(`+${v} ryō`, `agora ${j.ryo}`)}`);
    }

    if (/^(descansar|dormir|estalagem|pousada)$/.test(t)) {
      if (!temDescanso(j)) return dizer("Não há onde descansar com segurança por aqui. A vida e a mana voltam aos poucos com o tempo.");
      if (j.hp >= j.hp_max && j.mp >= j.mp_max) return dizer("Você já está descansado.");
      const custo = 5 + j.nivel * 3;
      const pago = await db.query(`update jogo.jogadores set ryo = ryo - $2, hp = hp_max, mp = mp_max, recuperacao_em = $3 where id = $1 and ryo >= $2 returning ryo`, [j.id, custo, new Date(agora())]);
      if (!pago.length) return dizer(`Uma noite custa ${custo} ryō e você tem ${j.ryo}. Você dorme ao relento: a vida volta mais devagar.`);
      Object.assign(j, { ryo: pago[0].ryo, hp: j.hp_max, mp: j.mp_max });
      return { ...dizer(`Uma cama de verdade, uma sopa quente. Você acorda inteiro.\n${rodape(`vida ${j.hp_max}/${j.hp_max}`, `mana ${j.mp_max}/${j.mp_max}`, `−${custo} ryō`)}`), descansou: true };
    }
    return { tratado: false, saidas: [] };
  };
}
