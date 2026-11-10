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
  return { db, evo, jogo: criarJogo({ db, ehAdminGrupo, ia: criarIA() }) };
}
