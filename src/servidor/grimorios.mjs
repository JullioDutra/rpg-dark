// Grimórios no jogo: encontrar (explorando ou concluindo um capítulo na região onde ele está escondido),
// ver, abrir e fechar. As magias de um grimório aberto entram no menu das batalhas.
import { GRIMORIOS, grimoriosDaRegiao, podeLer, maxGrimorios, magiasDeBatalha, acharGrimorio } from "../regras/grimorios.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
import { rodape } from "./textos.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";

export const CHANCE_ACHAR_GRIMORIO = 0.2; // por exploração, quando há um grimório legível na região

export function criarGrimorios({ db, rng }) {
  const meus = (j) => db.query("select grimorio_id, equipado from jogo.grimorios_jogador where jogador_id = $1 order by grimorio_id", [j.id]);
  const equipados = async (jogadorId) => (await db.query("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and equipado order by grimorio_id", [jogadorId])).map((x) => x.grimorio_id);
  const magiasDe = async (jogadorId) => magiasDeBatalha(await equipados(jogadorId));
  const linhaMagia = (m) => (m.utilitaria ? `_${m.nome} — ${m.descricao} (fora de luta)_` : `*${m.nome}* — ${m.resumo}${m.mp ? ` _(${m.mp} de mana)_` : ""}`);
  const ficha = (g, aberto = false, j = null) => {
    const motivo = j ? podeLer(j, g) : null;
    const situacao = !j ? null : aberto ? "ABERTO — as magias dele estão no menu das suas lutas" : motivo ? `NÃO PODE USAR AINDA — ${motivo}` : "FECHADO — você pode usar: abra para as magias entrarem nas lutas";
    return `*${g.nome}*\n_rank ${g.rank} · ${g.elemento}_${situacao ? `\n_${situacao}_` : ""}\n${g.magias.map(linhaMagia).join("\n")}`;
  };

  /** Entrega um grimório (se o jogador ainda não tem). Devolve as saídas, ou [] se já tinha. */
  async function entregar(j, g, para, como) {
    const novo = await db.query("insert into jogo.grimorios_jogador (jogador_id, grimorio_id) values ($1, $2) on conflict do nothing returning 1", [j.id, g.id]);
    if (!novo.length) return [];
    const total = (await meus(j)).length, motivo = podeLer(j, g);
    return [{ para, texto: `${como}\n\n${ficha(g)}\n\n${motivo ? `_${motivo}_\n` : ""}${rodape(motivo ? "guardado para depois" : `para usar: abrir grimorio ${g.nome.split(" ")[0].toLowerCase()}`, `${total} de ${GRIMORIOS.size} grimórios`)}` }];
  }

  /** Depois de explorar: às vezes o jogador acha o grimório escondido na região (só os que a classe e o nível dele conseguem ler). */
  async function aoExplorar(j, para) {
    const tenho = new Set((await meus(j)).map((x) => x.grimorio_id));
    const aqui = grimoriosDaRegiao(j.regiao_atual).filter((g) => !tenho.has(g.id) && !podeLer(j, g));
    if (!aqui.length || rng() >= CHANCE_ACHAR_GRIMORIO) return [];
    const g = aqui.sort((a, b) => a.nivel - b.nivel)[0];
    return entregar(j, g, para, `Entre o que você revirou em ${g.lugar}, um volume de capa gasta está quente ao toque, como se alguém tivesse acabado de fechá-lo.\n\n*Você encontrou um grimório.*`);
  }
  /** Concluir um capítulo na região revela o grimório dela (o de menor rank que o jogador ainda não tem), legível ou não. */
  async function aoConcluir(j, cap, para) {
    const tenho = new Set((await meus(j)).map((x) => x.grimorio_id));
    const g = grimoriosDaRegiao(cap.regiao ?? j.regiao_atual).filter((x) => !tenho.has(x.id)).sort((a, b) => a.nivel - b.nivel)[0];
    return g && para ? entregar(j, g, para, `Quando a poeira baixa, alguém coloca um livro nas suas mãos sem dizer nada. Estava guardado em ${g.lugar}, esperando quem resolvesse o que você resolveu.\n\n*Você recebeu um grimório.*`) : [];
  }

  async function comando(j, t, para) {
    const dizer = (texto) => ({ tratado: true, saidas: [{ para, texto }] });
    let m;
    if (/^(grimorios?|meus grimorios|livros|magias)$/.test(t)) {
      const lista = await meus(j);
      if (!lista.length) return dizer(`Você ainda não tem nenhum grimório.\n\nEles estão escondidos pelas regiões do mundo: *explorar* e concluir as histórias de cada lugar é o jeito de achá-los.\n${rodape(`0 de ${GRIMORIOS.size}`)}`);
      const txt = lista.map((l, k) => `*${k + 1}.* ${ficha(GRIMORIOS.get(l.grimorio_id), l.equipado, j)}`).join("\n\n");
      const abertos = lista.filter((l) => l.equipado).length;
      return dizer(`*Seus grimórios*\n\n${txt}\n\n${rodape(`${abertos} de ${maxGrimorios(j.classe)} abertos (${j.classe})`, "abrir grimorio <nº>", "fechar grimorio <nº>", "no grupo: dar grimorio <nº> @pessoa · vender grimorio <nº> @pessoa <preço>", `${lista.length} de ${GRIMORIOS.size} encontrados`)}`);
    }
    if ((m = t.match(/^(abrir|ler|equipar|usar|fechar|guardar) (?:o )?(?:grimorio|livro) (.+)$/))) {
      const lista = await meus(j);
      const l = /^\d+$/.test(m[2]) ? lista[Number(m[2]) - 1] : lista.find((x) => x.grimorio_id === acharGrimorio(m[2])?.id) ?? lista.find((x) => GRIMORIOS.get(x.grimorio_id).nome.toLowerCase().includes(m[2]));
      if (!l) return dizer("Você não tem esse grimório. Veja os seus com *grimorios*.");
      const g = GRIMORIOS.get(l.grimorio_id);
      if (/^(fechar|guardar)$/.test(m[1])) {
        if (!l.equipado) return dizer(`*${g.nome}* já está fechado.`);
        await db.query("update jogo.grimorios_jogador set equipado = false where jogador_id = $1 and grimorio_id = $2", [j.id, g.id]);
        return dizer(`Você fecha *${g.nome}* e o guarda. As magias dele saem das suas batalhas.`);
      }
      if (l.equipado) return dizer(`*${g.nome}* já está aberto.`);
      const motivo = podeLer(j, g);
      if (motivo) return dizer(motivo);
      const abertos = lista.filter((x) => x.equipado);
      if (abertos.length >= maxGrimorios(j.classe)) return dizer(`${j.classe} consegue manter ${maxGrimorios(j.classe)} grimório${maxGrimorios(j.classe) > 1 ? "s" : ""} aberto${maxGrimorios(j.classe) > 1 ? "s" : ""} de cada vez. Feche um antes: *fechar grimorio ${lista.indexOf(abertos[0]) + 1}*.`);
      await db.query("update jogo.grimorios_jogador set equipado = true where jogador_id = $1 and grimorio_id = $2", [j.id, g.id]);
      const batalha = g.magias.filter((x) => !x.utilitaria);
      return dizer(`Você abre *${g.nome}*. As letras se acomodam na sua cabeça como se sempre tivessem morado ali.\n\n${batalha.map(linhaMagia).join("\n")}\n\n${rodape(`${batalha.length} magia${batalha.length > 1 ? "s" : ""} nova${batalha.length > 1 ? "s" : ""} no menu das suas lutas`, j.mp_max > 0 ? null : "sua classe não gasta mana: só a espera entre usos")}`);
    }
    return { tratado: false, saidas: [] };
  }

  // ── doar e vender (no grupo). O grimório muda de dono: quem entrega perde as magias dele na hora. ──
  const n = (s) => semAcento(String(s ?? "").toLowerCase()).trim();
  /** Acha, entre os grimórios do jogador, o que ele citou (nº da lista dele, código G.. ou parte do nome). */
  async function meuGrimorio(j, ref) {
    const lista = await meus(j), t = n(ref);
    if (!t) return null;
    const l = /^\d+$/.test(t) ? lista[Number(t) - 1] : lista.find((x) => x.grimorio_id.toLowerCase() === t) ?? lista.find((x) => n(GRIMORIOS.get(x.grimorio_id).nome).includes(t));
    return l ? GRIMORIOS.get(l.grimorio_id) : null;
  }
  /** Passa o grimório de um jogador para outro. Devolve false se o destino já tem ou a origem não tem mais. */
  async function transferir(de, para, g, q = db.query.bind(db)) {
    if ((await q("select 1 from jogo.grimorios_jogador where jogador_id = $1 and grimorio_id = $2", [para.id, g.id])).length) return "ja-tem";
    const saiu = await q("delete from jogo.grimorios_jogador where jogador_id = $1 and grimorio_id = $2 returning 1", [de.id, g.id]);
    if (!saiu.length) return "nao-tem";
    await q("insert into jogo.grimorios_jogador (jogador_id, grimorio_id, equipado) values ($1, $2, false)", [para.id, g.id]);
    return "ok";
  }
  /** Lê "…<grimório> @pessoa [preço]" de uma mensagem do grupo. */
  async function lerPedido(msg, verbo, acharJogador, comPreco) {
    let corpo = n(msg.texto).replace(new RegExp(`^[!/]?\\s*${verbo}\\s+(?:o\\s+)?(?:grimorio|livro)\\s*`), "").replace(/@\S+/g, " ").replace(/\s+/g, " ").trim();
    let preco = null;
    if (comPreco) { const m = corpo.match(/(?:por\s+)?(\d{1,7})\s*(?:ryo|moedas?)?$/); if (m && corpo.split(" ").length > 1) { preco = Number(m[1]); corpo = corpo.slice(0, m.index).trim(); } }
    let alvo = await acharJogador(msg);
    if (!alvo && /\s/.test(corpo)) { const ultimo = corpo.split(" ").at(-1); alvo = await acharJogador({ ...msg, mencoes: [], texto: `x ${ultimo}` }); if (alvo) corpo = corpo.split(" ").slice(0, -1).join(" "); }
    return { ref: corpo.replace(/\s+(para|pra|a|ao)$/, "").trim(), alvo, preco };
  }
  const avisoPoder = (g, antigo, novo) => `As letras de *${g.nome}* se apagam da cabeça de ${antigo.nome}: as magias dele saem das lutas de quem entregou.\n_${novo.nome}: veja em *grimorios* se você já consegue abrir._`;

  async function dar(msg, autor, acharJogador) {
    const dizer = (texto) => [{ para: msg.chat, texto }];
    if (!autor) return dizer("Você ainda não tem personagem neste mundo.");
    const { ref, alvo } = await lerPedido(msg, "dar", acharJogador, false);
    const g = await meuGrimorio(autor, ref);
    if (!g) return dizer(`*${autor.nome}* não tem esse grimório. Use: *dar grimorio <nº da sua lista> @pessoa* (a lista está em *grimorios*, no privado).`);
    if (!alvo) return dizer("Para quem? Marque a pessoa: *dar grimorio <nº> @pessoa*.");
    if (String(alvo.id) === String(autor.id)) return dizer("O livro já é seu.");
    const r = await transferir(autor, alvo, g);
    if (r === "ja-tem") return dizer(`*${alvo.nome}* já tem *${g.nome}*.`);
    if (r !== "ok") return dizer(`*${autor.nome}* não tem mais esse grimório.`);
    return dizer(`*${autor.nome}* entrega *${g.nome}* a *${alvo.nome}*.\n\n${avisoPoder(g, autor, alvo)}`);
  }

  async function vender(msg, autor, acharJogador) {
    const dizer = (texto) => [{ para: msg.chat, texto }];
    if (!autor) return dizer("Você ainda não tem personagem neste mundo.");
    const { ref, alvo, preco } = await lerPedido(msg, "vender", acharJogador, true);
    const g = await meuGrimorio(autor, ref);
    if (!g || !alvo || !preco) return dizer("Use: *vender grimorio <nº da sua lista> @pessoa <preço em ryō>*. Ex.: vender grimorio 2 @Rin 500");
    if (String(alvo.id) === String(autor.id)) return dizer("Vender para si mesmo não rende nada.");
    if ((await db.query("select 1 from jogo.grimorios_jogador where jogador_id = $1 and grimorio_id = $2", [alvo.id, g.id])).length) return dizer(`*${alvo.nome}* já tem *${g.nome}*.`);
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'oferta-grimorio', $2, now()) on conflict (jogador_id, chave) do update set valor = excluded.valor`,
      [alvo.id, JSON.stringify({ de: Number(autor.id), g: g.id, preco, em: Date.now() })]);
    return dizer(`*${autor.nome}* oferece *${g.nome}* a *${alvo.nome}* por *${preco} ryō*.\n\n${alvo.nome}, responda aqui: *comprar grimorio* ou *recusar compra*.\n${rodape("a oferta vale 10 minutos", "quem vende perde as magias do livro")}`);
  }

  async function responderVenda(msg, comprador, aceita) {
    const dizer = (texto) => [{ para: msg.chat, texto }];
    if (!comprador) return null;
    const oferta = (await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'oferta-grimorio' returning valor", [comprador.id]))[0]?.valor;
    if (!oferta) return aceita ? dizer("Ninguém te ofereceu um grimório.") : null;
    const g = GRIMORIOS.get(oferta.g), vendedor = (await db.query("select * from jogo.jogadores where id = $1", [oferta.de]))[0];
    if (!g || !vendedor || Date.now() - Number(oferta.em) > 10 * 60_000) return dizer("A oferta já esfriou.");
    if (!aceita) return dizer(`*${comprador.nome}* recusa. *${g.nome}* continua com ${vendedor.nome}.`);
    const r = await db.script(async (q) => {
      await q("begin");
      try {
        const pago = await q("update jogo.jogadores set ryo = ryo - $2 where id = $1 and ryo >= $2 returning ryo", [comprador.id, oferta.preco]);
        if (!pago.length) { await q("rollback"); return "sem-ryo"; }
        const t = await transferir(vendedor, comprador, g, q);
        if (t !== "ok") { await q("rollback"); return t; }
        await q("update jogo.jogadores set ryo = ryo + $2 where id = $1", [vendedor.id, oferta.preco]);
        await q("commit");
        return "ok";
      } catch (e) { await q("rollback"); throw e; }
    });
    if (r === "sem-ryo") return dizer(`*${comprador.nome}* não tem ${oferta.preco} ryō. O negócio não saiu.`);
    if (r !== "ok") return dizer(r === "ja-tem" ? `*${comprador.nome}* já tem esse grimório.` : `*${vendedor.nome}* não tem mais esse grimório.`);
    return dizer(`Negócio fechado: *${comprador.nome}* paga ${oferta.preco} ryō e fica com *${g.nome}*.\n\n${avisoPoder(g, vendedor, comprador)}`);
  }

  /** Para o mestre: onde está cada grimório e quem já tem. */
  async function relatorio(mundoId) {
    const donos = mundoId ? await db.query(`select g.grimorio_id, j.nome, g.equipado from jogo.grimorios_jogador g join jogo.jogadores j on j.id = g.jogador_id where j.mundo_id = $1`, [mundoId]) : [];
    return [...GRIMORIOS.values()].map((g) => { const d = donos.filter((x) => x.grimorio_id === g.id);
      return `*${g.id.slice(1)}* ${g.nome} — ${g.rank}, ${REGIAO.get(g.regiao)?.nome ?? g.regiao}${d.length ? ` · com ${d.map((x) => `${x.nome}${x.equipado ? " (aberto)" : ""}`).join(", ")}` : ""}`; }).join("\n");
  }

  return { comando, aoExplorar, aoConcluir, magiasDe, entregar, relatorio, dar, vender, responderVenda };
}
