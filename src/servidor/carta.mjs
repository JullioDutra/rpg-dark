// Carta de Personagem em pixel art (PNG), gerada no próprio servidor: avatar + ficha com a fonte pixel 3×5.
// Não precisa de navegador (a carta HTML de templates/ continua para artes em alta, fora da Vercel).
import { Tela } from "../avatar/pixel.mjs";
import { montar } from "../avatar/index.mjs";
import { ELEMENTO } from "../avatar/paletas.mjs";
import { escrever } from "../mapa/fonte.mjs";

const W = 184, H = 82;
const COR_CASTA = { campones: "#9a948e", plebeu: "#80aba9", cavaleiro: "#c0c8d0", realeza: "#e6b422", indefinido: "#c080ff", rei: "#ff6a2a" };

function retangulo(t, x0, y0, x1, y1, cor) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) t.set(x, y, cor);
}
function moldura(t, x0, y0, x1, y1, cor) {
  for (let x = x0; x <= x1; x++) { t.set(x, y0, cor); t.set(x, y1, cor); }
  for (let y = y0; y <= y1; y++) { t.set(x0, y, cor); t.set(x1, y, cor); }
}

/** @param j jogador (linha do banco) @param dna DNA do avatar */
export function cartaPersonagem(j, dna, escala = 4) {
  const t = new Tela(W, H);
  const el = ELEMENTO[dna.elemento] ?? ELEMENTO.Vazio;
  const destaque = COR_CASTA[j.casta] ?? "#e6b422";
  retangulo(t, 0, 0, W - 1, H - 1, "#0d0b14");
  moldura(t, 0, 0, W - 1, H - 1, destaque);
  moldura(t, 2, 2, W - 3, H - 3, el.aura);

  const av = montar(dna);
  for (let y = 0; y < av.h; y++) for (let x = 0; x < av.w; x++) t.set(9 + x, 9 + y, av.get(x, y));
  moldura(t, 8, 8, 9 + av.w, 9 + av.h, destaque);

  const a = j.atributos ?? {};
  const x = 82;
  escrever(t, j.nome.slice(0, 24), x, 8, "#ffe9a8");
  escrever(t, j.classe ?? "", x, 17, "#ffffff");
  escrever(t, `${j.casta === "campones" ? "CAMPONES" : j.casta} - ${j.reino}`, x, 25, destaque);
  escrever(t, `NV ${j.nivel}  RANK ${j.rank}`, x, 35, "#ffffff");
  escrever(t, `HP ${j.hp_max}  MP ${j.mp_max}`, x, 43, "#7fe0a0");
  escrever(t, `FOR ${a.FOR ?? 0}  DEF ${a.DEF ?? 0}`, x, 53, "#ffb08a");
  escrever(t, `MAG ${a.MAG ?? 0}  RES ${a.RES ?? 0}`, x, 61, "#a8c8ff");
  escrever(t, `VEL ${a.VEL ?? 0}  SOR ${a.SOR ?? 0}`, x, 69, "#e8e0a0");
  return t.png(escala);
}

/** Prévia só do avatar (durante a criação). */
export function previaAvatar(dna, escala = 6) {
  return montar(dna).png(escala);
}
