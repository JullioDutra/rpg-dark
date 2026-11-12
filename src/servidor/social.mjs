// Atividades paralelas que não mexem na campanha: contratos diários da Guilda, sonhos ao descansar,
// ranking do mundo e presentes entre jogadores. Tudo aqui dá ryō, mérito e um pouco de XP; nada dá atributo,
// nada pula capítulo. Os sonhos sempre apontam de volta para o próximo passo da história.
import { MUNDO } from "../mundo/mundo.mjs";
import { aplicarXP } from "../regras/combate.mjs";
import { item } from "../regras/itens.mjs";
import { XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { rodape } from "./textos.mjs";
import { objetivoCampanha } from "./mundo.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { um } from "./db.mjs";

/** Contratos possíveis. Todo dia a Guilda oferece 3 (os mesmos para o dia inteiro, sorteados pelo dia e pelo jogador). */
export const CONTRATOS = {
  cacar: { nome: "Limpar a estrada", texto: (n) => `vença ${n} lutas`, alvo: [2, 3], peso: 1 },
  conversa: { nome: "Ouvir o povo", texto: (n) => `converse com ${n} pessoas diferentes`, alvo: [2, 2], peso: 0.7 },
  covil: { nome: "Cabeça a prêmio", texto: () => "derrote um vilão no covil dele (ou o Eco)", alvo: [1, 1], peso: 1.6 },
  capitulo: { nome: "Serviço à história", texto: () => "conclua um capítulo da sua história", alvo: [1, 1], peso: 2 },
};
export const CHANCE_SONHO = 0.4;
const GRANDES = ["excalibur", "kokugai", "tenmon", "shitencho"];
export const MAX_PRESENTES_DIA = 5;

const SONHOS = [
  "Você está num campo de trigo à noite. Quatro estrelas caem devagar, uma para cada canto do mundo. Uma quinta fica parada no céu, olhando para você.",
  "Uma criança que você não conhece segura a sua mão e aponta para uma torre sem topo. — Ele ainda está lá em cima — ela diz. — Esperando alguém subir.",
  "Você anda por uma cidade vazia. Em cada porta há um nome riscado. O último nome é o seu, e ainda não foi riscado.",
  "Um ovo do tamanho de uma montanha respira embaixo da terra. A casca tem rachaduras finas, e por elas escapa uma luz que não esquenta.",
  "Alguém canta uma canção de ninar numa língua que ninguém mais fala. Você entende cada palavra, e esquece todas ao acordar. Fica só a melodia.",
  "Você vê quatro reis sentados em quatro tronos, de costas uns para os outros. Nenhum deles tem rosto. Todos seguram a mesma corrente.",
  "Uma voz gentil, de alguém da sua idade, fala bem perto: — Eu também quis salvar todo mundo. Vem, eu te mostro como termina.",
  "O sol some atrás de um disco preto. No escuro, você ouve o mundo inteiro prender a respiração ao mesmo tempo.",
  "Você encontra a si mesmo mais velho, sentado numa pedra. Ele olha para as suas mãos, sorri cansado e diz: — Não deixa pra depois.",
  "Chove para cima. As gotas levam nomes de volta para as nuvens. Você tenta segurar um, e ele escorre entre os dedos.",
];

const dia = (ms) => new Date(ms).toISOString().slice(0, 10);
// Sorteio estável (mesmo dia + mesmo jogador = mesmos contratos), sem gastar o rng do jogo
function semente(texto) { let h = 2166136261; for (const c of texto) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }

export function contratosDoDia(j, hoje) {
  const r = semente(`${hoje}:${j.id}`);
  const terceiro = r() < 0.5 ? "covil" : "capitulo";
  return ["cacar", "conversa", terceiro].map((id) => {
    const c = CONTRATOS[id], alvo = c.alvo[0] + Math.floor(r() * (c.alvo[1] - c.alvo[0] + 1));
    return { id, nome: c.nome, texto: c.texto(alvo), alvo, ryo: Math.round((30 + j.nivel * 8) * c.peso / 5) * 5, merito: Math.round(3 * c.peso), xp: Math.round(XP_PROXIMO(j.nivel) * 0.04 * c.peso) };
  });
}

export function criarSocial({ db, rng, agora }) {
  const gravar = (j, chave, valor) => db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, $2, $3, $4)
    on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, chave, JSON.stringify(valor), new Date(agora())]);
  const ler = async (j, chave) => (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = $2", [j.id, chave]))?.valor ?? null;
  const temGuilda = (j) => MUNDO[j.regiao_atual]?.locais.some((l) => l.servicos?.includes("loja"));

  async function darXP(j, xp) {
    const jog = await um(db, "select * from jogo.jogadores where id = $1", [j.id]);
    const d = aplicarXP(jog, xp);
    await db.query(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8, pontos_livres = $9, rank = $10 where id = $1`,
      [j.id, d.nivel, d.xp, JSON.stringify(d.atributos), d.hp, d.hp_max, d.mp, d.mp_max, d.pontos_livres, d.rank]);
    for (const ev of d.eventos) await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, 'marco_historia', '{}')`, [j.id, ev.atributo, ev.delta]);
    return `+${xp} XP${d.niveis.length ? ` · nível ${d.nivel}` : ""}`;
  }

  // ── Contratos da Guilda ──
  async function quadro(j, para) {
    const hoje = dia(agora());
    let st = await ler(j, "contratos");
    if (st?.dia !== hoje) {
      if (!temGuilda(j)) return [{ para, texto: "O quadro de contratos da Guilda fica nas vilas e cidades. Vá a um lugar com loja e digite *contratos*." }];
      st = { dia: hoje, prog: {}, pagos: [], vistos: [] };
      await gravar(j, "contratos", st);
    }
    const linhas = contratosDoDia(j, hoje).map((c, i) => {
      const feito = st.pagos.includes(c.id), n = Math.min(c.alvo, Number(st.prog[c.id] ?? 0));
      return `*${i + 1}* ${feito ? `~${c.nome}~ — cumprido` : `${c.nome} — ${c.texto}${c.alvo > 1 ? ` (${n}/${c.alvo})` : ""}`}\n   _${c.ryo} ryō · +${c.merito} de mérito · +${c.xp} XP_`;
    });
    return [{ para, texto: `*Quadro da Guilda* — contratos de hoje\n\n${linhas.join("\n")}\n\n${rodape("valem até a meia-noite", "o pagamento chega sozinho quando você cumpre", "a sua história continua em *missao*")}` }];
  }

  /** Soma progresso num tipo de contrato; paga os que fecharem. Só conta para quem pegou os contratos do dia. */
  async function contar(j, tipo, para, { unico = null } = {}) {
    const hoje = dia(agora()), st = await ler(j, "contratos");
    if (st?.dia !== hoje || st.pagos.includes(tipo)) return [];
    const c = contratosDoDia(j, hoje).find((x) => x.id === tipo);
    if (!c) return [];
    if (unico) { if ((st.vistos ?? []).includes(unico)) return []; st.vistos = [...(st.vistos ?? []), unico]; }
    st.prog[tipo] = Number(st.prog[tipo] ?? 0) + 1;
    if (st.prog[tipo] < c.alvo) { await gravar(j, "contratos", st); return []; }
    st.pagos.push(tipo);
    await gravar(j, "contratos", st);
    await db.query("update jogo.jogadores set ryo = ryo + $2, merito = merito + $3 where id = $1", [j.id, c.ryo, c.merito]);
    const xp = await darXP(j, c.xp);
    return [{ para, texto: `Um mensageiro da Guilda te alcança com uma bolsa de moedas.\n\n*Contrato cumprido:* ${c.nome}.\n${rodape(`+${c.ryo} ryō`, `+${c.merito} de mérito`, xp, `${st.pagos.length} de 3 hoje`)}` }];
  }

  async function aoEventos(j, eventos, para) {
    const saidas = [];
    for (const ev of eventos ?? []) {
      if (ev.tipo === "vitoria") saidas.push(...(await contar(j, "cacar", para)));
      if (ev.tipo === "vilao") saidas.push(...(await contar(j, "covil", para)));
    }
    return saidas;
  }
  const aoFalar = (j, npc, para) => contar(j, "conversa", para, { unico: npc });
  const aoConcluir = (j, para) => contar(j, "capitulo", para);

  // ── Sonhos: ao descansar numa cama, às vezes o personagem sonha; o sonho sempre lembra o próximo passo da história ──
  async function sonho(j, para) {
    if (rng() >= CHANCE_SONHO) return [];
    const linhas = await db.query("select chave from jogo.progresso where jogador_id = $1 and chave like 'b:%'", [j.id]);
    const B = new Set(linhas.map((l) => l.chave.slice(2)));
    const vistos = (await ler(j, "sonhos")) ?? [];
    const livres = SONHOS.map((_, i) => i).filter((i) => !vistos.includes(i));
    const i = (livres.length ? livres : SONHOS.map((_, k) => k))[Math.floor(rng() * (livres.length || SONHOS.length))];
    await gravar(j, "sonhos", livres.length ? [...vistos, i] : [i]);
    return [{ para, texto: `_Naquela noite, você sonha._\n\n${SONHOS[i]}\n\n_Você acorda com uma certeza quieta no peito:_ ${objetivoCampanha(B)}` }];
  }

  // ── Ranking do mundo ──
  async function ranking(mundoId, para) {
    const linhas = await db.query(`select j.id, j.nome, j.classe, j.nivel, j.merito,
        (select count(*) from jogo.derrotas_vilao d where d.jogador_id = j.id and d.primeiro) as primeiros,
        (select count(*) from jogo.progresso p where p.jogador_id = j.id and p.chave like 'c:%') as capitulos,
        exists (select 1 from jogo.progresso p where p.jogador_id = j.id and p.chave = 'b:eclipse-vencido') as zerou
      from jogo.jogadores j where j.mundo_id = $1 and j.estado = 'ativo' order by j.nivel desc, j.xp desc, j.id limit 10`, [mundoId]);
    if (!linhas.length) return [{ para, texto: "Ainda não há ninguém neste mundo." }];
    const txt = linhas.map((l, i) => `*${i + 1}.* ${l.nome}${l.zerou ? " ⭐" : ""} — ${l.classe}, nível ${l.nivel}\n   _${l.capitulos} capítulos · ${l.primeiros} vilões derrubados primeiro · ${l.merito} de mérito_`).join("\n");
    return [{ para, texto: `*Os nomes mais falados do mundo*\n\n${txt}\n\n${rodape("⭐ chegou ao fim da história")}` }];
  }

  // ── Presentes entre jogadores (no grupo): dar <item|N ryo> @pessoa ──
  async function dar(msg, autor, acharJogador) {
    const dizer = (texto) => [{ para: msg.chat, texto }];
    if (!autor) return dizer("Você ainda não tem personagem neste mundo.");
    let corpo = semAcento(msg.texto.toLowerCase()).replace(/^[!/]?\s*dar\s+/, "").replace(/@\S+/g, " ").replace(/\s+/g, " ").trim();
    let alvo = await acharJogador(msg);
    if (!alvo && /\s/.test(corpo)) { // sem menção: o último nome da frase é a pessoa ("dar poção Rin")
      const ultimo = corpo.split(" ").at(-1);
      alvo = await acharJogador({ ...msg, mencoes: [], texto: `dar ${ultimo}` });
      if (alvo) corpo = corpo.split(" ").slice(0, -1).join(" ");
    }
    if (!corpo) return dizer("Use: *dar poção @pessoa* ou *dar 50 ryo @pessoa*.");
    if (!alvo) return dizer("Para quem? Marque a pessoa: *dar poção @pessoa*.");
    if (alvo.id === autor.id) return dizer("Você passa o item de uma mão para a outra. Nada muda.");
    const hoje = dia(agora()), uso = await ler(autor, "presentes");
    const n = uso?.dia === hoje ? Number(uso.n ?? 0) : 0;
    if (n >= MAX_PRESENTES_DIA) return dizer(`*${autor.nome}* já deu ${MAX_PRESENTES_DIA} presentes hoje. Amanhã tem mais.`);
    let m, texto;
    if ((m = corpo.match(/^(\d+)\s*(ryo|moedas?)\b/))) {
      const q = Number(m[1]);
      if (q < 1 || q > 100000) return dizer("Quantidade inválida.");
      const r = await db.script(async (tx) => {
        await tx("begin");
        try {
          const pago = await tx("update jogo.jogadores set ryo = ryo - $2 where id = $1 and ryo >= $2 returning ryo", [autor.id, q]);
          if (pago.length) await tx("update jogo.jogadores set ryo = ryo + $2 where id = $1", [alvo.id, q]);
          await tx("commit");
          return pago.length > 0;
        } catch (e) { await tx("rollback"); throw e; }
      });
      if (!r) return dizer(`*${autor.nome}* não tem ${q} ryō.`);
      texto = `*${autor.nome}* entrega ${q} ryō a *${alvo.nome}*.`;
    } else {
      const inv = await db.query("select item_id, qtd, equipado from jogo.inventario where jogador_id = $1", [autor.id]);
      const chave = corpo.replace(/\s*\d*$/, "").trim();
      // Grandes Itens também passam de mão (o grupo arma quem vai enfrentar o fim), desde que não estejam em uso
      const cand = inv.map((l) => ({ l, it: item(l.item_id) })).filter(({ l, it }) => it && (["consumivel", "material"].includes(it.tipo) || (GRANDES.includes(it.id) && !l.equipado)));
      const achado = cand.find(({ it }) => semAcento(it.nome.toLowerCase()) === chave) ?? cand.find(({ it }) => semAcento(it.nome.toLowerCase()).includes(chave));
      if (!achado) return dizer(`*${autor.nome}* não tem isso para dar. _(podem ser dados: poções, utilidades, materiais e Grandes Itens que não estejam equipados)_`);
      const { it } = achado;
      const r = await db.script(async (tx) => {
        await tx("begin");
        try {
          const ok = await tx(`with u as (delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1),
            d as (update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2 and qtd > 1 returning 1)
            select (select count(*) from u) + (select count(*) from d) as n`, [autor.id, it.id]);
          const saiu = Number(ok[0].n) > 0;
          if (saiu) await tx(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, $3, 1, '{}')
            on conflict (jogador_id, item_id) do update set qtd = jogo.inventario.qtd + 1`, [alvo.id, it.id, it.tipo]);
          await tx("commit");
          return saiu;
        } catch (e) { await tx("rollback"); throw e; }
      });
      if (!r) return dizer(`*${autor.nome}* não tem mais isso.`);
      texto = GRANDES.includes(it.id) ? `⭐ *${autor.nome}* confia *${it.nome}* a *${alvo.nome}*.\n_Um Grande Item mudou de mãos. Quem o carrega agora leva também a esperança de quem o entregou._` : `*${autor.nome}* entrega *${it.nome}* a *${alvo.nome}*.`;
    }
    await gravar(autor, "presentes", { dia: hoje, n: n + 1 });
    return dizer(texto);
  }

  async function comando(j, t, para) {
    if (/^(contratos?|guilda|quadro|quadro da guilda|missoes da guilda|contratos da guilda)$/.test(t)) return { tratado: true, saidas: await quadro(j, para) };
    if (/^(ranking|rank|placar|classificacao)$/.test(t)) return { tratado: true, saidas: await ranking(j.mundo_id, para) };
    return { tratado: false, saidas: [] };
  }

  return { comando, aoEventos, aoFalar, aoConcluir, sonho, ranking, dar };
}
