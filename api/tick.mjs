// POST /api/tick — chamado pelo relógio do VPS na hora de um prazo (header x-relogio-segredo).
// Consome os agendamentos vencidos (SKIP LOCKED). Os tipos (fim de rodada, crise, sussurro) entram com as batalhas.
import { responder, segredoConfere, lerJson } from "../src/servidor/http.mjs";
import { bancoNeon, garantirEsquema } from "../src/servidor/db.mjs";

const TRATADORES = {}; // tipo → async (db, agendamento) => void

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  if (!segredoConfere(req.headers["x-relogio-segredo"], process.env.RELOGIO_SEGREDO)) return responder(res, 401, { erro: "segredo" });
  const corpo = (await lerJson(req)) ?? {};
  const db = await bancoNeon();
  await garantirEsquema(db);
  const vencidos = await db.query("select * from jogo.reivindicar_agendamentos(20)");
  for (const a of vencidos) {
    try {
      await TRATADORES[a.tipo]?.(db, a);
      await db.query("update jogo.agendamentos set status = 'feito' where id = $1", [a.id]);
    } catch (e) {
      await db.query("update jogo.agendamentos set status = 'erro', erro = $2 where id = $1", [a.id, String(e).slice(0, 500)]);
    }
  }
  return responder(res, 200, { ok: true, id: corpo.id ?? null, processados: vencidos.length });
}
