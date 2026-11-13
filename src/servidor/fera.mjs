// Transformação mística dos Meio-humanos no jogo: despertar (por relíquia achada ou pelo mestre), ver a própria forma,
// e o anúncio com a arte no grupo. As habilidades de cada estágio entram no menu das lutas (ver regras/fera.mjs).
import { FERAS, feraDe, habilidadesDaFera, dnaFera, NIVEL_ESTAGIO, CHANCE_RELIQUIA } from "../regras/fera.mjs";
import { imagemTransformacao } from "../avatar/especiais.mjs";
import { CABELO } from "../avatar/paletas.mjs";
import { rodape } from "./textos.mjs";
import { um } from "./db.mjs";

export const RELIQUIA = "reliquia-fera";
const ORDINAL = ["primeiro", "segundo", "terceiro"];

export function criarFera({ db, rng, agora }) {
  const estagioDe = async (jogadorId) => Number((await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'fera'", [jogadorId]))?.valor?.estagio ?? 0);
  const arte = (j, estagio) => imagemTransformacao(j.avatar_dna, dnaFera(j.tipo_animal, estagio, j.avatar_dna, { cabelo: CABELO }), estagio);
  const linhaHab = (h, temMana) => `*${h.nome}* — ${h.resumo}${temMana && h.mp ? ` _(${h.mp} de mana)_` : ""}`;

  /** Sobe um estágio. forcar = veio do mestre (ignora o nível mínimo). Devolve as saídas (privado + grupo) ou uma recusa em texto. */
  async function transformar(j, para, { forcar = false } = {}) {
    const f = j.classe === "Meio-humano" ? feraDe(j.tipo_animal) : null;
    if (!f) return { erro: `Só quem é Meio-humano carrega uma fera no sangue. ${j.nome} é ${j.classe}.` };
    const atual = await estagioDe(j.id);
    if (atual >= 3) return { erro: `${j.nome} já chegou à forma final: ${f.estagios[2].nome}.` };
    if (!forcar && j.nivel < NIVEL_ESTAGIO[atual]) return { erro: `O sangue ainda não aguenta. O ${ORDINAL[atual]} despertar pede nível ${NIVEL_ESTAGIO[atual]}.` };
    const novo = atual + 1, e = f.estagios[novo - 1];
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, 'fera', $2, $3) on conflict (jogador_id, chave) do update set valor = excluded.valor`, [j.id, JSON.stringify({ estagio: novo }), new Date(agora())]);
    const mundo = await um(db, "select grupo_wa_id from jogo.mundos where id = $1", [j.mundo_id]);
    await db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, 'fera', $3, $4)", [j.mundo_id, j.id, `${j.nome} despertou a fera: ${e.nome}.`, new Date(agora())]);
    const img = j.avatar_dna ? arte(j, novo) : null;
    const privado = `${novo === 1 ? "Começa como uma coceira atrás dos olhos. Depois os sons ficam altos demais, os cheiros nítidos demais, e você entende que não está ficando doente: está ficando *inteiro*." : novo === 2 ? "Desta vez não dói. O corpo já conhece o caminho, e vai mais longe do que da primeira vez." : "Não há mais fronteira entre você e o que você carrega. Nunca houve: você só não sabia olhar."}\n\n` +
      `*${e.nome}* — ${ORDINAL[novo - 1]} despertar da ${f.ser} que corre no seu sangue.\n\n*Nova habilidade:* ${linhaHab(e.hab, j.mp_max > 0)}\n_${e.hab.frase}_\n\n` +
      rodape("ela se soma às que você já tem", "aparece no menu de todas as suas lutas", novo < 3 ? `próximo despertar: nível ${NIVEL_ESTAGIO[novo]} e outra relíquia` : "esta é a forma final", "fera mostra a sua forma");
    const legenda = `${"⭐".repeat(novo)} *${novo === 3 ? "A FERA ANCESTRAL DESPERTOU" : novo === 2 ? "O SANGUE ANTIGO RESPONDE" : "UMA FERA ACORDOU"}*\n\n` +
      `${novo === 3 ? "O céu muda de cor por um instante, e todo animal do continente levanta a cabeça ao mesmo tempo." : novo === 2 ? "A lua parece mais perto esta noite." : "Em algum lugar, um coração bateu duas vezes ao mesmo tempo."}\n\n` +
      `*${j.nome}* despertou a ${f.ser} que carrega no sangue e agora é *${e.nome}*.\n\n_À esquerda, quem ${j.avatar_dna?.feminino ? "ela" : "ele"} é. À direita, o que sempre esteve lá dentro._`;
    return { estagio: novo, saidas: [
      img ? { para, imagem: img, legenda: privado } : { para, texto: privado },
      ...(mundo?.grupo_wa_id ? [img ? { para: mundo.grupo_wa_id, imagem: img, legenda } : { para: mundo.grupo_wa_id, texto: legenda }] : []),
    ] };
  }

  /** usar a Relíquia do Sangue Antigo (a relíquia só é gasta se a transformação acontecer). */
  async function usarReliquia(j, para) {
    const r = await transformar(j, para);
    if (r.erro) return [{ para, texto: `A relíquia fica fria na sua mão.\n\n${r.erro}\n${rodape("ela continua na sua bolsa")}` }];
    const gasto = await db.query("delete from jogo.inventario where jogador_id = $1 and item_id = $2 and qtd = 1 returning 1", [j.id, RELIQUIA]);
    if (!gasto.length) await db.query("update jogo.inventario set qtd = qtd - 1 where jogador_id = $1 and item_id = $2", [j.id, RELIQUIA]);
    return r.saidas;
  }

  /** Explorando, um Meio-humano que ainda pode evoluir (e já tem nível para o próximo despertar) às vezes acha uma relíquia. */
  async function aoExplorar(j, para) {
    if (j.classe !== "Meio-humano" || !feraDe(j.tipo_animal)) return [];
    const atual = await estagioDe(j.id);
    if (atual >= 3 || j.nivel < NIVEL_ESTAGIO[atual] || rng() >= CHANCE_RELIQUIA) return [];
    if ((await db.query("select 1 from jogo.inventario where jogador_id = $1 and item_id = $2", [j.id, RELIQUIA])).length) return [];
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, $2, 'historia', 1, '{}') on conflict (jogador_id, item_id) do nothing`, [j.id, RELIQUIA]);
    return [{ para, texto: `Meio enterrado, há um osso pequeno e liso, gravado com um desenho que você reconhece sem nunca ter visto: uma ${FERAS[j.tipo_animal].ser}. Quando você encosta nele, o seu próprio coração erra uma batida.\n\n*Você encontrou uma Relíquia do Sangue Antigo.*\n${rodape("para despertar a fera: usar relíquia", "o grupo vai ficar sabendo")}` }];
  }

  async function comando(j, t, para) {
    if (!/^(fera|minha fera|forma|minha forma|transformacao|despertar)$/.test(t)) return { tratado: false, saidas: [] };
    const f = j.classe === "Meio-humano" ? feraDe(j.tipo_animal) : null;
    if (!f) return { tratado: true, saidas: [{ para, texto: "Só os Meio-humanos carregam uma fera no sangue." }] };
    const atual = await estagioDe(j.id), temMana = j.mp_max > 0;
    const linhas = f.estagios.map((e, i) => i < atual ? `${"◆".repeat(i + 1)} *${e.nome}*\n   ${linhaHab(e.hab, temMana)}` : `${"◇".repeat(i + 1)} _${i === atual ? e.nome : "???"} — ${i === atual ? `nível ${NIVEL_ESTAGIO[i]} e uma Relíquia do Sangue Antigo` : "ainda dormindo"}_`);
    const texto = `*A ${f.ser} no seu sangue*\n\n${linhas.join("\n")}\n\n${rodape(atual ? `${atual} de 3 despertares` : "ainda não despertou", atual < 3 ? "relíquias aparecem para quem explora" : "forma final", "as habilidades despertas já estão no menu das suas lutas")}`;
    return { tratado: true, saidas: [atual && j.avatar_dna ? { para, imagem: arte(j, atual), legenda: texto } : { para, texto }] };
  }

  return { comando, transformar, usarReliquia, aoExplorar, estagioDe, habilidades: async (j) => (j.classe === "Meio-humano" ? habilidadesDaFera(j.tipo_animal, await estagioDe(j.id)) : []) };
}
