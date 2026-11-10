// Cerimônia do Sorteio (doc 04): casta → aldeia → mana → atributo mágico → pet → classes permitidas.
// Funções puras: recebem os dados do mundo e um rng() em [0, 1). Nada aqui pode ser re-rolado pelo jogador.
import { randomInt } from "node:crypto";

export const rngSeguro = () => randomInt(0, 2 ** 32) / 2 ** 32;

const BASES = ["Fogo", "Água", "Terra", "Vento"];
const ELEMENTO_REINO = { Homura: "Fogo", Watatsumi: "Água", Daichi: "Terra", "Fūjin": "Vento" };
const REINO_JP = { Homura: "焔 Homura-koku", Watatsumi: "水 Watatsumi-koku", Daichi: "土 Daichi-koku", "Fūjin": "風 Fūjin-koku", "Kokū": "虚空 Kokū (Terra Central)" };

function ponderado(pesos, rng) {
  const itens = Object.entries(pesos).filter(([, p]) => p > 0);
  const total = itens.reduce((s, [, p]) => s + p, 0);
  let r = rng() * total;
  for (const [k, p] of itens) if ((r -= p) < 0) return k;
  return itens.at(-1)[0];
}
const escolher = (lista, rng) => lista[Math.floor(rng() * lista.length)];
const faixa = ([a, b], rng) => Math.round(a + rng() * (b - a));

/**
 * @param dados { aldeias, atributos, classes, pets } (conteúdo dos JSON de data/)
 * @param ctx   { reisPorReino: Set<string> } reinos que já têm um Rei neste mundo (máx. 1 por reino)
 */
export function sortear(dados, { reisPorReino = new Set() } = {}, rng = rngSeguro) {
  const { aldeias: A, atributos: M, classes: C, pets: P } = dados;

  // 1ª Estrela — casta e aldeia
  let casta = ponderado(A.pesos_casta, rng);
  let pool = A.aldeias.filter((a) => a.casta === casta && !(casta === "rei" && reisPorReino.has(a.reino)));
  if (!pool.length) { casta = "realeza"; pool = A.aldeias.filter((a) => a.casta === casta); }
  let aldeia = escolher(pool, rng);
  let reino = aldeia.reino;
  if (casta === "indefinido" && rng() < A.chance_indefinido_de_kyokai) {
    reino = "Kokū";
    aldeia = { id: "A-KOK-IND", nome: "Kyōkai", jp: "境界", reino, casta, regiao: "Kyōkai", descricao: "Ninguém sabe onde você nasceu. Você cresceu entre as ruínas da Terra Central." };
  }

  // 2ª Estrela — mana e atributo mágico
  const bonus = C.bonus_casta[casta] ?? {};
  let mana;
  if (bonus.distribuicao === "U") { // Indefinido: forma de U (muito pouca ou muita mana)
    const u = rng(), t = u < 0.5 ? (2 * u) ** 2 / 2 : 1 - (2 * (1 - u)) ** 2 / 2;
    mana = Math.round(bonus.mp_faixa[0] + t * (bonus.mp_faixa[1] - bonus.mp_faixa[0]));
  } else mana = faixa(bonus.mp_faixa ?? [60, 90], rng);

  let elemento, variante = null, raridade, manaUnica = null;
  if (casta === "indefinido" && mana < 15) {
    mana = 0; elemento = "Vazio"; raridade = "lendario";
  } else {
    const base = reino !== "Kokū" && rng() < M.passo_A.elemento_do_reino ? ELEMENTO_REINO[reino]
      : escolher(BASES.filter((b) => b !== ELEMENTO_REINO[reino]), rng);
    const mod = M.modificadores_casta_raro_ou_mais[casta] ?? 1;
    const d = M.passo_B_d1000;
    raridade = ponderado({ variante_comum: d.variante_comum, variante_incomum: d.variante_incomum,
      raro: d.raro * mod, muito_raro: d.muito_raro * mod, lendario: d.lendario * mod }, rng);
    if (raridade === "lendario") {
      const ok = M.raros.lendario.map((l) => l.nome).filter((n) => (n === "Estelar" ? ["realeza", "rei"].includes(casta) : casta === "indefinido"));
      if (ok.length) elemento = escolher(ok, rng); else raridade = "muito_raro";
    }
    if (raridade === "muito_raro" || raridade === "raro") elemento = escolher(M.raros[raridade], rng);
    if (raridade.startsWith("variante")) {
      elemento = base;
      variante = escolher(M.variantes[base][raridade === "variante_comum" ? "comum" : "incomum"], rng);
    }
    if (casta === "rei") manaUnica = `${ELEMENTO_REINO[reino] ?? base} — ${escolher(M.mana_unica_rei.conceitos, rng)}`;
  }

  // 3ª Estrela — pet espiritual (só elegibilidade; o pet é encontrado depois)
  const elegivelPet = rng() < (P.elegibilidade_por_casta[casta] ?? 0);

  // 4ª Estrela — classes permitidas
  let classes = [...C.permissao_por_casta[casta]];
  if (elemento === "Vazio") classes = ["Anti-magia", "Espadachim"];
  else if (casta === "indefinido" && rng() < 0.25) classes.push("Demônio");

  return {
    casta, reino, reinoJp: REINO_JP[reino], aldeia: { id: aldeia.id, nome: aldeia.nome, jp: aldeia.jp, descricao: aldeia.descricao, regiao: aldeia.regiao },
    mana, elemento, variante, raridade, manaUnica, elegivelPet, classes,
    atributoMagico: manaUnica ?? (variante ? `${elemento} (${variante})` : elemento),
  };
}

/** Atributos iniciais (nível 1): base da classe + bônus de casta + bônus de reino nativo. */
export function atributosIniciais(dados, { classe, casta, reino, mana }, rng = rngSeguro) {
  const C = dados.classes, cl = C.classes[classe];
  const at = { ...cl.base };
  const bc = C.bonus_casta[casta] ?? {};
  for (const k of C.atributos) if (bc[k]) at[k] = Math.round(at[k] * (1 + bc[k]));
  const nativos = C.bonus_reino_nativo[reino] ?? [];
  for (const k of nativos) if (k in at) at[k] = Math.round(at[k] * (1 + C.bonus_reino_nativo.valor));
  let hp = cl.hp_base * (1 + (bc.hp ?? 0)) * (nativos.includes("HP") ? 1 + C.bonus_reino_nativo.valor : 1);
  hp = Math.round(hp);
  const mp = Math.round(mana * cl.mult_mp);
  let tipoAnimal = null;
  if (classe === "Meio-humano") tipoAnimal = ponderado(cl.tipos, rng);
  return { atributos: at, hp, mp, tipoAnimal };
}

export const ROTULO_CASTA = { campones: "🧑‍🌾 CAMPONÊS", plebeu: "🧑 PLEBEU", cavaleiro: "🛡️ CAVALEIRO", realeza: "👑 REALEZA", indefinido: "❓ INDEFINIDO", rei: "🔱 REI" };
export const EMOJI_ELEMENTO = { Fogo: "🔥", "Água": "💧", Terra: "🪨", Vento: "🌪️", Luz: "✨", Trevas: "🌑", Natureza: "🌿", Gravidade: "🌀", Sangue: "🩸", Veneno: "☠️", Tempo: "⏳", "Espaço": "🌌", Alma: "👻", Sonho: "💤", Vazio: "⚫", Estelar: "🌟" };
