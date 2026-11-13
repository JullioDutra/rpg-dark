// Diário do jogador: tudo o que ELE já descobriu do mundo, na ordem em que um livro contaria:
// primeiro a apresentação do mundo (o que todo recém-chegado sabe), depois o que ele viu, ouviu e viveu.
//
// Regra de ouro: o diário nunca inventa nem adianta nada. `montarDiario` é uma função pura que recebe só o
// "conhecimento" do jogador (ids do que ele já conquistou) e transforma cada id no MESMO texto que o jogo já
// mostrou a ele. O que não está no conhecimento não tem como aparecer. O teste de vazamento
// (scripts/testar-diario.mjs) monta milhares de diários com conhecimentos aleatórios e procura qualquer texto
// de capítulo, pessoa, vilão, boato ou eco que não estivesse na lista.
import { readFileSync } from "node:fs";
import { MUNDO, CAPITULO, VILOES } from "../mundo/mundo.mjs";
import { MONSTRO } from "../mundo/monstros.mjs";
import { REGIAO, REGIOES } from "../regras/exploracao.mjs";
import { GRIMORIOS } from "../regras/grimorios.mjs";
import { item } from "../regras/itens.mjs";
import { ECOS_DO_MENINO } from "./seteluzes.mjs";
import { textoReino, perigoEmPalavras, rodape, NOME_CASTA } from "./textos.mjs";
import { objetivoCampanha } from "./mundo.mjs";
import { um } from "./db.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const TEXTOS = ler("textos-mundo.json");
const { contos: CONTOS, flashbacks: FLASHBACKS } = ler("contos.json");
const ALDEIAS = (() => { const a = ler("aldeias.json"); return a.aldeias ?? a; })();
const PETS = new Map(ler("pets.json").pets.map((p) => [p.id, p]));
const GRANDES = ["excalibur", "kokugai", "tenmon", "shitencho"];
export const TAMANHO_PAGINA = 3200;

/** A abertura: o que qualquer pessoa do mundo sabe. Nada aqui depende de descoberta. */
export const INTRODUCAO = "Yotsuhoshi é um continente de quatro reinos — Fogo ao sul, Água a oeste, Terra a leste e Vento ao norte — em volta de uma terra central que ninguém governa. " +
  "Dizem que as Quatro Estrelas olham por quem nasce aqui: é delas o sorteio que decidiu de onde você veio e o que carrega no sangue.\n\n" +
  "O resto, você vai ter que descobrir andando.";

/**
 * Lê do banco o que o jogador já conquistou. Só ids e contadores: nenhum texto de história sai daqui.
 * Devolve o "conhecimento" que montarDiario usa.
 */
export async function coletar(db, j) {
  const prog = await db.query("select chave, valor from jogo.progresso where jogador_id = $1", [j.id]);
  const P = new Map(prog.map((l) => [l.chave, l.valor]));
  const com = (prefixo) => [...P.keys()].filter((k) => k.startsWith(prefixo)).map((k) => k.slice(prefixo.length));
  const viagens = await db.query("select origem, destino from jogo.viagens where jogador_id = $1 and concluida_em is not null", [j.id]);
  const relacoes = await db.query("select npc, amizade, conversas from jogo.relacoes where jogador_id = $1", [j.id]);
  const mortos = await db.query("select npc, vilao_id, vingado from jogo.npcs_mortos where jogador_id = $1", [j.id]);
  const derrotas = (await db.query("select vilao_id from jogo.derrotas_vilao where jogador_id = $1", [j.id])).map((x) => x.vilao_id);
  const ameacas = await db.query("select distinct a.monstro, a.estado from jogo.ameaca_golpes g join jogo.ameacas a on a.id = g.ameaca_id where g.jogador_id = $1", [j.id]);
  const grimorios = (await db.query("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 order by grimorio_id", [j.id])).map((x) => x.grimorio_id);
  const itens = (await db.query("select item_id from jogo.inventario where jogador_id = $1 and item_id = any($2)", [j.id, GRANDES])).map((x) => x.item_id);
  const pet = await um(db, "select pet_id, nome, estagio from jogo.pets where jogador_id = $1", [j.id]);
  const capitulos = com("c:").map((id) => ({ id, herdado: Boolean(P.get(`c:${id}`)?.herdado), de: P.get(`c:${id}`)?.de ?? null, com: P.get(`c:${id}`)?.com ?? null }));
  const feitosIds = new Set(capitulos.map((c) => c.id));
  // lugares onde o jogador esteve: viagens concluídas, onde está, e onde viveu alguma coisa
  const visitadas = new Set([j.regiao_atual, ...viagens.flatMap((v) => [v.origem, v.destino]), ...relacoes.map((r) => r.npc.split(":")[0]),
    ...capitulos.filter((c) => !c.herdado).map((c) => CAPITULO.get(c.id)?.regiao), ...com("p:").map((id) => CAPITULO.get(id)?.regiao)].filter((r) => r && MUNDO[r]));
  const aldeia = ALDEIAS.find((a) => a.nome === j.aldeia);
  const natal = aldeia ? REGIOES.find((r) => r.nome === aldeia.regiao)?.id : null;
  if (natal && MUNDO[natal]) visitadas.add(natal);
  // capítulo em aberto em cada lugar visitado: o primeiro ainda não feito, se as exigências dele já foram cumpridas (é o que a chegada mostra)
  const B = new Set(com("b:")), D = new Set(derrotas);
  const abertos = [];
  for (const rid of visitadas) for (const c of MUNDO[rid].capitulos ?? []) {
    if (feitosIds.has(c.id)) continue;
    if ((c.requer ?? []).some((r) => !B.has(r))) break; // ainda fechado: o jogador não viu nada dele
    // só entra se o jogador já viu esse capítulo: começou a andar nele, ou está no lugar agora (a chegada e o comando missao mostram)
    if (!P.has(`p:${c.id}`) && rid !== j.regiao_atual) break;
    let passo = Number(P.get(`p:${c.id}`) ?? 0);
    while (passo < c.passos.length && c.passos[passo].t === "derrotar" && D.has(c.passos[passo].a)) passo++;
    abertos.push({ id: c.id, passo: Math.min(passo, c.passos.length - 1) });
    break;
  }
  return {
    visitadas: [...visitadas], capitulos, abertos, bandeiras: [...B],
    pessoas: relacoes.filter((r) => Number(r.conversas) > 0).map((r) => ({ npc: r.npc, amizade: Number(r.amizade) })),
    mortos: mortos.map((m) => ({ npc: m.npc, vilao: m.vilao_id, vingado: m.vingado })),
    viloes: derrotas, contos: com("conto:"), ecos: com("eco:"), ecosMenino: Number(P.get("ecos-menino") ?? 0),
    monstros: ameacas.map((a) => ({ id: a.monstro, caiu: a.estado === "derrotada" })),
    grimorios, grandes: itens, pet: pet ? { id: pet.pet_id, nome: pet.nome, estagio: pet.estagio } : null,
    pactos: com("b:pacto-").length, terra: B.has("olhos-da-terra"),
  };
}

/** Monta as seções do diário a partir do conhecimento. Pura: mesma entrada, mesmo texto; nada além do que está em `k`. */
export function montarDiario(j, k) {
  const secoes = [];
  const nomeRegiao = (rid) => REGIAO.get(rid)?.nome ?? rid;
  const aldeia = ALDEIAS.find((a) => a.nome === j.aldeia);

  // 1) O mundo como te contaram
  secoes.push({ id: "mundo", titulo: "O mundo como te contaram", texto: [
    INTRODUCAO,
    ...Object.keys(TEXTOS.reinos).map((r) => { const t = TEXTOS.reinos[r]; return t ? `*${t.titulo}*\n${t.texto}` : null; }),
    aldeia ? `*De onde você veio*\n${aldeia.nome}, ${NOME_CASTA[j.casta]?.toLowerCase() ?? ""}. ${aldeia.descricao}` : null,
  ].filter(Boolean).join("\n\n") });

  // 2) Lugares onde você esteve
  const lugares = [...k.visitadas].filter((r) => MUNDO[r]).sort();
  if (lugares.length) secoes.push({ id: "lugares", titulo: `Lugares onde você esteve (${lugares.length} de ${Object.keys(MUNDO).length})`, texto: lugares.map((rid) => {
    const tr = TEXTOS.regioes[rid] ?? {};
    return `*${nomeRegiao(rid)}* — ${tr.texto ?? ""}\n_perigo: ${perigoEmPalavras(REGIAO.get(rid)?.perigo)} · ali há: ${MUNDO[rid].locais.map((l) => l.nome).join(", ")}_`;
  }).join("\n\n") });

  // 3) Histórias: vividas, ouvidas de quem viveu, e em aberto
  const vividas = k.capitulos.filter((c) => !c.herdado && CAPITULO.get(c.id)), ouvidas = k.capitulos.filter((c) => c.herdado && CAPITULO.get(c.id));
  const hist = [];
  const porNivel = (a, b) => CAPITULO.get(a.id).nivel - CAPITULO.get(b.id).nivel;
  if (vividas.length) hist.push("*Histórias que você viveu*", ...vividas.sort(porNivel).map(({ id, com: junto }) => { const c = CAPITULO.get(id);
    return [`*${c.titulo}* (${nomeRegiao(c.regiao)})${junto ? ` — ao lado de ${junto}` : ""}`, c.fim || null, c.pista ? `_O que você descobriu: ${c.pista}_` : null].filter(Boolean).join("\n"); }));
  if (ouvidas.length) hist.push("*Histórias que te contaram* (outra pessoa viveu)", ...ouvidas.sort(porNivel).map(({ id, de }) => { const c = CAPITULO.get(id);
    return [`*${c.titulo}* (${nomeRegiao(c.regiao)})${de ? ` — por ${de}` : ""}`, c.pista ? `_O que se sabe: ${c.pista}_` : null].filter(Boolean).join("\n"); }));
  const abertos = k.abertos.filter((a) => CAPITULO.get(a.id));
  if (abertos.length) hist.push("*Histórias em aberto*", ...abertos.map(({ id, passo }) => { const c = CAPITULO.get(id);
    return `*${c.titulo}* (${nomeRegiao(c.regiao)}) — passo ${passo + 1} de ${c.passos.length}\n${c.passos.slice(0, passo + 1).map((p, i) => `${i < passo ? "✓" : "→"} ${p.txt}`).join("\n")}`; }));
  if (hist.length) secoes.push({ id: "historias", titulo: `Histórias (${vividas.length} vividas, ${ouvidas.length} ouvidas, ${abertos.length} em aberto)`,
    texto: `${hist.join("\n\n")}\n\n*Seu caminho agora:* ${objetivoCampanha(new Set(k.bandeiras))}` });

  // 4) Pessoas
  const pessoas = k.pessoas.map((p) => { const [rid, nid] = p.npc.split(":"); return { ...p, rid, n: MUNDO[rid]?.npcs?.[nid] }; }).filter((p) => p.n);
  if (pessoas.length) secoes.push({ id: "pessoas", titulo: `Pessoas que você conheceu (${pessoas.length})`, texto: pessoas.sort((a, b) => b.amizade - a.amizade).map((p) => {
    const morto = k.mortos.find((m) => m.npc === p.npc);
    return `*${p.n.nome}*, ${p.n.papel} — ${nomeRegiao(p.rid)}${p.amizade >= 6 ? " · confia em você" : p.amizade >= 3 ? ` · ${p.n.fem ? "amiga" : "amigo"}` : ""}` +
      `${morto ? `\n_${p.n.fem ? "Morta" : "Morto"} por ${VILOES.get(morto.vilao)?.nome ?? "alguém"}${morto.vingado ? ". Você cumpriu a vingança." : "."}_` : ""}\n_O que te contou: ${p.n.sabe}_`;
  }).join("\n\n") });

  // 5) Inimigos
  const viloes = k.viloes.map((id) => VILOES.get(id)).filter(Boolean), monstros = k.monstros.map((m) => ({ ...m, m: MONSTRO.get(m.id) })).filter((x) => x.m);
  if (viloes.length || monstros.length) secoes.push({ id: "inimigos", titulo: `Inimigos que você enfrentou (${viloes.length + monstros.length})`, texto: [
    ...viloes.sort((a, b) => a.nivel - b.nivel).map((v) => `*${v.nome_completo}* — derrotado em ${nomeRegiao([...Object.keys(MUNDO)].find((rid) => MUNDO[rid].locais.some((l) => (l.viloes ?? []).includes(v.id))) ?? "")}\n_${v.descricao}_`),
    ...monstros.map(({ m, caiu }) => `*${m.nome}, ${m.titulo}* — ${caiu ? "você estava lá quando caiu" : "você o enfrentou"}\n_${m.desc}_`),
  ].join("\n\n") });

  // 6) O que o povo conta, e o que o passado mostrou
  const contos = k.contos.map((id) => CONTOS.find((c) => String(c.id) === String(id))).filter(Boolean), ecos = k.ecos.map((id) => FLASHBACKS.find((f) => String(f.id) === String(id))).filter(Boolean);
  const menino = ECOS_DO_MENINO.slice(0, Math.max(0, Math.min(ECOS_DO_MENINO.length, k.ecosMenino)));
  if (contos.length || ecos.length || menino.length) secoes.push({ id: "boatos", titulo: `Boatos e ecos (${contos.length} boatos, ${ecos.length + menino.length} ecos)`, texto: [
    ...(contos.length ? ["*O que o povo conta*", ...contos.map((c) => `*${c.titulo}*\n${c.resumo}`)] : []),
    ...(ecos.length ? ["*Memórias que você viveu*", ...ecos.map((f) => `*${f.titulo}* — ${f.personagem}\n${f.cena}\n${(f.revela ?? []).map((r) => `• ${r}`).join("\n")}`)] : []),
    ...(menino.length ? ["*Lembranças que não são suas*", ...menino.map((t) => `_${t}_`)] : []),
  ].join("\n\n") });

  // 7) O que você carrega
  const carrega = [
    j.titulo ? `Título: *${j.titulo}*` : null,
    k.pet && PETS.get(k.pet.id) ? `Companheiro: *${k.pet.nome}*, ${PETS.get(k.pet.id).especie}` : null,
    k.grandes.length ? `Grandes Itens: ${k.grandes.map((id) => item(id)?.nome.split(",")[0]).join(", ")}` : null,
    k.grimorios.length ? `Grimórios: ${k.grimorios.map((id) => GRIMORIOS.get(id)?.nome).filter(Boolean).join(", ")}` : null,
    k.terra ? "Você tem os Olhos da Terra." : null,
    k.pactos ? `Pactos: ${k.pactos} (corrupção ${Number(j.corrupcao ?? 0)}/100)` : null,
  ].filter(Boolean);
  if (carrega.length) secoes.push({ id: "carrega", titulo: "O que você carrega", texto: carrega.join("\n") });
  return secoes;
}

/** Quebra um texto longo em páginas, sempre em fim de parágrafo. */
export function paginar(texto, limite = TAMANHO_PAGINA) {
  const paginas = [];
  let atual = "";
  for (const bloco of texto.split("\n\n")) {
    if (atual && atual.length + bloco.length + 2 > limite) { paginas.push(atual); atual = ""; }
    atual += (atual ? "\n\n" : "") + bloco;
  }
  if (atual) paginas.push(atual);
  return paginas;
}

export function criarDiario({ db }) {
  async function comando(j, t, para) {
    const m = t.match(/^(?:diario|meu diario|livro|caderno)(?:\s+(.+))?$/);
    if (!m) return { tratado: false, saidas: [] };
    const secoes = montarDiario(j, await coletar(db, j));
    const indice = secoes.map((s, i) => `*${i + 1}* ${s.titulo}`).join("\n");
    const pedido = (m[1] ?? "").trim();
    const mostrar = (s, i) => paginar(s.texto).map((pg, n, todas) => ({ para, texto: `📖 *${i + 1}. ${s.titulo}*${todas.length > 1 ? ` _(${n + 1}/${todas.length})_` : ""}\n\n${pg}` }));
    if (!pedido) return { tratado: true, saidas: [{ para, texto: `📖 *Diário de ${j.nome}*\n_Só o que você já viu, ouviu e viveu._\n\n${indice}\n\n${rodape("diario <nº> abre uma parte", "diario tudo manda todas")}` }, ...mostrar(secoes[0], 0)] };
    if (/^(tudo|completo|todas?)$/.test(pedido)) return { tratado: true, saidas: secoes.flatMap(mostrar) };
    const i = /^\d+$/.test(pedido) ? Number(pedido) - 1 : secoes.findIndex((s) => s.id.startsWith(pedido) || s.titulo.toLowerCase().includes(pedido));
    if (!secoes[i]) return { tratado: true, saidas: [{ para, texto: `Seu diário tem estas partes:\n\n${indice}\n\n${rodape("diario <nº>")}` }] };
    return { tratado: true, saidas: mostrar(secoes[i], i) };
  }
  return { comando };
}
