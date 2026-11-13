// Combate solo no privado + progressão. Começa de um encontro pendente (lacaio da exploração, vilão num covil,
// cena do narrador). Menu numerado + dado. Tudo numa transação com trava na linha do jogador e da batalha.
// Devolve também `eventos` (vilão derrotado, derrota, nível…) para o mundo vivo anunciar no grupo e avançar a história.
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { novoCombate, resolverRodada, painel, textoMenu, escolher, recompensa, aplicarXP, atributoPrincipal, HABILIDADES, CLASSES, KITS, proximaHabilidade, SISMICO, PASSIVAS, nivelDeLuta, multAlcance, REVIGORAR } from "../regras/combate.mjs";
import { REGIAO, MATERIAIS } from "../regras/exploracao.mjs";
import { COVIL } from "../mundo/mundo.mjs";
import { FERAS, NIVEL_ESTAGIO, somarBonus, chaveDespertar, BONUS_ESTAGIO, atributosDaForma } from "../regras/fera.mjs";
import { despertarDe } from "./fera.mjs";
import { magiasDeBatalha, GRIMORIOS, podeLer, maxGrimorios } from "../regras/grimorios.mjs";
import { bonusEquip, item as itemDe, todosItens, EQUIP_CLASSE, habilidadesDosItens, HABILIDADE_ITEM } from "../regras/itens.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { renderizar } from "../avatar/index.mjs";
import { DNA_VILOES, DNA_MASCARA } from "../avatar/dna.mjs";
import { rodape } from "./textos.mjs";

const VILOES = new Map(JSON.parse(readFileSync(new URL("../../data/viloes.json", import.meta.url), "utf8")).map((v) => [v.id, v]));
const REINO_DA_REGIAO = new Map([...REGIAO.values()].map((r) => [r.nome, r.reino]));
export const RECUPERACAO_POR_HORA = 0.2; // fora de combate: 20% da vida e da mana por hora
const ATRIBUTOS = ["FOR", "DEF", "MAG", "RES", "VEL", "SOR"];

/** Luta em conjunto contra vilão de covil: quem pode, quanto de vida o vilão ganha por jogador a mais, e por quanto tempo a luta fica aberta. */
export const LUTA_GRUPO = { tiers: ["medio", "alto", "rei", "divindade"], vidaPorMembro: 0.85, validadeMs: 2 * 3_600_000 };
const parteDoGrupo = (i) => { const { nivel, por, ...resto } = i; return resto; };
const CACHE_VILAO = new Map();
export function imagemVilao(v, escala = 6) {
  const dna = DNA_MASCARA[v.id] ?? DNA_VILOES[v.id];
  if (!dna) return null;
  const chave = `${v.id}:${escala}`;
  if (!CACHE_VILAO.has(chave)) { if (CACHE_VILAO.size >= 60) CACHE_VILAO.delete(CACHE_VILAO.keys().next().value); CACHE_VILAO.set(chave, desenharVilao(v, dna, escala)); }
  return CACHE_VILAO.get(chave);
}
function desenharVilao(v, dna, escala) {
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
      if (/^(habilidades|tecnicas|golpes|skills)$/.test(t)) {
        const terra = (await q("select 1 from jogo.progresso where jogador_id = $1 and chave = 'b:olhos-da-terra'", [j.id])).length > 0;
        const abertos = (await q("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and equipado order by grimorio_id", [j.id])).map((x) => x.grimorio_id);
        const fechados = (await q("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and not equipado order by grimorio_id", [j.id])).map((x) => x.grimorio_id);
        const invH = await q("select item_id, equipado from jogo.inventario where jogador_id = $1", [j.id]);
        const petH = (await q("select nome from jogo.pets where jogador_id = $1", [j.id]))[0] ?? null;
        const feraH = chaveDespertar(j) ? (await despertarDe(q, j)).estagio : null;
        dizer(textoHabilidades(j, terra, { abertos, fechados, inv: invH, pet: petH, fera: feraH })); return fim(true);
      }
      const querEntrar = /^(entrar na luta|entro na luta|lutar junto|ajudar na luta|entrar na batalha)$/.test(t);
      if (!querEntrar && !/^(lutar|enfrentar|luto|lutar!|atacar|a|aceito lutar|bora|1)$/.test(t)) return fim(false);
      let pend = (await q("select * from jogo.exploracoes where jogador_id = $1 and pendente and tipo = 'encontro' for update", [j.id]))[0];
      if (querEntrar || (!pend && /^(lutar|enfrentar|luto)$/.test(t))) {
        // um companheiro de história já está lutando contra um vilão daqui? então o encontro é esse
        const g = await grupoDeViagem(q, j);
        const luta = (await q("select * from jogo.lutas_grupo where mundo_id = $1 and estado = 'ativa' and criada_em > $2 and chave like $3 order by criada_em desc limit 1",
          [j.mundo_id, new Date(tempo - LUTA_GRUPO.validadeMs), `${j.mundo_id}:%:${g.lider}`]))[0];
        if (luta && !luta.membros.includes(Number(j.id)) && COVIL.get(luta.vilao)?.regiao === j.regiao_atual) {
          if (pend) await q("update jogo.exploracoes set pendente = false, resolvida_em = $2 where id = $1", [pend.id, iso]);
          const vv = VILOES.get(luta.vilao);
          pend = (await q(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em) values ($1, $2, $3, 'encontro', $4, true, $5) returning *`,
            [j.id, `grupo:${j.id}:${tempo}`, j.regiao_atual, JSON.stringify({ inimigo: { id: vv.id, nome: vv.nome, nivel: vv.nivel }, fixo: true, eco: false, local: COVIL.get(vv.id).local }), iso]))[0];
        } else if (querEntrar) { dizer(luta ? "Você já está nessa luta, ou ela acontece em outra região." : "Nenhum companheiro seu está em luta agora. Para lutar junto, primeiro *acompanhar <nome>* na mesma história."); return fim(true); }
      }
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
      // magias dos grimórios abertos entram no menu da luta
      // e também a habilidade de cada Grande Item equipado. Nada disso tira as habilidades da classe: é acréscimo.
      const desp = await despertarDe(q, j);
      const magias = [...desp.habs, ...magiasDeBatalha((await q("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and equipado order by grimorio_id", [j.id])).map((x) => x.grimorio_id)), ...habilidadesDosItens(inv)];
      const vd = pend.dados.lacaio ? { ...v, nome: nomeLacaio(v), tier: "comum" } : v;
      // Vilão de covil nunca luta mais que alguns níveis acima do jogador (a história não trava por falta de nível)
      const nivelLuta = pend.dados.fixo ? nivelDeLuta(pend.dados.inimigo.nivel, j.nivel) : pend.dados.inimigo.nivel;
      const estado = novoCombate(j, vd, nivelLuta, { agora: tempo, equip: somarBonus(bonusEquip(inv), desp.bonus), eco: Boolean(pend.dados.eco),
        itens: Object.fromEntries(inv.map((i) => [i.item_id, i.qtd])), bonusDano: bonusCampanha(chaves) * (juramento ? 1.15 : 1) * (1 + 0.1 * apoio), pet, sismico: chaves.includes("b:olhos-da-terra"), lacaio: Boolean(pend.dados.lacaio), magias });
      estado.contexto = { lacaio: Boolean(pend.dados.lacaio), fixo: Boolean(pend.dados.fixo), eco: Boolean(pend.dados.eco), vilao: v.id, juramento, nivelReal: pend.dados.inimigo.nivel };
      // Vilão de médio escalão para cima pode ser enfrentado junto por quem está acompanhando a mesma história
      let conjunto = "";
      if (pend.dados.fixo && LUTA_GRUPO.tiers.includes(v.tier)) {
        const g = await grupoDeViagem(q, j), chave = chaveGrupo(j, v, g.lider);
        const luta = await lutaAtiva(q, chave, tempo);
        if (luta) {
          // entra numa luta que um companheiro já começou: o vilão é o mesmo, com mais fôlego por ter mais um adversário
          const extra = Math.round(luta.hp_base * LUTA_GRUPO.vidaPorMembro), membros = [...new Set([...luta.membros, Number(j.id)])];
          const comum = luta.membros.includes(Number(j.id)) ? luta.inimigo : { ...luta.inimigo, hp: luta.inimigo.hp + extra, hpMax: luta.inimigo.hpMax + extra };
          Object.assign(estado.inimigo, parteDoGrupo(comum));
          await q("update jogo.lutas_grupo set inimigo = $2, membros = $3, atualizada_em = $4 where chave = $1", [chave, JSON.stringify({ ...comum, nivel: estado.inimigo.nivel }), JSON.stringify(membros), iso]);
          estado.contexto.grupo = chave;
          conjunto = `Você entra na luta ao lado de ${g.outros.filter((x) => luta.membros.includes(Number(x.id))).map((x) => `*${x.nome}*`).join(" e ") || "seus companheiros"}. O vilão é um só para todos: cada golpe de cada um conta.\n\n`;
          for (const x of g.outros) if (luta.membros.includes(Number(x.id)) && (x.wa_jid ?? x.wa_lid)) saidas.push({ para: x.wa_jid ?? x.wa_lid, texto: `*${j.nome}* entrou na luta ao seu lado. ${v.nome} ganha fôlego para enfrentar mais um.\n${rodape(`${v.nome}: ${comum.hp}/${comum.hpMax}`)}` });
        } else if (g.outros.length) {
          // abre a luta para o grupo: quem acompanha é avisado e entra se quiser (não é obrigatório)
          await q("delete from jogo.lutas_grupo where chave = $1", [chave]);
          await q(`insert into jogo.lutas_grupo (chave, mundo_id, vilao, inimigo, hp_base, membros, criada_em, atualizada_em) values ($1, $2, $3, $4, $5, $6, $7, $7)`,
            [chave, j.mundo_id, v.id, JSON.stringify({ ...parteComum(estado.inimigo), nivel: estado.inimigo.nivel }), estado.inimigo.hpMax, JSON.stringify([Number(j.id)]), iso]);
          estado.contexto.grupo = chave;
          for (const x of g.outros) if (x.wa_jid ?? x.wa_lid) saidas.push({ para: x.wa_jid ?? x.wa_lid, texto: `⚔️ *${j.nome}* começou a luta contra *${v.nome_completo}*.\n\nVocê está nessa história junto. Se quiser lutar ao lado ${j.avatar_dna?.feminino ? "dela" : "dele"}, digite *entrar na luta*: o vilão é um só para todos, e cada golpe conta.\n${rodape("não é obrigatório", "a batalha é igual às outras: menu numerado e dado")}` });
          conjunto = `Seus companheiros foram avisados e podem entrar na luta (*entrar na luta*). Se ninguém vier, é com você.\n\n`;
        }
      }
      const nb = (await q(`insert into jogo.batalhas (mundo_id, tipo, canal_wa_id, rodada, status, estado)
        values ($1, 'solo', $2, 1, 'aguardando', $3) returning id`, [j.mundo_id, para, JSON.stringify(estado)]))[0];
      await q("insert into jogo.participantes_batalha (batalha_id, jogador_id) values ($1, $2)", [nb.id, j.id]);
      await q("update jogo.exploracoes set pendente = false, resolvida_em = $2, dados = dados || $3 where id = $1",
        [pend.id, iso, JSON.stringify({ escolha: "lutar", batalha_id: nb.id })]);
      dizer(`${conjunto}${juramento ? "Você lembra do seu juramento. As mãos param de tremer.\n\n" : ""}${apoio ? `Você sente a força de ${apoio === 1 ? "um companheiro" : `${apoio} companheiros`} com você.\n\n` : ""}${painel(estado)}\n\n${rodape("responda com o número da ação", "o dado decide a força do golpe")}`);
      return fim(true);
    }

    if (!b.estado?.inimigo) return fim(false);
    // Em batalha
    // luta em conjunto: o vilão vem da fonte compartilhada (o que os companheiros fizeram já está nele)
    const chaveG = b.estado.contexto?.grupo;
    const luta = chaveG ? (await q("select * from jogo.lutas_grupo where chave = $1 for update", [chaveG]))[0] : null;
    if (luta && luta.estado !== "encerrada") Object.assign(b.estado.inimigo, parteDoGrupo(luta.inimigo));
    if (luta?.estado === "vencida" || (luta && b.estado.inimigo.hp <= 0)) {
      // um companheiro deu o golpe final: a vitória é de todos que estavam na luta
      b.estado.inimigo.hp = 0; b.estado.log = [`${b.estado.inimigo.nome} já está no chão. O golpe final foi de ${luta.inimigo.por ?? "um companheiro"}.`];
      await finalizar(q, j, b, b.estado, "vitoria", dizer, iso, eventos);
      return fim(true);
    }
    if (/^(\?|opcoes|painel|batalha|menu)$/.test(t)) { dizer(painel(b.estado, { completo: true })); return fim(true); }
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
    if (luta && luta.estado === "ativa") {
      const venceu = r.fim === "vitoria";
      await q("update jogo.lutas_grupo set inimigo = $2, estado = $3, atualizada_em = $4 where chave = $1",
        [chaveG, JSON.stringify({ ...parteComum(e.inimigo), nivel: e.inimigo.nivel, ...(venceu && { por: j.nome }) }), venceu ? "vencida" : "ativa", iso]);
      const outros = luta.membros.filter((id) => Number(id) !== Number(j.id));
      if (outros.length) {
        const jids = await q("select x.id, x.nome, i.wa_jid, i.wa_lid from jogo.jogadores x join jogo.identidades i on i.id = x.identidade_id where x.id = any($1)", [outros]);
        const antes = b.estado.inimigo.hp / b.estado.inimigo.hpMax, agoraPct = Math.max(0, e.inimigo.hp) / e.inimigo.hpMax;
        const marco = [0.75, 0.5, 0.25].find((m) => antes > m && agoraPct <= m);
        for (const x of jids) { const pv = x.wa_jid ?? x.wa_lid; if (!pv) continue;
          if (venceu) saidas.push({ para: pv, texto: `⚔️ *${e.inimigo.nome} caiu!* O golpe final foi de *${j.nome}*.\n\nVocê lutou junto: a vitória também é sua. Digite *ok* para recolher a sua parte.` });
          else if (r.fim === "derrota") saidas.push({ para: pv, texto: `*${j.nome}* caiu diante de ${e.inimigo.nome}. A luta continua com quem ainda está de pé.\n${rodape(`${e.inimigo.nome}: ${Math.max(0, e.inimigo.hp)}/${e.inimigo.hpMax}`)}` });
          else if (marco) saidas.push({ para: pv, texto: `_${j.nome} acerta ${e.inimigo.nome}: ${Math.round(agoraPct * 100)}% de vida._` }); }
      }
    }
    if (!r.fim) {
      await q("update jogo.batalhas set estado = $2, rodada = $3 where id = $1", [b.id, JSON.stringify(e), e.rodada]);
      await q("update jogo.jogadores set hp = $2, mp = $3 where id = $1", [j.id, e.jogador.hp, e.jogador.mp]);
      dizer(painel(e));
      return fim(true);
    }
    await finalizar(q, j, b, e, r.fim, dizer, iso, eventos);
    return fim(true);
  }

  // ── luta em conjunto (médio escalão para cima) ──
  // Cada jogador tem a própria batalha e o próprio painel; o vilão é um só (jogo.lutas_grupo é a fonte da verdade).
  const COMPARTILHADO = ["hp", "hpMax", "postura", "atordoado", "vulneravel", "preso", "fraco", "queima", "queimaDano", "fase"];
  const parteComum = (i) => Object.fromEntries(COMPARTILHADO.map((k) => [k, i[k]]));
  /** O grupo de viagem do jogador nesta região: ele, o líder e quem acompanha o mesmo líder. */
  async function grupoDeViagem(q, j) {
    const meu = (await q("select valor from jogo.progresso where jogador_id = $1 and chave = 'acomp'", [j.id]))[0]?.valor;
    const lider = meu?.rid === j.regiao_atual ? Number(meu.lider) : Number(j.id);
    const outros = await q(`select x.id, x.nome, i.wa_jid, i.wa_lid from jogo.jogadores x join jogo.identidades i on i.id = x.identidade_id
      where x.mundo_id = $1 and x.estado = 'ativo' and x.id <> $2 and x.regiao_atual = $4 and (x.id = $3 or exists (select 1 from jogo.progresso p
        where p.jogador_id = x.id and p.chave = 'acomp' and (p.valor->>'lider')::bigint = $3 and p.valor->>'rid' = $4))`, [j.mundo_id, j.id, lider, j.regiao_atual]);
    return { lider, outros };
  }
  const chaveGrupo = (j, v, lider) => `${j.mundo_id}:${v.id}:${lider}`;
  const lutaAtiva = async (q, chave, tempo) => (await q("select * from jogo.lutas_grupo where chave = $1 and estado = 'ativa' and criada_em > $2 for update", [chave, new Date(tempo - LUTA_GRUPO.validadeMs)]))[0] ?? null;

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
      // XP pelo nível verdadeiro do vilão, e mais ainda para quem venceu algo acima do próprio nível
      const real = ctx.fixo ? Number(ctx.nivelReal ?? e.inimigo.nivel) : e.inimigo.nivel;
      const alcance = ctx.fixo ? (real / Math.max(1, e.inimigo.nivel)) * multAlcance(j.nivel, real) : 1;
      rec.xp = Math.round(rec.xp * multXP * alcance); rec.ryo = Math.round(rec.ryo * multXP);
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
export function textoHabilidades(j, terra = false, extra = null) {
  const kit = KITS[j.classe] ?? [];
  const linhas = kit.map((h) => j.nivel >= h.nivel
    ? `*${h.nome}* — ${h.resumo}${h.mp ? ` _(${h.mp} de mana)_` : ""}`
    : `_${h.nome} — aprende no nível ${h.nivel}_`);
  const prox = proximaHabilidade(j.classe, j.nivel);
  const pas = PASSIVAS[j.classe];
  if (pas) linhas.unshift(`*${pas.nome}* (sempre ativa) — ${pas.texto}`, "");
  if (j.classe === REVIGORAR.classe) linhas.push("", j.nivel >= REVIGORAR.nivel
    ? `*Sopro de Mana* (fora de luta: *revigorar*) — gasta 90% da sua mana e devolve ${REVIGORAR.vigor} de vigor a você e a todos os jogadores na mesma região`
    : `_Sopro de Mana — aprende no nível ${REVIGORAR.nivel}_`);
  if (terra) linhas.push("", "*Olhos da Terra*", ...SISMICO.map((h) => `*${h.nome}* — ${h.resumo}`), "_+2 no dado ao defender · −2 no dado contra espíritos e deuses (não tocam o chão)_");
  // O que veio de fora da classe: grimórios, Grandes Itens e companheiro. Sempre dizendo se está valendo agora ou não, e por quê.
  if (extra) {
    const custo = (h) => (j.mp_max > 0 && h.mp ? ` _(${h.mp} de mana)_` : "");
    const gr = [];
    for (const id of extra.abertos ?? []) { const g = GRIMORIOS.get(id); if (g) gr.push(`*${g.nome}* — _aberto: valendo nas suas lutas_`, ...g.magias.filter((m) => !m.utilitaria).map((m) => `   ${m.nome} — ${m.resumo}${custo(m)}`)); }
    for (const id of extra.fechados ?? []) { const g = GRIMORIOS.get(id); if (!g) continue; const motivo = podeLer(j, g);
      gr.push(motivo ? `_${g.nome} — não pode usar ainda: ${motivo.replace(/\.$/, "")}_` : `_${g.nome} — fechado: use *abrir grimorio ${g.id.toLowerCase()}* para ganhar ${g.magias.filter((m) => !m.utilitaria).map((m) => m.nome).join(", ")}_`); }
    if (gr.length) linhas.push("", `*De grimórios* (${(extra.abertos ?? []).length} de ${maxGrimorios(j.classe)} abertos)`, ...gr);
    const it = [];
    for (const l of extra.inv ?? []) { const h = HABILIDADE_ITEM[l.item_id]; if (!h) continue;
      it.push(l.equipado ? `*${h.nome}* (${itemDe(l.item_id).nome.split(",")[0]}) — ${h.resumo}${custo(h)}` : `_${h.nome} — você tem ${itemDe(l.item_id).nome.split(",")[0]}, mas não está equipado: equipe para usar_`); }
    if (it.length) linhas.push("", "*De Grandes Itens*", ...it);
    const chave = chaveDespertar(j);
    if (extra.fera != null && chave) {
      const f = FERAS[chave], nat = f.linhagem === "natureza", pct = (i) => `+${Math.round(BONUS_ESTAGIO[i] * 100)}% de ${atributosDaForma(chave).join(" e ")}`;
      linhas.push("", `*${nat ? "Do espírito que cresce em você" : "Da fera no seu sangue"}* (${f.ser}, ${extra.fera} de 3 despertares)`, ...f.estagios.map((e, i) => i < extra.fera ? `*${e.hab.nome}* (${e.nome}) — ${e.hab.resumo}${custo(e.hab)}` : `_${i === extra.fera ? `${e.nome}: desperta com uma ${nat ? "Semente do Primeiro Bosque" : "Relíquia do Sangue Antigo"} (nível ${NIVEL_ESTAGIO[i]}; dá ${pct(i)})` : "??? — ainda dormindo"}_`));
      if (extra.fera) linhas.push(`_atributos do despertar: ${pct(extra.fera - 1)} (já somado na ficha)_`);
    }
    if (extra.pet) linhas.push("", `*${extra.pet.nome}* (companheiro) — ataca junto com você em toda rodada`);
  }
  return `*Habilidades de ${j.classe}*\n\n${linhas.join("\n")}\n\n${rodape("além disso: atacar, defender" + (j.mp_max > 0 ? ", magia do seu elemento" : ""), prox ? `próxima no nível ${prox.nivel}` : "todas aprendidas")}`;
}

export { HABILIDADES };
