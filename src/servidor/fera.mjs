// Transformação mística dos Meio-humanos no jogo: despertar (por relíquia achada ou pelo mestre), ver a própria forma,
// e o anúncio com a arte no grupo. As habilidades de cada estágio entram no menu das lutas (ver regras/fera.mjs).
import { FERAS, habilidadesDaFera, dnaFera, dnaUniao, NIVEL_ESTAGIO, CHANCE_RELIQUIA, chaveDespertar, bonusDespertar, atributosDaForma, BONUS_ESTAGIO } from "../regras/fera.mjs";
import { imagemTransformacao } from "../avatar/especiais.mjs";
import { CABELO } from "../avatar/paletas.mjs";
import { rodape } from "./textos.mjs";
import { um } from "./db.mjs";

export const RELIQUIA = "reliquia-fera", SEMENTE = "semente-ancestral";
/** O que muda no texto conforme a linhagem: a fera do Meio-humano ou o espírito da Força da Natureza. */
const LINHAGEM = {
  fera: { item: RELIQUIA, nomeItem: "Relíquia do Sangue Antigo", usar: "usar relíquia", dentro: (f) => `a ${f.ser} que corre no seu sangue`, dele: (f) => `a ${f.ser} que carrega no sangue`, titulo: (f) => `A ${f.ser} no seu sangue`,
    grupo: ["UMA FERA ACORDOU", "O SANGUE ANTIGO RESPONDE", "A FERA ANCESTRAL DESPERTOU"],
    cena: ["Em algum lugar, um coração bateu duas vezes ao mesmo tempo.", "A lua parece mais perto esta noite.", "O céu muda de cor por um instante, e todo animal do continente levanta a cabeça ao mesmo tempo."],
    sentir: ["Começa como uma coceira atrás dos olhos. Depois os sons ficam altos demais, os cheiros nítidos demais, e você entende que não está ficando doente: está ficando *inteiro*.", "Desta vez não dói. O corpo já conhece o caminho, e vai mais longe do que da primeira vez.", "Não há mais fronteira entre você e o que você carrega. Nunca houve: você só não sabia olhar."],
    achou: (f) => `Meio enterrado, há um osso pequeno e liso, gravado com um desenho que você reconhece sem nunca ter visto: uma ${f.ser}. Quando você encosta nele, o seu próprio coração erra uma batida.`, frio: "A relíquia fica fria na sua mão." },
  natureza: { item: SEMENTE, nomeItem: "Semente do Primeiro Bosque", usar: "usar semente", dentro: (f) => `o ${f.ser} que cresce em você`, dele: (f) => `o ${f.ser} que cresce dentro de si`, titulo: (f) => `O ${f.ser} em você`,
    grupo: ["ALGO BROTOU", "A FLORESTA RESPONDE", "O ESPÍRITO ANCIÃO DESPERTOU"],
    cena: ["Em algum lugar, uma semente rachou sem que ninguém a regasse.", "As árvores da estrada se inclinaram todas para o mesmo lado, e não havia vento.", "Por um instante, tudo o que é verde no continente floresceu fora de época."],
    sentir: ["Começa nos pés: uma vontade de ficar parado, de afundar os dedos na terra. Depois você sente a água subindo, a luz descendo, e entende que nunca esteve sozinho dentro do próprio corpo.", "Desta vez as raízes vão mais fundo. Você sente cada folha num raio de cem passos como se fosse um dedo seu.", "Você não fala mais *com* a floresta. Quando você respira, é ela que respira."],
    achou: (f) => `Entre duas pedras, há uma semente do tamanho de um punho, morna como um bicho dormindo. Na casca, veios desenham algo que você reconhece sem nunca ter visto: um ${f.ser}. Quando você a pega, ela pulsa no ritmo do seu coração.`, frio: "A semente continua dormindo na sua mão." },
};
const NOME_ATR = { FOR: "FOR", DEF: "DEF", MAG: "MAG", RES: "RES", VEL: "VEL", SOR: "SOR" };

/** Tudo do despertar de um jogador, para quem monta lutas e fichas. q = função de consulta (db.query ou a de uma transação). */
export async function despertarDe(q, j) {
  const chave = chaveDespertar(j);
  if (!chave) return { chave: null, estagio: 0, bonus: {}, habs: [] };
  const estagio = Number((await q("select valor from jogo.progresso where jogador_id = $1 and chave = 'fera'", [j.id]))[0]?.valor?.estagio ?? 0);
  return { chave, estagio, bonus: bonusDespertar(chave, estagio, j.atributos ?? {}), habs: habilidadesDaFera(chave, estagio) };
}
const ORDINAL = ["primeiro", "segundo", "terceiro"];

export function criarFera({ db, rng, agora }) {
  const estagioDe = async (jogadorId) => Number((await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'fera'", [jogadorId]))?.valor?.estagio ?? 0);
  // o retrato original fica guardado em avatar_dna.base no primeiro despertar; a aparência atual é sempre recalculada a partir dele
  const baseDe = (j) => { const { base, ...atual } = j.avatar_dna ?? {}; return base ?? atual; };
  const formaDe = (j) => { const chave = chaveDespertar(j), f = chave ? FERAS[chave] : null; return f ? { chave, f, L: LINHAGEM[f.linhagem] } : null; };
  const arte = (j, estagio) => { const base = baseDe(j), k = chaveDespertar(j); return imagemTransformacao(base, dnaFera(k, estagio, base, { cabelo: CABELO }), estagio, dnaUniao(base, k, estagio)); };
  const linhaBonus = (chave, estagio) => `+${Math.round(BONUS_ESTAGIO[estagio - 1] * 100)}% de ${atributosDaForma(chave).map((k) => NOME_ATR[k]).join(" e ")}`;
  const linhaHab = (h, temMana) => `*${h.nome}* — ${h.resumo}${temMana && h.mp ? ` _(${h.mp} de mana)_` : ""}`;

  /** Sobe um estágio. forcar = veio do mestre (ignora o nível mínimo). Devolve as saídas (privado + grupo) ou uma recusa em texto. */
  async function transformar(j, para, { forcar = false } = {}) {
    const forma = formaDe(j);
    if (!forma) return { erro: `Só Meio-humanos e Forças da Natureza despertam. ${j.nome} é ${j.classe}.` };
    const { chave, f, L } = forma;
    const atual = await estagioDe(j.id);
    if (atual >= 3) return { erro: `${j.nome} já chegou à forma final: ${f.estagios[2].nome}.` };
    if (!forcar && j.nivel < NIVEL_ESTAGIO[atual]) return { erro: `O corpo ainda não aguenta. O ${ORDINAL[atual]} despertar pede nível ${NIVEL_ESTAGIO[atual]}.` };
    const novo = atual + 1, e = f.estagios[novo - 1];
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'fera', $2, $3) on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, JSON.stringify({ estagio: novo }), new Date(agora())]);
    const mundo = await um(db, "select grupo_wa_id from jogo.mundos where id = $1", [j.mundo_id]);
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'fera', $3, $4)", [j.mundo_id, j.id, `${j.nome} despertou: ${e.nome}.`, new Date(agora())]);
    // a união muda a aparência do personagem de verdade: a ficha passa a mostrar o retrato com os traços da fera
    if (j.avatar_dna) {
      // o que o personagem ganhou por outros caminhos depois do último despertar (ex.: a venda dos Olhos da Terra) passa a fazer parte do retrato de base
      const b0 = baseDe(j), jaDaUniao = atual ? dnaUniao(b0, chave, atual).acessorios : (b0.acessorios ?? []);
      const base = { ...b0, acessorios: [...(b0.acessorios ?? []), ...(j.avatar_dna.acessorios ?? []).filter((x) => !jaDaUniao.includes(x) && !(b0.acessorios ?? []).includes(x))] };
      const unido = { ...dnaUniao(base, chave, novo), id: base.id, base };
      await db.query("update jogo.jogadores set avatar_dna = $2 where id = $1", [j.id, JSON.stringify(unido)]);
      j = { ...j, avatar_dna: unido };
    }
    const img = j.avatar_dna ? arte(j, novo) : null;
    const privado = `${L.sentir[novo - 1]}\n\n` +
      `*${e.nome}* — ${ORDINAL[novo - 1]} despertar d${L.dentro(f)}.\n\n*Nova habilidade:* ${linhaHab(e.hab, j.mp_max > 0)}\n_${e.hab.frase}_\n\n*Atributos:* ${linhaBonus(chave, novo)} _(já aparece na ficha e vale em toda luta)_\n\n` +
      rodape("o terceiro quadro é você agora: a sua ficha passa a mostrar essa aparência", "a habilidade se soma às que você já tem", "vale em lutas, calamidades e duelos", novo < 3 ? `próximo despertar: nível ${NIVEL_ESTAGIO[novo]} e outra ${L.nomeItem}` : "esta é a forma final", "forma mostra tudo");
    const legenda = `${"⭐".repeat(novo)} *${L.grupo[novo - 1]}*\n\n${L.cena[novo - 1]}\n\n` +
      `*${j.nome}* despertou ${L.dele(f)} e agora é *${e.nome}*.\n\n_À esquerda, quem ${j.avatar_dna?.feminino ? "ela" : "ele"} era. No meio, o que sempre esteve lá dentro. À direita, quem ${j.avatar_dna?.feminino ? "ela" : "ele"} é agora._`;
    return { estagio: novo, saidas: [
      img ? { para, imagem: img, legenda: privado } : { para, texto: privado },
      ...(mundo?.grupo_wa_id ? [img ? { para: mundo.grupo_wa_id, imagem: img, legenda } : { para: mundo.grupo_wa_id, texto: legenda }] : []),
    ] };
  }

  /** usar a Relíquia / a Semente (só é gasta se a transformação acontecer, e cada linhagem só usa a sua). */
  async function usarReliquia(j, para, itemId = RELIQUIA) {
    const forma = formaDe(j), nome = itemId === SEMENTE ? LINHAGEM.natureza : LINHAGEM.fera;
    if (!forma || forma.L.item !== itemId) return [{ para, texto: `${nome.frio}\n\n${itemId === SEMENTE ? "Só uma Força da Natureza consegue acordá-la." : "Só um Meio-humano carrega o sangue que ela chama."}\n${rodape("ela continua na sua bolsa", "pode ser dada a outro jogador: dar <nome> <item>")}` }];
    const r = await transformar(j, para);
    if (r.erro) return [{ para, texto: `${forma.L.frio}\n\n${r.erro}\n${rodape("ela continua na sua bolsa")}` }];
    const gasto = await db.query("delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1", [j.id, itemId]);
    if (!gasto.length) await db.query("update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2", [j.id, itemId]);
    return r.saidas;
  }

  /** Explorando, quem ainda pode evoluir (e já tem nível para o próximo despertar) às vezes acha o item da sua linhagem. */
  async function aoExplorar(j, para) {
    const forma = formaDe(j);
    if (!forma) return [];
    const { f, L } = forma, atual = await estagioDe(j.id);
    if (atual >= 3 || j.nivel < NIVEL_ESTAGIO[atual] || rng() >= CHANCE_RELIQUIA) return [];
    if ((await db.query("select 1 from jogo.inventario where jogador_id = $1 and item_id = $2", [j.id, L.item])).length) return [];
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, 'historia', 1, '{}') on conflict (jogador_id, item_id) do nothing`, [j.id, L.item]);
    return [{ para, texto: `${L.achou(f)}\n\n*Você encontrou: ${L.nomeItem}.*\n${rodape(`para despertar: ${L.usar}`, "o grupo vai ficar sabendo")}` }];
  }

  async function comando(j, t, para) {
    if (!/^(fera|minha fera|forma|minha forma|transformacao|despertar|espirito|meu espirito)$/.test(t)) return { tratado: false, saidas: [] };
    const forma = formaDe(j);
    if (!forma) return { tratado: true, saidas: [{ para, texto: "Só Meio-humanos e Forças da Natureza têm uma forma para despertar." }] };
    const { chave, f, L } = forma, atual = await estagioDe(j.id), temMana = j.mp_max > 0;
    const linhas = f.estagios.map((e, i) => i < atual ? `${"◆".repeat(i + 1)} *${e.nome}* — ${linhaBonus(chave, i + 1)}\n   ${linhaHab(e.hab, temMana)}` : `${"◇".repeat(i + 1)} _${i === atual ? e.nome : "???"} — ${i === atual ? `nível ${NIVEL_ESTAGIO[i]} e uma ${L.nomeItem} (${linhaBonus(chave, i + 1)})` : "ainda dormindo"}_`);
    const b = bonusDespertar(chave, atual, j.atributos ?? {});
    const texto = `*${L.titulo(f)}*\n\n${linhas.join("\n")}\n\n${rodape(atual ? `${atual} de 3 despertares` : "ainda não despertou", atual ? `atributos agora: ${Object.entries(b).map(([k, v]) => `${k} +${v}`).join(", ")} (o bônus de cada estágio substitui o anterior)` : null, atual < 3 ? `${L.nomeItem} aparece para quem explora` : "forma final", "as habilidades despertas valem em lutas, calamidades e duelos")}`;
    return { tratado: true, saidas: [atual && j.avatar_dna ? { para, imagem: arte(j, atual), legenda: texto } : { para, texto }] };
  }

  return { comando, transformar, usarReliquia, aoExplorar, estagioDe, despertar: (j) => despertarDe((sql, p) => db.query(sql, p), j) };
}
