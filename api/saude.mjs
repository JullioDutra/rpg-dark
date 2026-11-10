// GET /api/saude — confere se o servidor está no ar e quais peças estão configuradas (sem mostrar valores).
// Também confere o banco (aplica migrações pendentes), a conexão da Evolution e os modelos da Maritaca.
import { responder } from "../src/servidor/http.mjs";
import { bancoNeon, garantirEsquema, urlBanco, um } from "../src/servidor/db.mjs";
import { criarEvolution } from "../src/servidor/evolution.mjs";

const PECAS = ["DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "EVOLUTION_URL", "EVOLUTION_API_KEY", "EVOLUTION_INSTANCIA",
  "WEBHOOK_SECRET", "RELOGIO_URL", "RELOGIO_SEGREDO", "TELEFONE_SAL", "IA_PROVEDOR", "MARITACA_API_KEY", "MARITACA_MODELO", "ADMINS"];

async function checar(fn) {
  try { return await fn(); } catch (e) { return { erro: String(e.message ?? e).slice(0, 200) }; }
}

export default async function handler(req, res) {
  const configurado = Object.fromEntries(PECAS.map((k) => [k, Boolean(k === "DATABASE_URL" ? urlBanco() : process.env[k])]));
  const [banco, evolution, maritaca] = await Promise.all([
    urlBanco() ? checar(async () => {
      const db = await bancoNeon();
      const m = await garantirEsquema(db);
      const c = await um(db, "select (select count(*) from jogo.mundos)::int as mundos, (select count(*) from jogo.jogadores)::int as jogadores");
      return { ok: true, ...c, migracoes_aplicadas_agora: m.aplicadas };
    }) : null,
    process.env.EVOLUTION_URL ? checar(async () => {
      const evo = criarEvolution();
      const estado = (await evo.estado())?.instance?.state ?? null;
      const w = await checar(() => evo.webhook());
      let webhook = w?.erro ? w : null;
      if (w && !w.erro) {
        const u = (() => { try { return new URL(w.url ?? ""); } catch { return null; } })();
        const esperado = process.env.WEBHOOK_SECRET;
        webhook = { ligado: Boolean(w.enabled), destino: u ? `${u.host}${u.pathname}` : null, eventos: w.events ?? [],
          segredo_na_url: Boolean(u?.searchParams.get("segredo")), segredo_confere: Boolean(esperado && u?.searchParams.get("segredo") === esperado),
          segredo_no_header: Boolean(w.headers?.["x-webhook-secret"]) };
      }
      return { ok: true, estado, webhook };
    }) : null,
    process.env.MARITACA_API_KEY ? checar(async () => {
      const r = await fetch(`${process.env.MARITACA_URL ?? "https://chat.maritaca.ai/api"}/models`, { headers: { authorization: `Bearer ${process.env.MARITACA_API_KEY}` } });
      if (!r.ok) return { ok: false, http: r.status };
      const corpo = await r.json();
      const modelos = (corpo.data ?? corpo.models ?? []).map((m) => m.id ?? m.name ?? m).filter((x) => typeof x === "string");
      return { ok: true, modelo_configurado_existe: modelos.includes(process.env.MARITACA_MODELO ?? "sabiazinho-4"), modelos };
    }) : null,
  ]);
  responder(res, 200, { ok: true, servico: "rpg-yotsuhoshi", regiao: process.env.VERCEL_REGION ?? null, configurado, banco, evolution, maritaca });
}
