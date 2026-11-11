// Textos do jogo e o ESTILO das mensagens (imersão):
//  1. Narração primeiro, em 2ª pessoa, frases curtas e sensoriais.
//  2. Números e regras numa linha discreta no fim, em itálico (rodapé).
//  3. No máximo UM emoji por mensagem, e só os do tema: ⚔️ luta · ⭐ cerimônia · 🗺️ mapa · ⚠️ perigo real.
//  4. Nada de segredos da história aqui.
import { readFileSync } from "node:fs";
import { REGIAO } from "../regras/exploracao.mjs";

const T = JSON.parse(readFileSync(new URL("../../data/textos-mundo.json", import.meta.url), "utf8"));

export const perigoEmPalavras = (p) => T.perigo[p] ?? "exige cuidado";
export const rodape = (...partes) => `_${partes.filter(Boolean).join(" · ")}_`;
export const NOME_CASTA = { campones: "Camponês", plebeu: "Plebeu", cavaleiro: "Cavaleiro", realeza: "Realeza", indefinido: "Indefinido", rei: "Rei" };

/** Uma linha de ambiente da região (sons, cheiros, clima). `n` escolhe qual, sem gastar o sorteio do jogo. */
export function ambiente(id, n = 0) {
  const a = T.regioes[id]?.ambiente ?? [];
  return a.length ? a[Math.abs(n) % a.length] : "";
}

/** Apresentação de uma região: como é, perigo e o que se encontra. */
export function textoRegiao(id, { titulo = null } = {}) {
  const r = REGIAO.get(id);
  if (!r) return null;
  const tr = T.regioes[id] ?? {};
  const reino = T.reinos[r.reino];
  return `${titulo ? `${titulo}\n` : ""}*${r.nome}*\n_${reino?.titulo ?? r.reino}_\n\n${tr.texto ?? ""}\n\n` +
    `Perigo: ${perigoEmPalavras(r.perigo)}. Aqui você encontra ${tr.tem ?? "pouca coisa"}.`;
}

/** O reino: quem manda, como é o povo e o bônus de quem nasce lá. */
export function textoReino(reinoId) {
  const k = T.reinos[reinoId];
  if (!k) return null;
  return `*${k.titulo}*\n\n${k.texto}\n\nQuem governa: ${k.rei}.\nCapital: ${k.capital}.\n${k.nativos}`;
}

/** A terra natal, logo após a criação do personagem. */
export function textoOrigem(j, aldeia) {
  return `*Sua casa: ${aldeia.nome}*${aldeia.jp ? ` (${aldeia.jp})` : ""}\n\n${aldeia.descricao}\n\n${T.castas[j.casta] ?? ""}`;
}

export function textoPrimeirosPassos() {
  return "*Por onde começar*\n\n" +
    "*falar <nome>* — conversar com alguém daqui\n" +
    "*ir <nº>* — visitar um dos lugares da lista\n" +
    "*missao* — sua história e o próximo passo\n" +
    "*explorar* — procurar encrenca e achados\n" +
    "*itens* — o que você carrega · *ficha* — sua carta\n" +
    "*> sua ação* — fazer o que quiser, com suas palavras\n\n" +
    rodape("nas lutas você escolhe pelo número, e o dado decide a força", "ajuda mostra tudo");
}
