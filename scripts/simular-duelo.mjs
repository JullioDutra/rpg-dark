// Simula duelos entre todas as classes (todas contra todas, em 4 faixas de nível) e calibra AJUSTE_DUELO.
// Uso: node scripts/simular-duelo.mjs            → mostra a tabela com o ajuste atual
//      node scripts/simular-duelo.mjs calibrar   → procura os multiplicadores e imprime a tabela nova (cole em src/regras/duelo.mjs)
import { writeFileSync } from "node:fs";
import * as c from "../src/regras/combate.mjs";
import * as I from "../src/regras/itens.mjs";
import * as D from "../src/regras/duelo.mjs";
import { rng as semente } from "../src/avatar/pixel.mjs";
import { XP_PROXIMO } from "./balanceamento.mjs";

const NIVEIS = D.NIVEIS_AJUSTE, N = Number(process.env.N ?? 120), CLASSES = Object.keys(c.CLASSES);
function jogador(classe, nivel, id) {
  const cl = c.CLASSES[classe], mp = Math.round(90 * cl.mult_mp);
  let j = { id, nome: classe, classe, nivel: 1, xp: 0, hp: cl.hp_base, hp_max: cl.hp_base, mp, mp_max: mp, pontos_livres: 0, atributos: cl.base, atributo_magico: "Luz", efeitos: [] };
  let x = 0; for (let k = 1; k < nivel; k++) x += XP_PROXIMO(k);
  if (x) j = c.aplicarXP(j, x);
  const tier = I.NIVEIS_MATERIAL.filter((t) => t.n <= nivel).length, p = I.EQUIP_CLASSE[classe];
  j.equip = I.bonusEquip([{ equipado: true, item_id: `arma-${p.armas[0]}-${tier}` }, { equipado: true, item_id: `arm-${p.armaduras[0]}-${tier}` }]);
  return j;
}
// Duelista "razoável": cura quando precisa, protege-se quando está mal ou de guarda aberta, bate com o mais forte que tiver.
function escolha(e) {
  const j = e.lados[e.vez], o = e.lados[1 - e.vez], m = D.menuDuelo(e).filter((x) => !x.bloqueio);
  const hs = m.filter((x) => x.acao.tipo === "habilidade").map((x) => ({ x, h: c.KITS[j.classe].find((h) => h.id === x.acao.id) }));
  const cura = hs.find(({ h }) => h.tipo === "cura"), guarda = hs.find(({ h }) => h.tipo === "guarda");
  const atq = hs.filter(({ h }) => h.tipo === "fisico" || h.tipo === "magico").sort((a, b) => b.h.poder * (b.h.golpes ?? 1) - a.h.poder * (a.h.golpes ?? 1))[0];
  if (j.hp < j.hpMax * 0.4 && cura) return cura.x;
  if (o.aberto && atq) return atq.x;
  if (guarda && !j.protecaoTurnos && !j.foco && (j.aberto || j.hp < j.hpMax * 0.7)) return guarda.x;
  if (j.aberto && !j.protecaoTurnos) return m[1];
  if (atq) return atq.x;
  if (j.at.MAG > j.at.FOR && m.find((x) => x.acao.tipo === "magia")) return m.find((x) => x.acao.tipo === "magia");
  return m[0];
}
function tabela(rng) {
  const v = Object.fromEntries(CLASSES.map((k) => [k, { total: 0, n: 0, porNivel: {}, contra: {} }]));
  let turnos = 0, lutas = 0;
  for (const nivel of NIVEIS) for (let a = 0; a < CLASSES.length; a++) for (let b = a + 1; b < CLASSES.length; b++) {
    const A = jogador(CLASSES[a], nivel, 1), B = jogador(CLASSES[b], nivel, 2);
    let va = 0;
    for (let n = 0; n < N; n++) {
      let e = D.novoDuelo(A, B, 0), fim = null, k = 0;
      while (!fim && k < 80) { const r = D.agirDuelo(e, escolha(e).acao, rng, 0); e = r.estado; fim = r.fim; k++; }
      if (fim?.vencedor.id === 1) va++;
      turnos += k; lutas++;
    }
    for (const [cl, w, adv] of [[CLASSES[a], va, CLASSES[b]], [CLASSES[b], N - va, CLASSES[a]]]) {
      v[cl].total += w; v[cl].n += N;
      v[cl].porNivel[nivel] = (v[cl].porNivel[nivel] ?? 0) + w;
      v[cl].contra[adv] = (v[cl].contra[adv] ?? 0) + w;
    }
  }
  return { v, turnos: turnos / lutas };
}
const pct = (w, n) => Math.round((100 * w) / n);
if (process.env.MIST) D.DUELO.mistura = Number(process.env.MIST);

if (process.argv[2] === "calibrar") {
  for (let it = 0; it < (process.env.SO_PARES ? 0 : 10); it++) {
    const { v } = tabela(semente(`duelo-cal-${it}`));
    for (const cl of CLASSES) NIVEIS.forEach((n, k) => {
      const wr = v[cl].porNivel[n] / (N * (CLASSES.length - 1));
      D.AJUSTE_DUELO[cl][k] = Math.max(0.5, Math.min(3, D.AJUSTE_DUELO[cl][k] * (1 + 0.7 * (0.5 - wr))));
    });
  }
  // segunda passada: confrontos que continuam fora de 35–65% ganham fôlego extra para o lado fraco
  for (let it = 0; it < 7; it++) {
    const { v } = tabela(semente(`duelo-par-${it}`));
    for (const x of CLASSES) for (const y of CLASSES) if (x !== y) {
      const wr = v[x].contra[y] / (N * NIVEIS.length), k = `${x}|${y}`;
      if (wr < 0.4 || D.PAR_DUELO[k]) D.PAR_DUELO[k] = Math.max(1, Math.min(2.2, (D.PAR_DUELO[k] ?? 1) * (1 + 0.8 * (0.45 - wr))));
    }
  }
  for (const k of Object.keys(D.PAR_DUELO)) if (D.PAR_DUELO[k] < 1.03) delete D.PAR_DUELO[k];
  console.log("export const PAR_DUELO = {\n" + Object.entries(D.PAR_DUELO).map(([k, x]) => `  "${k}": ${x.toFixed(2)},`).join("\n") + "\n};");
  console.log("export const AJUSTE_DUELO = {\n" + CLASSES.map((cl) => `  ${/[^A-Za-z]/.test(cl) ? `"${cl}"` : cl}: [${D.AJUSTE_DUELO[cl].map((x) => x.toFixed(2)).join(", ")}],`).join("\n") + "\n};");
}
const { v, turnos } = tabela(semente("duelo-v1"));
const porNivelN = N * (CLASSES.length - 1);
const md = `# 42b — Duelos entre classes (gerado por \`scripts/simular-duelo.mjs\`)

> Não edite à mão. ${N} duelos por par de classes em cada nível (${NIVEIS.join(", ")}), com o equipamento do nível, mesmo elemento dos dois lados e um duelista "razoável".
> Duração média: **${turnos.toFixed(1)} turnos** somando os dois (${(turnos / 2).toFixed(1)} para cada um).

## Vitórias de cada classe contra o campo
| Classe | Fôlego no duelo (níveis ${NIVEIS.join(", ")}) | Geral | ${NIVEIS.map((n) => `Nível ${n}`).join(" | ")} |
|---|:---:|:---:|${NIVEIS.map(() => ":---:").join("|")}|
${CLASSES.map((cl) => `| ${cl} | ${D.AJUSTE_DUELO[cl].map((x) => `×${x.toFixed(2)}`).join(" · ")} | **${pct(v[cl].total, v[cl].n)}%** | ${NIVEIS.map((n) => `${pct(v[cl].porNivel[n], porNivelN)}%`).join(" | ")} |`).join("\n")}

## Classe da linha contra classe da coluna (% de vitórias da linha, todos os níveis)
| | ${CLASSES.join(" | ")} |
|---|${CLASSES.map(() => ":---:").join("|")}|
${CLASSES.map((a) => `| **${a}** | ${CLASSES.map((b) => (a === b ? "—" : `${pct(v[a].contra[b], N * NIVEIS.length)}%`)).join(" | ")} |`).join("\n")}
`;
writeFileSync(new URL("../docs/42b-duelos-entre-classes.md", import.meta.url), md);
console.log(md);
const pares = CLASSES.flatMap((a) => CLASSES.filter((b) => b !== a).map((b) => [pct(v[a].contra[b], N * NIVEIS.length), a, b])).sort((x, y) => x[0] - y[0]);
console.log("EXTREMOS", pares.slice(0, 5).map((p) => p.join(" ")).join(" | "), "… fora de 35–65:", pares.filter((p) => p[0] < 35).length);
