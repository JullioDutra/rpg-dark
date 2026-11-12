// POST /api/tick — chamado pelo relógio do VPS na hora de um prazo (header x-relogio-segredo).
// O corpo traz o que foi agendado: { id, tipo: "chegada", jogador } ou { id, tipo: "resumo" }. Ver aoTick em src/servidor/jogo.mjs.
import { responder, segredoConfere, lerJson } from "../src/servidor/http.mjs";
import { enviarSaidas } from "../src/servidor/evolution.mjs";
import { montarProducao } from "../src/servidor/montar.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { erro: "metodo" });
  if (!segredoConfere(req.headers["x-relogio-segredo"], process.env.RELOGIO_SEGREDO)) return responder(res, 401, { erro: "segredo" });
  const corpo = (await lerJson(req)) ?? {};
  try {
    const { evo, jogo } = await montarProducao();
    const saidas = await jogo.aoTick(corpo);
    const erros = await enviarSaidas(evo, saidas);
    console.log("tick:", corpo.tipo ?? "?", "saídas", saidas.length, "erros", erros.length);
    return responder(res, 200, { ok: true, id: corpo.id ?? null, saidas: saidas.length, erros: erros.length });
  } catch (e) {
    console.error("tick:", e);
    return responder(res, 200, { ok: false }); // 200: o relógio não precisa insistir num prazo que deu erro de jogo
  }
}
