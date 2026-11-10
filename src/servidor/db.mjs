// Acesso ao banco. Produção: Neon (driver serverless; consultas por HTTP, migrações por WebSocket).
// Testes: qualquer objeto com query(texto, params) → linhas (ver scripts/testar-servidor.mjs, que usa "pg").
import { readFile, readdir } from "node:fs/promises";

const PASTA_MIGRACOES = new URL("../../db/migrations/", import.meta.url);
const TRAVA_MIGRACAO = 770_0101;

export function urlBanco() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;
}

let neonDb = null;
/** Banco de produção (Neon). Uma instância por processo. */
export async function bancoNeon(url = urlBanco()) {
  if (neonDb) return neonDb;
  if (!url) throw new Error("DATABASE_URL não configurada");
  const { neon, Pool } = await import("@neondatabase/serverless");
  const sql = neon(url);
  let pool = null;
  neonDb = {
    query: (texto, params = []) => sql.query(texto, params),
    // Sessão (WebSocket) para transações e migrações. O pool é reaproveitado entre mensagens da mesma instância;
    // conexões ociosas fecham em 10 s para o Neon poder dormir.
    async script(fn) {
      if (!pool) {
        pool = new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
        pool.on?.("error", () => { pool = null; }); // conexão ociosa derrubada: recria na próxima mensagem
      }
      const c = await pool.connect();
      try { return await fn((t, p) => c.query(t, p).then((r) => r.rows)); } finally { c.release(); }
    },
  };
  return neonDb;
}

export async function um(db, texto, params) {
  return (await db.query(texto, params))[0] ?? null;
}

let esquemaPronto = null;
/**
 * Aplica as migrações pendentes de db/migrations (idempotente, com trava para chamadas simultâneas).
 * Se o 0001 já foi rodado à mão no SQL Editor, só registra.
 */
export function garantirEsquema(db) {
  esquemaPronto ??= (async () => {
    const r = await um(db, "select to_regclass('jogo.migracoes') is not null as m, to_regclass('jogo.mundos') is not null as t");
    const arquivos = (await readdir(PASTA_MIGRACOES)).filter((f) => f.endsWith(".sql")).sort();
    let feitas = new Set();
    if (r.m) feitas = new Set((await db.query("select nome from jogo.migracoes")).map((x) => x.nome));
    const pendentes = arquivos.filter((f) => !feitas.has(f) && !(r.t && !r.m && f.startsWith("0001")));
    if (r.m && !pendentes.length) return { aplicadas: [] };
    return db.script(async (q) => {
      await q("select pg_advisory_lock($1)", [TRAVA_MIGRACAO]);
      try {
        const aplicadas = [];
        const s = (await q("select to_regclass('jogo.migracoes') is not null as m, to_regclass('jogo.mundos') is not null as t"))[0];
        const ja = s.m ? new Set((await q("select nome from jogo.migracoes")).map((x) => x.nome)) : new Set();
        for (const f of arquivos) {
          if (ja.has(f)) continue;
          if (f.startsWith("0001") && s.t) { ja.add(f); continue; } // já existia (rodado à mão)
          await q(await readFile(new URL(f, PASTA_MIGRACOES), "utf8"));
          aplicadas.push(f); ja.add(f);
        }
        await q("create table if not exists jogo.migracoes (nome text primary key, aplicada_em timestamptz not null default now())");
        await q("alter table jogo.migracoes enable row level security");
        for (const f of ja) await q("insert into jogo.migracoes (nome) values ($1) on conflict do nothing", [f]);
        return { aplicadas };
      } finally { await q("select pg_advisory_unlock($1)", [TRAVA_MIGRACAO]); }
    });
  })().catch((e) => { esquemaPronto = null; throw e; });
  return esquemaPronto;
}
