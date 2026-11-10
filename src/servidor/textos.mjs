// Textos fáceis de entender sobre a origem do jogador, a região e o reino. Sem segredos da história.
import { readFileSync } from "node:fs";
import { REGIAO } from "../regras/exploracao.mjs";

const T = JSON.parse(readFileSync(new URL("../../data/textos-mundo.json", import.meta.url), "utf8"));

export const perigoEmPalavras = (p) => T.perigo[p] ?? "🟡 tome cuidado";

/** "Sua região": onde fica, como é, perigo e o que se encontra. */
export function textoRegiao(id, { titulo = "📍 *Onde você está*" } = {}) {
  const r = REGIAO.get(id);
  if (!r) return null;
  const tr = T.regioes[id] ?? {};
  const reino = T.reinos[r.reino];
  return `${titulo}\n*${r.nome}* — ${reino?.titulo ?? r.reino}\n\n${tr.texto ?? ""}\n\n` +
    `⚠️ Perigo: ${perigoEmPalavras(r.perigo)}\n🔎 O que tem aqui: ${tr.tem ?? "?"}`;
}

/** "Seu reino": quem manda, como é o povo e o bônus de quem nasce lá. */
export function textoReino(reinoId) {
  const k = T.reinos[reinoId];
  if (!k) return null;
  return `👑 *${k.titulo}*\n\n${k.texto}\n\n• Quem governa: ${k.rei}\n• Capital: ${k.capital}\n• ${k.nativos}`;
}

/** Mensagem de boas-vindas à terra natal, logo após a criação do personagem. */
export function textoOrigem(j, aldeia) {
  const casta = T.castas[j.casta] ?? "";
  return `🏡 *Sua casa: ${aldeia.nome}* (${aldeia.jp})\n\n${aldeia.descricao}\n\n${casta}`;
}

export function textoPrimeirosPassos() {
  return "🧭 *O que fazer agora?*\n\n" +
    "• *explorar* — olhar ao redor (pode achar itens, lugares ou inimigos)\n" +
    "• *mapa* — ver onde você está\n" +
    "• *viajar <lugar>* — ir para uma região vizinha\n" +
    "• *onde estou* — rever este texto sobre a sua região\n" +
    "• *> sua ação* — fazer qualquer coisa com suas palavras. Ex.: _> pergunto ao ferreiro sobre a criança sumida_\n" +
    "• *ficha* — ver sua carta · *ajuda* — todos os comandos\n\n" +
    "⚡ Explorar e viajar gastam *vigor*, que volta sozinho com o tempo.";
}
