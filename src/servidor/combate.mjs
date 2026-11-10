// Combate solo no privado + progressão. Começa a partir de um encontro pendente (exploração ou narrador).
// Tudo numa transação com trava na linha do jogador e da batalha: mensagens repetidas não resolvem duas rodadas.
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { novoCombate, resolverRodada, painel, recompensa, aplicarXP, atributoPrincipal, HABILIDADES, CLASSES } from "../regras/combate.mjs";
import { REGIAO, MATERIAIS } from "../regras/exploracao.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { renderizar } from "../avatar/index.mjs";
import { DNA_VILOES, DNA_MASCARA } from "../avatar/dna.mjs";

const VILOES = new Map(JSON.parse(readFileSync(new URL("../../data/viloes.json", import.meta.url), "utf8")).map((v) => [v.id, v]));
const REINO_DA_REGIAO = new Map([...REGIAO.values()].map((r) => [r.nome, r.reino]));
export const RECUPERACAO_POR_HORA = 0.2; // fora de combate: 20% da vida e da mana por hora
const ATRIBUTOS = ["FOR", "DEF", "MAG", "RES", "VEL", "SOR"];

export function imagemVilao(v) {
  const dna = DNA_MASCARA[v.id] ?? DNA_VILOES[v.id];
  if (!dna) return null;
  return renderizar({ id: v.id, elemento: v.elemento, reino: REINO_DA_REGIAO.get(v.regiao) ?? "Kokū",
    brilhoAura: ["rei", "divindade"].includes(v.tier), ...dna }, 4);
}

/** Vida e mana voltam com o tempo fora de combate (calculado na hora, sem relógio). */
export function recuperar(j, agora) {
  const desde = +new Date(j.recuperacao_em ?? agora);
  const horas = Math.max(0, (agora - desde) / 3_600_000);
  const hp = Math.min(j.hp_max, j.hp + Math.floor(j.hp_max * RECUPERACAO_POR_HORA * horas));
  const mp = Math.min(j.mp_max, j.mp + Math.floor(j.mp_max * RECUPERACAO_POR_HORA * horas));
  return { hp, mp, mudou: hp !== j.hp || mp !== j.mp };
}

function acaoDe(t) {
  if (/^(a|atacar|ataque|ataco|bater|golpe)( \d)?$/.test(t)) return "atacar";
  if (/^(m|m1|magia|feitico|feitiço)$/.test(t)) return "magia";
  if (/^(h|h1|habilidade|skill|especial)$/.test(t)) return "habilidade";
  if (/^(d|defender|defesa|defendo|bloquear)$/.test(t)) return "defender";
  if (/^((i|item|usar|usa|bebo|beber) )?(pocao|p)$/.test(t)) return "item";
  if (/^(f|fugir|fujo|correr|corro)$/.test(t)) return "fugir";
  if (/^(\?|opcoes|painel|status|batalha)$/.test(t)) return "painel";
  return null;
}

export function criarCombate({ db, rng, agora }) {
  async function executar(q, jogadorId, msg) {
    const j = (await q("select * from jogo.jogadores where id = $1 for update", [jogadorId]))[0];
    const saidas = [];
    const para = msg.chat;
    const dizer = (texto) => saidas.push({ para, texto });
    const fim = (tratado) => ({ jogador: j, saidas, tratado });
    if (!j || j.estado !== "ativo") return fim(false);
    const t = semAcento(String(msg.texto ?? "").trim().toLowerCase()).replace(/^[!/]/, "").replace(/\s+/g, " ");
    const tempo = agora(), iso = new Date(tempo);

    const b = (await q(`select b.* from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id
      where p.jogador_id = $1 and b.status <> 'encerrada' order by b.id desc limit 1 for update of b`, [j.id]))[0];

    if (!b) {
      // Fora de combate: recupera vida/mana pelo tempo passado
      const r = recuperar(j, tempo);
      if (r.mudou || !j.recuperacao_em) {
        Object.assign(j, { hp: r.hp, mp: r.mp, recuperacao_em: iso });
        await q("update jogo.jogadores set hp = $2, mp = $3, recuperacao_em = $4 where id = $1", [j.id, j.hp, j.mp, iso]);
      }
      if (/^(distribuir|pontos)\b/.test(t)) { await distribuir(q, j, t, dizer); return fim(true); }
      if (!/^(lutar|enfrentar|luto|lutar!|atacar|a|aceito lutar|bora)$/.test(t)) return fim(false);
      const pend = (await q("select * from jogo.exploracoes where jogador_id = $1 and pendente and tipo = 'encontro' for update", [j.id]))[0];
      if (!pend) { if (t === "a" || t === "atacar") return fim(false); dizer("Não há nenhum inimigo na sua frente. Use *explorar* para procurar encrenca."); return fim(true); }
      const v = VILOES.get(pend.dados.inimigo.id);
      if (!v) { dizer("Esse inimigo sumiu na névoa."); await q("update jogo.exploracoes set pendente = false, resolvida_em = $2 where id = $1", [pend.id, iso]); return fim(true); }
      const estado = novoCombate(j, v, pend.dados.inimigo.nivel, { agora: tempo });
      const nb = (await q(`insert into jogo.batalhas (mundo_id, tipo, canal_wa_id, rodada, status, estado)
        values ($1, 'solo', $2, 1, 'aguardando', $3) returning id`, [j.mundo_id, para, JSON.stringify(estado)]))[0];
      await q("insert into jogo.participantes_batalha (batalha_id, jogador_id) values ($1, $2)", [nb.id, j.id]);
      await q("update jogo.exploracoes set pendente = false, resolvida_em = $2, dados = dados || $3 where id = $1",
        [pend.id, iso, JSON.stringify({ escolha: "lutar", batalha_id: nb.id })]);
      const img = imagemVilao(v);
      const intro = `⚔️ *A luta começou!*\n*${v.nome_completo}* — Nv ${estado.inimigo.nivel}${estado.inimigo.posturaMax ? " · inimigo de elite" : ""}\n` +
        `_${v.descricao ?? ""}_\n💡 Ponto fraco: *${v.fraqueza}*`;
      if (img) saidas.push({ para, imagem: img, legenda: intro }); else dizer(intro);
      dizer(painel(estado) + "\n\n_Responda com a letra da ação. Ex.: *a* para atacar._");
      return fim(true);
    }

    // Batalhas de outros modos (party, chefe…) ainda não são deste módulo
    if (!b.estado?.inimigo || b.tipo !== "solo") return fim(false);
    // Em batalha: tudo que for ação de combate é resolvido aqui
    const acao = acaoDe(t);
    if (!acao) {
      if (/^(ficha|carta|ajuda|comandos|status)$/.test(t)) return fim(false);
      dizer(`⚔️ Você está em batalha!\n${painel(b.estado).split("━━━━━━━━━━").at(-1).trim()}`);
      return fim(true);
    }
    if (acao === "painel") { dizer(painel(b.estado)); return fim(true); }
    const pocao = (await q("select qtd from jogo.inventario where jogador_id = $1 and item_id = 'pocao'", [j.id]))[0];
    const r = resolverRodada(b.estado, { tipo: acao, temPocao: (pocao?.qtd ?? 0) > 0 }, rng);
    if (r.erro) { dizer(`❌ ${r.erro}\n${painel(b.estado).split("━━━━━━━━━━").at(-1).trim()}`); return fim(true); }
    if (r.consumir) {
      const apagou = await q("delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1", [j.id, r.consumir]);
      if (!apagou.length) await q("update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2", [j.id, r.consumir]);
    }
    const e = r.estado;
    if (!r.fim) {
      await q("update jogo.batalhas set estado = $2, rodada = $3 where id = $1", [b.id, JSON.stringify(e), e.rodada]);
      await q("update jogo.jogadores set hp = $2, mp = $3 where id = $1", [j.id, e.jogador.hp, e.jogador.mp]);
      dizer(painel(e));
      return fim(true);
    }
    await finalizar(q, j, b, e, r.fim, dizer, iso);
    return fim(true);
  }

  async function finalizar(q, j, b, e, resultado, dizer, iso) {
    const v = VILOES.get(e.inimigo.id);
    const log = e.log.map((l) => `• ${l}`).join("\n");
    let res = { resultado };
    if (resultado === "vitoria") {
      const rec = recompensa(j, e.inimigo, rng);
      const depois = aplicarXP({ ...j, hp: e.jogador.hp, mp: e.jogador.mp }, rec.xp);
      const eventos = [...depois.eventos];
      if (rec.superior) {
        const k = atributoPrincipal(j.classe);
        depois.atributos[k] += 1;
        eventos.push({ atributo: k, delta: 1, fonte: "vitoria_superior", detalhe: { inimigo: v.id, nivel: e.inimigo.nivel } });
      }
      let material = null;
      if (rng() < 0.3) {
        material = MATERIAIS[REGIAO.get(j.regiao_atual)?.reino];
        if (material) await q(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, 'material', 1, $3)
          on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 1`, [j.id, material.id, JSON.stringify({ nome: material.nome })]);
      }
      await q(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8,
        pontos_livres = $9, rank = $10, ryo = ryo + $11, recuperacao_em = $12 where id = $1`,
      [j.id, depois.nivel, depois.xp, JSON.stringify(depois.atributos), depois.hp, depois.hp_max, depois.mp, depois.mp_max,
        depois.pontos_livres, depois.rank, rec.ryo, iso]);
      for (const ev of eventos) await q(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, $4, $5)`,
        [j.id, ev.atributo, ev.delta, ev.fonte, JSON.stringify(ev.detalhe ?? {})]);
      res = { ...res, xp: rec.xp, ryo: rec.ryo, niveis: depois.niveis, material: material?.id ?? null };
      let texto = `${log}\n\n🏆 *VITÓRIA!*\n✨ +${rec.xp} XP · 💰 +${rec.ryo} ryō${material ? ` · 💎 ${material.nome}` : ""}`;
      if (rec.superior) texto += `\n🌟 Vencer alguém muito mais forte te deixou mais forte: *${atributoPrincipal(j.classe)} +1*!`;
      if (depois.niveis.length) {
        const cresc = Object.entries(CLASSES[j.classe]?.cresc ?? {}).filter(([, x]) => x).map(([k, x]) => `${k} +${x * depois.niveis.length}`).join(" · ");
        texto += `\n\n🎉 *Você subiu para o nível ${depois.nivel}!*\n${cresc}\n❤️ Vida ${depois.hp_max} · 🔷 MP ${depois.mp_max} (recuperados ao máximo)`;
        if (depois.rank !== j.rank) texto += `\n🎖️ Novo rank: *${depois.rank}*!`;
        if (depois.pontos_livres > j.pontos_livres) texto += `\n🎁 Você ganhou *${depois.pontos_livres - j.pontos_livres} pontos livres*. Use *distribuir* para escolher onde colocar.`;
      } else texto += `\n📈 XP: ${depois.xp}/${XP_PROXIMO(depois.nivel)} para o nível ${depois.nivel + 1}`;
      dizer(texto);
    } else if (resultado === "derrota") {
      const hp = Math.max(1, Math.round(j.hp_max * 0.1));
      const roubavel = !["besta", "espiritual", "morto-vivo"].includes(v?.arquetipo);
      const perda = roubavel ? Math.floor(Number(j.ryo) * 0.3) : 0;
      const atributo = ATRIBUTOS[Math.floor(rng() * ATRIBUTOS.length)];
      const efeitos = [...(j.efeitos ?? []).filter((x) => !(x.tipo === "ferida" && +new Date(x.ate) <= +iso)),
        { tipo: "ferida", atributo, ate: new Date(+iso + 86_400_000).toISOString() }];
      await q(`update jogo.jogadores set hp = $2, mp = $3, ryo = ryo - $4, efeitos = $5, recuperacao_em = $6 where id = $1`,
        [j.id, hp, e.jogador.mp, perda, JSON.stringify(efeitos), iso]);
      res = { ...res, perda, ferida: atributo };
      dizer(`${log}\n\n☠️ *DERROTA.*\n${roubavel ? `Enquanto você estava caído, levaram *${perda} ryō*.` : `${v?.nome ?? "A criatura"} te arrastou para longe e te largou ferido.`}\n` +
        `🩹 Você acorda com ${hp} de vida e uma *ferida*: ${atributo} −10% por 24 horas.\n` +
        `💡 Dica: descanse (a vida volta 20% por hora), use *defender* quando o inimigo preparar um golpe forte e mire no ponto fraco: *${v?.fraqueza ?? "?"}*.`);
    } else {
      await q("update jogo.jogadores set hp = $2, mp = $3, recuperacao_em = $4 where id = $1", [j.id, e.jogador.hp, e.jogador.mp, iso]);
      dizer(`${log}\n\n🏃 Você escapou. A vida e a mana voltam com o tempo.`);
    }
    await q("update jogo.batalhas set estado = $2, status = 'encerrada', resultado = $3 where id = $1", [b.id, JSON.stringify(e), JSON.stringify(res)]);
  }

  async function distribuir(q, j, t, dizer) {
    const pares = [...t.toUpperCase().matchAll(/\b(FOR|DEF|MAG|RES|VEL|SOR)\s*\+?(\d+)/g)].map((m) => [m[1], Number(m[2])]);
    if (!pares.length) {
      dizer(`🎁 Pontos livres: *${j.pontos_livres}*.\n${j.pontos_livres ? "Escolha onde colocar. Ex.: *distribuir FOR 2 VEL 1*\n" : "Você ganha 3 pontos a cada 10 níveis.\n"}` +
        `FOR força · DEF defesa · MAG magia · RES resistência · VEL velocidade · SOR sorte`);
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
    dizer(`✅ Pontos aplicados: ${pares.map(([k, n]) => `${k} +${n}`).join(" · ")}. Restam *${j.pontos_livres}*.`);
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

export { HABILIDADES };
