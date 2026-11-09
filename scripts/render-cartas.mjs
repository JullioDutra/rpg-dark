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

const indice = JSON.parse(readFileSync(join(raiz, "data", "avatares-indice.json"), "utf8"));
const url = (p) => (p ? pathToFileURL(join(raiz, p)).href : undefined);

async function render(template, dados, arquivo) {
  await page.goto(pathToFileURL(join(raiz, "templates", template)).href, { waitUntil: "load", timeout: 15000 }).catch(() => {});
  if (dados) await page.evaluate((d) => window.renderCarta({ revelado: true, ...d }), dados);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#carta").screenshot({ path: join(saida, arquivo) });
  console.log("✔", arquivo);
}

await render("carta-personagem.html", {
  nome: "Kaito", titulo: "Aprendiz das Cinzas", rank: "C", reino: "Homura", aldeia: "Haibara",
  casta: "campones", classe: "⚔️ Espadachim", atributo_magico: "Fogo · Cinzas", elegivel_pet: true,
  nivel: 24, xp: 4100, xp_prox: 8100, hp: 412, hp_max: 520, mp: 61, mp_max: 98,
  fluxo: 6, pureza: 14, controle: 41, merito: 180, mundo: "Grupo Alpha",
  atributos: { FOR: 82, DEF: 31, MAG: 28, RES: 29, VEL: 76, SOR: 30 },
  equipamento: { arma: "Katana de Obsidiana", grimorio: "G02 Manual do Duelista Rubro", acessorio: "Pena de Fênix" },
  retrato_url: url("assets/avatares/exemplos-jogador/J-Espadachim-Homura.png"),
}, "personagem-exemplo.png");
// Exemplo do Olho Avaliador: o mesmo Kaito visto por alguém com leitura nível 3 ("Leitura")
const { montarCard } = await import("../src/regras/avaliar.mjs");
const kaito = { nome: "Kaito", titulo: "Aprendiz das Cinzas", rank: "C", reino: "Homura", aldeia: "Haibara", casta: "campones",
  classe: "⚔️ Espadachim", atributo_magico: "Fogo · Cinzas", nivel: 24, hp: 412, hp_max: 520, mp: 61, mp_max: 98, pet: null,
  atributos: { FOR: 82, DEF: 31, MAG: 28, RES: 29, VEL: 76, SOR: 30 }, equipamento: { arma: "Katana de Obsidiana" }, merito: 180,
  fluxo: 6, pureza: 14, controle: 41, retrato_url: url("assets/avatares/exemplos-jogador/J-Espadachim-Homura.png") };
await render("carta-personagem.html", montarCard(kaito, 3), "personagem-avaliado-leitura.png");
await render("carta-personagem.html", montarCard(kaito, 1), "personagem-avaliado-silhueta.png");

for (const id of ids) {
  const v0 = viloes.find((x) => x.id === id);
  const v = v0 && { ...v0, retrato_url: url(indice[id]?.arquivo), retrato_mascara_url: url(indice[id]?.mascara) };
  if (!v) { console.warn("vilão não encontrado:", id); continue; }
  await render("carta-vilao.html", v, `vilao-${id}.png`);
  if (v.mascara) await render("carta-vilao.html", { ...v, revelado: false }, `vilao-${id}-mascara.png`);
}
await browser.close();
