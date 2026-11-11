// Cenas em pixel art (96×64) para os locais do mundo: céu do reino + silhueta ao fundo + peça principal do tipo de cena
// + partículas do elemento. Sem dependências; determinístico pela semente (o mesmo local sempre tem a mesma imagem).
import { Tela, rng } from "../avatar/pixel.mjs";
import { rampa, misturar } from "../avatar/paletas.mjs";
import { degrade } from "../avatar/fundo.mjs";

export const W = 96, H = 64;
const TEMA = {
  Homura: { ceu: ["#1a0508", "#5a120c", "#c8481a"], longe: "#3a0c0a", chao: "#2a1614", chao2: "#4a2a22", luz: "#ffb02a", folha: "#e8602a", agua: "#ff6a1a", pedra: "#4a3a3a", telhado: "#8a1a1a", parede: "#c8b8a0" },
  Watatsumi: { ceu: ["#061a30", "#0e3a5a", "#4aa0c0"], longe: "#0a2a44", chao: "#1c4a5a", chao2: "#2e6a78", luz: "#bff0ff", folha: "#3a9a8a", agua: "#2a8ac0", pedra: "#5a7a8a", telhado: "#165e83", parede: "#e8f0f0" },
  Daichi: { ceu: ["#1c1408", "#5a4420", "#e0b060"], longe: "#3a2c18", chao: "#4a3a1e", chao2: "#6a5a2a", luz: "#ffe08a", folha: "#4a8a3a", agua: "#4a8aa0", pedra: "#7a6a5a", telhado: "#5a3a24", parede: "#d8c8a0" },
  "Fūjin": { ceu: ["#1a3a4a", "#4a90a8", "#d8f0f0"], longe: "#3a6a7a", chao: "#6a8a7a", chao2: "#8aaa8a", luz: "#ffffff", folha: "#7ac0a0", agua: "#7ad0e0", pedra: "#8a9aa0", telhado: "#46a7ad", parede: "#f4f4ec" },
  "Kokū": { ceu: ["#05030a", "#14101e", "#3a3448"], longe: "#0e0c16", chao: "#1e1c24", chao2: "#2e2c34", luz: "#c0a0ff", folha: "#5a5a66", agua: "#2a2438", pedra: "#4a4852", telhado: "#3a3448", parede: "#8a8892" },
};

function ctx(reino, semente) {
  const P = TEMA[reino] ?? TEMA["Kokū"];
  const t = new Tela(W, H);
  const r = rng(semente);
  const m = () => t.mascara();
  const bloco = (x0, y0, x1, y1, cor, opts) => t.carimbar(m().retangulo(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1)), rampa(cor), opts);
  const plano = (x0, y0, x1, y1, cor) => t.pintar(m().retangulo(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1)), cor);
  const poli = (pts, cor, opts) => t.carimbar(m().poligono(pts), rampa(cor), opts);
  const oval = (cx, cy, rx, ry, cor, opts) => t.carimbar(m().elipse(cx, cy, rx, ry), rampa(cor), opts);
  const ponto = (x, y, cor) => t.set(Math.round(x), Math.round(y), cor);
  return { P, t, r, m, bloco, plano, poli, oval, ponto };
}

// ── Peças reutilizáveis ──
function ceuEFundo(c, { horizonte = 44, silhueta = "montanhas" } = {}) {
  const { P, t, r, m } = c;
  degrade(t, P.ceu);
  // astro
  const ax = 14 + Math.floor(r() * 68), ay = 8 + Math.floor(r() * 10);
  t.pintar(m().elipse(ax, ay, 4, 4), misturar(P.ceu[2], "#ffffff", 0.55));
  t.pintar(m().elipse(ax, ay, 2.5, 2.5), misturar(P.luz, "#ffffff", 0.4));
  const s = m();
  if (silhueta === "montanhas") for (let x = -8; x < W + 8; x += 14 + Math.floor(r() * 10)) s.poligono([[x - 16, horizonte], [x + (r() - 0.5) * 6, horizonte - 10 - r() * 16], [x + 16, horizonte]]);
  if (silhueta === "ilhas") for (let k = 0; k < 4; k++) { const x = 8 + r() * 80, y = 14 + r() * 18; s.elipse(x, y, 7 + r() * 5, 2.5).poligono([[x - 6, y], [x + 6, y], [x, y + 6 + r() * 4]]); }
  if (silhueta === "torres") for (let x = 4; x < W; x += 9 + Math.floor(r() * 8)) { const h = 6 + r() * 16; s.retangulo(x, Math.round(horizonte - h), x + 3 + Math.floor(r() * 4), horizonte); }
  if (silhueta === "arvores") for (let x = 0; x < W; x += 7) { const h = 10 + r() * 12; s.elipse(x + 3, horizonte - h, 5, 6).retangulo(x + 2, Math.round(horizonte - h), x + 4, horizonte); }
  t.pintar(s, P.longe);
  return horizonte;
}
function chao(c, y0, cor = c.P.chao, cor2 = c.P.chao2) {
  const { t, r } = c;
  for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) t.set(x, y, (x + y * 3 + Math.floor(r() * 3)) % 7 === 0 ? cor2 : cor);
}
function agua(c, y0, cor = c.P.agua) {
  const { t, r } = c;
  const clara = misturar(cor, "#ffffff", 0.35), escura = misturar(cor, "#000000", 0.3);
  for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) t.set(x, y, (x + y * 2) % 9 === 0 && r() < 0.7 ? clara : y > y0 + 6 && (x * 3 + y) % 11 === 0 ? escura : cor);
}
function casa(c, x, y, w, h, { telhado = c.P.telhado, parede = c.P.parede, porta = true, pagode = false } = {}) {
  const { bloco, poli, plano, P } = c;
  bloco(x, y - h, x + w, y, parede, { sombra: 2 });
  poli(pagode ? [[x - 3, y - h], [x + w + 3, y - h], [x + w - 1, y - h - 5], [x + 1, y - h - 5]] : [[x - 2, y - h], [x + w + 2, y - h], [x + w / 2, y - h - Math.max(4, w / 2.4)]], telhado);
  if (porta) plano(x + Math.floor(w / 2) - 1, y - 5, x + Math.floor(w / 2) + 1, y, misturar(P.chao, "#000000", 0.5));
  if (w >= 9) plano(x + 2, y - h + 3, x + 3, y - h + 4, P.luz);
}
function arvore(c, x, y, tam = 1, cor = c.P.folha) {
  const { bloco, oval } = c;
  bloco(x - 1, y - 6 * tam, x + 1, y, "#5a3a24");
  oval(x, y - 9 * tam, 5 * tam, 5 * tam, cor);
  oval(x - 3 * tam, y - 6 * tam, 3 * tam, 3 * tam, cor);
  oval(x + 3 * tam, y - 7 * tam, 3 * tam, 3 * tam, cor);
}
function pessoas(c, y, n = 3) {
  const { r, plano, ponto } = c;
  for (let k = 0; k < n; k++) {
    const x = 6 + Math.floor(r() * 84), cor = ["#c0392b", "#2a6a8a", "#8a6a2a", "#5a3a6a", "#3a7a4a"][Math.floor(r() * 5)];
    plano(x, y - 3, x + 1, y, cor); ponto(x, y - 4, "#e8b48f"); ponto(x + 1, y - 4, "#2b2b45");
  }
}
function lanterna(c, x, y) { c.ponto(x, y - 1, "#3a2a1a"); c.plano(x - 1, y, x + 1, y + 2, c.P.luz); c.ponto(x, y + 1, "#ffffff"); }
function particulas(c, reino, n = 26) {
  const { r, ponto, P } = c;
  for (let k = 0; k < n; k++) {
    const x = r() * W, y = r() * H;
    if (reino === "Homura") ponto(x, y, r() < 0.5 ? "#ffb02a" : "#ff6a1a");
    else if (reino === "Watatsumi") { ponto(x, y, "#bfe6ff"); if (r() < 0.4) ponto(x, y + 1, "#7fd1ff"); }
    else if (reino === "Daichi") ponto(x, y, r() < 0.5 ? "#e8d080" : "#8ad050");
    else if (reino === "Fūjin") { ponto(x, y, "#ffffff"); ponto(x + 1, y, "#e6faff"); ponto(x + 2, y, "#bfe0e8"); }
    else ponto(x, y, r() < 0.3 ? P.luz : "#5a5466");
  }
}

// ── Cenas ──
const CENAS = {
  vila(c) { const h = ceuEFundo(c); chao(c, h); const { r } = c; for (let k = 0; k < 4; k++) casa(c, 6 + k * 22 + Math.floor(r() * 4), 50 + (k % 2) * 6, 11 + Math.floor(r() * 4), 8); pessoas(c, 60, 3); },
  cidade(c) { const h = ceuEFundo(c, { silhueta: "torres", horizonte: 40 }); chao(c, h); casa(c, 4, 48, 16, 12, { pagode: true }); casa(c, 76, 48, 16, 13, { pagode: true });
    c.bloco(44, 36, 50, 54, c.P.pedra); c.oval(47, 33, 4, 5, c.P.luz, { contorno: false }); c.oval(47, 32, 2, 3, "#ffffff", { contorno: false }); c.bloco(38, 54, 56, 56, c.P.pedra); pessoas(c, 61, 5); lanterna(c, 26, 38); lanterna(c, 70, 38); },
  mercado(c) { const h = ceuEFundo(c, { silhueta: "torres", horizonte: 40 }); chao(c, h);
    for (let k = 0; k < 4; k++) { const x = 5 + k * 23, cor = ["#c0392b", "#e6b422", "#2a8a8a", "#7a3fb0"][k]; c.bloco(x, 44, x + 1, 56, "#5a3a24"); c.bloco(x + 14, 44, x + 15, 56, "#5a3a24"); c.poli([[x - 2, 46], [x + 17, 46], [x + 15, 40], [x, 40]], cor); c.bloco(x + 1, 52, x + 14, 56, "#8a6a40"); for (let i = 0; i < 4; i++) c.ponto(x + 3 + i * 3, 51, ["#ff6a1a", "#8ad050", "#ffe060", "#bfe6ff"][i]); }
    pessoas(c, 62, 5); },
  forja(c) { const h = ceuEFundo(c); chao(c, h); casa(c, 8, 52, 30, 16, { porta: false }); c.plano(14, 42, 24, 52, "#1a0a08"); c.oval(19, 48, 4, 3, "#ff6a1a", { contorno: false }); c.oval(19, 48, 2, 1.5, "#ffe060", { contorno: false });
    c.bloco(52, 50, 64, 53, "#3a3a44"); c.bloco(55, 53, 61, 57, "#2a2a32"); c.bloco(70, 40, 72, 57, "#5a3a24"); c.bloco(66, 38, 76, 42, "#6a6a74"); c.bloco(30, 24, 34, 36, c.P.pedra); for (let k = 0; k < 6; k++) c.ponto(31 + c.r() * 3, 22 - k * 3, "#6a625c"); },
  taverna(c) { const h = ceuEFundo(c, { silhueta: "arvores" }); chao(c, h); casa(c, 24, 54, 46, 20, { pagode: true }); c.plano(32, 40, 38, 46, c.P.luz); c.plano(56, 40, 62, 46, c.P.luz); lanterna(c, 22, 40); lanterna(c, 72, 40); c.bloco(76, 44, 77, 54, "#5a3a24"); c.bloco(74, 42, 84, 46, "#8a6a40"); pessoas(c, 61, 2); },
  templo(c) { const h = ceuEFundo(c); chao(c, h); for (let k = 0; k < 5; k++) c.bloco(30 - k * 2, 56 - k * 3, 66 + k * 2, 58 - k * 3, c.P.pedra, { sombra: 1 });
    c.bloco(34, 20, 37, 44, "#b0102f"); c.bloco(59, 20, 62, 44, "#b0102f"); c.bloco(28, 18, 68, 21, "#8a0c24"); c.bloco(31, 25, 65, 27, "#b0102f"); c.poli([[26, 18], [70, 18], [66, 14], [30, 14]], "#2b2b2b"); lanterna(c, 22, 46); lanterna(c, 74, 46); },
  mina(c) { degrade(c.t, c.P.ceu); c.poli([[0, 64], [0, 22], [20, 10], [48, 6], [78, 12], [96, 24], [96, 64]], c.P.pedra, { sombra: 2 }); chao(c, 54);
    c.oval(48, 46, 16, 14, "#0a0608", { plano: true }); c.plano(32, 46, 64, 58, "#0a0608"); c.bloco(30, 30, 33, 58, "#5a3a24"); c.bloco(63, 30, 66, 58, "#5a3a24"); c.bloco(28, 28, 68, 31, "#6a4a2a");
    c.bloco(40, 58, 56, 59, "#3a3a44"); for (let x = 40; x < 57; x += 4) c.plano(x, 57, x, 60, "#5a3a24"); lanterna(c, 36, 34); for (let k = 0; k < 5; k++) c.ponto(10 + c.r() * 76, 14 + c.r() * 30, c.P.luz); },
  caverna(c) { degrade(c.t, [c.P.ceu[0], misturar(c.P.pedra, "#000000", 0.6), misturar(c.P.pedra, "#000000", 0.3)]); const { r } = c;
    for (let x = 0; x < W; x += 6 + Math.floor(r() * 6)) { c.poli([[x - 4, 0], [x + 5, 0], [x + r() * 3, 8 + r() * 16]], c.P.pedra); c.poli([[x - 5, 64], [x + 6, 64], [x + r() * 3, 54 - r() * 12]], c.P.pedra); }
    c.oval(48, 36, 14, 9, misturar(c.P.luz, c.P.ceu[1], 0.6), { contorno: false }); c.oval(48, 36, 8, 5, misturar(c.P.luz, c.P.ceu[1], 0.3), { contorno: false }); c.oval(48, 36, 3, 2, c.P.luz, { contorno: false }); },
  ruina(c) { const h = ceuEFundo(c); chao(c, h); const { r } = c; for (let k = 0; k < 6; k++) { const x = 6 + k * 15 + Math.floor(r() * 4), alt = 8 + Math.floor(r() * 18); c.bloco(x, 52 - alt, x + 4, 54, c.P.pedra, { sombra: 2 }); if (r() < 0.6) c.bloco(x - 1, 50 - alt, x + 5, 52 - alt, c.P.pedra); else c.poli([[x, 52 - alt], [x + 4, 52 - alt], [x + 1, 48 - alt]], c.P.pedra); }
    c.bloco(20, 55, 34, 57, c.P.pedra); c.bloco(58, 57, 70, 59, c.P.pedra); },
  floresta(c) { const h = ceuEFundo(c, { silhueta: "arvores", horizonte: 40 }); chao(c, h, misturar(c.P.folha, "#000000", 0.55), misturar(c.P.folha, "#000000", 0.35)); const { r } = c;
    for (let k = 0; k < 4; k++) arvore(c, 10 + k * 25 + Math.floor(r() * 6), 52 + (k % 2) * 6, 1.6 + r() * 0.6); for (let k = 0; k < 8; k++) c.ponto(r() * W, 30 + r() * 30, c.P.luz); },
  porto(c) { const h = ceuEFundo(c, { silhueta: "ilhas", horizonte: 38 }); agua(c, h); c.bloco(0, 50, 60, 53, "#8a6a40"); for (let x = 4; x < 60; x += 10) c.bloco(x, 53, x + 1, 62, "#5a3a24");
    c.poli([[62, 46], [90, 46], [86, 53], [66, 53]], "#6a4a2a"); c.bloco(75, 22, 76, 46, "#5a3a24"); c.poli([[77, 24], [77, 42], [90, 42]], "#f0ece0"); casa(c, 6, 50, 14, 9); pessoas(c, 49, 3); },
  palacio(c) { const h = ceuEFundo(c, { horizonte: 42 }); chao(c, h); c.bloco(22, 34, 74, 54, c.P.parede, { sombra: 2 }); c.poli([[16, 34], [80, 34], [72, 27], [24, 27]], c.P.telhado); c.bloco(32, 20, 64, 27, c.P.parede); c.poli([[27, 20], [69, 20], [62, 14], [34, 14]], c.P.telhado);
    c.bloco(42, 8, 54, 14, c.P.parede); c.poli([[38, 8], [58, 8], [48, 2]], c.P.telhado); c.plano(44, 42, 52, 54, misturar(c.P.chao, "#000000", 0.5)); for (const x of [28, 36, 60, 68]) c.plano(x, 40, x + 2, 44, c.P.luz); c.bloco(40, 54, 56, 56, c.P.pedra); },
  ponte(c) { const h = ceuEFundo(c, { horizonte: 36 }); agua(c, h); c.poli([[0, 40], [0, 34], [26, 30], [26, 40]], c.P.pedra); c.poli([[96, 40], [96, 34], [70, 30], [70, 40]], c.P.pedra);
    const arco = c.m(); for (let x = 20; x <= 76; x++) { const y = 34 - Math.round(8 * Math.sin(((x - 20) / 56) * Math.PI)); arco.retangulo(x, y, x, y + 3); } c.t.carimbar(arco, rampa("#3a3a44")); for (let x = 24; x <= 72; x += 8) c.bloco(x, 26, x, 30, "#2a2a32"); },
  campo(c) { const h = ceuEFundo(c); chao(c, h, "#c8a040", "#e8c860"); const { r } = c; for (let k = 0; k < 60; k++) c.ponto(r() * W, h + 2 + r() * 18, "#a88030");
    c.bloco(66, 30, 74, 52, c.P.parede); c.poli([[64, 30], [76, 30], [70, 24]], c.P.telhado); const p = c.m().linha(70, 30, 58, 20, 2).linha(70, 30, 82, 20, 2).linha(70, 30, 60, 40, 2).linha(70, 30, 80, 40, 2); c.t.pintar(p, "#8a6a40");
    c.poli([[14, 54], [30, 54], [22, 42]], "#e8e0c8"); c.poli([[30, 56], [42, 56], [36, 47]], "#d8c8a0"); pessoas(c, 61, 2); },
  montanha(c) { degrade(c.t, c.P.ceu); c.poli([[-10, 64], [20, 14], [40, 40], [62, 6], [106, 64]], c.P.pedra, { sombra: 2 }); c.poli([[14, 24], [20, 14], [26, 24], [22, 22], [19, 25]], "#f4f4f4"); c.poli([[55, 18], [62, 6], [69, 18], [64, 16], [60, 19]], "#f4f4f4");
    chao(c, 56); const trilha = c.m().linha(48, 62, 40, 50, 2).linha(40, 50, 52, 40, 2).linha(52, 40, 46, 30, 2); c.t.pintar(trilha, misturar(c.P.chao2, "#ffffff", 0.3)); },
  arena(c) { const h = ceuEFundo(c, { silhueta: "torres", horizonte: 34 }); chao(c, h); c.oval(48, 40, 44, 16, c.P.pedra, { sombra: 2 }); c.oval(48, 42, 36, 11, misturar(c.P.pedra, "#000000", 0.35), { contorno: false }); c.oval(48, 46, 28, 8, "#1c1414", { plano: true });
    const { r } = c; for (let k = 0; k < 40; k++) c.ponto(14 + r() * 68, 31 + r() * 6, ["#c0392b", "#e6b422", "#f0ece0"][Math.floor(r() * 3)]); for (const x of [8, 88]) { c.bloco(x, 18, x + 1, 34, "#5a3a24"); c.poli([[x + 2, 18], [x + 2, 25], [x + 9, 21]], "#b0102f"); } pessoas(c, 50, 2); },
  biblioteca(c) { degrade(c.t, [misturar(c.P.ceu[0], "#2a1a10", 0.5), misturar(c.P.ceu[1], "#3a2a1a", 0.5), misturar(c.P.ceu[1], "#5a4a2a", 0.4)]); chao(c, 54, "#3a2a1e", "#4a3a28"); const { r } = c;
    for (let s = 0; s < 4; s++) { const x = 4 + s * 24; c.bloco(x, 8, x + 16, 54, "#5a3a24", { sombra: 2 }); for (let y = 12; y < 52; y += 8) { c.plano(x + 1, y + 6, x + 15, y + 6, "#3a2414"); for (let b = 0; b < 7; b++) c.plano(x + 1 + b * 2, y + 1 + Math.floor(r() * 2), x + 2 + b * 2, y + 5, ["#b0102f", "#165e83", "#42602d", "#e6b422", "#7a3fb0", "#d8c8a0"][Math.floor(r() * 6)]); } }
    lanterna(c, 22, 4); lanterna(c, 70, 4); },
  torre(c) { const h = ceuEFundo(c, { horizonte: 46 }); chao(c, h); c.bloco(40, 10, 56, 56, c.P.parede, { sombra: 3 }); c.poli([[37, 10], [59, 10], [48, 0]], c.P.telhado); for (let y = 16; y < 50; y += 9) c.plano(47, y, 49, y + 3, c.P.luz); c.plano(45, 48, 51, 56, misturar(c.P.chao, "#000000", 0.5));
    c.bloco(36, 26, 60, 27, c.P.pedra); c.bloco(36, 40, 60, 41, c.P.pedra); },
  vazio(c) { degrade(c.t, ["#000000", "#0a0612", "#1e1630"]); const { r } = c; for (let k = 0; k < 40; k++) c.ponto(r() * W, r() * H, r() < 0.2 ? "#c0a0ff" : "#3a3448");
    c.oval(48, 30, 20, 20, "#7b3fb0", { plano: true, contorno: false }); c.oval(48, 30, 18, 18, "#ff7a3d", { plano: true, contorno: false }); c.oval(48, 30, 16.5, 16.5, "#000000", { plano: true, contorno: false });
    chao(c, 54, "#0e0c16", "#1e1c24"); c.poli([[30, 54], [66, 54], [56, 48], [40, 48]], "#1e1c24"); },
  pantano(c) { const h = ceuEFundo(c, { silhueta: "arvores", horizonte: 38 }); agua(c, h, misturar(c.P.agua, "#2a3a1a", 0.6)); const { r } = c;
    for (let k = 0; k < 4; k++) { const x = 10 + k * 24 + r() * 6; c.bloco(x, 26, x + 2, 52, "#3a2a1a"); c.t.pintar(c.m().linha(x + 1, 30, x - 6, 22).linha(x + 1, 34, x + 8, 26).linha(x + 1, 28, x + 5, 20), "#3a2a1a"); }
    for (let k = 0; k < 5; k++) { const x = 8 + r() * 80, y = 46 + r() * 14; c.ponto(x, y, "#ffe060"); c.ponto(x + 2, y, "#ffe060"); } c.oval(30, 58, 6, 2, "#3a6a2a", { contorno: false }); c.oval(70, 54, 5, 1.5, "#3a6a2a", { contorno: false }); },
  gelo(c) { degrade(c.t, ["#0a1a2a", "#2a5a7a", "#bfe6ff"]); const { r } = c; for (let x = -4; x < W; x += 10 + Math.floor(r() * 8)) c.poli([[x, 50], [x + 12, 50], [x + 5 + r() * 3, 16 + r() * 22]], "#9ad8ff", { sombra: 2 });
    chao(c, 50, "#e6f4ff", "#bfe0f0"); c.poli([[36, 56], [52, 56], [44, 44]], "#8a6a40"); c.oval(60, 57, 2, 2, "#ff6a1a", { contorno: false }); c.ponto(60, 54, "#ffe060"); },
  lago(c) { const h = ceuEFundo(c, { horizonte: 34 }); const { t } = c; for (let y = h; y < H; y++) for (let x = 0; x < W; x++) { const e = t.get(x, Math.max(0, h - 1 - (y - h))); t.set(x, y, misturar(e ?? c.P.agua, c.P.agua, 0.45)); }
    for (let k = 0; k < 14; k++) { const x = c.r() * W, y = h + 3 + c.r() * 26; c.plano(x, y, x + 3 + c.r() * 4, y, misturar(c.P.agua, "#ffffff", 0.5)); } c.bloco(0, 56, 22, 58, "#8a6a40"); c.bloco(4, 58, 5, 63, "#5a3a24"); c.bloco(16, 58, 17, 63, "#5a3a24"); },
  ceu(c) { degrade(c.t, c.P.ceu); const { r } = c; for (let k = 0; k < 6; k++) c.oval(r() * W, 44 + r() * 18, 10 + r() * 8, 3, "#f4f8f8", { contorno: false });
    for (const [x, y, w] of [[26, 30, 16], [64, 22, 12], [80, 42, 9]]) { c.poli([[x - w, y], [x + w, y], [x + w / 3, y + w * 0.9], [x - w / 3, y + w * 0.8]], c.P.pedra); c.oval(x, y, w, 2.5, c.P.folha); if (w > 10) casa(c, x - 5, y - 1, 10, 7, { pagode: true }); }
    c.t.pintar(c.m().linha(34, 31, 56, 24).linha(70, 26, 76, 40), "#8a6a40"); },
};

/** PNG da cena de um local. tipo: chave de CENAS; reino: id do reino; semente: texto estável (ex.: "R-HOM-3:mina"). */
export function renderCena(tipo, reino, semente = "cena", escala = 6) {
  const c = ctx(reino, semente);
  (CENAS[tipo] ?? CENAS.ruina)(c);
  particulas(c, reino);
  // moldura fina
  for (let x = 0; x < W; x++) { c.t.set(x, 0, "#0d0b14"); c.t.set(x, H - 1, "#0d0b14"); }
  for (let y = 0; y < H; y++) { c.t.set(0, y, "#0d0b14"); c.t.set(W - 1, y, "#0d0b14"); }
  return c.t.png(escala);
}
export const TIPOS_CENA = Object.keys(CENAS);
