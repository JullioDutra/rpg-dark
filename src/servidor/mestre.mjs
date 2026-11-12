// Mão invisível do mestre: o administrador age pelo PRIVADO do bot e o mundo reage como se fosse a própria história.
// Nada aqui cita o administrador: o grupo só vê o narrador. Nenhuma ação dá atributo, nível ou item de equipamento.
import { MUNDO, VILOES } from "../mundo/mundo.mjs";
import { MONSTROS } from "../mundo/monstros.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
const nomeR = (rid) => REGIAO.get(rid)?.nome ?? rid;
import { AMEACA } from "./ameacas.mjs";
import { item } from "../regras/itens.mjs";
import { nomeLacaio } from "./combate.mjs";
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
mestre recolher <nome> — a espiã se despede
mestre quem — lista os personagens e onde estão

_Nenhuma dessas ações dá atributo ou nível. Não use no grupo: lá o comando é ignorado para não te revelar._`;

const ESPIA = { nome: "Shiori", papel: "uma cartógrafa de estrada", maxLog: 25,
  falas: ["anota alguma coisa num caderninho de capa azul e sorri quando você olha.", "comenta, distraída: — Você sempre decide rápido assim?",
    "fica um passo atrás, desenhando o caminho de vocês num mapa.", "pergunta de onde você é, e escuta a resposta com atenção demais para quem só puxa conversa.",
    "ajeita a alça da bolsa e diz que nunca viu ninguém viajar do seu jeito."] };

export function criarMestre({ db, agora, ameacas = null }) {
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
    if (acao === "quem") return dizer(todos.length ? todos.map((x) => `*${x.nome}* — ${x.classe}, nível ${x.nivel}, em ${nomeR(x.regiao_atual)}`).join("\n") : "Nenhum personagem ativo.");

    if (/^monstros$/.test(acao)) return dizer(`*Monstros* (grau 1 a 3 para cidades; grau 4 são Calamidades)\n\n${MONSTROS.map((x) => `*${x.id.slice(1)}* ${x.nome}, ${x.titulo} — grau ${x.grau}, ${x.elemento}`).join("\n")}`);
    const acharMonstro = (txt) => { const n = semAcento(txt.toLowerCase()).trim(); return MONSTROS.find((x) => x.id.toLowerCase() === n || x.id.slice(1) === n.padStart(2, "0")) ?? (n.length >= 3 ? MONSTROS.find((x) => semAcento(x.nome.toLowerCase()).startsWith(n)) : null) ?? null; };
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
      if (!e) return dizer(`Ninguém está acompanhando ${alvo.nome}. Use: mestre espiã ${primeiro}`);
      const inv = await db.query("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1 order by equipado desc, qtd desc limit 8", [alvo.id]);
      const hora = (ms) => new Date(ms - 3 * 3_600_000).toISOString().slice(5, 16).replace("T", " ");
      return dizer(`*Relatório de ${e.nome}* — ${alvo.nome}\n\n${alvo.classe}, nível ${alvo.nivel} · vida ${alvo.hp}/${alvo.hp_max} · ${alvo.ryo} ryō · corrupção ${Number(alvo.corrupcao ?? 0)}\nEstá em ${nomeR(alvo.regiao_atual)}.\nLeva: ${inv.map((l) => `${item(l.item_id)?.nome ?? l.item_id}${l.qtd > 1 ? ` ×${l.qtd}` : ""}${l.equipado ? " (em uso)" : ""}`).join(", ") || "nada"}.\n\n` +
        `*O que ele fez* (horário de Brasília)\n${(e.log ?? []).map((l) => `${hora(l.q)} · ${nomeR(l.r)} · ${l.t}`).join("\n") || "Nada ainda."}`);
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

  return { comando, bloqueio, resgatar, observar };
}
