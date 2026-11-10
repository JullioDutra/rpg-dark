// Ação livre ("> o que eu faço"): a IA narra a cena seguindo o marco da história; o MOTOR decide o que vale.
// Travas: pedidos de poder/atributo e tentativas de manipular o bot nunca chegam à IA; alegações de poder são
// marcadas como ignoradas; só eventos permitidos e vilões do marco/região viram jogo.
import { readFileSync } from "node:fs";
import { narrar } from "../ia/narrador.mjs";
import { criarInterpretador } from "../linguagem/interpretar.mjs";
import { REGIAO, REGIOES, normal } from "../regras/exploracao.mjs";
import { um } from "./db.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const HISTORIA = ler("historia.json");
const TEXTOS = ler("textos-mundo.json");
const GANCHOS = ler("ganchos-aldeia.json");
const ALDEIAS = ler("aldeias.json").aldeias;
const VILOES = new Map(ler("viloes.json").map((v) => [v.id, v]));
const MARCOS = new Map(HISTORIA.atos.flatMap((a) => a.marcos.map((m) => [m.id, { ...m, ato: a.id }])));
const FATOS = new Map((HISTORIA.fatos ?? []).map((f) => [f.id, f]));
const interpretar = criarInterpretador({ regioes: REGIOES });

export const LIMITES = { intervaloMs: 6000, porDia: 80, historico: 6 };

const RECUSAS = {
  pedido_atributo: "🌌 As estrelas não dão poder a quem pede. Atributos só sobem por *mérito*: lutas, treinos, missões e escolhas.",
  pedido_buff: "🌌 Nenhuma palavra muda o que sua técnica faz. Ela fica mais forte com treino e uso (maestria), não com pedidos.",
  tentativa_manipulacao: "🌌 O narrador não muda as regras do mundo. Diga o que *seu personagem* faz, começando com *>*.",
};

/** Bíblia curta (sem segredos): tom, proibições, onde o jogador está e de onde veio. */
function biblia(j) {
  const r = REGIAO.get(j.regiao_atual);
  const reino = TEXTOS.reinos[r?.reino ?? j.reino];
  const aldeia = ALDEIAS.find((a) => a.nome === j.aldeia);
  return [
    `Mundo: Yotsuhoshi, continente de 4 reinos (Fogo, Água, Terra, Vento) ao redor da Terra Central (o Vazio). Tom: ${HISTORIA.tom}`,
    `Proibições do roteiro: ${HISTORIA.proibicoes.join(" | ")}`,
    r && `Região atual: ${r.nome} (${reino?.titulo}). ${TEXTOS.regioes[r.id]?.texto ?? ""} Perigo: ${r.perigo}.`,
    reino && `Reino: ${reino.texto} Governante: ${reino.rei}.`,
    aldeia && `Aldeia natal do jogador: ${aldeia.nome} — ${aldeia.descricao}. Gancho de abertura: ${GANCHOS[aldeia.id] ?? "—"}`,
    "Regras de estilo: frases curtas e claras, fáceis de entender; no máximo 700 caracteres; termine dando ao jogador uma escolha ou pergunta.",
  ].filter(Boolean).join("\n");
}

export function criarNarrador({ db, ia, agora = () => Date.now() }) {
  async function marcoAtual(j) {
    let m = await um(db, `select * from jogo.marcos where mundo_id = $1 and jogador_id = $2 and status = 'ativo' order by id desc limit 1`, [j.mundo_id, j.id]);
    if (!m) {
      const feitos = await db.query("select marco_id from jogo.marcos where mundo_id = $1 and jogador_id = $2", [j.mundo_id, j.id]);
      if (!feitos.length) m = await um(db, `insert into jogo.marcos (mundo_id, marco_id, jogador_id) values ($1, 'A1-M1', $2)
        on conflict do nothing returning *`, [j.mundo_id, j.id]);
    }
    return m;
  }

  return async function acaoLivre(j, texto, para) {
    const acao = texto.replace(/^>\s*/, "").trim();
    if (acao.length < 3) return [{ para, texto: "Escreva o que seu personagem faz depois do *>*. Ex.: _> pergunto ao ferreiro sobre a mina_" }];
    const i = interpretar(`> ${acao}`, { estado: "livre", direcionado: true });
    const seguranca = interpretar(acao, { estado: "livre", direcionado: true });
    if (RECUSAS[seguranca.intencao]) return [{ para, texto: RECUSAS[seguranca.intencao] }];
    if (!ia) return [{ para, texto: "📜 O narrador está descansando agora. Tente de novo em alguns minutos, ou use *explorar*." }];

    const tempo = agora();
    const ultimas = await db.query(`select criado_em from jogo.cenas where jogador_id = $1 and papel = 'jogador'
      and criado_em > $2 order by criado_em desc`, [j.id, new Date(tempo - 86_400_000)]);
    if (ultimas[0] && tempo - +new Date(ultimas[0].criado_em) < LIMITES.intervaloMs) return [{ para, texto: "⏳ Calma: espere alguns segundos entre uma ação e outra." }];
    if (ultimas.length >= LIMITES.porDia) return [{ para, texto: "🌙 Você já viveu muitas cenas hoje. O narrador volta amanhã; enquanto isso, use *explorar* e *viajar*." }];

    const pendente = await um(db, "select 1 from jogo.exploracoes where jogador_id = $1 and pendente", [j.id]);
    const viagem = await um(db, "select destino from jogo.viagens where jogador_id = $1 and concluida_em is null", [j.id]);
    const marco = await marcoAtual(j);
    const m = MARCOS.get(marco?.marco_id) ?? null;
    const regiao = REGIAO.get(j.regiao_atual);
    const permitidos = {
      viloes: (m?.viloes_permitidos ?? []).filter((id) => normal(VILOES.get(id)?.regiao ?? "") === normal(regiao?.nome ?? "")),
      fatos: (m?.fatos_disponiveis ?? []).map((id) => FATOS.get(id)).filter(Boolean).map((f) => ({ id: f.id, descricao: f.descricao })),
    };
    const historico = (await db.query(`select papel, texto from jogo.cenas where jogador_id = $1 order by criado_em desc limit $2`, [j.id, LIMITES.historico]))
      .reverse().map((c) => ({ role: c.papel === "jogador" ? "user" : "assistant", content: c.texto }));
    const ficha = { nome: j.nome, classe: j.classe, casta: j.casta, nivel: j.nivel, rank: j.rank, hp: `${j.hp}/${j.hp_max}`, mp: `${j.mp}/${j.mp_max}`,
      atributo_magico: j.atributo_magico, regiao: regiao?.nome, em_viagem_para: viagem ? REGIAO.get(viagem.destino)?.nome : null,
      encontro_pendente: Boolean(pendente) };

    const r = await Promise.race([
      narrar(ia, { bibliaDoMundo: biblia(j), marco: m && { id: m.id, titulo: m.titulo, objetivo: m.objetivo, cena: m.cena }, ficha, permitidos,
        chaves: [], historico, acao, alegacoes: i.entidades?.alegacoes_de_poder ?? [] }),
      new Promise((ok) => setTimeout(() => ok({ narracao: "_As estrelas silenciam por um instante… tente de novo em alguns segundos._", eventos: [], falha: "tempo" }), 20000)),
    ]);
    const saidas = [{ para, texto: r.narracao }];
    if (r.falha) return saidas;

    await db.query(`insert into jogo.cenas (jogador_id, papel, texto, dados, criado_em) values ($1, 'jogador', $2, $3, $4), ($1, 'narrador', $5, $6, $4)`,
      [j.id, acao.slice(0, 600), JSON.stringify({ alegacoes: i.entidades?.alegacoes_de_poder ?? [] }), new Date(tempo), r.narracao,
        JSON.stringify({ eventos: r.eventos, provedor: r.provedor, marco: m?.id ?? null })]);

    // O motor aplica só o que entende e permite.
    for (const ev of r.eventos) {
      if (ev.tipo === "iniciar_batalha" && !pendente && !viagem) {
        const v = VILOES.get((ev.dados.viloes ?? [])[0]);
        if (!v || !permitidos.viloes.includes(v.id)) continue;
        const nivel = Math.max(j.nivel, v.nivel);
        const dados = { origem: "narrador", inimigo: { id: v.id, nome: v.nome, nivel }, perigoso: nivel >= j.nivel + 5 };
        await db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em)
          values ($1, $2, $3, 'encontro', $4, true, $5) on conflict do nothing`, [j.id, `cena:${j.id}:${tempo}`, j.regiao_atual, JSON.stringify(dados), new Date(tempo)]);
        saidas.push({ para, texto: `${dados.perigoso ? "⚠️ Esse inimigo é muito mais forte que você.\n" : ""}⚔️ *${v.nome}* (Nv ${nivel}) bloqueia seu caminho!\nResponda *lutar* para enfrentar ou *recuar* para fugir.` });
      }
    }
    // A1-M1 ("Despertar") termina quando o jogador interage com o gancho da aldeia.
    if (m?.id === "A1-M1" && marco.status === "ativo") {
      await db.query("update jogo.marcos set status = 'concluido', concluido_em = $2 where id = $1", [marco.id, new Date(tempo)]);
      await db.query(`insert into jogo.marcos (mundo_id, marco_id, jogador_id) values ($1, 'A1-M2', $2) on conflict do nothing`, [j.mundo_id, j.id]);
    }
    return saidas;
  };
}

/** Mensagem do jogador deve ir para o narrador? ">" sempre; frases longas que não são comando também. */
export function ehAcaoLivre(texto) {
  const t = texto.trim();
  if (t.startsWith(">")) return true;
  return t.split(/\s+/).length >= 4 && !/^[!/]/.test(t);
}
