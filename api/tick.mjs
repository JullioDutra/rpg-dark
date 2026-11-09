// POST /api/tick — chamado pelo relógio do VPS na hora de um prazo (header x-relogio-segredo).
// ESQUELETO: valida e confirma. Fechar rodadas, crises e sussurros entra na próxima etapa.
import { responder, segredoConfere, lerJson } from "../src/servidor/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  if (!segredoConfere(req.headers["x-relogio-segredo"], process.env.RELOGIO_SEGREDO)) return responder(res, 401, { erro: "segredo" });
  const corpo = (await lerJson(req)) ?? {};
  return responder(res, 200, { ok: true, id: corpo.id ?? null });
}
