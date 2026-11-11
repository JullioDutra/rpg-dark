// Mundo vivo no servidor: chegada às regiões (com imagens), locais, NPCs (amizade, morte, vingança), capítulos da
// história (o motor avança os passos por ações concretas; a IA só narra), vilões em covis com derrota única e
// anúncio dos feitos no grupo.
import { MUNDO, VILOES, COVIL, CAPITULO, local as localDe, npcDe } from "../mundo/mundo.mjs";
import { REGIAO, normal } from "../regras/exploracao.mjs";
import { aplicarXP } from "../regras/combate.mjs";
import { item as itemDe } from "../regras/itens.mjs";
import { renderCena } from "../cena/cena.mjs";
import { imagemVilao } from "./combate.mjs";
import { rodape, ambiente } from "./textos.mjs";
import { um } from "./db.mjs";

const NUCLEO_NOME = { rubro: "Núcleo Rubro", abissal: "Núcleo Abissal", raiz: "Núcleo Raiz", celeste: "Núcleo Celeste" };
const ARCOS = { "arco-homura": "Homura (Kagutsuchi-jō)", "arco-watatsumi": "Watatsumi (Ryūgū-jō)", "arco-daichi": "Daichi (Minas de Shōseki)", "arco-fujin": "Fūjin (Amagumo-jō)" };
const GRANDES = ["excalibur", "kokugai", "tenmon", "shitencho"];
export const AMIZADE = { amigo: 3, proximo: 6, intervaloMs: 6 * 3_600_000, chanceMorte: 0.12, intervaloMorteMs: 7 * 86_400_000 };

export const imagemLocal = (rid, l) => renderCena(l.cena, REGIAO.get(rid)?.reino ?? "Kokū", `${rid}:${l.id}`);
const nomeRegiao = (rid) => REGIAO.get(rid)?.nome ?? rid;
const xpCapitulo = (nivel) => Math.round(60 * nivel ** 1.2);

/** Próximo objetivo da campanha, em uma frase. */
export function objetivoCampanha(B) {
  if (B.has("eclipse-vencido")) return "Você chegou ao fim da história. O mundo continua: há capítulos, vilões e segredos que você ainda não viu.";
  if (!B.has("despertar")) return "Resolva o problema da região onde você está. Fale com as pessoas (*locais*, *falar*).";
  if (!B.has("selo")) return "Conquiste o *Selo da Guilda* numa capital: Kagutsuchi-jō, Ryūgū-jō, Iwakura-jō ou Amagumo-jō.";
  if (!B.has("festival")) return "Leve seu selo a *Kyōkai*, no centro do mundo, para o Festival dos Quinhentos Anos.";
  const faltam = Object.entries(ARCOS).filter(([k]) => !B.has(k)).map(([, v]) => v);
  if (faltam.length) return `Os quatro reinos estão sendo atacados por dentro. Proteja cada rei e seu núcleo. Faltam: ${faltam.join(", ")}.`;
  if (!B.has("rosto")) return "Volte a *Kyōkai*. Alguém pôs um preço na sua cabeça, e é hora de saber quem.";
  if (!B.has("muralha")) return "Vá à *Muralha dos Selos* e liberte as guardiãs dos pilares.";
  if (!B.has("poco")) return "O caminho para as *Ruínas de Hinata* está aberto. Veja o que os reis esconderam.";
  if (!B.has("ninho")) return "Suba ao *Monte Ryūsō*, onde ficava o ninho do dragão.";
  if (!B.has("kanata")) return "Kanata te espera em *Kyōkai*. Uma noite, um beco, uma resposta.";
  if (!B.has("descida")) return "Desça à *Cratera do Vazio*.";
  if (!B.has("reis-antigos")) return "Na *Torre Sem Fim*, liberte os quatro reis antigos.";
  return "No *Trono dos Deuses Caídos*, enfrente o Rei do Eclipse.";
}

export function criarMundo({ db, ia = null, rng, agora }) {
  // ── estado do jogador ──
  async function estado(j) {
    const linhas = await db.query("select chave, valor from jogo.progresso where jogador_id = $1", [j.id]);
    const P = new Map(linhas.map((l) => [l.chave, l.valor]));
    const B = new Set([...P.keys()].filter((k) => k.startsWith("b:")).map((k) => k.slice(2)));
    const D = new Set((await db.query("select vilao_id from jogo.derrotas_vilao where jogador_id = $1", [j.id])).map((x) => x.vilao_id));
    return { P, B, D };
  }
  const gravar = (j, chave, valor = true) => db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, $2, $3, $4)
    on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, chave, JSON.stringify(valor), new Date(agora())]);
  const mundoDe = (j) => um(db, "select * from jogo.mundos where id = $1", [j.mundo_id]);

  async function feito(j, tipo, texto, { grupo, imagem = null } = {}) {
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, $3, $4, $5)", [j.mundo_id, j.id, tipo, texto.slice(0, 400), new Date(agora())]);
    if (!grupo) return [];
    return [imagem ? { para: grupo, imagem, legenda: texto } : { para: grupo, texto }];
  }

  // ── capítulos ──
  function capituloAtivo(rid, { P, B, D }) {
    for (const c of MUNDO[rid]?.capitulos ?? []) {
      if (P.has(`c:${c.id}`)) continue;
      if ((c.requer ?? []).some((r) => !B.has(r))) return { cap: c, bloqueado: true };
      let passo = Number(P.get(`p:${c.id}`) ?? 0);
      while (passo < c.passos.length && c.passos[passo].t === "derrotar" && D.has(c.passos[passo].a)) passo++;
      return { cap: c, passo };
    }
    return null;
  }
  const textoPasso = (c, passo) => `*${c.titulo}* _(${passo + 1}/${c.passos.length})_\n${c.passos[passo].txt}`;

  /** Um gatilho (ir/falar/derrotar) pode avançar o capítulo ativo da região. Devolve as saídas (privado + grupo). */
  async function avancar(j, rid, gatilho, para, st = null) {
    st ??= await estado(j);
    const at = capituloAtivo(rid, st);
    if (!at || at.bloqueado) return [];
    const { cap } = at;
    let passo = at.passo, andou = passo !== Number(st.P.get(`p:${cap.id}`) ?? 0);
    const p = cap.passos[passo];
    if (p && p.t === gatilho.t && p.a === gatilho.a) { passo++; andou = true; }
    while (passo < cap.passos.length && cap.passos[passo].t === "derrotar" && st.D.has(cap.passos[passo].a)) passo++;
    if (!andou) return [];
    if (passo < cap.passos.length) {
      await gravar(j, `p:${cap.id}`, passo);
      return [{ para, texto: `_A história avança._\n\n${textoPasso(cap, passo)}` }];
    }
    return concluir(j, rid, cap, para, st);
  }

  async function concluir(j, rid, cap, para, st) {
    const saidas = [];
    const mundo = await mundoDe(j);
    const primeiro = !(await db.query(`select 1 from jogo.progresso p join jogo.jogadores x on x.id = p.jogador_id where x.mundo_id = $1 and p.chave = $2 limit 1`, [j.mundo_id, `c:${cap.id}`])).length;
    await gravar(j, `c:${cap.id}`);
    await gravar(j, "b:despertar");
    const da = cap.da ?? {};
    if (da.bandeira) await gravar(j, `b:${da.bandeira}`);
    st.B.add("despertar"); if (da.bandeira) st.B.add(da.bandeira);
    if (da.bandeira === "muralha") await db.query(`insert into jogo.marcos (mundo_id, marco_id, jogador_id, status, concluido_em) values ($1, 'A3-M1', $2, 'concluido', $3)
      on conflict do nothing`, [j.mundo_id, j.id, new Date(agora())]);

    // Recompensas
    const xp = xpCapitulo(cap.nivel), ryo = cap.nivel * 20;
    const jog = await um(db, "select * from jogo.jogadores where id = $1", [j.id]);
    const depois = aplicarXP(jog, xp);
    await db.query(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8, pontos_livres = $9, rank = $10,
      ryo = ryo + $11, merito = merito + 15 where id = $1`, [j.id, depois.nivel, depois.xp, JSON.stringify(depois.atributos), depois.hp, depois.hp_max, depois.mp, depois.mp_max, depois.pontos_livres, depois.rank, ryo]);
    for (const ev of depois.eventos) await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, 'marco_historia', $4)`,
      [j.id, ev.atributo, ev.delta, JSON.stringify({ capitulo: cap.id })]);
    Object.assign(j, { nivel: depois.nivel, rank: depois.rank });
    const ganhos = [`+${xp} XP`, `+${ryo} ryō`];
    const itens = [];
    if (da.item) itens.push(da.item);
    const ceus = ["ceu-rubro", "ceu-profundo", "ceu-pedra", "ceu-errante"];
    if (ceus.includes(da.bandeira) && ceus.every((c) => st.B.has(c))) itens.push("shitencho");
    for (const id of itens) {
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, 'equipamento', 1, '{}') on conflict do nothing`, [j.id, id]);
      ganhos.push(itemDe(id).nome);
    }

    if (cap.final) return [...saidas, ...(await finalDaHistoria(j, cap, para, st, mundo))];

    let texto = `⭐ *Capítulo concluído — ${cap.titulo}*\n\n${cap.fim}\n\n*O que você descobriu:* ${cap.pista}\n\n${rodape(...ganhos)}`;
    if (depois.niveis.length) texto += `\n\n*Nível ${depois.nivel}.* Vida e mana voltam ao máximo.`;
    if (da.nucleo) {
      const ja = await db.query("select 1 from jogo.nucleos where mundo_id = $1 and nucleo = $2", [j.mundo_id, da.nucleo]);
      if (!ja.length) await db.query("insert into jogo.nucleos (mundo_id, nucleo, estado, jogador_id) values ($1, $2, 'confiado', $3)", [j.mundo_id, da.nucleo, j.id]);
      texto += ja.length ? `\n\nO rei reconhece o que você fez. O *${NUCLEO_NOME[da.nucleo]}* continua seguro.` : `\n\nO rei confia a você a guarda do *${NUCLEO_NOME[da.nucleo]}*. Você sente o peso — e a força — de um pedaço da Árvore-Estrela.`;
      texto += `\n${rodape("bênção do reino: +5% de dano em todas as lutas")}`;
      if (!ja.length) saidas.push(...(await feito(j, "nucleo", `⭐ *O ${NUCLEO_NOME[da.nucleo].toUpperCase()} FOI CONFIADO*\n\nUm rei colocou um pedaço da Árvore-Estrela nas mãos de *${j.nome}*.\nRestam ${4 - (await db.query("select 1 from jogo.nucleos where mundo_id = $1", [j.mundo_id])).length} núcleos em perigo.`, { grupo: mundo.grupo_wa_id })));
    }
    for (const id of itens) saidas.push(...(await feito(j, "lendario", `⭐ *UM GRANDE ITEM DESPERTOU*\n\n*${j.nome}* conquistou *${itemDe(id).nome}*.\nSó existe um em todo o mundo.`, { grupo: mundo.grupo_wa_id })));
    const novo = objetivoCampanha(st.B);
    texto += `\n\n*Seu caminho:* ${novo}`;
    saidas.unshift({ para, texto });
    saidas.push(...(await feito(j, "capitulo", cap.principal
      ? `⭐ *${j.nome}* concluiu *${cap.titulo}* em ${nomeRegiao(rid)}${primeiro ? " — o primeiro do mundo" : ""}.\n_Um segredo do mundo foi descoberto. Quem quiser saber, que pergunte a ${j.nome}… ou vá ver com os próprios olhos._`
      : `⭐ *${j.nome}* concluiu *${cap.titulo}* em ${nomeRegiao(rid)}.`, { grupo: mundo.grupo_wa_id })));
    if (depois.rank !== jog.rank) saidas.push(...(await feito(j, "rank", `*${j.nome}* alcançou o *rank ${depois.rank}* (nível ${depois.nivel}).`, { grupo: mundo.grupo_wa_id })));
    // Próximo capítulo da mesma região, se já estiver liberado
    const prox = capituloAtivo(rid, { ...st, P: new Map([...st.P, [`c:${cap.id}`, true]]) });
    if (prox && !prox.bloqueado) saidas.push({ para, texto: `_Ainda há o que fazer aqui._\n\n${textoPasso(prox.cap, prox.passo)}` });
    return saidas;
  }

  async function finalDaHistoria(j, cap, para, st, mundo) {
    const inv = new Set((await db.query("select item_id from jogo.inventario where jogador_id = $1", [j.id])).map((x) => x.item_id));
    const grandes = GRANDES.filter((g) => inv.has(g)).length;
    const estelar = grandes >= 3 && Number(j.corrupcao ?? 0) < 25;
    const coroado = !mundo.final;
    if (coroado) await db.query("update jogo.mundos set final = $2 where id = $1 and final is null", [j.mundo_id, estelar ? "estelar" : "selo"]);
    await gravar(j, estelar ? "b:final-estelar" : "b:final-selo");
    await db.query("update jogo.jogadores set titulo = $2 where id = $1", [j.id, coroado ? "Seiō, o Rei-Estrela" : "Guardião das Estrelas"]);
    const cena = estelar
      ? "Algo morno se mexe junto ao seu peito. O Ovo Eterno racha — e de dentro dele, pequeno e furioso, nasce um dragão de escamas cor de aurora. Nisteroy, o Dragão do Crepúsculo, para. Olha. Reconhece. A fusão se desfaz como gelo ao sol: de um lado, um dragão velho encostando o focinho no filho; do outro, um menino de onze anos, sozinho, que não entende por que todo mundo cresceu. O buraco no céu se fecha. No Vale de Hinata, uma muda de Árvore-Estrela rompe a cinza."
      : "O Rei do Eclipse cai, mas o menino e o dragão não se soltam: você não tinha o bastante para separá-los. Então alguém precisa segurar a tampa do mundo. Você põe a mão no Esquife, e o cristal fecha em volta dela, morno. Vai doer para sempre, mas o céu para de rachar. O mundo vive — em luto, mas vive. (Com três dos quatro Grandes Itens, o Ovo teria força para nascer.)";
    const privado = `⭐ *${cap.titulo} — O FIM*\n\n${cena}\n\n${coroado ? `Os quatro reis se ajoelham. As estrelas, uma por uma, voltam a acender.\n\n*${j.nome}, você é o Seiō (星王), o Rei-Estrela.*` : `O mundo já tem um Seiō. Mas a história guarda o seu nome ao lado do dele: *${j.nome}, Guardião das Estrelas*.`}\n\n${rodape(estelar ? "final estelar" : "final do selo", "o mundo continua aberto: explore o que faltou")}`;
    const grupo = coroado
      ? `⭐⭐⭐⭐\n*O ECLIPSE ACABOU*\n\n${estelar ? "O ovo chocou. O dragão soltou o menino. O buraco no céu se fechou." : "O Rei do Eclipse caiu, e alguém segurou a tampa do mundo com as próprias mãos."}\n\nQuinhentos anos depois do crime dos quatro reis, a história termina.\n\n*${j.nome.toUpperCase()}* é coroado *SEIŌ (星王), O REI-ESTRELA*.\n\n_Final ${estelar ? "Estelar" : "do Selo"}. O mundo continua vivo para quem ainda quer conhecer seus segredos._`
      : `⭐ *${j.nome}* também atravessou o Eclipse e voltou: *Guardião das Estrelas*.`;
    return [{ para, texto: privado }, ...(await feito(j, "final", grupo, { grupo: mundo.grupo_wa_id, imagem: coroado ? imagemVilao(VILOES.get("V100")) : null }))];
  }

  // ── vilões nos covis ──
  const capsDoVilao = (v) => [...CAPITULO.values()].filter((c) => c.passos.some((p) => p.t === "derrotar" && p.a === v));
  async function proximoVilao(j, rid, l, st) {
    for (const v of l.viloes ?? []) {
      if (st.D.has(v)) continue;
      const caps = capsDoVilao(v);
      if (caps.length && caps.every((c) => (c.requer ?? []).some((r) => !st.B.has(r)))) return { v, bloqueado: true };
      const dono = await um(db, `select x.nome from jogo.derrotas_vilao d join jogo.jogadores x on x.id = d.jogador_id where d.mundo_id = $1 and d.vilao_id = $2 and d.primeiro`, [j.mundo_id, v]);
      return { v, eco: Boolean(dono), dono: dono?.nome ?? null };
    }
    return null;
  }
  async function encontroFixo(j, rid, l, alvo, para) {
    const v = VILOES.get(alvo.v);
    const tempo = agora();
    await db.query("delete from jogo.exploracoes where jogador_id = $1 and pendente", [j.id]);
    const dados = { inimigo: { id: v.id, nome: v.nome, nivel: v.nivel }, fixo: true, eco: alvo.eco, local: l.id, perigoso: v.nivel >= j.nivel + 5 };
    await db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em) values ($1, $2, $3, 'encontro', $4, true, $5)`,
      [j.id, `fixo:${j.id}:${v.id}:${tempo}`, rid, JSON.stringify(dados), new Date(tempo)]);
    const juramento = await um(db, "select 1 from jogo.progresso where jogador_id = $1 and chave = $2", [j.id, `juramento:${v.id}`]);
    const aviso = dados.perigoso ? "⚠️ Um corvo pousa no seu ombro e grasna. Esse inimigo é forte demais para você agora.\n\n" : "";
    const legenda = `${aviso}*${alvo.eco ? `Eco de ${v.nome_completo}` : v.nome_completo}*\n\n${v.descricao}\n\n` +
      `${alvo.eco ? `_${v.nome} já caiu neste mundo pelas mãos de ${alvo.dono}. O que está diante de você é o Eco dele: o Vazio repete o que perde._\n\n` : ""}` +
      `${juramento ? "_Foi ele. Você jurou._\n\n" : ""}*lutar* · *recuar*\n${rodape(`nível ${v.nivel}`, ["alto", "rei", "divindade"].includes(v.tier) ? "chefe: não dá para fugir" : v.tier === "medio" ? "elite" : null, `ponto fraco: ${v.fraqueza}`)}`;
    const img = imagemVilao(v);
    return [img ? { para, imagem: img, legenda } : { para, texto: legenda }];
  }

  // ── locais ──
  function listaLocais(rid, st) {
    return MUNDO[rid].locais.map((l, i) => {
      const perigo = (l.viloes ?? []).some((v) => !st.D.has(v));
      const marcas = [l.servicos?.includes("loja") && "loja", l.servicos?.includes("descanso") && "descanso", l.npcs?.length && "gente para conversar", perigo && "perigo"].filter(Boolean);
      return `*${i + 1}* ${l.nome}${marcas.length ? ` — _${marcas.join(", ")}_` : ""}`;
    }).join("\n");
  }

  /** Chegada a uma região: imagem do lugar principal, o que existe ali e a missão da história (se houver). */
  async function chegada(j, para, { nascimento = false } = {}) {
    const rid = j.regiao_atual, r = MUNDO[rid];
    if (!r) return [];
    const st = await estado(j);
    const saidas = [];
    const mundo = await mundoDe(j);
    const principal = r.locais[0];
    await db.query("update jogo.jogadores set local_atual = $2 where id = $1", [j.id, principal.id]);
    j.local_atual = principal.id;
    const at = capituloAtivo(rid, st);
    saidas.push({ para, imagem: imagemLocal(rid, principal), legenda: `🗺️ *${nomeRegiao(rid)}*\n\n${r.chegada}\n\n${listaLocais(rid, st)}\n\n${rodape("ir <nº> para visitar um lugar", "falar <nome> para conversar")}` });
    if (at && !at.bloqueado) saidas.push({ para, texto: `_Há uma história acontecendo aqui._\n\n${textoPasso(at.cap, at.passo)}\n${rodape("só de passagem? siga viagem: a história espera")}` });
    // Primeiro do mundo a pisar aqui
    const primeiro = await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em)
      select $1, $2, 'true', $3 where not exists (select 1 from jogo.progresso p join jogo.jogadores x on x.id = p.jogador_id where x.mundo_id = $4 and p.chave = $2)
      on conflict do nothing returning 1`, [j.id, `visita:${rid}`, new Date(agora()), j.mundo_id]);
    if (primeiro.length && r.tipo !== "capital" && !nascimento) saidas.push(...(await feito(j, "descoberta", `🗺️ *${j.nome}* foi a primeira pessoa deste mundo a chegar a *${nomeRegiao(rid)}*.`, { grupo: mundo.grupo_wa_id })));
    if (!nascimento) saidas.push(...(await talvezMorte(j, rid, st, para, mundo)));
    return saidas;
  }

  async function ir(j, alvo, para) {
    const rid = j.regiao_atual, r = MUNDO[rid];
    if (!r) return [{ para, texto: "Não há lugares conhecidos por aqui." }];
    const st = await estado(j);
    const t = normal(alvo);
    const l = /^\d+$/.test(t) ? r.locais[Number(t) - 1] : r.locais.find((x) => normal(x.nome) === t || x.id === t) ?? r.locais.find((x) => normal(x.nome).includes(t));
    if (!l) return [{ para, texto: `Esse lugar não existe aqui. Em ${nomeRegiao(rid)} você pode ir a:\n\n${listaLocais(rid, st)}` }];
    const viagem = await um(db, "select 1 from jogo.viagens where jogador_id = $1 and concluida_em is null", [j.id]);
    if (viagem) return [{ para, texto: "Você ainda está na estrada. Chegue primeiro." }];
    await db.query("update jogo.jogadores set local_atual = $2 where id = $1", [j.id, l.id]);
    j.local_atual = l.id;
    const mortos = new Set((await db.query("select npc from jogo.npcs_mortos where mundo_id = $1", [j.mundo_id])).map((x) => x.npc));
    const gente = (l.npcs ?? []).map((n) => { const p = r.npcs[n]; return mortos.has(`${rid}:${n}`) ? `_${p.nome} (${p.papel}) — há flores onde ela(e) costumava ficar_` : `*${p.nome}*, ${p.papel}`; });
    const servicos = [l.servicos?.includes("loja") && "*loja*", l.servicos?.includes("descanso") && "*descansar*"].filter(Boolean);
    const saidas = [{ para, imagem: imagemLocal(rid, l), legenda: `*${l.nome}*\n\n${l.desc}${gente.length ? `\n\nAqui você vê: ${gente.join("; ")}.` : ""}` +
      `${servicos.length || gente.length ? `\n${rodape(...servicos.map((s) => s.replace(/\*/g, "")), gente.length ? "falar <nome>" : null)}` : ""}` }];
    saidas.push(...(await avancar(j, rid, { t: "ir", a: l.id }, para, st)));
    const alvoV = await proximoVilao(j, rid, l, st);
    if (alvoV?.bloqueado) saidas.push({ para, texto: "Algo fecha o caminho mais adiante: uma névoa pesada, um silêncio errado. A história ainda não te trouxe até aqui.\n" + rodape("veja seu caminho com *missao*") });
    else if (alvoV) saidas.push(...(await encontroFixo(j, rid, l, alvoV, para)));
    return saidas;
  }

  // ── NPCs ──
  async function falar(j, alvo, fala, para) {
    const rid = j.regiao_atual, r = MUNDO[rid];
    const st = await estado(j);
    const nomes = Object.entries(r?.npcs ?? {});
    if (!nomes.length) return [{ para, texto: "Não há ninguém para conversar por aqui." }];
    const t = normal(alvo);
    const [nid, p] = nomes.find(([id, n]) => normal(n.nome) === t || id === t) ?? nomes.find(([, n]) => normal(n.nome).includes(t) || t.includes(normal(n.nome).split(" ").at(-1))) ?? [];
    if (!p || !t) return [{ para, texto: `Com quem? Aqui em ${nomeRegiao(rid)} você pode falar com:\n\n${nomes.map(([, n]) => `*${n.nome}*, ${n.papel}`).join("\n")}\n\n${rodape("falar <nome>")}` }];
    const chave = `${rid}:${nid}`;
    const npcLocal = npcDe(rid, nid)?.local;
    if (npcLocal && j.local_atual !== npcLocal) { await db.query("update jogo.jogadores set local_atual = $2 where id = $1", [j.id, npcLocal]); j.local_atual = npcLocal; }
    const morto = await um(db, "select * from jogo.npcs_mortos where mundo_id = $1 and npc = $2", [j.mundo_id, chave]);
    if (morto) {
      const saidas = [{ para, texto: `Onde *${p.nome}* costumava ficar há flores e uma lamparina acesa. ${VILOES.get(morto.vilao_id)?.nome ?? "Alguém"} tirou a vida dela(e).\n\nEntre as flores, um bilhete com a letra de ${p.nome}: _"Se eu não puder te contar pessoalmente: ${p.sabe}."_` }];
      saidas.push(...(await avancar(j, rid, { t: "falar", a: nid }, para, st)));
      return saidas;
    }
    const tempo = agora();
    const rel = await um(db, "select * from jogo.relacoes where jogador_id = $1 and npc = $2", [j.id, chave]);
    const ganha = !rel?.ultima_conversa || tempo - +new Date(rel.ultima_conversa) >= AMIZADE.intervaloMs;
    const amizade = (rel?.amizade ?? 0) + (ganha ? 1 : 0);
    await db.query(`insert into jogo.relacoes (jogador_id, npc, amizade, ultima_conversa, conversas) values ($1, $2, $3, $4, 1)
      on conflict (jogador_id, npc) do update set amizade = $3, ultima_conversa = case when $5 then $4 else jogo.relacoes.ultima_conversa end, conversas = jogo.relacoes.conversas + 1`,
    [j.id, chave, amizade, new Date(tempo), ganha]);
    const at = capituloAtivo(rid, st);
    const passo = at && !at.bloqueado ? at.cap.passos[at.passo] : null;
    const daHistoria = passo?.t === "falar" && passo.a === nid;
    let resposta = null;
    if (ia) {
      const sistema = `Você interpreta ${p.nome}, ${p.papel}, num RPG de anime (Yotsuhoshi) jogado no WhatsApp, em português do Brasil. Jeito de falar: ${p.jeito}. ` +
        `Você SABE disto e deve contar com suas palavras${daHistoria || !rel ? " nesta conversa" : " se fizer sentido"}: ${p.sabe}. ` +
        `Regras: responda só como o personagem, em até 450 caracteres, sem emojis, sem listas; falas entre aspas ou com travessão; não invente fatos grandes do mundo além do que você sabe; ` +
        `nunca dê itens, poderes ou números; não resolva a missão pelo jogador. Relação com o jogador: ${amizade >= AMIZADE.proximo ? "amigo próximo, fala com carinho" : amizade >= AMIZADE.amigo ? "amigo" : rel ? "conhecido" : "primeiro encontro"}.`;
      const esquema = { type: "object", additionalProperties: false, required: ["fala"], properties: { fala: { type: "string" } } };
      try {
        const res = await Promise.race([
          ia.gerarJSON({ sistema, mensagens: [{ role: "user", content: `${j.nome} (${j.classe}) ${fala ? `diz: "${fala.slice(0, 300)}"` : "se aproxima para conversar."}` }], esquema, maxTokens: 500 }),
          new Promise((ok) => setTimeout(() => ok({ ok: false }), 15000)),
        ]);
        if (res.ok && res.dados.fala?.trim()) resposta = res.dados.fala.trim().slice(0, 700);
      } catch { /* cai no texto pronto */ }
    }
    resposta ??= `— ${p.sabe[0].toUpperCase()}${p.sabe.slice(1)}.`;
    const saidas = [{ para, texto: `*${p.nome}*, ${p.papel}\n\n${resposta}${ganha && amizade === AMIZADE.amigo ? `\n\n_${p.nome} agora te considera uma pessoa amiga._` : ganha && amizade === AMIZADE.proximo ? `\n\n_${p.nome} confia em você como em poucos._` : ""}` }];
    if (ganha && amizade === AMIZADE.amigo) {
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'pocao', 'consumivel', 2, '{}') on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 2`, [j.id]);
      saidas.push({ para, texto: `${p.nome} coloca um embrulho na sua mão. — Leva. Você vai precisar mais do que eu.\n${rodape("+2 poções de cura")}` });
    }
    saidas.push(...(await avancar(j, rid, { t: "falar", a: nid }, para, st)));
    return saidas;
  }

  /** De vez em quando, um vilão da região mata um amigo do jogador. Nunca é regra; no máximo uma vez por semana. */
  async function talvezMorte(j, rid, st, para, mundo) {
    const amigos = await db.query("select * from jogo.relacoes where jogador_id = $1 and npc like $2 and amizade >= $3", [j.id, `${rid}:%`, AMIZADE.amigo]);
    if (!amigos.length) return [];
    const ultima = await um(db, "select criado_em from jogo.npcs_mortos where jogador_id = $1 order by criado_em desc limit 1", [j.id]);
    if (ultima && agora() - +new Date(ultima.criado_em) < AMIZADE.intervaloMorteMs) return [];
    const assassinos = MUNDO[rid].locais.flatMap((l) => l.viloes ?? []).filter((v) => !st.D.has(v) && VILOES.get(v).tier !== "comum" && VILOES.get(v).arquetipo !== "divino");
    if (!assassinos.length || rng() >= AMIZADE.chanceMorte) return [];
    const candidatos = amigos.filter((a) => MUNDO[rid].npcs[a.npc.split(":")[1]]?.mortal);
    if (!candidatos.length) return [];
    const a = candidatos[Math.floor(rng() * candidatos.length)], p = MUNDO[rid].npcs[a.npc.split(":")[1]];
    const v = VILOES.get(assassinos[Math.floor(rng() * assassinos.length)]);
    const novo = await db.query(`insert into jogo.npcs_mortos (mundo_id, npc, vilao_id, jogador_id, criado_em) values ($1, $2, $3, $4, $5) on conflict do nothing returning 1`,
      [j.mundo_id, a.npc, v.id, j.id, new Date(agora())]);
    if (!novo.length) return [];
    return [{ para, texto: `Tem gente demais na rua, e ninguém fala alto.\n\nVocê abre caminho e entende antes de ver: *${p.nome}* está no chão, coberta(o) por um pano. Alguém segura seu braço.\n— Foi *${v.nome_completo}*. Veio procurando por você. ${p.nome} não disse onde você estava.\n\nVocê pode *vingar* ${p.nome} — ou carregar isso em silêncio.` },
      ...(await feito(j, "luto", `*${p.nome}*, ${p.papel} de ${nomeRegiao(rid)}, foi morta(o) por *${v.nome_completo}*. Era amiga(o) de ${j.nome}.`, { grupo: mundo.grupo_wa_id }))];
  }

  async function vingar(j, para) {
    const m = await um(db, "select * from jogo.npcs_mortos where jogador_id = $1 and not vingado order by criado_em desc limit 1", [j.id]);
    if (!m) return [{ para, texto: "Não há ninguém para vingar. Que continue assim." }];
    const v = VILOES.get(m.vilao_id), [rid, nid] = m.npc.split(":"), p = MUNDO[rid].npcs[nid];
    const ja = await um(db, "select 1 from jogo.progresso where jogador_id = $1 and chave = $2", [j.id, `juramento:${v.id}`]);
    if (ja) return [{ para, texto: `Você já jurou. *${v.nome_completo}* está em ${localDe(COVIL.get(v.id).regiao, COVIL.get(v.id).local).nome}, ${nomeRegiao(COVIL.get(v.id).regiao)}.` }];
    await gravar(j, `juramento:${v.id}`);
    const c = COVIL.get(v.id), mundo = await mundoDe(j);
    return [{ para, texto: `Você se ajoelha ao lado de ${p.nome} e jura, baixo, para ninguém ouvir.\n\n*${v.nome_completo}* vai pagar.\n\n${rodape(`+15% de dano contra ${v.nome}`, `covil: ${localDe(c.regiao, c.local).nome}, ${nomeRegiao(c.regiao)}`, `nível ${v.nivel}`)}` },
      ...(await feito(j, "juramento", `*${j.nome}* jurou vingar ${p.nome}. *${v.nome_completo}* tem os dias contados.`, { grupo: mundo.grupo_wa_id }))];
  }

  // ── eventos vindos do combate ──
  async function aoEventos(j, eventos, para) {
    const saidas = [];
    if (!eventos?.length) return saidas;
    const mundo = await mundoDe(j);
    for (const ev of eventos) {
      if (ev.tipo === "vilao") {
        const v = VILOES.get(ev.vilao), c = COVIL.get(v.id), onde = `${localDe(c.regiao, c.local).nome}, ${nomeRegiao(c.regiao)}`;
        if (ev.primeiro) {
          const quem = `*${j.nome}* (${j.classe}, nível ${ev.nivelJogador ?? j.nivel})`;
          const txt = {
            comum: `⚔️ ${quem} derrotou *${v.nome_completo}* em ${onde}.`,
            medio: `⚔️ *Um nome a menos entre os procurados.*\n\n${quem} derrotou *${v.nome_completo}* em ${onde}.\n_${v.descricao}_`,
            alto: `⚔️ *UM GRANDE INIMIGO CAIU*\n\n${quem} derrotou *${v.nome_completo}* em ${onde}.\n\n_${v.descricao}_\n\nA notícia corre pelos quatro reinos mais rápido que qualquer mensageiro.`,
            rei: `⚔️⚔️ *A QUEDA DE UM REI DAS SOMBRAS*\n\nOs sinos tocam em todas as capitais.\n\n${quem} derrotou *${v.nome_completo}* em ${onde}.\n\n_${v.descricao}_\n\nPoucos nomes na história fizeram algo assim. O de ${j.nome} agora é um deles.`,
            divindade: `⚔️⚔️⚔️ *UM DEUS CAIU*\n\nO céu escureceu por um instante em todo o continente. Quem estava olhando, viu.\n\n${quem} derrotou *${v.nome_completo}* em ${onde}.\n\n_${v.descricao}_\n\nDaqui a quinhentos anos, ainda vão contar essa história.`,
          }[v.tier];
          saidas.push(...(await feito(j, "vilao", txt, { grupo: mundo.grupo_wa_id, imagem: ["alto", "rei", "divindade"].includes(v.tier) ? imagemVilao(v) : null })));
          if (["rei", "divindade"].includes(v.tier)) await db.query("update jogo.mundos set relogio_eclipse = greatest(0, relogio_eclipse - 3) where id = $1", [j.mundo_id]);
        }
        // Vingança cumprida
        const luto = await db.query("update jogo.npcs_mortos set vingado = true where jogador_id = $1 and vilao_id = $2 and not vingado returning npc", [j.id, v.id]);
        for (const l of luto) {
          const [rid, nid] = l.npc.split(":"), p = MUNDO[rid].npcs[nid];
          await db.query("update jogo.jogadores set merito = merito + 30 where id = $1", [j.id]);
          saidas.push({ para, texto: `Acabou. Você fica um tempo olhando para as próprias mãos.\n\n${p.nome} não volta. Mas quem fez aquilo não vai fazer de novo — com ninguém.\n${rodape("vingança cumprida", "+30 de mérito")}` });
          saidas.push(...(await feito(j, "vinganca", `*${j.nome}* cumpriu o juramento: ${p.nome} foi vingada(o). *${v.nome}* não existe mais.`, { grupo: mundo.grupo_wa_id })));
        }
        saidas.push(...(await avancar(j, c.regiao, { t: "derrotar", a: v.id }, para)));
        // Próximo perigo no mesmo local
        const st = await estado(j);
        const l = localDe(c.regiao, c.local), prox = await proximoVilao(j, c.regiao, l, st);
        if (prox && !prox.bloqueado && j.regiao_atual === c.regiao) saidas.push({ para, texto: `_Mais adiante em ${l.nome}, outra presença espera: ${VILOES.get(prox.v).nome}. Quando estiver pronto: *ir ${l.nome.toLowerCase()}*._` });
      } else if (ev.tipo === "rank") {
        saidas.push(...(await feito(j, "rank", `*${j.nome}* alcançou o *rank ${ev.rank}* (nível ${ev.nivel}).`, { grupo: mundo.grupo_wa_id })));
      } else if (ev.tipo === "derrota") {
        const v = VILOES.get(ev.vilao);
        if (["alto", "rei", "divindade"].includes(v.tier)) {
          await db.query("update jogo.mundos set relogio_eclipse = least(100, relogio_eclipse + 1) where id = $1", [j.mundo_id]);
          saidas.push(...(await feito(j, "queda", `*${j.nome}* enfrentou *${v.nome_completo}* e caiu. Ainda respira. O Eclipse avança um passo.`, { grupo: mundo.grupo_wa_id })));
        }
      }
    }
    return saidas;
  }

  // ── comandos do privado ──
  async function comando(j, t, bruto, para) {
    let m;
    const rid = j.regiao_atual;
    if (/^(locais|lugares|olhar|onde ir|cidade)$/.test(t)) {
      const st = await estado(j);
      return { tratado: true, saidas: [{ para, texto: `*${nomeRegiao(rid)}*\n\n${listaLocais(rid, st)}\n\n${rodape("ir <nº ou nome>", "falar <nome>")}` }] };
    }
    if ((m = t.match(/^(ir|vou|visitar|entrar)\s+(?:para |pra |ao |a |no |na |em )?(.+)$/)) && MUNDO[rid]) {
      const alvo = m[2];
      const r = MUNDO[rid];
      const ehLocal = /^\d+$/.test(alvo) ? Number(alvo) <= r.locais.length : r.locais.some((x) => normal(x.nome).includes(normal(alvo)) || x.id === normal(alvo));
      if (ehLocal) return { tratado: true, saidas: await ir(j, alvo, para) };
      if (m[1] !== "ir" && m[1] !== "vou") return { tratado: true, saidas: await ir(j, alvo, para) };
      return { tratado: false, saidas: [] }; // pode ser uma viagem para outra região
    }
    if ((m = bruto.trim().match(/^[!/]?(?:falar|conversar|perguntar)(?:\s+(?:com|para|pra|a|ao|à))?\s*(\S+)?\s*(.*)$/i)) && /^[!/]?(falar|conversar|perguntar)\b/i.test(bruto.trim()))
      return { tratado: true, saidas: await falar(j, m[1] ?? "", m[2] ?? "", para) };
    if (/^(missao|missoes|historia|capitulo|objetivo|diario|caminho)$/.test(t)) {
      const st = await estado(j);
      const at = capituloAtivo(rid, st);
      const feitos = [...st.P.keys()].filter((k) => k.startsWith("c:")).length;
      let texto = `*Seu caminho*\n${objetivoCampanha(st.B)}\n\n`;
      texto += at && !at.bloqueado ? `*Aqui em ${nomeRegiao(rid)}*\n${textoPasso(at.cap, at.passo)}` : at?.bloqueado ? `*Aqui em ${nomeRegiao(rid)}*\nHá uma história aqui (_${at.cap.titulo}_), mas ainda não chegou a hora dela.` : `*Aqui em ${nomeRegiao(rid)}*\nVocê já resolveu tudo o que havia por aqui.`;
      texto += `\n\n${rodape(`${feitos} de ${CAPITULO.size} capítulos`, `${st.D.size} de ${VILOES.size} vilões`, "segredos · amigos · feitos")}`;
      return { tratado: true, saidas: [{ para, texto }] };
    }
    if (/^(segredos|pistas|verdades)$/.test(t)) {
      const st = await estado(j);
      const caps = [...CAPITULO.values()].filter((c) => st.P.has(`c:${c.id}`) && c.pista);
      return { tratado: true, saidas: [{ para, texto: caps.length ? `*O que você já sabe sobre o mundo*\n\n${caps.map((c) => `_${c.titulo}_ — ${c.pista}`).join("\n\n")}\n\n${rodape(`${caps.length} segredos`, "há mais espalhados pelos reinos")}`.slice(0, 3800)
        : "Você ainda não descobriu nenhum segredo. Cada região guarda um pedaço da verdade: converse, investigue, termine o que começou." }] };
    }
    if (/^(amigos|amizades|conhecidos)$/.test(t)) {
      const rel = await db.query("select * from jogo.relacoes where jogador_id = $1 order by amizade desc limit 20", [j.id]);
      const mortos = new Set((await db.query("select npc from jogo.npcs_mortos where mundo_id = $1", [j.mundo_id])).map((x) => x.npc));
      const linhas = rel.map((x) => { const [r, n] = x.npc.split(":"), p = MUNDO[r]?.npcs[n]; return p ? `${p.nome} (${nomeRegiao(r)}) — ${mortos.has(x.npc) ? "_morta(o)_" : x.amizade >= AMIZADE.proximo ? "amizade forte" : x.amizade >= AMIZADE.amigo ? "amiga(o)" : "conhecida(o)"}` : null; }).filter(Boolean);
      return { tratado: true, saidas: [{ para, texto: linhas.length ? `*Quem você conhece*\n\n${linhas.join("\n")}` : "Você ainda não conversou com ninguém. Use *falar <nome>* nas vilas e cidades." }] };
    }
    if (/^(feitos|noticias|mural)$/.test(t)) {
      const fs = await db.query("select texto from jogo.feitos where mundo_id = $1 order by id desc limit 8", [j.mundo_id]);
      return { tratado: true, saidas: [{ para, texto: fs.length ? `*Últimos feitos do mundo*\n\n${fs.map((f) => f.texto.split("\n")[0].replace(/^[⚔️⭐🗺️ ]+/u, "")).join("\n")}` : "Nenhum feito ainda. Seja o primeiro." }] };
    }
    if (/^(vingar|vinganca|jurar vinganca|vingar-se)$/.test(t)) return { tratado: true, saidas: await vingar(j, para) };
    return { tratado: false, saidas: [] };
  }

  /** Contexto de história para o narrador (IA): capítulo e passo atuais, para ela não sair do trilho. */
  async function contextoNarrador(j) {
    const st = await estado(j);
    const at = capituloAtivo(j.regiao_atual, st);
    const r = MUNDO[j.regiao_atual];
    const l = r?.locais.find((x) => x.id === j.local_atual) ?? r?.locais[0];
    return {
      local: l ? `${l.nome}: ${l.desc}` : null,
      npcs: Object.values(r?.npcs ?? {}).map((n) => `${n.nome} (${n.papel}; ${n.jeito})`),
      capitulo: at && !at.bloqueado ? { titulo: at.cap.titulo, passo_atual: at.cap.passos[at.passo].txt, passos_ja_feitos: at.passo, total_de_passos: at.cap.passos.length } : null,
      objetivo: objetivoCampanha(st.B),
    };
  }

  return { comando, chegada, aoEventos, contextoNarrador, estado, capituloAtivo };
}

export { ambiente };
