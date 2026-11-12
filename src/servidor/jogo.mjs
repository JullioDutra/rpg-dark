// Motor do jogo no WhatsApp: recebe uma mensagem já lida (evolution.lerMensagem) e devolve as SAÍDAS
// ({ para, texto, mencoes } | { para, imagem, legenda, mencoes } | { espera }). Quem envia é o webhook.
// Criação, carta, abertura e exploração individual persistente.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { CATALOGO } from "../avatar/index.mjs";
import { PELE, CABELO, OLHOS } from "../avatar/paletas.mjs";
import { dnaJogador } from "../avatar/dna.mjs";
import { sortear, atributosIniciais, rngSeguro } from "./sorteio.mjs";
import { cartaPersonagem, previaAvatar } from "./carta.mjs";
import { um } from "./db.mjs";
import { criarExploracao } from "./exploracao.mjs";
import { criarNarrador, ehAcaoLivre } from "./narrador.mjs";
import { criarCombate } from "./combate.mjs";
import { criarMundo } from "./mundo.mjs";
import { criarItens } from "./itens.mjs";
import { criarExtras } from "./extras.mjs";
import { PRESSAO, textoPressao } from "../regras/combate.mjs";
import { criarSocial } from "./social.mjs";
import { criarMestre } from "./mestre.mjs";
import { criarAmeacas } from "./ameacas.mjs";
import { kitInicial } from "../regras/itens.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { comandoExploracao, recuperarVigor, buscarRegioes } from "../regras/exploracao.mjs";
import { textoOrigem, textoRegiao, textoReino, textoPrimeirosPassos, rodape, NOME_CASTA, ambiente } from "./textos.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
let DADOS = null;
export function dados() {
  return (DADOS ??= { aldeias: ler("aldeias.json"), atributos: ler("atributos-magicos.json"), classes: ler("classes.json"),
    pets: ler("pets.json"), ganchos: ler("ganchos-aldeia.json") });
}

const DESCRICAO_CLASSE = {
  Mago: "mestre dos grimórios, muita mana", Cavaleiro: "muralha viva, protege o grupo", Bruxo: "pactos e maldições, poder com preço",
  "Anti-magia": "anula a mana, luta com o Vazio", Espadachim: "velocidade e cortes precisos", "Meio-humano": "sangue de fera, instinto",
  "Força da Natureza": "fala com o mundo vivo", "Demônio": "sangue demoníaco, miasma", Paladino: "luz e escudo, cura e fé",
};
const ROTULOS = { baguncado: "Bagunçado", "franja-longa": "Franja longa", "tranca-lateral": "Trança lateral", trancas: "Tranças",
  "meio-raspado": "Meio raspado", media: "Média", palida: "Pálida", ambar: "Âmbar", "verde-agua": "Verde-água", "cinza-cinza": "Cinza-pálido",
  "azul-escuro": "Azul-escuro", "maria-chiquinha": "Maria-chiquinha", "rabo-alto": "Rabo de cavalo alto", hime: "Liso com franja reta",
  rabo: "Rabo baixo", feminino: "Feminino", masculino: "Masculino" };
const rotulo = (s) => ROTULOS[s] ?? s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const APARENCIA = [
  { campo: "genero", titulo: "*Seu personagem é…*", opcoes: ["feminino", "masculino"], semSurpresa: true },
  { campo: "cabelo", titulo: "*Cabelo*", opcoes: CATALOGO.cabelo },
  { campo: "corCabelo", titulo: "*Cor do cabelo*", opcoes: Object.keys(CABELO) },
  { campo: "pele", titulo: "*Pele*", opcoes: Object.keys(PELE).filter((p) => !["osso", "espectral", "pedra"].includes(p)) },
  { campo: "corOlhos", titulo: "*Cor dos olhos*", opcoes: Object.keys(OLHOS) },
];
const NOMES_RESERVADOS = /\b(kanata|kaien|nisteroy|yoru|seio|eclipse|admin|bot|narrador)\b/;
const NOME_PROIBIDO = /\b(porra|caralho|buceta|puta|viado|merda|cu|pau|rola|foda|fdp|nazi|hitler)\b/;

const ehComando = (t, ...palavras) => palavras.some((p) => t === p || t === `!${p}` || t === `/${p}`);
const lista = (opcoes, fmt = rotulo) => opcoes.map((o, i) => `*${i + 1}* ${fmt(o)}`).join(" · ");

/** Escolhe uma opção por número ("3") ou por nome aproximado ("ruivo"). "0" ou "surpresa" sorteia. */
export function escolherOpcao(texto, opcoes, rng = rngSeguro) {
  const t = semAcento(texto.toLowerCase()).replace(/[*.!]/g, "").trim();
  if (/^(0|surpresa|aleatorio|qualquer)$/.test(t)) return opcoes[Math.floor(rng() * opcoes.length)];
  const n = Number(t.match(/^\d+/)?.[0]);
  if (n >= 1 && n <= opcoes.length) return opcoes[n - 1];
  const alvo = t.replace(/\s+/g, "-");
  return opcoes.find((o) => semAcento(o.toLowerCase()) === alvo) ?? opcoes.find((o) => semAcento(o.toLowerCase()).startsWith(alvo) && alvo.length >= 3) ?? null;
}

/** Números do Brasil chegam com ou sem o 9 depois do DDD (5562993259733 = 556293259733). */
export function mesmoNumero(a, b) {
  const sem9 = (n) => String(n).replace(/\D/g, "").replace(/^(55\d{2})9(\d{8})$/, "$1$2");
  return sem9(a) === sem9(b);
}

function hashTelefone(sal, chave) {
  return createHash("sha256").update(`${sal}:${chave}`).digest("hex");
}

/** Próximas 21h no horário de Brasília (UTC−3), em ms. */
export function proximoResumo(ms) {
  const d = new Date(ms); d.setUTCHours(24, 0, 0, 0); // 00:00 UTC = 21:00 em Brasília
  return d.getTime();
}

export function criarJogo({ relogio = null, db, sal = process.env.TELEFONE_SAL ?? "", admins = (process.env.ADMINS ?? "").split(/[,\s]+/).filter(Boolean),
  ehAdminGrupo = async () => false, ia = null, rng = rngSeguro, agora = () => Date.now() }) {
  const D = dados();
  const exploracao = criarExploracao({ db, rng, agora });
  const narrador = criarNarrador({ db, ia, agora });
  const combate = criarCombate({ db, rng, agora });
  const extras = criarExtras({ db, rng, agora });
  const social = criarSocial({ db, rng, agora });
  const ameacas = criarAmeacas({ db, rng, agora, relogio });
  const mestre = criarMestre({ db, agora, ameacas });
  // Ganchos do mundo vivo: os modos complementares e, por cima, os contratos da Guilda (que só observam)
  const ganchos = { ...extras,
    aoFalar: async (j, npc, amizade, para) => [...(await extras.aoFalar(j, npc, amizade, para)), ...(await social.aoFalar(j, npc, para))],
    aoConcluir: async (j, cap, para) => [...(await extras.aoConcluir(j, cap, para)), ...(await social.aoConcluir(j, para)), ...(await ameacas.aoConcluir(j))] };
  const mundo = criarMundo({ db, ia, rng, agora, ganchos });
  const itens = criarItens({ db, agora });

  async function identidade(autor) {
    const r = await um(db, `select * from jogo.identidades where ($1::text is not null and wa_jid = $1) or ($2::text is not null and wa_lid = $2)
      order by (wa_jid = $1) desc nulls last, id limit 1`, [autor.pn, autor.lid]);
    if (r) {
      if ((autor.pn && !r.wa_jid) || (autor.lid && !r.wa_lid)) {
        await db.query("update jogo.identidades set wa_jid = coalesce(wa_jid, $2), wa_lid = coalesce(wa_lid, $3) where id = $1", [r.id, autor.pn, autor.lid]).catch(() => {});
      }
      return { ...r, wa_jid: r.wa_jid ?? autor.pn, wa_lid: r.wa_lid ?? autor.lid };
    }
    return um(db, `insert into jogo.identidades (telefone_hash, wa_jid, wa_lid) values ($1, $2, $3)
      on conflict (telefone_hash) do update set wa_jid = coalesce(jogo.identidades.wa_jid, excluded.wa_jid), wa_lid = coalesce(jogo.identidades.wa_lid, excluded.wa_lid)
      returning *`, [hashTelefone(sal, autor.numero ?? autor.lid), autor.pn, autor.lid]);
  }
  const privadoDe = (idt) => idt.wa_jid ?? idt.wa_lid;
  const arroba = (autor) => `@${autor.numero ?? autor.jid.split("@")[0]}`;

  async function ehAdmin(msg) {
    if (admins.length) return [msg.autor.numero, msg.autor.lid?.split("@")[0]].some((n) => n && admins.some((a) => mesmoNumero(a, n)));
    return ehAdminGrupo(msg.chat, msg.autor);
  }

  // ───────────────────────────── grupo ─────────────────────────────
  async function noGrupo(msg) {
    const t = semAcento(msg.texto.trim().toLowerCase()).replace(/\s+/g, " ");
    const ativar = t.match(/^[/!.]?\s*ativar[- ]?mundo\b\s*(.*)$/);
    if (ativar) {
      if (!(await ehAdmin(msg))) return [{ para: msg.chat, texto: "Só um administrador do RPG pode ativar o mundo neste grupo." }];
      const nome = msg.texto.trim().replace(/^[/!.]?\s*ativar[- ]?mundo\s*/i, "").slice(0, 60) || "Yotsuhoshi";
      await db.query(`insert into jogo.mundos (grupo_wa_id, nome) values ($1, $2)
        on conflict (grupo_wa_id) do update set status = 'ativo', nome = excluded.nome`, [msg.chat, nome]);
      return [{ para: msg.chat, texto:
        `*四星 YOTSUHOSHI*${semAcento(nome.toLowerCase()) === "yotsuhoshi" ? "" : `\n_${nome}_`}\n\nHá 500 anos, um garoto roubou o ovo de um dragão. O mundo queimou, um buraco negro se abriu ` +
        `e quatro reis deram a vida para selar o mal.\n\nAgora alguém quer abrir o caixão — e o ovo, perdido, escolheu um de vocês.\n\n` +
        `Para nascer neste mundo, digite *entrar no mundo*.\n${rodape("a criação continua no privado")}` }];
    }
    const mundo = await um(db, "select * from jogo.mundos where grupo_wa_id = $1", [msg.chat]);
    if (!mundo || mundo.status !== "ativo") return [];

    if (/^[/!.]?\s*resetar[- ]?(jogador|personagem)\b/.test(t)) {
      if (!(await ehAdmin(msg))) return [{ para: msg.chat, texto: "Só um administrador do RPG pode apagar um personagem." }];
      const resto = msg.texto.trim().replace(/^[/!.]?\s*resetar[- ]?(jogador|personagem)\s*/i, "").trim();
      const todos = await db.query(`select j.id, j.nome, j.nome_normalizado, i.wa_jid, i.wa_lid from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id where j.mundo_id = $1`, [mundo.id]);
      const digitos = (x) => String(x ?? "").replace(/@[a-z.]+$/i, "").replace(/\D/g, "");
      // Aceita: @menção (número ou LID), número digitado (com ou sem o 9) ou o nome do personagem
      const alvos = [...msg.mencoes, ...(resto.match(/@?\d{8,}/g) ?? [])].map(digitos).filter(Boolean);
      const nome = semAcento(resto.replace(/@\S+/g, "").trim().toLowerCase());
      const alvo = todos.find((x) => alvos.some((a) => [digitos(x.wa_jid), digitos(x.wa_lid)].some((d) => d && (d === a || mesmoNumero(d, a)))))
        ?? (nome ? todos.find((x) => x.nome_normalizado === nome) ?? todos.find((x) => x.nome_normalizado.startsWith(nome) && nome.length >= 3) : null);
      if (!alvo) return [{ para: msg.chat, texto: `Não achei esse personagem. Use *resetar-jogador @pessoa* ou *resetar-jogador NomeDoPersonagem*.\n\nPersonagens deste mundo: ${todos.filter((x) => !x.nome.startsWith("__")).map((x) => x.nome).join(", ") || "nenhum"}.` }];
      await db.query(`delete from jogo.batalhas where id in (select batalha_id from jogo.participantes_batalha where jogador_id = $1)`, [alvo.id]);
      await db.query("delete from jogo.jogadores where id = $1", [alvo.id]);
      return [{ para: msg.chat, texto: `O nome de *${alvo.nome.startsWith("__") ? "um personagem em criação" : alvo.nome}* é apagado das estrelas. Quem quiser, pode nascer de novo com *entrar no mundo*.` }];
    }

    if (/^(!|\/)?(entrar( no mundo)?|quero entrar( no mundo)?|entrar no jogo)$/.test(t)) return entrar(msg, mundo);
    if (ehComando(t, "ficha", "carta", "minha ficha", "minha carta")) return ficha(msg, mundo, msg.chat);
    if (ehComando(t, "ajuda", "comandos")) return [{ para: msg.chat, texto: AJUDA }];
    if (ehComando(t, "dado", "dados", "d20", "como funciona o dado", "guia do dado")) return guiaDado(msg.chat);
    // Duelo e apoio entre jogadores
    if (ehComando(t, "ranking", "rank", "placar")) return social.ranking(mundo.id, msg.chat);
    if (/^[!/]?mestre\b/.test(t)) return []; // a mão do mestre nunca aparece no grupo
    if (/^[!/]?resgatar\b/.test(t)) {
      const idt = await identidade(msg.autor);
      const eu = await um(db, "select * from jogo.jogadores where mundo_id = $1 and identidade_id = $2 and estado = 'ativo'", [mundo.id, idt.id]);
      return mestre.resgatar(eu, t.replace(/^[!/]?resgatar\s*/, "").replace(/@\S+/g, "").trim(), msg.chat);
    }
    if (/^[!/]?(duelo|desafio|x1|apoiar|apoio|aceitar|aceito|recusar|recuso|historia|conceder|dar)\b/.test(t)) {
      const idt = await identidade(msg.autor);
      const eu = await um(db, "select * from jogo.jogadores where mundo_id = $1 and identidade_id = $2 and estado = 'ativo'", [mundo.id, idt.id]);
      const achar = async (m) => {
        const todos = await db.query(`select j.*, i.wa_jid, i.wa_lid from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id where j.mundo_id = $1 and j.estado = 'ativo'`, [mundo.id]);
        const dig = (x) => String(x ?? "").replace(/@[a-z.]+$/i, "").replace(/\D/g, "");
        const alvos = [...m.mencoes, ...(m.texto.match(/@?\d{8,}/g) ?? [])].map(dig).filter(Boolean);
        const nome = semAcento(m.texto.trim().replace(/^\S+\s*/, "").replace(/@\S+/g, "").trim().toLowerCase());
        return todos.find((x) => alvos.some((a) => [dig(x.wa_jid), dig(x.wa_lid)].some((d) => d && (d === a || mesmoNumero(d, a)))))
          ?? (nome.length >= 3 ? todos.find((x) => x.nome_normalizado === nome || x.nome_normalizado.startsWith(nome)) : null) ?? null;
      };
      if (/^[!/]?dar\b/.test(t)) return social.dar(msg, eu, achar);
      const r = await extras.noGrupo(msg, mundo, t, eu, achar, /^[!/]?conceder\b/.test(t) ? await ehAdmin(msg) : false);
      if (r) return r;
    }
    if (ehComando(t, "feitos", "noticias", "mural")) {
      const fs = await db.query("select texto from jogo.feitos where mundo_id = $1 order by id desc limit 8", [mundo.id]);
      return [{ para: msg.chat, texto: fs.length ? `*Últimos feitos do mundo*\n\n${fs.map((f) => f.texto.split("\n")[0].replace(/^[^\p{L}*]+/u, "")).join("\n")}` : "Nenhum feito ainda. Seja o primeiro." }];
    }
    if (/^[!/]?(explorar|viajar|mapa|rota|vigor|viagem|descobertas|inventario|itens|bolsa|loja|locais|missao|falar|lutar|onde estou|aldeia|reino)\b/.test(t)) return [{ para: msg.chat, texto: "Isso se faz no meu privado. Me chama lá." }];
    return []; // conversa do grupo: o bot fica quieto
  }

  async function entrar(msg, mundo) {
    const idt = await identidade(msg.autor);
    const j = await um(db, "select * from jogo.jogadores where mundo_id = $1 and identidade_id = $2", [mundo.id, idt.id]);
    const eu = arroba(msg.autor);
    if (j?.estado === "criando") return [{ para: msg.chat, texto: `${eu}, as estrelas já estão girando para você — continue *no meu privado*.`, mencoes: [msg.autor.jid] },
      { para: privadoDe(idt), texto: "Continuamos daqui. " + perguntaDaEtapa(j) }];
    if (j) return [{ para: msg.chat, texto: `${eu}, você já vive neste mundo como *${j.nome}*. Digite *ficha* para ver sua carta.`, mencoes: [msg.autor.jid] }];
    await db.query(`insert into jogo.jogadores (mundo_id, identidade_id, nome, nome_normalizado, etapa_criacao)
      values ($1, $2, $3, $3, 'nome') on conflict do nothing`, [mundo.id, idt.id, `__criando_${idt.id}`]);
    return [
      { para: msg.chat, texto: `${eu}, as Quatro Estrelas ouviram seu chamado. Continue no meu privado.`, mencoes: [msg.autor.jid] },
      { para: privadoDe(idt), texto: `*Bem-vindo a Yotsuhoshi.*\n\nAntes que as estrelas girem, diga: ` +
        `qual será o *nome* do seu personagem?\n${rodape("de 2 a 20 letras", "não poderá ser trocado")}` },
    ];
  }

  async function ficha(msg, mundo, destino) {
    const idt = await identidade(msg.autor);
    const j = await um(db, "select * from jogo.jogadores where mundo_id = $1 and identidade_id = $2 and estado <> 'criando'", [mundo.id, idt.id]);
    if (!j) return [{ para: destino, texto: "Você ainda não tem personagem neste mundo. Digite *entrar no mundo* no grupo." }];
    return [{ para: destino, imagem: cartaPersonagem(j, j.avatar_dna), legenda: legendaFicha(j, agora()) }];
  }

  // ───────────────────────────── privado ─────────────────────────────
  async function noPrivado(msg) {
    const idt = await identidade(msg.autor);
    const ativo = await um(db, `select j.* from jogo.jogadores j join jogo.mundos m on m.id = j.mundo_id
      where j.identidade_id = $1 and m.status = 'ativo' and j.estado = 'ativo' order by j.atualizado_em desc limit 1`, [idt.id]);
    // A história é do mundo: o que outro jogador já concluiu chega como notícia antes de qualquer coisa
    const tn = semAcento(msg.texto.trim().toLowerCase()).replace(/\s+/g, " ");
    // Mão do mestre: só no privado e só para quem está em ADMINS. Para qualquer outra pessoa, "mestre" é uma palavra comum.
    if (/^[!/]?mestre\b/.test(tn) && admins.length && (await ehAdmin(msg))) return mestre.comando(msg, tn);
    const novidades = ativo ? await mundo.herdar(ativo, msg.chat) : [];
    if (ativo) {
      const m = tn.match(/^[!/]?resgatar\s*(.*)$/);
      if (m) return [...novidades, ...(await mestre.resgatar(ativo, m[1], msg.chat))];
      const preso = await mestre.bloqueio(ativo, tn.replace(/^[!/]/, ""), msg.chat);
      if (preso && !preso.segue) return [...novidades, ...preso.saidas];
      if (preso?.segue) novidades.push(...preso.saidas);
    }
    if (ativo) {
      const tc = tn.replace(/^[!/]/, "");
      const fechada = await ameacas.cidadeFechada(ativo, tc);
      if (fechada) return [...novidades, { para: msg.chat, texto: fechada }];
      const am = await ameacas.comando(ativo, tc, msg.chat);
      if (am.tratado) return [...novidades, ...am.saidas, ...(await mestre.observar(ativo, msg.texto, msg.chat))];
    }
    const saidas = [...novidades, ...(await privadoBase(msg))];
    if (ativo) { saidas.push(...(await mestre.observar(ativo, msg.texto, msg.chat))); await agendarChegada(ativo.id); }
    return saidas;
  }

  // ── tempo: o relógio da VPS chama de volta na hora de um prazo (chegada de viagem, resumo do dia) ──
  let resumoAgendadoAte = 0;
  async function agendarChegada(jogadorId) {
    if (!relogio) return;
    const v = await um(db, "select chegada_em from jogo.viagens where jogador_id = $1 and concluida_em is null", [jogadorId]);
    if (v) await relogio.agendar(`chegada:${jogadorId}`, +new Date(v.chegada_em) + 2000, { tipo: "chegada", jogador: Number(jogadorId) });
  }
  async function agendarResumo() {
    if (!relogio || resumoAgendadoAte > agora()) return;
    const quando = proximoResumo(agora());
    resumoAgendadoAte = Math.min(quando, agora() + 6 * 3_600_000);
    await relogio.agendar("resumo-diario", quando, { tipo: "resumo" });
  }
  /** Chamado por /api/tick. corpo: { tipo: "chegada", jogador } | { tipo: "resumo" } */
  async function aoTick(corpo = {}) {
    if (corpo.tipo === "chegada") {
      let j = await um(db, `select j.*, i.wa_jid, i.wa_lid from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id where j.id = $1 and j.estado = 'ativo'`, [corpo.jogador]);
      const para = j?.wa_jid ?? j?.wa_lid;
      if (!para) return [];
      const v = await um(db, "select chegada_em from jogo.viagens where jogador_id = $1 and concluida_em is null", [j.id]);
      if (!v) return []; // já chegou por conta própria
      if (+new Date(v.chegada_em) > agora()) { await agendarChegada(j.id); return []; }
      const antes = j.regiao_atual;
      const e = await exploracao(j.id, { chat: para, id: `tick:${agora()}`, texto: "" });
      j = { ...j, ...e.jogador };
      return [...e.saidas, ...(j.regiao_atual !== antes ? await mundo.chegada(j, para) : [])];
    }
    if (corpo.tipo === "ameaca") return ameacas.aoTick(corpo.ameaca);
    if (corpo.tipo === "resumo") {
      const saidas = [];
      const mundos = await db.query("select id, grupo_wa_id from jogo.mundos where status = 'ativo' and grupo_wa_id is not null");
      for (const m of mundos) {
        const fs = await db.query("select texto, tipo from jogo.feitos where mundo_id = $1 and criado_em > $2 order by id", [m.id, new Date(agora() - 24 * 3_600_000)]);
        if (!fs.length) continue; // dia sem feitos: o grupo fica em paz
        const linhas = fs.slice(-8).map((f) => `• ${f.texto.split("\n").find((l) => /\p{L}/u.test(l.replace(/\*[^*]*CAIU[^*]*\*/u, ""))) ?? f.texto.split("\n")[0]}`.replace(/^• [^\p{L}*_]+/u, "• "));
        const topo = await db.query("select nome, nivel from jogo.jogadores where mundo_id = $1 and estado = 'ativo' order by nivel desc, xp desc limit 3", [m.id]);
        saidas.push({ para: m.grupo_wa_id, texto: `*Crônica do dia em Yotsuhoshi*\n\n${linhas.join("\n")}${fs.length > 8 ? `\n_…e mais ${fs.length - 8}._` : ""}\n\n` +
          `_Nas tavernas, os nomes mais repetidos esta noite:_ ${topo.map((x) => `${x.nome} (nível ${x.nivel})`).join(", ")}.\n${rodape("feitos mostra os últimos", "ranking mostra todos")}` });
      }
      resumoAgendadoAte = 0;
      await agendarResumo();
      return saidas;
    }
    return [];
  }
  async function privadoBase(msg) {
    const idt = await identidade(msg.autor);
    if (!idt.privado_ok) await db.query("update jogo.identidades set privado_ok = true where id = $1", [idt.id]);
    const para = msg.chat;
    const t = semAcento(msg.texto.trim().toLowerCase()).replace(/\s+/g, " ");
    let j = await um(db, `select j.*, m.grupo_wa_id, m.nome as mundo_nome from jogo.jogadores j join jogo.mundos m on m.id = j.mundo_id
      where j.identidade_id = $1 and m.status = 'ativo' order by (j.estado = 'criando') desc, j.atualizado_em desc limit 1`, [idt.id]);
    if (!j) return [{ para, texto: "Oi. Eu sou o narrador de *Yotsuhoshi*, um RPG de anime no WhatsApp.\n\nPara jogar, entre num grupo onde o mundo está ativo e digite *entrar no mundo*." }];
    if (j.estado === "criando") return criacao(msg, j, para, t);
    const info = ehComando(t, "onde estou", "regiao", "minha regiao", "local", "onde to", "onde eu estou", "aldeia", "minha aldeia",
      "casa", "minha casa", "origem", "reino", "meu reino");
    // 1) Luta em andamento (ou "lutar"): tem prioridade sobre tudo
    const c = info ? null : await combate(j.id, msg);
    if (c) j = { ...j, ...c.jogador };
    if (c?.tratado) return [...c.saidas, ...(await mundo.aoEventos(j, c.eventos, para)), ...(await social.aoEventos(j, c.eventos, para))];
    const tc = t.replace(/^[!/]/, "");
    // 2) Itens, loja, descanso
    const it = await itens(j, tc, para);
    if (it.pergaminhoTerra) return extras.lerPergaminho(j, para);
    if (it.tratado) return it.mudouRegiao ? [...it.saidas, ...(await mundo.chegada(j, para))] : it.descansou ? [...it.saidas, ...(await social.sonho(j, para))] : it.saidas;
    // 3) Exploração e viagens (também confere chegadas pendentes); ao mudar de região, mostra o lugar
    const antes = j.regiao_atual;
    const ehLocal = /^(ir|vou|visitar|entrar)\b/.test(tc) ? await mundo.comando(j, tc, msg.texto, para) : { tratado: false };
    if (ehLocal.tratado) return ehLocal.saidas;
    // Comandos do mundo vivo têm verbo próprio: a exploração só confere chegadas (para "falar sobre o mapa" não abrir o mapa)
    const direto = /^(falar|conversar|perguntar|locais|lugares|olhar|missao|missoes|historia|capitulo|objetivo|diario|caminho|segredos|pistas|amigos|amizades|feitos|noticias|vingar|vinganca|pet|boatos|boato|rumores|contos|ouvir|lembrar|ecos|eco|aceitar pacto|recusar pacto|pacto|resistir|purificar|contratos|contrato|guilda|quadro|ranking|rank|placar|acompanhar|seguir com|ir com|juntar|seguir sozinho|seguir sozinha|separar|deixar grupo|minha historia|aceitar a terra|aceito a terra|fechar o pergaminho|fechar pergaminho)\b/.test(tc);
    const e = await exploracao(j.id, info || direto ? { ...msg, texto: "" } : /^(ir|vou)\b/.test(tc) ? { ...msg, texto: tc.replace(/^(ir|vou)\s+(para |pra |a |ao |à )?/, "viajar ") } : msg);
    j = { ...j, ...e.jogador };
    const chegou = j.regiao_atual !== antes ? await mundo.chegada(j, para) : [];
    if (e.tratado) return [...e.saidas, ...chegou];
    // 4) Mundo vivo: locais, NPCs, missão, segredos, amigos, feitos, vingar; pet, pactos, boatos, ecos
    const ex = await extras.comando(j, tc, para, msg.texto);
    if (ex.tratado) return [...e.saidas, ...chegou, ...ex.saidas];
    const so = await social.comando(j, tc, para);
    if (so.tratado) return [...e.saidas, ...chegou, ...so.saidas];
    const mv = await mundo.comando(j, tc, msg.texto, para);
    if (mv.tratado) return [...e.saidas, ...chegou, ...mv.saidas];
    if (ehComando(t, "onde estou", "regiao", "minha regiao", "local", "onde to", "onde eu estou"))
      return [...e.saidas, ...chegou, { para, texto: textoRegiao(j.regiao_atual) ?? "Não consegui achar sua região." }];
    if (ehComando(t, "aldeia", "minha aldeia", "casa", "minha casa", "origem")) return [...e.saidas, ...chegou, { para, texto: textoOrigem(j, aldeiaDe(j)) }];
    if (ehComando(t, "reino", "meu reino")) return [...e.saidas, ...chegou, { para, texto: textoReino(j.reino) ?? "Reino desconhecido." }];
    if (ehComando(t, "ficha", "carta", "minha ficha", "minha carta", "status")) return [...e.saidas, ...chegou, { para, imagem: cartaPersonagem(j, j.avatar_dna), legenda: legendaFicha(j, agora()) }];
    if (ehComando(t, "ajuda", "comandos", "menu", "oi", "ola")) return [...e.saidas, ...chegou, { para, texto: AJUDA }];
    if (ehComando(t, "dado", "dados", "d20", "como funciona o dado", "guia do dado")) return [...e.saidas, ...chegou, ...guiaDado(para)];
    if (chegou.length) return [...e.saidas, ...chegou];
    if (ehAcaoLivre(msg.texto)) return [...e.saidas, ...(await narrador(j, msg.texto, para, { ...(await mundo.contextoNarrador(j)), historia: await extras.historiaPara(j) }))];
    return [...e.saidas, { para, texto: `${ambiente(j.regiao_atual, agora() / 60_000 | 0)}\n\nO que você faz?\n${rodape("locais · missao · explorar · itens · ajuda", "ou escreva sua ação começando com >")}` }];
  }

  function perguntaDaEtapa(j) {
    const s = j.avatar_dna?.sorteio;
    if (j.etapa_criacao === "nome") return "Qual será o *nome* do seu personagem?";
    if (j.etapa_criacao === "classe") return `⭐ *Quarta estrela — Caminho*\n\nA última estrela espera sua escolha. Responda com o número:\n\n${s.classes.map((c, i) => `*${i + 1}* ${c} — _${DESCRICAO_CLASSE[c] ?? ""}_`).join("\n")}`;
    if (j.etapa_criacao?.startsWith("ap:")) {
      const ap = APARENCIA.find((a) => `ap:${a.campo}` === j.etapa_criacao);
      return `${ap.titulo}\n${lista(ap.opcoes)}\n${rodape("responda com o número", ap.semSurpresa ? null : "0 = surpresa")}`;
    }
    if (j.etapa_criacao === "confirmar") return "*1* confirmar · *2* refazer";
    return "";
  }

  async function criacao(msg, j, para, t) {
    const etapa = j.etapa_criacao;
    const est = j.avatar_dna ?? {};

    if (etapa === "nome") {
      const nome = msg.texto.trim().replace(/\s+/g, " ").split(" ").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
      const norm = semAcento(nome.toLowerCase());
      if (!/^[\p{L}][\p{L}' -]{1,19}$/u.test(nome)) return [{ para, texto: "Esse nome não serve. Use de 2 a 20 letras (pode ter espaço, hífen e apóstrofo)." }];
      if (NOME_PROIBIDO.test(norm)) return [{ para, texto: "As estrelas recusam esse nome. Escolha outro." }];
      if (NOMES_RESERVADOS.test(norm)) return [{ para, texto: "Esse nome já pertence à história deste mundo. Escolha outro." }];
      const reis = new Set((await db.query("select reino from jogo.jogadores where mundo_id = $1 and casta = 'rei'", [j.mundo_id])).map((r) => r.reino));
      const s = sortear(D, { reisPorReino: reis }, rng);
      try {
        await db.query(`update jogo.jogadores set nome = $2, nome_normalizado = $3, aldeia = $4, casta = $5, reino = $6, atributo_magico = $7,
          mana_unica = $8, elegivel_pet = $9, etapa_criacao = 'classe', avatar_dna = $10 where id = $1 and etapa_criacao = 'nome'`,
        [j.id, nome, norm, s.aldeia.nome, s.casta, s.reino, s.atributoMagico, s.manaUnica, s.elegivelPet, JSON.stringify({ sorteio: s, escolhas: {} })]);
      } catch (e) {
        if (e.code === "23505") return [{ para, texto: `Já existe um *${nome}* neste mundo. Escolha outro nome.` }];
        throw e;
      }
      return [
        { para, texto: `As Quatro Estrelas começam a girar sobre você, *${nome}*…` }, { espera: 2000 },
        { para, texto: `⭐ *Primeira estrela — Origem*\n\nVocê nasceu em *${s.aldeia.nome}* (${s.aldeia.jp}), ${s.reino === "Kokū" ? "na" : "no reino de"} ${s.reinoJp}.\n_${s.aldeia.descricao}_\n\nCasta: *${NOME_CASTA[s.casta]}*` }, { espera: 2500 },
        { para, texto: `⭐ *Segunda estrela — Mana*\n\n` + (s.mana === 0 ? "Nenhuma mana corre em você. Nenhuma. E é exatamente isso que o Vazio procura." :
          `Sua mana desperta: *${s.atributoMagico}*. ${s.mana < 60 ? "Ainda fraca, mas é sua." : s.mana < 130 ? "Firme e constante." : s.mana < 200 ? "Forte, difícil de conter." : "Imensa. As estrelas recuam um pouco."}${s.raridade && !s.raridade.startsWith("variante") ? `\nAs estrelas tremem. Isso é ${s.raridade === "lendario" ? "lendário" : s.raridade === "muito_raro" ? "muito raro" : "raro"}.` : ""}`) +
          "" }, { espera: 2500 },
        { para, texto: `⭐ *Terceira estrela — Espírito*\n\n${s.elegivelPet ? "Algo responde ao seu chamado, muito longe daqui. Um espírito animal sabe que você existe.\nEle não virá até você. Você terá que encontrá-lo." : "As estrelas ficam em silêncio. Nenhum espírito responde. Por enquanto."}` }, { espera: 2000 },
        { para, texto: perguntaDaEtapa({ etapa_criacao: "classe", avatar_dna: { sorteio: s } }) },
      ];
    }

    if (etapa === "classe") {
      const classe = escolherOpcao(t, est.sorteio.classes, rng);
      if (!classe) return [{ para, texto: "Não entendi. " + perguntaDaEtapa(j) }];
      const a = atributosIniciais(D, { classe, casta: j.casta, reino: j.reino, mana: est.sorteio.mana }, rng);
      await db.query(`update jogo.jogadores set classe = $2, tipo_animal = $3, atributos = $4, hp = $5, hp_max = $5, mp = $6, mp_max = $6,
        etapa_criacao = 'ap:genero' where id = $1`, [j.id, classe, a.tipoAnimal, JSON.stringify(a.atributos), a.hp, a.mp]);
      return [{ para, texto: `O caminho do *${classe}* se abre diante de você.${a.tipoAnimal ? ` No seu sangue corre a fera: ${a.tipoAnimal.replace("_", " ")}.` : ""}\n\nAgora, como o mundo vai te ver?` },
        { para, texto: perguntaDaEtapa({ etapa_criacao: "ap:genero" }) }];
    }

    if (etapa?.startsWith("ap:")) {
      const i = APARENCIA.findIndex((a) => `ap:${a.campo}` === etapa);
      const ap = APARENCIA[i];
      const v = escolherOpcao(t, ap.opcoes, rng);
      if (!v) return [{ para, texto: "Não entendi. " + perguntaDaEtapa(j) }];
      const escolhas = { ...est.escolhas, [ap.campo]: v };
      const prox = APARENCIA[i + 1] ? `ap:${APARENCIA[i + 1].campo}` : "confirmar";
      await db.query("update jogo.jogadores set etapa_criacao = $2, avatar_dna = $3 where id = $1", [j.id, prox, JSON.stringify({ ...est, escolhas })]);
      if (prox !== "confirmar") return [{ para, texto: perguntaDaEtapa({ etapa_criacao: prox }) }];
      return [{ para, imagem: previaAvatar(montarDna(j, est.sorteio, escolhas)), legenda: "Assim o mundo vai te ver.\n\n*1* confirmar · *2* refazer" }];
    }

    if (etapa === "confirmar") {
      if (/^(2|refazer|nao|mudar)$/.test(t)) {
        await db.query("update jogo.jogadores set etapa_criacao = 'ap:genero', avatar_dna = $2 where id = $1", [j.id, JSON.stringify({ ...est, escolhas: {} })]);
        return [{ para, texto: perguntaDaEtapa({ etapa_criacao: "ap:genero" }) }];
      }
      if (!/^(1|confirmar|confirmo|sim|ok)$/.test(t)) return [{ para, texto: perguntaDaEtapa(j) }];
      const dna = montarDna(j, est.sorteio, est.escolhas);
      const final = await um(db, `update jogo.jogadores set estado = 'ativo', etapa_criacao = null, avatar_dna = $2, regiao_atual = $3
        where id = $1 and estado = 'criando' returning *`, [j.id, JSON.stringify(dna), buscarRegioes(est.sorteio.aldeia.regiao)[0]?.id ?? est.sorteio.aldeia.regiao]);
      if (!final) return [];
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'pocao', 'consumivel', 3, '{"nome":"Poção de cura"}')
        on conflict (jogador_id, item_id) do nothing`, [j.id]);
      for (const id of kitInicial(final.classe)) await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, equipado, dados)
        values ($1, $2, 'equipamento', 1, true, '{}') on conflict (jogador_id, item_id) do nothing`, [j.id, id]);
      await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe)
        select $1, k, v::int, 'sorteio_inicial', '{}'::jsonb from jsonb_each_text($2::jsonb) as x(k, v)`, [j.id, JSON.stringify(final.atributos)]).catch(() => {});
      const mencao = [msg.autor.jid];
      const abertura = await narrarAbertura(final, est.sorteio);
      return [
        { para, texto: "As estrelas param. Sua carta foi revelada no grupo." },
        { para: j.grupo_wa_id, imagem: cartaPersonagem(final, dna), legenda: `⭐ ${arroba(msg.autor)} desperta como *${final.nome}*.\n\n${legendaFicha(final)}`, mencoes: mencao },
        { espera: 1500 },
        { para, texto: abertura },
        { espera: 1500 },
        { para, texto: textoOrigem(final, est.sorteio.aldeia) },
        { espera: 1500 },
        { para, texto: textoReino(final.reino) },
        { espera: 1000 },
        ...(await mundo.chegada(final, para, { nascimento: true })),
        { espera: 1000 },
        { para, texto: textoPrimeirosPassos() },
      ].filter((x) => x.espera || x.texto || x.imagem);
    }
    return [{ para, texto: "Algo se perdeu entre as estrelas. Digite *entrar no mundo* no grupo para continuar." }];
  }

  function aldeiaDe(j) {
    return j.avatar_dna?.sorteio?.aldeia ?? D.aldeias.aldeias.find((a) => a.nome === j.aldeia)
      ?? { nome: j.aldeia ?? "?", jp: "", descricao: "" };
  }

  function montarDna(j, s, escolhas) {
    return dnaJogador({ id: `J${j.id}`, reino: j.reino === "Kokū" ? "Kokū" : j.reino, casta: j.casta, classe: j.classe,
      elemento: s.variante ?? s.elemento, tipoAnimal: j.tipo_animal }, escolhas);
  }

  async function narrarAbertura(j, s) {
    const gancho = D.ganchos[s.aldeia.id] ?? "Um forasteiro chega à aldeia procurando por você — e sabe o seu nome.";
    const reserva = `*Prólogo — ${s.aldeia.nome}*\n\n${s.aldeia.descricao} É aqui que *${j.nome}* cresceu.\n\n` +
      `Mas hoje algo mudou. ${gancho}.\n\nO que você faz?\n${rodape("> sua ação", "explorar", "mapa")}`;
    if (!ia) return reserva;
    const sistema = "Você é o NARRADOR de Yotsuhoshi, um RPG de anime no WhatsApp, em português do Brasil. Tom épico e sensorial, " +
      "em 2ª pessoa (você), frases curtas e fáceis de entender, SEM emojis e sem listas. Até 700 caracteres, formatação do WhatsApp " +
      "(*negrito* só em nomes, _itálico_ para falas). Nunca conceda poderes, itens ou números. " +
      "Não revele segredos do mundo. Termine com o gancho como cliffhanger e uma pergunta: o que você faz?";
    const pedido = { personagem: j.nome, classe: j.classe, casta: j.casta, reino: j.reino, aldeia: s.aldeia.nome, descricao_aldeia: s.aldeia.descricao,
      atributo_magico: s.atributoMagico, gancho, cena: "Abrir com os sentidos: cheiro, clima, som da aldeia. Mostrar a casta na vida cotidiana." };
    const esquema = { type: "object", additionalProperties: false, required: ["narracao"], properties: { narracao: { type: "string" } } };
    try {
      const r = await Promise.race([
        ia.gerarJSON({ sistema, mensagens: [{ role: "user", content: `Narre a cena de abertura (marco A1-M1 "Despertar"):\n${JSON.stringify(pedido)}` }], esquema, maxTokens: 700 }),
        new Promise((ok) => setTimeout(() => ok({ ok: false, motivo: "tempo" }), 15000)),
      ]);
      return r.ok && r.dados.narracao?.trim() ? `*Prólogo — ${s.aldeia.nome}*\n\n${r.dados.narracao.trim().slice(0, 1200)}\n${rodape("> sua ação", "explorar", "mapa")}` : reserva;
    } catch { return reserva; }
  }

  return {
    /** @returns {Promise<Array>} saídas */
    async processar(msg) {
      if (!msg) return [];
      if (msg.quando && agora() - msg.quando > 10 * 60_000) return []; // histórico antigo (reconexão)
      const nova = await db.query("insert into jogo.mensagens_processadas (wa_message_id) values ($1) on conflict do nothing returning 1", [`${msg.chat}:${msg.id}`]);
      if (!nova.length) return [];
      await agendarResumo();
      return msg.grupo ? noGrupo(msg) : noPrivado(msg);
    },
    aoTick,
  };
}

export function legendaFicha(j, tempo = Date.now()) {
  const a = j.atributos ?? {};
  return `*${j.nome}* — ${j.classe ?? "?"}, nível ${j.nivel} · rank ${j.rank}\n` +
    `${NOME_CASTA[j.casta] ?? ""} de ${j.aldeia ?? "?"} · ${j.atributo_magico ?? "?"}${j.elegivel_pet ? " · elegível a pet" : ""}\n\n` +
    `Vida ${j.hp}/${j.hp_max} · Mana ${j.mp}/${j.mp_max} · Vigor ${recuperarVigor(j, tempo).vigor}\n` +
    `FOR ${a.FOR} · DEF ${a.DEF} · MAG ${a.MAG} · RES ${a.RES} · VEL ${a.VEL} · SOR ${a.SOR}\n` +
    rodape(`XP ${j.xp}/${XP_PROXIMO(j.nivel)}`, j.ryo != null ? `${j.ryo} ryō` : null, j.pontos_livres ? `${j.pontos_livres} pontos livres` : null,
      Number(j.corrupcao) ? `corrupção ${j.corrupcao}/100` : null, j.titulo ? j.titulo : null);
}

let GUIA_DADO = null;
/** Infográfico do dado (gerado por scripts/render-guia-dado.mjs). */
export function guiaDado(para) {
  try { GUIA_DADO ??= readFileSync(new URL("../../data/guia/dado.png", import.meta.url)); } catch { GUIA_DADO = null; }
  const legenda = "*Como funciona o dado*\n\nToda ação de luta rola um dado de 20 lados:\n" +
    "*1* falha · *2 a 6* de raspão (70% do dano) · *7 a 14* acerto firme · *15 a 19* acerto forte (130%) · *20* golpe perfeito (180%)\n\n" +
    "*O que ajuda:* Sorte (+1 no dado a cada 12 pontos, até +3) e algumas habilidades.\n" +
    `*O que atrapalha:* a pressão do inimigo. ${Object.values(PRESSAO).map((p) => `Contra ${p.nome}, ${textoPressao(p)}`).join(". ")}.\n\n` +
    "O 20 é sempre perfeito e o inimigo rola o dado dele à sua vista. Defender no golpe forte salva vidas.\n" +
    "_habilidades mostra a passiva da sua classe · ? numa luta mostra o menu completo_";
  return GUIA_DADO ? [{ para, imagem: GUIA_DADO, legenda }] : [{ para, texto: legenda }];
}

const AJUDA = `*Como jogar*

*No grupo*
entrar no mundo — criar seu personagem
ficha — sua carta · feitos — o que aconteceu no mundo
duelo @pessoa — duelo amistoso · apoiar @pessoa — mandar forças
dar <item> @pessoa — dar uma poção, um material ou ryō · ranking
historia @pessoa — ler a história de alguém

*Pelo mundo* (no privado)
locais — o que existe onde você está
ir <lugar> — visitar um lugar
falar <nome> — conversar com alguém
missao — sua história e o próximo passo
acompanhar <nome> — viver a história junto com outro jogador
explorar — procurar encrenca e achados
contratos — trabalhos do dia da Guilda (vilas e cidades)
monstro · golpear — quando há uma ameaça solta, lute junto com o grupo
viajar <região> · rota · mapa
> sua ação — fazer o que quiser, com suas palavras

*Suas coisas*
itens — bolsa, o que cada coisa faz e quantos usos tem
equipar <nº> · usar <nº> · loja (loja poções, loja armas) · descansar
habilidades · ficha · segredos · amigos · pet
minha história — conte quem é o seu personagem
boatos — histórias que o povo conta · lembrar — ecos do passado

*Numa luta*
responda com o número da ação. O dado decide a força.
dado — como o dado funciona (imagem e explicação)

` + rodape("atributos só sobem por mérito", "ninguém, nem a IA, dá poder de graça");
