// Testes das regras do motor (técnicas universais). Uso: node scripts/testar-regras.mjs
import assert from "node:assert/strict";
import { avaliar, podeAvaliar } from "../src/regras/avaliar.mjs";

const base = (o = {}) => ({
  nome: "Kaito", nivel: 20, classe: "Espadachim", rank: "C", reino: "Homura", aldeia: "Haibara", casta: "campones",
  atributo_magico: "Fogo · Cinzas", titulo: "Aprendiz das Cinzas", hp: 300, hp_max: 359, mp: 50, mp_max: 70,
  atributos: { FOR: 103, DEF: 40, MAG: 24, RES: 35, VEL: 76, SOR: 26 }, vigor: 80, tecnicas: ["olho-avaliador"],
  equipamento: { arma: "Katana" }, merito: 120, marcas: [], efeitos: [], ...o,
});
let n = 0;
const t = (nome, fn) => { fn(); n++; console.log("✔", nome); };

t("sem técnica não avalia", () => assert.equal(podeAvaliar(base({ tecnicas: [] })).ok, false));
t("nível baixo não avalia", () => assert.equal(podeAvaliar(base({ nivel: 3 })).ok, false));
t("percepção fraca (MAG+SOR < 20) não avalia", () => assert.equal(podeAvaliar(base({ atributos: { ...base().atributos, MAG: 5, SOR: 8 } })).ok, false));
t("sem vigor não avalia", () => assert.equal(podeAvaliar(base({ vigor: 5 })).ok, false));
t("sem MP não avalia", () => assert.equal(podeAvaliar(base({ mp: 3 })).ok, false));
t("anti-magia usa Vazio no lugar de MP", () => {
  assert.equal(podeAvaliar(base({ classe: "Anti-magia", mp: 0, vazio: 25 })).ok, true);
  assert.equal(podeAvaliar(base({ classe: "Anti-magia", mp: 0, vazio: 5 })).ok, false);
});
const mago = base({ nome: "Aya", classe: "Mago", nivel: 20, atributos: { FOR: 20, DEF: 30, MAG: 100, RES: 60, VEL: 40, SOR: 30 } }); // mesmo nível do alvo
t("mago forte lê um espadachim mais fraco por completo", () => {
  const r = avaliar(mago, base(), () => 10);
  assert.equal(r.nivel, 4); assert.equal(r.card.atributos.FOR, 103); assert.equal(r.alvoPercebe, false);
});
t("ocultar aura reduz o que é revelado", () => {
  const r = avaliar(mago, base({ efeitos: ["ocultar-aura"] }), () => 10);
  assert.ok(r.nivel < 4); assert.equal(r.card.atributos.FOR, null);
});
t("leitor fraco contra alvo forte: aura turva, alvo percebe e descobre quem foi", () => {
  const fraco = base({ nivel: 6, atributos: { FOR: 20, DEF: 10, MAG: 12, RES: 10, VEL: 15, SOR: 10 } });
  const forte = base({ nivel: 60, atributos: { FOR: 300, DEF: 120, MAG: 80, RES: 150, VEL: 200, SOR: 60 } });
  const r = avaliar(fraco, forte, () => 1);
  assert.equal(r.nivel, 0); assert.equal(r.card.nivel, null); assert.equal(r.alvoDescobreQuem, true);
});
t("nível intermediário mostra faixas, não números exatos", () => {
  const leitor = base({ nivel: 20, atributos: { FOR: 50, DEF: 30, MAG: 60, RES: 30, VEL: 40, SOR: 30 } });
  const r = avaliar(leitor, base(), () => 18);
  assert.ok([2, 3].includes(r.nivel)); assert.equal(r.card.atributos.FOR, null); assert.ok(r.card.faixas.hp.includes("–"));
});
t("nunca revela segredos (corrupção, pactos, ovo)", () => {
  const r = avaliar(mago, base({ corrupcao: 60, portadorOvo: true, pactos: ["Traição"] }), () => 20);
  for (const k of ["corrupcao", "portadorOvo", "pactos", "chaves", "faccao"]) assert.equal(r.card[k], undefined);
});
t("custo cobrado: 15 vigor + 10 MP", () => assert.deepEqual(avaliar(mago, base(), () => 10).custo, { vigor: 15, mp: 10 }));
console.log(`${n} testes de regras passaram`);
