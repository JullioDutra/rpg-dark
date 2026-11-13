// Itens que aparecem em cenas narradas e em conversas precisam cair na bolsa de verdade.
// A IA só PROPÕE (evento do narrador ou campo "presente" do NPC); quem entrega é o motor, com lista fechada e limite.
import { item } from "../regras/itens.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";

/** O que pode ser entregue por cena ou conversa: consumíveis simples e materiais. Nunca equipamento, ryō em massa ou itens de história. */
export const PRESENTES_IA = ["pocao", "pocao-mana", "racao", "bandagem", "bomba-fumaca", "mat-obsidiana", "mat-perola", "mat-cristal", "mat-pluma", "mat-pedra"];
export const LIMITE_PRESENTES = { porDia: 3, intervaloMs: 20 * 60_000 };
const n = (s) => semAcento(String(s ?? "").toLowerCase()).trim();

/** Acha o item proposto (por id ou por nome aproximado) dentro da lista permitida. */
export function itemProposto(texto) {
  const t = n(texto);
  if (!t) return null;
  const id = PRESENTES_IA.find((x) => x === t) ?? PRESENTES_IA.find((x) => n(item(x).nome) === t) ?? PRESENTES_IA.find((x) => n(item(x).nome).includes(t) || t.includes(n(item(x).nome)))
    ?? (/po[cç][aã]o.*mana|mana/.test(t) ? "pocao-mana" : /po[cç][aã]o|cura|elixir|remedio/.test(t) ? "pocao" : /ra[cç][aã]o|comida|pao|fruta|carne/.test(t) ? "racao" : /bandag|atadura|erva/.test(t) ? "bandagem" : null);
  return id ? item(id) : null;
}

/**
 * Entrega um item proposto pela IA, se couber no limite. Devolve a linha para mostrar ao jogador
 * ("+1 Poção de cura (na sua bolsa)") ou null se nada foi entregue.
 */
export async function presentear(db, j, proposto, agora) {
  const it = itemProposto(proposto);
  if (!it) return null;
  const hoje = new Date(agora).toISOString().slice(0, 10);
  const uso = (await db.query("select valor from jogo.progresso where jogador_id = $1 and chave = 'presentes-ia'", [j.id]))[0]?.valor;
  const qtd = uso?.dia === hoje ? Number(uso.n ?? 0) : 0;
  if (qtd >= LIMITE_PRESENTES.porDia || (uso?.ultimo && agora - Number(uso.ultimo) < LIMITE_PRESENTES.intervaloMs)) return null;
  await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, $3, 1, '{}')
    on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 1`, [j.id, it.id, it.tipo]);
  await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'presentes-ia', $2, $3)
    on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, JSON.stringify({ dia: hoje, n: qtd + 1, ultimo: agora }), new Date(agora)]);
  return `+1 ${it.nome} (na sua bolsa)`;
}
