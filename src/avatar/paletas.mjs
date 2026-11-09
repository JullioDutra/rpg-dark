// Paletas do criador de avatares. Toda cor vira uma rampa de 4 tons: [contorno, sombra, base, luz].

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (r) => "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

export function misturar(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(A.map((v, i) => v + (B[i] - v) * t));
}

// Sombra puxa para roxo-azulado e luz para amarelado (truque clássico de pixel art: "hue shifting").
export function rampa(base) {
  if (Array.isArray(base)) return base;
  return [
    misturar(misturar(base, "#1a0f2e", 0.55), "#000000", 0.45),
    misturar(base, "#2a1846", 0.32),
    base,
    misturar(base, "#fff4d6", 0.38),
  ];
}

export const PELE = {
  clara: ["#5a2e2a", "#e3ab92", "#f7d5c0", "#fff1e6"],
  media: ["#4a2618", "#c98a63", "#e8b48f", "#f7d6b9"],
  morena: ["#3a1e12", "#9a5f3c", "#bd7f55", "#d9a07a"],
  escura: ["#22120a", "#5e3622", "#7f4b30", "#a06642"],
  palida: ["#3d3448", "#b6b0c9", "#e4e0f0", "#ffffff"],
  cinza: ["#25262b", "#7c7f8a", "#a8abb5", "#d3d5dc"],
  azulada: ["#142338", "#5f86a8", "#8fb4cf", "#c7e0ef"],
  esverdeada: ["#1b2a14", "#5d7a45", "#86a565", "#b7cf95"],
  vermelha: ["#2b0a0a", "#8f2a22", "#c2463a", "#e8806f"],
  pedra: ["#1f1d1b", "#6f6a62", "#97918a", "#c3beb6"],
  osso: ["#2e2a22", "#b9ad92", "#e2d8bf", "#fffaf0"],
  espectral: ["#18324a", "#8fd3e8", "#c9f1fb", "#ffffff"],
};

export const CABELO = {
  preto: "#2b2b45", castanho: "#6b3e26", ruivo: "#c0392b", fogo: "#e8402a", loiro: "#e8c35a",
  branco: "#e9ebf3", prata: "#b9bfd0", cinza: "#8a8a92", "cinza-cinza": "#9a9590", "azul-escuro": "#24407a",
  azul: "#3f7fd6", "verde-agua": "#4fd1c5", verde: "#4a8c4a", rosa: "#f08ab4", roxo: "#7d4fc4", vinho: "#7a1f3d",
};

export const OLHOS = {
  ambar: "#f0a020", vermelho: "#e0303a", azul: "#3a8ee8", "verde-agua": "#38d0c0", cinza: "#9aa3b5",
  roxo: "#9a5cf0", dourado: "#ffd23a", prata: "#d8dde8", castanho: "#8a5a32", preto: "#2a2a35",
  verde: "#4cc060", rosa: "#ff7ab8", branco: "#f4f6ff",
};

// Cores de roupa por reino (primária, secundária, destaque) — derivadas das paletas tradicionais (doc 20)
export const ROUPA_REINO = {
  Homura: ["#b0102f", "#2b2b2b", "#e6b422"],
  Watatsumi: ["#165e83", "#f0ece0", "#80aba9"],
  Daichi: ["#5a3a24", "#42602d", "#c47222"],
  "Fūjin": ["#eef0f0", "#46a7ad", "#f8b500"],
  "Kokū": ["#6e6e70", "#d8d8d4", "#2b2b2b"],
  Eclipse: ["#1a0f2a", "#c9cacd", "#7b3fb0"],
};

export const ELEMENTO = {
  Fogo: { aura: "#ff6a2a", fundo: ["#2a0606", "#5a0f0a", "#a8260e"], tema: "fogo" },
  Lava: { aura: "#ff4a10", fundo: ["#200404", "#4f0b05", "#8f2208"], tema: "fogo" },
  Explosão: { aura: "#ffa020", fundo: ["#2a1004", "#5a2208", "#a8460e"], tema: "fogo" },
  Cinzas: { aura: "#c9c0b6", fundo: ["#1a1716", "#3a3532", "#6a625c"], tema: "cinzas" },
  Água: { aura: "#3aa0ff", fundo: ["#04122a", "#0a2a52", "#14558a"], tema: "agua" },
  Gelo: { aura: "#bff0ff", fundo: ["#0a1a2a", "#1c3c5a", "#4a7fa0"], tema: "gelo" },
  Espelho: { aura: "#e6faff", fundo: ["#0e1620", "#24384a", "#5a7a90"], tema: "agua" },
  Veneno: { aura: "#9cff57", fundo: ["#0a1a06", "#1f3a10", "#3f6a1c"], tema: "pantano" },
  Terra: { aura: "#e0b050", fundo: ["#140e06", "#3a2a12", "#6a4e22"], tema: "terra" },
  Metal: { aura: "#cfd8dc", fundo: ["#0e1012", "#2a3036", "#4f5a62"], tema: "terra" },
  Cristal: { aura: "#f080ff", fundo: ["#140620", "#2e1048", "#5a2a80"], tema: "cristal" },
  Madeira: { aura: "#8ad050", fundo: ["#061206", "#123012", "#245a24"], tema: "floresta" },
  Natureza: { aura: "#8ad050", fundo: ["#061206", "#123012", "#245a24"], tema: "floresta" },
  Vento: { aura: "#7ff0d8", fundo: ["#0a2030", "#1a4a60", "#4a90a8"], tema: "vento" },
  Raio: { aura: "#ffe040", fundo: ["#0a0a20", "#1c1c48", "#3a3a80"], tema: "raio" },
  Som: { aura: "#ff9ad8", fundo: ["#1a0818", "#3a1238", "#6a2a62"], tema: "vento" },
  Trevas: { aura: "#a070ff", fundo: ["#08040f", "#1a0c2e", "#331a56"], tema: "trevas" },
  Luz: { aura: "#fff0a0", fundo: ["#2a2410", "#5a4c20", "#a08a40"], tema: "luz" },
  Alma: { aura: "#80f0ff", fundo: ["#04141a", "#0c2c38", "#1a5060"], tema: "trevas" },
  Tempo: { aura: "#f5d0a9", fundo: ["#1a140c", "#3a2c1c", "#6a5034"], tema: "luz" },
  Espaço: { aura: "#c090ff", fundo: ["#06041a", "#140c3a", "#2a1a6a"], tema: "estrelas" },
  Vazio: { aura: "#f0f0f0", fundo: ["#000000", "#0e0e10", "#2a2a2e"], tema: "vazio" },
  Sangue: { aura: "#ff2040", fundo: ["#1a0206", "#3a060e", "#6a0a1a"], tema: "fogo" },
  Estelar: { aura: "#c0a0ff", fundo: ["#06041a", "#140c3a", "#2a1a6a"], tema: "estrelas" },
  Sonho: { aura: "#ffb0f0", fundo: ["#140a1a", "#2e1a3a", "#5a3a6a"], tema: "estrelas" },
  Eclipse: { aura: "#ff7a3d", fundo: ["#05000a", "#14062a", "#2e0e4a"], tema: "eclipse" },
};
