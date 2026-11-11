// Combate solo no privado + progressão. Começa de um encontro pendente (lacaio da exploração, vilão num covil,
// cena do narrador). Menu numerado + dado. Tudo numa transação com trava na linha do jogador e da batalha.
// Devolve também `eventos` (vilão derrotado, derrota, nível…) para o mundo vivo anunciar no grupo e avançar a história.
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { novoCombate, resolverRodada, painel, textoMenu, escolher, recompensa, aplicarXP, atributoPrincipal, HABILIDADES, CLASSES, KITS, proximaHabilidade } from "../regras/combate.mjs";
import { REGIAO, MATERIAIS } from "../regras/exploracao.mjs";
import { bonusEquip, item as itemDe, todosItens, EQUIP_CLASSE } from "../regras/itens.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { renderizar } from "../avatar/index.mjs";
import { DNA_VILOES, DNA_MASCARA } from "../avatar/dna.mjs";
import { rodape } from "./textos.mjs";

const VILOES = new Map(JSON.parse(readFileSync(new URL("../../data/viloes.json", import.meta.url), "utf8")).map((v) => [v.id, v]));
const REINO_DA_REGIAO = new Map([...REGIAO.values()].map((r) => [r.nome, r.reino]));
export const RECUPERACAO_POR_HORA = 0.2; // fora de combate: 20% da vida e da mana por hora
const ATRIBUTOS = ["FOR", "DEF", "MAG", "RES", "VEL", "SOR"];

export function imagemVilao(v, escala = 6) {
  const dna = DNA_MASCARA[v.id] ?? DNA_VILOES[v.id];
  if (!dna) return null;
  return renderizar({ id: v.id, elemento: v.elemento, reino: REINO_DA_REGIAO.get(v.regiao) ?? "Kokū",
    brilhoAura: ["rei", "divindade"].includes(v.tier), ...dna }, escala);
}

/** Nome do lacaio de um vilão (o que se encontra explorando; o vilão em si só existe no covil dele). */
export function nomeLacaio(v) {
  const p = { besta: "Cria de", bruto: "Capanga de", assassino: "Capanga de", equilibrado: "Capanga de", tanque: "Guarda de", mago: "Aprendiz de",
    invocador: "Seguidor de", "morto-vivo": "Sombra de", espiritual: "Sombra de", divino: "Fragmento de" }[v.arquetipo] ?? "Servo de";
  return `${p} ${v.nome}`;
}

/** Vida e mana voltam com o tempo fora de combate (calculado na hora, sem relógio). */
export function recuperar(j, agora) {
  const desde = +new Date(j.recuperacao_em ?? agora);
  const horas = Math.max(0, (agora - desde) / 3_600_000);
  const hp = Math.min(j.hp_max, j.hp + Math.floor(j.hp_max * RECUPERACAO_POR_HORA * horas));
  const mp = Math.min(j.mp_max, j.mp + Math.floor(j.mp_max * RECUPERACAO_POR_HORA * horas));
  return { hp, mp, mudou: hp !== j.hp || mp !== j.mp };
}

/** Bênçãos da campanha: cada arco de reino concluído fortalece o jogador (+5% de dano), os reis antigos +15%. */
export function bonusCampanha(chaves) {
  let b = 1;
  for (const k of chaves) { if (/^b:arco-/.test(k)) b += 0.05; if (/^b:pacto-/.test(k)) b += 0.15; if (k === "b:reis-antigos") b += 0.15; if (k === "b:ninho") b += 0.1; }
  return b;
}

export function criarCombate({ db, rng, agora }) {
  async function executar(q, jogadorId, msg) {
    const j = (await q("select * from jogo.jogadores where id = $1 for update", [jogadorId]))[0];
    const saidas = [], eventos = [];
    const para = msg.chat;
    const dizer = (texto) => saidas.push({ para, texto });
    const fim = (tratado) => ({ jogador: j, saidas, tratado, eventos });
    if (!j || j.estado !== "ativo") return fim(false);
    const t = semAcento(String(msg.texto ?? "").trim().toLowerCase()).replace(/^[!/]/, "").replace(/\s+/g, " ");
    const tempo = agora(), iso = new Date(tempo);

    const b = (await q(`select b.* from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id
      where p.jogador_id = $1 and b.status <> 'encerrada' and b.tipo = 'solo' order by b.id desc limit 1 for update of b`, [j.id]))[0];

    if (!b) {
      // Fora de combate: recupera vida/mana pelo tempo passado
      const r = recuperar(j, tempo);
      if (r.mudou || !j.recuperacao_em) {
        Object.assign(j, { hp: r.hp, mp: r.mp, recuperacao_em: iso });
        await q("update jogo.jogadores set hp = $2, mp = $3, recuperacao_em = $4 where id = $1", [j.id, j.hp, j.mp, iso]);
      }
      if (/^(distribuir|pontos)\b/.test(t)) { await distribuir(q, j, t, dizer); return fim(true); }
      if (/^(habilidades|tecnicas|golpes|skills)$/.test(t)) { dizer(textoHabilidades(j)); return fim(true); }
      if (!/^(lutar|enfrentar|luto|lutar!|atacar|a|aceito lutar|bora|1)$/.test(t)) return fim(false);
      const pend = (await q("select * from jogo.exploracoes where jogador_id = $1 and pendente and tipo = 'encontro' for update", [j.id]))[0];
      if (!pend) { if (["a", "atacar", "1"].includes(t)) return fim(false); dizer("Não há ninguém para enfrentar aqui. Use *explorar*, ou vá a um lugar perigoso com *ir <lugar>*."); return fim(true); }
      const v = VILOES.get(pend.dados.inimigo.id);
      if (!v) { dizer("Quando você se vira, não há mais ninguém ali."); await q("update jogo.exploracoes set pendente = false, resolvida_em = $2 where id = $1", [pend.id, iso]); return fim(true); }
      if (j.hp <= Math.max(1, j.hp_max * 0.05)) { dizer("Você mal consegue ficar em pé. Descanse ou use uma poção antes de lutar."); return fim(true); }

      const inv = await q("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1", [j.id]);
      const prog = await q("select chave, valor from jogo.progresso where jogador_id = $1 and (chave like 'b:%' or chave = $2 or chave = 'apoio')", [j.id, `juramento:${v.id}`]);
      const chaves = prog.map((x) => x.chave);
      const juramento = chaves.includes(`juramento:${v.id}`);
      // Apoio dos companheiros (mandado pelo grupo): vale para a próxima luta contra um vilão de covil
      const apoio = pend.dados.fixo ? Number(prog.find((x) => x.chave === "apoio")?.valor ?? 0) : 0;
      if (apoio) await q("delete from jogo.progresso where jogador_id = $1 and chave = 'apoio'", [j.id]);
      const pet = (await q("select nome, estagio from jogo.pets where jogador_id = $1", [j.id]))[0] ?? null;
      const vd = pend.dados.lacaio ? { ...v, nome: nomeLacaio(v), tier: "comum" } : v;
      const estado = novoCombate(j, vd, pend.dados.inimigo.nivel, { agora: tempo, equip: bonusEquip(inv), eco: Boolean(pend.dados.eco),
        itens: Object.fromEntries(inv.map((i) => [i.item_id, i.qtd])), bonusDano: bonusCampanha(chaves) * (juramento ? 1.15 : 1) * (1 + 0.1 * apoio), pet });
      estado.contexto = { lacaio: Boolean(pend.dados.lacaio), fixo: Boolean(pend.dados.fixo), eco: Boolean(pend.dados.eco), vilao: v.id, juramento };
      const nb = (await q(`insert into jogo.batalhas (mundo_id, tipo, canal_wa_id, rodada, status, estado)
        values ($1, 'solo', $2, 1, 'aguardando', $3) returning id`, [j.mundo_id, para, JSON.stringify(estado)]))[0];
      await q("insert into jogo.participantes_batalha (batalha_id, jogador_id) values ($1, $2)", [nb.id, j.id]);
      await q("update jogo.exploracoes set pendente = false, resolvida_em = $2, dados = dados || $3 where id = $1",
        [pend.id, iso, JSON.stringify({ escolha: "lutar", batalha_id: nb.id })]);
      dizer(`${juramento ? "Você lembra do seu juramento. As mãos param de tremer.\n\n" : ""}${apoio ? `Você sente a força de ${apoio === 1 ? "um companheiro" : `${apoio} companheiros`} com você.\n\n` : ""}${painel(estado)}\n\n${rodape("responda com o número da ação", "o dado decide a força do golpe")}`);
      return fim(true);
    }

    if (!b.estado?.inimigo) return fim(false);
    // Em batalha
    if (/^(\?|opcoes|painel|batalha|menu)$/.test(t)) { dizer(painel(b.estado)); return fim(true); }
    const esc = escolher(b.estado, t);
    if (!esc) {
      if (/^(ficha|carta|ajuda|comandos|status|itens|bolsa)$/.test(t)) return fim(false);
      dizer(`${b.estado.inimigo.nome} não tira os olhos de você. Agora não é hora de conversa.\n\n${textoMenu(b.estado)}`);
      return fim(true);
    }
    if (esc.erro || esc.bloqueio) { dizer(`${esc.erro ?? `Não dá agora: ${esc.bloqueio}.`}\n\n${textoMenu(b.estado)}`); return fim(true); }
    const r = resolverRodada(b.estado, esc.acao, rng);
    if (r.erro) { dizer(`${r.erro}\n\n${textoMenu(b.estado)}`); return fim(true); }
    if (r.consumir) {
      const apagou = await q("delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1", [j.id, r.consumir]);
      if (!apagou.length) await q("update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2", [j.id, r.consumir]);
    }
    const e = r.estado;
    e.contexto = b.estado.contexto; e.pet = b.estado.pet;
    if (!r.fim) {
      await q("update jogo.batalhas set estado = $2, rodada = $3 where id = $1", [b.id, JSON.stringify(e), e.rodada]);
      await q("update jogo.jogadores set hp = $2, mp = $3 where id = $1", [j.id, e.jogador.hp, e.jogador.mp]);
      dizer(painel(e));
      return fim(true);
    }
    await finalizar(q, j, b, e, r.fim, dizer, iso, eventos);
    return fim(true);
  }

  async function finalizar(q, j, b, e, resultado, dizer, iso, eventos) {
    const ctx = e.contexto ?? {};
    const v = VILOES.get(ctx.vilao ?? e.inimigo.id);
    const log = e.log.join("\n");
    let res = { resultado };
    if (resultado === "vitoria") {
      const rec = recompensa(j, e.inimigo, rng);
      // Derrota única: o primeiro do mundo derruba o vilão de verdade; os demais enfrentam o Eco.
      let primeiro = false;
      if (ctx.fixo) {
        const ja = await q("select 1 from jogo.derrotas_vilao where mundo_id = $1 and vilao_id = $2 and primeiro", [j.mundo_id, v.id]);
        primeiro = !ja.length;
        await q(`insert into jogo.derrotas_vilao (mundo_id, vilao_id, jogador_id, primeiro, criado_em) values ($1, $2, $3, $4, $5)
          on conflict do nothing`, [j.mundo_id, v.id, j.id, primeiro, iso]);
      }
      const multXP = ctx.lacaio ? 0.7 : ctx.fixo ? (primeiro ? 1.5 : 1) : 1;
      rec.xp = Math.round(rec.xp * multXP); rec.ryo = Math.round(rec.ryo * multXP);
      const depois = aplicarXP({ ...j, hp: e.jogador.hp, mp: e.jogador.mp }, rec.xp);
      const livro = [...depois.eventos];
      if (rec.superior && !ctx.lacaio) {
        const k = atributoPrincipal(j.classe);
        depois.atributos[k] += 1;
        livro.push({ atributo: k, delta: 1, fonte: "vitoria_superior", detalhe: { inimigo: v.id, nivel: e.inimigo.nivel } });
      }
      // Espólios: material da região, às vezes um consumível; vilões de covil podem largar equipamento da sua classe.
      const ganhos = [];
      const dar = async (id, tipo) => { await q(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, $3, 1, '{}')
        on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 1`, [j.id, id, tipo]); ganhos.push(itemDe(id)?.nome ?? id); };
      if (rng() < 0.3) { const m = MATERIAIS[REGIAO.get(j.regiao_atual)?.reino]; if (m) await dar(m.id, "material"); }
      if (rng() < (ctx.fixo ? 0.5 : 0.12)) await dar(rng() < 0.7 ? "pocao" : "pocao-mana", "consumivel");
      if (ctx.fixo && rng() < (primeiro ? 0.6 : 0.25)) {
        const p = EQUIP_CLASSE[j.classe];
        const cand = todosItens().filter((i) => i.tipo === "equipamento" && !i.lendario && i.slot !== "acessorio" && i.nivel <= Math.max(1, v.nivel) && i.nivel >= v.nivel * 0.4
          && (i.slot === "arma" ? p?.armas : p?.armaduras)?.includes(i.subtipo));
        const tenho = new Set((await q("select item_id from jogo.inventario where jogador_id = $1", [j.id])).map((x) => x.item_id));
        const novos = cand.filter((i) => !tenho.has(i.id));
        if (novos.length) await dar(novos[Math.floor(rng() * novos.length)].id, "equipamento");
      }
      await q(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8,
        pontos_livres = $9, rank = $10, ryo = ryo + $11, recuperacao_em = $12 where id = $1`,
      [j.id, depois.nivel, depois.xp, JSON.stringify(depois.atributos), depois.hp, depois.hp_max, depois.mp, depois.mp_max,
        depois.pontos_livres, depois.rank, rec.ryo, iso]);
      for (const ev of livro) await q(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, $4, $5)`,
        [j.id, ev.atributo, ev.delta, ev.fonte, JSON.stringify(ev.detalhe ?? {})]);
      res = { ...res, xp: rec.xp, ryo: rec.ryo, niveis: depois.niveis, ganhos, primeiro };
      let texto = `⚔️ *Vitória*\n\n${log}\n\nVocê respira fundo. Acabou.${ganhos.length ? ` Entre os restos, você encontra: *${ganhos.join("*, *")}*.` : ""}` +
        `\n${rodape(`+${rec.xp} XP`, `+${rec.ryo} ryō`)}`;
      if (ctx.fixo && !primeiro) texto += `\n\n_O que você derrotou era um Eco: a sombra de ${v.nome}, que já tinha caído neste mundo. O Vazio repete o que perde._`;
      if (rec.superior && !ctx.lacaio) texto += `\n\nVencer alguém tão mais forte muda você por dentro.\n${rodape(`${atributoPrincipal(j.classe)} +1`)}`;
      if (depois.niveis.length) {
        const cresc = Object.entries(CLASSES[j.classe]?.cresc ?? {}).filter(([, x]) => x).map(([k, x]) => `${k} +${x * depois.niveis.length}`).join(" · ");
        texto += `\n\n*Nível ${depois.nivel}.* Seu corpo responde melhor, sua mana corre mais forte. Vida e mana voltam ao máximo.\n${rodape(cresc, `vida ${depois.hp_max}`, `mana ${depois.mp_max}`)}`;
        for (const h of (KITS[j.classe] ?? []).filter((h) => h.nivel > j.nivel && h.nivel <= depois.nivel))
          texto += `\n\nVocê aprendeu uma habilidade nova: *${h.nome}* — ${h.resumo}.`;
        if (depois.rank !== j.rank) texto += `\n\nAs pessoas começam a falar de você. *Rank ${depois.rank}.*`;
        if (depois.pontos_livres > j.pontos_livres) texto += `\n\nVocê ganhou *${depois.pontos_livres - j.pontos_livres} pontos* para colocar onde quiser. Use *distribuir*.`;
        if (depois.rank !== j.rank) eventos.push({ tipo: "rank", rank: depois.rank, nivel: depois.nivel });
      } else texto += `\n${rodape(`XP ${depois.xp}/${XP_PROXIMO(depois.nivel)}`)}`;
      dizer(texto);
      Object.assign(j, { nivel: depois.nivel, rank: depois.rank, hp: depois.hp, mp: depois.mp, hp_max: depois.hp_max, mp_max: depois.mp_max, xp: depois.xp, atributos: depois.atributos });
      eventos.push({ tipo: "vitoria" });
      if (ctx.fixo) eventos.push({ tipo: "vilao", vilao: v.id, primeiro, nivelJogador: depois.nivel, juramento: ctx.juramento });
    } else if (resultado === "derrota") {
      const hp = Math.max(1, Math.round(j.hp_max * 0.1));
      const roubavel = !["besta", "espiritual", "morto-vivo", "divino"].includes(v?.arquetipo);
      const perda = roubavel ? Math.floor(Number(j.ryo) * 0.3) : 0;
      const atributo = ATRIBUTOS[Math.floor(rng() * ATRIBUTOS.length)];
      const efeitos = [...(j.efeitos ?? []).filter((x) => !(x.tipo === "ferida" && +new Date(x.ate) <= +iso)),
        { tipo: "ferida", atributo, ate: new Date(+iso + 86_400_000).toISOString() }];
      await q(`update jogo.jogadores set hp = $2, mp = $3, ryo = ryo - $4, efeitos = $5, recuperacao_em = $6 where id = $1`,
        [j.id, hp, e.jogador.mp, perda, JSON.stringify(efeitos), iso]);
      res = { ...res, perda, ferida: atributo };
      dizer(`*Derrota*\n\n${log}\n\nTudo escurece.\n\n` +
        `${roubavel ? "Você acorda com a bolsa mais leve. Levaram parte do seu dinheiro enquanto você estava caído." : `Você acorda longe dali, arrastado e largado por ${e.inimigo.nome}.`} ` +
        `Cada respiração dói.\n${rodape(`vida ${hp}`, roubavel && perda ? `−${perda} ryō` : null, `ferida: ${atributo} −10% por 24 h`)}\n\n` +
        `_Da próxima vez: defenda quando ele juntar forças, e mire no ponto fraco (${v?.fraqueza ?? "?"}). A vida volta com o tempo; uma bandagem cura a ferida._`);
      Object.assign(j, { hp });
      eventos.push({ tipo: "caiu" });
      if (ctx.fixo) eventos.push({ tipo: "derrota", vilao: v.id });
    } else {
      await q("update jogo.jogadores set hp = $2, mp = $3, recuperacao_em = $4 where id = $1", [j.id, e.jogador.hp, e.jogador.mp, iso]);
      dizer(`${log}\n\nSó quando o barulho fica para trás você para de correr. Vivo.\n${rodape(`vida ${e.jogador.hp}/${e.jogador.hpMax}`)}`);
    }
    await q("update jogo.batalhas set estado = $2, status = 'encerrada', resultado = $3 where id = $1", [b.id, JSON.stringify(e), JSON.stringify(res)]);
  }

  async function distribuir(q, j, t, dizer) {
    const pares = [...t.toUpperCase().matchAll(/\b(FOR|DEF|MAG|RES|VEL|SOR)\s*\+?(\d+)/g)].map((m) => [m[1], Number(m[2])]);
    if (!pares.length) {
      dizer(`*Pontos livres: ${j.pontos_livres}*\n${j.pontos_livres ? "Escolha onde colocar. Ex.: *distribuir FOR 2 VEL 1*" : "Você ganha 3 a cada 10 níveis."}\n\n` +
        rodape("FOR força", "DEF defesa", "MAG magia", "RES resistência", "VEL velocidade", "SOR sorte"));
      return;
    }
    const total = pares.reduce((s, [, n]) => s + n, 0);
    if (total > j.pontos_livres || total <= 0) { dizer(`Você tem *${j.pontos_livres}* pontos livres e tentou usar ${total}.`); return; }
    const at = { ...j.atributos };
    for (const [k, n] of pares) {
      at[k] += n;
      await q(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, 'pontos_livres', '{}')`, [j.id, k, n]);
    }
    await q("update jogo.jogadores set atributos = $2, pontos_livres = pontos_livres - $3 where id = $1", [j.id, JSON.stringify(at), total]);
    Object.assign(j, { atributos: at, pontos_livres: j.pontos_livres - total });
    dizer(`Você treina até sentir a diferença.\n${rodape(...pares.map(([k, n]) => `${k} +${n}`), `restam ${j.pontos_livres}`)}`);
  }

  return async (jogadorId, msg) => db.script(async (q) => {
    await q("begin");
    try {
      await q("set local statement_timeout = '10s'");
      const r = await executar(q, jogadorId, msg);
      await q("commit");
      return r;
    } catch (e) { await q("rollback"); throw e; }
  });
}

/** Lista das habilidades da classe: as que já tem e as que ainda vai aprender. */
export function textoHabilidades(j) {
  const kit = KITS[j.classe] ?? [];
  const linhas = kit.map((h) => j.nivel >= h.nivel
    ? `*${h.nome}* — ${h.resumo}${h.mp ? ` _(${h.mp} de mana)_` : ""}`
    : `_${h.nome} — aprende no nível ${h.nivel}_`);
  const prox = proximaHabilidade(j.classe, j.nivel);
  return `*Habilidades de ${j.classe}*\n\n${linhas.join("\n")}\n\n${rodape("além disso: atacar, defender" + (j.mp_max > 0 ? ", magia do seu elemento" : ""), prox ? `próxima no nível ${prox.nivel}` : "todas aprendidas")}`;
}

export { HABILIDADES };
