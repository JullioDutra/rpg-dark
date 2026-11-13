// Teste de vazamento do diário: monta milhares de diários com "conhecimentos" sorteados e procura, no texto final,
// qualquer coisa que o jogador NÃO tinha descoberto (pista, desfecho ou passo futuro de capítulo, o que um NPC sabe,
// descrição de vilão, boato, eco, região). Se achar uma, falha dizendo o quê.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MUNDO, CAPITULO, VILOES } from "../src/mundo/mundo.mjs";
import { MONSTROS } from "../src/mundo/monstros.mjs";
import { montarDiario, paginar, INTRODUCAO, TAMANHO_PAGINA } from "../src/servidor/diario.mjs";
import { ECOS_DO_MENINO } from "../src/servidor/seteluzes.mjs";
import { rng as semente } from "../src/avatar/pixel.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const TEXTOS = ler("textos-mundo.json"), { contos: CONTOS, flashbacks: FLASHBACKS } = ler("contos.json");
const caps = [...CAPITULO.values()], regioes = Object.keys(MUNDO), npcs = regioes.flatMap((rid) => Object.keys(MUNDO[rid].npcs ?? {}).map((nid) => `${rid}:${nid}`));
const jogador = { nome: "Teste", classe: "Mago", casta: "plebeu", aldeia: "Haibara", regiao_atual: "R-HOM-3", corrupcao: 0, titulo: null };
const texto = (k) => montarDiario(jogador, k).map((s) => `${s.titulo}\n${s.texto}`).join("\n\n");
const vazio = { visitadas: [], capitulos: [], abertos: [], bandeiras: [], pessoas: [], mortos: [], viloes: [], contos: [], ecos: [], ecosMenino: 0, monstros: [], grimorios: [], grandes: [], pet: null, pactos: 0, terra: false };

/** Lista tudo o que NÃO deveria aparecer para este conhecimento. Cada item: [rótulo, trecho proibido]. */
function proibidos(k) {
  const lista = [];
  const feitos = new Map(k.capitulos.map((c) => [c.id, c])), abertos = new Map(k.abertos.map((a) => [a.id, a.passo]));
  // tudo o que este jogador já viu por outros caminhos (nomes de lugares visitados, vilões derrotados, boatos e ecos, o que as pessoas contaram)
  const legitimo = [
    ...k.visitadas.flatMap((rid) => MUNDO[rid].locais.map((l) => l.nome)),
    ...k.viloes.map((id) => `${VILOES.get(id).nome_completo} ${VILOES.get(id).descricao}`),
    ...CONTOS.filter((c) => k.contos.map(String).includes(String(c.id))).map((c) => `${c.titulo} ${c.resumo}`),
    ...FLASHBACKS.filter((f) => k.ecos.map(String).includes(String(f.id))).map((f) => `${f.titulo} ${f.personagem} ${f.cena} ${(f.revela ?? []).join(" ")}`),
    ...k.pessoas.map((p) => { const [rid, nid] = p.npc.split(":"); return MUNDO[rid].npcs[nid].sabe; }),
    ...k.capitulos.map((c) => { const x = CAPITULO.get(c.id); return c.herdado ? x.pista : `${x.pista} ${x.fim} ${x.passos.map((q) => q.txt).join(" ")}`; }),
    ...k.abertos.map((a) => CAPITULO.get(a.id).passos.slice(0, a.passo + 1).map((q) => q.txt).join(" ")),
  ].join("\n");
  for (const c of caps) {
    const f = feitos.get(c.id);
    if (f && !f.herdado) continue;                                  // viveu: pode tudo deste capítulo
    if (f?.herdado) { lista.push([`desfecho de capítulo só ouvido (${c.id})`, c.fim]); for (const p of c.passos) lista.push([`passo de capítulo só ouvido (${c.id})`, p.txt]); continue; }
    lista.push([`pista de capítulo não concluído (${c.id})`, c.pista], [`desfecho de capítulo não concluído (${c.id})`, c.fim]);
    const ate = abertos.has(c.id) ? abertos.get(c.id) : -1;
    c.passos.forEach((p, i) => { if (i > ate) lista.push([`passo futuro (${c.id} #${i + 1})`, p.txt]); });
    // Alguns títulos são também o nome de um lugar, de um vilão ou de um boato ("O Poço Seco", "Céu Rubro", "A Criança da Mina").
    // Ler esse nome por uma dessas origens, que o jogador já conhece, não é vazamento: o título só é proibido sem origem legítima.
    const origemLegitima = legitimo.includes(c.titulo);
    if (ate < 0 && !origemLegitima) lista.push([`título de capítulo que o jogador nunca viu (${c.id})`, c.titulo]);
  }
  const conhece = new Set(k.pessoas.map((p) => p.npc));
  for (const chave of npcs) if (!conhece.has(chave)) { const [rid, nid] = chave.split(":"); lista.push([`o que ${MUNDO[rid].npcs[nid].nome} sabe`, MUNDO[rid].npcs[nid].sabe]); }
  for (const v of VILOES.values()) if (!k.viloes.includes(v.id)) lista.push([`descrição de vilão não derrotado (${v.id})`, v.descricao]);
  for (const c of CONTOS) if (!k.contos.map(String).includes(String(c.id))) lista.push([`boato não ouvido (${c.id})`, c.resumo]);
  for (const f of FLASHBACKS) if (!k.ecos.map(String).includes(String(f.id))) lista.push([`eco não vivido (${f.id})`, f.cena]);
  ECOS_DO_MENINO.forEach((t, i) => { if (i >= k.ecosMenino) lista.push([`eco do menino #${i + 1}`, t]); });
  for (const m of MONSTROS) if (!k.monstros.some((x) => x.id === m.id)) lista.push([`monstro não enfrentado (${m.id})`, m.desc]);
  for (const rid of regioes) if (!k.visitadas.includes(rid) && TEXTOS.regioes[rid]?.texto) lista.push([`região não visitada (${rid})`, TEXTOS.regioes[rid].texto]);
  return lista.filter(([, t]) => t && String(t).length >= 8);
}
function vazamentos(k) {
  const d = texto(k);
  return proibidos(k).filter(([, trecho]) => d.includes(trecho)).map(([rotulo]) => rotulo);
}

let n = 0;
const t = (nome, fn) => { fn(); n++; console.log(`  ✔ ${nome}`); };
console.log("Diário");

t("recém-chegado: só a apresentação do mundo; nenhuma seção de descoberta e nenhum segredo", () => {
  const s = montarDiario(jogador, vazio);
  assert.deepEqual(s.map((x) => x.id), ["mundo"]);
  assert(s[0].texto.startsWith(INTRODUCAO)); assert.match(s[0].texto, /Reino do Fogo[\s\S]*Reino da Água[\s\S]*Reino da Terra[\s\S]*Reino do Vento[\s\S]*Terra Central[\s\S]*De onde você veio[\s\S]*Haibara/);
  assert.deepEqual(vazamentos(vazio), []);
  // a apresentação não cita nenhum nome próprio da trama
  for (const nome of ["Kaien", "Nisteroy", "Kanata", "Yoru", "Sayo", "Eclipse", "Ovo", "Esquife", "Hinata"]) assert(!s[0].texto.includes(nome), `a apresentação cita ${nome}`);
});

t("a ordem é sempre: o mundo, depois lugares, histórias, pessoas, inimigos, boatos, o que carrega", () => {
  const cheio = { ...vazio, visitadas: regioes.slice(0, 3), capitulos: [{ id: caps[0].id, herdado: false }], pessoas: [{ npc: npcs[0], amizade: 3 }], viloes: [[...VILOES.keys()][0]],
    contos: [CONTOS[0].id], ecosMenino: 1, grimorios: ["G01"], bandeiras: ["despertar"] };
  assert.deepEqual(montarDiario(jogador, cheio).map((x) => x.id), ["mundo", "lugares", "historias", "pessoas", "inimigos", "boatos", "carrega"]);
});

t("capítulo vivido mostra desfecho e pista; só ouvido mostra a pista e quem viveu; em aberto mostra só até o passo atual", () => {
  const c = caps.find((x) => x.passos.length >= 3);
  const vivido = texto({ ...vazio, capitulos: [{ id: c.id, herdado: false }] });
  assert(vivido.includes(c.fim) && vivido.includes(c.pista));
  const ouvido = texto({ ...vazio, capitulos: [{ id: c.id, herdado: true, de: "Rin" }] });
  assert(ouvido.includes(c.pista) && ouvido.includes("por Rin") && !ouvido.includes(c.fim));
  const aberto = texto({ ...vazio, abertos: [{ id: c.id, passo: 1 }] });
  assert(aberto.includes(c.passos[0].txt) && aberto.includes(c.passos[1].txt) && !aberto.includes(c.passos[2].txt) && !aberto.includes(c.pista) && !aberto.includes(c.fim));
});

t("o próprio teste pega um vazamento plantado de propósito", () => {
  const c = caps[5];
  const adulterado = `${texto(vazio)}\n${c.pista}`;
  assert(proibidos(vazio).some(([, trecho]) => adulterado.includes(trecho)), "o detector precisa enxergar uma pista plantada");
});

t("3.000 diários com conhecimentos sorteados: nada que o jogador não descobriu aparece", () => {
  const r = semente("diario-vazamento");
  const sorteia = (lista, p) => lista.filter(() => r() < p);
  const achados = new Map();
  for (let i = 0; i < 3000; i++) {
    const dens = r(); // de quase nada a quase tudo
    const feitos = sorteia(caps, dens * 0.8).map((c) => ({ id: c.id, herdado: r() < 0.4, de: "Outro", com: r() < 0.2 ? "Amigo" : null }));
    const idsFeitos = new Set(feitos.map((c) => c.id));
    const abertos = sorteia(caps.filter((c) => !idsFeitos.has(c.id)), dens * 0.3).map((c) => ({ id: c.id, passo: Math.floor(r() * c.passos.length) }));
    const k = { ...vazio, visitadas: sorteia(regioes, dens), capitulos: feitos, abertos, bandeiras: sorteia(["despertar", "selo", "festival", "rosto", "muralha", "kanata"], dens),
      pessoas: sorteia(npcs, dens * 0.7).map((npc) => ({ npc, amizade: Math.floor(r() * 8) })), viloes: sorteia([...VILOES.keys()], dens * 0.6),
      contos: sorteia(CONTOS, dens * 0.6).map((c) => c.id), ecos: sorteia(FLASHBACKS, dens * 0.5).map((f) => f.id), ecosMenino: Math.floor(r() * 5),
      monstros: sorteia(MONSTROS, dens * 0.3).map((m) => ({ id: m.id, caiu: r() < 0.5 })), grimorios: r() < 0.5 ? ["G01", "G41"] : [], grandes: r() < 0.3 ? ["excalibur"] : [], pactos: Math.floor(r() * 3), terra: r() < 0.2 };
    for (const v of vazamentos(k)) achados.set(v, (achados.get(v) ?? 0) + 1);
  }
  assert.equal(achados.size, 0, `vazamentos: ${[...achados.entries()].slice(0, 8).map(([k2, v]) => `${k2} ×${v}`).join(" | ")}`);
});

t("páginas: nenhuma passa do limite e nada se perde", () => {
  const tudo = { ...vazio, visitadas: regioes, capitulos: caps.map((c) => ({ id: c.id, herdado: false })), pessoas: npcs.map((npc) => ({ npc, amizade: 6 })), viloes: [...VILOES.keys()], contos: CONTOS.map((c) => c.id), ecos: FLASHBACKS.map((f) => f.id), ecosMenino: 4 };
  for (const s of montarDiario(jogador, tudo)) {
    const pgs = paginar(s.texto);
    assert.equal(pgs.join("\n\n"), s.texto, "paginar não perde texto");
    for (const pg of pgs) assert(pg.length <= TAMANHO_PAGINA + 1500, `página grande demais em ${s.id}: ${pg.length}`);
  }
});

console.log(`${n} verificações do diário passaram.`);
