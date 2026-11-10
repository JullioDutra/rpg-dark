// Foto do grupo do WhatsApp em pixel art: o Ovo Eterno diante do Eclipse, cercado pelas Quatro Estrelas.
// O WhatsApp recorta a foto em círculo: tudo que importa fica no centro.
// Uso: node scripts/render-grupo.mjs  → assets/grupo/foto-grupo.png (768×768)
import { mkdirSync, writeFileSync } from "node:fs";
import { Tela, rng } from "../src/avatar/pixel.mjs";
import { rampa, misturar } from "../src/avatar/paletas.mjs";
import { degrade } from "../src/avatar/fundo.mjs";

const N = 96, C = (N - 1) / 2;
const t = new Tela(N, N);
const r = rng("yotsuhoshi-grupo");

// Céu noturno com pontilhado
degrade(t, ["#05030d", "#120a2a", "#2a1248"]);
for (let k = 0; k < 70; k++) {
  const x = Math.floor(r() * N), y = Math.floor(r() * N);
  t.set(x, y, r() < 0.2 ? "#ffffff" : "#8a7ab8");
}

// Eclipse: coroa alaranjada com raios, disco negro por cima
const coroa = t.mascara();
for (let a = 0; a < 32; a++) {
  const ang = (a / 32) * Math.PI * 2, raio = a % 2 ? 30 : 33 + (a % 4 === 0 ? 2 : 0);
  coroa.linha(C, C, C + Math.cos(ang) * raio, C + Math.sin(ang) * raio, 1);
}
t.pintar(coroa, "#7b3fb0");
const halo = t.mascara().elipse(C, C, 28, 28);
t.pintar(halo, "#ff7a3d");
t.pintar(t.mascara().elipse(C, C, 26.5, 26.5), "#ffb070");
t.pintar(t.mascara().elipse(C, C, 25.5, 25.5), "#ffe0a0");
t.pintar(t.mascara().elipse(C, C, 24.5, 24.5), "#0a0614");

// Aura do ovo com pontilhado
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const d = Math.hypot((x - C) / 1, (y - (C + 2)) / 1.2);
  if (Math.hypot(x - C, y - C) < 24 && d < 23 && d > 13) {
    const p = 1 - (d - 13) / 10;
    if (p > (BAYER[y % 4][x % 4] + 0.5) / 16) t.set(x, y, p > 0.6 ? "#3a2a6a" : "#24164a");
  }
}

// O Ovo Eterno
const ovo = t.mascara().elipse(C, C + 4, 12, 15).elipse(C, C - 3, 10.5, 11);
t.carimbar(ovo, ["#2a1846", "#c8a050", "#f4e6c0", "#fffaf0"], { sombra: 2 });
// sombreado lateral e brilho
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (ovo.tem(x, y) && ovo.tem(x - 1, y) && !ovo.tem(x + 3, y)) t.set(x, y, "#c8a050");
t.pintar(t.mascara().elipse(C - 5, C - 6, 2, 3.5), "#ffffff");
// manchas de estrela no ovo
for (const [x, y, cor] of [[C + 4, C - 4, "#7fd1ff"], [C - 3, C + 6, "#ff7a3d"], [C + 5, C + 9, "#8ad050"], [C - 6, C + 1, "#7ff0d8"]]) {
  const m = t.mascara().ponto(x, y).ponto(x - 1, y).ponto(x + 1, y).ponto(x, y - 1).ponto(x, y + 1);
  t.pintar(m, cor); t.set(x, y, "#ffffff");
}
// rachadura dourada brilhando (o ovo vai chocar)
const rach = t.mascara();
[[C - 9, C - 2], [C - 5, C + 1], [C - 2, C - 2], [C + 2, C + 2], [C + 6, C - 1], [C + 9, C + 1]].reduce((a, b) => { rach.linha(a[0], a[1], b[0], b[1]); return b; });
t.pintar(rach, "#ffd23a");
for (const [x, y] of [[C - 2, C - 2], [C + 2, C + 2]]) t.set(x, y, "#ffffff");

// As Quatro Estrelas (reinos) em diamante ao redor
function estrela(cx, cy, cor, tam = 4.5) {
  const m = t.mascara();
  m.poligono([[cx, cy - tam], [cx + 1.6, cy - 1.6], [cx + tam, cy], [cx + 1.6, cy + 1.6], [cx, cy + tam], [cx - 1.6, cy + 1.6], [cx - tam, cy], [cx - 1.6, cy - 1.6]]);
  const brilho = t.mascara().elipse(cx, cy, tam + 2, tam + 2).apagar(m);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (brilho.tem(x, y) && (x + y) % 2 === 0) t.set(x, y, misturar(cor, "#05030d", 0.55));
  t.carimbar(m, rampa(cor), { sombra: 1 });
  t.set(cx, cy, "#ffffff");
}
estrela(C, C - 39, "#ff5a3a");      // 焔 Homura (Fogo) — norte
estrela(C + 39, C, "#4aa8ff");  // 水 Watatsumi (Água) — leste
estrela(C, C + 39, "#8ad050");      // 土 Daichi (Terra) — sul
estrela(C - 39, C, "#7ff0d8");  // 風 Fūjin (Vento) — oeste

mkdirSync(new URL("../assets/grupo/", import.meta.url), { recursive: true });
writeFileSync(new URL("../assets/grupo/foto-grupo.png", import.meta.url), t.png(8));
console.log("assets/grupo/foto-grupo.png (768×768)");
