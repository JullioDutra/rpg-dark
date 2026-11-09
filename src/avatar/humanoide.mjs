// Personagens humanoides em pixel art estilo anime (busto 64×64).
// Sistema modular tipo "criador de personagem": cada parte tem estilos e cores escolhíveis.
import { Tela, rng } from "./pixel.mjs";
import { rampa, PELE, CABELO, OLHOS, misturar } from "./paletas.mjs";

const CX = 31.5; // eixo de simetria do rosto (entre os pixels 31 e 32)

// ─────────────────────────────── CATÁLOGO (o que o jogador pode escolher) ───────────────────────────────
export const CATALOGO = {
  rosto: ["oval", "fino", "redondo", "quadrado", "largo"],
  pele: Object.keys(PELE),
  olhos: ["grande", "afiado", "cansado", "feliz", "dragao", "brilho", "vazio", "redondo"],
  corOlhos: Object.keys(OLHOS),
  sobrancelha: ["neutra", "brava", "triste", "grossa", "nenhuma"],
  boca: ["neutra", "sorriso", "sorriso-torto", "seria", "presa", "aberta", "lingua", "triste"],
  cabelo: ["espetado", "baguncado", "franja-longa", "longo", "flutuante", "rabo", "trancas", "tranca-lateral",
    "careca", "meio-raspado", "coque", "chanel"],
  corCabelo: Object.keys(CABELO),
  roupa: ["quimono", "samurai", "placas", "manto-alto", "corte", "jaqueta-penas", "trapos", "robe-mago",
    "sagrada", "couraca-osso", "nu"],
  acessorios: ["coroa-sol", "coroa-perolas", "coroa-penas", "coroa-rachada", "chifres-oni", "chifres-pequenos",
    "chifres-dragao", "orelhas-raposa", "orelhas-lobo", "orelhas-gato", "oculos", "mascara-branca", "mascara-meia",
    "mascara-tengu", "bandana", "hachimaki", "cachecol", "pena", "barba", "barba-curta", "barba-trancada", "bigode", "cicatriz",
    "olho-obsidiana", "tapa-olho", "sardas", "curativo", "rubor", "pintura-crescente", "veias-vazio", "anel-eclipse",
    "fios-prata", "colar-perolas", "gota", "correntes", "chapeu-juiz", "chapeu-corte", "cartola", "capuz",
    "brasas", "raizes", "halo", "luvas", "fitas-agua", "pelagem", "prato", "chapeu-palha", "cristais",
    "asas-penas", "asas-morcego", "nariz-tengu", "oculos-aviador", "kabuto", "bandagem-boca", "rosto-buraco", "sombra-dragao"],
};

// ─────────────────────────────── ROSTO ───────────────────────────────
function mascaraRosto(t, forma) {
  const m = t.mascara();
  switch (forma) {
    case "fino": m.elipse(CX, 23, 9.5, 10).poligono([[22.5, 24], [41.5, 24], [34, 36], [32, 37.5], [30, 36]]); break;
    case "redondo": m.elipse(CX, 25, 10.5, 11); break;
    case "quadrado": m.elipse(CX, 22, 11, 9).poligono([[21, 22], [43, 22], [42, 32], [37, 36.5], [27, 36.5], [22, 32]]); break;
    case "largo": m.elipse(CX, 23.5, 12, 10.5).poligono([[20.5, 26], [43.5, 26], [39, 35.5], [25, 35.5]]); break;
    default: m.elipse(CX, 23.5, 10, 10.5).poligono([[22.5, 26], [41.5, 26], [35, 35.5], [32, 36.5], [29, 35.5]]);
  }
  return m;
}

// Olhos 6×5 (olho esquerdo; o direito é espelhado). K contorno/cílio, D íris escura, E íris, L íris clara,
// W brilho, S esclera.
const OLHO = {
  grande: [".KKKK.", "KWDDDK", "KDEEDS", "SELLES", ".SSSS."],
  afiado: ["KKKKKK", ".DEEWK", "..KKK."],
  cansado: ["KKKKKK", "KKDDKK", ".DEEW.", "..SS.."],
  feliz: ["......", ".KKKK.", "K....K"],
  dragao: [".KKKK.", "KWEDEK", "KEEDES", "SELDLS", ".SSSS."],
  brilho: [".LLLL.", "LWWWWL", "LWWWWL", ".LLLL."],
  vazio: [".KKKK.", "KKKKKK", "KKKKKK", ".KKKK."],
  redondo: [".KKKK.", "KSDDSK", "KSDWSK", ".KKKK."],
};

function olhos(t, estilo, cor, pele, y0 = 25) {
  const ram = rampa(cor);
  const brilhoForte = estilo === "brilho";
  const cores = {
    K: "#1a1024", D: ram[1], E: ram[2], L: ram[3], W: brilhoForte ? misturar(cor, "#ffffff", 0.7) : "#ffffff",
    S: misturar(pele[3], "#ffffff", 0.5),
  };
  if (brilhoForte) Object.assign(cores, { L: ram[2] });
  const s = OLHO[estilo] ?? OLHO.grande;
  t.sprite(s, 23, y0, cores);
  t.sprite(s, 35, y0, cores, true);
}

function sobrancelhas(t, estilo, cor, y = 22) {
  const c = rampa(cor)[0];
  const desenhos = {
    neutra: [[24, y], [25, y], [26, y], [27, y]],
    brava: [[24, y - 1], [25, y - 1], [26, y], [27, y], [28, y + 1]],
    triste: [[24, y + 1], [25, y], [26, y], [27, y - 1]],
    grossa: [[24, y], [25, y], [26, y], [27, y], [28, y], [24, y - 1], [25, y - 1], [26, y - 1], [27, y - 1]],
    nenhuma: [],
  };
  for (const [x, yy] of desenhos[estilo] ?? desenhos.neutra) {
    t.set(x, yy, c);
    t.set(63 - x, yy, c);
  }
}

const BOCA = {
  neutra: [["KKK"], 31],
  seria: [["KK"], 31],
  sorriso: [["K...K", ".KKK."], 30],
  "sorriso-torto": [["...K", "KKK."], 31],
  presa: [["KKKKK", ".W..."], 30],
  aberta: [[".KK.", "KRRK", ".KK."], 31],
  lingua: [["KKKK", ".RR."], 30],
  triste: [[".KK.", "K..K"], 31],
};
function boca(t, estilo, pele, y = 33) {
  const [s, x] = BOCA[estilo] ?? BOCA.neutra;
  t.sprite(s, x, y, { K: misturar(pele[0], pele[1], 0.35), R: "#c43a4a", W: "#ffffff" });
}

// ─────────────────────────────── CABELO ───────────────────────────────
// Retorna { tras: Mascara, frente: Mascara }
function cabelo(t, estilo, r) {
  const tras = t.mascara(), frente = t.mascara();
  const capa = () => frente.elipse(CX, 15.5, 11.5, 7.5).retangulo(21, 15, 42, 19);
  const franja = (pontas = [23, 27, 31, 35, 39], fundo = 22, larg = 5) => {
    pontas.forEach((x, i) => frente.espinho(x + 0.5, 16, larg, x + (i % 2 ? 1 : -1), Math.min(fundo, 23) - (i % 2) * 2));
  };
  const mechasLaterais = (ate = 32) => {
    frente.poligono([[20.5, 17], [23.5, 17], [23, ate], [21, ate - 3]]);
    frente.poligono([[40, 17], [43, 17], [42.5, ate - 3], [40.5, ate]]);
  };
  switch (estilo) {
    case "careca":
      break;
    case "espetado": {
      capa();
      for (let a = -170; a <= -10; a += 22) {
        const rad = (a * Math.PI) / 180, len = 9 + r() * 4;
        const bx = CX + Math.cos(rad) * 9, by = 15 + Math.sin(rad) * 6;
        frente.espinho(bx, by + 1, 6, bx + Math.cos(rad) * len, by + Math.sin(rad) * len);
      }
      frente.espinho(20, 19, 5, 15, 24).espinho(43, 19, 5, 48, 24);
      franja([24, 29, 34, 39], 24, 6);
      break;
    }
    case "baguncado":
      capa();
      for (let a = -170; a <= -10; a += 18) {
        const rad = (a * Math.PI) / 180, len = 4 + r() * 3;
        const bx = CX + Math.cos(rad) * 10, by = 15 + Math.sin(rad) * 7;
        frente.espinho(bx, by + 1, 5, bx + Math.cos(rad + (r() - 0.5)) * len, by + Math.sin(rad) * len);
      }
      franja([23, 26, 30, 34, 38, 41], 24, 4);
      mechasLaterais(28);
      break;
    case "franja-longa":
      capa();
      franja([24, 28, 35, 39], 23, 6);
      frente.espinho(31.5, 16, 4, 32, 29);
      for (let a = -150; a <= -30; a += 30) {
        const rad = (a * Math.PI) / 180;
        frente.espinho(CX + Math.cos(rad) * 9, 17 + Math.sin(rad) * 7, 5, CX + Math.cos(rad) * 15, 17 + Math.sin(rad) * 12);
      }
      mechasLaterais(30);
      break;
    case "longo":
      capa();
      tras.poligono([[19, 16], [45, 16], [50, 58], [44, 63], [20, 63], [14, 58]]);
      franja([23, 27, 31, 35, 39], 25, 5);
      mechasLaterais(46);
      break;
    case "flutuante":
      capa();
      for (let k = 0; k < 7; k++) {
        const lado = k % 2 ? 1 : -1, y = 18 + k * 5;
        tras.poligono([[CX + lado * 8, y - 4], [CX + lado * 8, y + 4], [CX + lado * (22 + r() * 8), y + 2 + r() * 6]]);
      }
      tras.elipse(CX, 30, 15, 16);
      franja([23, 27, 31, 35, 39], 26, 5);
      mechasLaterais(44);
      break;
    case "rabo":
      capa();
      tras.poligono([[40, 10], [46, 8], [56, 30], [54, 50], [48, 40], [42, 18]]);
      tras.elipse(43, 11, 3, 3);
      franja([24, 28, 32, 36, 40], 24, 5);
      break;
    case "trancas":
      capa();
      franja([23, 27, 31, 35, 39], 23, 5);
      for (const lado of [-1, 1]) for (let k = 0; k < 5; k++) frente.elipse(CX + lado * 12, 27 + k * 3.4, 2.3, 1.8);
      break;
    case "tranca-lateral":
      capa();
      franja([23, 27, 31, 35, 39], 24, 5);
      mechasLaterais(30);
      for (let k = 0; k < 9; k++) frente.elipse(19 - (k > 3 ? 1 : 0), 30 + k * 3.3, 2.2, 1.9);
      break;
    case "meio-raspado":
      frente.elipse(CX + 3, 17, 10, 8).retangulo(30, 17, 43, 21);
      for (let a = -100; a <= -10; a += 18) {
        const rad = (a * Math.PI) / 180;
        frente.espinho(CX + 3 + Math.cos(rad) * 8, 17 + Math.sin(rad) * 6, 5, CX + 5 + Math.cos(rad) * 15, 17 + Math.sin(rad) * 11);
      }
      tras.poligono([[38, 16], [46, 18], [48, 44], [42, 40]]);
      franja([33, 37, 41], 27, 5);
      break;
    case "coque":
      capa();
      frente.elipse(CX, 7, 4, 3.5);
      franja([24, 29, 35, 40], 21, 6);
      mechasLaterais(26);
      break;
    case "chanel":
      capa();
      frente.poligono([[20, 17], [24, 17], [24, 34], [20, 34]]).poligono([[40, 17], [44, 17], [44, 34], [40, 34]]);
      frente.retangulo(22, 17, 42, 21);
      break;
  }
  return { tras, frente };
}

// ─────────────────────────────── ROUPA ───────────────────────────────
function torso(t) {
  return t.mascara().poligono([[5, 64], [9, 50], [20, 42.5], [44, 42.5], [55, 50], [59, 64]]);
}

function roupa(t, estilo, [prim, sec, dest], pele) {
  const P = rampa(prim), S = rampa(sec), D = rampa(dest);
  const base = torso(t);
  if (estilo === "nu") { t.carimbar(base, pele); return; }
  t.carimbar(base, P, { sombra: 2 });
  const gola = t.mascara();
  switch (estilo) {
    case "quimono": {
      gola.poligono([[24, 42], [29, 42], [34, 56], [31, 58]]).poligono([[35, 42], [40, 42], [33, 56], [30, 54]]);
      t.carimbar(gola, S);
      const pele2 = t.mascara().poligono([[29, 42], [35, 42], [32, 51]]);
      t.carimbar(pele2, pele, { contorno: false });
      t.carimbar(t.mascara().retangulo(14, 59, 50, 63), D, { contorno: true });
      break;
    }
    case "samurai": {
      t.carimbar(t.mascara().retangulo(23, 47, 41, 63), S);
      for (let y = 50; y < 64; y += 3) t.pintar(t.mascara().retangulo(24, y, 40, y), P[1]);
      for (const lado of [-1, 1]) {
        const m = t.mascara().poligono([[CX + lado * 11, 43], [CX + lado * 25, 45], [CX + lado * 29, 58], [CX + lado * 14, 56]]);
        t.carimbar(m, P, { sombra: 1 });
        for (let y = 47; y < 58; y += 3) t.pintar(t.mascara().linha(CX + lado * 13, y, CX + lado * 27, y + 2).intersectar(m), P[1]);
        t.pintar(t.mascara().linha(CX + lado * 12, 44, CX + lado * 26, 46).intersectar(m), D[2]);
      }
      t.carimbar(t.mascara().poligono([[28, 42], [36, 42], [32, 47]]), pele, { contorno: false });
      break;
    }
    case "placas": {
      for (const lado of [-1, 1]) t.carimbar(t.mascara().retangulo(lado < 0 ? 6 : 44, 44, lado < 0 ? 20 : 58, 56), P, { sombra: 2 });
      t.carimbar(t.mascara().retangulo(22, 46, 42, 63), S);
      for (const [x, y] of [[9, 47], [17, 47], [47, 47], [55, 47], [25, 49], [39, 49]]) t.set(x, y, D[3]);
      break;
    }
    case "manto-alto": {
      for (const lado of [-1, 1]) t.carimbar(t.mascara().poligono([[CX + lado * 4, 44], [CX + lado * 6, 30], [CX + lado * 12, 34], [CX + lado * 13, 46]]), P);
      t.carimbar(t.mascara().poligono([[29, 44], [35, 44], [32, 63]]), S, { contorno: true });
      const emb = t.mascara().elipse(42, 54, 3.5, 3.5);
      t.carimbar(emb, S, { contorno: true });
      t.pintar(t.mascara().elipse(44, 53, 2.5, 2.5).intersectar(emb), P[2]);
      break;
    }
    case "corte": {
      for (let k = 0; k < 3; k++) {
        const g = t.mascara().poligono([[22 - k * 3, 42], [26 - k * 3, 42], [32, 60 - k * 2], [38 + k * 3, 42], [42 + k * 3, 42], [32, 64]]);
        t.carimbar(g, [S, D, P][k % 3], { contorno: true });
      }
      t.carimbar(t.mascara().poligono([[27, 42], [37, 42], [32, 52]]), pele, { contorno: false });
      break;
    }
    case "jaqueta-penas": {
      t.carimbar(t.mascara().poligono([[28, 42], [36, 42], [34, 63], [30, 63]]), S);
      for (const lado of [-1, 1]) for (let k = 0; k < 4; k++)
        t.carimbar(t.mascara().espinho(CX + lado * (16 + k * 3), 47, 5, CX + lado * (19 + k * 4), 40 + k), rampa("#ffffff"));
      break;
    }
    case "trapos": {
      t.carimbar(t.mascara().poligono([[26, 42], [38, 42], [32, 50]]), pele, { contorno: false });
      t.carimbar(t.mascara().retangulo(12, 52, 18, 57), S);
      t.carimbar(t.mascara().retangulo(44, 55, 49, 60), D);
      t.carimbar(t.mascara().retangulo(14, 60, 50, 63), rampa("#8a6a40"));
      break;
    }
    case "robe-mago": {
      t.carimbar(t.mascara().poligono([[14, 42], [50, 42], [46, 48], [18, 48]]), S);
      t.carimbar(t.mascara().poligono([[29, 47], [35, 47], [35, 63], [29, 63]]), D);
      t.carimbar(t.mascara().elipse(32, 54, 3, 3), S);
      break;
    }
    case "sagrada": {
      t.carimbar(t.mascara().poligono([[18, 44], [46, 44], [42, 63], [22, 63]]), rampa("#f2f2ea"));
      t.carimbar(t.mascara().poligono([[32, 45], [34, 52], [32, 61], [30, 52]]).poligono([[25, 53], [32, 51], [39, 53], [32, 55]]), D, { contorno: true });
      for (const lado of [-1, 1]) t.carimbar(t.mascara().elipse(CX + lado * 20, 48, 8, 5), rampa("#e6e6dc"));
      break;
    }
    case "couraca-osso": {
      for (let k = 0; k < 5; k++) t.carimbar(t.mascara().elipse(32, 47 + k * 3.5, 11 - k, 1.4), rampa("#e2d8bf"));
      break;
    }
  }
}

// ─────────────────────────────── ACESSÓRIOS ───────────────────────────────
// fase: "tras" (atrás da cabeça), "rosto" (sobre o rosto, sob o cabelo), "frente" (sobre tudo)
const ACESSORIO = {
  "coroa-sol": ["tras", (t, c) => {
    const m = t.mascara();
    for (let a = -165; a <= -15; a += 15) {
      const r = (a * Math.PI) / 180;
      m.espinho(CX + Math.cos(r) * 13, 16 + Math.sin(r) * 11, 4, CX + Math.cos(r) * 22, 16 + Math.sin(r) * 19);
    }
    t.carimbar(m, rampa("#e6b422"));
  }],
  "coroa-perolas": ["frente", (t) => {
    for (let k = -3; k <= 3; k++) t.carimbar(t.mascara().elipse(CX + k * 3.5, 10 - (3 - Math.abs(k)) * 0.8, 1.4, 1.4), rampa("#f8f4e6"), { luz: 1 });
  }],
  "coroa-penas": ["frente", (t) => {
    const m = t.mascara();
    for (let k = 0; k < 3; k++) m.espinho(41 + k * 2, 13, 3, 46 + k * 3, 4 + k);
    t.carimbar(m, rampa("#ffffff"));
  }],
  "coroa-rachada": ["frente", (t, c) => {
    const m = t.mascara().retangulo(22, 9, 42, 11);
    for (const x of [23, 28, 32, 36, 41]) m.espinho(x, 9, 3, x, 3);
    t.carimbar(m, rampa(c.destaque ?? "#e6b422"));
    t.pintar(t.mascara().linha(30, 3, 34, 11), "#0d0015");
  }],
  "chifres-oni": ["frente", (t) => {
    const m = t.mascara().poligono([[23, 13], [27, 11], [22, 1], [19, 3]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa("#e8e0d0"));
  }],
  "chifres-pequenos": ["frente", (t) => {
    const m = t.mascara().poligono([[25, 12], [28, 11], [24, 6]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa("#3a1a2a"));
  }],
  "chifres-dragao": ["tras", (t) => {
    const m = t.mascara().poligono([[22, 15], [25, 12], [12, 2], [10, 4], [18, 10]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa("#7a2a1a"));
  }],
  "orelhas-raposa": ["tras", (t, c) => {
    const m = t.mascara().poligono([[20, 15], [27, 10], [18, 1]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa(c.cabelo));
    const d = t.mascara().poligono([[21, 13], [25, 11], [20, 5]]);
    d.espelhar(31.5);
    t.pintar(d, "#f7c8c8");
  }],
  "orelhas-lobo": ["tras", (t, c) => {
    const m = t.mascara().poligono([[19, 17], [26, 11], [16, 4]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa(c.cabelo));
  }],
  "orelhas-gato": ["tras", (t, c) => {
    const m = t.mascara().poligono([[21, 14], [27, 11], [21, 5]]);
    m.espelhar(31.5);
    t.carimbar(m, rampa(c.cabelo));
  }],
  oculos: ["frente", (t) => {
    const m = t.mascara().elipse(26, 27, 4, 3.5).elipse(38, 27, 4, 3.5);
    const dentro = t.mascara().elipse(26, 27, 3, 2.5).elipse(38, 27, 3, 2.5);
    m.apagar(dentro).linha(30, 26, 33, 26);
    t.pintar(m, "#2a2440");
    t.pintar(t.mascara().elipse(26, 27, 4, 3.5).apagar(dentro).intersectar(t.mascara().retangulo(0, 0, 63, 25)), "#d8dde8");
    t.pintar(t.mascara().elipse(38, 27, 4, 3.5).apagar(dentro).intersectar(t.mascara().retangulo(0, 0, 63, 25)), "#d8dde8");
    t.set(24, 25, "#ffffff"); t.set(36, 25, "#ffffff");
  }],
  "mascara-branca": ["rosto", (t, c) => {
    t.carimbar(mascaraRosto(t, c.rosto), rampa("#f4f2ee"));
    t.pintar(t.mascara().retangulo(24, 27, 28, 27).retangulo(36, 27, 40, 27), "#1a1024");
  }],
  "mascara-meia": ["rosto", (t, c) => {
    const m = mascaraRosto(t, c.rosto).intersectar(t.mascara().retangulo(32, 14, 44, 38));
    t.carimbar(m, rampa("#f0ebe0"));
    t.pintar(t.mascara().retangulo(36, 27, 40, 28), "#1a1024");
  }],
  "mascara-tengu": ["rosto", (t) => {
    t.carimbar(t.mascara().elipse(CX, 27, 9, 6).poligono([[30, 27], [34, 27], [32, 38]]), rampa("#c8102e"));
    t.pintar(t.mascara().retangulo(24, 25, 28, 26).retangulo(36, 25, 40, 26), "#1a1024");
  }],
  bandana: ["frente", (t, c) => {
    t.carimbar(t.mascara().retangulo(20, 15, 44, 18).poligono([[43, 16], [52, 20], [50, 24], [44, 19]]), rampa(c.destaque ?? "#c0392b"));
  }],
  hachimaki: ["frente", (t) => {
    t.carimbar(t.mascara().retangulo(21, 18, 43, 19).poligono([[42, 18], [50, 15], [51, 19]]), rampa("#f4f4f4"));
    t.set(32, 18, "#c8102e"); t.set(33, 18, "#c8102e");
  }],
  cachecol: ["frente", (t, c) => {
    t.carimbar(t.mascara().elipse(CX, 41, 12, 3.5).poligono([[38, 40], [60, 30], [63, 36], [42, 44]]), rampa(c.destaque ?? "#4a8c4a"));
  }],
  pena: ["frente", (t, c) => {
    t.carimbar(t.mascara().espinho(44, 22, 3, 50, 9), rampa(c.corPena ?? "#1a1a1a"));
  }],
  barba: ["frente", (t, c) => {
    t.carimbar(t.mascara().poligono([[23, 31], [40, 31], [38, 38], [31.5, 41], [25, 38]]).apagar(t.mascara().elipse(31.5, 33.5, 3, 1.3)), rampa(c.cabelo));
  }],
  "barba-trancada": ["frente", (t, c) => {
    const m = t.mascara().poligono([[22, 31], [41, 31], [40, 39], [31.5, 43], [23, 39]]).apagar(t.mascara().elipse(31.5, 33.5, 3, 1.3));
    for (let k = 0; k < 6; k++) m.elipse(32, 43 + k * 3, 2.5, 1.8);
    t.carimbar(m, rampa(c.cabelo));
    for (let k = 0; k < 3; k++) t.set(32, 46 + k * 6, "#c9cacd");
  }],
  "barba-curta": ["frente", (t, c) => {
    t.carimbar(t.mascara().poligono([[26, 35], [37, 35], [35, 38], [31.5, 39.5], [28, 38]]), rampa(c.cabelo), { contorno: false });
  }],
  bigode: ["frente", (t, c) => {
    t.carimbar(t.mascara().poligono([[27, 32], [37, 32], [40, 35], [32, 33], [24, 35]]), rampa(c.cabelo));
  }],
  cicatriz: ["frente", (t) => {
    t.pintar(t.mascara().linha(39, 20, 37, 33), "#8a2030");
  }],
  "olho-obsidiana": ["frente", (t) => {
    t.carimbar(t.mascara().elipse(37.5, 27, 2.6, 2.3), rampa("#141018"));
    t.set(37, 27, "#ff5a1a"); t.set(38, 27, "#ffb02a"); t.set(36, 26, "#ffffff");
  }],
  "tapa-olho": ["frente", (t) => {
    t.carimbar(t.mascara().elipse(38, 27, 3.2, 2.8), rampa("#1c1c1c"));
    t.pintar(t.mascara().linha(22, 21, 44, 27), "#1c1c1c");
  }],
  sardas: ["rosto", (t, c) => { for (const [x, y] of [[25, 31], [27, 32], [24, 32], [37, 32], [39, 31], [40, 32]]) t.set(x, y, c.pele[1]); }],
  rubor: ["rosto", (t) => { for (const x of [24, 25, 39, 40]) t.set(x, 31, "#f08a9a"); }],
  curativo: ["rosto", (t) => { t.pintar(t.mascara().retangulo(30, 29, 34, 30), "#f4e2c4"); }],
  "pintura-crescente": ["rosto", (t) => {
    t.pintar(t.mascara().elipse(32, 18, 4, 4).apagar(t.mascara().elipse(34, 17, 3.2, 3.2)), "#8f8a84");
  }],
  "veias-vazio": ["frente", (t) => {
    const m = t.mascara().linha(22, 28, 26, 36).linha(26, 36, 24, 42).linha(40, 20, 42, 30).linha(18, 48, 26, 58).linha(46, 50, 42, 62);
    t.pintar(m, "#0d0015");
  }],
  "anel-eclipse": ["frente", (t) => {
    const anel = t.mascara().elipse(32, 54, 5, 5).apagar(t.mascara().elipse(32, 54, 3, 3));
    t.pintar(anel, "#0d0015");
    t.pintar(t.mascara().elipse(34, 52, 2, 2).intersectar(anel), "#ff7a3d");
  }],
  "fios-prata": ["frente", (t) => {
    const m = t.mascara();
    for (let k = 0; k < 4; k++) m.linha(4 + k * 3, 63, 20 + k * 6, 46 - k * 2);
    t.pintar(m, "#e8ecf4");
  }],
  "colar-perolas": ["frente", (t) => {
    for (let k = -4; k <= 4; k++) t.carimbar(t.mascara().elipse(32 + k * 2.3, 45 + (4 - Math.abs(k)) * 0.7, 1, 1), rampa("#3a3a50"), { contorno: false });
  }],
  gota: ["frente", (t) => {
    t.carimbar(t.mascara().elipse(52, 16, 2, 2.4).espinho(52, 14, 2, 52, 11), rampa("#7fd1ff"));
  }],
  correntes: ["frente", (t) => {
    for (let k = 0; k < 9; k++) t.carimbar(t.mascara().elipse(10 + k * 5, 46 + k * 2, 1.8, 1.2), rampa("#2a2a2e"));
    for (let k = 0; k < 6; k++) t.carimbar(t.mascara().elipse(54 - k * 5, 52 + k * 2, 1.8, 1.2), rampa("#2a2a2e"));
  }],
  "chapeu-juiz": ["frente", (t) => {
    t.carimbar(t.mascara().retangulo(20, 4, 44, 12).retangulo(16, 11, 48, 13), rampa("#1a1a1a"));
    t.pintar(t.mascara().retangulo(28, 6, 36, 8), "#e6b422");
  }],
  "chapeu-corte": ["frente", (t) => {
    t.carimbar(t.mascara().poligono([[24, 14], [40, 14], [38, 1], [27, 1]]), rampa("#141414"));
  }],
  cartola: ["frente", (t) => {
    t.carimbar(t.mascara().retangulo(23, 3, 41, 12).retangulo(17, 12, 47, 14), rampa("#222222"));
    t.pintar(t.mascara().retangulo(23, 10, 41, 11), "#7a1f3d");
  }],
  capuz: ["frente", (t, c) => {
    const m = t.mascara().elipse(CX, 22, 16, 17).poligono([[14, 26], [50, 26], [56, 50], [8, 50]]);
    m.apagar(t.mascara().elipse(CX, 27, 11, 13).retangulo(22, 27, 42, 40));
    t.carimbar(m, rampa(c.roupa[0]));
  }],
  brasas: ["frente", (t, c, r) => {
    for (let k = 0; k < 14; k++) t.set(Math.floor(r() * 64), Math.floor(r() * 50), r() < 0.5 ? "#ffb02a" : "#ff5a1a");
  }],
  raizes: ["frente", (t) => {
    const m = t.mascara().linha(20, 63, 14, 54).linha(14, 54, 8, 52).linha(44, 63, 50, 55).linha(50, 55, 57, 53).linha(30, 63, 28, 58);
    t.pintar(m, "#ffd56a");
  }],
  halo: ["tras", (t, c) => {
    const m = t.mascara().elipse(CX, 18, 20, 20).apagar(t.mascara().elipse(CX, 18, 18, 18));
    t.pintar(m, c.aura ?? "#fff0a0");
  }],
  luvas: ["frente", () => {}],
  prato: ["frente", (t) => {
    t.carimbar(t.mascara().elipse(CX, 8, 8, 2.5), rampa("#e8e4d8"));
    t.pintar(t.mascara().elipse(CX, 8, 6, 1.2), "#5ab0e8");
  }],
  "chapeu-palha": ["frente", (t) => {
    t.carimbar(t.mascara().poligono([[10, 16], [54, 16], [CX, 2]]), rampa("#d8b060"));
    t.pintar(t.mascara().linha(16, 13, 47, 13), "#a07a30");
  }],
  cristais: ["frente", (t, c, r) => {
    const m = t.mascara().espinho(24, 30, 3, 21, 22).espinho(39, 30, 3, 42, 23).espinho(12, 48, 4, 8, 36).espinho(52, 48, 4, 56, 37);
    t.carimbar(m, rampa("#e080ff"));
  }],
  "asas-penas": ["tras", (t, c) => {
    for (const lado of [-1, 1]) {
      const m = t.mascara().poligono([[CX + lado * 8, 40], [CX + lado * 30, 4], [CX + lado * 31, 30], [CX + lado * 16, 56]]);
      for (let k = 0; k < 4; k++) m.espinho(CX + lado * (22 + k * 2), 20 + k * 8, 8, CX + lado * (33 - k), 28 + k * 9);
      t.carimbar(m, rampa(c.corAsas ?? "#2a2a2e"), { sombra: 2 });
    }
  }],
  "asas-morcego": ["tras", (t, c) => {
    for (const lado of [-1, 1]) t.carimbar(t.mascara().poligono([[CX + lado * 10, 42], [CX + lado * 31, 2], [CX + lado * 28, 22], [CX + lado * 31, 40], [CX + lado * 22, 36], [CX + lado * 18, 54]]), rampa(c.corAsas ?? "#2a1030"));
  }],
  "nariz-tengu": ["frente", (t) => {
    t.carimbar(t.mascara().poligono([[30, 29], [33, 29], [22, 40], [21, 38]]), rampa("#c8102e"));
  }],
  "oculos-aviador": ["frente", (t) => {
    const m = t.mascara().elipse(25, 14, 3.5, 3).elipse(38, 14, 3.5, 3).retangulo(20, 13, 43, 14);
    t.carimbar(m, rampa("#8a6a40"));
    t.pintar(t.mascara().elipse(25, 14, 2, 1.6).elipse(38, 14, 2, 1.6), "#9ad8ff");
  }],
  kabuto: ["frente", (t, c) => {
    const m = t.mascara().elipse(CX, 15, 13, 9).retangulo(17, 15, 46, 19).apagar(t.mascara().retangulo(0, 20, 63, 63));
    m.poligono([[16, 19], [22, 19], [14, 28]]).poligono([[41, 19], [47, 19], [49, 28]]);
    t.carimbar(m, rampa(c.roupa?.[1] ?? "#2a2a2a"));
    const crista = t.mascara();
    if (c.crista === "serra") for (let k = 0; k < 5; k++) crista.espinho(24 + k * 4, 8, 4, 25 + k * 4, 0);
    else crista.poligono([[CX, 8], [18, 0], [21, 0], [CX, 5], [42, 0], [45, 0]]);
    t.carimbar(crista, rampa(c.destaque ?? "#e6b422"));
  }],
  "bandagem-boca": ["frente", (t) => {
    t.carimbar(t.mascara().retangulo(23, 31, 40, 37), rampa("#d8d0c0"), { luz: 0 });
    t.pintar(t.mascara().linha(23, 33, 40, 34).linha(23, 35, 40, 36), "#b0a890");
  }],
  "rosto-buraco": ["frente", (t, c) => {
    t.pintar(t.mascara().elipse(CX, 28, 7, 8), "#000000");
    t.pintar(t.mascara().elipse(CX, 28, 8, 9).apagar(t.mascara().elipse(CX, 28, 7, 8)).intersectar(t.mascara().retangulo(0, 0, 63, 63)), "#5b2a86");
  }],
  "sombra-dragao": ["tras", (t) => {
    const cab = t.mascara().elipse(50, 14, 12, 9).poligono([[42, 9], [42, 20], [6, 19], [8, 12]]).poligono([[54, 6], [57, 9], [63, 0], [60, 0]]).poligono([[46, 6], [49, 7], [50, 0], [47, 0]]);
    cab.poligono([[40, 22], [8, 23], [10, 28], [42, 28]]).retangulo(52, 18, 63, 40);
    t.carimbar(cab, ["#ff7a3d", "#1c0830", "#2e0e4a", "#4a1a6e"], { sombra: 2 });
    for (const x of [10, 15, 20, 25, 30]) { t.set(x, 20, "#f4f0e6"); t.set(x + 2, 22, "#f4f0e6"); }
    t.pintar(t.mascara().elipse(45, 12, 2.4, 1.5), "#ff7a3d");
    t.set(45, 12, "#ffe0a0");
  }],
  "fitas-agua": ["frente", (t) => {
    const m = t.mascara();
    for (let x = 4; x < 60; x++) { m.ponto(x, 40 + Math.round(Math.sin(x / 5) * 4)); m.ponto(x, 56 + Math.round(Math.cos(x / 6) * 3)); }
    t.pintar(m, "#7fd1ff");
  }],
  pelagem: ["frente", (t, c) => {
    const m = t.mascara();
    for (let x = 6; x <= 58; x += 4) m.elipse(x, 46 + Math.abs(x - 32) / 6, 3.5, 3);
    t.carimbar(m, rampa(c.corPelagem ?? "#4a3a30"));
  }],
};

// ─────────────────────────────── MONTAGEM ───────────────────────────────
export function desenharHumanoide(t, d) {
  const r = rng(d.id ?? JSON.stringify(d));
  const pele = PELE[d.pele] ?? PELE.media;
  const corCabelo = CABELO[d.corCabelo] ?? d.corCabelo ?? CABELO.preto;
  const ctx = {
    rosto: d.rosto ?? "oval", pele, cabelo: corCabelo, roupa: d.corRoupa, destaque: d.corRoupa?.[2],
    aura: d.aura, corPena: d.corPena, corPelagem: d.corPelagem, corAsas: d.corAsas, crista: d.crista,
  };
  const acess = (d.acessorios ?? []).filter((a) => ACESSORIO[a]);
  const fase = (f) => acess.filter((a) => ACESSORIO[a][0] === f).forEach((a) => ACESSORIO[a][1](t, ctx, r));

  const hair = cabelo(t, d.cabelo ?? "baguncado", r);
  fase("tras");
  t.carimbar(hair.tras, rampa(corCabelo), { sombra: 2 });
  roupa(t, d.roupa ?? "quimono", d.corRoupa, pele);
  t.carimbar(t.mascara().retangulo(28, 33, 36, 43), [pele[0], pele[1], pele[1], pele[1]]);
  const rosto = mascaraRosto(t, d.rosto);
  rosto.elipse(21.5, 27, 1.2, 2.2).elipse(42.5, 27, 1.2, 2.2); // orelhas
  t.carimbar(rosto, pele);
  if (d.cabelo === "meio-raspado") t.pintar(t.mascara().elipse(26, 16, 6, 4).intersectar(rosto), pele[1]);
  olhos(t, d.olhos ?? "grande", OLHOS[d.corOlhos] ?? d.corOlhos ?? OLHOS.castanho, pele);
  sobrancelhas(t, d.sobrancelha ?? "neutra", corCabelo);
  t.set(33, 31, pele[1]);
  boca(t, d.boca ?? "neutra", pele);
  fase("rosto");
  t.carimbar(hair.frente, rampa(corCabelo), { sombra: 1 });
  // brilho de cabelo estilo anime: faixa clara em arco no alto da cabeça
  const brilho = t.mascara().elipse(CX - 2, 13, 8, 4).apagar(t.mascara().elipse(CX - 2, 14.5, 8, 4)).intersectar(hair.frente);
  t.pintar(brilho, misturar(rampa(corCabelo)[3], "#ffffff", 0.35));
  if (d.chamasNoCabelo) for (let k = 0; k < 18; k++) {
    const x = 14 + Math.floor(r() * 36), y = 1 + Math.floor(r() * 10);
    t.set(x, y, k % 3 ? "#ff7a1a" : "#ffd23a");
  }
  fase("frente");
}
