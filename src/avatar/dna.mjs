// DNA visual de todos os personagens. Elemento e reino dos vilões vêm de data/viloes.json (o render junta).
// Humanoides: H(rosto, pele, olhos, corOlhos, sobrancelha, boca, cabelo, corCabelo, roupa, acessorios, extras)
// Criaturas:  C(tipo, extras)
const H = (rosto, pele, olhos, corOlhos, sobrancelha, boca, cabelo, corCabelo, roupa, acessorios = [], extra = {}) =>
  ({ tipo: "humanoide", rosto, pele, olhos, corOlhos, sobrancelha, boca, cabelo, corCabelo, roupa, acessorios, ...extra });
const C = (tipo, extra = {}) => ({ tipo, ...extra });

// Cores de roupa reutilizadas
const R = {
  cinzaPobre: ["#6a625c", "#9a948e", "#3a3532"], piratas: ["#1f3a6a", "#e8e0c8", "#c0392b"], laranja: ["#d06a1a", "#8a3a10", "#e6b422"],
  preto: ["#1c1c1c", "#3a3a3a", "#e6b422"], branco: ["#f0f0e8", "#2a2a2a", "#8a2030"], miko: ["#ffffff", "#c8102e", "#e6b422"],
  roxoReal: ["#2a1a3a", "#c0a0e0", "#e6b422"], cristal: ["#c080ff", "#f0d0ff", "#ffffff"], gelo: ["#9ad8ff", "#e6fbff", "#3a6a9a"],
  pedra: ["#7a756e", "#a8a29a", "#4a4640"], desbotado: ["#6a6a7a", "#9a9aa8", "#3a3a48"], ouro: ["#e6b422", "#7a1f3d", "#ffffff"],
  sombra: ["#1a1a1a", "#3a3a3a", "#7a7a7a"], invertido: ["#e0e8f0", "#2a2a3a", "#9ad8ff"],
};

export const DNA_VILOES = {
  V001: C("fera", { cor: "#8a8580", cor2: "#c8c0b8", orelhas: "abanadas", focinho: "curto", dentes: true, corOlhos: "ambar", marcas: ["brasas"] }),
  V002: C("serpente", { cor: "#c0401a", cor2: "#ffb02a", chifres: false, corOlhos: "dourado", marcas: ["magma"] }),
  V003: H("fino", "morena", "afiado", "castanho", "brava", "sorriso-torto", "baguncado", "preto", "trapos", ["bandana", "cicatriz", "brasas"], { corRoupa: ["#5a2a1a", "#c0392b", "#c0392b"] }),
  V004: C("enxame", { cor: "#ffb02a" }),
  V005: H("largo", "media", "afiado", "castanho", "brava", "presa", "careca", "preto", "nu", ["barba-curta", "correntes"]),
  V006: H("fino", "osso", "vazio", "preto", "nenhuma", "presa", "careca", "preto", "corte", ["bandana"], { corRoupa: ["#2a3a5a", "#8a8a7a", "#5a5a6a"] }),
  V007: C("fera", { cor: "#d8d0c0", cor2: "#fff4e0", orelhas: "pontudas", dentes: true, corOlhos: "vermelho", caudas: 3, corCauda: "#ff6a2a", marcas: ["mascara-quebrada", "brasas"] }),
  V008: H("quadrado", "morena", "afiado", "ambar", "brava", "seria", "careca", "preto", "quimono", ["colar-perolas", "brasas"], { corRoupa: R.laranja }),
  V009: H("redondo", "esverdeada", "redondo", "dourado", "neutra", "sorriso-torto", "chanel", "verde", "trapos", ["prato"], { corRoupa: ["#3a5a2a", "#8a7a40", "#5a4a20"] }),
  V010: C("espirito", { cor: "#9ad8ff", tentaculos: true, translucido: true, corOlhos: "rosa", boca: "sorriso" }),
  V011: H("oval", "media", "afiado", "castanho", "brava", "presa", "baguncado", "preto", "corte", ["tapa-olho", "cartola", "barba-curta"], { corRoupa: R.piratas }),
  V012: C("anfibio", { cor: "#4a6a2a", cor2: "#c8c070", corOlhos: "dourado", marcas: ["moedas"] }),
  V013: H("oval", "azulada", "cansado", "cinza", "triste", "triste", "longo", "verde", "trapos", ["fitas-agua"], { corRoupa: ["#3a4a4a", "#5a6a5a", "#2a3a3a"] }),
  V014: C("fera", { cor: "#e8eef4", cor2: "#ffffff", orelhas: "pontudas", dentes: true, corOlhos: "azul", marcas: ["geada"] }),
  V015: H("quadrado", "media", "afiado", "azul", "brava", "seria", "careca", "preto", "placas", ["kabuto", "veias-vazio"], { corRoupa: ["#165e83", "#2a2a2e", "#c0392b"] }),
  V016: H("fino", "clara", "afiado", "rosa", "neutra", "presa", "longo", "rosa", "nu", ["colar-perolas"]),
  V017: C("fera", { cor: "#8a6a5a", orelhas: "redondas", focinho: "curto", dentes: true, corOlhos: "vermelho" }),
  V018: H("redondo", "osso", "vazio", "preto", "nenhuma", "presa", "careca", "preto", "trapos", ["chapeu-palha"], { corRoupa: ["#8a6a40", "#5a3a20", "#c0392b"] }),
  V019: C("golem", { cor: "#9a9080", corOlhos: "ambar", corNucleo: "#ff6a2a" }),
  V020: C("espirito", { cor: "#f0f0e8", olho: "brilho", corOlhos: "verde", boca: "grito", marcas: ["olho-terceiro"] }),
  V021: H("largo", "morena", "brilho", "#f080ff", "triste", "triste", "careca", "preto", "trapos", ["cristais", "hachimaki"], { corRoupa: ["#4a3a2a", "#6a5a40", "#c47222"] }),
  V022: C("ave", { cor: "#4a3a30", cor2: "#e2d8bf", corBico: "#c8b090", corOlhos: "vermelho" }),
  V023: H("quadrado", "morena", "afiado", "cinza", "brava", "presa", "espetado", "preto", "nu", ["pelagem", "cicatriz", "barba-curta"], { corPelagem: "#5a4a3a" }),
  V024: C("espirito", { cor: "#3a3a5a", translucido: true, chama: true, olho: "brilho", corOlhos: "#80f0ff", boca: "sorriso" }),
  V025: H("fino", "clara", "afiado", "ambar", "brava", "presa", "flutuante", "prata", "nu", ["asas-penas"], { corAsas: "#c8ccd8" }),
  V026: H("oval", "media", "afiado", "preto", "brava", "sorriso-torto", "baguncado", "preto", "quimono", ["asas-penas", "mascara-tengu"], { corAsas: "#1a1a22" }),
  V027: C("fera", { cor: "#ffe060", orelhas: "pontudas", corOlhos: "azul", caudas: 1, corCauda: "#fff07a", marcas: ["raios"] }),
  V028: H("oval", "media", "afiado", "cinza", "brava", "seria", "baguncado", "preto", "trapos", ["capuz"], { corRoupa: R.sombra }),
  V029: C("ave", { cor: "#c89a4a", corAsas: "#8a6a3a", crista: true, corCrista: "#e6b422", corOlhos: "dourado", marcas: ["ninho-ouro"] }),
  V030: C("espirito", { cor: "#bfe0ff", translucido: true, olho: "vazio", boca: "grito" }),
  V031: H("quadrado", "morena", "afiado", "castanho", "brava", "seria", "coque", "preto", "placas", ["hachimaki", "barba-curta"], { corRoupa: ["#6a5a40", "#46a7ad", "#c0392b"] }),
  V032: C("redemoinho", { cor: "#bff0ff", corOlhos: "verde-agua" }),
  V033: C("aracnideo", { cor: "#d8d8d8", corOlhos: "#000000" }),
  V034: H("fino", "media", "afiado", "dourado", "neutra", "sorriso-torto", "rabo", "preto", "samurai", ["cicatriz", "colar-perolas"], { corRoupa: ["#3a3a3a", "#7a1f3d", "#e6b422"] }),
  V035: H("oval", "pedra", "vazio", "preto", "nenhuma", "neutra", "chanel", "#8a857e", "quimono", ["cicatriz"], { corRoupa: R.pedra }),
  V036: H("fino", "clara", "afiado", "vermelho", "neutra", "seria", "rabo", "ruivo", "samurai", ["mascara-branca"]),
  V037: H("fino", "palida", "afiado", "vermelho", "brava", "sorriso", "careca", "preto", "robe-mago", ["pintura-crescente", "brasas"], { corRoupa: ["#6a625c", "#9a948e", "#ff6a2a"] }),
  V038: H("largo", "morena", "grande", "ambar", "brava", "sorriso", "coque", "ruivo", "nu", ["hachimaki"]),
  V039: H("fino", "espectral", "afiado", "azul", "neutra", "sorriso-torto", "longo", "azul-escuro", "corte", ["cartola"], { corRoupa: ["#2a3a5a", "#c8d8e8", "#8a2030"] }),
  V040: H("fino", "clara", "brilho", "dourado", "neutra", "sorriso", "flutuante", "loiro", "corte", ["halo"], { corRoupa: ["#ffd23a", "#ff7a1a", "#fff4b0"] }),
  V041: H("quadrado", "vermelha", "brilho", "dourado", "brava", "presa", "careca", "preto", "nu", ["barba-curta", "brasas"], { corCabelo: "#ff7a1a" }),
  V042: C("peixe", { cor: "#f4f0e6", manchas: "#e8402a", corBarbatana: "#ffe0e0", corOlhos: "preto" }),
  V043: H("redondo", "azulada", "cansado", "azul", "triste", "neutra", "chanel", "preto", "corte", ["oculos", "fitas-agua"]),
  V044: H("oval", "palida", "brilho", "prata", "neutra", "sorriso-torto", "baguncado", "prata", "quimono", ["cicatriz"], { corRoupa: R.invertido }),
  V045: C("peixe", { cor: "#5a5048", cor2: "#a89a80", bigodes: true, corBigode: "#fff07a", corOlhos: "dourado", marcas: ["raios"] }),
  V046: H("largo", "morena", "afiado", "azul", "brava", "presa", "baguncado", "branco", "couraca-osso", ["cartola", "barba"]),
  V047: H("fino", "palida", "afiado", "verde", "brava", "sorriso", "longo", "branco", "trapos", ["colar-perolas"], { corRoupa: ["#3a2a4a", "#6a4a7a", "#1a1a1a"] }),
  V048: C("aracnideo", { cor: "#5a4a30", corOlhos: "vermelho", marcaCostas: "#8a8a80" }),
  V049: H("largo", "clara", "cansado", "castanho", "neutra", "sorriso-torto", "careca", "castanho", "placas", ["bigode", "colar-perolas"], { corRoupa: R.ouro }),
  V050: C("golem", { cor: "#8a8070", coroa: true, corOlhos: "ambar" }),
  V051: C("golem", { cor: "#5a4a30", musgo: true, corOlhos: "verde", corNucleo: "#8ad050" }),
  V052: H("largo", "morena", "feliz", "castanho", "grossa", "neutra", "careca", "branco", "quimono", ["barba-trancada"], { corRoupa: ["#6a4a2a", "#a08a60", "#3a2a1a"] }),
  V053: H("fino", "palida", "brilho", "roxo", "neutra", "seria", "longo", "rosa", "corte", ["coroa-rachada", "cristais"], { corRoupa: R.cristal }),
  V054: C("fera", { cor: "#c8a070", orelhas: "redondas", focinho: "curto", dentes: true, corOlhos: "preto", caudas: 3, corCauda: "#c8a070", marcas: ["raios"] }),
  V055: H("fino", "clara", "afiado", "cinza", "brava", "seria", "baguncado", "preto", "jaqueta-penas", ["bandagem-boca"], { corRoupa: R.sombra }),
  V056: H("largo", "vermelha", "afiado", "dourado", "grossa", "seria", "longo", "branco", "corte", ["asas-penas", "nariz-tengu", "barba"], { corAsas: "#1a1a22" }),
  V057: C("espirito", { cor: "#d0c0e0", translucido: true, olho: "vazio", boca: "grito", marcas: ["olho-terceiro"] }),
  V058: H("oval", "media", "grande", "ambar", "neutra", "sorriso-torto", "rabo", "ruivo", "jaqueta-penas", ["oculos-aviador"], { corRoupa: ["#8a5a2a", "#e6b422", "#46a7ad"] }),
  V059: H("fino", "clara", "afiado", "dourado", "brava", "seria", "longo", "preto", "corte", ["hachimaki", "halo"], { corRoupa: R.miko }),
  V060: H("fino", "palida", "vazio", "preto", "nenhuma", "sorriso", "careca", "preto", "corte", ["cartola", "mascara-meia"], { corRoupa: R.desbotado }),
  V061: H("fino", "clara", "afiado", "dourado", "brava", "seria", "meio-raspado", "ruivo", "samurai", ["fios-prata"]),
  V062: C("ave", { cor: "#6a2a9a", corAsas: "#2a0a3a", crista: true, corCrista: "#a050ff", corOlhos: "vermelho", marcas: ["anel-eclipse"] }),
  V063: H("quadrado", "morena", "afiado", "vermelho", "brava", "presa", "espetado", "preto", "samurai", ["cicatriz", "barba-curta", "brasas"]),
  V064: C("serpente", { cor: "#8a2a10", cor2: "#ffb02a", asas: true, corOlhos: "dourado", marcas: ["magma", "ponte"] }),
  V065: C("espirito", { cor: "#1a1a2a", corOlhos: "branco", marcas: ["barcos"] }),
  V066: H("quadrado", "azulada", "afiado", "azul", "brava", "seria", "longo", "branco", "placas", ["barba", "coroa-rachada"], { corRoupa: R.gelo }),
  V067: H("fino", "esverdeada", "afiado", "dourado", "neutra", "presa", "longo", "#1f3a2a", "nu", ["fitas-agua"]),
  V068: H("fino", "clara", "cansado", "cinza", "neutra", "sorriso-torto", "careca", "preto", "corte", ["chapeu-corte", "colar-perolas"]),
  V069: C("centopeia", { cor: "#4a4f58", corOlhos: "vermelho" }),
  V070: C("cranio", { corOlhos: "#80f0ff" }),
  V071: H("quadrado", "media", "afiado", "cinza", "brava", "seria", "coque", "preto", "samurai", ["kabuto", "barba-curta"], { corRoupa: R.preto, crista: "serra" }),
  V072: H("fino", "palida", "cansado", "cinza", "triste", "neutra", "longo", "preto", "quimono", ["colar-perolas"], { corRoupa: R.branco }),
  V073: H("fino", "clara", "brilho", "verde-agua", "brava", "aberta", "flutuante", "cinza", "robe-mago", ["veias-vazio"]),
  V074: C("fera", { cor: "#8a6a40", orelhas: "redondas", focinho: "curto", dentes: true, corOlhos: "vermelho", caudas: 1, corCauda: "#3a5a2a", marcas: ["raios"] }),
  V075: C("golem", { cor: "#6a6a70", corOlhos: "vermelho", marcas: ["corrente"] }),
  V076: H("fino", "clara", "afiado", "roxo", "brava", "sorriso-torto", "baguncado", "preto", "jaqueta-penas", ["asas-penas", "pena"], { corRoupa: R.sombra, corAsas: "#141418", corPena: "#141418" }),
  V077: H("oval", "pedra", "cansado", "ambar", "triste", "seria", "chanel", "#8a857e", "placas", ["veias-vazio"], { corRoupa: R.pedra }),
  V078: H("oval", "azulada", "cansado", "azul", "triste", "seria", "chanel", "azul-escuro", "corte", ["veias-vazio"]),
  V079: H("quadrado", "espectral", "brilho", "dourado", "neutra", "seria", "careca", "preto", "placas", ["kabuto", "halo"], { corRoupa: ["#e8e8f0", "#c8c8d8", "#e6b422"] }),
  V080: H("fino", "clara", "afiado", "cinza", "neutra", "seria", "baguncado", "preto", "trapos", ["correntes", "bandagem-boca"], { corRoupa: R.sombra }),
  V081: H("largo", "vermelha", "afiado", "dourado", "brava", "aberta", "careca", "preto", "corte", ["chapeu-juiz", "barba", "brasas"], { corRoupa: ["#8a1020", "#1a1a1a", "#e6b422"] }),
  V082: H("quadrado", "espectral", "brilho", "vermelho", "brava", "seria", "longo", "ruivo", "samurai", ["chifres-dragao"]),
  V083: C("serpente", { cor: "#1a3a5a", cor2: "#7fd1ff", bigodes: true, corBigode: "#7fd1ff", olho: "brilho", corOlhos: "#7fffd4" }),
  V084: H("fino", "palida", "afiado", "roxo", "neutra", "sorriso", "longo", "preto", "corte", ["coroa-perolas"], { corRoupa: R.roxoReal }),
  V085: H("largo", "pedra", "brilho", "ambar", "grossa", "aberta", "careca", "preto", "nu", ["pelagem", "raizes"], { corPelagem: "#4a6a3a" }),
  V086: C("coracao", { cor: "#7a6a5a" }),
  V087: H("largo", "azulada", "brilho", "dourado", "brava", "presa", "espetado", "branco", "nu", ["chifres-oni", "halo"]),
  V088: H("fino", "palida", "vazio", "preto", "triste", "neutra", "flutuante", "branco", "corte", ["capuz"], { corRoupa: ["#e8eef4", "#c8d0dc", "#9ad8ff"] }),
  V089: H("fino", "clara", "afiado", "roxo", "neutra", "seria", "chanel", "roxo", "robe-mago", ["oculos", "halo"]),
  V090: H("quadrado", "pedra", "brilho", "cinza", "brava", "seria", "careca", "cinza", "placas", ["coroa-rachada", "barba"], { corRoupa: R.pedra }),
  V091: H("fino", "palida", "afiado", "prata", "neutra", "sorriso", "tranca-lateral", "prata", "manto-alto", ["oculos", "fios-prata"]),
  V092: H("oval", "palida", "vazio", "preto", "triste", "neutra", "baguncado", "cinza", "placas", ["veias-vazio"], { corRoupa: R.desbotado }),
  V093: H("quadrado", "cinza", "brilho", "vermelho", "brava", "seria", "espetado", "fogo", "samurai", ["coroa-rachada", "veias-vazio", "barba-curta"], { chamasNoCabelo: true }),
  V094: H("fino", "cinza", "brilho", "azul", "triste", "seria", "flutuante", "azul-escuro", "corte", ["coroa-perolas", "veias-vazio"]),
  V095: H("largo", "pedra", "brilho", "ambar", "grossa", "seria", "careca", "cinza", "placas", ["barba-trancada", "coroa-rachada", "raizes", "veias-vazio"]),
  V096: H("fino", "cinza", "brilho", "verde-agua", "brava", "seria", "franja-longa", "branco", "jaqueta-penas", ["asas-penas", "coroa-penas", "veias-vazio"], { corAsas: "#8a8a92", corRoupa: ["#9a9aa0", "#5a6a6a", "#d8d8d8"] }),
  V097: H("fino", "palida", "brilho", "prata", "neutra", "seria", "longo", "prata", "corte", ["halo"], { corRoupa: ["#0e0e1a", "#c9cacd", "#5b2a86"] }),
  V098: C("serpente", { cor: "#c0501a", cor2: "#7b3fb0", asas: true, corAsas: "#5b2a86", lagrimas: true, corOlhos: "dourado" }),
  V099: H("oval", "palida", "vazio", "preto", "nenhuma", "neutra", "careca", "branco", "corte", ["capuz", "rosto-buraco"], { corRoupa: ["#f4f4f0", "#d8d8d4", "#5b2a86"] }),
  V100: H("redondo", "media", "dragao", "ambar", "triste", "seria", "baguncado", "cinza-cinza", "trapos", ["sombra-dragao", "veias-vazio"], { corRoupa: ["#5a5048", "#3f6aa8", "#3a3028"], tema: "eclipse", fundo: ["#05000a", "#14062a", "#2e0e4a"] }),
};

// Vilões com máscara (doc 16/14): versão visual da máscara pública
export const DNA_MASCARA = {
  V091: H("fino", "palida", "afiado", "prata", "nenhuma", "sorriso", "tranca-lateral", "prata", "manto-alto", ["capuz", "oculos"], { corRoupa: ["#1a0f2a", "#c9cacd", "#7b3fb0"] }),
  V100: H("largo", "vermelha", "brilho", "vermelho", "brava", "presa", "espetado", "preto", "nu", ["chifres-oni", "brasas"], { tema: "fogo" }),
};

export const DNA_NPCS = {
  "NPC-RYUEN": H("quadrado", "media", "afiado", "ambar", "brava", "sorriso-torto", "espetado", "fogo", "samurai", ["coroa-sol", "barba-curta", "cicatriz", "olho-obsidiana", "brasas"], { reino: "Homura", elemento: "Fogo", chamasNoCabelo: true }),
  "NPC-KAISHIN": H("fino", "clara", "cansado", "cinza", "triste", "neutra", "flutuante", "azul-escuro", "corte", ["colar-perolas", "gota", "coroa-perolas"], { reino: "Watatsumi", elemento: "Água" }),
  "NPC-GOTETSU": H("largo", "morena", "feliz", "castanho", "grossa", "sorriso", "careca", "cinza", "placas", ["pelagem", "barba-trancada", "raizes"], { reino: "Daichi", elemento: "Terra", corPelagem: "#3a2a20" }),
  "NPC-SORAHIKO": H("oval", "clara", "grande", "verde-agua", "neutra", "lingua", "franja-longa", "branco", "jaqueta-penas", ["sardas", "curativo", "cachecol", "coroa-penas"], { reino: "Fūjin", elemento: "Vento", corRoupa: ["#eef0f0", "#46a7ad", "#4a8c4a"] }),
  "NPC-KAIEN": H("redondo", "media", "grande", "castanho", "triste", "seria", "baguncado", "cinza-cinza", "trapos", ["sardas"], { reino: "Kokū", elemento: "Natureza", corRoupa: ["#8a7a62", "#3f6aa8", "#6a5a40"] }),
  "NPC-SAYO": H("redondo", "clara", "redondo", "preto", "neutra", "seria", "trancas", "preto", "quimono", ["rubor"], { reino: "Daichi", elemento: "Alma", corRoupa: ["#42602d", "#f8f4e6", "#c0392b"] }),
  "NPC-HOSHIRYU": C("serpente", { cor: "#ff7a3d", cor2: "#ffd23a", asas: true, corAsas: "#5b2a86", corOlhos: "azul", olho: "brilho", elemento: "Estelar" }),
};

// ─────────────────────────────── JOGADOR ───────────────────────────────
const CLASSE_VISUAL = {
  Mago: { roupa: "robe-mago", acessorios: [] },
  Cavaleiro: { roupa: "placas", acessorios: [] },
  Bruxo: { roupa: "robe-mago", acessorios: ["capuz"], corRoupa: ["#2a1a3a", "#6a4a8a", "#c8a0ff"] },
  "Anti-magia": { roupa: "trapos", acessorios: ["correntes"], corRoupa: ["#1c1c1c", "#3a3a3a", "#6a6a6a"] },
  Espadachim: { roupa: "quimono", acessorios: ["hachimaki"] },
  "Meio-humano": { roupa: "jaqueta-penas", acessorios: [] },
  "Força da Natureza": { roupa: "quimono", acessorios: ["raizes"] },
  Demônio: { roupa: "corte", acessorios: ["chifres-pequenos"], olhos: "brilho", corOlhos: "vermelho" },
  Paladino: { roupa: "sagrada", acessorios: ["halo"] },
};
const ORELHAS_MEIO_HUMANO = { raposa: "orelhas-raposa", lobo: "orelhas-lobo", tigre: "orelhas-gato", corvo: "asas-penas", serpente: "chifres-pequenos", coelho: "orelhas-raposa", dragao_menor: "chifres-dragao" };
const CASTA_VISUAL = { campones: [], plebeu: [], cavaleiro: [], realeza: ["colar-perolas"], indefinido: [], rei: ["coroa-rachada"] };
const RANK_AURA = { E: false, D: false, C: false, B: true, A: true, S: true, SS: true };

// Monta o DNA do jogador: o sorteio define roupa/cores/aura; o jogador escolhe rosto, pele, olhos, cabelo e 1 marca.
export function dnaJogador({ id, reino, casta, classe, elemento, rank = "E", tipoAnimal, corrupcao = 0 }, escolhas = {}) {
  const cv = CLASSE_VISUAL[classe] ?? CLASSE_VISUAL.Espadachim;
  const acessorios = [...cv.acessorios, ...(CASTA_VISUAL[casta] ?? [])];
  if (classe === "Meio-humano") acessorios.push(ORELHAS_MEIO_HUMANO[tipoAnimal] ?? "orelhas-raposa");
  if (escolhas.marca) acessorios.push(escolhas.marca);
  if (corrupcao >= 50) acessorios.push("veias-vazio");
  if (corrupcao >= 75) acessorios.push("anel-eclipse");
  const el = elemento?.split(" ")[0];
  return {
    id, tipo: "humanoide", reino, elemento: el, feminino: escolhas.genero === "feminino",
    rosto: escolhas.rosto ?? "oval", pele: escolhas.pele ?? "media",
    olhos: cv.olhos ?? escolhas.olhos ?? "grande", corOlhos: cv.corOlhos ?? escolhas.corOlhos ?? "castanho",
    sobrancelha: escolhas.sobrancelha ?? "neutra", boca: escolhas.boca ?? "neutra",
    cabelo: escolhas.cabelo ?? "baguncado", corCabelo: escolhas.corCabelo ?? "preto",
    roupa: cv.roupa, ...(cv.corRoupa && { corRoupa: cv.corRoupa }),
    acessorios, brilhoAura: RANK_AURA[rank], corAsas: "#1a1a22",
  };
}

// ─────────────────────────────── PETS ESPIRITUAIS ───────────────────────────────
// Base de cada pet + o que muda em cada estágio: 1 Filhote (fofo, traços pequenos) · 2 Desperto (traços
// completos: chifres, crina, asas, mais caudas) · 3 Ascendido (aura + coroa espiritual + marcas do elemento).
const PET = {
  P01: { elemento: "Fogo", tipo: "fera", cor: "#fff0e0", orelhas: "pontudas", corOlhos: "dourado", corCauda: "#7fd1ff",
    estagios: [{ focinho: "curto", caudas: 1 }, { caudas: 3, marcas: ["brasas"] }, { caudas: 9, marcas: ["brasas"] }] },
  P02: { elemento: "Fogo", tipo: "ave", cor: "#ffb02a", cor2: "#fff0b0", corAsas: "#ff8a2a", corOlhos: "ambar",
    estagios: [{}, { crista: true, corCrista: "#ff5a1a", corAsas: "#ff5a1a" }, { crista: true, corCrista: "#ffd23a", cor: "#ff6a2a", corAsas: "#e8401a", marcas: ["brasas"] }] },
  P03: { elemento: "Fogo", tipo: "fera", cor: "#e8b040", orelhas: "redondas", focinho: "curto", corOlhos: "vermelho", corCrina: "#ff5a1a",
    estagios: [{ crina: true, corCrina: "#ffb02a" }, { crina: true, dentes: true }, { crina: true, dentes: true, marcas: ["brasas"] }] },
  P04: { elemento: "Lava", tipo: "serpente", cor: "#c0401a", cor2: "#ffb02a", corOlhos: "dourado",
    estagios: [{ chifres: false }, { asas: true }, { asas: true, marcas: ["magma"] }] },
  P05: { elemento: "Água", tipo: "peixe", cor: "#f4f0e6", manchas: "#3a8ee8", corBarbatana: "#bfe6ff", corOlhos: "preto",
    estagios: [{}, { bigodes: true, corBigode: "#7fd1ff" }, { bigodes: true, corBigode: "#ffd23a", manchas: "#165e83" }] },
  P06: { elemento: "Água", tipo: "tartaruga", cor: "#5a9a7a", corCasco: "#2a5a6a", corOlhos: "preto",
    estagios: [{}, { cauda: "serpente" }, { cauda: "serpente", corCasco: "#1a3a5a" }] },
  P07: { elemento: "Água", tipo: "fera", cor: "#8a5a3a", cor2: "#e8d8c0", orelhas: "redondas", focinho: "curto", corOlhos: "preto",
    estagios: [{ marcas: ["bigodes"] }, { caudas: 1, corCauda: "#8a5a3a", marcas: ["bigodes"] }, { caudas: 1, corCauda: "#7fd1ff", marcas: ["bigodes", "estrelas"] }] },
  P08: { elemento: "Água", tipo: "serpente", cor: "#2a8ac0", cor2: "#bfe6ff", corOlhos: "azul", olho: "brilho",
    estagios: [{ chifres: false }, { bigodes: true, corBigode: "#bfe6ff" }, { bigodes: true, asas: true, corAsas: "#7fd1ff" }] },
  P09: { elemento: "Terra", tipo: "fera", cor: "#8a6a4a", cor2: "#e8d8c0", orelhas: "redondas", focinho: "curto", corOlhos: "preto",
    estagios: [{ marcas: ["mascara-tanuki"] }, { marcas: ["mascara-tanuki"], caudas: 1, corCauda: "#6a4a2a" }, { marcas: ["mascara-tanuki", "estrelas"], caudas: 1, corCauda: "#6a4a2a" }] },
  P10: { elemento: "Terra", tipo: "fera", cor: "#8a8070", orelhas: "pontudas", focinho: "curto", corOlhos: "vermelho",
    estagios: [{}, { marcas: ["presas"], crina: true, corCrina: "#5a5048" }, { marcas: ["presas"], crina: true, corCrina: "#c47222" }] },
  P11: { elemento: "Madeira", tipo: "tartaruga", cor: "#7a9a5a", corCasco: "#5a4a2a", corOlhos: "preto",
    estagios: [{}, { arvore: true }, { arvore: true, corFolhas: "#ff9ac8", marcas: ["estrelas"] }] },
  P12: { elemento: "Cristal", tipo: "fera", cor: "#c8b0f0", orelhas: "redondas", focinho: "curto", corOlhos: "roxo", corCrina: "#e080ff",
    estagios: [{}, { crina: true }, { crina: true, chifres: "retos", corChifre: "#ffffff" }] },
  P13: { elemento: "Vento", tipo: "ave", cor: "#1a1a2a", cor2: "#3a3a4a", corAsas: "#1a1a2a", corBico: "#ffd23a", corOlhos: "vermelho",
    estagios: [{}, { crista: true, corCrista: "#ffd23a" }, { crista: true, corCrista: "#ffd23a", tema: "luz" }] },
  P14: { elemento: "Vento", tipo: "fera", cor: "#e8d8b0", cor2: "#f4e8d0", orelhas: "pontudas", focinho: "longo", corOlhos: "preto",
    estagios: [{ marcas: ["foices"] }, { caudas: 1, corCauda: "#e8d8b0", marcas: ["foices"] }, { caudas: 3, corCauda: "#7ff0d8", marcas: ["foices"] }] },
  P15: { elemento: "Vento", tipo: "ave", cor: "#c89a4a", corAsas: "#8a6a3a", corOlhos: "dourado",
    estagios: [{}, { crista: true, corCrista: "#f4f0e6" }, { crista: true, corCrista: "#ffd23a", corAsas: "#f4f0e6" }] },
  P16: { elemento: "Raio", tipo: "fera", cor: "#4a6ad0", orelhas: "pontudas", corOlhos: "dourado", corCauda: "#ffe040",
    estagios: [{ focinho: "curto", caudas: 1 }, { caudas: 1, marcas: ["raios"] }, { caudas: 2, crina: true, corCrina: "#ffe040", marcas: ["raios"] }] },
  P17: { elemento: "Luz", tipo: "fera", cor: "#f0d070", orelhas: "pontudas", corOlhos: "azul", corCrina: "#7fd1ff", corChifre: "#ffffff",
    estagios: [{ focinho: "curto" }, { crina: true, chifres: "retos" }, { crina: true, chifres: "retos", marcas: ["estrelas"] }] },
  P18: { elemento: "Sonho", tipo: "fera", cor: "#6a7aa0", cor2: "#e8e8f0", orelhas: "redondas", corOlhos: "preto",
    estagios: [{}, { marcas: ["estrelas"] }, { marcas: ["estrelas"], cor: "#4a5a90" }] },
  P19: { elemento: "Trevas", tipo: "fera", cor: "#2a2a32", orelhas: "pontudas", focinho: "curto", corOlhos: "verde", corCauda: "#2a2a32",
    estagios: [{ caudas: 1 }, { caudas: 2, marcas: ["chamas-roxas"] }, { caudas: 2, corCauda: "#7b3fb0", marcas: ["chamas-roxas"] }] },
  P20: { elemento: "Luz", tipo: "fera", cor: "#f0f0e8", orelhas: "redondas", focinho: "curto", corOlhos: "dourado", corChifre: "#c8a040",
    estagios: [{ marcas: ["olho-terceiro"] }, { chifres: "curvos", marcas: ["olho-terceiro"] }, { chifres: "curvos", marcas: ["olho-terceiro", "olhos-corpo"] }] },
};

export const NOMES_ESTAGIO = ["Filhote", "Desperto", "Ascendido"];

export function dnaPet(id, estagio = 1) {
  const { estagios, ...base } = PET[id];
  const e = estagios[estagio - 1] ?? {};
  const marcas = [...(e.marcas ?? []), ...(estagio === 3 ? ["coroa-espirito"] : [])];
  return { id: `${id}-${estagio}`, ...base, ...e, marcas, fofo: estagio === 1, brilhoAura: estagio === 3 };
}
export const IDS_PETS = Object.keys(PET);
