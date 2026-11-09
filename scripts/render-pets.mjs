// Renderiza os 20 pets espirituais nos 3 estágios + galeria.
// Uso: node scripts/render-pets.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { montar } from "../src/avatar/index.mjs";
import { Tela } from "../src/avatar/pixel.mjs";
import { dnaPet, IDS_PETS } from "../src/avatar/dna.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p) => { const f = join(raiz, p); mkdirSync(dirname(f), { recursive: true }); return f; };

const telas = [];
for (const id of IDS_PETS) for (const e of [1, 2, 3]) {
  const t = montar(dnaPet(id, e));
  telas.push(t);
  writeFileSync(out(`assets/avatares/pets/${id}-${e}.png`), t.png(8));
}
// galeria: 2 pets por linha (3 estágios cada)
const cols = 6, linhas = Math.ceil(telas.length / cols);
const G = new Tela(cols * 66 + 8, linhas * 66 + 2);
for (let i = 0; i < G.px.length; i++) G.px[i] = "#0b0910";
telas.forEach((t, i) => {
  const c = i % cols, ox = 2 + c * 66 + (c >= 3 ? 6 : 0), oy = 2 + Math.floor(i / cols) * 66;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) G.set(ox + x, oy + y, t.get(x, y));
});
writeFileSync(out("docs/img/galeria-pets.png"), G.png(3));
console.log(`✔ ${telas.length} sprites de pets`);
