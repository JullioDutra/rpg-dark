// GET /api/saude — confere se o servidor está no ar e quais peças estão configuradas (sem mostrar valores).
import { responder } from "../src/servidor/http.mjs";

const PECAS = ["DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "EVOLUTION_URL", "EVOLUTION_API_KEY", "EVOLUTION_INSTANCIA",
  "WEBHOOK_SECRET", "RELOGIO_URL", "RELOGIO_SEGREDO", "TELEFONE_SAL", "IA_PROVEDOR", "ADMINS"];

export default function handler(req, res) {
  const configurado = Object.fromEntries(PECAS.map((k) => [k, Boolean(process.env[k])]));
  responder(res, 200, { ok: true, servico: "rpg-yotsuhoshi", regiao: process.env.VERCEL_REGION ?? null, configurado });
}
