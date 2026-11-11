// Testes das regras de combate v2 (menu numerado, dado d20, kits por classe), itens e progressão. Sem banco.
// Uso: node scripts/testar-combate.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { novoCombate, resolverRodada, aplicarXP, multElemento, rankDoNivel, recompensa, painel, menu, escolher, rolar, KITS, CLASSES,
  atributosEfetivos, habilidadesDe, proximaHabilidade } from "../src/regras/combate.mjs";
import { item, bonusEquip, podeEquipar, kitInicial, estoque, efeitoItem, EQUIP_CLASSE, todosItens } from "../src/regras/itens.mjs";
import { XP_PROXIMO } from "./balanceamento.mjs";

const VILOES = JSON.parse(readFileSync(new URL("../data/viloes.json", import.meta.url)));
const V = (id) => VILOES.find((v) => v.id === id);
let n = 0;
const t = (nome, fn) => { fn(); n++; console.log(`  ✔ ${nome}`); };
// rng que faz o d20 cair no valor pedido: d(14) → 14
const d = (...faces) => { let i = 0; return () => (faces[i++ % faces.length] - 0.5) / 20; };
const jog = (classe = "Espadachim", extra = {}) => {
  const c = CLASSES[classe];
  return { id: 1, nome: "Kaito", classe, nivel: 1, xp: 0, hp: c.hp_base, hp_max: c.hp_base, mp: 60, mp_max: 60, pontos_livres: 0,
    atributos: { ...c.base }, atributo_magico: "Água (Chuva)", efeitos: [], casta: "plebeu", rank: "E", ...extra };
};
const acao = (e, texto) => { const x = escolher(e, texto); assert(x && !x.erro, `ação inválida: ${texto}`); return x.acao; };

t("ciclo elemental: Água vence Fogo, Fogo perde para Água, fraqueza conta", () => {
  assert.equal(multElemento("Água", "Fogo"), 1.25);
  assert.equal(multElemento("Fogo", "Água"), 0.8);
  assert.equal(multElemento("Luz", "Fogo", "Luz"), 1.25);
});
t("dado: 1 sempre falha, 20 sempre é perfeito, bônus muda a faixa", () => {
  assert.equal(rolar(d(1), 5).faixa, "falha");
  assert.equal(rolar(d(20)).faixa, "critico");
  assert.equal(rolar(d(6)).faixa, "fraco");
  assert.equal(rolar(d(6), 3).faixa, "normal");
  assert.equal(rolar(d(15)).faixa, "forte");
});
t("menu numerado mostra só o que o jogador tem; habilidades entram por nível", () => {
  const e1 = novoCombate(jog("Espadachim"), V("V001"), 2, { itens: { pocao: 2, racao: 1 } });
  const m1 = menu(e1).map((x) => x.rotulo);
  assert.deepEqual(m1.slice(0, 3), ["Atacar", "Defender", "Magia de Água"]);
  assert(m1.includes("Iaijutsu") && !m1.includes("Passo Fantasma"));
  assert(m1.some((r) => /Poção de cura ×2/.test(r)) && !m1.some((r) => /Ração/.test(r)), "só itens de luta");
  assert.equal(m1.at(-1), "Fugir");
  const e5 = novoCombate(jog("Espadachim", { nivel: 5 }), V("V001"), 2);
  assert(menu(e5).some((x) => x.rotulo === "Passo Fantasma"));
  assert.equal(habilidadesDe("Mago", 30).length, 4);
  assert.equal(proximaHabilidade("Mago", 1).nivel, 5);
  for (const c of Object.keys(CLASSES)) assert.equal(KITS[c].length, 4, c);
});
t("escolha por número e por apelido; número inválido dá erro", () => {
  const e = novoCombate(jog(), V("V001"), 2, { itens: { pocao: 1 } });
  assert.equal(escolher(e, "1").acao.tipo, "atacar");
  assert.equal(escolher(e, "d").acao.tipo, "defender");
  assert.equal(escolher(e, "4").acao.id, "h1");
  assert.match(escolher(e, "99").erro, /Escolha um número/);
  assert.equal(escolher(e, "oi tudo bem"), null);
});
t("o dado decide a força: 15 bate mais que 8, e 1 erra", () => {
  const e = novoCombate(jog(), V("V001"), 2);
  const normal = resolverRodada(e, { tipo: "atacar" }, d(8, 10)).estado, forte = resolverRodada(e, { tipo: "atacar" }, d(15, 10)).estado, falha = resolverRodada(e, { tipo: "atacar" }, d(1, 10)).estado;
  assert(e.inimigo.hp - forte.inimigo.hp > e.inimigo.hp - normal.inimigo.hp);
  assert.equal(falha.inimigo.hp, e.inimigo.hp);
  assert.match(painel(normal), /🎲 \*8\* — acerto firme/);
  assert.match(painel(normal), /\*1\* Atacar/);
});
t("magia na fraqueza gasta mana e avisa o ponto fraco", () => {
  const e = novoCombate(jog("Mago"), V("V001"), 2); // Haikobo: fraqueza Água
  const r = resolverRodada(e, { tipo: "magia" }, d(10, 10));
  assert.equal(r.estado.jogador.mp, e.jogador.mp - 6);
  assert(r.estado.log.some((l) => /ponto fraco/.test(l)));
});
t("sem mana, em espera ou sem item: erro e a rodada não passa", () => {
  const e = novoCombate(jog("Mago", { mp: 2 }), V("V001"), 2);
  assert.match(resolverRodada(e, { tipo: "magia" }, d(10)).erro, /Falta mana/);
  assert.match(resolverRodada(e, { tipo: "item", id: "pocao" }, d(10)).erro, /não tem esse item/);
  const e2 = novoCombate(jog(), V("V001"), 2);
  const r = resolverRodada(e2, { tipo: "habilidade", id: "h1" }, d(10, 10));
  assert.match(resolverRodada(r.estado, { tipo: "habilidade", id: "h1" }, d(10)).erro, /não está pronta/);
  assert.match(menu(r.estado).find((x) => x.acao.id === "h1").bloqueio, /espera/);
  assert.match(resolverRodada(e2, { tipo: "habilidade", id: "h4" }, d(10)).erro, /não aprendeu/);
});
t("defender: o dado define quanto bloqueia e devolve um pouco de mana", () => {
  const e = novoCombate(jog("Mago", { mp: 20 }), V("V001"), 2);
  const sem = resolverRodada(e, { tipo: "atacar" }, d(1, 10)).estado;        // erra, leva o golpe cheio
  const bom = resolverRodada(e, { tipo: "defender" }, d(16, 10)).estado;     // bloqueia 70%
  const perfeito = resolverRodada(e, { tipo: "defender" }, d(20, 10)).estado;
  assert(e.jogador.hp - bom.jogador.hp < (e.jogador.hp - sem.jogador.hp) * 0.5);
  assert.equal(perfeito.jogador.hp, e.jogador.hp);
  assert(bom.jogador.mp > e.jogador.mp);
});
t("golpe forte é avisado uma rodada antes", () => {
  let e = novoCombate(jog("Cavaleiro"), V("V001"), 2);
  e = resolverRodada(e, { tipo: "defender" }, d(10, 10)).estado;
  assert.equal(e.preparando, false);
  e = resolverRodada(e, { tipo: "defender" }, d(10, 10)).estado;
  assert.equal(e.preparando, true);
  assert.match(painel(e), /junta forças/);
});
t("itens em luta: poção cura, limite de 2, bomba de fumaça foge (menos de chefe)", () => {
  let e = novoCombate(jog("Espadachim", { hp: 20 }), V("V001"), 2, { itens: { pocao: 3, "bomba-fumaca": 1 } });
  let r = resolverRodada(e, acao(e, "pocao"), d(1));
  assert.equal(r.consumir, "pocao"); assert(r.estado.jogador.hp > 20 - 60);
  e = r.estado; e = resolverRodada(e, { tipo: "item", id: "pocao" }, d(1)).estado;
  assert.match(resolverRodada(e, { tipo: "item", id: "pocao" }, d(1)).erro, /2 itens por luta/);
  const f = novoCombate(jog(), V("V001"), 2, { itens: { "bomba-fumaca": 1 } });
  assert.equal(resolverRodada(f, { tipo: "item", id: "bomba-fumaca" }, d(10)).fim, "fuga");
  const chefe = VILOES.find((v) => v.tier === "alto");
  const c = novoCombate(jog(), chefe, chefe.nivel, { itens: { "bomba-fumaca": 1 } });
  assert.match(resolverRodada(c, { tipo: "item", id: "bomba-fumaca" }, d(10)).erro, /chefe/);
  assert.match(resolverRodada(c, { tipo: "fugir" }, d(10)).erro, /chefe/);
  assert(!menu(c).some((x) => x.acao.tipo === "fugir"));
});
t("efeitos de habilidade: proteção, foco, dano contínuo, prender, roubo de vida", () => {
  let e = novoCombate(jog("Mago", { nivel: 12, mp: 100, mp_max: 100 }), V("V038"), 14);
  let r = resolverRodada(e, { tipo: "habilidade", id: "h2" }, d(10, 10)).estado;   // Barreira
  assert(r.jogador.protecaoRodadas >= 1 && r.jogador.protecao > 0.5);
  r = resolverRodada(e, { tipo: "habilidade", id: "h3" }, d(10, 10)).estado;       // Selo Ardente
  assert(r.inimigo.queima > 0 && r.log.some((l) => /ferida/.test(l)));
  const fn = novoCombate(jog("Força da Natureza"), V("V001"), 2);
  const p = resolverRodada(fn, { tipo: "habilidade", id: "h1" }, d(10, 10)).estado; // Raízes
  assert(p.log.some((l) => /sem conseguir agir|não consegue se mover/.test(l)));
  assert.equal(p.jogador.hp, fn.jogador.hp, "inimigo preso não ataca");
  const esp = novoCombate(jog("Espadachim", { nivel: 5 }), V("V001"), 2);
  const foco = resolverRodada(esp, { tipo: "habilidade", id: "h2" }, d(10, 10)).estado;
  assert.equal(foco.jogador.foco, true);
});
t("guarda de elite quebra: perde a vez e o próximo golpe dá +50%", () => {
  const e = novoCombate(jog("Mago", { mp: 200, mp_max: 200, nivel: 14 }), V("V038"), 14);
  assert(e.inimigo.posturaMax > 0);
  e.inimigo.postura = 1;
  const r = resolverRodada(e, { tipo: "magia" }, d(10, 10));
  assert(r.estado.log.some((l) => /guarda de .* se quebra/i.test(l)));
  assert.equal(r.estado.inimigo.vulneravel, true);
  assert.equal(r.estado.jogador.hp, e.jogador.hp);
});
t("eco tem menos vida; juramento e bênçãos aumentam o dano", () => {
  const a = novoCombate(jog(), V("V005"), 8), eco = novoCombate(jog(), V("V005"), 8, { eco: true });
  assert(eco.inimigo.hpMax < a.inimigo.hpMax && /^Eco de/.test(eco.inimigo.nome));
  const b = novoCombate(jog(), V("V005"), 8, { bonusDano: 1.15 });
  const da = a.inimigo.hp - resolverRodada(a, { tipo: "atacar" }, d(10, 10)).estado.inimigo.hp;
  const db = b.inimigo.hp - resolverRodada(b, { tipo: "atacar" }, d(10, 10)).estado.inimigo.hp;
  assert(db > da);
});
t("vitória e derrota encerram a batalha", () => {
  let e = novoCombate(jog("Espadachim", { nivel: 30, atributos: { FOR: 400, DEF: 300, MAG: 5, RES: 300, VEL: 300, SOR: 7 } }), V("V001"), 2);
  assert.equal(resolverRodada(e, { tipo: "atacar" }, d(10)).fim, "vitoria");
  e = novoCombate(jog("Mago", { hp: 1 }), V("V001"), 2);
  assert.equal(resolverRodada(e, { tipo: "atacar" }, d(1, 15)).fim, "derrota");
});
t("XP sobe níveis com crescimento da classe, vida/mana cheias e rank", () => {
  const j = jog("Espadachim");
  const r = aplicarXP(j, XP_PROXIMO(1) + XP_PROXIMO(2) + 5);
  assert.equal(r.nivel, 3); assert.equal(r.xp, 5);
  assert.equal(r.atributos.FOR, j.atributos.FOR + 2 * CLASSES.Espadachim.cresc.FOR);
  assert(r.hp_max > j.hp_max && r.hp === r.hp_max);
  let x = 0; for (let k = 1; k < 10; k++) x += XP_PROXIMO(k);
  const dz = aplicarXP(j, x);
  assert.equal(dz.nivel, 10); assert.equal(dz.rank, "D"); assert.equal(dz.pontos_livres, 3);
  assert.equal(rankDoNivel(95), "SS");
});
t("recompensa: campônio +20% XP; vitória superior detectada", () => {
  const ini = { nivel: 8, tier: "comum" };
  assert.equal(recompensa(jog("Espadachim", { casta: "campones" }), ini, () => 0.5).xp, Math.round(recompensa(jog(), ini, () => 0.5).xp * 1.2));
  assert.equal(recompensa(jog(), ini, () => 0.5).superior, true);
});
t("equipamento soma atributos; ferida tira 10%", () => {
  const eq = bonusEquip([{ item_id: "arma-katana-2", equipado: true }, { item_id: "arm-leve-1", equipado: true }, { item_id: "arma-katana-3", equipado: false }]);
  assert.equal(eq.FOR, item("arma-katana-2").bonus.FOR);
  const j = jog("Espadachim", { efeitos: [{ tipo: "ferida", atributo: "FOR", ate: new Date(Date.now() + 3600e3).toISOString() }] });
  assert(atributosEfetivos(j, Date.now(), eq).FOR < atributosEfetivos(jog("Espadachim"), Date.now(), eq).FOR);
  assert(atributosEfetivos(jog(), Date.now(), eq).FOR > jog().atributos.FOR);
});
t("itens: cada classe tem o que usar; regras de equipar; loja; descrição", () => {
  for (const [classe, p] of Object.entries(EQUIP_CLASSE)) {
    const [arma, arm] = kitInicial(classe);
    assert(item(arma) && item(arm), classe);
    assert.equal(podeEquipar({ classe, nivel: 1 }, item(arma)), null);
    assert(p.armas.length && p.armaduras.length);
  }
  assert.match(podeEquipar({ classe: "Mago", nivel: 50 }, item("arma-katana-1")), /não sabe usar/);
  assert.match(podeEquipar({ classe: "Espadachim", nivel: 1 }, item("arma-katana-3")), /nível 10/);
  assert.equal(podeEquipar({ classe: "Mago", nivel: 60 }, item("excalibur")), null);
  const loja = estoque("simples", { classe: "Mago", nivel: 3 });
  assert(loja.some((i) => i.id === "pocao") && loja.some((i) => i.subtipo === "cajado") && !loja.some((i) => i.subtipo === "katana") && !loja.some((i) => i.id === "elixir"));
  assert(estoque("completa", { classe: "Mago", nivel: 3 }).some((i) => i.id === "elixir"));
  assert.match(efeitoItem(item("pocao")), /35% da vida/);
  assert.match(efeitoItem(item("arma-katana-2")), /FOR \+7.*exige nível 5/);
  assert(todosItens().length > 100);
});
console.log(`${n} testes de combate passaram`);
