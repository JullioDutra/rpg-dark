// Gera os mapas em pixel art: mundo + recorte de cada reino + exemplo de !mapa com marcadores de jogadores.
// Uso: node scripts/render-mapas.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { desenharMapa, finalizar, rotuloReinos, recortar, RECORTES, LAYOUT } from "../src/mapa/mapa.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const reinos = JSON.parse(readFileSync(join(raiz, "data/reinos.json"), "utf8"));
const salvar = (p, buf) => { const f = join(raiz, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, buf); };

const faltando = reinos.reinos.flatMap((r) => r.regioes).filter((g) => !LAYOUT[g.id]);
if (faltando.length) throw new Error("regiões sem posição no mapa: " + faltando.map((g) => g.id).join(", "));

const base = () => desenharMapa().t;

const mundo = finalizar(base(), reinos.conexoes);
rotuloReinos(mundo);
salvar("assets/mapas/mundo.png", mundo.png(5));
salvar("docs/img/mapa-mundo.png", mundo.png(5));

for (const [reino, caixa] of Object.entries(RECORTES)) {
  const t = finalizar(base(), reinos.conexoes, { titulo: false });
  const nome = reino.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  salvar(`assets/mapas/reino-${nome}.png`, recortar(t, caixa).png(10));
}

// Exemplo do comando !mapa: posição do jogador e da party
const exemplo = finalizar(base(), reinos.conexoes, {
  marcadores: [
    { regiao: "R-HOM-1", cor: "#ff3a3a", rotulo: "VOCE" },
    { regiao: "R-KOK-1", cor: "#3aa0ff", rotulo: "PARTY", desloc: 0 },
  ],
});
salvar("docs/img/mapa-exemplo-comando.png", exemplo.png(5));
console.log("✔ mapas gerados em assets/mapas/ e docs/img/");
