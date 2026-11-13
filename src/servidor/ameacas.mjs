// Lutas em grupo de vida compartilhada. Dois tipos:
//   calamidade — o mundo inteiro ataca, de onde estiver. Só aparece com a história já desenvolvida.
//   monstro    — o mestre coloca numa cidade; só quem está na região ataca. Enquanto vive, loja e descanso fecham.
// Nenhuma das duas mexe na campanha: dão ryō, mérito e XP. Ninguém morre aqui (a vida para em 1): o risco é ficar fora da luta.
import { REGIAO } from "../regras/exploracao.mjs";
import { MONSTROS, MONSTRO, dnaMonstro } from "../mundo/monstros.mjs";
import { renderizar } from "../avatar/index.mjs";
import { atributosEfetivos, rolar, bonusDado, aplicarXP, habilidadesDe, MAGIA, elementoBase } from "../regras/combate.mjs";
import { magiasDeBatalha } from "../regras/grimorios.mjs";
import { bonusEquip } from "../regras/itens.mjs";
import { K, XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { rodape } from "./textos.mjs";
import { um } from "./db.mjs";

export const AMEACA = {
  recargaMs: 5 * 60_000,          // intervalo entre golpes do mesmo jogador
  comboMs: 10 * 60_000,           // outro jogador bateu há pouco: +25% (lutar junto vale mais)
  combo: 1.25,
  vidaMinima: 0.2,                // abaixo disso o jogador precisa se curar antes de voltar
  duracaoMs: { calamidade: 48 * 3_600_000, monstro: 24 * 3_600_000 },
  golpesPorJogador: { 1: 5, 2: 8, 3: 12, 4: 12 },
  contra: { 1: 0.07, 2: 0.1, 3: 0.13, 4: 0.16 }, // fração da vida máxima que o contra-ataque tira num acerto firme
  falhaAte: { 1: 1, 2: 1, 3: 2, 4: 2 },
  capitulosParaCalamidade: 10,    // "história desenvolvida": capítulos já vividos no mundo
  limiares: [12, 24, 36, 48],     // a cada marca, uma Calamidade desperta sozinha
};
const barra = (v, max, n = 10) => { const c = Math.max(0, Math.min(n, Math.round((v / max) * n))); return "▰".repeat(c) + "▱".repeat(n - c); };
const imagem = (m) => renderizar(dnaMonstro(m), 6);
const nomeRegiao = (rid) => REGIAO.get(rid)?.nome ?? rid;

export function criarAmeacas({ db, rng, agora, relogio = null }) {
  const privado = (x) => x.wa_jid ?? x.wa_lid ?? null;
  const jogadoresDoMundo = (mundoId) => db.query(`select j.*, i.wa_jid, i.wa_lid from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id
    where j.mundo_id = $1 and j.estado = 'ativo'`, [mundoId]);
  const capitulosDoMundo = async (mundoId) => Number((await um(db, `select count(distinct p.chave) as n from jogo.progresso p join jogo.jogadores j on j.id = p.jogador_id
    where j.mundo_id = $1 and p.chave like 'c:%' and coalesce(p.valor->>'herdado', '') = ''`, [mundoId])).n);

  async function poder(j) {
    const inv = await db.query("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1", [j.id]);
    const at = atributosEfetivos(j, agora(), bonusEquip(inv));
    return { at, atk: Math.max(at.FOR ?? 0, at.MAG ?? 0) };
  }
  const defesaDe = (nivel, grau) => Math.round((5 + nivel * 1.2) * (0.8 + grau * 0.15));
  const danoDe = (atk, nivel, def, mult = 1) => Math.max(1, Math.round(((atk * 3 * K(nivel)) / (K(nivel) + def)) * mult));

  /** Ameaça ativa que este jogador pode atacar agora (monstro na região dele tem prioridade sobre a calamidade). */
  async function ativaPara(j) {
    const linhas = await db.query("select * from jogo.ameacas where mundo_id = $1 and estado = 'ativa' order by (tipo = 'monstro') desc, id", [j.mundo_id]);
    const vivas = [];
    for (const a of linhas) { if (+new Date(a.termina_em) <= agora()) await encerrarPorTempo(a); else vivas.push(a); }
    return { aqui: vivas.find((a) => a.tipo === "monstro" && a.regiao === j.regiao_atual) ?? vivas.find((a) => a.tipo === "calamidade") ?? null, outras: vivas };
  }

  /** Cria a ameaça e devolve o anúncio do grupo. tipo: 'calamidade' | 'monstro'. */
  async function invocar(mundoId, monstroId, tipo, regiao = null, extra = {}) {
    const m = MONSTRO.get(monstroId);
    const mundo = await um(db, "select * from jogo.mundos where id = $1", [mundoId]);
    const jogs = await jogadoresDoMundo(mundoId);
    if (!m || !mundo || !jogs.length) return { erro: "Não há jogadores neste mundo." };
    const nivel = Math.max(1, Math.round(jogs.reduce((s, j) => s + j.nivel, 0) / jogs.length));
    const def = defesaDe(nivel, m.grau);
    let soma = 0;
    for (const j of jogs) soma += danoDe((await poder(j)).atk, j.nivel, def);
    const media = soma / jogs.length;
    const lutadores = tipo === "calamidade" ? Math.max(2, jogs.length) : Math.max(1, Math.min(3, jogs.length));
    const hp = Math.round(media * AMEACA.golpesPorJogador[m.grau] * lutadores * (tipo === "calamidade" ? 1.5 : 1));
    const termina = agora() + AMEACA.duracaoMs[tipo];
    const a = await um(db, `insert into jogo.ameacas (mundo_id, tipo, monstro, regiao, nivel, hp, hp_max, dados, criada_em, termina_em)
      values ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9) returning *`, [mundoId, tipo, m.id, regiao, nivel, hp, JSON.stringify({ marcos: [], ...extra }), new Date(agora()), new Date(termina)]);
    if (relogio) await relogio.agendar(`ameaca:${a.id}`, termina + 2000, { tipo: "ameaca", ameaca: Number(a.id) });
    const horas = Math.round(AMEACA.duracaoMs[tipo] / 3_600_000);
    const legenda = tipo === "calamidade"
      ? `⚠️ *CALAMIDADE*\n\n${m.calamidade ?? "O mundo inteiro sente ao mesmo tempo."}\n\n*${m.nome}, ${m.titulo}*\n_${m.desc}_\n\nNenhum herói derruba isso sozinho. A vida dela é uma só para o mundo inteiro: cada golpe de cada um conta.\n${rodape("no privado: golpear", "juntos, os golpes valem mais", `${horas} horas até ela ir embora`)}`
      : `⚠️ *${m.nome}, ${m.titulo}* apareceu em *${nomeRegiao(regiao)}*.\n\n_${m.desc}_\n\nEnquanto estiver lá, as lojas ficam fechadas e ninguém dorme. Quem estiver na região pode enfrentar; quem não estiver, ainda dá tempo de chegar.\n${rodape("no privado, estando lá: golpear", "juntos, os golpes valem mais", `${horas} horas até ele ir embora`)}`;
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'ameaca', $3, $4)", [mundoId, jogs[0].id, tipo === "calamidade" ? `Calamidade: ${m.nome} despertou.` : `${m.nome} apareceu em ${nomeRegiao(regiao)}.`, new Date(agora())]);
    return { ameaca: a, saidas: [{ para: mundo.grupo_wa_id, imagem: imagem(m), legenda }] };
  }

  async function encerrarPorTempo(a) {
    const r = await db.query("update jogo.ameacas set estado = 'foi_embora' where id = $1 and estado = 'ativa' returning id", [a.id]);
    if (!r.length) return [];
    const m = MONSTRO.get(a.monstro), mundo = await um(db, "select * from jogo.mundos where id = $1", [a.mundo_id]);
    const quem = await db.query("select jogador_id from jogo.ameaca_golpes where ameaca_id = $1", [a.id]);
    if (quem.length) await db.query("update jogo.jogadores set merito = merito + 5 where id = any($1)", [quem.map((x) => x.jogador_id)]);
    if (a.tipo === "calamidade") await db.query("update jogo.mundos set relogio_eclipse = least(100, relogio_eclipse + 5) where id = $1", [a.mundo_id]);
    const pct = Math.round((a.hp / a.hp_max) * 100);
    return [{ para: mundo.grupo_wa_id, texto: a.tipo === "calamidade"
      ? `*${m.nome}* se cansa de Yotsuhoshi e vai embora, ferida mas viva (${pct}% da vida). O céu fica um pouco mais escuro do que antes.\n${rodape("quem lutou recebe +5 de mérito", "o Eclipse avança")}`
      : `*${m.nome}* deixa ${nomeRegiao(a.regiao)} por conta própria, com ${pct}% da vida. As lojas reabrem, mas vai levar um tempo para consertar o estrago.\n${rodape("quem lutou recebe +5 de mérito")}` }];
  }

  async function darXP(j, xp) {
    const jog = await um(db, "select * from jogo.jogadores where id = $1", [j.id]);
    const d = aplicarXP(jog, xp);
    await db.query(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8, pontos_livres = $9, rank = $10 where id = $1`,
      [j.id, d.nivel, d.xp, JSON.stringify(d.atributos), d.hp, d.hp_max, d.mp, d.mp_max, d.pontos_livres, d.rank]);
    for (const ev of d.eventos) await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, 'marco_historia', '{}')`, [j.id, ev.atributo, ev.delta]);
    return d;
  }

  async function vitoria(a, m, mundo) {
    const golpes = await db.query(`select g.*, j.nome, j.nivel, i.wa_jid, i.wa_lid from jogo.ameaca_golpes g join jogo.jogadores j on j.id = g.jogador_id
      join jogo.identidades i on i.id = j.identidade_id where g.ameaca_id = $1 order by g.dano desc`, [a.id]);
    const saidas = [];
    for (const g of golpes) {
      const cal = a.tipo === "calamidade";
      const ryo = cal ? 150 + g.nivel * 30 : (40 + g.nivel * 10) * m.grau, merito = cal ? 25 : 5 * m.grau;
      const xp = Math.round(XP_PROXIMO(g.nivel) * (cal ? 0.3 : 0.06 * m.grau));
      await db.query("update jogo.jogadores set ryo = ryo + $2, merito = merito + $3 where id = $1", [g.jogador_id, ryo, merito]);
      const d = await darXP({ id: g.jogador_id }, xp);
      if (privado(g)) saidas.push({ para: privado(g), texto: `⭐ *${m.nome} caiu.*\n\nVocê estava lá. ${g === golpes[0] ? "E ninguém bateu mais forte que você." : "E cada golpe seu contou."}\n${rodape(`+${ryo} ryō`, `+${merito} de mérito`, `+${xp} XP`, d.niveis.length ? `nível ${d.nivel}` : null)}` });
    }
    const placar = golpes.slice(0, 5).map((g, i) => `*${i + 1}.* ${g.nome} — ${Math.round((g.dano / a.hp_max) * 100)}% do dano em ${g.golpes} golpe${g.golpes > 1 ? "s" : ""}`).join("\n");
    const texto = a.tipo === "calamidade"
      ? `⭐⭐ *A CALAMIDADE CAIU*\n\n*${m.nome}, ${m.titulo}*, não existe mais. Não foi um herói: foram ${golpes.length}.\n\n${placar}\n\n_O céu de Yotsuhoshi clareia um pouco._`
      : `⭐ *${nomeRegiao(a.regiao)} está livre.*\n\n*${m.nome}* caiu. As lojas reabrem, e esta noite a cidade dorme.\n\n${placar}`;
    if (a.tipo === "calamidade") await db.query("update jogo.mundos set relogio_eclipse = greatest(0, relogio_eclipse - 5) where id = $1", [a.mundo_id]);
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'ameaca', $3, $4)", [a.mundo_id, golpes[0].jogador_id, `${m.nome} foi derrotado por ${golpes.map((g) => g.nome).join(", ")}.`.slice(0, 400), new Date(agora())]);
    saidas.unshift({ para: mundo.grupo_wa_id, texto });
    return saidas;
  }

  function painel(a, m, j) {
    const resta = Math.max(0, +new Date(a.termina_em) - agora()), h = Math.floor(resta / 3_600_000), min = Math.floor((resta % 3_600_000) / 60_000);
    return `*${m.nome}, ${m.titulo}*${a.tipo === "monstro" ? ` — em ${nomeRegiao(a.regiao)}` : " — Calamidade"}\n${barra(a.hp, a.hp_max)} ${Math.round((a.hp / a.hp_max) * 100)}%\n` +
      rodape(a.tipo === "monstro" && a.regiao !== j.regiao_atual ? `vá até ${nomeRegiao(a.regiao)} para lutar` : "golpear", `vai embora em ${h}h${String(min).padStart(2, "0")}`);
  }

  /** Menu do que o jogador pode fazer contra a ameaça: o mesmo das batalhas (ataque, magia, habilidades da classe, magias de grimório aberto). */
  async function opcoes(j) {
    const itens = [], add = (rotulo, x, detalhe = null, bloqueio = null) => itens.push({ n: itens.length + 1, rotulo, x, detalhe, bloqueio });
    const temMana = j.mp_max > 0, custo = (h) => (temMana ? h.mp ?? 0 : 0);
    add("Atacar", { nome: "um golpe direto", tipo: "fisico", poder: 1, mp: 0 });
    if (temMana) add(`Magia de ${elementoBase(j.atributo_magico) ?? "mana"}`, { nome: "magia", tipo: "magico", poder: MAGIA.poder, mp: MAGIA.mp }, `${MAGIA.mp} de mana`, j.mp < MAGIA.mp ? "sem mana" : null);
    const abertos = (await db.query("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and equipado order by grimorio_id", [j.id])).map((x) => x.grimorio_id);
    for (const h of [...habilidadesDe(j.classe, j.nivel), ...magiasDeBatalha(abertos)])
      add(h.nome, { ...h, mp: custo(h) }, [h.resumo, custo(h) ? `${custo(h)} de mana` : null].filter(Boolean).join(" · "), j.mp < custo(h) ? "sem mana" : null);
    return itens;
  }
  const textoOpcoes = (ops) => ops.map((o) => `*${o.n}* ${o.rotulo}${o.bloqueio ? ` _(${o.bloqueio})_` : o.detalhe ? ` — _${o.detalhe}_` : ""}`).join("\n");

  async function golpear(j, para, escolha = null) {
    const { aqui, outras } = await ativaPara(j);
    if (!aqui) {
      const longe = outras.find((a) => a.tipo === "monstro");
      return [{ para, texto: longe ? `Não há nada para enfrentar aqui. Mas ${MONSTRO.get(longe.monstro).nome} está em *${nomeRegiao(longe.regiao)}*: chegue lá e use *golpear*.` : "Não há nenhuma ameaça solta no mundo agora." }];
    }
    const a = aqui, m = MONSTRO.get(a.monstro);
    const pacto = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'pacto-ameaca'", [j.id]))?.valor;
    if (Number(pacto?.id) === Number(a.id)) return [{ para, texto: `Você ergue a arma, e o braço não obedece. *${m.nome}* te olha de longe, sem pressa. Vocês têm um pacto.\n${rodape("purificar num templo desfaz o pacto")}` }];
    if (j.hp <= j.hp_max * AMEACA.vidaMinima) return [{ para, texto: `Você mal fica em pé. Enfrentar *${m.nome}* assim é só entregar a vida.\n${rodape("use uma poção ou descanse e volte", a.tipo === "monstro" ? "nesta cidade ninguém dorme: descanse em outra" : null)}` }];
    const meu = await um(db, "select * from jogo.ameaca_golpes where ameaca_id = $1 and jogador_id = $2", [a.id, j.id]);
    const espera = meu ? AMEACA.recargaMs - (agora() - +new Date(meu.ultimo_em)) : 0;
    if (espera > 0) return [{ para, texto: `Você ainda está recuperando o fôlego do último golpe.\n${rodape(`volte em ${Math.ceil(espera / 60_000)} min`)}\n\n${painel(a, m, j)}` }];
    const ops = await opcoes(j);
    const vez = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'ameaca-vez'", [j.id]))?.valor;
    if (escolha == null) {
      // primeiro o menu, como em qualquer batalha; a resposta com o número executa
      await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'ameaca-vez', $2, $3) on conflict (jogador_id, chave) do update set valor = excluded.valor`,
        [j.id, JSON.stringify({ id: Number(a.id), em: agora(), foco: Boolean(vez?.foco && Number(vez.id) === Number(a.id)) }), new Date(agora())]);
      return [{ para, texto: `${painel(a, m, j)}\nVocê ${barra(j.hp, j.hp_max)} ${j.hp}/${j.hp_max}${j.mp_max ? ` · mana ${j.mp}` : ""}\n\n${textoOpcoes(ops)}\n\n${rodape("responda com o número", "o dado é o mesmo das batalhas", `um golpe a cada ${AMEACA.recargaMs / 60_000} min`)}` }];
    }
    const op = ops[Number(escolha) - 1];
    if (!op) return [{ para, texto: `Escolha um número de 1 a ${ops.length}.\n\n${textoOpcoes(ops)}` }];
    if (op.bloqueio) return [{ para, texto: `${op.rotulo}: ${op.bloqueio}.\n\n${textoOpcoes(ops)}` }];
    const x = op.x, focado = Boolean(vez?.foco && Number(vez.id) === Number(a.id));
    const { at, atk: melhor } = await poder(j);
    const ehDano = ["fisico", "magico", "melhor"].includes(x.tipo);
    const atk = x.tipo === "fisico" ? at.FOR ?? 0 : x.tipo === "magico" ? at.MAG ?? 0 : melhor;
    const junto = await um(db, "select 1 from jogo.ameaca_golpes where ameaca_id = $1 and jogador_id <> $2 and ultimo_em > $3 limit 1", [a.id, j.id, new Date(agora() - AMEACA.comboMs)]);
    const d = rolar(rng, bonusDado(at) - (m.grau >= 3 ? 1 : 0) + (x.dado ?? 0), AMEACA.falhaAte[m.grau]);
    // habilidades valem como nas batalhas: força, vários golpes, atravessar defesa, dano contínuo (já somado), foco do turno anterior
    const multHab = ehDano ? (x.poder ?? 1) * (x.golpes ?? 1) * (x.queima ? 1.3 : 1) * (focado ? 1.5 : 1) : 0;
    const dano = ehDano && d.mult ? Math.min(a.hp, danoDe(atk, j.nivel, defesaDe(a.nivel, m.grau) * (1 - (x.ignoraDef ?? 0)), d.mult * multHab * (junto ? AMEACA.combo : 1))) : 0;
    // o que a habilidade faz por você neste turno: cura, proteção, enfraquecer ou prender o monstro
    const forca = d.faixa === "falha" ? 0.5 : d.faixa === "critico" ? 1.3 : 1;
    const curou = Math.min(j.hp_max - j.hp, Math.round((x.tipo === "cura" ? j.hp_max * (x.cura ?? 0) * forca : 0) + (x.curaFixa && dano ? j.hp_max * x.curaFixa : 0) + (x.rouba && dano ? Math.min(j.hp_max * 0.3, dano * x.rouba) : 0)));
    const custoVida = x.custoHp ? Math.round(j.hp_max * x.custoHp) : 0;
    const protecao = !ehDano || x.protecao ? Math.min(0.85, (x.protecao ?? 0) * (ehDano ? 1 : forca)) : 0;
    const preso = Boolean(dano && x.prende), fraco = Boolean((dano && x.enfraquece) || x.enfraqueceAlvo);
    j = { ...j, hp: Math.max(1, j.hp + curou - custoVida), mp: Math.max(0, j.mp - (x.mp ?? 0)) };
    // contra-ataque: o monstro também rola; a vida do jogador nunca passa de 1 para baixo
    const c = rolar(rng, 0);
    const def = Math.max(at.DEF ?? 0, at.RES ?? 0);
    const leva = c.faixa === "falha" || preso ? 0 : Math.min(j.hp - 1, Math.round(j.hp_max * AMEACA.contra[m.grau] * { fraco: 0.6, normal: 1, forte: 1.4, critico: 2 }[c.faixa] * (1 - protecao) * (fraco ? 0.75 : 1) * (K(j.nivel) / (K(j.nivel) + def * 0.5))));
    const depois = await um(db, "update jogo.ameacas set hp = greatest(0, hp - $2) where id = $1 and estado = 'ativa' returning *", [a.id, dano]);
    if (!depois) return [{ para, texto: `Quando você chega, *${m.nome}* já não está mais lá.` }];
    await db.query(`insert into jogo.ameaca_golpes (ameaca_id, jogador_id, dano, golpes, ultimo_em) values ($1, $2, $3, 1, $4)
      on conflict (ameaca_id, jogador_id) do update set dano = jogo.ameaca_golpes.dano + excluded.dano, golpes = jogo.ameaca_golpes.golpes + 1, ultimo_em = excluded.ultimo_em`, [a.id, j.id, dano, new Date(agora())]);
    // recuperacao_em marca de quando a vida começa a voltar: sem atualizar aqui, a próxima mensagem "curava" tudo de uma vez
    await db.query("update jogo.jogadores set hp = greatest(1, $2::int - $3::int), mp = $4, recuperacao_em = $5 where id = $1", [j.id, j.hp, leva, j.mp, new Date(agora())]);
    // foco ("próximo golpe +50%") fica guardado para a próxima ação; usado, some
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'ameaca-vez', $2, $3) on conflict (jogador_id, chave) do update set valor = excluded.valor`,
      [j.id, JSON.stringify({ id: Number(a.id), em: 0, foco: Boolean(x.foco) || (focado && !ehDano) }), new Date(agora())]);
    const dadoTxt = `🎲 *${d.nat}*${d.total !== d.nat && d.nat !== 1 && d.nat !== 20 ? ` ${d.total > d.nat ? "+" : "−"}${Math.abs(d.total - d.nat)} = ${d.total}` : ""} · ${d.texto}${d.mult && d.mult !== 1 ? ` ×${String(d.mult).replace(".", ",")}` : ""}`;
    const efeitos = [curou > 0 && `+${curou} de vida`, custoVida > 0 && `−${custoVida} de vida pelo custo`, protecao > 0 && `protegido em ${Math.round(protecao * 100)}%`, x.foco && "próximo golpe +50%",
      preso && `${m.nome} fica preso e não revida`, fraco && !preso && `${m.nome} enfraquecido`, junto && dano > 0 && "ao lado de um companheiro: +25%", focado && ehDano && "concentrado: +50%"].filter(Boolean);
    const linhas = [
      ehDano ? `${dadoTxt}. ${d.faixa === "falha" ? `${op.rotulo} passa no vazio. ${m.nome} nem olha.` : `Você acerta *${m.nome}* com ${x.nome.startsWith("um ") || x.nome === "magia" ? x.nome : `*${x.nome}*`}. _(${dano} de dano)_`}`
        : `${dadoTxt}. Você usa *${x.nome}*.`,
      efeitos.length ? `_${efeitos.join(" · ")}_` : null,
      preso ? null : `🎲 ${c.nat} · ${leva > 0 ? `${m.nome} revida${c.faixa === "critico" ? " em cheio" : ""}. _(−${leva} de vida)_` : `${m.nome} revida, e você sai do caminho a tempo.`}`,
    ].filter(Boolean);
    const mundo = await um(db, "select * from jogo.mundos where id = $1", [a.mundo_id]);
    if (depois.hp <= 0) {
      const fim = await db.query("update jogo.ameacas set estado = 'derrotada' where id = $1 and estado = 'ativa' returning id", [a.id]);
      return [{ para, texto: `${linhas[0]}\n\nÉ o último golpe. *${m.nome}* desaba.` }, ...(fim.length ? await vitoria(depois, m, mundo) : [])];
    }
    const saidas = [{ para, texto: `${linhas.join("\n")}\n\n${m.nome} ${barra(depois.hp, depois.hp_max)} ${Math.round((depois.hp / depois.hp_max) * 100)}%\nVocê ${barra(j.hp - leva, j.hp_max)} ${j.hp - leva}/${j.hp_max}${j.mp_max ? ` · mana ${j.mp}` : ""}\n${rodape(junto ? "lutando junto: +25%" : "se outro jogador bater nos próximos 10 min, vale +25%", `próximo golpe em ${AMEACA.recargaMs / 60_000} min`)}` }];
    // o grupo acompanha pelos marcos (75%, 50%, 25%), não a cada golpe
    const marcos = depois.dados?.marcos ?? [], pct = (depois.hp / depois.hp_max) * 100;
    const novo = [75, 50, 25].find((x) => pct <= x && !marcos.includes(x));
    if (novo) {
      await db.query("update jogo.ameacas set dados = $2 where id = $1", [a.id, JSON.stringify({ ...depois.dados, marcos: [...marcos, ...[75, 50, 25].filter((x) => pct <= x && !marcos.includes(x))] })]);
      const n = Number((await um(db, "select count(*) as n from jogo.ameaca_golpes where ameaca_id = $1", [a.id])).n);
      saidas.push({ para: mundo.grupo_wa_id, texto: `*${m.nome}* ${barra(depois.hp, depois.hp_max)} ${Math.round(pct)}%\n_${j.nome} acaba de acertar${novo === 25 ? ". Falta pouco" : novo === 50 ? ". Metade do caminho" : ""}. ${n} ${n === 1 ? "pessoa lutando" : "pessoas lutando"}._` });
    }
    return saidas;
  }

  async function comando(j, t, para) {
    let mg;
    if ((mg = t.match(/^(?:golpear|golpe|atacar monstro|atacar calamidade|atacar a calamidade|atacar o monstro|enfrentar monstro|enfrentar calamidade|enfrentar a calamidade|enfrentar o monstro)(?:\s+(\d{1,2}))?$/)))
      return { tratado: true, saidas: await golpear(j, para, mg[1] ?? null) };
    if (/^\d{1,2}$/.test(t)) {
      // número solto só vale se o menu da ameaça foi aberto há pouco e o jogador não está numa batalha comum
      const vez = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'ameaca-vez'", [j.id]))?.valor;
      if (vez && agora() - Number(vez.em) < 10 * 60_000 && !(await db.query("select 1 from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id where p.jogador_id = $1 and b.status <> 'encerrada' limit 1", [j.id])).length
        && !(await db.query("select 1 from jogo.exploracoes where jogador_id = $1 and pendente limit 1", [j.id])).length) return { tratado: true, saidas: await golpear(j, para, t) };
    }
    if (/^(calamidade|ameaca|ameacas|monstro|monstros)$/.test(t)) {
      const { outras } = await ativaPara(j);
      if (!outras.length) return { tratado: true, saidas: [{ para, texto: "Não há nenhuma ameaça solta no mundo agora." }] };
      const a = outras.find((x) => x.tipo === "monstro" && x.regiao === j.regiao_atual) ?? outras[0], m = MONSTRO.get(a.monstro);
      return { tratado: true, saidas: [{ para, imagem: imagem(m), legenda: `${painel(a, m, j)}\n\n_${m.desc}_${outras.length > 1 ? `\n\n_Há mais ${outras.length - 1} ameaça${outras.length > 2 ? "s" : ""} no mundo._` : ""}` }] };
    }
    return { tratado: false, saidas: [] };
  }

  /** Loja e descanso fecham na cidade onde há um monstro vivo. Devolve o texto do bloqueio ou null. */
  async function cidadeFechada(j, t) {
    if (!/^(loja|comprar|mercado|vender|descansar|dormir|estalagem|pousada)\b/.test(t)) return null;
    const a = await um(db, "select * from jogo.ameacas where mundo_id = $1 and estado = 'ativa' and tipo = 'monstro' and regiao = $2 and termina_em > $3 limit 1", [j.mundo_id, j.regiao_atual, new Date(agora())]);
    if (!a) return null;
    const m = MONSTRO.get(a.monstro);
    return `Portas trancadas, janelas pregadas. Enquanto *${m.nome}* estiver em ${nomeRegiao(a.regiao)}, ninguém abre loja nem aluga cama.\n${rodape("golpear para enfrentar", "monstro mostra a situação")}`;
  }

  /** Depois de um capítulo: se a história do mundo cruzou uma marca, uma Calamidade desperta. */
  async function aoConcluir(j) {
    const n = await capitulosDoMundo(j.mundo_id);
    const limiar = AMEACA.limiares.filter((x) => n >= x).at(-1);
    if (!limiar) return [];
    const ja = await db.query("select id, estado, dados from jogo.ameacas where mundo_id = $1 and tipo = 'calamidade'", [j.mundo_id]);
    if (ja.some((a) => a.estado === "ativa" || Number(a.dados?.limiar) === limiar)) return [];
    const grandes = MONSTROS.filter((m) => m.grau === 4);
    const r = await invocar(j.mundo_id, grandes[AMEACA.limiares.indexOf(limiar) % grandes.length].id, "calamidade", null, { limiar });
    return r.saidas ?? [];
  }

  /** Para o narrador: há uma ameaça que este jogador pode enfrentar agora? (monstro na região dele ou Calamidade) */
  async function cenaPara(j) {
    const { aqui } = await ativaPara(j);
    if (!aqui) return null;
    // A Calamidade vale para o mundo inteiro e dura dias: só vira "a cena" de quem está lutando agora (golpeou há pouco)
    if (aqui.tipo === "calamidade" && !(await db.query("select 1 from jogo.ameaca_golpes where ameaca_id = $1 and jogador_id = $2 and ultimo_em > $3", [aqui.id, j.id, new Date(agora() - 15 * 60_000)])).length) return null;
    const m = MONSTRO.get(aqui.monstro);
    return { id: Number(aqui.id), tipo: aqui.tipo, nome: `${m.nome}, ${m.titulo}`, descricao: m.desc, vida: `${Math.round((aqui.hp / aqui.hp_max) * 100)}%`, onde: aqui.regiao ? nomeRegiao(aqui.regiao) : "o mundo inteiro" };
  }

  /** Alguém fez um pacto com a ameaça: ela recupera fôlego, e o grupo fica sabendo que houve um pacto (não de quem). */
  async function aoPacto(j, id) {
    const a = await um(db, "update jogo.ameacas set hp = least(hp_max, hp + round(hp_max * 0.08)) where id = $1 and estado = 'ativa' returning *", [id]);
    if (!a) return [];
    const m = MONSTRO.get(a.monstro), mundo = await um(db, "select grupo_wa_id from jogo.mundos where id = $1", [a.mundo_id]);
    return mundo?.grupo_wa_id ? [{ para: mundo.grupo_wa_id, texto: `_${m.nome} ergue a cabeça, como quem recebeu uma boa notícia. As feridas mais recentes se fecham._\n\nAlguém entre vocês fez um pacto com ela.\n${rodape(`${m.nome}: ${Math.round((a.hp / a.hp_max) * 100)}% de vida`)}` }] : [];
  }

  async function aoTick(id) {
    const a = await um(db, "select * from jogo.ameacas where id = $1 and estado = 'ativa'", [id]);
    return a && +new Date(a.termina_em) <= agora() ? encerrarPorTempo(a) : [];
  }

  return { comando, invocar, aoConcluir, aoTick, cidadeFechada, capitulosDoMundo, cenaPara, aoPacto };
}
