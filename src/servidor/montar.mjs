// Monta as peças de produção (banco Neon, Evolution, IA) a partir das variáveis de ambiente.
import { bancoNeon, garantirEsquema } from "./db.mjs";
import { criarEvolution } from "./evolution.mjs";
import { criarJogo } from "./jogo.mjs";
import { criarProvedor, criarAnthropic, comReserva } from "../ia/provedores.mjs";

export function criarIA() {
  const tipo = process.env.IA_PROVEDOR ?? "maritaca";
  const temChave = tipo === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.MARITACA_API_KEY;
  if (!temChave) return null;
  const principal = criarProvedor({ tipo });
  const reserva = tipo !== "anthropic" && process.env.ANTHROPIC_API_KEY ? criarAnthropic() : null;
  return reserva ? comReserva(principal, reserva) : principal;
}

/** Cliente do relógio da VPS. Sem RELOGIO_URL, devolve null (o jogo funciona, só não avisa sozinho). Nunca derruba uma mensagem. */
export function criarRelogio() {
  const base = process.env.RELOGIO_URL, segredo = process.env.RELOGIO_SEGREDO;
  if (!base || !segredo) return null;
  const jogoUrl = process.env.JOGO_URL ?? "https://rpg-dark.vercel.app";
  return {
    async agendar(id, quandoMs, corpo = {}) {
      try {
        const r = await fetch(`${base.replace(/\/$/, "")}/agendar`, { method: "POST", signal: AbortSignal.timeout(4000),
          headers: { "content-type": "application/json", "x-relogio-segredo": segredo },
          body: JSON.stringify({ id, quando: new Date(quandoMs).toISOString(), url: `${jogoUrl}/api/tick`, corpo }) });
        if (!r.ok) console.warn("relogio: agendar", id, r.status);
        return r.ok;
      } catch (e) { console.warn("relogio: fora do ar", String(e.message ?? e).slice(0, 120)); return false; }
    },
    async saude() {
      const r = await fetch(`${base.replace(/\/$/, "")}/saude`, { signal: AbortSignal.timeout(4000) });
      return r.ok ? r.json() : { ok: false, http: r.status };
    },
  };
}

export async function montarProducao() {
  const db = await bancoNeon();
  await garantirEsquema(db);
  const evo = criarEvolution();
  const ehAdminGrupo = async (grupo, autor) => {
    try {
      const info = await evo.infoGrupo(grupo);
      const p = (info.participants ?? []).find((x) => [autor.pn, autor.lid].includes(x.id) || [autor.pn, autor.lid].includes(x.jid) || [autor.pn, autor.lid].includes(x.lid));
      return Boolean(p?.admin);
    } catch { return false; }
  };
  return { db, evo, jogo: criarJogo({ db, ehAdminGrupo, ia: criarIA(), relogio: criarRelogio() }) };
}
