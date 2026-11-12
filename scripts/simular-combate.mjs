// Simula milhares de lutas com as regras reais (dado d20, habilidades, equipamento da faixa) e grava
// data/equilibrio.json + a seção de tabelas do doc 35. Uso: node scripts/simular-combate.mjs
import { readFileSync, writeFileSync } from "node:fs";
import * as c from "../src/regras/combate.mjs";
import * as I from "../src/regras/itens.mjs";
import { rng as semente } from "../src/avatar/pixel.mjs";
import { XP_PROXIMO } from "./balanceamento.mjs";

const V = JSON.parse(readFileSync(new URL("../data/viloes.json", import.meta.url)));
const N = 400;
export const CASOS = [
  { id: "lacaio", rotulo: "Lacaio (explorando)", vilao: "V001", nivelJ: 5, nivelV: 5, lacaio: true },
  { id: "comum", rotulo: "Vilão comum, no covil", vilao: "V005", nivelJ: 8, nivelV: 8 },
  { id: "comum+3", rotulo: "Vilão comum 3 níveis acima", vilao: "V005", nivelJ: 5, nivelV: 8 },
  { id: "elite", rotulo: "Elite (médio escalão)", vilao: "V036", nivelJ: 20, nivelV: 20 },
  { id: "chefe", rotulo: "Chefe (alto escalão)", vilao: "V063", nivelJ: 45, nivelV: 45 },
  { id: "rei", rotulo: "Rei das sombras", vilao: "V091", nivelJ: 85, nivelV: 85 },
  { id: "divindade", rotulo: "Divindade, sem preparo", vilao: "V093", nivelJ: 90, nivelV: 88 },
  // Só com o que a campanha dá a todos (bênçãos dos 4 reinos e do ninho, +30%) e o pet
  { id: "divindade-bencaos", rotulo: "Divindade, só com as bênçãos da campanha", vilao: "V093", nivelJ: 90, nivelV: 88, bencaos: true },
  // Preparado para o fim: bênçãos dos 4 reinos e do ninho (+30%), 3 apoios do grupo (+30%), pet, Excalibur e Kokūgai
  { id: "divindade-pronto", rotulo: "Divindade, preparado para o fim", vilao: "V093", nivelJ: 90, nivelV: 88, preparado: true },
  { id: "final-pronto", rotulo: "Rei do Eclipse, preparado", vilao: "V100", nivelJ: 100, nivelV: 100, preparado: true, reis: true },
];

function jogador(classe, nivel) {
  const cl = c.CLASSES[classe], mp = Math.round(90 * cl.mult_mp);
  let j = { id: 1, nome: "T", classe, nivel: 1, xp: 0, hp: cl.hp_base, hp_max: cl.hp_base, mp, mp_max: mp, pontos_livres: 0, atributos: cl.base, atributo_magico: "Luz", efeitos: [] };
  let x = 0; for (let k = 1; k < nivel; k++) x += XP_PROXIMO(k);
  if (x) j = c.aplicarXP(j, x);
  const tier = I.NIVEIS_MATERIAL.filter((t) => t.n <= nivel).length, p = I.EQUIP_CLASSE[classe];
  return { j, equip: I.bonusEquip([{ equipado: true, item_id: `arma-${p.armas[0]}-${tier}` }, { equipado: true, item_id: `arm-${p.armaduras[0]}-${tier}` }]) };
}
// Jogador "razoável": cura quando precisa, protege-se no golpe forte, usa a habilidade de dano mais forte disponível.
function escolha(e, classe) {
  const J = e.jogador, m = c.menu(e).filter((x) => !x.bloqueio);
  const hs = m.filter((x) => x.acao.tipo === "habilidade").map((x) => ({ x, h: c.KITS[classe].find((h) => h.id === x.acao.id) }));
  const cura = hs.find(({ h }) => h.tipo === "cura"), guarda = hs.find(({ h }) => h.tipo === "guarda");
  const atq = hs.filter(({ h }) => h.tipo === "fisico" || h.tipo === "magico").sort((a, b) => b.h.poder * (b.h.golpes ?? 1) - a.h.poder * (a.h.golpes ?? 1))[0];
  if (J.hp < J.hpMax * 0.35 && cura) return cura.x;
  if (J.hp < J.hpMax * 0.3 && m.find((x) => x.acao.id === "elixir")) return m.find((x) => x.acao.id === "elixir");
  if (J.hp < J.hpMax * 0.3 && m.find((x) => x.acao.id === "pocao")) return m.find((x) => x.acao.id === "pocao");
  if (guarda && !J.protecaoRodadas && (e.preparando || J.hp < J.hpMax * 0.75)) return guarda.x;
  if (e.preparando && !J.protecaoRodadas) return m[1];
  if (atq) return atq.x;
  if (J.at.MAG > J.at.FOR && m.find((x) => x.acao.tipo === "magia")) return m.find((x) => x.acao.tipo === "magia");
  return m[0];
}
export function simular(caso, classe, rng) {
  const alvo = V.find((x) => x.id === caso.vilao), base = jogador(classe, caso.nivelJ), j = base.j;
  const equip = { ...base.equip };
  if (caso.preparado) for (const id of ["excalibur", "kokugai", "tenmon"]) for (const [k, v] of Object.entries(I.item(id).bonus)) equip[k] = Math.max(equip[k] ?? 0, 0) + v;
  const extra = caso.bencaos ? { bonusDano: 1.3, pet: { nome: "pet", estagio: 2 } } : caso.preparado ? { bonusDano: (1.3 + (caso.reis ? 0.15 : 0)) * 1.3, pet: { nome: "pet", estagio: 3 } } : {};
  let vit = 0, rod = 0;
  for (let n = 0; n < N; n++) {
    let e = c.novoCombate(j, caso.lacaio ? { ...alvo, tier: "comum" } : alvo, caso.nivelV, { equip, itens: { pocao: 3, elixir: caso.preparado ? 2 : 0 }, ...extra }), fim = null, k = 0;
    while (!fim && k < 80) { const r = c.resolverRodada(e, escolha(e, classe).acao, rng); e = r.estado; fim = r.fim; k++; }
    if (fim === "vitoria") vit++;
    rod += k;
  }
  return { vitoria: Math.round((100 * vit) / N), rodadas: Math.round(rod / N) };
}

/** Probabilidade de cada faixa do dado para um bônus (0 a 3) e o multiplicador médio de dano. */
export function matematicaDoDado(bonus = 0) {
  const p = { falha: 0, fraco: 0, normal: 0, forte: 0, critico: 0 };
  for (let nat = 1; nat <= 20; nat++) p[c.rolar(() => (nat - 0.5) / 20, bonus).faixa] += 5;
  const media = Object.entries(p).reduce((s, [k, v]) => s + (v / 100) * c.FAIXAS[k].mult, 0);
  return { ...p, media: Math.round(media * 100) / 100 };
}

if (process.argv[1]?.endsWith("simular-combate.mjs")) {
  const rng = semente("equilibrio-v2");
  const classes = Object.keys(c.CLASSES);
  const tabela = Object.fromEntries(CASOS.map((caso) => [caso.id, Object.fromEntries(classes.map((cl) => [cl, simular(caso, cl, rng)]))]));
  const dado = [0, 1, 2, 3].map(matematicaDoDado);
  writeFileSync(new URL("../data/equilibrio.json", import.meta.url), JSON.stringify({ lutasPorCaso: N, casos: CASOS, classes, tabela, dado }, null, 1) + "\n");
  const linha = (caso) => `| ${caso.rotulo} | ${caso.nivelJ} × ${caso.nivelV} | ${classes.map((cl) => `${tabela[caso.id][cl].vitoria}% (${tabela[caso.id][cl].rodadas}r)`).join(" | ")} |`;
  const md = `| Situação | Nível (você × ele) | ${classes.join(" | ")} |\n|---|:---:|${classes.map(() => ":---:").join("|")}|\n${CASOS.map(linha).join("\n")}\n`;
  writeFileSync(new URL("../docs/35b-tabela-equilibrio.md", import.meta.url), `# 35b — Tabela de equilíbrio (gerada por \`scripts/simular-combate.mjs\`)\n\n> Não edite à mão. ${N} lutas por célula, jogador "razoável" (cura quando precisa, defende o golpe forte, usa a melhor habilidade), com o equipamento do nível e 3 poções.\n> Cada célula: **% de vitórias (rodadas em média)**.\n\n${md}`);
  console.log(md);
}
