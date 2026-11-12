// Retratos em pixel art de todos os NPCs do mundo vivo → assets/avatares/mundo/ (+ galeria.png para conferência).
// Uso: node scripts/render-npcs.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { MUNDO, dnaNpc } from "../src/mundo/mundo.mjs";
import { REGIAO } from "../src/regras/exploracao.mjs";
import { renderizar } from "../src/avatar/index.mjs";

const dir = new URL("../assets/avatares/mundo/", import.meta.url);
mkdirSync(dir, { recursive: true });
let html = "<body style='background:#1a1622;margin:6px;font:11px sans-serif;color:#eee'>", n = 0;
for (const [rid, r] of Object.entries(MUNDO)) for (const [id, npc] of Object.entries(r.npcs)) {
  const arq = `${rid}-${id.normalize("NFD").replace(/[^\w-]/g, "")}.png`;
  writeFileSync(new URL(arq, dir), renderizar(dnaNpc(rid, id, npc, REGIAO.get(rid).reino), 4));
  html += `<div style='display:inline-block;width:132px;margin:3px;vertical-align:top'><img src='${arq}' width='128'><br><b>${npc.nome}</b>${npc.fem ? " ♀" : ""}<br>${npc.papel.slice(0, 40)}</div>`;
  n++;
}
writeFileSync(new URL("galeria.html", dir), html);
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1420, height: 900 } });
await p.goto(new URL("galeria.html", dir).href); await p.screenshot({ path: new URL("galeria.png", dir).pathname, fullPage: true }); await b.close();
console.log(`${n} retratos em assets/avatares/mundo/`);
