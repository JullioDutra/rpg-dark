// RELÓGIO — serviço minúsculo que roda no VPS (ao lado da Evolution) e chama o jogo na hora certa.
//
// Por quê: no plano gratuito do Neon o banco "dorme" após 5 min parado e tem cota mensal de horas de computação.
// Um tick a cada minuto manteria o banco acordado 24/7. Em vez disso, o jogo (Vercel) agenda aqui só os prazos que
// existem (fim de rodada, crise, sussurro), e o relógio chama de volta no momento exato. Sem prazos = banco dormindo.
//
// API (sempre com o header x-relogio-segredo):
//   POST /agendar   { id, quando: ISO, url, corpo? }  → agenda (o mesmo id substitui o anterior)
//   POST /cancelar  { id }
//   GET  /saude
// Persistência: arquivo JSON (sobrevive a reinício). Sem dependências.
//
// Uso:  RELOGIO_SEGREDO=... RELOGIO_PORTA=8787 node relogio/servidor.mjs
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SEGREDO = process.env.RELOGIO_SEGREDO;
const PORTA = Number(process.env.RELOGIO_PORTA ?? 8787);
const ARQUIVO = process.env.RELOGIO_ARQUIVO ?? "./relogio-agenda.json";
const URLS_PERMITIDAS = (process.env.RELOGIO_URLS ?? "").split(",").filter(Boolean); // prefixos aceitos (ex.: https://rpg.vercel.app/)
if (!SEGREDO) { console.error("Defina RELOGIO_SEGREDO"); process.exit(1); }

const agenda = new Map(); // id → { id, quando, url, corpo, tentativas }
const timers = new Map();
const salvar = () => writeFileSync(ARQUIVO, JSON.stringify([...agenda.values()]));
const MAX_ATRASO = 2 ** 31 - 1; // limite do setTimeout (~24,8 dias)

function armar(item) {
  clearTimeout(timers.get(item.id));
  const espera = Math.max(0, new Date(item.quando).getTime() - Date.now());
  timers.set(item.id, setTimeout(() => (espera > MAX_ATRASO ? armar(item) : disparar(item)), Math.min(espera, MAX_ATRASO)));
}

async function disparar(item) {
  try {
    const r = await fetch(item.url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-relogio-segredo": SEGREDO },
      body: JSON.stringify({ id: item.id, ...(item.corpo ?? {}) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok && r.status >= 500) throw new Error(`HTTP ${r.status}`);
    agenda.delete(item.id); timers.delete(item.id); salvar();
  } catch (e) {
    item.tentativas = (item.tentativas ?? 0) + 1;
    if (item.tentativas >= 6) { console.error("desistindo de", item.id, e.message); agenda.delete(item.id); salvar(); return; }
    item.quando = new Date(Date.now() + 2 ** item.tentativas * 1000).toISOString(); // 2, 4, 8… s
    salvar(); armar(item);
  }
}

if (existsSync(ARQUIVO)) for (const item of JSON.parse(readFileSync(ARQUIVO, "utf8"))) { agenda.set(item.id, item); armar(item); }

const ler = (req) => new Promise((ok, erro) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { erro(e); } }); });
const responder = (res, codigo, obj) => { res.writeHead(codigo, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };

export const servidor = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/saude") return responder(res, 200, { ok: true, agendados: agenda.size });
  if (req.headers["x-relogio-segredo"] !== SEGREDO) return responder(res, 401, { erro: "segredo" });
  try {
    const corpo = await ler(req);
    if (req.method === "POST" && req.url === "/agendar") {
      const { id, quando, url } = corpo;
      if (!id || !url || Number.isNaN(Date.parse(quando))) return responder(res, 400, { erro: "id, quando e url são obrigatórios" });
      if (URLS_PERMITIDAS.length && !URLS_PERMITIDAS.some((p) => url.startsWith(p))) return responder(res, 400, { erro: "url não permitida" });
      const item = { id, quando, url, corpo: corpo.corpo ?? {}, tentativas: 0 };
      agenda.set(id, item); salvar(); armar(item);
      return responder(res, 200, { ok: true });
    }
    if (req.method === "POST" && req.url === "/cancelar") {
      clearTimeout(timers.get(corpo.id)); timers.delete(corpo.id);
      const existia = agenda.delete(corpo.id); salvar();
      return responder(res, 200, { ok: true, existia });
    }
    return responder(res, 404, { erro: "rota" });
  } catch {
    return responder(res, 400, { erro: "json" });
  }
});

if (process.argv[1]?.endsWith("servidor.mjs")) servidor.listen(PORTA, () => console.log(`⏰ relógio na porta ${PORTA}`));
