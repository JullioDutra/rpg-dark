// Esquema da resposta do NARRADOR (doc 11). A IA nunca altera o jogo diretamente: ela devolve este JSON,
// e o motor valida cada evento proposto antes de aplicar. Funciona com qualquer provedor (Claude, Sabiá…).

export const EVENTOS_PERMITIDOS = [
  "iniciar_batalha", "propor_recompensa", "revelar_subfase", "atualizar_marco", "disparar_fato",
  "registrar_relacao", "registrar_fato_canonico", "pedir_teste", "julgar_tatica", "pista_do_ovo", "propor_pacto",
];

export const ESQUEMA_NARRADOR = {
  type: "object",
  additionalProperties: false,
  required: ["narracao", "eventos"],
  properties: {
    narracao: { type: "string", description: "Texto para o WhatsApp, até ~900 caracteres, formatação *negrito* _itálico_" },
    eventos: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["tipo", "dados"],
        properties: {
          tipo: { type: "string", enum: EVENTOS_PERMITIDOS },
          dados: { type: "string", description: "JSON (em texto) com os parâmetros do evento" },
        },
      },
    },
    nota_juiz: {
      type: "object",
      additionalProperties: false,
      required: ["coerencia", "ambiente", "fraqueza", "cooperacao", "originalidade"],
      properties: Object.fromEntries(["coerencia", "ambiente", "fraqueza", "cooperacao", "originalidade"]
        .map((k) => [k, { type: "integer", enum: [0, 1, 2] }])),
    },
  },
};

// Validador mínimo de JSON Schema (o subconjunto que usamos), sem dependências.
export function validar(valor, esquema, caminho = "$") {
  const erros = [];
  const t = esquema.type;
  const tipoDe = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v);
  const real = tipoDe(valor);
  if (t && !(real === t || (t === "number" && real === "integer"))) return [`${caminho}: esperado ${t}, veio ${real}`];
  if (esquema.enum && !esquema.enum.includes(valor)) erros.push(`${caminho}: valor fora da lista (${JSON.stringify(valor)})`);
  if (t === "object") {
    for (const k of esquema.required ?? []) if (!(k in valor)) erros.push(`${caminho}.${k}: obrigatório`);
    for (const [k, v] of Object.entries(valor)) {
      const sub = esquema.properties?.[k];
      if (!sub) { if (esquema.additionalProperties === false) erros.push(`${caminho}.${k}: campo não permitido`); continue; }
      erros.push(...validar(v, sub, `${caminho}.${k}`));
    }
  }
  if (t === "array" && esquema.items) valor.forEach((v, i) => erros.push(...validar(v, esquema.items, `${caminho}[${i}]`)));
  return erros;
}

// Extrai o primeiro objeto JSON de um texto (modelos sem saída estruturada às vezes cercam com ```json)
export function extrairJSON(texto) {
  if (!texto) return null;
  const limpo = texto.replace(/```(?:json)?/gi, "").trim();
  const ini = limpo.indexOf("{");
  if (ini < 0) return null;
  let nivel = 0, emString = false, escape = false;
  for (let i = ini; i < limpo.length; i++) {
    const c = limpo[i];
    if (emString) { if (escape) escape = false; else if (c === "\\") escape = true; else if (c === '"') emString = false; continue; }
    if (c === '"') emString = true;
    else if (c === "{") nivel++;
    else if (c === "}" && --nivel === 0) {
      try { return JSON.parse(limpo.slice(ini, i + 1)); } catch { return null; }
    }
  }
  return null;
}
