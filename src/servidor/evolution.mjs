// Cliente mínimo da Evolution API (v2) e leitura dos eventos do webhook.
export function criarEvolution({ url = process.env.EVOLUTION_URL, apiKey = process.env.EVOLUTION_API_KEY,
  instancia = process.env.EVOLUTION_INSTANCIA ?? "rpg-yotsuhoshi", fetch: f = globalThis.fetch } = {}) {
  const base = (url ?? "").replace(/\/+$/, "");
  async function chamar(metodo, caminho, corpo) {
    if (!base || !apiKey) throw new Error("EVOLUTION_URL/EVOLUTION_API_KEY não configuradas");
    const r = await f(`${base}${caminho}`, {
      method: metodo, headers: { "content-type": "application/json", apikey: apiKey },
      ...(corpo && { body: JSON.stringify(corpo) }),
    });
    const texto = await r.text();
    if (!r.ok) throw new Error(`evolution ${caminho.split("/").slice(0, 3).join("/")} ${r.status}: ${texto.slice(0, 300)}`);
    try { return JSON.parse(texto); } catch { return {}; }
  }
  const inst = encodeURIComponent(instancia);
  return {
    instancia,
    texto: (para, text, mencoes = []) => chamar("POST", `/message/sendText/${inst}`, { number: para, text, ...(mencoes.length && { mentioned: mencoes }) }),
    imagem: (para, png, legenda = "", mencoes = []) => chamar("POST", `/message/sendMedia/${inst}`, {
      number: para, mediatype: "image", mimetype: "image/png", media: Buffer.from(png).toString("base64"),
      caption: legenda, fileName: "carta.png", ...(mencoes.length && { mentioned: mencoes }),
    }),
    infoGrupo: (grupo) => chamar("GET", `/group/findGroupInfos/${inst}?groupJid=${encodeURIComponent(grupo)}`),
    estado: () => chamar("GET", `/instance/connectionState/${inst}`),
    webhook: () => chamar("GET", `/webhook/find/${inst}`),
  };
}

/** Executa a lista de saídas que o motor devolveu (texto, imagem, espera). Erros de envio não derrubam o resto. */
export async function enviarSaidas(evo, saidas, { dormir = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const erros = [];
  for (const s of saidas) {
    try {
      if (s.espera) await dormir(s.espera);
      else if (s.imagem) await evo.imagem(s.para, s.imagem, s.legenda, s.mencoes);
      else if (s.texto) await evo.texto(s.para, s.texto, s.mencoes);
    } catch (e) { erros.push(String(e.message ?? e)); }
  }
  return erros;
}

const ehPn = (j) => typeof j === "string" && j.endsWith("@s.whatsapp.net");
const ehLid = (j) => typeof j === "string" && j.endsWith("@lid");

/** Converte o evento messages.upsert da Evolution numa mensagem simples, ou null se não for para o jogo. */
export function lerMensagem(evento) {
  const tipo = String(evento?.event ?? "").toLowerCase().replace("_", ".");
  if (tipo !== "messages.upsert") return null;
  const d = Array.isArray(evento.data) ? evento.data[0] : evento.data;
  const k = d?.key;
  if (!k || k.fromMe || !k.remoteJid || k.remoteJid === "status@broadcast" || k.remoteJid.endsWith("@newsletter")) return null;
  const m = d.message ?? {};
  const texto = m.conversation ?? m.extendedTextMessage?.text ?? m.imageMessage?.caption ?? m.videoMessage?.caption
    ?? m.buttonsResponseMessage?.selectedDisplayText ?? m.listResponseMessage?.title ?? null;
  if (texto == null) return null;
  const grupo = k.remoteJid.endsWith("@g.us");
  const candidatos = grupo ? [k.participant, k.participantAlt, k.participantPn, d.participant, k.senderPn]
    : [k.remoteJid, k.remoteJidAlt, k.senderPn, k.senderLid];
  const pn = candidatos.find(ehPn) ?? null;
  const lid = candidatos.find(ehLid) ?? null;
  if (!pn && !lid) return null;
  const ctx = m.extendedTextMessage?.contextInfo ?? d.contextInfo ?? m.contextInfo ?? {};
  return {
    id: k.id, grupo, chat: k.remoteJid, texto: String(texto).slice(0, 2000),
    autor: { pn, lid, jid: pn ?? lid, numero: pn ? pn.split("@")[0] : null, nome: d.pushName ?? null },
    mencoes: ctx.mentionedJid ?? [],
    quando: Number(d.messageTimestamp ?? 0) * 1000 || null,
  };
}
