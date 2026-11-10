// Motor do jogo no WhatsApp: recebe uma mensagem já lida (evolution.lerMensagem) e devolve as SAÍDAS
// ({ para, texto, mencoes } | { para, imagem, legenda, mencoes } | { espera }). Quem envia é o webhook.
// Criação, carta, abertura e exploração individual persistente.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { CATALOGO } from "../avatar/index.mjs";
import { PELE, CABELO, OLHOS } from "../avatar/paletas.mjs";
import { dnaJogador } from "../avatar/dna.mjs";
import { sortear, atributosIniciais, ROTULO_CASTA, EMOJI_ELEMENTO, rngSeguro } from "./sorteio.mjs";
import { cartaPersonagem, previaAvatar } from "./carta.mjs";
import { um } from "./db.mjs";
import { criarExploracao } from "./exploracao.mjs";
import { criarNarrador, ehAcaoLivre } from "./narrador.mjs";
import { criarCombate } from "./combate.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { comandoExploracao, recuperarVigor, buscarRegioes } from "../regras/exploracao.mjs";
import { textoOrigem, textoRegiao, textoReino, textoPrimeirosPassos } from "./textos.mjs";

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
const rotulo = (s) => s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const APARENCIA = [
  { campo: "cabelo", titulo: "✂️ *Cabelo*", opcoes: CATALOGO.cabelo },
  { campo: "corCabelo", titulo: "🎨 *Cor do cabelo*", opcoes: Object.keys(CABELO) },
  { campo: "pele", titulo: "🧑 *Pele*", opcoes: Object.keys(PELE).filter((p) => !["osso", "espectral", "pedra"].includes(p)) },
  { campo: "corOlhos", titulo: "👁️ *Cor dos olhos*", opcoes: Object.keys(OLHOS) },
];
const NOMES_RESERVADOS = /\b(kanata|kaien|nisteroy|yoru|seio|eclipse|admin|bot|narrador)\b/;
const NOME_PROIBIDO = /\b(porra|caralho|buceta|puta|viado|merda|cu|pau|rola|foda|fdp|nazi|hitler)\b/;

const ehComando = (t, ...palavras) => palavras.some((p) => t === p || t === `!${p}` || t === `/${p}`);
const lista = (opcoes, fmt = rotulo) => opcoes.map((o, i) => `*${i + 1}.* ${fmt(o)}`).join("   ");

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

export function criarJogo({ db, sal = process.env.TELEFONE_SAL ?? "", admins = (process.env.ADMINS ?? "").split(/[,\s]+/).filter(Boolean),
  ehAdminGrupo = async () => false, ia = null, rng = rngSeguro, agora = () => Date.now() }) {
  const D = dados();
  const exploracao = criarExploracao({ db, rng, agora });
  const narrador = criarNarrador({ db, ia, agora });
  const combate = criarCombate({ db, rng, agora });

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
      if (!(await ehAdmin(msg))) return [{ para: msg.chat, texto: "🔒 Só um administrador do RPG pode ativar o mundo neste grupo." }];
      const nome = msg.texto.trim().replace(/^[/!.]?\s*ativar[- ]?mundo\s*/i, "").slice(0, 60) || "Yotsuhoshi";
      await db.query(`insert into jogo.mundos (grupo_wa_id, nome) values ($1, $2)
        on conflict (grupo_wa_id) do update set status = 'ativo', nome = excluded.nome`, [msg.chat, nome]);
      return [{ para: msg.chat, texto:
        `🌌 *四星 YOTSUHOSHI — ${nome}*\n\nHá 500 anos, um garoto roubou o ovo de um dragão. O mundo queimou, um buraco negro se abriu ` +
        `e quatro reis deram a vida para selar o mal.\n\nAgora alguém quer abrir o caixão — e o ovo, perdido, escolheu um de vocês.\n\n` +
        `👉 Para nascer neste mundo, digite *entrar no mundo*.\n_(A criação continua no privado do bot.)_` }];
    }
    const mundo = await um(db, "select * from jogo.mundos where grupo_wa_id = $1", [msg.chat]);
    if (!mundo || mundo.status !== "ativo") return [];

    if (/^[/!.]?\s*resetar[- ]?jogador\b/.test(t)) {
      if (!(await ehAdmin(msg))) return [];
      const alvo = msg.mencoes[0];
      if (!alvo) return [{ para: msg.chat, texto: "Use: /resetar-jogador @pessoa" }];
      const n = await db.query(`delete from jogo.jogadores j using jogo.identidades i where j.identidade_id = i.id and j.mundo_id = $1
        and (i.wa_jid = $2 or i.wa_lid = $2) returning j.nome`, [mundo.id, alvo]);
      return [{ para: msg.chat, texto: n.length ? `🗑️ Personagem *${n[0].nome}* apagado (registrado no log).` : "Essa pessoa não tem personagem neste mundo." }];
    }

    if (/^(!|\/)?(entrar( no mundo)?|quero entrar( no mundo)?|entrar no jogo)$/.test(t)) return entrar(msg, mundo);
    if (ehComando(t, "ficha", "carta", "minha ficha", "minha carta")) return ficha(msg, mundo, msg.chat);
    if (ehComando(t, "ajuda", "comandos")) return [{ para: msg.chat, texto: AJUDA }];
    if (/^[!/]?(explorar|viajar|mapa|rota|vigor|viagem|descobertas|inventario|onde estou|aldeia|reino)\b/.test(t)) return [{ para: msg.chat, texto: "🧭 Exploração e viagens acontecem *no privado do bot*. Envie seu comando por lá." }];
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
      { para: msg.chat, texto: `🌠 ${eu}, as Quatro Estrelas ouviram seu chamado. Continue *no meu privado*.`, mencoes: [msg.autor.jid] },
      { para: privadoDe(idt), texto: `🌌 *Bem-vindo a Yotsuhoshi* (mundo _${mundo.nome}_).\n\nAntes que as estrelas girem, diga: ` +
        `qual será o *nome* do seu personagem?\n_(2 a 20 letras. Ele não poderá ser trocado.)_` },
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
    if (!idt.privado_ok) await db.query("update jogo.identidades set privado_ok = true where id = $1", [idt.id]);
    const para = msg.chat;
    const t = semAcento(msg.texto.trim().toLowerCase()).replace(/\s+/g, " ");
    let j = await um(db, `select j.*, m.grupo_wa_id, m.nome as mundo_nome from jogo.jogadores j join jogo.mundos m on m.id = j.mundo_id
      where j.identidade_id = $1 and m.status = 'ativo' order by (j.estado = 'criando') desc, j.atualizado_em desc limit 1`, [idt.id]);
    if (!j) return [{ para, texto: "🌌 Oi! Eu sou o narrador de *Yotsuhoshi*, um RPG de anime no WhatsApp.\n\nPara jogar, entre num grupo onde o mundo está ativo e digite *entrar no mundo*." }];
    if (j.estado === "criando") return criacao(msg, j, para, t);
    // Comandos de informação têm prioridade; a exploração só confere chegadas pendentes (texto vazio).
    const info = ehComando(t, "onde estou", "regiao", "minha regiao", "local", "onde to", "onde eu estou", "aldeia", "minha aldeia",
      "casa", "minha casa", "origem", "reino", "meu reino");
    const c = info ? null : await combate(j.id, msg);
    if (c?.tratado) return c.saidas;
    if (c) j = { ...j, ...c.jogador };
    const e = await exploracao(j.id, info ? { ...msg, texto: "" } : msg);
    j = { ...j, ...e.jogador };
    if (e.tratado) return e.saidas;
    if (ehComando(t, "onde estou", "regiao", "minha regiao", "local", "onde to", "onde eu estou"))
      return [...e.saidas, { para, texto: textoRegiao(j.regiao_atual) ?? "Não consegui achar sua região." }];
    if (ehComando(t, "aldeia", "minha aldeia", "casa", "minha casa", "origem")) return [...e.saidas, { para, texto: textoOrigem(j, aldeiaDe(j)) }];
    if (ehComando(t, "reino", "meu reino")) return [...e.saidas, { para, texto: textoReino(j.reino) ?? "Reino desconhecido." }];
    if (ehComando(t, "ficha", "carta", "minha ficha", "minha carta", "status")) return [...e.saidas, { para, imagem: cartaPersonagem(j, j.avatar_dna), legenda: legendaFicha(j, agora()) }];
    if (ehComando(t, "ajuda", "comandos", "menu", "oi", "ola")) return [...e.saidas, { para, texto: AJUDA }];
    if (ehAcaoLivre(msg.texto)) return [...e.saidas, ...(await narrador(j, msg.texto, para))];
    return [...e.saidas, { para, texto: `📜 *${j.nome}*, não entendi. Use *explorar*, *mapa*, *onde estou*, *ajuda*\nou escreva o que seu personagem faz começando com *>*. Ex.: _> converso com o ferreiro_` }];
  }

  function perguntaDaEtapa(j) {
    const s = j.avatar_dna?.sorteio;
    if (j.etapa_criacao === "nome") return "Qual será o *nome* do seu personagem?";
    if (j.etapa_criacao === "classe") return `⭐ *4ª Estrela — CAMINHO*\nEscolha sua classe respondendo com o número:\n${s.classes.map((c, i) => `*${i + 1}.* ${c} — _${DESCRICAO_CLASSE[c] ?? ""}_`).join("\n")}`;
    if (j.etapa_criacao?.startsWith("ap:")) {
      const ap = APARENCIA.find((a) => `ap:${a.campo}` === j.etapa_criacao);
      return `${ap.titulo} — responda com o número (ou *0* para surpresa):\n${lista(ap.opcoes)}`;
    }
    if (j.etapa_criacao === "confirmar") return "Responda *1* para confirmar sua aparência ou *2* para refazer.";
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
      const el = EMOJI_ELEMENTO[s.elemento] ?? "✴️";
      return [
        { para, texto: `🌌 As Quatro Estrelas giram sobre você, *${nome.toUpperCase()}*...` }, { espera: 2000 },
        { para, texto: `⭐ *1ª Estrela — ORIGEM*\nVocê nasceu na aldeia de *${s.aldeia.nome}* (${s.aldeia.jp}), ${s.reino === "Kokū" ? "na" : "no reino de"} ${s.reinoJp}.\n_${s.aldeia.descricao}_\nCasta: ${ROTULO_CASTA[s.casta]}` }, { espera: 2500 },
        { para, texto: `⭐ *2ª Estrela — MANA*\nAtributo mágico: ${el} *${s.atributoMagico}*${s.raridade && !s.raridade.startsWith("variante") ? ` — _${s.raridade.replace("_", " ")}!_` : ""}\n` +
          (s.mana === 0 ? "Reservatório: *0 MP*. Nenhuma mana corre em você... e é exatamente isso que o Vazio procura." : `Reservatório: *${s.mana} MP*`) }, { espera: 2500 },
        { para, texto: `⭐ *3ª Estrela — ESPÍRITO*\n${s.elegivelPet ? "✨ Você é *ELEGÍVEL* a um Pet Espiritual.\n_(Ele não vem até você. Você terá que encontrá-lo.)_" : "As estrelas ficam em silêncio. Nenhum espírito responde ao seu chamado."}` }, { espera: 2000 },
        { para, texto: perguntaDaEtapa({ etapa_criacao: "classe", avatar_dna: { sorteio: s } }) },
      ];
    }

    if (etapa === "classe") {
      const classe = escolherOpcao(t, est.sorteio.classes, rng);
      if (!classe) return [{ para, texto: "Não entendi. " + perguntaDaEtapa(j) }];
      const a = atributosIniciais(D, { classe, casta: j.casta, reino: j.reino, mana: est.sorteio.mana }, rng);
      await db.query(`update jogo.jogadores set classe = $2, tipo_animal = $3, atributos = $4, hp = $5, hp_max = $5, mp = $6, mp_max = $6,
        etapa_criacao = 'ap:cabelo' where id = $1`, [j.id, classe, a.tipoAnimal, JSON.stringify(a.atributos), a.hp, a.mp]);
      return [{ para, texto: `⚔️ *${classe}*${a.tipoAnimal ? ` (sangue de ${a.tipoAnimal.replace("_", " ")})` : ""}. O caminho está traçado.\n\nAgora, como o mundo vai te ver?` },
        { para, texto: perguntaDaEtapa({ etapa_criacao: "ap:cabelo" }) }];
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
      return [{ para, imagem: previaAvatar(montarDna(j, est.sorteio, escolhas)), legenda: "🪞 Assim o mundo vai te ver.\n\n*1.* ✅ Confirmar   *2.* 🔁 Refazer aparência" }];
    }

    if (etapa === "confirmar") {
      if (/^(2|refazer|nao|mudar)$/.test(t)) {
        await db.query("update jogo.jogadores set etapa_criacao = 'ap:cabelo', avatar_dna = $2 where id = $1", [j.id, JSON.stringify({ ...est, escolhas: {} })]);
        return [{ para, texto: perguntaDaEtapa({ etapa_criacao: "ap:cabelo" }) }];
      }
      if (!/^(1|confirmar|confirmo|sim|ok)$/.test(t)) return [{ para, texto: perguntaDaEtapa(j) }];
      const dna = montarDna(j, est.sorteio, est.escolhas);
      const final = await um(db, `update jogo.jogadores set estado = 'ativo', etapa_criacao = null, avatar_dna = $2, regiao_atual = $3
        where id = $1 and estado = 'criando' returning *`, [j.id, JSON.stringify(dna), buscarRegioes(est.sorteio.aldeia.regiao)[0]?.id ?? est.sorteio.aldeia.regiao]);
      if (!final) return [];
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'pocao', 'consumivel', 3, '{"nome":"Poção de cura"}')
        on conflict (jogador_id, item_id) do nothing`, [j.id]);
      await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe)
        select $1, k, v::int, 'sorteio_inicial', '{}'::jsonb from jsonb_each_text($2::jsonb) as x(k, v)`, [j.id, JSON.stringify(final.atributos)]).catch(() => {});
      const mencao = [msg.autor.jid];
      const abertura = await narrarAbertura(final, est.sorteio);
      return [
        { para, texto: "✨ Sua carta foi revelada no grupo." },
        { para: j.grupo_wa_id, imagem: cartaPersonagem(final, dna), legenda: `🌟 ${arroba(msg.autor)} despertou como *${final.nome}*!\n\n${legendaFicha(final)}`, mencoes: mencao },
        { espera: 1500 },
        { para, texto: abertura },
        { espera: 1500 },
        { para, texto: `${textoOrigem(final, est.sorteio.aldeia)}\n\n${textoRegiao(final.regiao_atual, { titulo: "🗺️ *Sua região*" }) ?? ""}` },
        { espera: 1500 },
        { para, texto: textoReino(final.reino) },
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
    const reserva = `📜 *Prólogo — ${s.aldeia.nome}*\n\n${s.aldeia.descricao} É aqui que *${j.nome}* cresceu, ${ROTULO_CASTA[j.casta].split(" ").slice(1).join(" ").toLowerCase()} entre os seus.\n\n` +
      `Mas hoje algo mudou: _${gancho}_\n\nDigite *explorar* para olhar ao redor, *mapa* para se localizar ou *ajuda* para ver os comandos.`;
    if (!ia) return reserva;
    const sistema = "Você é o NARRADOR de Yotsuhoshi, um RPG de anime no WhatsApp, em português do Brasil. Tom épico e sensorial, " +
      "mensagem curta (até 700 caracteres) com formatação do WhatsApp (*negrito*, _itálico_). Nunca conceda poderes, itens ou números. " +
      "Não revele segredos do mundo. Termine com o gancho como cliffhanger e uma pergunta: o que você faz?";
    const pedido = { personagem: j.nome, classe: j.classe, casta: j.casta, reino: j.reino, aldeia: s.aldeia.nome, descricao_aldeia: s.aldeia.descricao,
      atributo_magico: s.atributoMagico, gancho, cena: "Abrir com os sentidos: cheiro, clima, som da aldeia. Mostrar a casta na vida cotidiana." };
    const esquema = { type: "object", additionalProperties: false, required: ["narracao"], properties: { narracao: { type: "string" } } };
    try {
      const r = await Promise.race([
        ia.gerarJSON({ sistema, mensagens: [{ role: "user", content: `Narre a cena de abertura (marco A1-M1 "Despertar"):\n${JSON.stringify(pedido)}` }], esquema, maxTokens: 700 }),
        new Promise((ok) => setTimeout(() => ok({ ok: false, motivo: "tempo" }), 15000)),
      ]);
      return r.ok && r.dados.narracao?.trim() ? `📜 *Prólogo — ${s.aldeia.nome}*\n\n${r.dados.narracao.trim().slice(0, 1200)}\n\nUse *explorar*, *mapa* ou *ajuda*.` : reserva;
    } catch { return reserva; }
  }

  return {
    /** @returns {Promise<Array>} saídas */
    async processar(msg) {
      if (!msg) return [];
      if (msg.quando && agora() - msg.quando > 10 * 60_000) return []; // histórico antigo (reconexão)
      const nova = await db.query("insert into jogo.mensagens_processadas (wa_message_id) values ($1) on conflict do nothing returning 1", [`${msg.chat}:${msg.id}`]);
      if (!nova.length) return [];
      return msg.grupo ? noGrupo(msg) : noPrivado(msg);
    },
  };
}

export function legendaFicha(j, tempo = Date.now()) {
  const a = j.atributos ?? {};
  return `🎴 *${j.nome}* — ${j.classe ?? "?"}\n${ROTULO_CASTA[j.casta] ?? ""} · ${j.aldeia ?? "?"} (${j.reino ?? "?"})\n` +
    `✴️ ${j.atributo_magico ?? "?"}${j.elegivel_pet ? " · 🐾 elegível a pet" : ""}\n` +
    `Nv ${j.nivel} · Rank ${j.rank} · ✨ XP ${j.xp}/${XP_PROXIMO(j.nivel)}\n❤️ ${j.hp}/${j.hp_max} · 🔷 ${j.mp}/${j.mp_max}${j.ryo != null ? ` · 💰 ${j.ryo} ryō` : ""}\n` +
    `⚡ Vigor ${recuperarVigor(j, tempo).vigor}/100\n` +
    `FOR ${a.FOR} · DEF ${a.DEF} · MAG ${a.MAG} · RES ${a.RES} · VEL ${a.VEL} · SOR ${a.SOR}`;
}

const AJUDA = `📖 *Comandos de Yotsuhoshi*\n\n*No grupo*\n• *entrar no mundo* — criar seu personagem\n• *ficha* — mostrar sua carta\n\n*No privado*\n• *onde estou* — sobre a sua região\n• *aldeia* / *reino* — sua origem\n• *explorar* — olhar ao redor (10 vigor)\n• *mapa [reino]* — sua posição e vizinhos\n• *rota <região>* — caminho, tempo e custo\n• *viajar <região>* — vizinho (15 vigor, 10 min)\n• *viagem* — consultar chegada\n• *vigor* — energia (+10/h)\n• *descobertas* — locais encontrados\n• *inventario* — achados e ryō\n• *lutar* / *recuar* — enfrentar ou fugir de um inimigo\n• *distribuir* — usar pontos livres\n\n*Na batalha*\n• *a* atacar · *m1* magia · *h1* habilidade da classe\n• *d* defender · *i pocao* poção · *f* fugir · *?* painel\n\n*Mais*\n• *> sua ação* — fazer qualquer coisa com suas palavras (o narrador responde)\n• *ficha* — sua carta\n• *ajuda* — esta lista\n\nMasmorras chegam na próxima etapa.\n\n` +
  `_Atributos só mudam por mérito: batalhas, missões e escolhas. Ninguém (nem a IA) pode te dar poder de graça._`;
