// Utilidades HTTP das funções da Vercel (sem dependências).
import { timingSafeEqual } from "node:crypto";

/** Compara segredos em tempo constante. Falso se o esperado não estiver configurado. */
export function segredoConfere(recebido, esperado) {
  if (!esperado || typeof recebido !== "string") return false;
  const a = Buffer.from(recebido), b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function responder(res, status, corpo) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(corpo));
}

/** Lê o corpo JSON (a Vercel já entrega req.body quando o content-type é JSON). */
export async function lerJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let texto = "";
  for await (const parte of req) texto += parte;
  try { return texto ? JSON.parse(texto) : {}; } catch { return null; }
}
