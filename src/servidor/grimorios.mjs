// Grimórios no jogo: encontrar (explorando ou concluindo um capítulo na região onde ele está escondido),
// ver, abrir e fechar. As magias de um grimório aberto entram no menu das batalhas.
import { GRIMORIOS, grimoriosDaRegiao, podeLer, maxGrimorios, magiasDeBatalha, acharGrimorio } from "../regras/grimorios.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
import { rodape } from "./textos.mjs";

export const CHANCE_ACHAR_GRIMORIO = 0.2; // por exploração, quando há um grimório legível na região

export function criarGrimorios({ db, rng }) {
  const meus = (j) => db.query("select grimorio_id, equipado from jogo.grimorios_jogador where jogador_id = $1 order by grimorio_id", [j.id]);
  const equipados = async (jogadorId) => (await db.query("select grimorio_id from jogo.grimorios_jogador where jogador_id = $1 and equipado order by grimorio_id", [jogadorId])).map((x) => x.grimorio_id);
  const magiasDe = async (jogadorId) => magiasDeBatalha(await equipados(jogadorId));
  const linhaMagia = (m) => (m.utilitaria ? `_${m.nome} — ${m.descricao} (fora de luta)_` : `*${m.nome}* — ${m.resumo}${m.mp ? ` _(${m.mp} de mana)_` : ""}`);
  const ficha = (g, aberto = false) => `*${g.nome}*${aberto ? " _(aberto)_" : ""}\n_rank ${g.rank} · ${g.elemento}_\n${g.magias.map(linhaMagia).join("\n")}`;

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
      const txt = lista.map((l, k) => `*${k + 1}.* ${ficha(GRIMORIOS.get(l.grimorio_id), l.equipado)}`).join("\n\n");
      const abertos = lista.filter((l) => l.equipado).length;
      return dizer(`*Seus grimórios*\n\n${txt}\n\n${rodape(`${abertos} de ${maxGrimorios(j.classe)} abertos (${j.classe})`, "abrir grimorio <nº>", "fechar grimorio <nº>", `${lista.length} de ${GRIMORIOS.size} encontrados`)}`);
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

  /** Para o mestre: onde está cada grimório e quem já tem. */
  async function relatorio(mundoId) {
    const donos = mundoId ? await db.query(`select g.grimorio_id, j.nome, g.equipado from jogo.grimorios_jogador g join jogo.jogadores j on j.id = g.jogador_id where j.mundo_id = $1`, [mundoId]) : [];
    return [...GRIMORIOS.values()].map((g) => { const d = donos.filter((x) => x.grimorio_id === g.id);
      return `*${g.id.slice(1)}* ${g.nome} — ${g.rank}, ${REGIAO.get(g.regiao)?.nome ?? g.regiao}${d.length ? ` · com ${d.map((x) => `${x.nome}${x.equipado ? " (aberto)" : ""}`).join(", ")}` : ""}`; }).join("\n");
  }

  return { comando, aoExplorar, aoConcluir, magiasDe, entregar, relatorio };
}
