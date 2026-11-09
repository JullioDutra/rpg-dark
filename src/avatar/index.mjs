// Criador de avatares em pixel art. Entrada: DNA (objeto). Saída: PNG.
//   import { renderizar } from "./src/avatar/index.mjs";
//   const png = renderizar({ tipo: "humanoide", cabelo: "espetado", corCabelo: "fogo", ... }, 8);
import { Tela } from "./pixel.mjs";
import { ELEMENTO, ROUPA_REINO } from "./paletas.mjs";
import { fundo } from "./fundo.mjs";
import { desenharHumanoide } from "./humanoide.mjs";
import { desenharCriatura } from "./criaturas.mjs";

export { CATALOGO } from "./humanoide.mjs";

export function montar(dna) {
  const t = new Tela(64, 64);
  const el = ELEMENTO[dna.elemento] ?? ELEMENTO.Vazio;
  const d = { ...dna, corRoupa: dna.corRoupa ?? ROUPA_REINO[dna.reino] ?? ROUPA_REINO["Kokū"], aura: dna.aura ?? el.aura };
  fundo(t, dna.tema ?? el.tema, dna.fundo ?? el.fundo, dna.id ?? "x", dna.brilhoAura ? d.aura : null);
  if ((dna.tipo ?? "humanoide") === "humanoide") desenharHumanoide(t, d);
  else desenharCriatura(t, d);
  return t;
}

export function renderizar(dna, escala = 8) {
  return montar(dna).png(escala);
}
