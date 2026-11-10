// POST /api/webhook/evolution — eventos da instância rpg-yotsuhoshi da Evolution API.
// Segredo: header "x-webhook-secret" (configurado no webhook da instância) ou ?segredo= na URL.
import { responder, segredoConfere, lerJson } from "../../src/servidor/http.mjs";
import { lerMensagem, enviarSaidas } from "../../src/servidor/evolution.mjs";
import { montarProducao } from "../../src/servidor/montar.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  const segredo = req.headers["x-webhook-secret"] ?? new URL(req.url, "http://x").searchParams.get("segredo");
  if (!segredoConfere(segredo, process.env.WEBHOOK_SECRET)) return responder(res, 401, { erro: "segredo" });

  const evento = await lerJson(req);
  if (!evento) return responder(res, 400, { erro: "json" });

  // Se a Evolution usar webhook global, ignora eventos de outras instâncias (ex.: o outro bot).
  const instancia = process.env.EVOLUTION_INSTANCIA;
  if (instancia && evento.instance && evento.instance !== instancia) return responder(res, 200, { ignorado: "instancia" });

  const msg = lerMensagem(evento);
  if (!msg) return responder(res, 200, { ignorado: evento.event ?? "evento" });
  try {
    const { evo, jogo } = await montarProducao();
    const saidas = await jogo.processar(msg);
    const erros = await enviarSaidas(evo, saidas);
    if (erros.length) console.error("envio:", erros);
    return responder(res, 200, { ok: true, saidas: saidas.filter((s) => !s.espera).length, erros: erros.length });
  } catch (e) {
    console.error("webhook:", e);
    return responder(res, 200, { ok: false }); // 200 para a Evolution não reenviar em loop
  }
}
