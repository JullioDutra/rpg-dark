// Normalização de texto em português do Brasil escrito em chat (WhatsApp).
// "Vc ataca ele com a bolaaa de fogo kkk ⚔️" → "voce ataca ele com a bola de fogo atacar"

// Emojis que viram palavras (atalhos de ação)
const EMOJIS = {
  "⚔️": " atacar ", "⚔": " atacar ", "🗡️": " atacar ", "🗡": " atacar ", "👊": " atacar ", "🔥": " fogo ",
  "🛡️": " defender ", "🛡": " defender ", "🏃": " fugir ", "🏃‍♂️": " fugir ", "🏃‍♀️": " fugir ",
  "🧪": " pocao ", "❤️‍🩹": " curar ", "🗺️": " mapa ", "🗺": " mapa ", "🎒": " inventario ", "📜": " ficha ",
  "🔍": " explorar ", "🐾": " pet ", "💤": " descansar ", "🛒": " loja ", "❓": " ajuda ", "👍": " sim ", "👎": " nao ",
};

// Abreviações e gírias comuns de chat
const ABREV = {
  vc: "voce", vcs: "voces", voce: "voce", c: "com", cmg: "comigo", ctg: "contigo", q: "que", oq: "o que", pq: "porque",
  pra: "para", pro: "para o", pros: "para os", pras: "para as", tb: "tambem", tbm: "tambem", n: "nao", nn: "nao", ñ: "nao",
  naum: "nao", s: "sim", ss: "sim", sss: "sim", blz: "beleza", vlw: "valeu", mt: "muito", mto: "muito", msm: "mesmo",
  td: "tudo", tds: "todos", hj: "hoje", agr: "agora", dps: "depois", qnd: "quando", qdo: "quando", cd: "cade", kd: "cade",
  ta: "esta", to: "estou", tô: "estou", tá: "esta", ne: "nao e", bora: "vamos", bora: "vamos", partiu: "vamos", vambora: "vamos",
  hp: "vida", mp: "mana", lvl: "nivel", lv: "nivel", xp: "experiencia", inv: "inventario", pots: "pocoes", pot: "pocao",
  mago: "mago", skill: "habilidade", skil: "habilidade", ult: "habilidade", dmg: "dano", boss: "chefe", mob: "inimigo",
};

const RISADAS = /\b(k{3,}|(ha){2,}h?|(he){2,}|rs(rs)+|lol|kkk+)\b/g;

export function semAcento(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizar(bruto) {
  let s = ` ${bruto} `;
  for (const [e, w] of Object.entries(EMOJIS)) s = s.split(e).join(w);
  s = s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " "); // demais emojis
  s = semAcento(s.toLowerCase());
  s = s.replace(RISADAS, " ");
  s = s.replace(/([a-z])\1{2,}/g, "$1"); // "ataaaaca" -> "ataca" (mantém "ss", "rr")
  s = s.replace(/[^\w@>!?%\s.-]/g, " ").replace(/(\d)\s*%/g, "$1 %").replace(/[.]{2,}/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.split(" ").map((p) => ABREV[p] ?? p).join(" ").replace(/\s+/g, " ").trim();
}

// Distância de edição (tolerância a erros de digitação em nomes de regiões, itens, NPCs)
export function distancia(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
