// Gera data/viloes.json (com atributos calculados) e os documentos derivados:
//   docs/09-viloes.md, docs/06b-grimorios.md, docs/07-subfases.md
// Também valida referências cruzadas (vilões/grimórios citados nas subfases existem, etc).
//
// Uso: node scripts/gerar-dados.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VILOES, MASCARAS } from "./viloes-fonte.mjs";
import { APARENCIA_VILOES } from "./aparencia-viloes.mjs";
import { TIERS, ARQUETIPOS, atributosVilao } from "./balanceamento.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const lerJSON = (p) => JSON.parse(readFileSync(join(raiz, p), "utf8"));
const APARENCIAS = lerJSON("data/aparencias.json");
const REINO_DA_REGIAO = {};
for (const r of lerJSON("data/reinos.json").reinos) for (const g of r.regioes) REINO_DA_REGIAO[g.nome] = r.id;
// Regiões especiais da história que não estão no mapa como região comum
Object.assign(REINO_DA_REGIAO, { "Esquife dos Quatro Céus": "Eclipse", Kurenai: "Homura", Enjō: "Homura", Kōgyoku: "Daichi" });
const escrever = (p, s) => writeFileSync(join(raiz, p), s);

// ───────────────────────── Balanceamento ─────────────────────────

//                FOR   DEF   MAG   RES   VEL   HP    MP
// ARQUETIPOS e a fórmula de atributos ficam em balanceamento.mjs (o combate escala inimigos com a mesma conta).


function calcular([id, nome, titulo, tier, nivel, regiao, elemento, arquetipo, habilidade, fraqueza, descricao, visual]) {
  const t = TIERS[tier];
  const a = ARQUETIPOS[arquetipo];
  if (!t) throw new Error(`${id}: tier inválido ${tier}`);
  if (!a) throw new Error(`${id}: arquétipo inválido ${arquetipo}`);
  const atributos = atributosVilao(nivel, tier, arquetipo);
  const poder = atributos.FOR + atributos.DEF + atributos.MAG + atributos.RES + atributos.VEL + Math.round(atributos.HP / 10);
    return {
    id, nome, titulo, nome_completo: `${nome}, ${titulo}`,
    tier, tier_rotulo: t.rotulo, nivel, regiao, elemento, arquetipo,
    atributos, poder,
    habilidade, fraqueza, descricao,
    ...(MASCARAS[id] && { mascara: MASCARAS[id] }),
    recompensa: { xp: Math.round(nivel * 15 * t.xp), ouro: Math.round(nivel * 8 * t.xp), amuleto_chance: t.amuleto },
    aparencia: aparenciaDe(id, tier, regiao, visual),
    avatar: { arquivo: `assets/avatares/viloes/${id}.png`, ...(MASCARAS[id] && { mascara: `assets/avatares/viloes/${id}-mascara.png` }) },
  };
}

function aparenciaDe(id, tier, regiao, visual) {
  const [silhueta, marca] = APARENCIA_VILOES[id] ?? [];
  if (!silhueta) throw new Error(`${id}: sem aparência em aparencia-viloes.mjs`);
  const reino = REINO_DA_REGIAO[regiao] ?? "Kokū";
  const destaque = APARENCIAS.viloes_destaque[id] ?? {};
  return {
    descricao_visual_en: visual,
    silhueta: destaque.silhueta ?? silhueta,
    marca_registrada: destaque.marca_registrada ?? marca,
    forma: APARENCIAS.formas_por_reino[reino],
    paleta: destaque.paleta ?? APARENCIAS.paletas_por_reino[reino].map((c) => `${c.hex} ${c.nome}`),
    escala: APARENCIAS.escala_por_tier[tier],
    ...(destaque.evolucao && { evolucao: destaque.evolucao }),
    ...(destaque.nao_parecer && { nao_parecer: destaque.nao_parecer }),
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
Cada vilão tem um **avatar em pixel art** (\`assets/avatares/viloes/\`, gerado pelo criador de avatares — doc 21) e uma carta (\`templates/carta-vilao.html\`).

⚠️ Vilões com **🎭 máscara pública** escondem spoilers: a carta mostrada aos jogadores usa a máscara até o marco
indicado (\`revela_em\`) ser concluído no mundo. Este documento é para o autor/admin — **não compartilhe com jogadores**.

Os **4 reis dos reinos** (Ryūen, Kaishin, Gōtetsu, Sorahiko) **não** estão nesta lista: são NPCs cujo papel
(aliado, rival ou inimigo) será definido pela história do autor.
`;

for (const [k, t] of Object.entries(TIERS)) {
  const lista = viloes.filter((v) => v.tier === k);
  md += `\n---\n\n## ${t.emoji} ${t.rotulo} (${lista.length})\n\n`;
  md += `| Avatar | ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |\n|:---:|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|\n`;
  for (const v of lista) {
    const a = v.atributos;
    md += `| <img src="../${v.avatar.arquivo}" width="64"> | ${v.id} | **${v.nome}** | ${v.nivel} | ${v.regiao} | ${v.elemento} | ${a.HP} | ${a.FOR} | ${a.DEF} | ${a.MAG} | ${a.RES} | ${a.VEL} | ${(rotuloSub[v.id] ?? ["—"]).join(", ")} |\n`;
  }
  md += `\n`;
  for (const v of lista) {
    md += `#### ${v.id} · ${v.nome_completo}\n`;
    md += `*${v.tier_rotulo} · Nv ${v.nivel} · ${v.elemento} · ${v.arquetipo} · ${v.regiao}*  \n`;
    md += `**Habilidade:** ${v.habilidade} · **Fraqueza:** ${v.fraqueza} · **Recompensa:** ${v.recompensa.xp} XP, ${v.recompensa.ouro} ouro${v.recompensa.amuleto_chance ? `, ${Math.round(v.recompensa.amuleto_chance * 100)}% Amuleto` : ""}  \n`;
    md += `**Visual:** silhueta — ${v.aparencia.silhueta}; marca registrada — ${v.aparencia.marca_registrada}  \n`;
    md += `> ${v.descricao}\n\n`;
    if (v.mascara) md += `🎭 **Máscara pública** (até \`${v.mascara.revela_em}\`): ${v.mascara.nome ?? v.nome}, ${v.mascara.titulo} — *${v.mascara.descricao}*\n\n`;
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

// ───────────────────────── docs/18-animais.md ─────────────────────────
const animais = lerJSON("data/animais.json");
const reinosDados = lerJSON("data/reinos.json");
const regiaoReino = {};
for (const r of reinosDados.reinos) for (const g of r.regioes) regiaoReino[g.nome] = r.nome;
const errosAnimais = animais.filter((a) => !regiaoReino[a.regiao]).map((a) => `${a.id}: região inexistente "${a.regiao}"`);
if (errosAnimais.length) {
  console.error("❌ " + errosAnimais.join("\n❌ "));
  process.exit(1);
}
const TIPOS = { pacifico: "🕊️ Pacífico", neutro: "⚖️ Neutro", predador: "🩸 Predador", montaria: "🐎 Montaria", magico: "✨ Mágico", lendario: "🌟 Lendário" };
let ma = `# 18 — Bestiário: os Animais de Yotsuhoshi

> Arquivo **gerado** a partir de \`data/animais.json\`.

Animais **não são vilões**: são a fauna viva do mundo. A IA os usa para dar vida aos cenários, como
**avisos de perigo** (telegrafia — doc 19), como **recursos** (comida, materiais de forja) e como **montarias e
companheiros**. Muitos resolvem problemas para quem é criativo (seguir uma lontra, calar vozes com uma coruja).

- **Domáveis** viram companheiros/montarias (1 montaria + 1 companheiro animal por jogador, além do pet espiritual).
- Matar animais pacíficos sem motivo custa **−5 de Mérito** e pode fechar caminhos (o Cervo-Kodama não guia quem queima árvores).
- Animais **predadores** usam as regras táticas de "besta" (doc 19.4).

| Tipo | Qtd |
|------|:---:|
${Object.entries(TIPOS).map(([k, n]) => `| ${n} | ${animais.filter((a) => a.tipo === k).length} |`).join("\n")}
| **Total** | **${animais.length}** |
`;
for (const r of reinosDados.reinos) {
  const lista = animais.filter((a) => regiaoReino[a.regiao] === r.nome);
  if (!lista.length) continue;
  ma += `\n## ${r.jp} ${r.nome}\n\n| ID | Animal | Região | Tipo | Nv | Comportamento | Uso | Domável |\n|---|---|---|---|:---:|---|---|---|\n`;
  for (const a of lista) {
    ma += `| ${a.id} | **${a.nome}** | ${a.regiao} | ${TIPOS[a.tipo]} | ${a.nivel} | ${a.comportamento} | ${a.uso} | ${a.domavel ? `Sim — ${a.como_domar}` : "Não"} |\n`;
  }
}
escrever("docs/18-animais.md", ma);

console.log(`✔ ${animais.length} animais — regiões válidas`);
console.log(`✔ ${viloes.length} vilões`, contagem);
console.log(`✔ ${grimorios.length} grimórios, ${subfases.length} subfases — referências válidas`);
