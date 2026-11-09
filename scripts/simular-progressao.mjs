// Simulador de balanceamento: jogador (por classe e nível) × vilão típico do mesmo nível.
// Usa as MESMAS fórmulas dos docs 08/09/22. Gera docs/22b-balanceamento.md.
// Uso: node scripts/simular-progressao.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TIERS as T, XP_PROXIMO, XP_DIA, dano, ESCALA_PARTY } from "./balanceamento.mjs";
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const classes = JSON.parse(readFileSync(join(raiz, "data/classes.json"), "utf8")).classes;

// ── Regras de progressão (doc 22, seção 22.9) ──
const PONTOS_LIVRES_POR_10 = 3;
const EQUIP = (n) => ({ arma: Math.round(n * 1.1), armadura: Math.round(n * 0.7) }); // equipamento médio da faixa
const MAESTRIA = (n) => Math.round(n * 0.25); // ganho por uso (atributo mais usado), teto 25 no nv 100

export function jogador(classe, n) {
  const c = classes[classe];
  const s = {};
  for (const a of Object.keys(c.base)) s[a] = c.base[a] + c.cresc[a] * (n - 1);
  const principal = c.base.MAG > c.base.FOR ? "MAG" : "FOR";
  s[principal] += Math.floor(n / 10) * PONTOS_LIVRES_POR_10 + MAESTRIA(n) + EQUIP(n).arma;
  s.DEF += EQUIP(n).armadura;
  s.RES += Math.round(EQUIP(n).armadura * 0.7);
  s.HP = c.hp_base + Array.from({ length: n - 1 }, (_, i) => 8 + Math.floor((c.base.DEF + c.cresc.DEF * i) / 4)).reduce((a, b) => a + b, 0) + EQUIP(n).armadura * 2;
  s.principal = principal;
  return s;
}

// Mesma fórmula do gerador de vilões (scripts/gerar-dados.mjs), arquétipo "equilibrado"
export function vilao(tier, n) {
  const { stat: st, hp } = T[tier];
  const base = 5 + n * 1.2;
  return { FOR: Math.round(base * st * 1.1), MAG: Math.round(base * st), DEF: Math.round(base * st), RES: Math.round(base * st), HP: Math.round(((60 + n * 20) * hp) / 5) * 5 };
}


const niveis = [1, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const tierDoNivel = (n) => (n <= 14 ? ["comum"] : n <= 20 ? ["comum", "medio"] : n <= 32 ? ["medio"] : n <= 58 ? ["medio", "alto"] : n <= 85 ? ["alto", "rei"] : ["rei", "divindade"]);

let md = `# 22b — Balanceamento (gerado por \`scripts/simular-progressao.mjs\`)

> Não edite à mão. Mude as regras no script e rode de novo.
> **Golpes p/ vencer** = ataques básicos de 1 jogador para derrubar o vilão (sem habilidades, sem crítico).
> **Party 4** = rodadas para uma party de 4 jogadores iguais vencer usando habilidades (×1,6 de média), com o HP do
> vilão escalado por \`0,6 + 0,4 × 4 = 2,2\` (regra do modo difícil, doc 19).
> **Golpes p/ cair** = ataques básicos do vilão para derrubar 1 jogador.

## Curva de XP

| Nível | XP para o próximo | XP acumulado |
|:---:|---:|---:|
`;
let acum = 0;
const acumulado = {};
for (let n = 1; n <= 100; n++) { acumulado[n] = acum; acum += XP_PROXIMO(n); }
let dias = 0;
const diasAte = {};
for (let n = 1; n <= 100; n++) { diasAte[n] = dias; dias += XP_PROXIMO(n) / XP_DIA(n); }
md = md.replace("| Nível | XP para o próximo | XP acumulado |\n|:---:|---:|---:|", "| Nível | XP para o próximo | XP acumulado | Dias de jogo (ritmo normal) |\n|:---:|---:|---:|:---:|");
for (const n of niveis) md += `| ${n} | ${XP_PROXIMO(n).toLocaleString("pt-BR")} | ${acumulado[n].toLocaleString("pt-BR")} | ${Math.round(diasAte[n])} |\n`;
md += `\n**Ritmo normal** = por dia, 8 lutas de encontro + meia subfase + parte de um marco de história (~30–40 min de jogo
espalhados no dia). Jogadores mais ativos avançam mais rápido até o limite do Vigor (doc 22.4).
Campanha completa ≈ **${Math.round(dias)} dias** (~${Math.round(dias / 30)} meses) para chegar ao nível 100.\n`;

for (const classe of ["Espadachim", "Mago", "Cavaleiro", "Anti-magia"]) {
  md += `\n## ${classe}\n\n| Nv | HP | Atq principal | DEF | RES | Vilão | HP vilão | Golpes p/ vencer | Party 4 (rodadas) | Golpes p/ cair |\n|:---:|---:|---:|---:|---:|---|---:|:---:|:---:|:---:|\n`;
  for (const n of niveis) {
    const j = jogador(classe, n);
    for (const tier of tierDoNivel(n)) {
      const v = vilao(tier, n);
      const meu = dano(j[j.principal], n, j.principal === "MAG" ? v.RES : v.DEF);
      const golpes = Math.ceil(v.HP / meu);
      const party = Math.ceil((v.HP * ESCALA_PARTY(4)) / (meu * 1.6 * 4));
      const deles = Math.max(dano(v.FOR, n, j.DEF), dano(v.MAG, n, j.RES) * 0.9);
      const cair = Math.ceil(j.HP / deles);
      md += `| ${n} | ${j.HP} | ${j[j.principal]} ${j.principal} | ${j.DEF} | ${j.RES} | ${tier} | ${v.HP.toLocaleString("pt-BR")} | ${golpes} | ${party} | ${cair} |\n`;
    }
  }
}

md += `
## Leitura (metas de design)

| Situação | Meta | Por quê |
|----------|------|---------|
| Vilão comum, solo | 3–6 golpes para vencer, 5–10 para cair | Luta rápida (2–4 mensagens), mas com risco real se o jogador ignorar a cura |
| Médio escalão, solo | 5–8 golpes; o jogador cai em 4–8 | Exige habilidades e itens; a party é recomendada |
| Alto escalão, party de 4 | 4–7 rodadas | Uma luta de chefe dura ~10–15 min no grupo |
| Nível rei, party de 4 | 8–14 rodadas, com fases | O evento da semana; precisa de Postura quebrada e combos |
| Divindade, party de 4–5 | 12–20 rodadas | Clímax do Ato IV; só vence quem usa estratégia |

Se uma linha sair muito fora da meta, ajuste \`EQUIP\`, \`MAESTRIA\` ou os multiplicadores de tier e rode de novo.
`;
writeFileSync(join(raiz, "docs/22b-balanceamento.md"), md);
console.log("✔ docs/22b-balanceamento.md");
