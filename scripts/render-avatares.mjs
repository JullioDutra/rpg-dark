// Renderiza todos os avatares em pixel art para assets/avatares/ e as galerias em docs/img/.
// Uso: node scripts/render-avatares.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { montar } from "../src/avatar/index.mjs";
import { Tela } from "../src/avatar/pixel.mjs";
import { DNA_VILOES, DNA_MASCARA, DNA_NPCS, dnaJogador } from "../src/avatar/dna.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => JSON.parse(readFileSync(join(raiz, p), "utf8"));
const out = (p) => { const f = join(raiz, p); mkdirSync(dirname(f), { recursive: true }); return f; };

const reinoDaRegiao = {};
for (const r of ler("data/reinos.json").reinos) for (const g of r.regioes) reinoDaRegiao[g.nome] = r.id;

const ESCALA = 8; // 64 px → 512 px

function galeria(telas, colunas, arquivo, escala = 3) {
  const linhas = Math.ceil(telas.length / colunas);
  const G = new Tela(colunas * 66 + 2, linhas * 66 + 2);
  for (let i = 0; i < G.px.length; i++) G.px[i] = "#0b0910";
  telas.forEach((t, i) => {
    const ox = 2 + (i % colunas) * 66, oy = 2 + Math.floor(i / colunas) * 66;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) G.set(ox + x, oy + y, t.get(x, y));
  });
  writeFileSync(out(arquivo), G.png(escala));
}

// Vilões
const viloes = ler("data/viloes.json");
const telasViloes = [];
const indice = {};
for (const v of viloes) {
  const dna = { id: v.id, elemento: v.elemento, reino: reinoDaRegiao[v.regiao] ?? "Kokū", brilhoAura: ["rei", "divindade"].includes(v.tier), ...DNA_VILOES[v.id] };
  if (!DNA_VILOES[v.id]) throw new Error(`sem DNA: ${v.id}`);
  const t = montar(dna);
  telasViloes.push(t);
  writeFileSync(out(`assets/avatares/viloes/${v.id}.png`), t.png(ESCALA));
  indice[v.id] = { arquivo: `assets/avatares/viloes/${v.id}.png`, dna };
  if (DNA_MASCARA[v.id]) {
    const dm = { ...dna, ...DNA_MASCARA[v.id], id: v.id + "-m" };
    writeFileSync(out(`assets/avatares/viloes/${v.id}-mascara.png`), montar(dm).png(ESCALA));
    indice[v.id].mascara = `assets/avatares/viloes/${v.id}-mascara.png`;
  }
}
galeria(telasViloes.slice(0, 35), 7, "docs/img/galeria-viloes-comuns.png");
galeria(telasViloes.slice(35, 60), 5, "docs/img/galeria-viloes-medio.png");
galeria(telasViloes.slice(60, 80), 5, "docs/img/galeria-viloes-alto.png");
galeria(telasViloes.slice(80, 100), 5, "docs/img/galeria-viloes-rei-divindade.png");

// NPCs
const telasNpcs = [];
for (const [id, dna] of Object.entries(DNA_NPCS)) {
  const t = montar({ id, ...dna });
  telasNpcs.push(t);
  writeFileSync(out(`assets/avatares/npcs/${id}.png`), t.png(ESCALA));
  indice[id] = { arquivo: `assets/avatares/npcs/${id}.png`, dna };
}
galeria(telasNpcs, 7, "docs/img/galeria-npcs.png", 4);

// Jogadores de exemplo: 9 classes × 4 reinos, com escolhas variadas (como faria um jogador no criador)
const classes = ["Mago", "Cavaleiro", "Bruxo", "Anti-magia", "Espadachim", "Meio-humano", "Força da Natureza", "Demônio", "Paladino"];
const reinos = [["Homura", "Fogo"], ["Watatsumi", "Água"], ["Daichi", "Terra"], ["Fūjin", "Vento"]];
const peles = ["clara", "media", "morena", "escura"];
const cabelos = ["baguncado", "longo", "rabo", "espetado", "chanel", "franja-longa", "coque", "trancas", "meio-raspado"];
const cores = ["preto", "ruivo", "azul", "branco", "castanho", "verde-agua", "loiro", "rosa", "roxo"];
const olhos = ["grande", "afiado", "redondo", "cansado"];
const corOlhos = ["ambar", "azul", "verde", "vermelho", "roxo", "dourado"];
const marcas = [null, "cicatriz", "sardas", "tapa-olho", "bandana", "oculos", "rubor", "pena", "curativo"];
const telasJog = [];
let n = 0;
for (const classe of classes)
  for (const [reino, elemento] of reinos) {
    const id = `J-${classe}-${reino}`.replace(/ /g, "_");
    const dna = dnaJogador(
      { id, reino, casta: ["campones", "plebeu", "cavaleiro", "realeza", "indefinido", "rei"][n % 6], classe, elemento, rank: ["E", "C", "B", "S"][n % 4], tipoAnimal: ["raposa", "lobo", "tigre", "corvo"][n % 4] },
      { pele: peles[n % 4], cabelo: cabelos[n % 9], corCabelo: cores[(n * 4) % 9], olhos: olhos[n % 4], corOlhos: corOlhos[n % 6],
        rosto: ["oval", "fino", "redondo"][n % 3], boca: ["neutra", "sorriso", "seria", "sorriso-torto"][n % 4], marca: marcas[n % 9] },
    );
    const t = montar(dna);
    telasJog.push(t);
    writeFileSync(out(`assets/avatares/exemplos-jogador/${id}.png`), t.png(ESCALA));
    n++;
  }
galeria(telasJog, 9, "docs/img/galeria-jogadores.png");

writeFileSync(out("data/avatares-indice.json"), JSON.stringify(indice, null, 1) + "\n");
console.log(`✔ ${viloes.length} vilões, ${telasNpcs.length} NPCs, ${telasJog.length} jogadores de exemplo`);
