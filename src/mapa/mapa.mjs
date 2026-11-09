// Mapa do continente Yotsuhoshi em pixel art (192×144, ampliado ×5 = 960×720).
// Terreno procedural determinístico + ícones das 36 regiões + estradas + névoa dourada (estilo biombo).
import { Tela, rng } from "../avatar/pixel.mjs";
import { misturar, rampa } from "../avatar/paletas.mjs";
import { desenharIcone } from "./icones.mjs";
import { escrever, largura } from "./fonte.mjs";

export const W = 192, H = 144;
const CENTRO = [96, 72];

// Posição e ícone de cada região (x, y no mapa 192×144) e número na legenda.
export const LAYOUT = {
  "R-FUJ-1": [96, 21, "castelo", 1], "R-FUJ-2": [70, 16, "montanha", 2], "R-FUJ-3": [100, 40, "campo", 3],
  "R-FUJ-4": [128, 8, "ilha-ceu", 4], "R-FUJ-5": [146, 24, "tempestade", 5], "R-FUJ-6": [60, 34, "canion", 6], "R-FUJ-7": [82, 7, "templo", 7],
  "R-WAT-1": [30, 72, "castelo", 1], "R-WAT-2": [46, 64, "lago", 2], "R-WAT-3": [12, 98, "ilha", 3], "R-WAT-4": [32, 90, "pantano", 4],
  "R-WAT-5": [28, 46, "geleira", 5], "R-WAT-6": [14, 60, "cachoeira", 6], "R-WAT-7": [8, 126, "abismo", 7],
  "R-DAI-1": [162, 70, "castelo", 1], "R-DAI-2": [178, 52, "floresta", 2], "R-DAI-3": [180, 86, "cristal", 3], "R-DAI-4": [138, 104, "canion", 4],
  "R-DAI-5": [146, 80, "campo", 5], "R-DAI-6": [140, 46, "montanha", 6], "R-DAI-7": [170, 104, "caverna", 7],
  "R-HOM-1": [98, 114, "castelo", 1], "R-HOM-2": [112, 128, "vulcao", 2], "R-HOM-3": [74, 110, "deserto", 3], "R-HOM-4": [124, 108, "floresta-brasa", 4],
  "R-HOM-5": [128, 124, "rio-lava", 5], "R-HOM-6": [54, 120, "costa", 6], "R-HOM-7": [88, 134, "ruina", 7],
  "R-KOK-1": [76, 84, "cidade", 1], "R-KOK-2": [116, 62, "pilares", 2], "R-KOK-3": [78, 60, "floresta-pedra", 3], "R-KOK-4": [96, 72, "abismo", 4],
  "R-KOK-5": [96, 72, null, 5], "R-KOK-6": [96, 72, null, 6], "R-KOK-7": [114, 84, "ruina", 7], "R-KOK-8": [104, 52, "ninho", 8],
};

const LOBOS = {
  "Fūjin": { c: [98, 24], r: [54, 21] },
  Watatsumi: { c: [30, 74], r: [27, 42] },
  Daichi: { c: [163, 74], r: [27, 42] },
  Homura: { c: [98, 120], r: [54, 21] },
};

const BIOMA = {
  "Fūjin": ["#7fb060", "#96c46e", "#b4d68a"],
  Watatsumi: ["#4a8a6a", "#5a9a76", "#78b08a"],
  Daichi: ["#2f5a2a", "#3f6a30", "#577f3a"],
  Homura: ["#5e4a44", "#72574c", "#8a6656"],
  "Kokū": ["#7a7874", "#8c8a86", "#a09e9a"],
};

function ruido(semente, escala) {
  const r = rng(semente), G = {};
  const v = (i, j) => (G[i + "," + j] ??= r());
  return (x, y) => {
    const fx = x / escala, fy = y / escala, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, w = fy - j;
    const s = (a) => a * a * (3 - 2 * a);
    const a = v(i, j) + (v(i + 1, j) - v(i, j)) * s(u), b = v(i, j + 1) + (v(i + 1, j + 1) - v(i, j + 1)) * s(u);
    return a + (b - a) * s(w);
  };
}

function dist(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); }

// Mapa de terreno: retorna { terra(x,y)->bool, reino(x,y)->id }
function terreno() {
  const n1 = ruido("costa", 9), n2 = ruido("costa2", 4);
  const valor = (x, y) => {
    let m = 0;
    for (const L of Object.values(LOBOS)) {
      const d = ((x - L.c[0]) / L.r[0]) ** 2 + ((y - L.c[1]) / L.r[1]) ** 2;
      m = Math.max(m, 1 - d);
    }
    const dc = ((x - CENTRO[0]) / 40) ** 2 + ((y - CENTRO[1]) / 34) ** 2;
    m = Math.max(m, 1 - dc);
    return m + (n1(x, y) - 0.5) * 0.42 + (n2(x, y) - 0.5) * 0.14;
  };
  const nb = ruido("fronteira", 7);
  const reino = (x0, y0) => {
    const x = x0 + (nb(x0, y0) - 0.5) * 14, y = y0 + (nb(y0 + 50, x0 + 50) - 0.5) * 14;
    if (((x - CENTRO[0]) / 30) ** 2 + ((y - CENTRO[1]) / 26) ** 2 < 1) return "Kokū";
    let melhor = null, md = 9;
    for (const [id, L] of Object.entries(LOBOS)) {
      const d = ((x - L.c[0]) / L.r[0]) ** 2 + ((y - L.c[1]) / L.r[1]) ** 2;
      if (d < md) { md = d; melhor = id; }
    }
    return melhor;
  };
  return { terra: (x, y) => valor(x, y) > 0.2, reino };
}

export function desenharMapa({ marcadores = [], foco = null } = {}) {
  const t = new Tela(W, H);
  const r = rng("mapa-yotsuhoshi");
  const { terra, reino } = terreno();
  const nv = ruido("vegetacao", 5);

  // 1) Mar com ondas seigaiha e degradê de profundidade
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let perto = 9;
    for (let dy = -4; dy <= 4; dy += 2) for (let dx = -4; dx <= 4; dx += 2) if (terra(x + dx, y + dy)) perto = Math.min(perto, Math.abs(dx) + Math.abs(dy));
    t.set(x, y, perto <= 4 ? "#2a5a8c" : (x + y) % 2 ? "#1a3a6a" : "#1c3e70");
  }
  for (let cy = 4; cy < H; cy += 8) for (let cx = (cy / 8) % 2 ? 0 : 6; cx < W; cx += 12) {
    const arco = t.mascara().elipse(cx, cy, 4, 4).apagar(t.mascara().elipse(cx, cy, 3, 3)).apagar(t.mascara().retangulo(0, cy + 1, W - 1, H - 1));
    for (let i = 0; i < arco.m.length; i++) if (arco.m[i] && !terra(i % W, Math.floor(i / W))) t.px[i] = "#3a6aa0";
  }
  // Fossa Shinkai (mar escuro) e arquipélago
  t.pintar(t.mascara().elipse(8, 126, 10, 9), "#0a1a3a");
  const ilhas = t.mascara();
  for (let k = 0; k < 9; k++) ilhas.elipse(4 + r() * 22, 92 + r() * 22, 1.5 + r() * 2, 1 + r() * 1.5);

  // 2) Terra por bioma, com variação por ruído
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!terra(x, y) && !ilhas.tem(x, y)) continue;
    const rei = ilhas.tem(x, y) && !terra(x, y) ? "Watatsumi" : reino(x, y);
    const b = BIOMA[rei], v = nv(x, y);
    let cor = v < 0.38 ? b[0] : v < 0.68 ? b[1] : b[2];
    if (rei === "Kokū") { const d = dist([x, y], CENTRO); cor = misturar(cor, "#2a2830", Math.max(0, 1 - d / 26) * 0.7); }
    if (rei === "Daichi" && dist([x, y], [146, 80]) < 11) cor = v < 0.5 ? "#c8a850" : "#d8bc66";
    if (rei === "Watatsumi" && dist([x, y], [28, 46]) < 12) cor = v < 0.5 ? "#d8eef8" : "#ffffff";
    if (rei === "Homura" && dist([x, y], [74, 110]) < 12) cor = v < 0.5 ? "#8a7c74" : "#9a8c82";
    if (rei === "Homura" && dist([x, y], [112, 128]) < 9) cor = v < 0.5 ? "#4a2a24" : "#6a3024";
    t.set(x, y, cor);
  }
  // 3) Costa: espuma e contorno
  const ehTerra = (x, y) => terra(x, y) || ilhas.tem(x, y);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (ehTerra(x, y)) {
      if (!ehTerra(x + 1, y) || !ehTerra(x - 1, y) || !ehTerra(x, y + 1) || !ehTerra(x, y - 1)) t.set(x, y, "#d8c890");
    } else if (ehTerra(x + 1, y) || ehTerra(x - 1, y) || ehTerra(x, y + 1) || ehTerra(x, y - 1)) t.set(x, y, "#e8f4ff");
  }
  // 4) Detalhes de bioma: árvores, capim, brasas, montanhas de fundo
  for (let k = 0; k < 900; k++) {
    const x = Math.floor(r() * W), y = Math.floor(r() * H);
    if (!terra(x, y)) continue;
    const rei = reino(x, y);
    if (rei === "Daichi" && dist([x, y], [146, 80]) > 12 && r() < 0.6) { t.set(x, y, "#1c3a1a"); t.set(x, y - 1, "#4a8a3a"); }
    if (rei === "Fūjin" && r() < 0.4) t.set(x, y, "#e0ecd0");
    if (rei === "Homura" && r() < 0.15) t.set(x, y, "#ff7a1a");
    if (rei === "Watatsumi" && r() < 0.3) t.set(x, y, "#3a6a5a");
    if (rei === "Kokū" && r() < 0.2) t.set(x, y, "#b8b6b0");
  }
  // lagos de Watatsumi e Lago Kagami
  for (const [x, y, a, b] of [[46, 64, 6, 4], [38, 82, 3, 2], [22, 76, 2.5, 2]]) {
    t.carimbar(t.mascara().elipse(x, y, a, b), ["#e8f4ff", "#2a6ab0", "#3a8ee8", "#9ad0ff"], { contorno: "#d8eefa" });
  }
  // Rio Yōgan (lava) do vulcão ao mar
  const rio = t.mascara();
  let rx = 112, ry = 128;
  while (ry < H && rx < W) { const nx = rx + 2 + r() * 2, ny = ry + (r() - 0.3) * 3; rio.linha(rx, ry, nx, ny, 2); rx = nx; ry = ny; }
  t.pintar(rio, "#ff5a1a");
  // Cordilheiras (triângulos com neve)
  const serras = [[60, 12], [66, 20], [76, 14], [136, 40], [144, 44], [150, 38], [132, 50], [156, 58], [172, 64], [26, 40], [34, 42], [140, 116]];
  for (const [x, y] of serras) {
    const m = t.mascara().poligono([[x - 5, y + 4], [x, y - 4], [x + 5, y + 4]]);
    t.carimbar(m, rampa("#7a6e64"), { sombra: 1 });
    t.pintar(t.mascara().poligono([[x - 2, y - 1], [x, y - 4], [x + 2, y - 1]]), "#f4f4f8");
  }
  // 5) Kokū: cratera do vazio e anel de pilares
  t.carimbar(t.mascara().elipse(96, 72, 9, 8), ["#c060ff", "#0a0410", "#000000", "#1a0a2a"], { sombra: 2, luz: 0 });
  for (let a = 0; a < 360; a += 30) {
    const x = 96 + Math.cos((a * Math.PI) / 180) * 20, y = 72 + Math.sin((a * Math.PI) / 180) * 17;
    t.carimbar(t.mascara().retangulo(Math.round(x), Math.round(y) - 2, Math.round(x) + 1, Math.round(y) + 1), rampa(a % 90 === 30 ? "#5a5a5e" : "#d8d4c8"), { luz: 0 });
  }
  // fronteiras pontilhadas entre reinos
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (terra(x, y) && terra(x + 1, y) && reino(x, y) !== reino(x + 1, y) && (x + y) % 2 === 0) t.set(x, y, "#2a1a1a");

  // 6) Estradas entre regiões conectadas
  return { t, terra };
}

export function finalizar(t, conexoes, { marcadores = [], titulo = true } = {}) {
  const estradas = t.mascara();
  for (const [a, b] of conexoes) {
    const A = LAYOUT[a], B = LAYOUT[b];
    if (!A || !B || !A[2] || !B[2]) continue;
    const n = Math.max(Math.abs(B[0] - A[0]), Math.abs(B[1] - A[1]));
    for (let i = 0; i <= n; i += 2) estradas.ponto(A[0] + ((B[0] - A[0]) * i) / n, A[1] + ((B[1] - A[1]) * i) / n);
  }
  t.pintar(estradas, "#f0dca0");
  for (const [id, [x, y, icone, num]] of Object.entries(LAYOUT)) {
    if (!icone) continue;
    desenharIcone(t, icone, x, y);
    escrever(t, String(num), x + 5, y - 6, "#ffe9a8");
  }
  for (const m of marcadores) {
    const L = LAYOUT[m.regiao];
    if (!L) continue;
    const [x, y] = [L[0] + (m.desloc ?? 0) * 4 - 2, L[1] - 9];
    t.carimbar(t.mascara().retangulo(x, y - 4, x + 3, y - 1).linha(x, y, x, y + 4), rampa(m.cor ?? "#ff3a3a"));
    if (m.rotulo) escrever(t, m.rotulo, x + 5, y - 5, "#ffffff");
  }
  if (titulo) {
    // névoa dourada (suyari-gasumi) nos cantos, como nos biombos japoneses
    const nevoa = t.mascara();
    // faixas de névoa: vários "dedos" arredondados sobrepostos, como as nuvens douradas dos biombos
    for (const [x, y, w] of [[2, 3, 34], [14, 8, 30], [6, 13, 18], [156, 3, 34], [166, 8, 24], [160, 136, 30], [146, 140, 34], [170, 131, 22]]) {
      for (let k = 0; k < 3; k++) nevoa.elipse(x + w / 2 + (k - 1) * w / 4, y + (k === 1 ? -1 : 0.5), w / 4 + 2, 2.4);
    }
    t.carimbar(nevoa, ["#8a6a1a", "#d0a640", "#e8c45a", "#fff0a8"], { sombra: 1 });
    // rosa dos ventos
    t.carimbar(t.mascara().poligono([[10, 20], [12, 27], [10, 34], [8, 27]]).poligono([[3, 27], [10, 25], [17, 27], [10, 29]]), rampa("#e8dcc0"));
    t.pintar(t.mascara().poligono([[10, 20], [12, 27], [8, 27]]), "#c8102e");
    escrever(t, "N", 15, 18, "#ffffff");
    escrever(t, "YOTSUHOSHI", 4, 136, "#ffe9a8");
  }
  return t;
}

export function rotuloReinos(t) {
  for (const [nome, x, y] of [["FUJIN", 116, 31], ["WATATSUMI", 30, 112], ["DAICHI", 164, 118], ["HOMURA", 72, 128], ["KOKU", 96, 88]]) {
    escrever(t, nome, Math.round(x - largura(nome) / 2), y, "#ffffff");
  }
}

// Recorte ampliado de um reino (para !mapa <reino>)
export const RECORTES = {
  "Fūjin": [44, 0, 120, 52], Watatsumi: [0, 34, 70, 110], Daichi: [122, 34, 192, 110], Homura: [44, 92, 150, 144], "Kokū": [56, 44, 136, 100],
};
export function recortar(t, [x0, y0, x1, y1]) {
  const r = new Tela(x1 - x0, y1 - y0);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) r.set(x - x0, y - y0, t.get(x, y));
  return r;
}
