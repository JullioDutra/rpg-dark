// Fundos temáticos em pixel art: degradê com pontilhado (dithering ordenado) + padrão do tema.
import { rng } from "./pixel.mjs";
import { misturar } from "./paletas.mjs";

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

export function degrade(t, [c0, c1, c2]) {
  for (let y = 0; y < t.h; y++) {
    const p = y / (t.h - 1);
    for (let x = 0; x < t.w; x++) {
      const lim = (BAYER[y % 4][x % 4] + 0.5) / 16;
      let cor;
      if (p < 0.5) cor = p * 2 > lim ? c1 : c0;
      else cor = (p - 0.5) * 2 > lim ? c2 : c1;
      t.set(x, y, cor);
    }
  }
}

export function fundo(t, tema, cores, semente = "fundo", aura) {
  const r = rng(semente);
  degrade(t, cores);
  const claro = misturar(cores[2], "#ffffff", 0.25);
  switch (tema) {
    case "fogo":
      for (let k = 0; k < 9; k++) {
        const x = Math.floor(r() * 64), h = 6 + Math.floor(r() * 12);
        const m = t.mascara().espinho(x, 64, 7, x + (r() - 0.5) * 6, 64 - h);
        t.pintar(m, k % 2 ? cores[2] : misturar(cores[2], "#ff9a3a", 0.5));
      }
      for (let k = 0; k < 22; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 60), r() < 0.5 ? "#ffb02a" : "#ff6a2a");
      break;
    case "cinzas":
      for (let k = 0; k < 40; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), r() < 0.5 ? "#9a948e" : "#ff8a3a");
      break;
    case "agua":
    case "gelo": {
      const c = misturar(cores[2], tema === "gelo" ? "#ffffff" : "#7fd1ff", 0.35);
      for (let cy = 40; cy < 72; cy += 6)
        for (let cx = (cy / 6) % 2 ? 0 : 6; cx < 72; cx += 12) {
          const anel = t.mascara().elipse(cx, cy, 6, 6).apagar(t.mascara().elipse(cx, cy, 5, 5)).apagar(t.mascara().retangulo(0, cy + 1, 63, 63));
          t.pintar(anel, c);
        }
      for (let k = 0; k < 10; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 36), claro);
      break;
    }
    case "pantano":
      for (let k = 0; k < 12; k++) t.set(Math.floor(r() * 64), 40 + Math.floor(r() * 24), "#9cff57");
      break;
    case "terra":
    case "cristal": {
      const m = t.mascara();
      for (let k = 0; k < 5; k++) { const x = -8 + k * 18 + r() * 6; m.poligono([[x - 14, 64], [x, 34 + r() * 10], [x + 14, 64]]); }
      t.pintar(m, misturar(cores[1], "#000000", 0.25));
      if (tema === "cristal") for (let k = 0; k < 6; k++) { const x = Math.floor(r() * 60); t.pintar(t.mascara().espinho(x, 64, 4, x + 1, 50 - r() * 8), "#f080ff"); }
      break;
    }
    case "floresta":
      for (let k = 0; k < 6; k++) {
        const x = Math.floor(r() * 64);
        t.pintar(t.mascara().retangulo(x, 20, x + 3, 63), misturar(cores[0], "#000000", 0.3));
      }
      for (let k = 0; k < 14; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), "#c8f08a");
      break;
    case "vento":
      for (let k = 0; k < 8; k++) {
        const y = Math.floor(r() * 60), x = Math.floor(r() * 50);
        t.pintar(t.mascara().linha(x, y, x + 10 + r() * 8, y - 3), claro);
      }
      for (let k = 0; k < 3; k++) t.pintar(t.mascara().elipse(r() * 64, 50 + r() * 14, 10, 3), misturar(cores[2], "#ffffff", 0.45));
      break;
    case "raio":
      for (let k = 0; k < 2; k++) {
        let x = 8 + r() * 48, y = 0;
        const m = t.mascara();
        while (y < 40) { const nx = x + (r() - 0.5) * 10, ny = y + 5 + r() * 5; m.linha(x, y, nx, ny); x = nx; y = ny; }
        t.pintar(m, "#fff07a");
      }
      break;
    case "trevas":
    case "estrelas":
      for (let k = 0; k < 30; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), r() < 0.3 ? "#ffffff" : claro);
      break;
    case "luz":
      for (let a = 0; a < 360; a += 30) {
        const rad = (a * Math.PI) / 180;
        t.pintar(t.mascara().linha(32, 24, 32 + Math.cos(rad) * 45, 24 + Math.sin(rad) * 45), misturar(cores[2], "#ffffff", 0.3));
      }
      break;
    case "vazio":
      for (let k = 0; k < 18; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), "#cfcfd4");
      t.pintar(t.mascara().elipse(32, 22, 22, 22).apagar(t.mascara().elipse(32, 22, 21, 21)), "#3a3a40");
      break;
    case "eclipse":
      t.pintar(t.mascara().elipse(32, 20, 21, 21), "#ff7a3d");
      t.pintar(t.mascara().elipse(32, 20, 19, 19), "#ffd0a0");
      t.pintar(t.mascara().elipse(32, 20, 18, 18), "#05000a");
      break;
  }
  if (aura) {
    // brilho atrás da silhueta (anel pontilhado)
    const anel = t.mascara().elipse(32, 34, 27, 30).apagar(t.mascara().elipse(32, 34, 24, 27));
    for (let i = 0; i < anel.m.length; i++) if (anel.m[i] && (i + Math.floor(i / 64)) % 2) t.px[i] = aura;
  }
}
