// Transformação mística dos Meio-humanos: cada um carrega um animal no sangue (raposa, lobo, tigre, corvo, serpente,
// coelho ou dragão menor) e pode despertá-lo em 3 estágios. Cada estágio soma UMA habilidade nova às que a classe já tem
// (nada é trocado nem retirado). O estágio sobe por uma Relíquia do Sangue Antigo (achada explorando) ou pelo mestre.
export const NIVEL_ESTAGIO = [1, 20, 40]; // nível mínimo para a relíquia funcionar em cada estágio (o mestre pode passar por cima)
export const CHANCE_RELIQUIA = 0.06;      // por exploração, para um Meio-humano que ainda pode evoluir e não tem uma relíquia

const H = (n, nome, frase, resumo, x) => ({ estagio: n, nome, frase, resumo, nivel: 1, ...x });
export const FERAS = {
  raposa: { ser: "raposa", criatura: { tipo: "fera", orelhas: "pontudas", focinho: "longo" },
    estagios: [
      { nome: "Raposa de Uma Cauda", extra: { caudas: 1 }, hab: H(1, "Fogo-Fátuo", "Uma chama azul dança na ponta da sua cauda.", "golpe de força 1,3 e queimadura por 3 rodadas", { tipo: "melhor", poder: 1.3, queima: 3, mp: 10, recarga: 3 }) },
      { nome: "Raposa de Três Caudas", extra: { caudas: 3, marcas: ["brasas"] }, hab: H(2, "Ilusão das Três Caudas", "Há três de você. Só uma é de verdade.", "esquiva 70% por 1 rodada e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.7, duracao: 1, foco: true, mp: 12, recarga: 4 }) },
      { nome: "Kyūbi, a de Nove Caudas", extra: { caudas: 9, marcas: ["brasas", "coroa-espirito"] }, hab: H(3, "Nove Caudas", "As nove caudas se abrem como um leque de fogo.", "cinco golpes de força 0,5", { tipo: "melhor", poder: 0.5, golpes: 5, mp: 26, recarga: 5 }) },
    ] },
  lobo: { ser: "lobo", criatura: { tipo: "fera", orelhas: "pontudas", focinho: "longo", dentes: true },
    estagios: [
      { nome: "Lobo Jovem", extra: {}, hab: H(1, "Mordida da Matilha", "Você morde e não solta.", "golpe de força 1,6 que recupera vida", { tipo: "fisico", poder: 1.6, rouba: 0.3, mp: 10, recarga: 3 }) },
      { nome: "Lobo da Lua Cheia", extra: { crina: true }, hab: H(2, "Uivo da Lua Cheia", "O uivo sobe e a lua responde.", "enfraquece o inimigo por 3 rodadas e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.3, duracao: 1, enfraqueceAlvo: 3, foco: true, mp: 12, recarga: 4 }) },
      { nome: "Ōkami, o Lobo Ancestral", extra: { crina: true, marcas: ["geada", "coroa-espirito"] }, hab: H(3, "Caçada", "Não existe lugar para onde a presa possa correr.", "golpe de força 2,4 que atravessa 30% da defesa", { tipo: "fisico", poder: 2.4, ignoraDef: 0.3, mp: 24, recarga: 5 }) },
    ] },
  tigre: { ser: "tigre", criatura: { tipo: "fera", orelhas: "redondas", focinho: "curto", dentes: true },
    estagios: [
      { nome: "Tigre Rajado", extra: { marcas: ["bigodes"] }, hab: H(1, "Garra Rajada", "Duas patadas antes que ele pisque.", "dois golpes de força 0,9", { tipo: "fisico", poder: 0.9, golpes: 2, mp: 10, recarga: 3 }) },
      { nome: "Tigre das Montanhas", extra: { marcas: ["bigodes", "presas"] }, hab: H(2, "Bote", "Você se encolhe, e o mundo fica lento.", "golpe de força 1,9 que quebra a guarda", { tipo: "fisico", poder: 1.9, postura: 3, mp: 14, recarga: 4 }) },
      { nome: "Byakko, o Tigre Branco", extra: { marcas: ["bigodes", "presas", "raios", "coroa-espirito"] }, hab: H(3, "Rugido do Rei", "O rugido chega antes das garras.", "golpe de força 2,2 que prende o inimigo por 1 rodada", { tipo: "fisico", poder: 2.2, prende: 1, mp: 26, recarga: 5 }) },
    ] },
  corvo: { ser: "corvo", criatura: { tipo: "ave" },
    estagios: [
      { nome: "Corvo Mensageiro", extra: {}, hab: H(1, "Chuva de Penas", "Penas duras como facas.", "três golpes de força 0,55", { tipo: "melhor", poder: 0.55, golpes: 3, mp: 10, recarga: 3 }) },
      { nome: "Corvo de Três Olhos", extra: { crista: true, marcas: ["olho-terceiro"] }, hab: H(2, "Olho do Presságio", "Você vê o golpe antes de ele existir.", "esquiva 60% por 1 rodada e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.6, duracao: 1, foco: true, mp: 12, recarga: 4 }) },
      { nome: "Yatagarasu, o Corvo do Sol", extra: { crista: true, marcas: ["olho-terceiro", "brasas", "coroa-espirito"] }, hab: H(3, "Asas da Meia-Noite", "As asas cobrem o céu, e depois cobrem ele.", "golpe de força 2,3 que enfraquece e atravessa 20% da defesa", { tipo: "melhor", poder: 2.3, enfraquece: 2, ignoraDef: 0.2, mp: 24, recarga: 5 }) },
    ] },
  serpente: { ser: "serpente", criatura: { tipo: "serpente", chifres: false },
    estagios: [
      { nome: "Serpente do Capim", extra: {}, hab: H(1, "Presa Venenosa", "Um toque. O veneno faz o resto.", "golpe de força 1,2 e veneno por 4 rodadas", { tipo: "fisico", poder: 1.2, queima: 4, mp: 10, recarga: 3 }) },
      { nome: "Serpente Branca", extra: { bigodes: true }, hab: H(2, "Constrição", "Você se enrola nele e aperta.", "golpe de força 1,4 que prende por 1 rodada", { tipo: "fisico", poder: 1.4, prende: 1, mp: 16, recarga: 5 }) },
      { nome: "Orochi, a Serpente Sem Fim", extra: { bigodes: true, chifres: true, marcas: ["estrelas"] }, hab: H(3, "Troca de Pele", "A pele velha fica para trás, com as feridas.", "cura 35% da vida e protege por 2 rodadas", { tipo: "cura", cura: 0.35, protecao: 0.5, duracao: 2, mp: 24, recarga: 5 }) },
    ] },
  coelho: { ser: "coelho", criatura: { tipo: "fera", orelhas: "abanadas", focinho: "curto" },
    estagios: [
      { nome: "Coelho do Campo", extra: {}, hab: H(1, "Salto Lunar", "Você some para cima e volta com o pé na cara dele.", "golpe de força 1,5 com +3 no dado", { tipo: "fisico", poder: 1.5, dado: 3, mp: 8, recarga: 3 }) },
      { nome: "Coelho das Neves", extra: { marcas: ["geada"] }, hab: H(2, "Pé Ligeiro", "Onde ele bate, você já não está.", "esquiva 80% por 1 rodada e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.8, duracao: 1, foco: true, mp: 12, recarga: 4 }) },
      { nome: "Tsuki no Usagi, o Coelho da Lua", extra: { marcas: ["geada", "estrelas", "coroa-espirito"] }, hab: H(3, "Elixir da Lua", "Você soca o pilão da lua, e a vida volta.", "cura 30% da vida e protege por 2 rodadas", { tipo: "cura", cura: 0.3, protecao: 0.4, duracao: 2, mp: 22, recarga: 5 }) },
    ] },
  dragao_menor: { ser: "dragão menor", criatura: { tipo: "serpente", asas: true },
    estagios: [
      { nome: "Filhote de Dragão", extra: { asas: false }, hab: H(1, "Sopro Menor", "Ainda é pequeno. Ainda queima.", "golpe de força 1,5 e queimadura por 3 rodadas", { tipo: "melhor", poder: 1.5, queima: 3, mp: 12, recarga: 3 }) },
      { nome: "Dragão Alado", extra: { asas: true }, hab: H(2, "Escamas", "As escamas se fecham umas sobre as outras.", "corta 70% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.7, duracao: 2, mp: 14, recarga: 5 }) },
      { nome: "Ryūjin, o Dragão Menor Desperto", extra: { asas: true, bigodes: true, marcas: ["estrelas", "coroa-espirito"] }, hab: H(3, "Voo Rasante", "Você desce do céu como uma sentença.", "golpe de força 2,5 que atravessa 30% da defesa", { tipo: "melhor", poder: 2.5, ignoraDef: 0.3, mp: 28, recarga: 5 }) },
    ] },
};
for (const [k, f] of Object.entries(FERAS)) f.estagios.forEach((e, i) => { e.hab.id = `fe-${k.replace("_", "")}-${i + 1}`; e.hab.origem = "fera"; });

export const feraDe = (tipoAnimal) => FERAS[tipoAnimal] ?? null;
/** Habilidades que a transformação soma, até o estágio atual (0 = ainda não despertou). */
export const habilidadesDaFera = (tipoAnimal, estagio = 0) => (FERAS[tipoAnimal]?.estagios ?? []).slice(0, Math.max(0, Math.min(3, estagio))).map((e) => e.hab);

// Traços que a união soma ao retrato do próprio jogador, por estágio (acumulam). O rosto, o cabelo, a pele e a roupa continuam os dele.
const UNIAO_COMUM = [
  { boca: "presa", olhos: "afiado" },                                  // 1º: presas e olhar de fera
  { acessorios: ["pelagem", "pintura-crescente"] },                    // 2º: pelagem no corpo e a marca da lua no rosto
  { acessorios: ["halo", "brasas"], olhos: "brilho", brilhoAura: true }, // 3º: aura, fagulhas e olhos acesos
];
const UNIAO_ANIMAL = {
  raposa: [{ acessorios: ["orelhas-raposa"] }, {}, {}],
  lobo: [{ acessorios: ["orelhas-lobo"] }, {}, {}],
  tigre: [{ acessorios: ["orelhas-gato"] }, { acessorios: ["cicatriz"] }, {}],
  corvo: [{ acessorios: ["asas-penas"] }, { acessorios: ["pena"] }, {}],
  serpente: [{ acessorios: ["chifres-pequenos"] }, {}, { olhos: "dragao" }],
  coelho: [{ acessorios: ["orelhas-raposa"] }, { acessorios: ["rubor"] }, {}],
  dragao_menor: [{ acessorios: ["chifres-pequenos"] }, { acessorios: ["chifres-dragao"] }, { acessorios: ["asas-morcego", "sombra-dragao"], olhos: "dragao" }],
};
/**
 * O personagem DEPOIS da união: o retrato dele com os traços da fera somados, até o estágio dado.
 * `base` é o retrato original (guardado em avatar_dna.base no primeiro despertar), para os estágios não se acumularem errado.
 */
export function dnaUniao(base, tipoAnimal, estagio) {
  const d = { ...base, acessorios: [...(base.acessorios ?? [])] };
  for (let i = 0; i < Math.min(3, estagio); i++) for (const camada of [UNIAO_COMUM[i], UNIAO_ANIMAL[tipoAnimal]?.[i] ?? {}]) {
    for (const a of camada.acessorios ?? []) if (!d.acessorios.includes(a)) d.acessorios.push(a);
    for (const k of ["boca", "olhos", "brilhoAura"]) if (camada[k] !== undefined) d[k] = camada[k];
  }
  // chifres pequenos dão lugar aos de dragão quando eles chegam
  if (d.acessorios.includes("chifres-dragao")) d.acessorios = d.acessorios.filter((a) => a !== "chifres-pequenos");
  return { ...d, id: `${base.id ?? "j"}-uniao-${estagio}` };
}

/** DNA da forma animal, com as cores do próprio jogador (pelo = cor do cabelo, olhos = cor dos olhos, aura = elemento dele). */
export function dnaFera(tipoAnimal, estagio, dnaJogador, cores) {
  const f = FERAS[tipoAnimal], e = f.estagios[estagio - 1];
  const pelo = cores.cabelo[dnaJogador?.corCabelo] ?? "#8a8a92";
  return { id: `fera-${tipoAnimal}-${estagio}`, ...f.criatura, ...e.extra, cor: pelo, corCauda: pelo, corOlhos: dnaJogador?.corOlhos ?? "dourado",
    corAsas: pelo, corCrina: pelo, elemento: dnaJogador?.elemento ?? "Vazio", brilhoAura: estagio >= 2 };
}
