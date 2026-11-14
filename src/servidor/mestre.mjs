// Mão invisível do mestre: o administrador age pelo PRIVADO do bot e o mundo reage como se fosse a própria história.
// Nada aqui cita o administrador: o grupo só vê o narrador. Nenhuma ação dá atributo, nível ou item de equipamento.
import { MUNDO, VILOES, CAPITULO } from "../mundo/mundo.mjs";
import { MONSTROS } from "../mundo/monstros.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
const nomeR = (rid) => REGIAO.get(rid)?.nome ?? rid;
import { AMEACA } from "./ameacas.mjs";
import { item } from "../regras/itens.mjs";
import { nomeLacaio } from "./combate.mjs";
import { imagemMapaCom } from "./exploracao.mjs";
import { acharGrimorio } from "../regras/grimorios.mjs";
import { buscarRegioes } from "../regras/exploracao.mjs";
import { rodape } from "./textos.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { um } from "./db.mjs";

export const MALDICAO = { duracaoMs: 48 * 3_600_000, resgates: 2, merito: 10 };
/** O que um amaldiçoado ainda consegue fazer (olhar, lembrar, conversar com o próprio bot). */
const LIVRE = /^(ficha|carta|status|itens|bolsa|ajuda|comandos|missao|segredos|amigos|feitos|ranking|dado|habilidades|minha historia|pet|onde estou|maldicao)\b/;

const AJUDA_MESTRE = `*Mão do mestre* (só você vê isto; o grupo vê apenas a história)

mestre maldição <nome> — o personagem fica preso num sono de cinzas até 2 companheiros o resgatarem (ou 48 h)
mestre libertar <nome> — desfaz a maldição sem alarde
mestre sussurro <nome> <texto> — uma voz misteriosa fala só com ele
mestre presságio <texto> — o narrador anuncia um sinal no grupo
mestre presente <nome> <item> — ele encontra um embrulho sem remetente (só poções, utilidades e materiais)
mestre emboscada <nome> — um lacaio da região o cerca agora
mestre monstros — lista os 20 monstros (M01 a M20)
mestre monstro <nº ou nome> <cidade> — solta um monstro numa região; quem estiver lá luta junto (golpear). Loja e descanso fecham até ele cair ou ir embora (24 h)
mestre calamidade [nº ou nome] — desperta uma Calamidade para o mundo inteiro (só com a história já desenvolvida; 48 h)
mestre espiã <nome> — uma viajante passa a acompanhar o jogador e anota o que ele faz
mestre relatório <nome> — o que a espiã viu
mestre fala <nome> <texto> — a espiã diz isso ao jogador, com as suas palavras
mestre mapa — mapa do mundo com a posição de todos (só você vê)
mestre sete luzes — abre o chamado do Grimório das Sete Luzes: os jogadores aceitam ou recusam, quem aceita enfrenta o Dragão da Aurora na Geleira Hyōga, e só um fica com o livro (eles não sabem disso até o dragão cair)
mestre sete luzes status — quem aceitou, quem recusou, vida do dragão e votos
mestre sete luzes entregar <nome> — encerra a disputa dando o livro a alguém
mestre transformar <nome> — desperta a fera de um Meio-humano, o espírito de uma Força da Natureza ou abre um Círculo Arcano de um Mago (um estágio por vez, até 3; dá habilidade nova e atributos). O grupo recebe a arte da transformação
mestre grimorios — onde está cada um dos 40 grimórios e quem já tem
mestre grimorio <nome> <nº> — entrega um grimório ao jogador (ele "encontra" o livro)
mestre tesouros — mapa de onde estão os 4 Grandes Itens, os 4 núcleos, os santuários de pet e o pergaminho da terra, e com quem cada um está
mestre mover <nome> <região> — transporta o jogador na hora, sem custo (ele vê uma passagem se abrir)
mestre mover todos <região> — transporta todos os jogadores do mundo de uma vez
mestre teleporte <nome> — dá ao jogador um Selo de Passagem (1 uso): ele escolhe o destino e paga um preço (vida, ryō ou mérito)
mestre roubo <nome> — a espiã pergunta ao jogador "você confia em mim?" (sim/não). Se ele disser sim, ela some com TODOS os itens da bolsa (grimórios e ryō ficam). Se disser não, ela vai embora de mãos vazias
mestre devolver <nome> — devolve ao jogador tudo o que a espiã levou
mestre recolher <nome> — a espiã se despede
mestre quem — lista os personagens e onde estão

_Nenhuma dessas ações dá atributo ou nível. Não use no grupo: lá o comando é ignorado para não te revelar._`;

const ESPIA = { nome: "Shiori", papel: "uma cartógrafa de estrada", maxLog: 25,
  falas: ["anota alguma coisa num caderninho de capa azul e sorri quando você olha.", "comenta, distraída: — Você sempre decide rápido assim?",
    "fica um passo atrás, desenhando o caminho de vocês num mapa.", "pergunta de onde você é, e escuta a resposta com atenção demais para quem só puxa conversa.",
    "ajeita a alça da bolsa e diz que nunca viu ninguém viajar do seu jeito."] };

export function criarMestre({ db, agora, ameacas = null, grimorios = null, seteLuzes = null, fera = null }) {
  const gravar = (j, chave, valor) => db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, $2, $3, $4)
    on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, chave, JSON.stringify(valor), new Date(agora())]);
  const jogadores = () => db.query(`select j.*, i.wa_jid, i.wa_lid, m.grupo_wa_id from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id
    join jogo.mundos m on m.id = j.mundo_id where m.status = 'ativo' and j.estado = 'ativo' order by j.atualizado_em desc`);
  const privado = (x) => x.wa_jid ?? x.wa_lid ?? null;
  const achar = (todos, nome) => { const n = semAcento(nome.trim().toLowerCase()); return n.length < 2 ? null : todos.find((x) => x.nome_normalizado === n) ?? todos.find((x) => x.nome_normalizado.startsWith(n)) ?? null; };
  /** Separa "<nome> <resto>" tentando o nome mais longo que bata com um personagem. */
  function nomeEResto(todos, texto) {
    const p = texto.trim().split(/\s+/);
    for (let k = Math.min(p.length, 4); k >= 1; k--) { const alvo = achar(todos, p.slice(0, k).join(" ")); if (alvo && (k > 1 || alvo.nome_normalizado.split(" ")[0] === semAcento(p[0].toLowerCase()) || alvo.nome_normalizado.startsWith(semAcento(p[0].toLowerCase())))) return { alvo, resto: p.slice(k).join(" ") }; }
    return { alvo: null, resto: texto };
  }

  async function maldicaoDe(j) {
    const m = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'maldicao'", [j.id]))?.valor;
    if (!m) return null;
    if (agora() >= Number(m.ate)) { await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'maldicao'", [j.id]); return { ...m, expirou: true }; }
    return m;
  }

  /** Chamado antes de qualquer ação no privado: devolve null (segue o jogo) ou as saídas que bloqueiam. */
  async function bloqueio(j, t, para) {
    const m = await maldicaoDe(j);
    if (!m) return null;
    if (m.expirou) return { segue: true, saidas: [{ para, texto: "As cinzas escorrem da sua pele como areia. O sono acabou sozinho — fraco demais para durar.\n" + rodape("você está livre") }] };
    if (LIVRE.test(t) && !/^maldicao/.test(t)) return null;
    const faltam = Math.max(1, Number(m.precisa) - (m.resgates ?? []).length);
    return { saidas: [{ para, texto: `Você tenta se mover. O corpo não responde: há cinza fria nas suas veias, e o mundo chega de longe, como debaixo d'água.\n\nSozinho, você não sai disso. ${faltam === 1 ? "Falta um companheiro" : `Faltam ${faltam} companheiros`} estender a mão: no grupo, *resgatar ${j.nome.split(" ")[0]}*.\n${rodape("você ainda pode ver ficha, itens, missao e segredos", "sem resgate, o sono se desfaz em até 48 horas")}` }] };
  }

  /** resgatar <nome>: no grupo ou no privado. Cada jogador só conta uma vez. */
  async function resgatar(autor, nome, para) {
    if (!autor) return [{ para, texto: "Você ainda não tem personagem neste mundo." }];
    const todos = (await jogadores()).filter((x) => String(x.mundo_id) === String(autor.mundo_id));
    const alvo = achar(todos, nome);
    if (!alvo) return [{ para, texto: "Resgatar quem? Use *resgatar <nome>*." }];
    const m = await maldicaoDe(alvo);
    if (!m || m.expirou) return [{ para, texto: `*${alvo.nome}* não precisa de resgate.` }];
    if (String(alvo.id) === String(autor.id)) return [{ para, texto: "Você não consegue puxar a si mesmo para fora do sono." }];
    if ((await maldicaoDe(autor)) && !(await maldicaoDe(autor)).expirou) return [{ para, texto: "Você mesmo está preso no sono de cinzas." }];
    const resgates = [...new Set([...(m.resgates ?? []), Number(autor.id)])];
    if (resgates.length === (m.resgates ?? []).length) return [{ para, texto: `*${autor.nome}* já estendeu a mão. Falta outra pessoa.` }];
    const grupo = alvo.grupo_wa_id;
    if (resgates.length < Number(m.precisa)) {
      await gravar(alvo, "maldicao", { ...m, resgates });
      const txt = `*${autor.nome}* segura a mão fria de *${alvo.nome}* e chama o nome dele. As cinzas estremecem, mas não soltam.\n_Falta mais ${Number(m.precisa) - resgates.length} para quebrar o sono: resgatar ${alvo.nome.split(" ")[0]}_`;
      return [{ para: grupo ?? para, texto: txt }];
    }
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'maldicao'", [alvo.id]);
    await db.query("update jogo.jogadores set merito = merito + $2 where id = any($1)", [resgates, MALDICAO.merito]);
    const nomes = todos.filter((x) => resgates.includes(Number(x.id))).map((x) => `*${x.nome}*`).join(" e ");
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'resgate', $3, $4)", [alvo.mundo_id, alvo.id, `${nomes.replace(/\*/g, "")} quebraram o sono de cinzas de ${alvo.nome}.`, new Date(agora())]);
    return [{ para: grupo ?? para, texto: `⭐ *O sono de cinzas se quebrou.*\n\n${nomes} não soltaram. As cinzas caem de *${alvo.nome}* de uma vez, e ele puxa o ar como quem volta do fundo de um lago.\n${rodape(`+${MALDICAO.merito} de mérito para quem resgatou`)}` },
      ...(privado(alvo) ? [{ para: privado(alvo), texto: `Uma mão quente fecha na sua. Depois outra. Alguém diz o seu nome — e desta vez você consegue responder.\n\nVocê está livre. ${nomes} vieram te buscar.` }] : [])];
  }

  /** Comandos do mestre, só no privado e só para quem está em ADMINS. Devolve null se não for comando do mestre. */
  async function comando(msg, t) {
    const m = t.match(/^[!/]?mestre\b\s*(\S+)?\s*(.*)$/);
    if (!m) return null;
    const para = msg.chat, dizer = (texto) => [{ para, texto }];
    const acao = m[1] ?? "", resto = msg.texto.trim().replace(/^[!/]?\s*mestre\s+\S+\s*/i, "");
    const todos = await jogadores();
    if (!acao || /^(ajuda|comandos)$/.test(acao)) return dizer(AJUDA_MESTRE);
    if (acao === "mapa") {
      if (!todos.length) return dizer("Nenhum personagem ativo.");
      const porRegiao = new Map();
      for (const x of todos) porRegiao.set(x.regiao_atual, [...(porRegiao.get(x.regiao_atual) ?? []), x]);
      const lugares = [...porRegiao.entries()];
      const legenda = lugares.map(([rid, js], k) => `*${String.fromCharCode(65 + k)}* ${nomeR(rid)} — ${js.map((x) => `${x.nome} (nv ${x.nivel})`).join(", ")}`).join("\n");
      return [{ para, imagem: imagemMapaCom(lugares.map(([regiao], k) => ({ regiao, rotulo: String.fromCharCode(65 + k) }))), legenda: `*Onde cada um está*\n_bandeiras vermelhas com letra_\n\n${legenda}` }];
    }
    if (/^(tesouros|tesouro|grandes|reliquias|lendarios)$/.test(acao)) {
      // mundo do mestre = o que tem mais jogadores ativos
      const cont = new Map(); for (const x of todos) cont.set(String(x.mundo_id), (cont.get(String(x.mundo_id)) ?? 0) + 1);
      const mid = [...cont.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const donos = mid ? await db.query(`select i.item_id, j.nome, j.regiao_atual, i.equipado from jogo.inventario i join jogo.jogadores j on j.id = i.jogador_id
        where j.mundo_id = $1 and i.item_id = any($2)`, [mid, ["excalibur", "kokugai", "tenmon", "shitencho", "pergaminho-terra"]]) : [];
      const nucleos = mid ? await db.query("select n.nucleo, n.estado, j.nome from jogo.nucleos n left join jogo.jogadores j on j.id = n.jogador_id where n.mundo_id = $1", [mid]) : [];
      const feitos = new Set(mid ? (await db.query("select distinct p.chave from jogo.progresso p join jogo.jogadores j on j.id = p.jogador_id where j.mundo_id = $1 and p.chave like 'c:%'", [mid])).map((x) => x.chave.slice(2)) : []);
      const pets = mid ? await db.query("select p.pet_id, j.nome from jogo.pets p join jogo.jogadores j on j.id = p.jogador_id where j.mundo_id = $1", [mid]) : [];
      const dono = (id) => { const d = donos.filter((x) => x.item_id === id); return d.length ? `com *${d.map((x) => `${x.nome}${x.equipado ? " (em uso)" : ""}`).join(", ")}*, em ${nomeR(d[0].regiao_atual)}` : null; };
      const cap = (id) => CAPITULO.get(id), onde = (id) => `${nomeR(cap(id).regiao)} — capítulo _${cap(id).titulo}_ (nível ${cap(id).nivel})`;
      const NOME_N = { rubro: "Núcleo Rubro", abissal: "Núcleo Abissal", raiz: "Núcleo Raiz", celeste: "Núcleo Celeste" };
      const ceus = ["hom1-ceu", "wat7", "dai1-ceu", "fuj7"];
      const pontos = [], linhas = [];
      // uma bandeira por região: se dois tesouros ficam no mesmo lugar, dividem a letra
      const marca = (regiao, texto) => { let pnt = pontos.find((x) => x.regiao === regiao); if (!pnt) { pnt = { regiao, rotulo: String.fromCharCode(65 + pontos.length) }; pontos.push(pnt); } linhas.push(`*${pnt.rotulo}* ${texto}`); };
      linhas.push("*Os 4 Grandes Itens*");
      for (const [id, capId] of [["excalibur", "fuj3-espada"], ["tenmon", "fuj5"], ["kokugai", "kok3"]])
        marca(cap(capId).regiao, `${item(id).nome.split(",")[0]}: ${dono(id) ?? (feitos.has(capId) ? "capítulo concluído, item fora das bolsas" : `ainda em ${onde(capId)}`)}`);
      linhas.push(`_Shitenchō, o Grimório dos Quatro Céus_: ${dono("shitencho") ?? `aparece para quem concluir os quatro Céus (${ceus.filter((c) => feitos.has(c)).length} de 4 feitos no mundo)`}`);
      for (const c of ceus) marca(cap(c).regiao, `Céu do grimório: ${onde(c)}${feitos.has(c) ? " — concluído" : ""}`);
      linhas.push("", "*Os 4 núcleos da Árvore-Estrela*");
      for (const c of [...CAPITULO.values()].filter((x) => x.da?.nucleo)) { const n = nucleos.find((x) => x.nucleo === c.da.nucleo);
        marca(c.regiao, `${NOME_N[c.da.nucleo]}: ${n ? `${n.estado}${n.nome ? ` a *${n.nome}*` : ""}` : `com o rei, em ${onde(c.id)}`}`); }
      linhas.push("", "*Santuários de pet*");
      for (const c of ["hom2", "wat6", "dai2", "fuj2"]) if (cap(c)) marca(cap(c).regiao, `${onde(c)}${feitos.has(c) ? " — já visitado" : ""}`);
      linhas.push(pets.length ? `_Pets no mundo: ${pets.map((p) => `${p.nome} (${p.pet_id})`).join(", ")}_` : "_Ninguém tem pet ainda._");
      linhas.push("", "*Pergaminho dos Olhos da Terra*");
      marca("R-DAI-6", `com a Mestra Tsuchi, em ${nomeR("R-DAI-6")} (ela entrega a quem é da terra)${dono("pergaminho-terra") ? `; uma cópia ${dono("pergaminho-terra")}` : ""}`);
      const texto = `*Tesouros do mundo* _(só você vê)_\n_bandeiras vermelhas com letra_\n\n${linhas.join("\n")}`;
      // a legenda do WhatsApp tem limite: manda a imagem com o título e o detalhe em texto
      return [{ para, imagem: imagemMapaCom(pontos), legenda: "*Tesouros do mundo* — legenda na mensagem seguinte" }, { para, texto }];
    }
    if (/^sete$/.test(acao) && seteLuzes) {
      const cont = new Map(); for (const x of todos) cont.set(String(x.mundo_id), (cont.get(String(x.mundo_id)) ?? 0) + 1);
      const mid = [...cont.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const sub = semAcento(resto.toLowerCase()).replace(/^luzes\s*/, "").trim();
      if (/^status$/.test(sub)) return dizer(await seteLuzes.status(mid));
      if (/^entregar\b/.test(sub)) {
        const quem = achar(todos, sub.replace(/^entregar\s*/, ""));
        if (!quem) return dizer("Entregar a quem? Use: mestre sete luzes entregar <nome>");
        const r = await seteLuzes.entregarPeloMestre(mid, quem.id);
        return r ? [...r, ...dizer(`Feito. ${quem.nome} ficou com o grimório.`)] : dizer("Não há disputa aberta agora (o dragão ainda não caiu, ou o livro já tem dono).");
      }
      const r = await seteLuzes.iniciar(mid);
      return r.erro ? dizer(r.erro) : [...r.saidas, ...dizer("Feito. O chamado foi feito no grupo. Acompanhe com: mestre sete luzes status")];
    }
    if (/^grimorios$/.test(acao) && grimorios) {
      const cont = new Map(); for (const x of todos) cont.set(String(x.mundo_id), (cont.get(String(x.mundo_id)) ?? 0) + 1);
      const txt = await grimorios.relatorio([...cont.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null);
      const linhas = txt.split("\n");
      return [{ para, texto: `*Os ${linhas.length} grimórios* _(só você vê)_\n\n${linhas.slice(0, 20).join("\n")}` }, { para, texto: linhas.slice(20).join("\n") }];
    }
    if (acao === "quem") return dizer(todos.length ? todos.map((x) => `*${x.nome}* — ${x.classe}, nível ${x.nivel}, em ${nomeR(x.regiao_atual)}`).join("\n") : "Nenhum personagem ativo.");

    if (/^monstros$/.test(acao)) return dizer(`*Monstros* (grau 1 a 3 para cidades; grau 4 são Calamidades)\n\n${MONSTROS.filter((x) => !x.evento).map((x) => `*${x.id.slice(1)}* ${x.nome}, ${x.titulo} — grau ${x.grau}, ${x.elemento}`).join("\n")}`);
    const acharMonstro = (txt) => { const n = semAcento(txt.toLowerCase()).trim(); return MONSTROS.filter((x) => !x.evento).find((x) => x.id.toLowerCase() === n || x.id.slice(1) === n.padStart(2, "0")) ?? (n.length >= 3 ? MONSTROS.find((x) => semAcento(x.nome.toLowerCase()).startsWith(n)) : null) ?? null; };
    // o mundo do mestre: o que tem mais jogadores ativos
    const porMundo = new Map(); for (const x of todos) porMundo.set(String(x.mundo_id), (porMundo.get(String(x.mundo_id)) ?? 0) + 1);
    const mundoId = [...porMundo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    if (/^monstro$/.test(acao) && ameacas) {
      const p = resto.trim().split(/\s+/), mon = acharMonstro(p[0] ?? "");
      const lugar = semAcento(p.slice(1).join(" ").toLowerCase());
      const rid = lugar ? Object.keys(MUNDO).find((k) => semAcento(nomeR(k).toLowerCase()) === lugar) ?? Object.keys(MUNDO).find((k) => semAcento(nomeR(k).toLowerCase()).includes(lugar)) : null;
      if (!mon || !rid) return dizer("Use: mestre monstro <nº ou nome> <cidade>. Ex.: mestre monstro 6 Kyōkai. Veja a lista com *mestre monstros*.");
      if (mon.grau === 4) return dizer(`${mon.nome} é grande demais para uma cidade só. Use: mestre calamidade ${mon.id.slice(1)}`);
      if (!mundoId) return dizer("Não há mundo ativo com jogadores.");
      if ((await db.query("select 1 from jogo.ameacas where mundo_id = $1 and estado = 'ativa' and regiao = $2 and termina_em > $3", [mundoId, rid, new Date(agora())])).length) return dizer(`Já há um monstro em ${nomeR(rid)}.`);
      const r = await ameacas.invocar(mundoId, mon.id, "monstro", rid);
      return r.erro ? dizer(r.erro) : [...r.saidas, ...dizer(`Feito. ${mon.nome} está em ${nomeR(rid)} (vida ${r.ameaca.hp_max}, nível ${r.ameaca.nivel}).`)];
    }
    if (/^calamidade$/.test(acao) && ameacas) {
      if (!mundoId) return dizer("Não há mundo ativo com jogadores.");
      const n = await ameacas.capitulosDoMundo(mundoId);
      if (n < AMEACA.capitulosParaCalamidade) return dizer(`A história ainda está no começo: ${n} de ${AMEACA.capitulosParaCalamidade} capítulos vividos no mundo. Uma Calamidade agora atropelaria a campanha. Para algo menor, use *mestre monstro*.`);
      if ((await db.query("select 1 from jogo.ameacas where mundo_id = $1 and estado = 'ativa' and tipo = 'calamidade' and termina_em > $2", [mundoId, new Date(agora())])).length) return dizer("Já há uma Calamidade ativa.");
      const grandes = MONSTROS.filter((x) => x.grau === 4), mon = resto.trim() ? acharMonstro(resto) : grandes[Math.floor(agora() / 86_400_000) % grandes.length];
      if (!mon || mon.grau !== 4) return dizer(`Calamidades: ${grandes.map((x) => `${x.id.slice(1)} ${x.nome}`).join(", ")}.`);
      const r = await ameacas.invocar(mundoId, mon.id, "calamidade", null, { mestre: true });
      return r.erro ? dizer(r.erro) : [...r.saidas, ...dizer(`Feito. ${mon.nome} despertou (vida ${r.ameaca.hp_max}).`)];
    }
    if (/^(mover|transportar|levar|trazer)$/.test(acao)) {
      const p = resto.trim().split(/\s+/), geral = /^(todos|todas|todo mundo|geral)$/i.test(semAcento((p[0] ?? "").toLowerCase()));
      const { alvo: um1, resto: lugar1 } = geral ? { alvo: null, resto: p.slice(1).join(" ") } : nomeEResto(todos, resto);
      if (!geral && !um1) return dizer("Não achei esse personagem. Use: mestre mover <nome> <região> ou mestre mover todos <região>.");
      const achadas = lugar1.trim() ? buscarRegioes(lugar1) : [];
      const destino = achadas.length === 1 ? achadas[0] : achadas.find((r) => semAcento(r.nome.toLowerCase()) === semAcento(lugar1.trim().toLowerCase()));
      if (!destino) return dizer(achadas.length > 1 ? `Há mais de um lugar com esse nome: ${achadas.slice(0, 6).map((r) => r.nome).join(", ")}. Diga o nome inteiro.` : "Para onde? Diga o nome da região (os nomes aparecem em *mestre mapa*).");
      const alvos = geral ? todos.filter((x) => String(x.mundo_id) === String(mundoId)) : [um1];
      const movidos = [], fora = [];
      for (const x of alvos) {
        if (x.regiao_atual === destino.id) { fora.push(`${x.nome} (já está lá)`); continue; }
        if ((await db.query("select 1 from jogo.batalhas b join jogo.participantes_batalha pb on pb.batalha_id = b.id where pb.jogador_id = $1 and b.status <> 'encerrada' limit 1", [x.id])).length) { fora.push(`${x.nome} (em luta)`); continue; }
        await db.query("update jogo.viagens set concluida_em = $2 where jogador_id = $1 and concluida_em is null", [x.id, new Date(agora())]);
        await db.query("delete from jogo.exploracoes where jogador_id = $1 and pendente", [x.id]);
        await db.query("delete from jogo.progresso where jogador_id = $1 and chave in ('falando', 'acomp')", [x.id]);
        await db.query("update jogo.jogadores set regiao_atual = $2, local_atual = null where id = $1", [x.id, destino.id]);
        movidos.push({ ...x, regiao_atual: destino.id, local_atual: null });
      }
      const saidas = [];
      for (const x of movidos) if (privado(x)) saidas.push({ para: privado(x), texto: geral
        ? "O chão some debaixo dos seus pés. Por um instante você vê o mundo inteiro de cima, pequeno como um mapa — e vê que não está caindo sozinho.\n\nQuando o ar volta, você está em outro lugar."
        : "O ar na sua frente se rasga sem barulho, como pano velho. Do outro lado há outro céu.\n\nVocê não lembra de ter dado o passo. Mas deu." });
      if (geral && movidos.length && movidos[0].grupo_wa_id) saidas.push({ para: movidos[0].grupo_wa_id, texto: `_Por um instante, todas as estrelas de Yotsuhoshi piscam ao mesmo tempo._\n\nQuando voltam a acender, os aventureiros não estão mais onde estavam. Todos acordam no mesmo lugar: *${destino.nome}*.\n\nNinguém sabe quem os chamou.` });
      saidas.push({ para, texto: `Feito. Em ${destino.nome}: ${movidos.map((x) => x.nome).join(", ") || "ninguém"}.${fora.length ? `\nNão movidos: ${fora.join(", ")}.` : ""}` });
      saidas.chegadas = movidos; // o jogo mostra o lugar para cada um
      return saidas;
    }
    if (/^pressagio$/.test(acao)) {
      const grupos = [...new Set(todos.map((x) => x.grupo_wa_id).filter(Boolean))];
      if (!resto) return dizer("Use: mestre presságio <texto>");
      if (!grupos.length) return dizer("Não há mundo ativo com jogadores.");
      return [...grupos.map((g) => ({ para: g, texto: `_Por um instante, o céu de Yotsuhoshi muda de cor. Quem estava olhando, viu._\n\n${resto.slice(0, 600)}` })), ...dizer("Feito. O sinal apareceu no grupo.")];
    }

    const { alvo, resto: extra } = nomeEResto(todos, resto);
    if (!alvo) return dizer("Não achei esse personagem. Veja os nomes com *mestre quem*.");
    const pv = privado(alvo), primeiro = alvo.nome.split(" ")[0];

    if (/^(maldicao|amaldicoar|maldizer)$/.test(acao)) {
      const outros = todos.filter((x) => String(x.mundo_id) === String(alvo.mundo_id) && String(x.id) !== String(alvo.id)).length;
      if (!outros) return dizer("Não há mais ninguém neste mundo para resgatá-lo. A maldição não foi lançada.");
      const precisa = Math.min(MALDICAO.resgates, outros);
      await gravar(alvo, "maldicao", { desde: agora(), ate: agora() + MALDICAO.duracaoMs, precisa, resgates: [] });
      return [
        ...(pv ? [{ para: pv, texto: `O ar esfria de repente. Uma cinza fina, que não vem de fogo nenhum, começa a cair só em cima de você.\n\nQuando você tenta limpar o ombro, o braço não obedece. Depois as pernas. Depois a voz.\n\n*Você caiu no sono de cinzas.* Você ouve o mundo, mas não consegue tocá-lo.\n${rodape(`${precisa === 1 ? "um companheiro precisa" : `${precisa} companheiros precisam`} te resgatar`, `no grupo: resgatar ${primeiro}`)}` }] : []),
        ...(alvo.grupo_wa_id ? [{ para: alvo.grupo_wa_id, texto: `⚠️ *Um sono de cinzas caiu sobre ${alvo.nome}.*\n\nNinguém viu de onde veio. Em ${nomeR(alvo.regiao_atual)}, *${alvo.nome}* está de pé, de olhos abertos, coberto por uma cinza fria — e não responde.\n\nDizem que esse sono só se quebra quando alguém que se importa chama a pessoa de volta.\n${rodape(`${precisa === 1 ? "basta 1 jogador" : `são precisos ${precisa} jogadores`}: resgatar ${primeiro}`)}` }] : []),
        ...dizer(`Feito. ${alvo.nome} está sob o sono de cinzas (${precisa} resgate${precisa > 1 ? "s" : ""}, ou 48 h).`),
      ];
    }
    if (/^(espia|espiar|espiao)$/.test(acao)) {
      await gravar(alvo, "espia", { nome: ESPIA.nome, desde: agora(), log: [] });
      return [...(pv ? [{ para: pv, texto: `Na saída da estrada, uma moça de capa de viagem e dedos manchados de tinta te alcança.\n\n— Desculpa o incômodo. Sou ${ESPIA.nome}, ${ESPIA.papel}. Estou mapeando essas bandas e você parece saber aonde vai. Posso andar com você um tempo? Não atrapalho.\n\nEla já está andando ao seu lado antes de você responder.` }] : []), ...dizer(`Feito. ${ESPIA.nome} acompanha ${alvo.nome}. Veja o que ela anotou com: mestre relatório ${primeiro}`)];
    }
    if (/^(relatorio|relato)$/.test(acao)) {
      const e = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'espia'", [alvo.id]))?.valor;
      if (!e) {
        const fim = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'espia-fim'", [alvo.id]))?.valor;
        return dizer(fim ? `Ninguém acompanha ${alvo.nome} agora. Da última vez: ele respondeu *${fim.resposta}* e ela ${fim.levou ? `levou ${fim.levou} tipo${fim.levou > 1 ? "s" : ""} de item (devolver: mestre devolver ${primeiro})` : "foi embora de mãos vazias"}.` : `Ninguém está acompanhando ${alvo.nome}. Use: mestre espiã ${primeiro}`);
      }
      const inv = await db.query("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1 order by equipado desc, qtd desc limit 8", [alvo.id]);
      const hora = (ms) => new Date(ms - 3 * 3_600_000).toISOString().slice(5, 16).replace("T", " ");
      return dizer(`*Relatório de ${e.nome}* — ${alvo.nome}\n\n${alvo.classe}, nível ${alvo.nivel} · vida ${alvo.hp}/${alvo.hp_max} · ${alvo.ryo} ryō · corrupção ${Number(alvo.corrupcao ?? 0)}\nEstá em ${nomeR(alvo.regiao_atual)}.\nLeva: ${inv.map((l) => `${item(l.item_id)?.nome ?? l.item_id}${l.qtd > 1 ? ` ×${l.qtd}` : ""}${l.equipado ? " (em uso)" : ""}`).join(", ") || "nada"}.\n\n` +
        `*O que ele fez* (horário de Brasília)\n${(e.log ?? []).map((l) => `${hora(l.q)} · ${nomeR(l.r)} · ${l.t}`).join("\n") || "Nada ainda."}`);
    }
    if (/^grimorio$/.test(acao) && grimorios) {
      const g = acharGrimorio(extra);
      if (!g) return dizer("Qual grimório? Use o número (1 a 40) ou parte do nome. Veja a lista com *mestre grimorios*.");
      const s = await grimorios.entregar(alvo, g, pv ?? para, "Você acorda com um livro debaixo do braço que não estava lá ontem. A capa está morna.\n\n*Você encontrou um grimório.*");
      if (!s.length) return dizer(`${alvo.nome} já tem ${g.nome}.`);
      return [...(pv ? s : []), ...dizer(`Feito. ${alvo.nome} recebeu ${g.nome}.`)];
    }
    if (/^(transformar|transformacao|despertar|fera)$/.test(acao) && fera) {
      const r = await fera.transformar(alvo, pv ?? para, { forcar: true });
      if (r.erro) return dizer(r.erro);
      return [...r.saidas.filter((x) => pv || x.para !== para), ...dizer(`Feito. ${alvo.nome} está no ${r.estagio}º despertar.`)];
    }
    if (/^(fala|falar|dizer)$/.test(acao)) {
      const e = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'espia'", [alvo.id]))?.valor;
      if (!e) return dizer(`Ninguém está acompanhando ${alvo.nome}. Primeiro: mestre espiã ${primeiro}`);
      if (!extra) return dizer(`Use: mestre fala ${primeiro} <o que ela diz>`);
      if (!pv) return dizer("Esse jogador ainda não abriu o privado com o bot.");
      return [{ para: pv, texto: `${e.nome} encosta ao seu lado e fala baixo:\n— ${extra.slice(0, 500)}` }, ...dizer(`Feito. ${e.nome} disse isso a ${alvo.nome}.`)];
    }
    if (/^(teleporte|teletransporte|selo|passagem)$/.test(acao)) {
      await gravar(alvo, "teleporte", { usos: 1, destino: null });
      return [...(pv ? [{ para: pv, texto: `Você acorda com um peso estranho na palma da mão: um selo de pedra clara, morno, com um desenho de porta que você nunca viu.\n\nNinguém sabe dizer de onde veio. Mas você sabe, sem saber como, o que ele faz: *abre uma passagem para qualquer lugar do mundo, uma única vez*. E sabe também que portas assim nunca abrem de graça.\n${rodape("teleportar <lugar> para ver o preço")}` }] : []), ...dizer(`Feito. ${alvo.nome} recebeu um Selo de Passagem.`)];
    }
    if (/^(roubo|roubar|golpe|trair)$/.test(acao)) {
      const e = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'espia'", [alvo.id]))?.valor;
      if (!e) return dizer(`Ninguém está acompanhando ${alvo.nome}. Primeiro: mestre espiã ${primeiro}`);
      if (!pv) return dizer("Esse jogador ainda não abriu o privado com o bot.");
      await gravar(alvo, "espia-pergunta", { em: agora(), nome: e.nome });
      return [{ para: pv, texto: `${e.nome} para de desenhar. Fecha o caderninho azul devagar, e pela primeira vez olha direto para você.\n\n— Posso te perguntar uma coisa? A gente anda junto faz um tempo. *Você confia em mim?*\n\n*sim* · *não*` },
        ...dizer(`Feito. ${e.nome} fez a pergunta a ${alvo.nome}. O resultado aparece em: mestre relatório ${primeiro}`)];
    }
    if (/^(devolver|restituir)$/.test(acao)) {
      const r = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'roubado'", [alvo.id]))?.valor;
      if (!r?.itens?.length) return dizer(`Não há nada de ${alvo.nome} para devolver.`);
      for (const it of r.itens) await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, equipado, dados) values ($1, $2, $3, $4, false, $5)
        on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + excluded.qtd`, [alvo.id, it.item_id, it.tipo, it.qtd, JSON.stringify(it.dados ?? {})]);
      await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'roubado'", [alvo.id]);
      return [...(pv ? [{ para: pv, texto: `Você acorda com um peso conhecido ao lado da cabeça: a sua bolsa. Tudo dentro, até o que você já tinha dado por perdido. Em cima, um bilhete sem assinatura, com letra de quem desenha mapas:\n\n_"Desculpa. Não era pra ser você."_\n${rodape("seus itens voltaram", "veja em itens e equipe de novo o que quiser")}` }] : []), ...dizer(`Feito. ${r.itens.length} tipo(s) de item devolvidos a ${alvo.nome}.`)];
    }
    if (/^(recolher|dispensar)$/.test(acao)) {
      const tinha = await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'espia' returning 1", [alvo.id]);
      if (!tinha.length) return dizer(`Ninguém está acompanhando ${alvo.nome}.`);
      return [...(pv ? [{ para: pv, texto: `${ESPIA.nome} fecha o caderninho azul.\n— Meu mapa acaba aqui. Obrigada pela companhia. Você foi… instrutivo.\n\nEla toma a estrada de volta sem olhar para trás.` }] : []), ...dizer(`Feito. ${ESPIA.nome} deixou ${alvo.nome}.`)];
    }
    if (/^(libertar|liberar|soltar)$/.test(acao)) {
      const tinha = await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'maldicao' returning 1", [alvo.id]);
      if (!tinha.length) return dizer(`${alvo.nome} não está amaldiçoado.`);
      return [...(pv ? [{ para: pv, texto: "As cinzas escorrem da sua pele como areia. Ninguém te chamou — o sono simplesmente desistiu.\n" + rodape("você está livre") }] : []), ...dizer(`Feito. ${alvo.nome} está livre.`)];
    }
    if (/^(sussurro|sussurrar|voz)$/.test(acao)) {
      if (!extra) return dizer("Use: mestre sussurro <nome> <texto>");
      if (!pv) return dizer("Esse jogador ainda não abriu o privado com o bot.");
      return [{ para: pv, texto: `_Uma voz que não é sua atravessa o seu pensamento, baixa e sem pressa:_\n\n— ${extra.slice(0, 500)}\n\n_Quando você olha em volta, não há ninguém._` }, ...dizer("Feito. Só ele ouviu.")];
    }
    if (/^(presente|embrulho)$/.test(acao)) {
      const chave = semAcento(extra.toLowerCase()).trim();
      const it = item(chave) ?? ["pocao", "pocao-mana", "elixir", "racao", "bandagem", "bomba-fumaca", "pergaminho-retorno", "mat-obsidiana", "mat-perola", "mat-cristal", "mat-pluma", "mat-pedra"]
        .map(item).find((x) => chave && semAcento(x.nome.toLowerCase()).includes(chave));
      if (!it || !["consumivel", "material"].includes(it.tipo)) return dizer("Só poções, utilidades e materiais. Ex.: mestre presente Rin elixir");
      await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, $3, 1, '{}')
        on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 1`, [alvo.id, it.id, it.tipo]);
      return [...(pv ? [{ para: pv, texto: `Entre as suas coisas há um embrulho de pano que você não lembra de ter guardado. Sem bilhete, sem remetente.\n\nDentro: *${it.nome}*.\n${rodape("está na sua bolsa")}` }] : []), ...dizer(`Feito. ${alvo.nome} recebeu ${it.nome}.`)];
    }
    if (/^(emboscada|emboscar)$/.test(acao)) {
      const r = MUNDO[alvo.regiao_atual];
      const vid = (r?.locais ?? []).flatMap((l) => l.viloes ?? [])[0] ?? [...VILOES.values()].find((v) => v.tier === "comum")?.id;
      const v = VILOES.get(vid);
      if (!v) return dizer("Não há o que mandar contra ele ali.");
      if ((await db.query("select 1 from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id where p.jogador_id = $1 and b.status <> 'encerrada' limit 1", [alvo.id])).length) return dizer(`${alvo.nome} já está numa luta.`);
      const tempo = agora();
      await db.query("delete from jogo.exploracoes where jogador_id = $1 and pendente", [alvo.id]);
      const dados = { inimigo: { id: v.id, nome: nomeLacaio(v), nivel: Math.max(1, alvo.nivel) }, lacaio: true, nivelJogador: alvo.nivel };
      await db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em) values ($1, $2, $3, 'encontro', $4, true, $5)`,
        [alvo.id, `mestre:${alvo.id}:${tempo}`, alvo.regiao_atual, JSON.stringify(dados), new Date(tempo)]);
      return [...(pv ? [{ para: pv, texto: `⚠️ Os pássaros param de cantar. Quando você percebe, já é tarde: *${dados.inimigo.nome}* sai de trás de você, e não veio conversar.\n\n*lutar* · *recuar*\n${rodape(`nível ${dados.inimigo.nivel}`)}` }] : []), ...dizer(`Feito. ${alvo.nome} foi emboscado por ${dados.inimigo.nome}.`)];
    }
    return dizer(AJUDA_MESTRE);
  }

  /** Se há uma espiã com o jogador, anota o que ele fez. De vez em quando ela aparece na cena (para parecer só uma companheira). */
  async function observar(j, texto, para) {
    const e = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'espia'", [j.id]))?.valor;
    if (!e || !texto.trim()) return [];
    const log = [...(e.log ?? []), { q: agora(), r: j.regiao_atual, t: texto.trim().slice(0, 70) }].slice(-ESPIA.maxLog);
    const n = Number(e.n ?? 0) + 1;
    await gravar(j, "espia", { ...e, log, n });
    return n % 6 === 0 ? [{ para, texto: `_${e.nome} ${ESPIA.falas[(n / 6) % ESPIA.falas.length | 0]}_` }] : [];
  }

  // ── Selo de Passagem: o jogador escolhe o destino e paga um preço ──
  const PRECOS = {
    vida: { nome: "sangue", texto: (j) => `metade da sua vida máxima (${Math.floor(j.hp_max / 2)})`, pode: (j) => j.hp > j.hp_max / 2, falta: "Você não tem vida suficiente para pagar em sangue." },
    ryo: { nome: "ouro", texto: (j) => `${60 * j.nivel} ryō`, pode: (j) => Number(j.ryo) >= 60 * j.nivel, falta: "Você não tem ryō suficiente." },
    merito: { nome: "nome", texto: () => "20 de mérito (um pouco do que o mundo lembra de você)", pode: (j) => Number(j.merito) >= 20, falta: "O mundo ainda lembra pouco de você: falta mérito." },
  };
  /** Comandos do jogador ligados ao selo. Devolve { tratado, saidas, mudouRegiao }. */
  async function passagem(j, t, para) {
    const m = t.match(/^(?:teleportar|teletransportar|atravessar|usar selo(?! arcano))\s*(?:para |pra |a |ao |à )?(.*)$/), pg = t.match(/^pagar\s*(?:com |em )?(vida|sangue|ryo|ouro|merito|nome|memoria)?$/);
    if (!m && !pg) return { tratado: false, saidas: [] };
    const dizer = (texto) => ({ tratado: true, saidas: [{ para, texto }] });
    const selo = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'teleporte'", [j.id]))?.valor;
    if (!selo || Number(selo.usos) < 1) return m ? dizer("Você não tem como abrir uma passagem. Dizem que existem selos que fazem isso, mas ninguém sabe quem os entrega.") : { tratado: false, saidas: [] };
    const ocupado = (await db.query("select 1 from jogo.viagens where jogador_id = $1 and concluida_em is null union all select 1 from jogo.exploracoes where jogador_id = $1 and pendente", [j.id])).length
      || (await db.query("select 1 from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id where p.jogador_id = $1 and b.status <> 'encerrada' limit 1", [j.id])).length;
    if (ocupado) return dizer("O selo fica frio na sua mão. Ele não abre no meio de uma luta, de um encontro ou de uma viagem.");
    const precos = () => Object.entries(PRECOS).map(([k, p]) => `*pagar ${k === "merito" ? "merito" : k}* — ${p.texto(j)}${p.pode(j) ? "" : " _(você não tem)_"}`).join("\n");
    if (m) {
      const achadas = m[1].trim() ? buscarRegioes(m[1]) : [];
      const destino = achadas.length === 1 ? achadas[0] : achadas.find((r) => semAcento(r.nome.toLowerCase()) === semAcento(m[1].trim().toLowerCase()));
      if (!destino) return dizer(achadas.length > 1 ? `Há mais de um lugar com esse nome: ${achadas.slice(0, 5).map((r) => r.nome).join(", ")}. Diga o nome inteiro.` : "Para onde? Use *teleportar <nome da região>* (veja os nomes no *mapa*).");
      if (destino.id === j.regiao_atual) return dizer("Você já está aí.");
      if (destino.desbloqueio && !(await db.query("select 1 from jogo.marcos where mundo_id = $1 and marco_id = $2 and status = 'concluido' limit 1", [j.mundo_id, destino.desbloqueio])).length)
        return dizer("O selo esquenta e recua. Aquele lugar ainda está fechado para o mundo inteiro; nem uma porta dessas passa pela névoa.");
      await gravar(j, "teleporte", { ...selo, destino: destino.id });
      return dizer(`O selo se abre como um olho. Do outro lado, você vê *${destino.nome}*.\n\nUma voz sem dono pergunta com o que você paga:\n\n${precos()}\n\n${rodape("o selo só abre uma vez", "desistir: é só não pagar")}`);
    }
    if (!selo.destino) return dizer("Primeiro diga para onde: *teleportar <lugar>*.");
    const k = { vida: "vida", sangue: "vida", ryo: "ryo", ouro: "ryo", merito: "merito", nome: "merito", memoria: "merito" }[pg[1] ?? ""];
    if (!k) return dizer(`Com o que você paga?\n\n${precos()}`);
    if (!PRECOS[k].pode(j)) return dizer(`${PRECOS[k].falta}\n\n${precos()}`);
    const sql = { vida: `hp = greatest(1, hp - $2), recuperacao_em = '${new Date(agora()).toISOString()}'`, ryo: "ryo = ryo - $2", merito: "merito = merito - $2" }[k], valor = { vida: Math.floor(j.hp_max / 2), ryo: 60 * j.nivel, merito: 20 }[k];
    await db.query(`update jogo.jogadores set ${sql}, regiao_atual = $3, local_atual = null where id = $1`, [j.id, valor, selo.destino]);
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'teleporte'", [j.id]);
    j.regiao_atual = selo.destino; j.local_atual = null;
    return { tratado: true, mudouRegiao: true, saidas: [{ para, texto: `Você paga em ${PRECOS[k].nome}. O selo racha ao meio, e o mundo dobra como papel.\n\nUm passo. Só um.\n${rodape(`−${PRECOS[k].texto(j)}`, "o selo virou pó")}` }] };
  }

  /** Resposta do jogador à pergunta da espiã ("sim"/"não"). Devolve null se não há pergunta pendente. */
  async function respostaEspia(j, confia, para) {
    const p = (await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'espia-pergunta' returning valor", [j.id]))[0]?.valor;
    if (!p) return null;
    const nome = p.nome ?? ESPIA.nome;
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'espia'", [j.id]); // de um jeito ou de outro, ela vai embora
    if (!confia) {
      await gravar(j, "espia-fim", { resposta: "não", levou: 0, em: agora() });
      return [{ para, texto: `${nome} fica um instante em silêncio. Depois sorri de um jeito que você ainda não tinha visto: sem esforço.\n\n— Que bom. Continua assim.\n\nEla ajeita a capa, deixa o caderninho azul em cima de uma pedra e toma a estrada sem olhar para trás. Dentro do caderno, todas as páginas sobre você foram arrancadas.` }];
    }
    // confiou: ela leva a bolsa inteira (itens e equipamento). Grimórios e ryō ficam. Tudo fica guardado para o mestre poder devolver.
    const itens = await db.query("select item_id, tipo, qtd, equipado, dados from jogo.inventario where jogador_id = $1", [j.id]);
    const antes = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'roubado'", [j.id]))?.valor?.itens ?? [];
    await gravar(j, "roubado", { em: agora(), por: nome, itens: [...antes, ...itens] });
    await db.query("delete from jogo.inventario where jogador_id = $1", [j.id]);
    await gravar(j, "espia-fim", { resposta: "sim", levou: itens.length, em: agora() });
    return [{ para, texto: `${nome} sorri, e alguma coisa nos olhos dela relaxa.\n\n— Então me deixa carregar a sua bolsa hoje. Você parece cansado.\n\nVocê dorme bem naquela noite. Melhor do que em muito tempo.\n\nDe manhã, não há ${nome}. Não há bolsa. Não há arma ao lado do cobertor. Só o caderninho azul, aberto na última página, com o desenho de alguém dormindo — e, embaixo, uma palavra só:\n\n_"Obrigada."_\n${rodape(itens.length ? "você perdeu todos os itens e o equipamento" : "você não tinha nada para ela levar", "seus grimórios e seu ryō ficaram", "uma loja vende o básico para recomeçar")}` }];
  }

  return { comando, bloqueio, resgatar, observar, passagem, respostaEspia };
}
