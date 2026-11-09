// Gera data/viloes.json (com atributos calculados) e os documentos derivados:
//   docs/09-viloes.md, docs/06b-grimorios.md, docs/07-subfases.md
// Também valida referências cruzadas (vilões/grimórios citados nas subfases existem, etc).
//
// Uso: node scripts/gerar-dados.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VILOES } from "./viloes-fonte.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const lerJSON = (p) => JSON.parse(readFileSync(join(raiz, p), "utf8"));
const escrever = (p, s) => writeFileSync(join(raiz, p), s);

// ───────────────────────── Balanceamento ─────────────────────────
export const TIERS = {
  comum:     { rotulo: "Nível Comum",   emoji: "⚪", stat: 1.0,  hp: 1.0,  xp: 1,  amuleto: 0,    nivel: [1, 20] },
  medio:     { rotulo: "Médio Escalão", emoji: "🟢", stat: 1.2,  hp: 1.6,  xp: 2.5, amuleto: 0.01, nivel: [14, 32] },
  alto:      { rotulo: "Alto Escalão",  emoji: "🔵", stat: 1.45, hp: 2.6,  xp: 6,  amuleto: 0.03, nivel: [32, 58] },
  rei:       { rotulo: "Nível Rei",     emoji: "🟣", stat: 1.8,  hp: 5.0,  xp: 15, amuleto: 0.10, nivel: [65, 85] },
  divindade: { rotulo: "Divindade",     emoji: "🟡", stat: 2.4,  hp: 10.0, xp: 40, amuleto: 0.25, nivel: [88, 100] },
};

//                FOR   DEF   MAG   RES   VEL   HP    MP
const ARQUETIPOS = {
  bruto:       [1.4,  1.2,  0.5,  0.7,  0.8,  1.3,  0.5],
  tanque:      [1.0,  1.6,  0.6,  1.2,  0.6,  1.6,  0.6],
  assassino:   [1.3,  0.7,  0.7,  0.7,  1.6,  0.85, 0.7],
  mago:        [0.5,  0.7,  1.6,  1.3,  0.9,  0.8,  1.6],
  invocador:   [0.6,  0.8,  1.4,  1.2,  0.8,  0.9,  1.5],
  equilibrado: [1.1,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
  besta:       [1.3,  1.0,  0.6,  0.8,  1.2,  1.2,  0.5],
  "morto-vivo":[1.0,  1.1,  0.9,  0.6,  0.7,  1.1,  0.8],
  espiritual:  [0.8,  0.9,  1.3,  1.3,  1.1,  1.0,  1.3],
  divino:      [1.3,  1.3,  1.3,  1.3,  1.1,  1.2,  1.5],
};

const ELEMENTO_EN = {
  Fogo: "fire", Água: "water", Terra: "earth", Vento: "wind", Trevas: "darkness", Luz: "holy light",
  Gelo: "ice", Raio: "lightning", Veneno: "poison", Som: "sound wave", Madeira: "wood and vines",
  Natureza: "nature", Cristal: "crystal", Metal: "metal", Vazio: "void black-white", Cinzas: "ash",
  Lava: "lava", Espelho: "mirror shards", Explosão: "explosive", Alma: "soul", Tempo: "time clock",
  Espaço: "space portal", Sangue: "blood",
};

function calcular([id, nome, titulo, tier, nivel, regiao, elemento, arquetipo, habilidade, fraqueza, descricao, visual]) {
  const t = TIERS[tier];
  const a = ARQUETIPOS[arquetipo];
  if (!t) throw new Error(`${id}: tier inválido ${tier}`);
  if (!a) throw new Error(`${id}: arquétipo inválido ${arquetipo}`);
  const base = 5 + nivel * 1.2;
  const s = (i) => Math.round(base * t.stat * a[i]);
  const atributos = {
    HP: Math.round(((60 + nivel * 20) * t.hp * a[5]) / 5) * 5,
    MP: Math.round((20 + nivel * 6) * t.stat * a[6]),
    FOR: s(0), DEF: s(1), MAG: s(2), RES: s(3), VEL: s(4),
  };
  const poder = atributos.FOR + atributos.DEF + atributos.MAG + atributos.RES + atributos.VEL + Math.round(atributos.HP / 10);
  const el = ELEMENTO_EN[elemento] ?? elemento;
  return {
    id, nome, titulo, nome_completo: `${nome}, ${titulo}`,
    tier, tier_rotulo: t.rotulo, nivel, regiao, elemento, arquetipo,
    atributos, poder,
    habilidade, fraqueza, descricao,
    recompensa: { xp: Math.round(nivel * 15 * t.xp), ouro: Math.round(nivel * 8 * t.xp), amuleto_chance: t.amuleto },
    imagem: {
      arquivo: `assets/viloes/${id}.png`,
      prompt: `anime style dark fantasy villain character portrait, ${visual}, ${el} elemental aura, dramatic rim lighting, cel shading, highly detailed, upper body, centered composition, dark atmospheric background, masterpiece`,
      negative_prompt: "text, watermark, logo, blurry, extra limbs, deformed hands, low quality, photo, realistic",
    },
  };
}

const viloes = VILOES.map(calcular);

// ───────────────────────── Validações ─────────────────────────
const erros = [];
const ids = new Set();
for (const v of viloes) {
  if (ids.has(v.id)) erros.push(`ID duplicado: ${v.id}`);
  ids.add(v.id);
  const [min, max] = TIERS[v.tier].nivel;
  if (v.nivel < min || v.nivel > max) erros.push(`${v.id} nível ${v.nivel} fora da faixa do tier ${v.tier} (${min}-${max})`);
}
const contagem = Object.fromEntries(Object.keys(TIERS).map((k) => [k, viloes.filter((v) => v.tier === k).length]));
if (viloes.length !== 100) erros.push(`Esperado 100 vilões, há ${viloes.length}`);

const grimorios = lerJSON("data/grimorios.json");
const subfases = lerJSON("data/subfases.json");
const idsSub = new Set(subfases.map((s) => s.id));
const idsGrim = new Set(grimorios.map((g) => g.id));
for (const s of subfases) {
  for (const c of [s.chefe].flat().concat(s.inimigos)) if (!ids.has(c)) erros.push(`${s.id}: vilão inexistente ${c}`);
  for (const g of s.grimorios) if (!idsGrim.has(g)) erros.push(`${s.id}: grimório inexistente ${g}`);
}
for (const g of grimorios) {
  const sub = g.onde.split(" ")[0];
  if (!idsSub.has(sub)) erros.push(`${g.id}: subfase inexistente ${g.onde}`);
  else if (!subfases.find((s) => s.id === sub).grimorios.includes(g.id)) erros.push(`${g.id}: subfase ${sub} não lista este grimório`);
}
if (erros.length) {
  console.error("❌ Erros de validação:\n - " + erros.join("\n - "));
  process.exit(1);
}

escrever("data/viloes.json", JSON.stringify(viloes, null, 2) + "\n");

// ───────────────────────── docs/09-viloes.md ─────────────────────────
const nomeVilao = Object.fromEntries(viloes.map((v) => [v.id, v.nome]));
const rotuloSub = {};
for (const s of subfases) for (const c of [s.chefe].flat()) (rotuloSub[c] ??= []).push(s.id);

let md = `# 09 — Os 100 Vilões

> Arquivo **gerado** por \`scripts/gerar-dados.mjs\` a partir de \`scripts/viloes-fonte.mjs\`. Não edite à mão.
> Atributos são calculados por fórmula (tier × nível × arquétipo) para manter o balanceamento.

| Tier | Qtd | Faixa de nível | Multiplicador de atributos | Multiplicador de HP | Chance de Amuleto |
|------|:---:|:---:|:---:|:---:|:---:|
${Object.entries(TIERS).map(([k, t]) => `| ${t.emoji} ${t.rotulo} | ${contagem[k]} | ${t.nivel[0]}–${t.nivel[1]} | ×${t.stat} | ×${t.hp} | ${Math.round(t.amuleto * 100)}% |`).join("\n")}
| **Total** | **${viloes.length}** | | | | |

**Fórmulas:** \`base = 5 + nível×1,2\` · \`atributo = base × mult_tier × peso_arquétipo\` ·
\`HP = (60 + nível×20) × mult_HP_tier × peso_HP\` · \`XP = nível × 15 × mult_xp\`.
Cada vilão tem uma carta gerada a partir de \`templates/carta-vilao.html\` e um prompt de imagem em \`data/viloes.json\`.

Os **4 reis dos reinos** (Ryūen, Kaishin, Gōtetsu, Sorahiko) **não** estão nesta lista: são NPCs cujo papel
(aliado, rival ou inimigo) será definido pela história do autor.
`;

for (const [k, t] of Object.entries(TIERS)) {
  const lista = viloes.filter((v) => v.tier === k);
  md += `\n---\n\n## ${t.emoji} ${t.rotulo} (${lista.length})\n\n`;
  md += `| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |\n|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|\n`;
  for (const v of lista) {
    const a = v.atributos;
    md += `| ${v.id} | **${v.nome}** | ${v.nivel} | ${v.regiao} | ${v.elemento} | ${a.HP} | ${a.FOR} | ${a.DEF} | ${a.MAG} | ${a.RES} | ${a.VEL} | ${(rotuloSub[v.id] ?? ["—"]).join(", ")} |\n`;
  }
  md += `\n`;
  for (const v of lista) {
    md += `#### ${v.id} · ${v.nome_completo}\n`;
    md += `*${v.tier_rotulo} · Nv ${v.nivel} · ${v.elemento} · ${v.arquetipo} · ${v.regiao}*  \n`;
    md += `**Habilidade:** ${v.habilidade} · **Fraqueza:** ${v.fraqueza} · **Recompensa:** ${v.recompensa.xp} XP, ${v.recompensa.ouro} ouro${v.recompensa.amuleto_chance ? `, ${Math.round(v.recompensa.amuleto_chance * 100)}% Amuleto` : ""}  \n`;
    md += `> ${v.descricao}\n\n`;
  }
}
escrever("docs/09-viloes.md", md);

// ───────────────────────── docs/06b-grimorios.md ─────────────────────────
const ranks = ["E", "D", "C", "B", "A", "S"];
let mg = `# 06b — Os 40 Grimórios Simples

> Arquivo **gerado** a partir de \`data/grimorios.json\`. Regras de uso em [06-itens-lendarios.md](06-itens-lendarios.md).

| Rank | Quantidade |
|:---:|:---:|
${ranks.map((r) => `| ${r} | ${grimorios.filter((g) => g.rank === r).length} |`).join("\n")}
| **Total** | **${grimorios.length}** |
`;
for (const r of ranks) {
  mg += `\n## Rank ${r}\n\n`;
  for (const g of grimorios.filter((x) => x.rank === r)) {
    const sub = subfases.find((s) => s.id === g.onde.split(" ")[0]);
    mg += `### ${g.id} · ${g.nome}\n*${g.elemento} · Classes: ${g.classes.join(", ")} · Onde: ${g.onde} — ${sub.nome}*\n\n`;
    mg += g.magias.map((m, i) => `${i + 1}. ${m}`).join("\n") + "\n\n";
  }
}
escrever("docs/06b-grimorios.md", mg);

// ───────────────────────── docs/07-subfases.md ─────────────────────────
const nomeGrim = Object.fromEntries(grimorios.map((g) => [g.id, g.nome]));
const reinosOrdem = [["Homura", "焔 Homura-koku"], ["Watatsumi", "水 Watatsumi-koku"], ["Daichi", "土 Daichi-koku"], ["Fūjin", "風 Fūjin-koku"], ["Kokū", "虚空 Kokū — Terra Central"]];
let ms = `# 07 — Subfases e Masmorras

> Arquivo **gerado** a partir de \`data/subfases.json\`.

Subfases são áreas instanciadas dentro das regiões: masmorras, arenas, labirintos, provações e santuários.
São descobertas por **exploração** (comando \`!explorar\`), por **pistas da IA narradora**, por **itens** ou por
**marcos da história**. Cada subfase tem:

- **Faixa de nível** recomendada (entrar abaixo é permitido, mas arriscado).
- **Mecânica única** — nenhuma subfase joga igual à outra.
- **Chefe** (dos 100 vilões) e inimigos comuns.
- **Grimório(s) simples** como recompensa garantida na 1ª vitória de cada jogador.
- **Chance de Amuleto da Perdição** e um **segredo** (gancho narrativo para a IA usar).
- Podem ser feitas **solo** ou em **party de até 5** (\`!party\`).
- Subfases **[LENDÁRIA]** guardam os Grandes Itens: o primeiro a vencer leva; as seguintes vitórias dão só XP/ouro.

**Tipos:** masmorra · arena · labirinto · enigma · investigação · provação · santuário · treino · horda · chefe · evento · lendária · torre

| Reino | Qtd |
|---|:---:|
${reinosOrdem.map(([k, n]) => `| ${n} | ${subfases.filter((s) => s.reino === k).length} |`).join("\n")}
| **Total** | **${subfases.length}** |
`;
for (const [k, n] of reinosOrdem) {
  ms += `\n---\n\n## ${n}\n\n`;
  for (const s of subfases.filter((x) => x.reino === k)) {
    const chefes = [s.chefe].flat().map((c) => `${c} ${nomeVilao[c]}`).join(", ");
    ms += `### ${s.id} · ${s.nome}\n`;
    ms += `*${s.regiao} · ${s.tipo} · Nível ${s.nivel}*\n\n`;
    ms += `${s.descricao}\n\n`;
    ms += `- **Mecânica:** ${s.mecanica}\n`;
    ms += `- **Chefe:** ${chefes}\n`;
    if (s.inimigos.length) ms += `- **Inimigos:** ${s.inimigos.map((c) => `${c} ${nomeVilao[c]}`).join(", ")}\n`;
    if (s.grimorios.length) ms += `- **Grimórios:** ${s.grimorios.map((g) => `${g} ${nomeGrim[g]}`).join(", ")}\n`;
    if (s.lendario) ms += `- **⭐ Item lendário:** ${s.lendario}\n`;
    if (s.amuleto_chance) ms += `- **Amuleto da Perdição:** ${Math.round(s.amuleto_chance * 100)}% por vitória\n`;
    if (s.segredo && s.segredo !== "—") ms += `- **Segredo:** ${s.segredo}\n`;
    ms += `\n`;
  }
}
escrever("docs/07-subfases.md", ms);

console.log(`✔ ${viloes.length} vilões`, contagem);
console.log(`✔ ${grimorios.length} grimórios, ${subfases.length} subfases — referências válidas`);
