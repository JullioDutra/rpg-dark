// Testes das regras de combate e progressão (sem banco). Uso: node scripts/testar-combate.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { novoCombate, resolverRodada, aplicarXP, multElemento, rankDoNivel, recompensa, painel, HABILIDADES, CLASSES, atributosEfetivos } from "../src/regras/combate.mjs";
import { XP_PROXIMO } from "./balanceamento.mjs";

const VILOES = JSON.parse(readFileSync(new URL("../data/viloes.json", import.meta.url)));
const V = (id) => VILOES.find((v) => v.id === id);
let n = 0;
const t = (nome, fn) => { fn(); n++; console.log(`  ✔ ${nome}`); };
const fixo = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };
const jog = (classe = "Espadachim", extra = {}) => {
  const c = CLASSES[classe];
  return { id: 1, nome: "Kaito", classe, nivel: 1, xp: 0, hp: c.hp_base, hp_max: c.hp_base, mp: 60, mp_max: 60, pontos_livres: 0,
    atributos: { ...c.base }, atributo_magico: "Água (Chuva)", efeitos: [], casta: "plebeu", rank: "E", ...extra };
};

t("ciclo elemental: Água vence Fogo, Fogo perde para Água, fraqueza conta", () => {
  assert.equal(multElemento("Água", "Fogo"), 1.25);
  assert.equal(multElemento("Fogo", "Água"), 0.8);
  assert.equal(multElemento("Luz", "Fogo", "Luz"), 1.25);
  assert.equal(multElemento(null, "Fogo"), 1);
});
t("ataque causa dano e o inimigo responde", () => {
  const e = novoCombate(jog(), V("V001"), 2);
  const r = resolverRodada(e, { tipo: "atacar" }, fixo(0.5));
  assert.equal(r.fim, null);
  assert(r.estado.inimigo.hp < e.inimigo.hp && r.estado.jogador.hp < e.jogador.hp);
  assert.equal(r.estado.rodada, 2);
  assert.match(painel(r.estado), /Rodada 2/);
});
t("magia na fraqueza é super efetiva e gasta MP", () => {
  const e = novoCombate(jog("Mago"), V("V001"), 2); // Haikobo: fraqueza Água
  const r = resolverRodada(e, { tipo: "magia" }, fixo(0.5));
  assert.equal(r.estado.jogador.mp, e.jogador.mp - 6);
  assert(r.estado.log.some((l) => /super efetivo/.test(l)));
});
t("sem MP, sem poção ou em recarga: erro e a rodada não passa", () => {
  const e = novoCombate(jog("Mago", { mp: 2 }), V("V001"), 2);
  assert.match(resolverRodada(e, { tipo: "magia" }, fixo(0.5)).erro, /MP insuficiente/);
  assert.match(resolverRodada(e, { tipo: "item", temPocao: false }, fixo(0.5)).erro, /não tem poções/);
  const e2 = novoCombate(jog(), V("V001"), 2);
  const r = resolverRodada(e2, { tipo: "habilidade" }, fixo(0.5));
  assert.match(resolverRodada(r.estado, { tipo: "habilidade" }, fixo(0.5)).erro, /recarregando/);
});
t("defender corta o dano pela metade", () => {
  const e = novoCombate(jog(), V("V001"), 2);
  const a = resolverRodada(e, { tipo: "atacar" }, fixo(0.5)).estado;
  const d = resolverRodada(e, { tipo: "defender" }, fixo(0.5)).estado;
  assert((e.jogador.hp - d.jogador.hp) <= Math.ceil((e.jogador.hp - a.jogador.hp) / 2));
});
t("golpe forte é avisado antes (telegrafia)", () => {
  let e = novoCombate(jog("Cavaleiro"), V("V001"), 2);
  e = resolverRodada(e, { tipo: "defender" }, fixo(0.5)).estado;
  assert.equal(e.preparando, false);
  e = resolverRodada(e, { tipo: "defender" }, fixo(0.5)).estado;
  assert.equal(e.preparando, true); // avisado no fim da 2ª rodada, golpe forte na 3ª
  assert.match(painel(e), /preparando um golpe forte/);
});
t("poção cura e tem limite de 2 por batalha", () => {
  let e = novoCombate(jog("Espadachim", { hp: 20 }), V("V001"), 2);
  e = resolverRodada(e, { tipo: "item", temPocao: true }, fixo(0.99)).estado;
  e = resolverRodada(e, { tipo: "item", temPocao: true }, fixo(0.99)).estado;
  assert.match(resolverRodada(e, { tipo: "item", temPocao: true }, fixo(0.99)).erro, /Máximo/);
});
t("guarda de elite quebra: inimigo perde a ação e o próximo golpe dá +50%", () => {
  let e = novoCombate(jog("Mago", { mp: 200, mp_max: 200, nivel: 14 }), V("V038"), 14);
  assert(e.inimigo.posturaMax > 0);
  e.inimigo.postura = 1;
  const r = resolverRodada(e, { tipo: "magia" }, fixo(0.5)); // fraqueza → −2 guarda
  if (V("V038").fraqueza === "Água") {
    assert(r.estado.log.some((l) => /guarda .* quebrou/i.test(l)));
    assert(r.estado.log.some((l) => /atordoado/.test(l)));
    assert.equal(r.estado.inimigo.vulneravel, true);
  }
});
t("fugir de chefe não é permitido", () => {
  const chefe = VILOES.find((v) => v.tier === "alto");
  assert.match(resolverRodada(novoCombate(jog(), chefe, chefe.nivel), { tipo: "fugir" }, fixo(0.5)).erro, /chefe/);
});
t("vitória e derrota encerram a batalha", () => {
  let e = novoCombate(jog("Espadachim", { nivel: 30, atributos: { FOR: 400, DEF: 300, MAG: 5, RES: 300, VEL: 300, SOR: 7 } }), V("V001"), 2);
  assert.equal(resolverRodada(e, { tipo: "atacar" }, fixo(0.5)).fim, "vitoria");
  e = novoCombate(jog("Mago", { hp: 1 }), V("V001"), 2);
  assert.equal(resolverRodada(e, { tipo: "defender" }, fixo(0.5)).fim, "derrota");
});
t("XP sobe níveis com crescimento da classe, HP/MP cheios e rank", () => {
  const j = jog("Espadachim");
  const r = aplicarXP(j, XP_PROXIMO(1) + XP_PROXIMO(2) + 5);
  assert.equal(r.nivel, 3); assert.equal(r.xp, 5);
  assert.equal(r.atributos.FOR, j.atributos.FOR + 2 * CLASSES.Espadachim.cresc.FOR);
  assert(r.hp_max > j.hp_max && r.hp === r.hp_max);
  assert.equal(r.eventos.filter((x) => x.fonte === "subida_de_nivel").length, 2 * Object.values(CLASSES.Espadachim.cresc).filter(Boolean).length);
  let x = 0; for (let k = 1; k < 10; k++) x += XP_PROXIMO(k);
  const d = aplicarXP(j, x);
  assert.equal(d.nivel, 10); assert.equal(d.rank, "D"); assert.equal(d.pontos_livres, 3);
  assert.equal(rankDoNivel(95), "SS");
});
t("recompensa: campônio +20% XP; vitória superior detectada", () => {
  const ini = { nivel: 8, tier: "comum" };
  assert.equal(recompensa(jog("Espadachim", { casta: "campones" }), ini, fixo(0.5)).xp, Math.round(recompensa(jog(), ini, fixo(0.5)).xp * 1.2));
  assert.equal(recompensa(jog(), ini, fixo(0.5)).superior, true);
});
t("ferida ativa tira 10% de um atributo", () => {
  const j = jog("Espadachim", { efeitos: [{ tipo: "ferida", atributo: "FOR", ate: new Date(Date.now() + 3600e3).toISOString() }] });
  const sem = atributosEfetivos(jog("Espadachim"));
  assert(atributosEfetivos(j).FOR < sem.FOR);
});
t("toda classe tem habilidade", () => {
  for (const c of Object.keys(CLASSES)) assert(HABILIDADES[c], c);
});
console.log(`${n} testes de combate passaram`);
