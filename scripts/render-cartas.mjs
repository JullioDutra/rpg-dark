// Renderiza cartas de exemplo (personagem + 1 vilão de cada tier) para templates/exemplos/.
// No servidor do jogo, a mesma lógica é usada: abrir template → renderCarta(dados) → screenshot de #carta.
//
// Uso: node scripts/render-cartas.mjs [V001 V038 ...]
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// require() funciona com o Playwright instalado globalmente ou como dependência local.
const { chromium } = createRequire(import.meta.url)("playwright");

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const saida = join(raiz, "templates", "exemplos");
mkdirSync(saida, { recursive: true });

const viloes = JSON.parse(readFileSync(join(raiz, "data", "viloes.json"), "utf8"));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["V005", "V043", "V064", "V090", "V100"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });

async function render(template, dados, arquivo) {
  await page.goto(pathToFileURL(join(raiz, "templates", template)).href, { waitUntil: "load", timeout: 15000 }).catch(() => {});
  if (dados) await page.evaluate((d) => window.renderCarta(d), dados);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#carta").screenshot({ path: join(saida, arquivo) });
  console.log("✔", arquivo);
}

await render("carta-personagem.html", null, "personagem-exemplo.png");
for (const id of ids) {
  const v = viloes.find((x) => x.id === id);
  if (!v) { console.warn("vilão não encontrado:", id); continue; }
  await render("carta-vilao.html", v, `vilao-${id}.png`);
}
await browser.close();
