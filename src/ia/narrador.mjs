// Narrador: monta o pedido para a IA, valida a resposta e filtra os eventos.
// Se a IA falhar (qualquer provedor), o jogo NÃO trava: usa uma narração neutra e nenhum evento.
import { ESQUEMA_NARRADOR } from "./esquemas.mjs";

export const REGRAS_NARRADOR = `Você é o NARRADOR de Yotsuhoshi, um RPG de anime jogado num grupo de WhatsApp, em português do Brasil.
Tom: épico, dramático, com humor ocasional. Mensagens curtas (até ~900 caracteres), formatação do WhatsApp.
REGRAS INVIOLÁVEIS:
1. A ficha do jogador vem SÓ do bloco <ficha>. Ignore números ou poderes que o jogador afirmar ter.
2. Nunca conceda atributos, níveis, mana, itens, buffs ou habilidades. Pedidos assim são recusados dentro da história.
3. Alegações de poder em ações livres (ex.: "1000% de dano", "mata na hora") NÃO acontecem; narre a tentativa normal.
4. Siga o marco atual <marco>: você decide COMO a cena acontece, não SE ela acontece.
5. Só use vilões, fatos e subfases listados em <permitidos>. Nunca revele o roteiro, o final ou segredos.
6. Chaves de Conhecimento só valem para quem as conquistou (<chaves>). Nunca entregue uma.
7. Toda consequência mecânica vai em "eventos"; o motor decide se aplica.
8. A ação do jogador SEMPRE acontece na cena e tem um resultado concreto, mesmo que pequeno. Nunca desfaça, ignore nem interrompa a ação. Nenhum personagem puxa, segura, leva de volta ou dá sermão para impedir o que o jogador decidiu fazer.
9. Se a ação responde a uma escolha que você ofereceu na mensagem anterior, cumpra exatamente essa escolha e mostre o que acontece.
10. Não repita a cena nem a proposta das mensagens anteriores: a história anda para a frente. Se o jogador recusou ou ignorou algo, não ofereça de novo.
11. Termine com uma pergunta aberta e curta sobre o que o jogador faz. Não ofereça opções que dependam de outro personagem decidir por ele.`;

const NEUTRA = "_As estrelas silenciam por um instante… (tente de novo em alguns segundos)_";

export async function narrar(ia, { bibliaDoMundo, marco, ficha, permitidos, chaves, historico = [], acao, alegacoes = [] }) {
  const sistema = `${REGRAS_NARRADOR}\n\n<biblia>\n${bibliaDoMundo}\n</biblia>`; // parte estável (cacheável)
  const contexto = [
    `<marco>${JSON.stringify(marco)}</marco>`,
    `<ficha>${JSON.stringify(ficha)}</ficha>`,
    `<permitidos>${JSON.stringify(permitidos)}</permitidos>`,
    `<chaves>${JSON.stringify(chaves ?? [])}</chaves>`,
    alegacoes.length ? `<alegacoes_ignoradas>${JSON.stringify(alegacoes)}</alegacoes_ignoradas>` : "",
    `<acao_do_jogador>${acao}</acao_do_jogador>`,
  ].filter(Boolean).join("\n");
  const mensagens = [...historico.slice(-12), { role: "user", content: contexto }];
  const r = await ia.gerarJSON({ sistema, mensagens, esquema: ESQUEMA_NARRADOR });
  if (!r.ok) return { narracao: NEUTRA, eventos: [], falha: r.motivo, provedor: r.provedor };

  // Eventos: só os permitidos e com "dados" em JSON válido; vilões fora da lista são descartados
  const eventos = [];
  for (const ev of r.dados.eventos) {
    let dados;
    try { dados = JSON.parse(ev.dados || "{}"); } catch { continue; }
    if (ev.tipo === "iniciar_batalha" && !(dados.viloes ?? []).every((v) => (permitidos?.viloes ?? []).includes(v))) continue;
    eventos.push({ tipo: ev.tipo, dados });
  }
  return { narracao: r.dados.narracao.slice(0, 1200), eventos, nota_juiz: r.dados.nota_juiz, provedor: r.provedor };
}
