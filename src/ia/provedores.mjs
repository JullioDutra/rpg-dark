// Provedores de IA intercambiáveis. O jogo só precisa de UMA operação: gerar um JSON que obedeça um esquema.
//
//   const ia = criarProvedor({ tipo: "maritaca" | "anthropic", ... });
//   const r = await ia.gerarJSON({ sistema, mensagens, esquema });  // → { ok, dados, provedor, motivo? }
//
// Variáveis de ambiente (doc 30):
//   IA_PROVEDOR=maritaca|anthropic
//   MARITACA_API_KEY, MARITACA_MODELO (ex.: sabiazinho-4), MARITACA_URL (padrão https://chat.maritaca.ai/api)
//   ANTHROPIC_API_KEY, ANTHROPIC_MODELO (padrão claude-opus-5-5)
import { validar, extrairJSON } from "./esquemas.mjs";

const TENTATIVAS = 2; // 1 tentativa + 1 correção com a lista de erros

// ───────────────────────────── Maritaca (Sabiá) ─────────────────────────────
// API compatível com o formato de chat da OpenAI (POST {url}/chat/completions). Como não há garantia documentada
// de saída estruturada/ferramentas, o esquema vai no prompt e a resposta é validada (e corrigida 1 vez).
export function criarMaritaca({ apiKey = process.env.MARITACA_API_KEY, modelo = process.env.MARITACA_MODELO ?? "sabiazinho-4",
  url = process.env.MARITACA_URL ?? "https://chat.maritaca.ai/api", fetch: f = globalThis.fetch, modoJSON = false } = {}) {
  return {
    nome: `maritaca:${modelo}`,
    async gerarJSON({ sistema, mensagens, esquema, maxTokens = 1500 }) {
      const instrucao = `${sistema}\n\nResponda SOMENTE com um objeto JSON válido, sem texto antes ou depois, ` +
        `que siga exatamente este JSON Schema:\n${JSON.stringify(esquema)}`;
      let historico = [{ role: "system", content: instrucao }, ...mensagens];
      let ultimoErro = "";
      for (let t = 0; t < TENTATIVAS; t++) {
        const resp = await f(`${url}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: modelo, messages: historico, max_tokens: maxTokens,
            ...(modoJSON && { response_format: { type: "json_object" } }) }),
        });
        if (!resp.ok) return { ok: false, provedor: this.nome, motivo: `http_${resp.status}`, detalhe: await resp.text() };
        const corpo = await resp.json();
        const texto = corpo.choices?.[0]?.message?.content ?? "";
        const dados = extrairJSON(texto);
        const erros = dados ? validar(dados, esquema) : ["resposta não contém JSON"];
        if (!erros.length) return { ok: true, dados, provedor: this.nome, uso: corpo.usage };
        ultimoErro = erros.join("; ");
        historico = [...historico, { role: "assistant", content: texto },
          { role: "user", content: `O JSON não seguiu o esquema: ${ultimoErro}. Responda novamente só com o JSON corrigido.` }];
      }
      return { ok: false, provedor: this.nome, motivo: "esquema_invalido", detalhe: ultimoErro };
    },
  };
}

// ───────────────────────────── Anthropic (Claude) ─────────────────────────────
// SDK oficial @anthropic-ai/sdk. Saída estruturada garantida pelo próprio modelo (output_config.format), prompt caching
// no sistema (a Bíblia do Mundo é grande e estável) e fallback no servidor em caso de recusa.
export function criarAnthropic({ apiKey = process.env.ANTHROPIC_API_KEY, modelo = process.env.ANTHROPIC_MODELO ?? "claude-opus-5-5",
  esforco = "low", cliente } = {}) {
  let sdk = cliente;
  return {
    nome: `anthropic:${modelo}`,
    async gerarJSON({ sistema, mensagens, esquema, maxTokens = 16000 }) {
      if (!sdk) {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        sdk = new Anthropic(apiKey ? { apiKey } : {});
      }
      const resposta = await sdk.beta.messages.create({
        model: modelo,
        max_tokens: maxTokens,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: sistema, cache_control: { type: "ephemeral" } }],
        messages: mensagens,
        output_config: { effort: esforco, format: { type: "json_schema", schema: esquema } },
      });
      if (resposta.stop_reason === "refusal") return { ok: false, provedor: this.nome, motivo: "recusa", detalhe: resposta.stop_details?.category };
      if (resposta.stop_reason === "max_tokens") return { ok: false, provedor: this.nome, motivo: "max_tokens" };
      const texto = resposta.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const dados = extrairJSON(texto);
      const erros = dados ? validar(dados, esquema) : ["resposta não contém JSON"];
      if (erros.length) return { ok: false, provedor: this.nome, motivo: "esquema_invalido", detalhe: erros.join("; ") };
      return { ok: true, dados, provedor: this.nome, uso: resposta.usage };
    },
  };
}

export function criarProvedor(opcoes = {}) {
  const tipo = opcoes.tipo ?? process.env.IA_PROVEDOR ?? "maritaca";
  if (tipo === "anthropic") return criarAnthropic(opcoes);
  if (tipo === "maritaca") return criarMaritaca(opcoes);
  throw new Error(`Provedor de IA desconhecido: ${tipo}`);
}

// Usa um provedor principal e, se ele falhar (rede, recusa, JSON inválido), tenta o reserva.
export function comReserva(principal, reserva) {
  return {
    nome: `${principal.nome}→${reserva?.nome ?? "nenhum"}`,
    async gerarJSON(args) {
      const r = await principal.gerarJSON(args).catch((e) => ({ ok: false, motivo: "excecao", detalhe: String(e) }));
      if (r.ok || !reserva) return r;
      const r2 = await reserva.gerarJSON(args).catch((e) => ({ ok: false, motivo: "excecao", detalhe: String(e) }));
      return { ...r2, tentativaPrincipal: r };
    },
  };
}
