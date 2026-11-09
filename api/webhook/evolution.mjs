// POST /api/webhook/evolution — eventos da instância rpg-yotsuhoshi da Evolution API.
// Segredo: header "x-webhook-secret" (configurado no webhook da instância) ou ?segredo= na URL.
// ESQUELETO: valida, filtra a instância e confirma o recebimento. O processamento do jogo entra na próxima etapa.
import { responder, segredoConfere, lerJson } from "../../src/servidor/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  const segredo = req.headers["x-webhook-secret"] ?? new URL(req.url, "http://x").searchParams.get("segredo");
  if (!segredoConfere(segredo, process.env.WEBHOOK_SECRET)) return responder(res, 401, { erro: "segredo" });

  const evento = await lerJson(req);
  if (!evento) return responder(res, 400, { erro: "json" });

  // Se a Evolution usar webhook global, ignora eventos de outras instâncias (ex.: o outro bot).
  const instancia = process.env.EVOLUTION_INSTANCIA;
  if (instancia && evento.instance && evento.instance !== instancia) return responder(res, 200, { ignorado: "instancia" });

  return responder(res, 200, { recebido: evento.event ?? null });
}
