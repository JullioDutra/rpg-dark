// Criaturas não humanoides em pixel art (busto 64×64). Arquétipos parametrizáveis:
//   fera · ave · serpente · peixe · anfibio · espirito · golem · aracnideo · centopeia · cranio · coracao ·
//   redemoinho · enxame
import { rng } from "./pixel.mjs";
import { rampa, misturar, OLHOS } from "./paletas.mjs";

let FOFO = false;
function olho(t, x, y, cor, tipo = "brilho", tam = 1) {
  const c = OLHOS[cor] ?? cor ?? "#ffd23a";
  if (FOFO) {
    const R = Math.max(2.2, tam * 1.9);
    t.pintar(t.mascara().elipse(x, y, R + 0.6, R + 0.8), "#1a1024");
    t.pintar(t.mascara().elipse(x, y + 0.5, R - 0.2, R), c);
    t.pintar(t.mascara().elipse(x, y + 1, R - 1, R - 1.2), rampa(c)[1]);
    t.set(Math.round(x - R / 2), Math.round(y - R / 2), "#ffffff");
    t.set(Math.round(x - R / 2) + 1, Math.round(y - R / 2), "#ffffff");
    t.set(Math.round(x + R / 3), Math.round(y + R / 3), "#ffffff");
    t.set(Math.round(x) - 2, Math.round(y + R + 2), "#f59ab0");
    t.set(Math.round(x) + 2, Math.round(y + R + 2), "#f59ab0");
    return;
  }
  if (tipo === "fenda") {
    t.carimbar(t.mascara().elipse(x, y, 1.6 * tam, 1.4 * tam), rampa(c), { sombra: 0 });
    t.pintar(t.mascara().linha(x, y - tam, x, y + tam), "#120a10");
  } else if (tipo === "vazio") {
    t.pintar(t.mascara().elipse(x, y, 1.5 * tam, 1.5 * tam), "#000000");
  } else {
    t.pintar(t.mascara().elipse(x, y, 1.6 * tam, 1.2 * tam), c);
    t.set(Math.round(x), Math.round(y), misturar(c, "#ffffff", 0.75));
  }
}

function dentes(t, pts) {
  for (const [x, y] of pts) { t.set(x, y, "#f4f0e6"); t.set(x, y + 1, "#f4f0e6"); }
}

const ARQ = {
  // Cabeça de fera em 3/4 virada para a esquerda
  fera(t, d, r) {
    const C = rampa(d.cor), B = rampa(d.cor2 ?? misturar(d.cor, "#ffffff", 0.35));
    if (d.caudas) for (let k = 0; k < d.caudas; k++) {
      const m = t.mascara().espinho(46, 50, 8, 52 + k * 5 - 4, 12 + k * 4);
      t.carimbar(m, rampa(d.corCauda ?? d.cor));
    }
    t.carimbar(t.mascara().poligono([[16, 64], [24, 40], [44, 36], [56, 64]]), C, { sombra: 2 }); // pescoço/peito
    if (d.crina) {
      const m = t.mascara();
      for (let k = 0; k < 7; k++) m.espinho(40 + k * 2, 22 + k * 5, 7, 52 + k * 2, 18 + k * 6);
      t.carimbar(m, rampa(d.corCrina ?? misturar(d.cor, "#000000", 0.2)));
    }
    const orelhas = t.mascara();
    if (d.orelhas === "pontudas") orelhas.poligono([[30, 18], [38, 16], [33, 3]]).poligono([[40, 17], [46, 20], [47, 6]]);
    if (d.orelhas === "redondas") orelhas.elipse(31, 15, 4, 4).elipse(43, 16, 4, 4);
    if (d.orelhas === "abanadas") orelhas.poligono([[28, 20], [36, 18], [18, 10]]).poligono([[42, 18], [48, 22], [56, 10]]);
    t.carimbar(orelhas, C);
    const longo = d.focinho !== "curto";
    const cab = t.mascara().elipse(36, 27, 12, 11).elipse(longo ? 21 : 25, 33, longo ? 10 : 7, longo ? 6 : 5.5);
    t.carimbar(cab, C, { sombra: 2 });
    t.carimbar(t.mascara().elipse(longo ? 20 : 25, 36, longo ? 8 : 6, 2.5), B, { contorno: false });
    t.pintar(t.mascara().elipse(longo ? 12 : 19, 31, 1.6, 1.3), "#1a1018"); // nariz
    t.pintar(t.mascara().linha(longo ? 12 : 19, 35, 30, 37), C[0]); // boca
    if (d.dentes) dentes(t, longo ? [[16, 36], [24, 37]] : [[21, 36], [26, 37]]);
    if (d.chifres) {
      const m = t.mascara();
      if (d.chifres === "curvos") m.poligono([[34, 17], [38, 16], [30, 2], [26, 6], [32, 9]]).poligono([[42, 17], [46, 19], [50, 3], [46, 2], [45, 10]]);
      else m.espinho(36, 17, 4, 38, 2).espinho(44, 18, 4, 49, 4);
      t.carimbar(m, rampa(d.corChifre ?? "#e8e0d0"));
    }
    olho(t, 29, 25, d.corOlhos, d.olho ?? "fenda", 1.3);
    if (d.olhoDireito !== false) olho(t, 41, 25, d.corOlhos, d.olho ?? "fenda", 1);
    marcas(t, d, r);
  },

  ave(t, d, r) {
    const C = rampa(d.cor), B = rampa(d.cor2 ?? misturar(d.cor, "#ffffff", 0.4));
    for (const lado of [-1, 1]) {
      const m = t.mascara().poligono([[32 + lado * 6, 34], [32 + lado * 30, 6], [32 + lado * 31, 30], [32 + lado * 12, 52]]);
      for (let k = 0; k < 4; k++) m.espinho(32 + lado * (22 + k * 2), 22 + k * 8, 8, 32 + lado * (33 - k), 30 + k * 9);
      t.carimbar(m, rampa(d.corAsas ?? d.cor), { sombra: 2 });
      const penas = t.mascara();
      for (let k = 0; k < 4; k++) penas.linha(32 + lado * 10, 40, 32 + lado * (28 - k * 3), 10 + k * 6);
      t.pintar(penas.intersectar(m), rampa(d.corAsas ?? d.cor)[1]);
    }
    t.carimbar(t.mascara().elipse(32, 56, 14, 12), B, { sombra: 2 });
    t.carimbar(t.mascara().elipse(32, 26, 11, 11), C, { sombra: 2 });
    if (d.crista) {
      const m = t.mascara();
      for (let k = 0; k < 4; k++) m.espinho(30 + k * 3, 17, 4, 34 + k * 4, 2 + k);
      t.carimbar(m, rampa(d.corCrista ?? d.cor));
    }
    t.carimbar(t.mascara().poligono([[24, 26], [24, 32], [11, 31]]), rampa(d.corBico ?? "#e6b422"));
    olho(t, 28, 24, d.corOlhos, d.olho ?? "brilho", 1.2);
    olho(t, 37, 24, d.corOlhos, d.olho ?? "brilho", 1);
    marcas(t, d, r);
  },

  serpente(t, d, r) {
    const C = rampa(d.cor), B = rampa(d.cor2 ?? misturar(d.cor, "#ffe0a0", 0.4));
    const corpo = t.mascara();
    for (let x = 0; x <= 64; x += 1) corpo.elipse(x, 50 + Math.sin(x / 7) * 8, 6, 6);
    t.carimbar(corpo, C, { sombra: 2 });
    for (let x = 2; x < 64; x += 5) t.set(x, Math.round(50 + Math.sin(x / 7) * 8) - 2, C[3]);
    if (d.asas) for (const lado of [-1, 1]) {
      const m = t.mascara().poligono([[32 + lado * 6, 30], [32 + lado * 30, 4], [32 + lado * 26, 26], [32 + lado * 14, 40]]);
      t.carimbar(m, rampa(d.corAsas ?? misturar(d.cor, "#000000", 0.3)));
    }
    const cab = t.mascara().elipse(36, 26, 11, 9).poligono([[30, 22], [30, 34], [8, 32], [9, 27]]);
    if (d.chifres !== false) cab.poligono([[38, 19], [42, 18], [56, 4], [52, 4]]).poligono([[32, 19], [35, 18], [36, 2], [33, 3]]);
    t.carimbar(cab, C, { sombra: 2 });
    t.carimbar(t.mascara().poligono([[30, 32], [10, 31], [12, 35], [30, 37]]), B); // mandíbula
    dentes(t, [[13, 31], [17, 31], [21, 31], [25, 32]]);
    if (d.bigodes) t.pintar(t.mascara().linha(12, 33, 2, 44).linha(14, 34, 6, 50), rampa(d.corBigode ?? "#ffd23a")[2]);
    olho(t, 30, 24, d.corOlhos, d.olho ?? "fenda", 1.4);
    if (d.lagrimas) t.pintar(t.mascara().linha(30, 27, 28, 34), "#ff5a1a");
    marcas(t, d, r);
  },

  peixe(t, d, r) {
    const C = rampa(d.cor), B = rampa(d.cor2 ?? "#f4f0e6");
    t.carimbar(t.mascara().poligono([[44, 30], [62, 14], [62, 50]]), rampa(d.corBarbatana ?? d.cor));
    t.carimbar(t.mascara().elipse(30, 32, 22, 14), C, { sombra: 2 });
    t.carimbar(t.mascara().elipse(28, 38, 16, 6), B, { contorno: false });
    t.carimbar(t.mascara().poligono([[30, 18], [44, 18], [38, 6]]), rampa(d.corBarbatana ?? d.cor));
    if (d.manchas) for (let k = 0; k < 6; k++) t.carimbar(t.mascara().elipse(22 + r() * 22, 22 + r() * 14, 3, 2), rampa(d.manchas), { contorno: false });
    t.pintar(t.mascara().linha(8, 34, 16, 35), C[0]);
    if (d.bigodes) t.pintar(t.mascara().linha(9, 35, 1, 50).linha(10, 36, 6, 58), d.corBigode ?? "#ffe07a");
    olho(t, 16, 28, d.corOlhos, "brilho", 1.6);
    marcas(t, d, r);
  },

  anfibio(t, d, r) {
    const C = rampa(d.cor), B = rampa(d.cor2 ?? "#e8e0a0");
    t.carimbar(t.mascara().elipse(32, 46, 28, 18), C, { sombra: 2 });
    t.carimbar(t.mascara().elipse(32, 52, 18, 9), B, { contorno: false });
    t.carimbar(t.mascara().elipse(21, 24, 7, 7).elipse(43, 24, 7, 7), C);
    olho(t, 21, 24, d.corOlhos, d.olho ?? "fenda", 2);
    olho(t, 43, 24, d.corOlhos, d.olho ?? "fenda", 2);
    t.pintar(t.mascara().linha(10, 38, 54, 38), C[0]);
    if (d.dentes) dentes(t, [[20, 38], [30, 39], [42, 38]]);
    marcas(t, d, r);
  },

  espirito(t, d, r) {
    const C = rampa(d.cor);
    const m = t.mascara().elipse(32, 28, 15, 16);
    for (let x = 17; x <= 47; x += 6) m.espinho(x + 3, 40, 6, x + 3 + (r() - 0.5) * 4, 56 + r() * 8);
    if (d.chama) for (let k = 0; k < 5; k++) m.espinho(22 + k * 5, 18, 6, 22 + k * 5 + (r() - 0.5) * 6, 2 + r() * 6);
    if (d.tentaculos) for (let k = 0; k < 6; k++) m.linha(20 + k * 5, 40, 18 + k * 5 + Math.sin(k) * 4, 63, 2);
    t.carimbar(m, C, { sombra: 2 });
    if (d.translucido) for (let i = 0; i < m.m.length; i++) if (m.m[i] && (i + Math.floor(i / 64)) % 3 === 0) t.px[i] = misturar(C[2], "#ffffff", 0.5);
    const tipoOlho = d.olho ?? "brilho";
    olho(t, 26, 27, d.corOlhos, tipoOlho, 1.6);
    olho(t, 38, 27, d.corOlhos, tipoOlho, 1.6);
    if (d.boca === "grito") t.pintar(t.mascara().elipse(32, 36, 3, 4), "#120a10");
    else if (d.boca === "sorriso") t.pintar(t.mascara().linha(26, 34, 32, 37).linha(32, 37, 38, 34), "#120a10");
    marcas(t, d, r);
  },

  tartaruga(t, d, r) {
    const C = rampa(d.cor), K = rampa(d.corCasco ?? misturar(d.cor, "#000000", 0.3));
    if (d.cauda === "serpente") {
      const m = t.mascara();
      for (let k = 0; k <= 20; k++) m.elipse(52 + Math.sin(k / 4) * 5, 50 - k * 1.8, 2.5, 2.5);
      t.carimbar(m, rampa(d.corCauda ?? "#2a6a5a"));
      t.carimbar(t.mascara().elipse(54, 12, 4, 3), rampa(d.corCauda ?? "#2a6a5a"));
      olho(t, 53, 11, "vermelho", "fenda", 0.8);
    }
    t.carimbar(t.mascara().elipse(14, 56, 5, 4).elipse(48, 57, 5, 4), C);
    t.carimbar(t.mascara().elipse(13, 40, 9, 8), C, { sombra: 2 });
    const casco = t.mascara().elipse(34, 46, 22, 14).apagar(t.mascara().retangulo(0, 52, 63, 63));
    casco.retangulo(13, 48, 55, 54);
    t.carimbar(casco, K, { sombra: 2 });
    for (const [x, y] of [[26, 40], [36, 37], [46, 41], [31, 47], [42, 47]]) t.pintar(t.mascara().elipse(x, y, 3.5, 2.5).apagar(t.mascara().elipse(x, y, 2.5, 1.5)), K[0]);
    if (d.arvore) {
      t.carimbar(t.mascara().retangulo(32, 18, 35, 34), rampa("#6a4a2a"));
      t.carimbar(t.mascara().elipse(34, 15, 11, 8).elipse(26, 19, 6, 5).elipse(42, 19, 6, 5), rampa(d.corFolhas ?? "#5aa040"));
    }
    olho(t, 10, 38, d.corOlhos, d.olho ?? "brilho", 1.1);
    t.pintar(t.mascara().linha(6, 43, 10, 44), C[0]);
    marcas(t, d, r);
  },

  golem(t, d, r) {
    const C = rampa(d.cor);
    t.carimbar(t.mascara().retangulo(4, 44, 60, 63), C, { sombra: 2 });
    t.carimbar(t.mascara().retangulo(2, 38, 18, 56).retangulo(46, 38, 62, 56), C, { sombra: 2 });
    t.carimbar(t.mascara().retangulo(20, 14, 44, 40), C, { sombra: 2 });
    if (d.coroa) for (const x of [22, 27, 32, 37, 42]) t.carimbar(t.mascara().espinho(x, 14, 4, x, 7), rampa(d.corCoroa ?? "#e6b422"));
    t.pintar(t.mascara().retangulo(24, 24, 29, 27).retangulo(35, 24, 40, 27), "#120a10");
    olho(t, 26.5, 25.5, d.corOlhos, "brilho", 1.3);
    olho(t, 37.5, 25.5, d.corOlhos, "brilho", 1.3);
    const nucleo = t.mascara().elipse(32, 52, 4, 4);
    t.carimbar(nucleo, rampa(d.corNucleo ?? "#5ad0ff"));
    t.pintar(t.mascara().linha(20, 18, 26, 22).linha(40, 32, 44, 38).linha(10, 48, 16, 54).linha(30, 50, 34, 56), C[0]);
    if (d.musgo) for (let k = 0; k < 20; k++) t.set(2 + Math.floor(r() * 60), 14 + Math.floor(r() * 45), "#6a9a3a");
    marcas(t, d, r);
  },

  // Espírito da floresta (kodama): porte 1 = broto, 2 = guardião jovem, 3 = árvore anciã. cor = casca, corFolha, corFlor, corNucleo.
  arvore(t, d, r) {
    const porte = d.porte ?? 2, C = rampa(d.cor), F = rampa(d.corFolha ?? "#4a9a3a"), flor = d.corFlor ?? "#ffe07a", nucleo = d.corNucleo ?? "#9affc0";
    const folha = (x, y, dx, dy, tam = 4) => t.carimbar(t.mascara().poligono([[x, y], [x + dx * tam - dy * tam * 0.45, y + dy * tam + dx * tam * 0.45], [x + dx * tam * 1.9, y + dy * tam * 1.9], [x + dx * tam + dy * tam * 0.45, y + dy * tam - dx * tam * 0.45]]), F);
    const florzinha = (x, y) => { for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) t.set(x + a, y + b, flor); t.set(x, y, "#fff8e0"); };
    if (porte === 1) {
      // broto: uma semente redonda de olhos grandes, com duas folhas novas e um talo
      t.pintar(t.mascara().elipse(32, 58, 16, 3), misturar(C[0], "#000000", 0.4));
      t.carimbar(t.mascara().linha(32, 30, 32, 16, 2), F, { sombra: 0 });
      folha(32, 18, -0.75, -0.65, 6); folha(32, 18, 0.75, -0.65, 6);
      t.carimbar(t.mascara().elipse(32, 42, 13, 14).elipse(32, 50, 15, 9), C, { sombra: 2 });
      t.pintar(t.mascara().elipse(32, 49, 8, 6), misturar(C[2], "#fff0d0", 0.35));
      olho(t, 26, 40, d.corOlhos, "brilho", 2.1); olho(t, 38, 40, d.corOlhos, "brilho", 2.1);
      t.pintar(t.mascara().linha(30, 46, 32, 47).linha(32, 47, 34, 46), C[0]);
      for (const x of [20, 44]) t.carimbar(t.mascara().elipse(x, 56, 4, 3), C);
      florzinha(32, 13);
    } else {
      const anciao = porte >= 3;
      // raízes e tronco
      const tronco = t.mascara().poligono(anciao ? [[21, 63], [23, 30], [41, 30], [43, 63]] : [[24, 63], [25, 32], [39, 32], [40, 63]]);
      for (const lado of [-1, 1]) tronco.poligono([[32 + lado * 9, 63], [32 + lado * (anciao ? 26 : 19), 63], [32 + lado * (anciao ? 24 : 18), 60], [32 + lado * 9, 52]]);
      // galhos (braços) abertos
      const galhos = t.mascara();
      for (const lado of [-1, 1]) {
        galhos.linha(32 + lado * 8, 40, 32 + lado * 20, 34, 3).linha(32 + lado * 20, 34, 32 + lado * (anciao ? 28 : 25), 24, 2);
        if (anciao) galhos.linha(32 + lado * 20, 34, 32 + lado * 29, 38, 2).linha(32 + lado * 6, 30, 32 + lado * 13, 10, 2).linha(32 + lado * 11, 18, 32 + lado * 19, 12, 2);
      }
      t.carimbar(galhos, C, { sombra: 0 });
      t.carimbar(tronco, C, { sombra: 2 });
      // copa
      const copa = t.mascara().elipse(32, anciao ? 17 : 20, anciao ? 20 : 15, anciao ? 12 : 10).elipse(anciao ? 15 : 20, anciao ? 22 : 24, anciao ? 10 : 7, anciao ? 8 : 6).elipse(anciao ? 49 : 44, anciao ? 22 : 24, anciao ? 10 : 7, anciao ? 8 : 6);
      if (anciao) copa.elipse(24, 9, 9, 6).elipse(41, 8, 9, 6).elipse(7, 30, 6, 5).elipse(57, 30, 6, 5);
      t.carimbar(copa, F, { sombra: 2 });
      for (let k = 0; k < (anciao ? 26 : 14); k++) { const x = Math.floor(8 + r() * 48), y = Math.floor(6 + r() * 22); if (copa.tem(x, y)) t.set(x, y, F[3]); }
      for (const lado of [-1, 1]) folha(32 + lado * (anciao ? 28 : 25), 24, lado * 0.6, -0.8, 3);
      // rosto na casca: olhos fundos que brilham, boca de fenda, veios
      t.pintar(t.mascara().elipse(27.5, 40, 3.2, 3).elipse(36.5, 40, 3.2, 3), "#120a10");
      olho(t, 27.5, 40, d.corOlhos, "brilho", anciao ? 1.5 : 1.3); olho(t, 36.5, 40, d.corOlhos, "brilho", anciao ? 1.5 : 1.3);
      t.pintar(t.mascara().linha(29, 47, 32, 48).linha(32, 48, 35, 47), "#120a10");
      t.pintar(t.mascara().linha(25, 34, 27, 36).linha(39, 34, 37, 36).linha(26, 54, 28, 60).linha(37, 52, 36, 58), C[0]);
      // o coração do espírito, na cor do jogador
      t.pintar(t.mascara().elipse(32, 56, anciao ? 3.4 : 2.4, anciao ? 3.4 : 2.4), misturar(nucleo, "#000000", 0.25));
      t.pintar(t.mascara().elipse(32, 56, anciao ? 2.2 : 1.4, anciao ? 2.2 : 1.4), nucleo); t.set(31, 55, "#ffffff");
      if (anciao) { const v = t.mascara().linha(32, 52, 32, 49).linha(29, 57, 26, 60).linha(35, 57, 38, 60); t.pintar(v, nucleo); }
      // flores (e folhas caindo no ancião)
      for (let k = 0; k < (anciao ? 9 : 4); k++) { let x, y, n = 0; do { x = Math.floor(8 + r() * 48); y = Math.floor(7 + r() * 20); } while (!copa.tem(x, y) && n++ < 20); florzinha(x, y); }
      if (anciao) for (let k = 0; k < 10; k++) { const x = Math.floor(2 + r() * 60), y = Math.floor(30 + r() * 30); if (!tronco.tem(x, y) && !galhos.tem(x, y)) { t.set(x, y, k % 3 ? F[2] : flor); t.set(x + 1, y + 1, k % 3 ? F[1] : flor); } }
    }
    marcas(t, d, r);
  },

  // O "eu arcano" do mago: porte 1 = centelha com um anel; 2 = vulto encapuzado com um círculo; 3 = arquimago com três círculos, coroa de estrelas e orbes.
  arcano(t, d, r) {
    const porte = d.porte ?? 2, cor = d.cor ?? "#c090ff", A = rampa(cor), claro = misturar(cor, "#ffffff", 0.6), manto = rampa(misturar(cor, "#0c0818", 0.78));
    const anel = (cx, cy, R, esp = 1, marcas = 0, fase = 0) => {
      const m = t.mascara().elipse(cx, cy, R, R).apagar(t.mascara().elipse(cx, cy, R - esp, R - esp));
      t.pintar(m, cor);
      for (let k = 0; k < marcas; k++) { const a = fase + (k / marcas) * Math.PI * 2; t.set(Math.round(cx + Math.cos(a) * (R - esp - 1.5)), Math.round(cy + Math.sin(a) * (R - esp - 1.5)), claro); t.set(Math.round(cx + Math.cos(a) * R), Math.round(cy + Math.sin(a) * R), "#ffffff"); }
    };
    const estrela = (x, y, g = 1) => { t.set(x, y, "#ffffff"); for (let k = 1; k <= g; k++) for (const [a, b] of [[k, 0], [-k, 0], [0, k], [0, -k]]) t.set(x + a, y + b, k === g ? cor : claro); };
    if (porte === 1) {
      anel(32, 34, 20, 1, 8);
      // centelha: um núcleo de luz com olhos, e faíscas em volta
      t.carimbar(t.mascara().elipse(32, 34, 10, 11).espinho(32, 24, 8, 32, 12).espinho(25, 28, 6, 19, 18).espinho(39, 28, 6, 45, 18), A, { sombra: 2 });
      t.pintar(t.mascara().elipse(32, 36, 6, 6), claro); t.pintar(t.mascara().elipse(32, 37, 3, 3), "#ffffff");
      olho(t, 28, 33, d.corOlhos, "brilho", 1.5); olho(t, 36, 33, d.corOlhos, "brilho", 1.5);
      for (let k = 0; k < 6; k++) { const a = r() * 6.28, R = 23 + r() * 5; estrela(Math.round(32 + Math.cos(a) * R), Math.round(34 + Math.sin(a) * R), 1); }
    } else {
      const arqui = porte >= 3;
      // círculos atrás
      if (arqui) { anel(32, 26, 29, 1, 12, 0.2); anel(32, 26, 23, 2, 6); t.pintar(t.mascara().linha(32, 4, 51, 37).linha(51, 37, 13, 37).linha(13, 37, 32, 4), misturar(cor, "#000000", 0.25)); anel(32, 26, 15, 1, 0); }
      else { anel(32, 26, 21, 2, 8); anel(32, 26, 14, 1, 0); }
      // manto e capuz
      const corpo = t.mascara().poligono(arqui ? [[6, 63], [16, 40], [48, 40], [58, 63]] : [[10, 63], [19, 41], [45, 41], [54, 63]]);
      const capuz = t.mascara().elipse(32, 27, 13, 14).poligono([[19, 30], [45, 30], [47, 44], [17, 44]]).espinho(32, 15, 14, 32, arqui ? 5 : 8);
      t.carimbar(corpo, manto, { sombra: 2 });
      t.carimbar(capuz, manto, { sombra: 2 });
      // o rosto é um vazio estrelado, só com os olhos do mago
      const rosto = t.mascara().elipse(32, 29, 8, 9);
      t.pintar(rosto, "#07040f");
      olho(t, 28, 29, d.corOlhos, "brilho", arqui ? 1.6 : 1.4); olho(t, 36, 29, d.corOlhos, "brilho", arqui ? 1.6 : 1.4);
      for (const [x, y] of [[30, 23], [35, 25], [29, 34], [34, 35]]) t.set(x, y, claro);
      // bordado do manto e fecho
      t.pintar(t.mascara().linha(32, 44, 32, 63).linha(24, 44, 20, 63).linha(40, 44, 44, 63), A[1]);
      t.pintar(t.mascara().elipse(32, 45, 2.4, 2.4), cor); t.set(32, 45, "#ffffff");
      // mãos de luz segurando um orbe (adepto) ou abrindo três (arquimago)
      const orbe = (x, y, R) => { t.pintar(t.mascara().elipse(x, y, R + 1, R + 1), misturar(cor, "#000000", 0.3)); t.pintar(t.mascara().elipse(x, y, R, R), cor); t.pintar(t.mascara().elipse(x - 0.5, y - 0.5, R * 0.5, R * 0.5), claro); t.set(Math.round(x - 1), Math.round(y - 1), "#ffffff"); };
      if (arqui) { orbe(9, 30, 3); orbe(55, 30, 3); orbe(32, 54, 3.5); for (const x of [22, 27, 32, 37, 42]) estrela(x, 4 + Math.abs(x - 32) / 4, x === 32 ? 2 : 1); t.pintar(t.mascara().linha(12, 33, 18, 44).linha(52, 33, 46, 44), claro); }
      else orbe(32, 54, 3);
      for (let k = 0; k < (arqui ? 14 : 7); k++) { const x = Math.floor(2 + r() * 60), y = Math.floor(2 + r() * 60); if (!corpo.tem(x, y) && !capuz.tem(x, y)) t.set(x, y, k % 2 ? claro : "#ffffff"); }
    }
    marcas(t, d, r);
  },

  aracnideo(t, d, r) {
    const C = rampa(d.cor);
    const pernas = t.mascara();
    for (let k = 0; k < 4; k++) for (const lado of [-1, 1]) {
      const bx = 32 + lado * 8, by = 34 + k * 4, jx = 32 + lado * (20 + k * 2), jy = 14 + k * 8;
      pernas.linha(bx, by, jx, jy, 2).linha(jx, jy, 32 + lado * (28 + k), 40 + k * 7, 2);
    }
    t.carimbar(pernas, C, { sombra: 0 });
    t.carimbar(t.mascara().elipse(32, 52, 15, 12), C, { sombra: 2 });
    t.carimbar(t.mascara().elipse(32, 32, 10, 8), C, { sombra: 2 });
    for (const [x, y, s] of [[28, 30, 1.2], [36, 30, 1.2], [25, 33, 0.9], [39, 33, 0.9], [30, 27, 0.8], [34, 27, 0.8]]) olho(t, x, y, d.corOlhos, "brilho", s);
    dentes(t, [[30, 38], [33, 38]]);
    if (d.marcaCostas) t.carimbar(t.mascara().elipse(32, 54, 4, 5), rampa(d.marcaCostas), { contorno: false });
    marcas(t, d, r);
  },

  centopeia(t, d, r) {
    const C = rampa(d.cor);
    for (let k = 9; k >= 0; k--) {
      const a = k / 9 * Math.PI * 1.2, x = 32 + Math.cos(a + 1.6) * 22, y = 34 + Math.sin(a + 1.6) * 22;
      const pern = t.mascara().linha(x - 8, y + 2, x - 12, y + 8).linha(x + 8, y + 2, x + 12, y + 8);
      t.carimbar(pern, C, { sombra: 0 });
      t.carimbar(t.mascara().elipse(x, y, 8, 6), C, { sombra: 2 });
      t.set(Math.round(x), Math.round(y) - 3, d.corRebite ?? "#c9cacd");
    }
    t.carimbar(t.mascara().elipse(30, 14, 9, 7), C, { sombra: 2 });
    t.carimbar(t.mascara().poligono([[24, 18], [22, 26], [27, 20]]).poligono([[36, 18], [38, 26], [33, 20]]), rampa("#d8c8a0"));
    olho(t, 27, 12, d.corOlhos, "brilho", 1);
    olho(t, 33, 12, d.corOlhos, "brilho", 1);
    marcas(t, d, r);
  },

  cranio(t, d, r) {
    const C = rampa(d.cor ?? "#e2d8bf");
    const m = t.mascara().elipse(36, 26, 20, 16).poligono([[20, 30], [4, 40], [6, 48], [34, 44]]);
    m.apagar(t.mascara().elipse(30, 24, 6, 5)).apagar(t.mascara().elipse(46, 24, 5, 4));
    t.carimbar(m, C, { sombra: 2 });
    t.carimbar(t.mascara().poligono([[10, 50], [40, 46], [44, 56], [12, 58]]), C, { sombra: 2 });
    dentes(t, [[10, 46], [15, 45], [20, 45], [25, 44], [14, 49], [20, 49]]);
    olho(t, 30, 24, d.corOlhos, "brilho", 2.4);
    olho(t, 46, 24, d.corOlhos, "brilho", 1.8);
    t.pintar(t.mascara().linha(40, 10, 44, 18).linha(52, 30, 56, 36), C[0]);
    if (d.chifres !== false) t.carimbar(t.mascara().poligono([[44, 12], [50, 12], [62, 0], [58, 0]]), C);
    marcas(t, d, r);
  },

  coracao(t, d, r) {
    const C = rampa(d.cor ?? "#8a7a6a");
    t.carimbar(t.mascara().elipse(24, 26, 13, 13).elipse(40, 26, 13, 13).poligono([[11, 30], [53, 30], [32, 58]]), C, { sombra: 2 });
    const veias = t.mascara();
    for (let k = 0; k < 6; k++) { let x = 20 + k * 5, y = 14; for (let s = 0; s < 6; s++) { const nx = x + (r() - 0.5) * 6, ny = y + 5; veias.linha(x, y, nx, ny); x = nx; y = ny; } }
    t.pintar(veias.intersectar(t.mascara().elipse(24, 26, 13, 13).elipse(40, 26, 13, 13).poligono([[11, 30], [53, 30], [32, 58]])), d.corVeias ?? "#7fffd4");
    t.carimbar(t.mascara().retangulo(26, 4, 30, 14).retangulo(34, 2, 38, 14), C);
    marcas(t, d, r);
  },

  redemoinho(t, d, r) {
    const c = rampa(d.cor ?? "#bff0ff");
    for (let k = 0; k < 7; k++) {
      const w = 6 + k * 3.5, y = 60 - k * 8;
      const anel = t.mascara().elipse(32 + Math.sin(k) * 3, y, w, 3).apagar(t.mascara().elipse(32 + Math.sin(k) * 3, y + 1, w - 2, 2));
      t.pintar(anel, k % 2 ? c[2] : c[3]);
    }
    t.carimbar(t.mascara().elipse(32, 28, 4, 4), rampa(d.corNucleo ?? "#ffffff"));
    olho(t, 26, 20, d.corOlhos, "brilho", 1.2);
    olho(t, 38, 20, d.corOlhos, "brilho", 1.2);
    marcas(t, d, r);
  },

  enxame(t, d, r) {
    const cranio = t.mascara().elipse(32, 28, 16, 15).retangulo(22, 36, 42, 48);
    cranio.apagar(t.mascara().elipse(25, 28, 4, 5)).apagar(t.mascara().elipse(39, 28, 4, 5)).apagar(t.mascara().poligono([[31, 34], [33, 34], [32, 38]]));
    for (let i = 0; i < cranio.m.length; i++) if (cranio.m[i] && r() < 0.45) t.px[i] = r() < 0.6 ? d.cor ?? "#ffb02a" : "#ff5a1a";
    olho(t, 25, 28, d.corOlhos ?? "#fff07a", "brilho", 1.8);
    olho(t, 39, 28, d.corOlhos ?? "#fff07a", "brilho", 1.8);
    for (let k = 0; k < 40; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), "#ffb02a");
  },
};

// Marcas extras para qualquer criatura
function marcas(t, d, r) {
  for (const m of d.marcas ?? []) {
    if (m === "magma") { const v = t.mascara(); for (let k = 0; k < 5; k++) v.linha(10 + r() * 44, 20 + r() * 30, 10 + r() * 44, 20 + r() * 30); t.pintar(v.intersectar(naoVazio(t)), "#ff7a1a"); }
    if (m === "anel-eclipse") { t.pintar(t.mascara().elipse(32, 54, 5, 5).apagar(t.mascara().elipse(32, 54, 3, 3)), "#0d0015"); t.set(35, 51, "#ff7a3d"); }
    if (m === "geada") for (let k = 0; k < 16; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), "#e6fbff");
    if (m === "raios") { const v = t.mascara(); let x = 50, y = 0; while (y < 60) { const nx = x + (r() - 0.5) * 8; v.linha(x, y, nx, y + 6); x = nx; y += 6; } t.pintar(v, "#fff07a"); }
    if (m === "corrente") for (let k = 0; k < 10; k++) t.carimbar(t.mascara().elipse(4 + k * 6, 40 + (k % 2), 2, 1.3), rampa("#3a3a40"));
    if (m === "brasas") for (let k = 0; k < 16; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), r() < 0.5 ? "#ffb02a" : "#ff5a1a");
    if (m === "olho-terceiro") olho(t, 34, 16, d.corOlhos, "brilho", 1.2);
    if (m === "mascara-quebrada") t.carimbar(t.mascara().poligono([[20, 40], [30, 40], [28, 48], [21, 47]]), rampa("#f0ebe0"));
    if (m === "moedas") for (let k = 0; k < 6; k++) t.carimbar(t.mascara().elipse(14 + k * 7, 8 + (k % 2) * 3, 2, 2), rampa("#e6b422"), { contorno: false });
    if (m === "ninho-ouro") t.carimbar(t.mascara().elipse(32, 60, 16, 4), rampa("#c8a040"));
    if (m === "ponte") t.carimbar(t.mascara().retangulo(40, 34, 63, 38), rampa("#1c1820"));
    if (m === "bigodes") t.pintar(t.mascara().linha(14, 33, 4, 31).linha(14, 35, 4, 37).linha(24, 34, 32, 32), "#f4f0e6");
    if (m === "foices") for (const x of [18, 44]) t.carimbar(t.mascara().poligono([[x, 63], [x + 3, 63], [x + 10, 50], [x + 6, 48]]), rampa("#dfe8f0"));
    if (m === "mascara-tanuki") t.pintar(t.mascara().elipse(29, 26, 5, 3).elipse(41, 26, 4, 3).apagar(t.mascara().elipse(29, 25, 2.4, 2.4)).apagar(t.mascara().elipse(41, 25, 2.2, 2.2)), "#2a1a14");
    if (m === "presas") { t.carimbar(t.mascara().poligono([[17, 36], [20, 36], [15, 28]]).poligono([[24, 37], [27, 37], [24, 29]]), rampa("#f4f0e6")); }
    if (m === "coroa-espirito") { const c = t.mascara(); for (const x of [26, 31, 36]) c.espinho(x, 6, 4, x, 0); c.retangulo(24, 6, 38, 7); t.carimbar(c, rampa(d.corCoroa ?? "#ffd23a")); }
    if (m === "chamas-roxas") for (let k = 0; k < 18; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 64), r() < 0.5 ? "#a050ff" : "#d0a0ff");
    if (m === "estrelas") for (let k = 0; k < 12; k++) { const x = Math.floor(r() * 64), y = Math.floor(r() * 64); t.set(x, y, "#fff6c0"); t.set(x + 1, y, "#c0a0ff"); }
    if (m === "olhos-corpo") for (const [x, y] of [[24, 50], [36, 52], [46, 46]]) { t.pintar(t.mascara().elipse(x, y, 2, 1.5), "#ffd23a"); t.set(x, y, "#1a1024"); }
    if (m === "barcos") for (const x of [6, 50]) t.carimbar(t.mascara().poligono([[x, 58], [x + 8, 58], [x + 6, 61], [x + 2, 61]]), rampa("#8a6a40"));
  }
}
function naoVazio(t) {
  const m = t.mascara();
  for (let i = 0; i < t.px.length; i++) m.m[i] = 1;
  return m;
}

export function desenharCriatura(t, d) {
  const r = rng(d.id ?? "criatura");
  FOFO = !!d.fofo;
  (ARQ[d.tipo] ?? ARQ.espirito)(t, d, r);
  FOFO = false;
}

export const ARQUETIPOS_CRIATURA = Object.keys(ARQ);
