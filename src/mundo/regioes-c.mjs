// Mundo vivo — parte C: novas personagens femininas, gênero dos NPCs e o retrato (avatar em pixel art) de cada um.
import { N } from "./regioes-a.mjs";

/** NPCs femininas (as que já existiam + as novas). Usado nos retratos e na concordância dos textos. */
export const FEMININAS = new Set(["oharu", "velha-sumi", "sargento-ibuki", "tomoe", "anciã-kagero", "akane", "nami", "shizu", "rin", "vo-ume", "yuki",
  "irma-mizu", "kiku", "avo-nara", "hana", "professora-ine", "tia-yone", "capita-tsuru", "carteira-suzu", "khan-borte", "dama-ito", "oto",
  "recepcionista-mei", "eco-de-sayo",
  // novas
  "mestra-tsuchi", "kaede", "mio", "nagisa", "kasumi", "shion", "tsubame", "kon", "aoi", "ran", "tsubaki", "sora", "koto", "homare", "akemi", "fuyu"]);
export const IDOSOS = new Set(["velha-sumi", "anciã-kagero", "vo-ume", "avo-nara", "mestre-uo", "velho-kaze", "anciao-mayoi", "mestre-ganji", "barqueiro",
  "monge-jizo", "escriba", "mestra-tsuchi", "oboro", "bardo-utai"]);
export const CRIANCAS = new Set(["kenta", "rin", "sota", "pequeno-eco", "eco-de-sayo", "kon"]);

/** Novas personagens: [região, local, id, N(...)] */
export const NOVAS = [
  ["R-DAI-6", "ishigaki", "mestra-tsuchi", N("Mestra Tsuchi", "mestra cega dos Passos da Terra", "fala rindo de quem enxerga, bate o pé no chão antes de responder",
    "quem nasceu da terra pode aprender a ver com os pés: perde os olhos, ganha o mundo inteiro; ela guarda o pergaminho para quem tiver coragem")],
  ["R-HOM-5", "porto", "kaede", N("Kaede", "ferreira errante, filha do forjador Gōen", "fala seca, com as mãos sempre ocupadas",
    "o pai não caiu no rio: foi empurrado por ordem de um nobre que cobiçava a forja real; o martelo que ainda bate lá dentro chama por ela", true)],
  ["R-HOM-7", "torres", "mio", N("Mio", "caçadora de relíquias", "fala baixo e rápido, como quem não quer acordar as ruínas",
    "nas torres afogadas há tábuas de pedra com uma ordem assinada por quatro selos reais: 'enviem homens para a obra do vale'")],
  ["R-HOM-2", "enjo", "tsubaki", N("Tsubaki", "armeira do quartel de Enjō", "fala contando peças, desconfia de todo mundo que não sua",
    "o general Bakuen encomendou o triplo de armas e mandou marcar tudo com o brasão de Watatsumi, para culpar o outro reino", true)],
  ["R-HOM-1", "coliseu", "homare", N("Homare", "duelista aposentada que treina novatas", "fala alto, ri com o corpo inteiro, chama todo mundo para lutar",
    "Kagari, a duelista mascarada, tem o mesmo jogo de pés da família real; Homare ensinou esse passo a uma princesa, anos atrás")],
  ["R-WAT-7", "borda", "nagisa", N("Nagisa", "mergulhadora de pérolas", "fala prendendo o ar, com pausas longas",
    "lá embaixo a água fica preta e fria como a que escorre dos guardas corrompidos; o Vazio sobe pelo fundo do mar", true)],
  ["R-WAT-4", "kirigakure", "kasumi", N("Kasumi", "aprendiz fugida da Bruxa-Mãe", "fala assustada, olhando por cima do ombro",
    "a Bruxa-Mãe guarda num pote os anos que tomou das pessoas; se o pote quebrar, os anos voltam para os donos")],
  ["R-WAT-6", "mirante", "akemi", N("Akemi", "peregrina que procura o companheiro espiritual", "fala esperançosa, faz muitas perguntas",
    "os espíritos escolhem quem ouve a água chamar; ela veio três vezes e nenhum a escolheu, mas continua vindo")],
  ["R-WAT-5", "acampamento", "fuyu", N("Fuyu", "curandeira do acampamento do gelo", "fala calma, esquenta as mãos dos outros sem pedir licença",
    "os soldados congelados ainda respiram bem devagar; estão vivos há 500 anos, esperando uma ordem que nunca chegou")],
  ["R-DAI-7", "entrada", "shion", N("Shion", "sacerdotisa que acalma os mortos", "fala cantando baixinho entre as frases",
    "os mortos de Yomi repetem um nome de menino e o de uma irmã; ninguém vivo lembra quem eram", true)],
  ["R-DAI-1", "forjas", "koto", N("Koto", "guardiã do banco de cristais", "fala medindo cada palavra como quem pesa ouro",
    "o clã Kurogane saca cristais em nome da Guilda de Kyōkai há dez anos; alguém lá está comprando um exército")],
  ["R-FUJ-2", "tsubasa", "tsubame", N("Tsubame", "cavaleira-grifo", "fala olhando o céu, impaciente com quem anda devagar",
    "do alto ela viu: a rachadura no centro do mundo cresceu desde o ano passado, e brilha à noite", true)],
  ["R-FUJ-7", "escadaria", "kon", N("Kon", "menina que cria raposas-trovão", "fala brincando, dá nome a tudo que se mexe",
    "as raposas fogem do altar quando a sacerdotisa canta; bicho sabe quando alguém mexe com o que não deve")],
  ["R-FUJ-4", "hagoromo", "sora", N("Sora", "piloto de nave de vento", "fala rápido, cheia de gírias de estaleiro",
    "a Corsária Hayabusa rouba dos nobres e deixa comida nas ilhas pobres; Sora já voou com ela e não se arrepende")],
  ["R-KOK-2", "posto", "aoi", N("Aoi", "curandeira dos vigias da muralha", "fala cansada, mas não para de trabalhar enquanto fala",
    "quem dorme perto dos pilares rachados sonha a mesma coisa: um menino chamando a irmã do fundo de um poço", true)],
  ["R-KOK-1", "praca", "ran", N("Ran", "alquimista de rua e informante", "fala sorrindo de canto, vende a resposta antes da pergunta",
    "a Guilda compra cristais negros de todos os reinos e ninguém sabe para onde eles vão depois da porta do Mestre")],
];

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return h; };
const PELE_REINO = { Homura: ["morena", "media", "escura"], Watatsumi: ["clara", "media", "palida"], Daichi: ["morena", "media", "escura"], "Fūjin": ["clara", "media", "morena"], "Kokū": ["palida", "media", "clara"] };
const ESPECIAIS = {
  yoru: { cabelo: "tranca-lateral", corCabelo: "prata", olhos: "afiado", corOlhos: "prata", boca: "sorriso", roupa: "manto-alto", acessorios: ["oculos"], corRoupa: ["#1a0f2a", "#c9cacd", "#7b3fb0"] },
  "mestra-tsuchi": { cabelo: "coque", corCabelo: "branco", olhos: "feliz", boca: "sorriso", roupa: "quimono", acessorios: ["venda-olhos"] },
  "eco-de-sayo": { cabelo: "trancas", corCabelo: "preto", olhos: "redondo", corOlhos: "preto", roupa: "quimono", acessorios: ["rubor"], pele: "clara" },
  barqueiro: { pele: "pedra", cabelo: "careca", olhos: "vazio", boca: "seria", roupa: "trapos", acessorios: [] },
  "pequeno-eco": { pele: "esverdeada", cabelo: "espetado", corCabelo: "verde", olhos: "redondo", corOlhos: "preto", roupa: "trapos", acessorios: ["raizes"] },
  escriba: { pele: "espectral", cabelo: "coque", corCabelo: "cinza", olhos: "cansado", roupa: "robe-mago", acessorios: [] },
  "eco-do-arquivo": { pele: "espectral", cabelo: "flutuante", corCabelo: "branco", olhos: "brilho", corOlhos: "azul", roupa: "robe-mago", acessorios: [] },
};

/** DNA do retrato de um NPC: determinístico pelo id, coerente com gênero, idade, papel e reino. */
export function dnaNpc(rid, id, npc, reino) {
  const h = hash(`${rid}:${id}`), pick = (lista, desloca = 0) => lista[(h >>> desloca) % lista.length];
  const fem = FEMININAS.has(id), idoso = IDOSOS.has(id), crianca = CRIANCAS.has(id);
  const papel = npc.papel.toLowerCase();
  const roupa = /nobre|dama|contador|banco|recepcion|mercador|leilo/.test(papel) ? "corte" : /monge|sacerdot|irmã|guardiã cega|peregrin|bardo/.test(papel) ? "sagrada"
    : /sargent|capit|guard|vigia|cavaleir|duelista|juiz/.test(papel) ? "placas" : /bibliotec|professor|estudios|alquim|bruxa|aprendiz|espião/.test(papel) ? "robe-mago"
      : /ferreir|minerador|armeir|pescador|pastor|caçador|mergulh|barqueir|entregador/.test(papel) ? "trapos" : pick(["quimono", "quimono", "samurai"], 3);
  const acess = [];
  if (fem && !crianca) acess.push(pick(["flor", "brincos", "laco", "brincos", "rubor"], 5));
  if (!fem && idoso) acess.push(pick(["barba", "barba-curta", "bigode"], 5));
  if (!fem && !idoso && !crianca && (h >>> 9) % 3 === 0) acess.push(pick(["barba-curta", "cicatriz", "bandana"], 11));
  if (/professor|contador|bibliotec|banco/.test(papel)) acess.push("oculos");
  if (crianca) acess.push("sardas");
  if (/\bceg[ao]\b/.test(papel)) acess.push("venda-olhos");
  const base = {
    id: `npc:${rid}:${id}`, tipo: "humanoide", reino, elemento: { Homura: "Fogo", Watatsumi: "Água", Daichi: "Terra", "Fūjin": "Vento" }[reino] ?? "Vazio", feminino: fem,
    rosto: crianca ? "redondo" : pick(fem ? ["oval", "fino", "redondo"] : ["oval", "quadrado", "largo", "fino"], 2),
    pele: pick(PELE_REINO[reino] ?? PELE_REINO["Kokū"], 7),
    olhos: idoso ? pick(["cansado", "feliz", "afiado"], 4) : crianca ? "grande" : pick(fem ? ["grande", "grande", "redondo", "afiado"] : ["afiado", "grande", "cansado", "redondo"], 4),
    corOlhos: pick(["castanho", "preto", "ambar", "verde", "azul", "cinza"], 13),
    sobrancelha: pick(["neutra", "neutra", "grossa", "brava", "triste"], 15), boca: pick(["neutra", "sorriso", "seria", "sorriso-torto"], 17),
    cabelo: fem ? pick(["longo", "ondulado", "hime", "rabo-alto", "maria-chiquinha", "coque", "trancas", "chanel", "tranca-lateral"], 6)
      : idoso ? pick(["careca", "coque", "baguncado"], 6) : pick(["espetado", "baguncado", "franja-longa", "rabo", "meio-raspado", "coque"], 6),
    corCabelo: idoso ? pick(["branco", "prata", "cinza"], 19) : pick(["preto", "castanho", "preto", "ruivo", "azul-escuro", "loiro", "vinho", "verde"], 19),
    roupa, acessorios: acess,
  };
  return { ...base, ...(ESPECIAIS[id] ?? {}) };
}
