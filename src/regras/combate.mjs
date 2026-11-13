// Combate por rodadas (doc 08.4, 22.8, 19). Regras puras: recebem estado + ação + rng e devolvem o novo estado.
// v2: cada classe tem 4 habilidades (níveis 1, 5, 12, 25); o jogador escolhe num MENU NUMERADO; toda ação rola um
// DADO de 20 lados que define a eficácia (falha, raspão, firme, forte, perfeito). O servidor guarda o estado em
// jogo.batalhas.estado e aplica XP/vida/recompensas ao final.
import { readFileSync } from "node:fs";
import { TIERS, XP_VILAO, XP_PROXIMO, K, atributosVilao, ARQUETIPOS } from "../../scripts/balanceamento.mjs";
import { CONSUMIVEIS } from "./itens.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const CICLO = ler("reinos.json").ciclo_elemental;
export const CLASSES = ler("classes.json").classes;

// Habilidades: 4 por classe, liberadas nos níveis 1, 5, 12 e 25.
// Efeitos: tipo (fisico|magico|cura|guarda), poder, mp, recarga, golpes, ignoraDef, rouba, cura, curaFixa, postura,
// protecao+duracao, enfraquece, prende, queima (rodadas de dano contínuo), foco (próximo golpe +50%), custoHp, dado (+n no d20), contra.
const H = (nivel, nome, frase, resumo, x) => ({ nivel, nome, frase, resumo, ...x });
export const KITS = {
  Mago: [
    H(1, "Rajada Arcana", "Runas acendem no ar e explodem em luz.", "magia forte", { tipo: "magico", poder: 1.6, mp: 12, recarga: 2 }),
    H(5, "Barreira de Mana", "Um escudo de luz azul se fecha ao seu redor.", "corta 60% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.65, duracao: 2, mp: 8, recarga: 3 }),
    H(12, "Selo Ardente", "Um selo brilha na pele do inimigo e começa a queimar.", "dano e queimadura por 3 rodadas", { tipo: "magico", poder: 1.2, queima: 3, mp: 16, recarga: 3 }),
    H(25, "Meteoro", "O céu escurece. Uma pedra em chamas desce como um julgamento.", "a magia mais forte", { tipo: "magico", poder: 2.6, mp: 30, recarga: 4 }),
  ],
  Cavaleiro: [
    H(1, "Golpe de Escudo", "O escudo bate com um estrondo e você se fecha atrás dele.", "golpe que abala a guarda e protege você", { tipo: "fisico", poder: 1.3, postura: 2, protecao: 0.5, duracao: 1, mp: 8, recarga: 2 }),
    H(5, "Muralha", "Você crava os pés no chão. Nada passa.", "corta 70% do dano por 2 rodadas", { tipo: "guarda", protecao: 0.7, duracao: 2, mp: 10, recarga: 4 }),
    H(12, "Investida", "Você avança com todo o peso da armadura.", "golpe pesado que quebra a guarda", { tipo: "fisico", poder: 1.8, postura: 3, mp: 14, recarga: 3 }),
    H(25, "Juramento de Aço", "Você lembra por quem luta. As feridas pesam menos.", "cura 25% e protege", { tipo: "cura", cura: 0.25, protecao: 0.5, duracao: 2, mp: 20, recarga: 5 }),
  ],
  Bruxo: [
    H(1, "Maldição", "Você sussurra um nome antigo.", "dano e enfraquece por 2 rodadas", { tipo: "magico", poder: 1.3, enfraquece: 2, mp: 12, recarga: 3 }),
    H(5, "Dreno", "Um fio vermelho liga você ao inimigo.", "dano que vira vida para você", { tipo: "magico", poder: 1.4, rouba: 0.6, mp: 10, recarga: 2 }),
    H(12, "Boneco de Palha", "Você espeta o boneco. O inimigo sente.", "dano contínuo por 3 rodadas e enfraquece", { tipo: "magico", poder: 0.9, queima: 3, enfraquece: 3, mp: 16, recarga: 4 }),
    H(25, "Pacto Sombrio", "Você paga com sangue. A sombra cobra em dobro.", "magia terrível que custa vida", { tipo: "magico", poder: 2.5, custoHp: 0.06, rouba: 0.2, mp: 18, recarga: 4 }),
  ],
  "Anti-magia": [
    H(1, "Corte do Vazio", "Sua lâmina passa como se a defesa não existisse.", "atravessa 30% da defesa", { tipo: "fisico", poder: 1.7, ignoraDef: 0.3, mp: 0, recarga: 2 }),
    H(5, "Silêncio", "Você agarra a mana do inimigo e apaga.", "golpe que faz o inimigo perder a vez", { tipo: "fisico", poder: 1.1, prende: 1, mp: 0, recarga: 4 }),
    H(12, "Quebra-Selo", "Seu punho acerta exatamente onde a guarda é mais fraca.", "destrói a guarda do inimigo", { tipo: "fisico", poder: 1.4, postura: 4, mp: 0, recarga: 3 }),
    H(25, "Zero Absoluto", "Por um instante, não existe magia no mundo. Só o seu golpe.", "atravessa metade da defesa", { tipo: "fisico", poder: 2.4, ignoraDef: 0.5, mp: 0, recarga: 4 }),
  ],
  Espadachim: [
    H(1, "Iaijutsu", "A espada sai e volta à bainha num piscar.", "saque rápido: +3 no dado", { tipo: "fisico", poder: 1.5, dado: 3, mp: 8, recarga: 2 }),
    H(5, "Passo Fantasma", "Você some da frente do golpe e reaparece ao lado.", "esquiva 80% e prepara o próximo corte (+50%)", { tipo: "guarda", protecao: 0.8, duracao: 1, foco: true, mp: 8, recarga: 3 }),
    H(12, "Dança de Lâminas", "Dois cortes cruzados, quase ao mesmo tempo.", "dois golpes seguidos", { tipo: "fisico", poder: 1.0, golpes: 2, mp: 14, recarga: 3 }),
    H(25, "Corte do Céu", "A lâmina sobe e o ar se parte atrás dela.", "o corte mais forte", { tipo: "fisico", poder: 2.5, mp: 24, recarga: 4 }),
  ],
  "Meio-humano": [
    H(1, "Fúria da Fera", "Você ruge e ataca sem pensar.", "golpe que recupera vida", { tipo: "fisico", poder: 1.5, rouba: 0.25, mp: 8, recarga: 2 }),
    H(5, "Uivo", "Seu uivo gela o sangue do inimigo.", "enfraquece 2 rodadas e prepara o próximo golpe (+50%)", { tipo: "guarda", protecao: 0, duracao: 0, enfraqueceAlvo: 2, foco: true, mp: 8, recarga: 3 }),
    H(12, "Garras Sangrentas", "Suas garras abrem cortes que não fecham.", "dano e sangramento por 3 rodadas", { tipo: "fisico", poder: 1.3, queima: 3, mp: 12, recarga: 3 }),
    H(25, "Forma Bestial", "Seu corpo muda. Por um momento, você é só instinto.", "golpe brutal que recupera vida", { tipo: "fisico", poder: 2.2, rouba: 0.3, mp: 22, recarga: 4 }),
  ],
  "Força da Natureza": [
    H(1, "Raízes", "A terra responde ao seu chamado.", "dano e prende o inimigo por 1 rodada", { tipo: "magico", poder: 1.2, prende: 1, mp: 12, recarga: 3 }),
    H(5, "Seiva", "Uma seiva morna corre pelas suas feridas.", "cura 30% da vida", { tipo: "cura", cura: 0.3, mp: 12, recarga: 3 }),
    H(12, "Espinhos", "Espinhos brotam sob os pés do inimigo.", "dano e veneno por 3 rodadas", { tipo: "magico", poder: 1.4, queima: 3, mp: 14, recarga: 3 }),
    H(25, "Ira da Floresta", "Troncos se erguem como punhos.", "magia forte que prende o inimigo", { tipo: "magico", poder: 2.3, prende: 1, mp: 26, recarga: 5 }),
  ],
  "Demônio": [
    H(1, "Miasma", "Uma fumaça negra sai das suas mãos.", "magia forte que custa um pouco de vida", { tipo: "magico", poder: 1.7, custoHp: 0.03, rouba: 0.15, mp: 0, recarga: 2 }),
    H(5, "Garra Infernal", "Sua mão vira garra e arranca um pedaço da força dele.", "golpe que recupera vida", { tipo: "fisico", poder: 1.6, rouba: 0.45, mp: 8, recarga: 3 }),
    H(12, "Olhar do Abismo", "Você deixa o inimigo ver o que há dentro de você.", "enfraquece 3 rodadas e abala a guarda", { tipo: "magico", poder: 1.0, enfraquece: 3, postura: 2, mp: 10, recarga: 4 }),
    H(25, "Chama Negra", "Um fogo sem luz consome tudo o que toca.", "magia terrível que custa vida", { tipo: "magico", poder: 2.6, custoHp: 0.05, rouba: 0.2, mp: 14, recarga: 4 }),
  ],
  Paladino: [
    H(1, "Golpe Sagrado", "Sua arma brilha com luz dourada.", "golpe que também cura você", { tipo: "fisico", poder: 1.5, curaFixa: 0.12, mp: 10, recarga: 2 }),
    H(5, "Mãos de Luz", "Você fecha os olhos. A dor vai embora.", "cura 35% da vida", { tipo: "cura", cura: 0.35, mp: 14, recarga: 4 }),
    H(12, "Julgamento", "A luz cai sobre quem não devia estar de pé.", "golpe forte; dobra contra mortos-vivos e espíritos", { tipo: "fisico", poder: 1.7, contra: ["morto-vivo", "espiritual"], mp: 16, recarga: 3 }),
    H(25, "Égide", "Um escudo de luz cobre você por inteiro.", "corta 80% do dano por 2 rodadas e cura 15%", { tipo: "cura", cura: 0.15, protecao: 0.8, duracao: 2, mp: 24, recarga: 5 }),
  ],
};
for (const [classe, lista] of Object.entries(KITS)) lista.forEach((h, i) => { h.id = `h${i + 1}`; h.classe = classe; });
/** Compatível com a v1: a primeira habilidade de cada classe. */
export const HABILIDADES = Object.fromEntries(Object.entries(KITS).map(([c, l]) => [c, l[0]]));
export const habilidadesDe = (classe, nivel) => (KITS[classe] ?? []).filter((h) => nivel >= h.nivel);
export const proximaHabilidade = (classe, nivel) => (KITS[classe] ?? []).find((h) => nivel < h.nivel) ?? null;
// Olhos da Terra (地眼): técnica dos filhos da terra. Quem aceita perde a visão e passa a "ver" pelo chão.
// Ganha duas habilidades e +2 no dado ao defender; contra o que não toca o chão (espíritos e deuses) ataca com −2 no dado.
export const SISMICO = [
  { id: "t1", nome: "Onda Sísmica", frase: "Você bate o pé. O chão responde como um tambor.", resumo: "golpe pelo chão que derruba: o inimigo perde a vez", tipo: "melhor", poder: 1.5, prende: 1, mp: 8, recarga: 3, nivel: 1 },
  { id: "t2", nome: "Ler o Chão", frase: "Você sente cada passo dele antes de acontecer.", resumo: "esquiva 70% e prepara o próximo golpe (+50%)", tipo: "guarda", protecao: 0.7, duracao: 1, foco: true, mp: 4, recarga: 3, nivel: 1 },
];
export const NAO_TOCA_O_CHAO = ["espiritual", "divino"];
const habDe = (j, id) => (KITS[j.classe] ?? []).find((h) => h.id === id) ?? (j.sismico ? SISMICO.find((h) => h.id === id) : null) ?? (j.magias ?? []).find((h) => h.id === id) ?? null;
const custoMana = (j, h) => (j.mpMax > 0 ? h.mp : 0);
export const MAGIA = { nome: "Magia elemental", poder: 1.3, mp: 6 };
export const MAX_ITENS_POR_LUTA = 2;

// ── Narração: verbos por classe, elemento e tipo de inimigo. Escolha determinística pela rodada (não gasta sorteio).
const pick = (lista, n) => lista[Math.abs(n) % lista.length];
const GOLPE_CLASSE = {
  Espadachim: ["Sua lâmina corta o ar e encontra {a}", "Um corte rápido abre a defesa de {a}", "Você gira o corpo e acerta {a} com a lâmina"],
  Cavaleiro: ["Você avança com o escudo e acerta {a}", "Sua espada desce pesada sobre {a}", "Você empurra {a} com o peso da armadura"],
  Mago: ["Você golpeia {a} com o cajado", "A ponta do seu cajado acerta {a}"],
  Bruxo: ["Sua adaga encontra {a}", "Você acerta {a} com um golpe sujo"],
  "Anti-magia": ["Seu punho afunda em {a}", "Você chuta {a} com força bruta", "Um golpe seco, sem magia nenhuma, acerta {a}"],
  "Meio-humano": ["Suas garras rasgam {a}", "Você salta sobre {a} como uma fera", "Um golpe selvagem acerta {a}"],
  "Força da Natureza": ["Seu bastão de madeira acerta {a}", "Você golpeia {a} com a força da terra"],
  "Demônio": ["Seus chifres acertam {a}", "Um golpe cruel atinge {a}"],
  Paladino: ["Sua maça acerta {a} em cheio", "Você bate em {a} com o escudo sagrado"],
};
const MAGIA_ELEMENTO = {
  Fogo: "Chamas envolvem {a}", "Água": "Uma lança d'água atinge {a}", Terra: "Pedras se erguem contra {a}", Vento: "Lâminas de vento cortam {a}",
  Luz: "Um raio de luz queima {a}", Trevas: "Sombras apertam {a}", Natureza: "Espinhos brotam e ferem {a}", Gravidade: "O peso do mundo esmaga {a}",
  Sangue: "Seu sangue vira lâmina contra {a}", Veneno: "Uma névoa venenosa envolve {a}", Tempo: "Por um instante, {a} envelhece anos",
  "Espaço": "O espaço se dobra e acerta {a}", Alma: "Sua alma empurra a de {a}", Sonho: "Uma visão confunde e fere {a}", Estelar: "Luz de estrelas cai sobre {a}",
};
const ATAQUE_INIMIGO = {
  besta: ["{i} crava os dentes em você", "{i} salta e te arranha", "{i} te derruba com o corpo"],
  bruto: ["{i} te esmaga com um golpe pesado", "{i} te acerta com força brutal"],
  tanque: ["{i} avança como um muro e te atinge", "{i} te empurra para trás"],
  assassino: ["{i} surge de lado e te corta", "{i} acerta um ponto que você não protegia"],
  mago: ["{i} lança um feitiço contra você", "{i} murmura palavras e algo te atinge"],
  invocador: ["As criaturas de {i} te atacam", "{i} chama algo das sombras contra você"],
  equilibrado: ["{i} te ataca", "{i} acerta você"],
  "morto-vivo": ["{i} te agarra com mãos frias", "{i} te golpeia sem sentir dor"],
  espiritual: ["{i} atravessa você como um vento gelado", "{i} grita e o som te machuca"],
  divino: ["A luz de {i} te queima", "{i} apenas olha, e você sente a dor"],
};
const ESQUIVA = ["{i} desvia no último segundo", "{i} pula para o lado e você erra", "Seu golpe passa raspando por {i}"];
const VOCE_DESVIA = ["Você se abaixa e o ataque passa por cima", "Você rola para o lado a tempo", "Você desvia por um fio"];
const n = (txt, o) => txt.replace("{a}", o.a ?? "").replace("{i}", o.i ?? "");
const POSTURA = { comum: 0, medio: 4, alto: 6, rei: 8, divindade: 10 };

export const elementoBase = (atributoMagico = "") => String(atributoMagico).split(/[\s(—-]/)[0] || null;
const ATRIBUTO_PRINCIPAL = (classe) => Object.entries(CLASSES[classe]?.cresc ?? { FOR: 1 }).sort((a, b) => b[1] - a[1])[0][0];

/** Multiplicador elemental: Água > Fogo > Vento > Terra > Água; fraqueza do alvo também vale +25%. */
export function multElemento(atk, def, fraquezaAlvo) {
  if (!atk) return 1;
  if (CICLO[atk] === def || atk === fraquezaAlvo) return 1 + CICLO.bonus_vantagem;
  if (CICLO[def] === atk) return 1 + CICLO.penalidade_desvantagem;
  return 1;
}

/** Atributos efetivos: base + equipamento (bônus somados dos itens equipados) − feridas ativas (−10% num atributo). */
export function atributosEfetivos(j, agora = Date.now(), equip = {}) {
  const a = { ...j.atributos };
  for (const [k, v] of Object.entries(equip)) a[k] = (a[k] ?? 0) + v;
  for (const e of j.efeitos ?? []) if (e.tipo === "ferida" && +new Date(e.ate) > agora && a[e.atributo] != null) a[e.atributo] = Math.floor(a[e.atributo] * 0.9);
  return a;
}

// ── Equilíbrio por nível de ameaça (doc 38) ──
// Metas inspiradas nas faixas de ameaça de RPGs de mesa (trivial → extrema): cada degrau deve custar mais e vencer menos.
// AJUSTE_SOLO adapta vilões pensados para grupo ao combate de um jogador só.
export const AJUSTE_SOLO = {
  lacaio: { hp: 1.25, ataque: 1.18 }, comum: { hp: 1.38, ataque: 1.26 }, medio: { hp: 1.3, ataque: 1.25 },
  alto: { hp: 0.97, ataque: 1.18 }, rei: { hp: 0.535, ataque: 0.805 }, divindade: { hp: 0.42, ataque: 0.57 },
};
// Ajuste fino de vilões que a história pede mais duros que o degrau deles (Kanata é o penúltimo portão da campanha).
export const AJUSTE_VILAO = { V091: { hp: 1.38, ataque: 1.15 } };
// Passiva de cada classe: dá identidade e segura as classes frágeis sem mexer nas fortes.
export const PASSIVAS = {
  Mago: { nome: "Manto Arcano", texto: "recebe 40% menos dano enquanto tiver mana", reducaoComMana: 0.4 },
  Bruxo: { nome: "Pele Amaldiçoada", texto: "recebe 18% menos dano; inimigos enfraquecidos batem ainda menos", reducao: 0.18 },
  "Demônio": { nome: "Couraça de Miasma", texto: "recebe 42% menos dano", reducao: 0.42 },
  Espadachim: { nome: "Reflexos", texto: "o inimigo rola o dado com −4 contra você e você recebe 26% menos dano", dadoInimigo: -4, reducao: 0.26 },
  "Meio-humano": { nome: "Instinto", texto: "o inimigo rola o dado com −1 contra você; +1 no seu dado com a vida abaixo da metade", dadoInimigo: -1, furia: 1 },
  "Força da Natureza": { nome: "Raiz Viva", texto: "recupera 3% da vida a cada rodada", regen: 0.03 },
  "Anti-magia": { nome: "Vazio Interior", texto: "recebe 30% menos dano de magia", reducaoMagia: 0.3 },
  Cavaleiro: { nome: "Postura de Ferro", texto: "defender bloqueia 10% a mais", defesaExtra: 0.1 },
  Paladino: { nome: "Fé Inabalável", texto: "curas e proteções valem 25% a mais e você recebe 12% menos dano", curaExtra: 0.25, reducao: 0.12 },
};
/** Fora de luta: o Mago converte quase toda a mana em vigor para ele e para quem está por perto. */
export const REVIGORAR = { classe: "Mago", custoMana: 0.9, vigor: 40, nivel: 5 };
// Chefes não deixam a luta se arrastar: depois da 8ª rodada, batem 8% mais forte a cada rodada (fúria).
export const FURIA = { apartir: 8, porRodada: 0.08, max: 2 };
// Golpes fortes de chefes atravessam parte da defesa (armadura sozinha não vence chefe).
export const PERFURA_CHEFE = { comum: 0.2, forte: 0.4 };
// Bônus de dano (bênçãos, apoio, juramento, pactos) somam até este teto.
export const TETO_BONUS = 1.4;
// Reis e divindades têm segunda fase aos 50% de vida.
export const SEGUNDA_FASE = { rei: { ataque: 1.12 }, divindade: { ataque: 1.2 } };

/**
 * opts: equip (bônus), itens ({id: qtd} consumíveis de luta), solo, eco (sombra de um vilão já derrotado no mundo),
 * bonusDano (ex.: 1.1 de um juramento de vingança), aliados (nº de jogadores, escala a vida do inimigo).
 */
export function novoCombate(j, vilao, nivel, { agora = Date.now(), solo = true, equip = {}, itens = {}, eco = false, bonusDano = 1, aliados = 1, pet = null, sismico = false, lacaio = false, magias = [] } = {}) {
  const at = atributosVilao(nivel, vilao.tier, vilao.arquetipo);
  const aj = solo && AJUSTE_SOLO[lacaio ? "lacaio" : vilao.tier];
  if (aj) {
    // Em chefes, o arquétipo pesa metade (um "bruto" e um "assassino" do mesmo degrau ficam mais parecidos em dificuldade)
    const arq = ARQUETIPOS[vilao.arquetipo] ?? [1, 1, 1, 1, 1, 1, 1], chefe = ["alto", "rei", "divindade"].includes(vilao.tier) && !lacaio;
    const nHP = chefe ? arq[5] ** -0.5 : 1, nAtk = chefe ? Math.max(arq[0], arq[2]) ** -0.5 : 1;
    at.HP = Math.round(at.HP * aj.hp * nHP); at.FOR = Math.round(at.FOR * aj.ataque * nAtk); at.MAG = Math.round(at.MAG * aj.ataque * nAtk);
    const fino = !lacaio && !eco && AJUSTE_VILAO[vilao.id];
    if (fino) { at.HP = Math.round(at.HP * fino.hp); at.FOR = Math.round(at.FOR * fino.ataque); at.MAG = Math.round(at.MAG * fino.ataque); }
    if (chefe) { at.DEF = Math.round(at.DEF * arq[1] ** -0.5); at.RES = Math.round(at.RES * arq[3] ** -0.5); }
  }
  if (!solo && aliados > 1) at.HP = Math.round(at.HP * (0.6 + 0.4 * aliados));
  if (eco) at.HP = Math.round(at.HP * 0.8);
  const itensLuta = Object.fromEntries(Object.entries(itens).filter(([id, q]) => q > 0 && CONSUMIVEIS[id]?.luta));
  return {
    rodada: 1,
    jogador: { id: j.id, nome: j.nome, classe: j.classe, nivel: j.nivel, hp: j.hp, hpMax: j.hp_max, mp: j.mp, mpMax: j.mp_max,
      at: atributosEfetivos(j, agora, equip), elemento: elementoBase(j.atributo_magico), recargas: {}, itens: itensLuta, itensUsados: 0,
      protecao: 0, protecaoRodadas: 0, foco: false, bonusDano: Math.min(TETO_BONUS, bonusDano), sismico, magias },
    inimigo: { id: vilao.id, nome: eco ? `Eco de ${vilao.nome}` : vilao.nome, nivel, tier: vilao.tier, arquetipo: vilao.arquetipo, elemento: vilao.elemento,
      fraqueza: vilao.fraqueza, habilidade: vilao.habilidade, hp: at.HP, hpMax: at.HP, at,
      postura: POSTURA[vilao.tier] ?? 0, posturaMax: POSTURA[vilao.tier] ?? 0, atordoado: false, vulneravel: false, preso: 0, fraco: 0, queima: 0, queimaDano: 0,
      chefe: ["alto", "rei", "divindade"].includes(vilao.tier), eco, fase: 1, pressao: lacaio ? null : PRESSAO[vilao.tier] ?? null },
    preparando: false, log: [],
    pet: pet ? { nome: pet.nome, poder: 0.15 + 0.07 * pet.estagio } : null,
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── O dado ──
export const FAIXAS = {
  falha: { mult: 0, defesa: 0.2, texto: "falha" }, fraco: { mult: 0.7, defesa: 0.35, texto: "de raspão" },
  normal: { mult: 1, defesa: 0.5, texto: "acerto firme" }, forte: { mult: 1.3, defesa: 0.7, texto: "acerto forte" },
  critico: { mult: 1.8, defesa: 1, texto: "golpe perfeito" },
};
/**
 * Alcance (doc 41): a história não pode travar por falta de nível.
 * - Um vilão de covil luta no nível dele, mas no máximo ALCANCE.acima níveis acima de quem o enfrenta.
 * - Quem vence conteúdo acima do próprio nível aprende mais (XP × até ALCANCE.max), e volta a ficar perto do nível da história.
 */
export const ALCANCE = { acima: 2, porNivel: 0.1, max: 3 };
export const nivelDeLuta = (nivelVilao, nivelJogador) => Math.min(nivelVilao, nivelJogador + ALCANCE.acima);
export const multAlcance = (nivelJogador, nivelConteudo) => Math.max(1, Math.min(ALCANCE.max, 1 + ALCANCE.porNivel * (nivelConteudo - nivelJogador)));

/**
 * Pressão do inimigo sobre o SEU dado: quanto mais alto o degrau, maior a faixa de erro e menor o número que conta.
 * (Como em jogos em que chefes contam como "níveis acima": mais golpes de raspão e mais erros, sem tirar o 20 de ninguém.)
 */
export const PRESSAO = {
  medio: { falhaAte: 1, dado: -1, nome: "elite" }, alto: { falhaAte: 2, dado: -1, nome: "chefe" },
  rei: { falhaAte: 2, dado: -2, nome: "rei das sombras" }, divindade: { falhaAte: 3, dado: -2, nome: "divindade" },
};
export const textoPressao = (p) => (p ? `${p.falhaAte > 1 ? `o seu dado falha de 1 a ${p.falhaAte}` : "o seu dado falha no 1"} e perde ${-p.dado}` : null);
/** Rola 1d20 + bônus. 1 natural sempre falha (sob pressão, a faixa de falha cresce); 20 natural é sempre perfeito. */
export function rolar(rng, bonus = 0, falhaAte = 1) {
  const nat = 1 + Math.floor(rng() * 20);
  const total = nat + bonus;
  const faixa = nat <= falhaAte ? "falha" : nat === 20 ? "critico" : total <= 6 ? "fraco" : total <= 14 ? "normal" : "forte";
  return { nat, total, faixa, ...FAIXAS[faixa] };
}
export const bonusDado = (at) => Math.min(3, Math.floor((at.SOR ?? 0) / 12));

function danoBase({ atk, nivel, def, poder, mult = 1 }) {
  return Math.max(1, Math.round(((atk * 3 * K(nivel)) / (K(nivel) + Math.max(0, def))) * poder * mult));
}

/** Menu numerado do que o jogador pode fazer agora. Cada entrada: { n, acao, rotulo, detalhe, bloqueio } */
export function menu(e) {
  const j = e.jogador, itens = [];
  const add = (acao, rotulo, detalhe = null, bloqueio = null) => itens.push({ n: itens.length + 1, acao, rotulo, detalhe, bloqueio });
  add({ tipo: "atacar" }, "Atacar");
  add({ tipo: "defender" }, "Defender");
  if (j.mpMax > 0) add({ tipo: "magia" }, `Magia de ${j.elemento ?? "mana"}`, `${MAGIA.mp} de mana`, j.mp < MAGIA.mp ? "sem mana" : null);
  for (const h of [...habilidadesDe(j.classe, j.nivel), ...(j.sismico ? SISMICO : []), ...(j.magias ?? [])]) {
    const espera = j.recargas[h.id] ?? 0, mp = custoMana(j, h);
    add({ tipo: "habilidade", id: h.id }, h.nome, [h.resumo, mp ? `${mp} de mana` : null].filter(Boolean).join(" · "),
      espera ? `espera ${espera}` : j.mp < mp ? "sem mana" : null);
  }
  for (const [id, q] of Object.entries(j.itens ?? {})) if (q > 0) {
    const c = CONSUMIVEIS[id];
    add({ tipo: "item", id }, `${c.nome} ×${q}`, c.efeito, j.itensUsados >= MAX_ITENS_POR_LUTA ? "limite de itens por luta" : c.fuga && e.inimigo.chefe ? "não funciona contra chefes" : null);
  }
  if (!e.inimigo.chefe) add({ tipo: "fugir" }, "Fugir");
  return itens;
}

/** Converte o que o jogador digitou (número do menu ou apelido) numa ação. null = não é ação de combate. */
export function escolher(e, texto) {
  const t = String(texto).trim().toLowerCase();
  const m = menu(e);
  if (/^\d{1,2}$/.test(t)) return m.find((x) => x.n === Number(t)) ?? { erro: `Escolha um número de 1 a ${m.length}.` };
  const por = (f) => m.find(f) ?? null;
  if (/^(a|atacar|ataque|ataco|bater|golpe)$/.test(t)) return por((x) => x.acao.tipo === "atacar");
  if (/^(d|defender|defesa|defendo|bloquear)$/.test(t)) return por((x) => x.acao.tipo === "defender");
  if (/^(m|m1|magia|feitico|feitiço)$/.test(t)) return por((x) => x.acao.tipo === "magia") ?? { erro: "Sua classe não usa magia." };
  const h = t.match(/^([ht])([1-4])$/);
  if (h) return por((x) => x.acao.id === `${h[1]}${h[2]}`) ?? { erro: "Você ainda não aprendeu essa habilidade." };
  if (/^(habilidade|skill|especial|h)$/.test(t)) return por((x) => x.acao.tipo === "habilidade");
  if (/^((i|item|usar|usa|bebo|beber) )?(pocao|poção|p|i)$/.test(t)) return por((x) => x.acao.id === "pocao") ?? { erro: "Você não tem poções." };
  if (/^(f|fugir|fujo|correr|corro)$/.test(t)) return por((x) => x.acao.tipo === "fugir") ?? { erro: "Não dá para fugir de um chefe." };
  return null;
}

const barra = (v, max, n = 8) => { const c = Math.round((Math.max(0, v) / max) * n); return "▰".repeat(c) + "▱".repeat(n - c); };

export function textoMenu(e) {
  return menu(e).map((x) => `*${x.n}* ${x.rotulo}${x.bloqueio ? ` _(${x.bloqueio})_` : x.detalhe ? ` — _${x.detalhe}_` : ""}`).join("\n");
}

/** Como a conta da luta é feita, em três linhas: mostrado no começo de toda luta e quando o jogador pede (?). */
export function explicacaoDado(e) {
  const { jogador: j, inimigo: i } = e;
  const sorte = bonusDado(j.at), p = i.pressao?.dado ?? 0, fa = i.pressao?.falhaAte ?? 1, mod = sorte + p;
  const mods = [sorte ? `+${sorte} da sua Sorte` : null, p ? `−${-p} da pressão de ${i.pressao.nome}` : null].filter(Boolean).join(", ");
  const magico = j.at.MAG > j.at.FOR;
  const base = danoBase({ atk: magico ? j.at.MAG : j.at.FOR, nivel: j.nivel, def: magico ? i.at.RES : i.at.DEF, poder: 1, mult: (j.bonusDano ?? 1) });
  return `_Como funciona: cada ação rola 1 dado de 20 lados (d20)${mod ? ` ${mod > 0 ? "+" : "−"} ${Math.abs(mod)} (${mods})` : ""}._\n` +
    `_${fa > 1 ? `1 a ${fa}` : "1"} erra · até 6 de raspão ×0,7 · 7 a 14 firme ×1 · 15 ou mais forte ×1,3 · 20 perfeito ×1,8_\n` +
    `_Seu golpe comum contra ele vale ${base} de dano (${magico ? "Magia" : "Força"} e arma contra a defesa dele); o dado multiplica isso. Habilidades batem mais forte._`;
}

/** Menu em poucas linhas, para depois que o jogador já conhece as opções (da 3ª rodada em diante). */
export function textoMenuCurto(e) {
  return `${menu(e).map((x) => (x.bloqueio ? `~${x.n} ${x.rotulo}~` : `*${x.n}* ${x.rotulo}`)).join(" · ")}\n_? mostra os detalhes_`;
}

export function painel(e, { completo = false } = {}) {
  const { jogador: j, inimigo: i } = e;
  const guarda = i.posturaMax ? `  guarda ${"◆".repeat(Math.max(0, i.postura))}${"◇".repeat(i.posturaMax - Math.max(0, i.postura))}` : "";
  const estados = [i.vulneravel && "*aberto*", i.preso && "preso", i.fraco && "fraco", i.queima && "ferido"].filter(Boolean).join(" · ");
  return [
    `⚔️ *${i.nome}* · rodada ${e.rodada}`,
    e.log.length ? e.log.join("\n") : null,
    completo || e.rodada <= 1 ? explicacaoDado(e) : null,
    e.preparando ? `_${i.nome} recua e junta forças… o próximo golpe vai ser pesado. Defender é uma boa ideia._` : null,
    [`${i.nome} ${barra(i.hp, i.hpMax)} ${Math.max(0, i.hp)}${guarda}${estados ? `  ${estados}` : ""}`,
      `Você ${barra(j.hp, j.hpMax)} ${Math.max(0, j.hp)}/${j.hpMax}${j.mpMax ? ` · mana ${j.mp}` : ""}${j.protecaoRodadas ? " · protegido" : ""}${j.foco ? " · concentrado" : ""}`].join("\n"),
    completo || e.rodada <= 2 ? textoMenu(e) : textoMenuCurto(e),
  ].filter(Boolean).join("\n\n");
}

/**
 * Resolve uma rodada. acao: { tipo: 'atacar'|'magia'|'defender'|'habilidade'|'item'|'fugir', id? }
 * Retorna { estado, fim: null|'vitoria'|'derrota'|'fuga', erro?, consumir? }
 */
export function resolverRodada(estado, acao, rng) {
  const e = structuredClone(estado);
  const { jogador: j, inimigo: i } = e;
  e.log = [];
  const habBase = acao.tipo === "habilidade" ? habDe(j, acao.id ?? "h1") : null;
  // "melhor": usa o atributo mais forte do jogador; o custo de mana some para quem não tem mana
  const hab = habBase ? { ...habBase, mp: custoMana(j, habBase), tipo: habBase.tipo === "melhor" ? (j.at.MAG > j.at.FOR ? "magico" : "fisico") : habBase.tipo } : null;

  // Validação antes de gastar a rodada
  if (acao.tipo === "magia" && (j.mpMax === 0 || j.mp < MAGIA.mp)) return { estado, fim: null, erro: j.mpMax === 0 ? "Sua classe não usa magia." : `Falta mana (precisa de ${MAGIA.mp}).` };
  if (acao.tipo === "habilidade") {
    if (!hab || j.nivel < hab.nivel) return { estado, fim: null, erro: "Você ainda não aprendeu essa habilidade." };
    if ((j.recargas[hab.id] ?? 0) > 0) return { estado, fim: null, erro: `${hab.nome} ainda não está pronta (espera ${j.recargas[hab.id]}).` };
    if (j.mp < hab.mp) return { estado, fim: null, erro: `Falta mana para ${hab.nome} (precisa de ${hab.mp}).` };
  }
  const cons = acao.tipo === "item" ? CONSUMIVEIS[acao.id ?? "pocao"] : null;
  if (acao.tipo === "item") {
    if (!cons?.luta || !(j.itens?.[acao.id ?? "pocao"] > 0)) return { estado, fim: null, erro: "Você não tem esse item." };
    if (j.itensUsados >= MAX_ITENS_POR_LUTA) return { estado, fim: null, erro: `Só dá para usar ${MAX_ITENS_POR_LUTA} itens por luta.` };
    if (cons.fuga && i.chefe) return { estado, fim: null, erro: "A fumaça não engana um chefe." };
  }
  if (acao.tipo === "fugir" && i.chefe) return { estado, fim: null, erro: "Não dá para fugir de um chefe." };

  let consumir = null, defesa = 0;
  const vulneravel = i.vulneravel;
  // Dado às claras: o número que saiu, o modificador, o total e quanto isso vale (ex.: 🎲 *7* −1 = 6 · de raspão ×0,7)
  const dadoTxt = (d) => `🎲 *${d.nat}*${d.total !== d.nat && d.nat !== 1 && d.nat !== 20 ? ` ${d.total > d.nat ? "+" : "−"}${Math.abs(d.total - d.nat)} = ${d.total}` : ""} · ${d.texto}${d.mult && d.mult !== 1 ? ` ×${String(d.mult).replace(".", ",")}` : ""}`;
  // Golpe do jogador contra o inimigo, já com o dado rolado
  const ferir = (tipo, poder, d, frase, x = {}) => {
    if (d.faixa === "falha") { e.log.push(`${dadoTxt(d)}. ${n(pick(ESQUIVA, e.rodada), { i: i.nome })}.`); return 0; }
    const elemento = tipo === "magico" ? multElemento(j.elemento, i.elemento, i.fraqueza) : 1;
    const mult = elemento * (vulneravel ? 1.5 : 1) * (j.foco ? 1.5 : 1) * (j.bonusDano ?? 1) * d.mult * (x.contra?.includes(i.arquetipo) ? 2 : 1);
    let dano = 0;
    for (let g = 0; g < (x.golpes ?? 1); g++) dano += danoBase({ atk: tipo === "magico" ? j.at.MAG : j.at.FOR, nivel: j.nivel,
      def: (tipo === "magico" ? i.at.RES : i.at.DEF) * (1 - (x.ignoraDef ?? 0)), poder, mult });
    i.hp -= dano; j.foco = false;
    e.log.push(`${dadoTxt(d)}. ${frase} _(${dano} de dano)_`);
    if (i.posturaMax && d.faixa === "critico") i.postura -= 1;
    if (elemento > 1) { e.log.push(`${i.nome} se contorce: é o ponto fraco dele.`); if (i.posturaMax) i.postura -= 2; }
    return dano;
  };
  const cegoNoAr = j.sismico && NAO_TOCA_O_CHAO.includes(i.arquetipo);
  const passiva = PASSIVAS[j.classe] ?? {};
  const pressao = i.pressao ?? null, fa = pressao?.falhaAte ?? 1;
  const bd = bonusDado(j.at) - (cegoNoAr ? 2 : 0) + (passiva.furia && j.hp < j.hpMax / 2 ? passiva.furia : 0) + (pressao?.dado ?? 0);

  // 1) Ação do jogador
  if (acao.tipo === "atacar") ferir("fisico", 1, rolar(rng, bd, fa), n(pick(GOLPE_CLASSE[j.classe] ?? GOLPE_CLASSE.Espadachim, e.rodada), { a: i.nome }) + ".");
  else if (acao.tipo === "magia") {
    j.mp -= MAGIA.mp;
    ferir("magico", MAGIA.poder, rolar(rng, bd, fa), n(MAGIA_ELEMENTO[j.elemento] ?? "Sua mana explode contra {a}", { a: i.nome }) + ".");
  } else if (acao.tipo === "habilidade") {
    j.mp -= hab.mp; j.recargas[hab.id] = hab.recarga + 1;
    if (hab.custoHp) { const c = Math.ceil(j.hpMax * hab.custoHp); j.hp -= c; e.log.push(`O poder cobra seu preço. _(−${c} de vida)_`); }
    const titulo = `*${hab.nome}!* ${hab.frase}`;
    if (hab.tipo === "cura" || hab.tipo === "guarda") {
      const d = rolar(rng, bd, fa);
      const forca = (d.faixa === "falha" ? 0.5 : d.faixa === "critico" ? 1.3 : 1) * (1 + (passiva.curaExtra ?? 0)); // curas e guardas nunca falham de todo
      const partes = [];
      if (hab.cura) { const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.cura * forca)); j.hp += c; partes.push(`+${c} de vida`); }
      if (hab.protecao) { j.protecao = Math.min(0.9, hab.protecao * (d.faixa === "falha" ? 0.6 : 1)); j.protecaoRodadas = hab.duracao ?? 1; partes.push(`protege ${Math.round(j.protecao * 100)}%`); }
      if (hab.enfraqueceAlvo) { i.fraco = hab.enfraqueceAlvo; partes.push(`${i.nome} enfraquece`); }
      if (hab.foco) { j.foco = true; partes.push("próximo golpe +50%"); }
      e.log.push(`${dadoTxt(d)}. ${titulo} _(${partes.join(" · ")})_`);
    } else {
      const dano = ferir(hab.tipo, hab.poder, rolar(rng, bd + (hab.dado ?? 0), fa), titulo, hab);
      if (dano) {
        if (hab.postura && i.posturaMax) i.postura -= hab.postura;
        if (hab.rouba) { const c = Math.min(j.hpMax - j.hp, Math.round(dano * hab.rouba)); j.hp += c; if (c) e.log.push(`A força dele vira sua. _(+${c} de vida)_`); }
        if (hab.curaFixa) { const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.curaFixa * (1 + (passiva.curaExtra ?? 0)))); j.hp += c; if (c) e.log.push(`A luz também cuida de você. _(+${c} de vida)_`); }
        if (hab.enfraquece) { i.fraco = hab.enfraquece; e.log.push(`${i.nome} fica mais fraco.`); }
        if (hab.prende) { i.preso = hab.prende; e.log.push(`${i.nome} não consegue se mover.`); }
        if (hab.queima) { i.queima = hab.queima; i.queimaDano = Math.max(1, Math.round(dano * 0.25)); e.log.push(`A ferida continua aberta. _(${i.queimaDano} por rodada)_`); }
      }
      if (hab.protecao) { j.protecao = hab.protecao; j.protecaoRodadas = hab.duracao ?? 1; }
    }
  } else if (acao.tipo === "defender") {
    const d = rolar(rng, bd + (j.sismico && !cegoNoAr ? 2 : 0), fa);
    defesa = Math.min(1, d.defesa + (passiva.defesaExtra ?? 0));
    const mana = j.mpMax ? Math.min(j.mpMax - j.mp, Math.ceil(j.mpMax * 0.06)) : 0; j.mp += mana;
    e.log.push(`${dadoTxt(d).replace(d.texto, d.faixa === "critico" ? "defesa perfeita" : d.faixa === "falha" ? "guarda aberta" : `bloqueia ${Math.round(defesa * 100)}%`)}. Você firma os pés e se protege.${mana ? ` _(+${mana} de mana)_` : ""}`);
    if (d.faixa === "critico" && i.posturaMax) i.postura -= 2;
  } else if (acao.tipo === "item") {
    const id = acao.id ?? "pocao";
    j.itens[id] -= 1; j.itensUsados += 1; consumir = id;
    if (cons.fuga) { e.log.push("A fumaça engole tudo. Quando ela baixa, você já está longe."); return { estado: e, fim: "fuga", consumir }; }
    const partes = [];
    if (cons.cura) { const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * cons.cura)); j.hp += c; partes.push(`+${c} de vida`); }
    if (cons.mana) { const c = Math.min(j.mpMax - j.mp, Math.round(j.mpMax * cons.mana)); j.mp += c; partes.push(`+${c} de mana`); }
    e.log.push(`Você usa ${cons.nome}. _(${partes.join(" · ")})_`);
  } else if (acao.tipo === "fugir") {
    const d = rolar(rng, clamp(Math.round((j.at.VEL - i.at.VEL) / 4), -4, 6));
    if (d.total >= 9 && d.faixa !== "falha") { e.log.push(`🎲 *${d.nat}* — você escapa. Você corre sem olhar para trás.`); return { estado: e, fim: "fuga", consumir }; }
    e.log.push(`🎲 *${d.nat}* — ${i.nome} corta o caminho. Não deu para fugir.`);
  }

  // Companheiro espiritual: um ataque extra por rodada
  if (e.pet && i.hp > 0 && acao.tipo !== "fugir") {
    const dp = danoBase({ atk: Math.max(j.at.FOR, j.at.MAG) * e.pet.poder, nivel: j.nivel, def: Math.min(i.at.DEF, i.at.RES), poder: 1 });
    i.hp -= dp; e.log.push(`${e.pet.nome} ataca junto com você. _(${dp})_`);
  }
  // Guarda quebrada: o bônus de +50% vale só para a ação seguinte do jogador; depois a guarda volta cheia.
  if (vulneravel) { i.vulneravel = false; i.postura = i.posturaMax; }
  else if (i.posturaMax && i.postura <= 0) {
    i.postura = 0; i.atordoado = true; i.vulneravel = true;
    e.log.push(`*A guarda de ${i.nome} se quebra!* Ele cambaleia, aberto. _(perde a vez · seu próximo golpe +50%)_`);
  }
  // Dano contínuo (queimadura, veneno, sangramento)
  if (i.hp > 0 && i.queima > 0) { i.hp -= i.queimaDano; i.queima -= 1; e.log.push(`${i.nome} sofre com a ferida. _(${i.queimaDano})_`); }

  if (i.hp <= 0) { i.hp = 0; e.log.push(`*${i.nome} cai e não se levanta mais.*`); return { estado: e, fim: "vitoria", consumir }; }

  // Segunda fase (reis e divindades): aos 50% de vida a guarda volta, ele bate mais forte e prepara um golpe pesado
  if (SEGUNDA_FASE[i.tier] && i.fase === 1 && i.hp <= i.hpMax / 2) {
    i.fase = 2; i.postura = i.posturaMax; i.vulneravel = false; i.atordoado = false; i.preso = 0; e.preparando = true;
    e.log.push(`*${i.nome} muda.* O ar pesa, a guarda dele se refaz. Ele não está mais se contendo. _(segunda fase: ataques mais fortes)_`);
  }
  // 2) Ação do inimigo
  if (i.atordoado) { i.atordoado = false; e.log.push(`${i.nome} ainda está zonzo.`); }
  else if (i.preso > 0) { i.preso -= 1; e.log.push(`${i.nome} se debate, sem conseguir agir.`); }
  else {
    const forte = e.preparando;
    const magico = i.at.MAG > i.at.FOR;
    const d = rolar(rng, clamp(Math.round((i.at.VEL - j.at.VEL) / 8), -3, 3) + (passiva.dadoInimigo ?? 0));
    const dadoI = `🎲 ${d.nat}${d.total !== d.nat && d.nat !== 1 && d.nat !== 20 ? ` ${d.total > d.nat ? "+" : "−"}${Math.abs(d.total - d.nat)} = ${d.total}` : ""} · ${{ falha: "ele erra", fraco: "de raspão ×0,7", normal: "acerto firme", forte: "acerto forte ×1,25", critico: "em cheio ×1,6" }[d.faixa]}`;
    if (d.faixa === "falha") e.log.push(`${dadoI}. ${pick(VOCE_DESVIA, e.rodada)[0].toUpperCase()}${pick(VOCE_DESVIA, e.rodada).slice(1)}.`);
    else {
      const multDado = { fraco: 0.7, normal: 1, forte: 1.25, critico: 1.6 }[d.faixa];
      const furia = i.chefe && e.rodada > FURIA.apartir ? Math.min(1 + FURIA.max, 1 + (e.rodada - FURIA.apartir) * FURIA.porRodada) : 1;
      const fase2 = i.fase === 2 ? (SEGUNDA_FASE[i.tier]?.ataque ?? 1) : 1;
      const defJ = (magico ? j.at.RES : j.at.DEF) * (i.chefe ? 1 - (forte ? PERFURA_CHEFE.forte : PERFURA_CHEFE.comum) : 1);
      const reducao = (passiva.reducao ?? 0) + (passiva.reducaoComMana && j.mp > 0 ? passiva.reducaoComMana : 0) + (magico ? passiva.reducaoMagia ?? 0 : 0);
      let dano = danoBase({ atk: magico ? i.at.MAG : i.at.FOR, nivel: i.nivel, def: defJ, poder: forte ? 1.7 : 1,
        mult: (magico ? multElemento(i.elemento, j.elemento) : 1) * (i.fraco ? (passiva.reducao && j.classe === "Bruxo" ? 0.65 : 0.75) : 1) * multDado * furia * fase2 * (1 - reducao) });
      const corte = 1 - (1 - defesa) * (1 - (j.protecaoRodadas ? j.protecao : 0));
      dano = Math.round(dano * (1 - corte));
      j.hp -= dano;
      const frase = forte ? `*${(i.habilidade ?? "Golpe forte").split(":")[0]}!* ${i.nome} solta tudo de uma vez`
        : `${d.faixa === "critico" ? "*Em cheio!* " : ""}${n(pick(ATAQUE_INIMIGO[i.arquetipo] ?? ATAQUE_INIMIGO.equilibrado, e.rodada), { i: i.nome })}`;
      e.log.push(dano > 0 ? `${dadoI}. ${frase}. _(−${dano} de vida)_` : `${dadoI}. ${frase}, mas você segura tudo.`);
    }
    e.preparando = false;
  }
  if (passiva.regen && j.hp > 0 && j.hp < j.hpMax) { const c = Math.min(j.hpMax - j.hp, Math.ceil(j.hpMax * passiva.regen)); j.hp += c; }
  if (i.fraco > 0) i.fraco -= 1;
  if (j.protecaoRodadas > 0) { j.protecaoRodadas -= 1; if (!j.protecaoRodadas) j.protecao = 0; }
  for (const k of Object.keys(j.recargas)) { j.recargas[k] -= 1; if (j.recargas[k] <= 0) delete j.recargas[k]; }
  // Golpe forte telegrafado a cada 3 rodadas
  if (!e.preparando && (e.rodada + 1) % 3 === 0 && !i.preso) e.preparando = true;
  // Chefes recuperam 1 de guarda por rodada
  if (i.chefe && !i.vulneravel && i.postura < i.posturaMax) i.postura += 1;

  if (j.hp <= 0) { j.hp = 0; e.log.push("Suas pernas cedem. O chão vem ao seu encontro."); return { estado: e, fim: "derrota", consumir }; }
  e.rodada += 1;
  return { estado: e, fim: null, consumir };
}

const variacao = (rng) => 0.9 + rng() * 0.2;

export function rankDoNivel(n) {
  return n >= 95 ? "SS" : n >= 80 ? "S" : n >= 60 ? "A" : n >= 40 ? "B" : n >= 20 ? "C" : n >= 10 ? "D" : "E";
}

/** Recompensa da vitória (XP, ryō) — campônios ganham +20% de XP. */
export function recompensa(j, inimigo, rng) {
  const t = TIERS[inimigo.tier];
  const xp = Math.round(XP_VILAO(inimigo.nivel, inimigo.tier) * (j.casta === "campones" ? 1.2 : 1));
  const ryo = Math.round(inimigo.nivel * 8 * t.xp * variacao(rng));
  return { xp, ryo, superior: inimigo.nivel >= j.nivel + 5 };
}

/**
 * Aplica XP e sobe níveis (doc 08.1): crescimento da classe, +HP = 8 + DEF/4, +MP = 4 × mult_MP,
 * +3 pontos livres a cada 10 níveis. Devolve o jogador atualizado e o livro-razão.
 */
export function aplicarXP(j, xp) {
  const cl = CLASSES[j.classe];
  const at = { ...j.atributos };
  let { nivel } = j, atual = Number(j.xp) + xp, hpMax = j.hp_max, mpMax = j.mp_max, pontos = j.pontos_livres;
  const eventos = [], niveis = [];
  while (nivel < 100 && atual >= XP_PROXIMO(nivel)) {
    atual -= XP_PROXIMO(nivel); nivel += 1; niveis.push(nivel);
    for (const [k, v] of Object.entries(cl?.cresc ?? {})) if (v) { at[k] = (at[k] ?? 0) + v; eventos.push({ atributo: k, delta: v, fonte: "subida_de_nivel", detalhe: { nivel } }); }
    hpMax += 8 + Math.floor(at.DEF / 4);
    mpMax += Math.round(4 * (cl?.mult_mp ?? 1));
    if (nivel % 10 === 0) pontos += 3;
  }
  const subiu = niveis.length > 0;
  return { ...j, nivel, xp: atual, atributos: at, hp_max: hpMax, mp_max: mpMax, pontos_livres: pontos, rank: rankDoNivel(nivel),
    hp: subiu ? hpMax : Math.min(j.hp, hpMax), mp: subiu ? mpMax : Math.min(j.mp, mpMax), niveis, eventos };
}

export const atributoPrincipal = ATRIBUTO_PRINCIPAL;
