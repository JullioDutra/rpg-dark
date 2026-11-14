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
// ── Força da Natureza: o espírito do lugar onde a pessoa nasceu cresce nela. Um por reino, mesmos 3 estágios. ──
const NAT = (ser, pal, traco, estagios) => ({ ser, linhagem: "natureza", corBase: pal.casca, paleta: pal, traco, criatura: { tipo: "arvore", corFolha: pal.folha, corFlor: pal.flor }, estagios });
Object.assign(FERAS, {
  "nat-Homura": NAT("espírito das cinzas férteis", { casca: "#4a3430", folha: "#d8642a", flor: "#ffd23a" }, "brasas", [
    { nome: "Broto de Cinza", criatura: { porte: 1 }, extra: {}, hab: H(1, "Semente de Brasa", "Uma semente acesa cai da sua mão e cria raiz no inimigo.", "golpe de força 1,3 e queimadura por 3 rodadas", { tipo: "melhor", poder: 1.3, queima: 3, mp: 10, recarga: 3 }) },
    { nome: "Guardião da Queimada", criatura: { porte: 2 }, extra: { marcas: ["brasas"] }, hab: H(2, "Casca de Carvão", "A sua pele endurece como tronco queimado.", "corta 70% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.7, duracao: 2, mp: 14, recarga: 5 }) },
    { nome: "Hi-no-Kodama, a Floresta que Renasce", criatura: { porte: 3 }, extra: { marcas: ["brasas", "estrelas"] }, hab: H(3, "Renascer das Cinzas", "Onde queimou, brota de novo. Em você também.", "cura 35% da vida e protege por 2 rodadas", { tipo: "cura", cura: 0.35, protecao: 0.5, duracao: 2, mp: 24, recarga: 5 }) },
  ]),
  "nat-Watatsumi": NAT("espírito do mangue e do lótus", { casca: "#4a6258", folha: "#3aa890", flor: "#ff9ac8" }, "fitas-agua", [
    { nome: "Broto de Lótus", criatura: { porte: 1 }, extra: {}, hab: H(1, "Raiz Encharcada", "Raízes molhadas sobem pelos pés dele.", "golpe de força 1,2 que prende por 1 rodada", { tipo: "melhor", poder: 1.2, prende: 1, mp: 12, recarga: 4 }) },
    { nome: "Guardião do Mangue", criatura: { porte: 2 }, extra: { marcas: ["geada"] }, hab: H(2, "Orvalho", "Cada folha sua guarda uma gota.", "cura 30% da vida", { tipo: "cura", cura: 0.3, mp: 14, recarga: 4 }) },
    { nome: "Mizu-no-Kodama, o Lótus de Mil Anos", criatura: { porte: 3 }, extra: { marcas: ["geada", "estrelas"] }, hab: H(3, "Maré Verde", "A floresta inteira se levanta como uma onda.", "golpe de força 2,3 que enfraquece", { tipo: "melhor", poder: 2.3, enfraquece: 3, mp: 26, recarga: 5 }) },
  ]),
  "nat-Daichi": NAT("espírito do carvalho", { casca: "#6a4a2a", folha: "#4a9a3a", flor: "#ffe07a" }, "raizes", [
    { nome: "Broto de Carvalho", criatura: { porte: 1 }, extra: {}, hab: H(1, "Chicote de Cipó", "Um cipó estala no ar.", "dois golpes de força 0,8", { tipo: "melhor", poder: 0.8, golpes: 2, mp: 10, recarga: 3 }) },
    { nome: "Guardião do Bosque", criatura: { porte: 2 }, extra: {}, hab: H(2, "Casca de Carvalho", "Sua pele vira casca grossa.", "corta 75% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.75, duracao: 2, mp: 14, recarga: 5 }) },
    { nome: "Ō-Kodama, o Carvalho Ancião", criatura: { porte: 3 }, extra: { marcas: ["estrelas"] }, hab: H(3, "Punho da Floresta", "Um tronco inteiro desce como um punho.", "golpe de força 2,5 que quebra a guarda", { tipo: "melhor", poder: 2.5, postura: 3, mp: 28, recarga: 5 }) },
  ]),
  "nat-Fūjin": NAT("espírito da cerejeira e do bambu", { casca: "#5a4038", folha: "#f0a0c8", flor: "#ffffff" }, "pena", [
    { nome: "Broto de Cerejeira", criatura: { porte: 1 }, extra: {}, hab: H(1, "Chuva de Pétalas", "Pétalas cortam como papel.", "três golpes de força 0,55", { tipo: "melhor", poder: 0.55, golpes: 3, mp: 10, recarga: 3 }) },
    { nome: "Guardião do Bambuzal", criatura: { porte: 2 }, extra: {}, hab: H(2, "Dobrar com o Vento", "Você se curva, e o golpe passa.", "esquiva 80% por 1 rodada e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.8, duracao: 1, foco: true, mp: 12, recarga: 4 }) },
    { nome: "Kaze-no-Kodama, a Cerejeira Eterna", criatura: { porte: 3 }, extra: { marcas: ["estrelas"] }, hab: H(3, "Florada", "A árvore inteira floresce de uma vez.", "cinco golpes de força 0,5", { tipo: "melhor", poder: 0.5, golpes: 5, mp: 26, recarga: 5 }) },
  ]),
});
// ── Mago: os Círculos Arcanos. A escola vem do elemento do mago; a cor é a do elemento dele. ──
const ARC = (ser, cor, traco, atr, estagios) => ({ ser, linhagem: "arcano", corBase: cor, traco, criatura: { tipo: "arcano" }, estagios: estagios.map((e, i) => ({ ...e, criatura: { porte: i + 1 }, extra: {} })) });
Object.assign(FERAS, {
  "arc-chama": ARC("Escola da Chama", "#ff6a2a", "brasas", null, [
    { nome: "Primeiro Círculo — Iniciado da Chama", hab: H(1, "Lança de Chamas", "O círculo gira uma vez, e o ar pega fogo em linha reta.", "magia de força 1,4 e queimadura por 3 rodadas", { tipo: "magico", poder: 1.4, queima: 3, mp: 12, recarga: 3 }) },
    { nome: "Segundo Círculo — Adepto da Chama", hab: H(2, "Manto Incandescente", "O calor em volta de você dobra a luz.", "corta 60% do dano por 2 rodadas e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.6, duracao: 2, foco: true, mp: 16, recarga: 5 }) },
    { nome: "Terceiro Círculo — Arquimago do Sol", hab: H(3, "Sol Menor", "Três círculos se alinham, e nasce um sol do tamanho de um punho.", "magia de força 2,6 e queimadura por 3 rodadas", { tipo: "magico", poder: 2.6, queima: 3, mp: 30, recarga: 5 }) },
  ]),
  "arc-mare": ARC("Escola da Maré", "#3aa0ff", "fitas-agua", null, [
    { nome: "Primeiro Círculo — Iniciado da Maré", hab: H(1, "Agulhas de Gelo", "Três gotas param no ar e viram agulhas.", "três magias de força 0,55", { tipo: "magico", poder: 0.55, golpes: 3, mp: 12, recarga: 3 }) },
    { nome: "Segundo Círculo — Adepto da Maré", hab: H(2, "Espelho d'Água", "Uma parede de água devolve a imagem do golpe.", "corta 75% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.75, duracao: 2, mp: 16, recarga: 5 }) },
    { nome: "Terceiro Círculo — Arquimago do Abismo", hab: H(3, "Maré Absoluta", "O mar inteiro cabe dentro de um círculo.", "magia de força 2,2 que prende por 1 rodada", { tipo: "magico", poder: 2.2, prende: 1, mp: 30, recarga: 5 }) },
  ]),
  "arc-pedra": ARC("Escola da Pedra", "#e0b050", "cristais", null, [
    { nome: "Primeiro Círculo — Iniciado da Pedra", hab: H(1, "Estilhaço", "Um cristal nasce e explode no mesmo instante.", "magia de força 1,4 que abala a guarda", { tipo: "magico", poder: 1.4, postura: 2, mp: 12, recarga: 3 }) },
    { nome: "Segundo Círculo — Adepto da Pedra", hab: H(2, "Muralha Rúnica", "As runas se levantam do chão como tijolos.", "corta 80% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.8, duracao: 2, mp: 16, recarga: 5 }) },
    { nome: "Terceiro Círculo — Arquimago da Montanha", hab: H(3, "Meteoro", "Você aponta para cima. O céu obedece.", "magia de força 2,6 que atravessa 30% da defesa", { tipo: "magico", poder: 2.6, ignoraDef: 0.3, mp: 30, recarga: 5 }) },
  ]),
  "arc-tempestade": ARC("Escola da Tempestade", "#7ff0d8", "pena", null, [
    { nome: "Primeiro Círculo — Iniciado da Tempestade", hab: H(1, "Fagulha em Cadeia", "A fagulha pula duas vezes antes de sumir.", "duas magias de força 0,8", { tipo: "magico", poder: 0.8, golpes: 2, mp: 12, recarga: 3 }) },
    { nome: "Segundo Círculo — Adepto da Tempestade", hab: H(2, "Passo do Relâmpago", "Você já estava em outro lugar quando o golpe chegou.", "esquiva 80% por 1 rodada e o próximo golpe vale +50%", { tipo: "guarda", protecao: 0.8, duracao: 1, foco: true, mp: 14, recarga: 4 }) },
    { nome: "Terceiro Círculo — Arquimago do Trovão", hab: H(3, "Juízo do Trovão", "O raio cai onde o círculo manda.", "magia de força 2,4 que prende por 1 rodada", { tipo: "magico", poder: 2.4, prende: 1, mp: 30, recarga: 5 }) },
  ]),
  "arc-veu": ARC("Escola do Véu", "#c090ff", "veias-vazio", null, [
    { nome: "Primeiro Círculo — Iniciado do Véu", hab: H(1, "Dardo Astral", "Um ponto de luz que não erra.", "magia de força 1,3 com +3 no dado", { tipo: "magico", poder: 1.3, dado: 3, mp: 12, recarga: 3 }) },
    { nome: "Segundo Círculo — Adepto do Véu", hab: H(2, "Véu das Horas", "O tempo em volta de você anda mais devagar.", "cura 30% da vida e protege por 2 rodadas", { tipo: "cura", cura: 0.3, protecao: 0.5, duracao: 2, mp: 18, recarga: 5 }) },
    { nome: "Terceiro Círculo — Arquimago das Estrelas", hab: H(3, "Colapso Estelar", "Uma estrela inteira morre dentro do círculo.", "magia de força 2,5 que enfraquece", { tipo: "magico", poder: 2.5, enfraquece: 3, mp: 30, recarga: 5 }) },
  ]),
});
/** A escola arcana de cada elemento (o que não estiver aqui estuda o Véu). */
const ESCOLA = { Fogo: "chama", Lava: "chama", Explosão: "chama", Cinzas: "chama", Água: "mare", Gelo: "mare", Espelho: "mare", Veneno: "mare",
  Terra: "pedra", Metal: "pedra", Cristal: "pedra", Madeira: "pedra", Natureza: "pedra", Vento: "tempestade", Raio: "tempestade", Som: "tempestade" };
export const escolaArcana = (atributoMagico = "") => `arc-${ESCOLA[String(atributoMagico).split(/[\s(—-]/)[0]] ?? "veu"}`;
/** Chave do despertar de um jogador: o animal do Meio-humano, ou o espírito do reino da Força da Natureza. null = a classe não desperta. */
export function chaveDespertar(j) {
  if (j?.classe === "Meio-humano") return FERAS[j.tipo_animal] ? j.tipo_animal : null;
  if (j?.classe === "Mago") return escolaArcana(j.atributo_magico);
  if (j?.classe === "Força da Natureza") return FERAS[`nat-${j.reino}`] ? `nat-${j.reino}` : "nat-Daichi";
  return null;
}
/** Cada despertar também fortalece: +6%, +12% e +20% nos dois atributos da forma (calculado sobre os atributos do jogador). */
export const BONUS_ESTAGIO = [0.06, 0.12, 0.2];
const ATRIBUTOS_FORMA = { raposa: ["MAG", "VEL"], lobo: ["FOR", "VEL"], tigre: ["FOR", "DEF"], corvo: ["VEL", "SOR"], serpente: ["RES", "MAG"], coelho: ["VEL", "SOR"], dragao_menor: ["FOR", "MAG"],
  "nat-Homura": ["MAG", "FOR"], "nat-Watatsumi": ["MAG", "RES"], "nat-Daichi": ["DEF", "RES"], "nat-Fūjin": ["MAG", "VEL"],
  "arc-chama": ["MAG", "VEL"], "arc-mare": ["MAG", "RES"], "arc-pedra": ["MAG", "DEF"], "arc-tempestade": ["MAG", "VEL"], "arc-veu": ["MAG", "SOR"] };
export const atributosDaForma = (chave) => ATRIBUTOS_FORMA[chave] ?? [];
/** Bônus de atributos do despertar, no mesmo formato do bônus de equipamento ({ FOR: 6, VEL: 4 }). */
export function bonusDespertar(chave, estagio, atributos = {}) {
  if (!estagio || !ATRIBUTOS_FORMA[chave]) return {};
  const pct = BONUS_ESTAGIO[Math.min(3, estagio) - 1];
  return Object.fromEntries(ATRIBUTOS_FORMA[chave].map((k) => [k, Math.max(1, Math.round((atributos[k] ?? 0) * pct))]));
}
export const somarBonus = (...bs) => { const r = {}; for (const b of bs) for (const [k, v] of Object.entries(b ?? {})) r[k] = (r[k] ?? 0) + v; return r; };

for (const [k, f] of Object.entries(FERAS)) f.estagios.forEach((e, i) => { e.hab.id = `fe-${k.replace(/[^a-zA-Z]/g, "").toLowerCase()}-${i + 1}`; e.hab.origem = "fera"; });
for (const f of Object.values(FERAS)) f.linhagem ??= "fera";

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
  const f = FERAS[tipoAnimal];
  // Força da Natureza: folhas no cabelo; depois galhos e o traço do reino (brasas, água, raízes, pena); no fim, coroa de flores e aura — tudo nas cores do reino
  const comum = f?.linhagem === "natureza" ? [{ acessorios: ["folhas"], corFolha: f.paleta.folha, corFlor: f.paleta.flor, corGalho: f.paleta.casca }, { acessorios: ["galhos", f.traco], olhos: "brilho" }, { acessorios: ["coroa-flores", "halo"], brilhoAura: true }] : UNIAO_COMUM;
  // Mago: runas no rosto; depois o círculo atrás da cabeça e os olhos acesos; no fim, orbes em órbita e aura — na cor do elemento dele
  const arc = f?.linhagem === "arcano" ? [{ acessorios: ["runas"] }, { acessorios: ["circulo-arcano"], olhos: "brilho" }, { acessorios: ["orbes", f.traco], brilhoAura: true }] : null;
  for (let i = 0; i < Math.min(3, estagio); i++) for (const camada of [(arc ?? comum)[i], UNIAO_ANIMAL[tipoAnimal]?.[i] ?? {}]) {
    for (const a of camada.acessorios ?? []) if (!d.acessorios.includes(a)) d.acessorios.push(a);
    for (const k of ["boca", "olhos", "brilhoAura", "corFolha", "corFlor", "corGalho"]) if (camada[k] !== undefined) d[k] = camada[k];
  }
  // chifres pequenos dão lugar aos de dragão quando eles chegam
  if (d.acessorios.includes("chifres-dragao")) d.acessorios = d.acessorios.filter((a) => a !== "chifres-pequenos");
  return { ...d, id: `${base.id ?? "j"}-uniao-${estagio}` };
}

/** DNA da forma animal, com as cores do próprio jogador (pelo = cor do cabelo, olhos = cor dos olhos, aura = elemento dele). */
export function dnaFera(tipoAnimal, estagio, dnaJogador, cores) {
  const f = FERAS[tipoAnimal], e = f.estagios[estagio - 1];
  const cabelo = cores.cabelo[dnaJogador?.corCabelo] ?? "#8a8a92";
  // a fera tem o pelo da cor do cabelo; o espírito da natureza tem a cor do reino, com olhos e brilho do jogador
  // o eu arcano tem a cor do elemento do mago (cores.elemento), ou a da escola
  const pelo = (f.linhagem === "arcano" && cores.elemento?.[String(dnaJogador?.elemento ?? "").split(/[\s(—-]/)[0]]?.aura) || f.corBase || cabelo;
  return { id: `fera-${tipoAnimal}-${estagio}`, ...f.criatura, ...(e.criatura ?? {}), ...e.extra, corNucleo: cabelo, corCoroa: cabelo, cor: pelo, corCauda: pelo, corOlhos: dnaJogador?.corOlhos ?? "dourado",
    corAsas: pelo, corCrina: pelo, elemento: dnaJogador?.elemento ?? "Vazio", brilhoAura: estagio >= 2 };
}
