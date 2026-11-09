// Teste do relógio: sobe o serviço e um "jogo" falso, agenda um callback e confere que chega na hora.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SEGREDO = "teste123";
const recebidos = [];
const jogo = createServer((req, res) => {
  let b = ""; req.on("data", (c) => (b += c));
  req.on("end", () => { recebidos.push({ segredo: req.headers["x-relogio-segredo"], corpo: JSON.parse(b), em: Date.now() }); res.end("ok"); });
}).listen(18788);
const proc = spawn(process.execPath, ["relogio/servidor.mjs"], {
  env: { ...process.env, RELOGIO_SEGREDO: SEGREDO, RELOGIO_PORTA: "18787", RELOGIO_ARQUIVO: join(mkdtempSync(join(tmpdir(), "rel-")), "a.json") },
  stdio: "ignore",
});
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await esperar(500);
const chamar = (rota, corpo, segredo = SEGREDO) => fetch(`http://127.0.0.1:18787${rota}`, { method: "POST", headers: { "x-relogio-segredo": segredo }, body: JSON.stringify(corpo) });
try {
  assert.equal((await chamar("/agendar", { id: "x", quando: new Date().toISOString(), url: "http://127.0.0.1:18788/t" }, "errado")).status, 401);
  const t0 = Date.now();
  assert.equal((await chamar("/agendar", { id: "rodada:42", quando: new Date(t0 + 1200).toISOString(), url: "http://127.0.0.1:18788/api/tick", corpo: { tipo: "fim_rodada", batalha: 42 } })).status, 200);
  await chamar("/agendar", { id: "cancelado", quando: new Date(t0 + 800).toISOString(), url: "http://127.0.0.1:18788/api/tick" });
  await chamar("/cancelar", { id: "cancelado" });
  await esperar(2200);
  assert.equal(recebidos.length, 1, "só o callback não cancelado chega");
  assert.equal(recebidos[0].segredo, SEGREDO);
  assert.deepEqual(recebidos[0].corpo, { id: "rodada:42", tipo: "fim_rodada", batalha: 42 });
  assert.ok(recebidos[0].em - t0 >= 1100, "não dispara antes da hora");
  console.log("✔ relógio: agenda, cancela, protege por segredo e dispara na hora certa");
} finally { proc.kill(); jogo.close(); }
