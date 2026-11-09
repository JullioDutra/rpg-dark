// Testes da camada de IA com respostas simuladas (sem rede e sem gastar crédito). Uso: node scripts/testar-ia.mjs
import assert from "node:assert/strict";
import { criarMaritaca, criarAnthropic, comReserva } from "../src/ia/provedores.mjs";
import { narrar } from "../src/ia/narrador.mjs";
import { validar, extrairJSON, ESQUEMA_NARRADOR } from "../src/ia/esquemas.mjs";

let n = 0;
const t = async (nome, fn) => { await fn(); n++; console.log("✔", nome); };
const fetchSimulado = (...respostas) => {
  const chamadas = [];
  const f = async (url, init) => {
    chamadas.push({ url, corpo: JSON.parse(init.body) });
    const conteudo = respostas[Math.min(chamadas.length - 1, respostas.length - 1)];
    return { ok: true, json: async () => ({ choices: [{ message: { content: conteudo } }], usage: { total_tokens: 10 } }) };
  };
  f.chamadas = chamadas;
  return f;
};
const OK = JSON.stringify({ narracao: "A névoa vermelha se abre…", eventos: [{ tipo: "iniciar_batalha", dados: '{"viloes":["V003"]}' }] });
const CTX = { bibliaDoMundo: "…", marco: { id: "A1-M2" }, ficha: { nome: "Kaito" }, permitidos: { viloes: ["V003"] }, acao: "procuro rastros" };

await t("extrai JSON cercado por ```json e texto", () => {
  assert.deepEqual(extrairJSON('Claro! ```json\n{"a": {"b": "}"}}\n``` pronto'), { a: { b: "}" } });
});
await t("validador recusa campo extra e evento fora da lista", () => {
  const erros = validar({ narracao: "x", eventos: [{ tipo: "dar_forca", dados: "{}" }], extra: 1 }, ESQUEMA_NARRADOR);
  assert.ok(erros.some((e) => e.includes("extra"))); assert.ok(erros.some((e) => e.includes("fora da lista")));
});
await t("Maritaca: resposta válida na 1ª tentativa, esquema vai no prompt", async () => {
  const f = fetchSimulado("```json\n" + OK + "\n```");
  const r = await criarMaritaca({ apiKey: "k", fetch: f }).gerarJSON({ sistema: "S", mensagens: [{ role: "user", content: "oi" }], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, true); assert.equal(f.chamadas.length, 1);
  assert.match(f.chamadas[0].url, /chat\.maritaca\.ai\/api\/chat\/completions$/);
  assert.match(f.chamadas[0].corpo.messages[0].content, /JSON Schema/);
});
await t("Maritaca: corrige sozinha depois de um JSON inválido", async () => {
  const f = fetchSimulado('{"narracao": 5}', OK);
  const r = await criarMaritaca({ apiKey: "k", fetch: f }).gerarJSON({ sistema: "S", mensagens: [], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, true); assert.equal(f.chamadas.length, 2);
  assert.match(f.chamadas[1].corpo.messages.at(-1).content, /não seguiu o esquema/);
});
await t("Maritaca: desiste após 2 tentativas inválidas", async () => {
  const r = await criarMaritaca({ apiKey: "k", fetch: fetchSimulado("não sei") }).gerarJSON({ sistema: "S", mensagens: [], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, false); assert.equal(r.motivo, "esquema_invalido");
});
const clienteClaude = (resposta) => {
  const c = { chamadas: [], beta: { messages: { create: async (p) => { c.chamadas.push(p); return resposta; } } } };
  return c;
};
await t("Claude: usa saída estruturada, cache do sistema e fallback", async () => {
  const c = clienteClaude({ stop_reason: "end_turn", content: [{ type: "text", text: OK }], usage: {} });
  const r = await criarAnthropic({ cliente: c }).gerarJSON({ sistema: "S", mensagens: [], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, true);
  const p = c.chamadas[0];
  assert.equal(p.model, "claude-opus-5-5"); assert.equal(p.output_config.format.type, "json_schema");
  assert.equal(p.system[0].cache_control.type, "ephemeral"); assert.equal(p.fallbacks, "default");
});
await t("Claude: recusa vira falha controlada", async () => {
  const r = await criarAnthropic({ cliente: clienteClaude({ stop_reason: "refusal", stop_details: { category: "cyber" }, content: [] }) })
    .gerarJSON({ sistema: "S", mensagens: [], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, false); assert.equal(r.motivo, "recusa");
});
await t("Reserva: se a Maritaca cair, usa o Claude", async () => {
  const quebrada = { nome: "maritaca", gerarJSON: async () => { throw new Error("rede"); } };
  const claude = criarAnthropic({ cliente: clienteClaude({ stop_reason: "end_turn", content: [{ type: "text", text: OK }] }) });
  const r = await comReserva(quebrada, claude).gerarJSON({ sistema: "S", mensagens: [], esquema: ESQUEMA_NARRADOR });
  assert.equal(r.ok, true); assert.equal(r.tentativaPrincipal.motivo, "excecao");
});
await t("Narrador: descarta batalha com vilão fora dos permitidos", async () => {
  const resp = JSON.stringify({ narracao: "…", eventos: [{ tipo: "iniciar_batalha", dados: '{"viloes":["V100"]}' }, { tipo: "disparar_fato", dados: '{"fato":"F03"}' }] });
  const r = await narrar(criarMaritaca({ apiKey: "k", fetch: fetchSimulado(resp) }), CTX);
  assert.deepEqual(r.eventos.map((e) => e.tipo), ["disparar_fato"]);
});
await t("Narrador: IA fora do ar não trava o jogo", async () => {
  const fora = { nome: "x", gerarJSON: async () => ({ ok: false, motivo: "http_503" }) };
  const r = await narrar(fora, CTX);
  assert.equal(r.eventos.length, 0); assert.ok(r.narracao.length > 0); assert.equal(r.falha, "http_503");
});
await t("Narrador: alegações de poder vão marcadas como ignoradas no contexto", async () => {
  const f = fetchSimulado(OK);
  await narrar(criarMaritaca({ apiKey: "k", fetch: f }), { ...CTX, alegacoes: ["1000 %"] });
  assert.match(f.chamadas[0].corpo.messages.at(-1).content, /alegacoes_ignoradas/);
});
console.log(`${n} testes de IA passaram`);
