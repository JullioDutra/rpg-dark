// Evento "O Grimório das Sete Luzes" (iniciado pelo mestre).
// 1) Chamado no grupo: cada jogador aceita ou recusa. 2) Só quem aceitou encontra o Dragão da Aurora na Geleira Hyōga
// e luta junto (mesma luta em grupo das ameaças). 3) O dragão cai e há UM só grimório: os que lutaram elegem quem fica
// com ele (votar) ou resolvem em duelo. Quem recusou sonha com pedaços da vida do menino que roubou o ovo.
import { GRIMORIOS } from "../regras/grimorios.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
import { imagemGrimorioLuzes } from "../avatar/especiais.mjs";
import { rodape } from "./textos.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { um } from "./db.mjs";

export const SETE_LUZES = { monstro: "M21", regiao: "R-WAT-5", grimorio: "G41", duracaoMs: 72 * 3_600_000, prazoDisputaMs: 24 * 3_600_000 };
/** O que quem recusou descobre: poucos detalhes, sem contar o fim da história. */
export const ECOS_DO_MENINO = [
  "Ele tinha quinze anos e morava no Vale de Hinata, quando o vale ainda era verde. A mãe tossia ao fazer pão, e cantava mesmo assim.",
  "Ele tinha uma irmã pequena, Sayo, que pedia uma história toda noite. Ele sempre inventava uma em que ninguém morria.",
  "Ele guardava moedas debaixo do poço, para o remédio da mãe. Nunca juntou o bastante.",
  "Um homem de manto, com um anel de quatro brasões, esperou por ele na estrada. O que ofereceu, o menino não soube recusar.",
];
const n = (s) => semAcento(String(s ?? "").toLowerCase()).trim();

export function criarSeteLuzes({ db, agora, ameacas, grimorios, relogio = null }) {
  const G = GRIMORIOS.get(SETE_LUZES.grimorio), lugar = REGIAO.get(SETE_LUZES.regiao)?.nome ?? SETE_LUZES.regiao;
  const privado = (x) => x.wa_jid ?? x.wa_lid ?? null;
  const jogadores = (mundoId) => db.query(`select j.*, i.wa_jid, i.wa_lid from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id where j.mundo_id = $1 and j.estado = 'ativo'`, [mundoId]);
  /** O evento deste mundo que ainda não acabou (chamado/luta ou disputa pelo grimório). */
  const evento = async (mundoId) => (await db.query(`select * from jogo.ameacas where mundo_id = $1 and dados->>'evento' = 'sete-luzes' and coalesce(dados->>'fase', '') <> 'encerrado' and estado <> 'foi_embora' order by id desc limit 1`, [mundoId]))[0] ?? null;
  const salvar = (a, dados) => db.query("update jogo.ameacas set dados = $2 where id = $1", [a.id, JSON.stringify(dados)]);
  const mundoDe = (id) => um(db, "select * from jogo.mundos where id = $1", [id]);

  async function eco(j) {
    const visto = Number((await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'ecos-menino'", [j.id]))?.valor ?? 0);
    if (visto >= ECOS_DO_MENINO.length) return null;
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'ecos-menino', $2, $3) on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, JSON.stringify(visto + 1), new Date(agora())]);
    return ECOS_DO_MENINO[visto];
  }

  /** Mestre: abre o chamado. */
  async function iniciar(mundoId) {
    if (!mundoId) return { erro: "Não há mundo ativo com jogadores." };
    if (await evento(mundoId)) return { erro: "O chamado das Sete Luzes já está aberto neste mundo." };
    if ((await db.query(`select 1 from jogo.grimorios_jogador g join jogo.jogadores j on j.id = g.jogador_id where j.mundo_id = $1 and g.grimorio_id = $2`, [mundoId, G.id])).length) return { erro: "O Grimório das Sete Luzes já tem dono neste mundo." };
    const anuncio = (grupo) => [{ para: grupo, imagem: imagemGrimorioLuzes(), legenda: `⭐ *O CHAMADO DAS SETE LUZES*\n\nEsta noite, a aurora desceu até tocar o chão em *${lugar}*. Quem olhou para o norte viu sete cores onde só deveria haver gelo.\n\nOs velhos dizem que é o sinal do *Grimório das Sete Luzes*: um livro que ninguém escreveu, guardado por um dragão que ninguém viu acordado.\n\nO chamado é para todos. Atender é uma escolha.\n\n*aceitar missão* · *recusar missão*\n${rodape("só quem aceitar encontra o caminho até o dragão", "a aurora dura três dias")}` }];
    const r = await ameacas.invocar(mundoId, SETE_LUZES.monstro, "monstro", SETE_LUZES.regiao, { evento: "sete-luzes", fase: "chamado", aceitos: [], recusaram: [], anuncio, duracaoMs: SETE_LUZES.duracaoMs });
    return r.erro ? r : { saidas: r.saidas, ameaca: r.ameaca };
  }

  /** aceitar missão / recusar missão (grupo ou privado). A escolha é uma só. */
  async function responder(j, aceita, chat) {
    const a = await evento(j.mundo_id);
    if (!a || a.estado !== "ativa") return null; // sem chamado aberto: não é comando deste evento
    const d = a.dados, id = Number(j.id), pv = (await jogadores(j.mundo_id)).find((x) => Number(x.id) === id);
    const para = privado(pv) ?? chat;
    if ((d.aceitos ?? []).map(Number).includes(id)) return [{ para: chat, texto: `*${j.nome}* já atendeu ao chamado. O caminho é ${lugar}.` }];
    if ((d.recusaram ?? []).map(Number).includes(id)) return [{ para: chat, texto: `*${j.nome}* já escolheu ficar. A aurora não chama duas vezes.` }];
    if (aceita) {
      await salvar(a, { ...d, aceitos: [...(d.aceitos ?? []), id] });
      return [{ para: chat, texto: `*${j.nome}* atende ao chamado das Sete Luzes.` },
        ...(para !== chat ? [{ para, texto: `A aurora te reconhece. Por um instante, as sete cores se alinham e apontam o norte.\n\nO dragão dorme no topo de *${lugar}*. Vá até lá (*viajar ${lugar}*) e, chegando, enfrente-o com *golpear*. Quem mais aceitou luta ao seu lado: a vida do dragão é uma só para todos.\n${rodape("monstro mostra o dragão e a vida dele", "juntos, os golpes valem mais")}` }] : [])];
    }
    await salvar(a, { ...d, recusaram: [...(d.recusaram ?? []), id] });
    const frag = await eco(j);
    return [{ para: chat, texto: `*${j.nome}* fica. Nem todo chamado é para todo mundo.` },
      ...(frag ? [{ para, texto: `Você não vai. E naquela noite, enquanto os outros olham para o norte, você sonha com alguém que nunca conheceu.\n\n_${frag}_\n\nVocê acorda sem saber de quem era a lembrança. Mas ela agora é sua.\n${rodape("um eco do menino que roubou o ovo")}` }] : [])];
  }

  async function entregar(a, vencedor, motivo) {
    const mundo = await mundoDe(a.mundo_id), todos = await jogadores(a.mundo_id);
    const j = todos.find((x) => Number(x.id) === Number(vencedor));
    if (!j) return [];
    await salvar(a, { ...a.dados, fase: "encerrado", vencedor: Number(j.id) });
    const s = await grimorios.entregar(j, G, privado(j) ?? mundo.grupo_wa_id, "O livro é mais leve do que parece, e morno. Quando você o abre, as páginas estão em branco — até a primeira das sete luzes pousar nelas.\n\n*O Grimório das Sete Luzes é seu.* Só existe um.");
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'lendario', $3, $4)", [a.mundo_id, j.id, `${j.nome} ficou com o Grimório das Sete Luzes.`, new Date(agora())]);
    return [{ para: mundo.grupo_wa_id, imagem: imagemGrimorioLuzes(), legenda: `⭐ *O GRIMÓRIO DAS SETE LUZES TEM DONO*\n\n${motivo}\n\n*${j.nome}* fecha o livro contra o peito, e as sete luzes se apagam do céu do norte, uma por uma.\n\n_Só existia um._` }, ...s];
  }

  /** Chamado por ameacas.vitoria: o dragão caiu. Abre a disputa (ou entrega, se só um lutou). */
  async function aoVencer(a, golpes, mundo) {
    const candidatos = golpes.map((g) => Number(g.jogador_id));
    const saidas = [];
    // quem recusou recebe mais um eco
    const todos = await jogadores(a.mundo_id);
    for (const id of a.dados.recusaram ?? []) {
      const x = todos.find((y) => Number(y.id) === Number(id)), frag = x && await eco(x);
      if (frag && privado(x)) saidas.push({ para: privado(x), texto: `Longe dali, no instante em que o dragão cai, você para o que estava fazendo. Outra lembrança que não é sua:\n\n_${frag}_\n${rodape("um eco do menino que roubou o ovo")}` });
    }
    const nomes = golpes.map((g) => `*${g.nome}*`);
    if (candidatos.length === 1) return [...(await entregar({ ...a, dados: { ...a.dados, candidatos } }, candidatos[0], `*Kōryū, o Dragão da Aurora*, caiu pelas mãos de ${nomes[0]}. Sob a asa dele, um único livro.`)), ...saidas];
    const prazo = agora() + SETE_LUZES.prazoDisputaMs;
    await salvar(a, { ...a.dados, fase: "disputa", candidatos, votos: {}, prazo, dano: Object.fromEntries(golpes.map((g) => [g.jogador_id, g.dano])) });
    if (relogio) await relogio.agendar(`sete-luzes:${a.id}`, prazo + 2000, { tipo: "sete-luzes", ameaca: Number(a.id) });
    return [{ para: mundo.grupo_wa_id, imagem: imagemGrimorioLuzes(), legenda: `⭐ *O DRAGÃO DA AURORA CAIU*\n\nKōryū desaba devagar, como neve. Sob a asa dele, intacto, está o *Grimório das Sete Luzes*.\n\nUm livro. Um só. E ${candidatos.length} pessoas que sangraram por ele: ${nomes.join(", ")}.\n\nNinguém avisou que seria assim. Decidam entre vocês quem leva:\n\n*votar <nome>* — cada um dos que lutaram tem um voto; quem passar da metade fica com o livro\n*duelo @pessoa* — entre dois de vocês: quem perde sai da disputa\n${rodape("vocês têm 24 horas", "sem decisão, o livro escolhe quem mais feriu o dragão")}` }, ...saidas];
  }

  /** votar <nome>, no grupo. */
  async function votar(autor, alvoTexto, chat) {
    const a = autor && await evento(autor.mundo_id);
    if (!a || a.dados.fase !== "disputa") return null;
    const d = a.dados, cand = d.candidatos.map(Number);
    if (!cand.includes(Number(autor.id))) return [{ para: chat, texto: `Só quem enfrentou o dragão decide o destino do livro.` }];
    const todos = (await jogadores(a.mundo_id)).filter((x) => cand.includes(Number(x.id)));
    const t = n(alvoTexto.replace(/@\S+/g, " "));
    const alvo = todos.find((x) => x.nome_normalizado === t) ?? (t.length >= 2 ? todos.find((x) => x.nome_normalizado.startsWith(t)) : null);
    if (!alvo) return [{ para: chat, texto: `Vote em um dos que lutaram: ${todos.map((x) => x.nome).join(", ")}.\n${rodape("votar <nome>", "pode votar em você mesmo")}` }];
    const votos = { ...d.votos, [autor.id]: Number(alvo.id) };
    const conta = (id) => Object.values(votos).filter((v) => Number(v) === Number(id)).length;
    const lider = todos.map((x) => ({ x, v: conta(x.id) })).sort((p, q) => q.v - p.v)[0];
    if (lider.v > cand.length / 2) return entregar({ ...a, dados: { ...d, votos } }, lider.x.id, `Os que derrubaram o dragão votaram, e a maioria disse o mesmo nome.`);
    await salvar(a, { ...d, votos });
    const placar = todos.map((x) => `${x.nome}: ${conta(x.id)}`).join(" · ");
    const faltam = cand.length - Object.keys(votos).length;
    return [{ para: chat, texto: `*${autor.nome}* vota em *${alvo.nome}*.\n_${placar}_\n${faltam ? rodape(`faltam ${faltam} voto${faltam > 1 ? "s" : ""}`, "é preciso mais da metade") : "Todos votaram e ninguém passou da metade. As luzes não escolhem por vocês: mudem um voto, ou resolvam num *duelo*."}` }];
  }

  /** Um duelo terminou: se os dois disputavam o grimório, quem perdeu sai da disputa. */
  async function aoFimDuelo(vencedorId, perdedorId, mundoId, chat) {
    const a = await evento(mundoId);
    if (!a || a.dados.fase !== "disputa") return [];
    const d = a.dados, cand = d.candidatos.map(Number);
    if (!cand.includes(Number(vencedorId)) || !cand.includes(Number(perdedorId))) return [];
    const restam = cand.filter((id) => id !== Number(perdedorId));
    const votos = Object.fromEntries(Object.entries(d.votos ?? {}).filter(([quem, em]) => Number(quem) !== Number(perdedorId) && Number(em) !== Number(perdedorId)));
    const todos = await jogadores(mundoId), nome = (id) => todos.find((x) => Number(x.id) === Number(id))?.nome ?? "?";
    if (restam.length === 1) return entregar({ ...a, dados: { ...d, candidatos: restam, votos } }, restam[0], `Decidiu-se na arena. *${nome(perdedorId)}* caiu, e não sobrou mais ninguém para contestar.`);
    await salvar(a, { ...d, candidatos: restam, votos });
    return [{ para: chat, texto: `*${nome(perdedorId)}* está fora da disputa pelo Grimório das Sete Luzes.\n_Restam: ${restam.map(nome).join(", ")}._\n${rodape("votar <nome> ou outro duelo")}` }];
  }

  /** Prazo da disputa: sem decisão, leva o mais votado; no empate, quem mais feriu o dragão. */
  async function aoTick(ameacaId) {
    const a = await um(db, "select * from jogo.ameacas where id = $1", [ameacaId]);
    if (!a || a.dados?.fase !== "disputa" || Number(a.dados.prazo) > agora()) return [];
    const d = a.dados, conta = (id) => Object.values(d.votos ?? {}).filter((v) => Number(v) === Number(id)).length;
    const escolhido = d.candidatos.map(Number).sort((p, q) => conta(q) - conta(p) || Number(d.dano?.[q] ?? 0) - Number(d.dano?.[p] ?? 0))[0];
    return entregar(a, escolhido, "O prazo acabou sem acordo. O livro se abriu sozinho e virou as páginas na direção de quem mais fez o dragão sangrar.");
  }

  /** Mestre: situação e entrega direta. */
  async function status(mundoId) {
    const a = await evento(mundoId);
    if (!a) return "Não há chamado das Sete Luzes aberto. Para abrir: mestre sete luzes";
    const todos = await jogadores(mundoId), nome = (id) => todos.find((x) => Number(x.id) === Number(id))?.nome ?? "?", d = a.dados;
    return `*Sete Luzes* — fase: ${d.fase}\nAceitaram: ${(d.aceitos ?? []).map(nome).join(", ") || "ninguém"}\nRecusaram: ${(d.recusaram ?? []).map(nome).join(", ") || "ninguém"}\nDragão: ${a.estado === "ativa" ? `${a.hp}/${a.hp_max}` : a.estado}` +
      (d.fase === "disputa" ? `\nDisputam: ${d.candidatos.map(nome).join(", ")}\nVotos: ${Object.entries(d.votos ?? {}).map(([q, v]) => `${nome(q)}→${nome(v)}`).join(", ") || "nenhum"}` : "");
  }
  async function entregarPeloMestre(mundoId, jogadorId) {
    const a = await evento(mundoId);
    if (!a || a.dados.fase !== "disputa") return null;
    return entregar(a, jogadorId, "As sete luzes desceram todas ao mesmo tempo sobre uma única pessoa. Ninguém discutiu.");
  }

  ameacas.definirEvento((a, golpes, mundo) => (a.dados?.evento === "sete-luzes" ? aoVencer(a, golpes, mundo) : []));
  return { iniciar, responder, votar, aoFimDuelo, aoTick, status, entregarPeloMestre };
}
