// POST /api/webhook/evolution — eventos da instância rpg-yotsuhoshi da Evolution API.
// Segredo: header "x-webhook-secret" (configurado no webhook da instância) ou ?segredo= na URL.
import { responder, segredoConfere, lerJson } from "../../src/servidor/http.mjs";
import { lerMensagem, enviarSaidas } from "../../src/servidor/evolution.mjs";
import { montarProducao } from "../../src/servidor/montar.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  const segredo = req.headers["x-webhook-secret"] ?? new URL(req.url, "http://x").searchParams.get("segredo");
  if (!segredoConfere(segredo, process.env.WEBHOOK_SECRET)) {
    console.warn("webhook: segredo inválido", { temHeader: Boolean(req.headers["x-webhook-secret"]), temQuery: req.url.includes("segredo=") });
    return responder(res, 401, { erro: "segredo" });
  }

  const evento = await lerJson(req);
  if (!evento) { console.warn("webhook: corpo não é JSON"); return responder(res, 400, { erro: "json" }); }
  console.log("webhook: evento", evento.event, "instância", evento.instance);

  // Se a Evolution usar webhook global, ignora eventos de outras instâncias (ex.: o outro bot).
  const instancia = process.env.EVOLUTION_INSTANCIA;
  if (instancia && evento.instance && evento.instance !== instancia) { console.log("webhook: outra instância ignorada"); return responder(res, 200, { ignorado: "instancia" }); }

  const msg = lerMensagem(evento);
  if (!msg) {
    const k = (Array.isArray(evento.data) ? evento.data[0] : evento.data)?.key ?? {};
    console.log("webhook: mensagem ignorada", { fromMe: k.fromMe, chat: k.remoteJid?.split("@")[1], chaves: Object.keys(k) });
    return responder(res, 200, { ignorado: evento.event ?? "evento" });
  }
  console.log("webhook: mensagem", { grupo: msg.grupo, temNumero: Boolean(msg.autor.pn), temLid: Boolean(msg.autor.lid), texto: msg.texto.slice(0, 30) });
  try {
    const { evo, jogo } = await montarProducao();
    const saidas = await jogo.processar(msg);
    const erros = await enviarSaidas(evo, saidas);
    console.log("webhook: saídas", saidas.filter((s) => !s.espera).length, "erros", erros.length);
    if (erros.length) console.error("envio:", erros);
    return responder(res, 200, { ok: true, saidas: saidas.filter((s) => !s.espera).length, erros: erros.length });
  } catch (e) {
    console.error("webhook:", e);
    return responder(res, 200, { ok: false }); // 200 para a Evolution não reenviar em loop
  }
}
