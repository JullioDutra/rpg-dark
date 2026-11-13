// Artes especiais, maiores que os bustos (96×96): o Dragão da Aurora e o Grimório das Sete Luzes.
import { Tela, rng } from "./pixel.mjs";
import { rampa, misturar } from "./paletas.mjs";

export const SETE_LUZES = ["#ff4d5e", "#ff9a3c", "#ffe14d", "#5fe07a", "#4dd6e8", "#4d7dff", "#b266ff"];
const W = 96;

function ceu(t, semente, { chao = true } = {}) {
  const r = rng(semente);
  // gradiente noturno
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const k = y / W;
    t.set(x, y, misturar(misturar("#070616", "#161a3e", Math.min(1, k * 1.4)), "#2a2456", Math.max(0, k - 0.6)));
  }
  // estrelas
  for (let i = 0; i < 46; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * 60); t.set(x, y, r() < 0.25 ? "#ffffff" : "#9aa6d8"); }
  // aurora: sete fitas onduladas, translúcidas (pontilhado)
  SETE_LUZES.forEach((cor, i) => {
    for (let x = 0; x < W; x++) {
      const y0 = 8 + i * 4.2 + Math.sin(x / 9 + i * 0.9) * 5 + Math.sin(x / 23 + i) * 3;
      for (let k = 0; k < 6; k++) {
        const y = Math.round(y0 + k);
        if ((x + y + i) % 2 === 0 || k < 2) { const fundo = t.get(x, y); if (fundo) t.set(x, y, misturar(fundo, cor, k < 2 ? 0.75 : 0.38 - k * 0.04)); }
      }
    }
  });
  if (chao) {
    // geleira
    const gelo = t.mascara();
    gelo.poligono([[0, 96], [0, 80], [14, 72], [26, 78], [40, 70], [58, 79], [72, 73], [96, 82], [96, 96]]);
    t.carimbar(gelo, ["#0e1a36", "#3f6a9c", "#8fc4e8", "#e6f6ff"], { sombra: 2 });
    for (let i = 0; i < 26; i++) { const x = Math.floor(r() * W), y = 82 + Math.floor(r() * 13); t.set(x, y, "#e6f6ff"); }
  }
}

/** Kōryū, o Dragão da Aurora: cabeça em 3/4 para a esquerda, pescoço em S, asa aberta atrás. */
export function desenharDragao() {
  const t = new Tela(W, W);
  ceu(t, "koryu");
  const C = rampa("#cfe4f2"), E = rampa("#7fa6c8"), V = rampa("#f3ead0"), CH = rampa("#e8c86a");
  // asa aberta atrás: cinco dedos em leque a partir do ombro, membrana entre eles com a borda recortada
  const ombro = [70, 62], pontas = [[52, 6], [70, 2], [88, 6], [96, 26], [95, 50]];
  for (let i = 0; i < pontas.length - 1; i++) {
    const a = pontas[i], b = pontas[i + 1], meio = [(a[0] + b[0]) / 2 + (ombro[0] - (a[0] + b[0]) / 2) * 0.22, (a[1] + b[1]) / 2 + (ombro[1] - (a[1] + b[1]) / 2) * 0.22];
    t.carimbar(t.mascara().poligono([ombro, a, meio, b]), rampa(misturar("#2c4478", SETE_LUZES[(i * 2 + 2) % 7], 0.38)), { sombra: 2 });
  }
  for (const pnt of pontas) t.carimbar(t.mascara().linha(ombro[0], ombro[1], pnt[0], pnt[1], 2), E, { sombra: 1 });
  for (const pnt of pontas) t.carimbar(t.mascara().elipse(pnt[0], pnt[1], 1.6, 1.6), CH, { sombra: 1 }); // garras nas pontas
  // pescoço em S, subindo da direita embaixo até a cabeça
  const pesc = t.mascara();
  const curva = (k) => [78 - k * 34 + Math.sin(k * Math.PI) * 6, 92 - k * 54 - Math.sin(k * Math.PI * 1.1) * 4];
  for (let k = 0; k <= 1.001; k += 0.02) { const [x, y] = curva(k); pesc.elipse(x, y, 13 - k * 4, 12 - k * 3.5); }
  t.carimbar(pesc, C, { sombra: 3 });
  // placas do ventre (lado esquerdo do pescoço)
  for (let k = 0.04; k <= 0.9; k += 0.085) {
    const [x, y] = curva(k), rr = 13 - k * 4;
    t.carimbar(t.mascara().elipse(x - rr * 0.62, y + 1, 3.4, 2.6), V, { sombra: 1 });
  }
  // espinhos dorsais (lado direito)
  for (let k = 0.08; k <= 0.95; k += 0.11) {
    const [x, y] = curva(k), rr = 13 - k * 4;
    t.carimbar(t.mascara().espinho(x + rr * 0.8, y - 2, 4, x + rr * 0.8 + 7, y - 9), rampa(SETE_LUZES[Math.round(k * 9) % 7]));
  }
  // escamas: brilhos em fileiras
  for (let k = 0.1; k <= 0.9; k += 0.06) { const [x, y] = curva(k); t.set(Math.round(x + 2), Math.round(y), C[3]); t.set(Math.round(x + 5), Math.round(y + 3), E[2]); t.set(Math.round(x - 1), Math.round(y - 4), E[2]); }
  // chifres curvos para trás (dois segmentos cada, afinando)
  for (const [x0, y0, x1, y1, x2, y2] of [[50, 30, 62, 20, 74, 22], [44, 28, 52, 14, 62, 12]]) {
    t.carimbar(t.mascara().linha(x0, y0, x1, y1, 4).linha(x1, y1, x2, y2, 3).elipse(x2, y2, 1, 1), CH, { sombra: 2 });
    t.set(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2) - 1, "#fff1a8");
  }
  // barbatana da bochecha
  t.carimbar(t.mascara().poligono([[52, 40], [66, 36], [62, 44], [68, 48], [58, 49]]), rampa(misturar("#3b5a8c", "#4dd6e8", 0.5)));
  // crânio + focinho comprido
  const cab = t.mascara().elipse(44, 37, 13, 10).poligono([[36, 29], [38, 46], [8, 44], [5, 39], [12, 34]]);
  t.carimbar(cab, C, { sombra: 2 });
  // sobrancelha/crista
  t.carimbar(t.mascara().poligono([[30, 30], [46, 26], [50, 30], [34, 34]]), E, { sombra: 1 });
  // mandíbula
  t.carimbar(t.mascara().poligono([[40, 45], [10, 45], [14, 51], [36, 53], [44, 49]]), V, { sombra: 2 });
  // boca: fenda escura + dentes
  t.pintar(t.mascara().linha(9, 44, 38, 46), "#1a1030");
  for (const [x, y] of [[12, 44], [16, 44], [20, 45], [24, 45], [28, 45], [32, 46]]) { t.set(x, y, "#ffffff"); t.set(x, y + 1, "#ffffff"); }
  for (const [x, y] of [[14, 47], [19, 47], [25, 48], [30, 48]]) t.set(x, y, "#f4f0e6");
  // narina e bigodes de luz
  t.set(9, 39, "#1a1030"); t.set(10, 39, "#1a1030");
  t.pintar(t.mascara().linha(8, 41, 1, 52), "#ffe14d"); t.pintar(t.mascara().linha(10, 42, 4, 58), "#4dd6e8");
  // olho: fenda brilhante com halo
  t.pintar(t.mascara().elipse(37, 36, 4, 3), "#1a1030");
  t.pintar(t.mascara().elipse(37, 36, 3, 2), "#ffe14d");
  t.pintar(t.mascara().linha(37, 34, 37, 38), "#1a1030");
  t.set(36, 35, "#ffffff");
  for (const [dx, dy] of [[-5, 0], [5, 0], [0, -4], [0, 4]]) { const f = t.get(37 + dx, 36 + dy); if (f) t.set(37 + dx, 36 + dy, misturar(f, "#ffe14d", 0.35)); }
  // sopro: sete luzes saindo da boca
  const r = rng("sopro");
  SETE_LUZES.forEach((cor, i) => { for (let k = 0; k < 5; k++) { const x = 6 - k * 1.2 - r() * 3, y = 46 + i * 1.6 + (r() - 0.5) * 3 + k * 1.5; t.set(Math.round(x), Math.round(y), cor); } });
  return t;
}

/** O Grimório das Sete Luzes: livro fechado em 3/4, capa índigo com cantoneiras douradas, sete gemas e sete luzes flutuando. */
export function desenharGrimorio() {
  const t = new Tela(W, W);
  // fundo: escuro com clarão atrás do livro
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - 48, y - 54) / 62;
    t.set(x, y, misturar("#3a2a6e", "#07051a", Math.min(1, d * 1.15)));
  }
  const r = rng("sete-luzes");
  for (let i = 0; i < 40; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * W); const f = t.get(x, y); t.set(x, y, misturar(f, "#ffffff", 0.5)); }
  // raios de luz subindo do livro
  SETE_LUZES.forEach((cor, i) => {
    const ang = -Math.PI / 2 + (i - 3) * 0.26;
    for (let d = 14; d < 58; d++) {
      const x = Math.round(48 + Math.cos(ang) * d), y = Math.round(56 + Math.sin(ang) * d);
      for (const dx of [-1, 0, 1]) { const f = t.get(x + dx, y); if (f && (d + dx) % 2 === 0) t.set(x + dx, y, misturar(f, cor, 0.3 - d / 320)); }
    }
  });
  // páginas (lombo inferior e lateral direita)
  t.carimbar(t.mascara().poligono([[24, 44], [70, 40], [78, 46], [78, 88], [32, 92], [24, 86]]), ["#3a2c1a", "#c9b68a", "#f1e6c4", "#fffaea"], { sombra: 2 });
  for (let y = 48; y < 88; y += 3) t.pintar(t.mascara().linha(73, y, 77, y + 1), "#c9b68a");
  for (let x = 34; x < 72; x += 3) t.set(x, 90 - Math.round((x - 32) * 0.09), "#c9b68a");
  // capa
  const capa = t.mascara().poligono([[20, 42], [66, 38], [72, 44], [72, 84], [26, 88], [20, 82]]);
  t.carimbar(capa, ["#0a0824", "#231a5c", "#34288a", "#5a4fc4"], { sombra: 2 });
  // moldura dourada
  const ouro = ["#3a2606", "#b07a1e", "#f0c040", "#fff1a8"];
  const mold = t.mascara().poligono([[24, 46], [64, 43], [68, 47], [68, 81], [28, 84], [24, 80]]);
  mold.apagar(t.mascara().poligono([[26, 48], [63, 45], [66, 48], [66, 79], [29, 82], [26, 79]]));
  t.carimbar(mold, ouro, { contorno: false, sombra: 1 });
  // cantoneiras
  for (const [x, y] of [[21, 43], [63, 39], [21, 78], [64, 78]]) t.carimbar(t.mascara().poligono([[x, y], [x + 8, y], [x + 8, y + 3], [x + 3, y + 8], [x, y + 8]]), ouro, { sombra: 1 });
  // fecho
  t.carimbar(t.mascara().retangulo(70, 60, 76, 67), ouro, { sombra: 1 });
  t.set(73, 63, "#3a2606"); t.set(73, 64, "#3a2606");
  // emblema: estrela de sete pontas com as sete gemas em volta
  const cx = 46, cy = 63;
  const estrela = t.mascara();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7, b = a + Math.PI / 7, c = a - Math.PI / 7;
    estrela.poligono([[cx + Math.cos(a) * 11, cy + Math.sin(a) * 11], [cx + Math.cos(b) * 4.5, cy + Math.sin(b) * 4.5], [cx, cy], [cx + Math.cos(c) * 4.5, cy + Math.sin(c) * 4.5]]);
  }
  t.carimbar(estrela, ouro, { sombra: 1 });
  t.pintar(t.mascara().elipse(cx, cy, 2.4, 2.4), "#ffffff");
  SETE_LUZES.forEach((cor, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7, x = cx + Math.cos(a) * 15.5, y = cy + Math.sin(a) * 15.5;
    t.carimbar(t.mascara().elipse(x, y, 2, 2), rampa(cor), { sombra: 1 });
    t.set(Math.round(x) - 1, Math.round(y) - 1, "#ffffff");
  });
  // sete luzes flutuando em arco acima do livro, com halo
  SETE_LUZES.forEach((cor, i) => {
    const a = Math.PI + ((i + 0.5) * Math.PI) / 7, x = Math.round(48 + Math.cos(a) * 34), y = Math.round(40 + Math.sin(a) * 26);
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      const d = Math.hypot(dx, dy);
      if (d > 5.2) continue;
      const f = t.get(x + dx, y + dy);
      if (f) t.set(x + dx, y + dy, misturar(f, cor, d < 1.6 ? 1 : d < 3 ? 0.6 : 0.22));
    }
    t.set(x, y, "#ffffff"); t.set(x - 1, y - 1, "#ffffff");
    // fagulhas
    t.set(x + 3, y - 6, cor); t.set(x - 4, y + 6, misturar(cor, "#ffffff", 0.5));
  });
  return t;
}

let cacheDragao = null, cacheGrimorio = null;
export const imagemDragao = (escala = 5) => (cacheDragao ??= desenharDragao().png(escala));
export const imagemGrimorioLuzes = (escala = 5) => (cacheGrimorio ??= desenharGrimorio().png(escala));
