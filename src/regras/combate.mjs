// Combate solo por rodadas (doc 08.4, 22.8, 19). Regras puras: recebem estado + ação + rng e devolvem o novo estado.
// O servidor guarda o estado em jogo.batalhas.estado e aplica XP/HP/recompensas ao final.
import { readFileSync } from "node:fs";
import { TIERS, XP_VILAO, XP_PROXIMO, K, atributosVilao } from "../../scripts/balanceamento.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const CICLO = ler("reinos.json").ciclo_elemental;
export const CLASSES = ler("classes.json").classes;

// Uma habilidade por classe (h1). Fácil de lembrar, cada uma com um papel diferente.
export const HABILIDADES = {
  Mago: { nome: "Rajada Arcana", frase: "Runas acendem no ar e explodem em luz.", tipo: "magico", poder: 1.8, mp: 14, recarga: 2, texto: "magia forte" },
  Cavaleiro: { nome: "Golpe de Escudo", frase: "O escudo bate com um estrondo e você se fecha atrás dele.", tipo: "fisico", poder: 1.3, mp: 8, recarga: 2, postura: 2, protecao: 0.5, texto: "golpe que quebra a guarda e protege você" },
  Bruxo: { nome: "Maldição", frase: "Você sussurra um nome antigo.", tipo: "magico", poder: 1.3, mp: 12, recarga: 3, enfraquece: 2, texto: "enfraquece o inimigo por 2 rodadas" },
  "Anti-magia": { nome: "Corte do Vazio", frase: "Sua lâmina passa como se a defesa não existisse.", tipo: "fisico", poder: 1.7, mp: 0, recarga: 2, ignoraDef: 0.3, texto: "corte que atravessa defesas" },
  Espadachim: { nome: "Iaijutsu", frase: "A espada sai e volta à bainha num piscar.", tipo: "fisico", poder: 1.6, mp: 8, recarga: 2, critico: 15, texto: "saque rápido, crítico fácil" },
  "Meio-humano": { nome: "Fúria da Fera", frase: "Você ruge e ataca sem pensar.", tipo: "fisico", poder: 1.5, mp: 8, recarga: 2, rouba: 0.25, texto: "golpe que recupera vida" },
  "Força da Natureza": { nome: "Raízes", frase: "A terra responde ao seu chamado.", tipo: "magico", poder: 1.2, mp: 12, recarga: 3, prende: 1, texto: "prende o inimigo por 1 rodada" },
  "Demônio": { nome: "Miasma", frase: "Uma fumaça negra sai das suas mãos.", tipo: "magico", poder: 1.7, mp: 0, custoHp: 0.05, recarga: 2, texto: "magia sombria que custa vida" },
  Paladino: { nome: "Golpe Sagrado", frase: "Sua arma brilha com luz dourada.", tipo: "fisico", poder: 1.5, mp: 10, recarga: 2, curaFixa: 0.12, texto: "golpe de luz que também cura" },
};
export const MAGIA = { nome: "Magia elemental", poder: 1.3, mp: 6 };

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
export const POCAO = { cura: 0.35, maxPorBatalha: 2 };
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

// Equipamento médio da faixa de nível (o mesmo do simulador de balanceamento, doc 22b). Vale até o sistema de
// equipamentos existir; depois, o bônus passa a vir do que o jogador tiver equipado.
export const EQUIP_BASE = (n) => ({ arma: Math.round(n * 1.1), armadura: Math.round(n * 0.7) });

/** Atributos efetivos do jogador: equipamento-base + feridas ativas (−10% num atributo). */
export function atributosEfetivos(j, agora = Date.now()) {
  const a = { ...j.atributos };
  const eq = EQUIP_BASE(j.nivel);
  a.FOR += eq.arma; a.MAG += eq.arma; a.DEF += eq.armadura; a.RES += eq.armadura;
  for (const e of j.efeitos ?? []) if (e.tipo === "ferida" && +new Date(e.ate) > agora && a[e.atributo] != null) a[e.atributo] = Math.floor(a[e.atributo] * 0.9);
  return a;
}

// Elite (médio escalão) enfrentado sozinho: −30% de vida e −15% de ataque. Difícil, mas possível (party recomendada).
export const AJUSTE_SOLO = { medio: { hp: 0.7, ataque: 0.85 } };

export function novoCombate(j, vilao, nivel, { agora = Date.now(), solo = true } = {}) {
  const at = atributosVilao(nivel, vilao.tier, vilao.arquetipo);
  const aj = solo && AJUSTE_SOLO[vilao.tier];
  if (aj) { at.HP = Math.round(at.HP * aj.hp); at.FOR = Math.round(at.FOR * aj.ataque); at.MAG = Math.round(at.MAG * aj.ataque); }
  return {
    rodada: 1,
    jogador: { id: j.id, nome: j.nome, classe: j.classe, nivel: j.nivel, hp: j.hp, hpMax: j.hp_max, mp: j.mp, mpMax: j.mp_max,
      at: atributosEfetivos(j, agora), elemento: elementoBase(j.atributo_magico), recarga: 0, pocoes: 0, protecao: 0 },
    inimigo: { id: vilao.id, nome: vilao.nome, nivel, tier: vilao.tier, arquetipo: vilao.arquetipo, elemento: vilao.elemento,
      fraqueza: vilao.fraqueza, habilidade: vilao.habilidade, hp: at.HP, hpMax: at.HP, at,
      postura: POSTURA[vilao.tier] ?? 0, posturaMax: POSTURA[vilao.tier] ?? 0, atordoado: false, vulneravel: false, preso: 0, fraco: 0,
      chefe: ["alto", "rei", "divindade"].includes(vilao.tier) },
    preparando: false, log: [],
  };
}

const chance = (rng, pct) => rng() * 100 < pct;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const variacao = (rng) => 0.9 + rng() * 0.2;

function golpe(rng, { atk, nivel, def, poder, mult = 1, critExtra = 0, sor = 0, velAtk, velDef }) {
  if (chance(rng, clamp((velDef - velAtk) / 3, 0, 35))) return { dano: 0, esquivou: true };
  const critico = chance(rng, Math.min(40, 5 + sor / 4 + critExtra));
  const base = (atk * 3 * K(nivel)) / (K(nivel) + Math.max(0, def));
  return { dano: Math.max(1, Math.round(base * poder * mult * variacao(rng) * (critico ? 1.75 : 1))), critico };
}

/** Lista curta das ações disponíveis, para o rodapé do painel. */
export function opcoes(e) {
  const h = HABILIDADES[e.jogador.classe];
  const ops = ["a atacar"];
  if (e.jogador.mpMax > 0) ops.push("m1 magia");
  if (h) ops.push(`h1 ${h.nome}${e.jogador.recarga ? ` (espera ${e.jogador.recarga})` : ""}`);
  ops.push("d defender", "i poção", ...(e.inimigo.chefe ? [] : ["f fugir"]));
  return `_${ops.join(" · ")}_`;
}

const barra = (v, max, n = 8) => { const c = Math.round((Math.max(0, v) / max) * n); return "▰".repeat(c) + "▱".repeat(n - c); };

export function painel(e) {
  const { jogador: j, inimigo: i } = e;
  const guarda = i.posturaMax ? `  guarda ${"◆".repeat(Math.max(0, i.postura))}${"◇".repeat(i.posturaMax - Math.max(0, i.postura))}` : "";
  return [
    `⚔️ *${i.nome}* · rodada ${e.rodada}`,
    e.log.length ? e.log.join("\n") : null,
    e.preparando ? `_${i.nome} recua e junta forças… o próximo golpe vai ser pesado. (d para se defender)_` : null,
    [`${i.nome} ${barra(i.hp, i.hpMax)} ${Math.max(0, i.hp)}${guarda}${i.vulneravel ? "  *aberto*" : ""}${i.preso ? "  preso" : ""}${i.fraco ? "  fraco" : ""}`,
      `Você ${barra(j.hp, j.hpMax)} ${Math.max(0, j.hp)}/${j.hpMax}${j.mpMax ? ` · mana ${j.mp}` : ""}`].join("\n"),
    opcoes(e),
  ].filter(Boolean).join("\n\n");
}

/**
 * Resolve uma rodada. acao: { tipo: 'atacar'|'magia'|'habilidade'|'defender'|'item'|'fugir', temPocao }
 * Retorna { estado, fim: null|'vitoria'|'derrota'|'fuga', erro?, consumir? }
 */
export function resolverRodada(estado, acao, rng) {
  const e = structuredClone(estado);
  const { jogador: j, inimigo: i } = e;
  e.log = [];
  const hab = HABILIDADES[j.classe];

  // Validação antes de gastar a rodada
  if (acao.tipo === "magia" && (j.mpMax === 0 || j.mp < MAGIA.mp)) return { estado, fim: null, erro: j.mpMax === 0 ? "Sua classe não usa magia." : `MP insuficiente (precisa de ${MAGIA.mp}).` };
  if (acao.tipo === "habilidade") {
    if (!hab) return { estado, fim: null, erro: "Sua classe ainda não tem habilidade." };
    if (j.recarga > 0) return { estado, fim: null, erro: `${hab.nome} ainda está recarregando (${j.recarga} rodada(s)).` };
    if (j.mp < hab.mp) return { estado, fim: null, erro: `MP insuficiente para ${hab.nome} (precisa de ${hab.mp}).` };
  }
  if (acao.tipo === "item" && (!acao.temPocao || j.pocoes >= POCAO.maxPorBatalha))
    return { estado, fim: null, erro: acao.temPocao ? `Máximo de ${POCAO.maxPorBatalha} poções por batalha.` : "Você não tem poções." };
  if (acao.tipo === "fugir" && i.chefe) return { estado, fim: null, erro: "Não dá para fugir de um chefe." };

  let consumir = null, defendendo = false;
  const bonusQuebra = i.vulneravel ? 1.5 : 1;
  const acertar = (r, frase) => {
    if (r.esquivou) { e.log.push(`${n(pick(ESQUIVA, e.rodada), { i: i.nome })}.`); return 0; }
    i.hp -= r.dano;
    e.log.push(`${r.critico ? "*Golpe perfeito!* " : ""}${frase} _(${r.dano})_`);
    if (i.posturaMax && r.critico) i.postura -= 1;
    return r.dano;
  };
  const vsInimigo = (tipo, poder, extra = {}) => golpe(rng, {
    atk: tipo === "magico" ? j.at.MAG : j.at.FOR, nivel: j.nivel,
    def: (tipo === "magico" ? i.at.RES : i.at.DEF) * (1 - (extra.ignoraDef ?? 0)), poder,
    mult: (tipo === "magico" ? multElemento(j.elemento, i.elemento, i.fraqueza) : 1) * bonusQuebra,
    critExtra: extra.critico ?? 0, sor: j.at.SOR, velAtk: j.at.VEL, velDef: i.at.VEL,
  });

  // 1) Ação do jogador
  if (acao.tipo === "atacar") acertar(vsInimigo("fisico", 1), n(pick(GOLPE_CLASSE[j.classe] ?? GOLPE_CLASSE.Espadachim, e.rodada), { a: i.nome }) + ".");
  else if (acao.tipo === "magia") {
    j.mp -= MAGIA.mp;
    const fraqueza = multElemento(j.elemento, i.elemento, i.fraqueza) > 1;
    const d = acertar(vsInimigo("magico", MAGIA.poder), n(MAGIA_ELEMENTO[j.elemento] ?? "Sua mana explode contra {a}", { a: i.nome }) + ".");
    if (d && fraqueza) { e.log.push(`${i.nome} se contorce: é o ponto fraco dele.`); if (i.posturaMax) i.postura -= 2; }
  } else if (acao.tipo === "habilidade") {
    j.mp -= hab.mp; j.recarga = hab.recarga + 1;
    if (hab.custoHp) { const c = Math.ceil(j.hpMax * hab.custoHp); j.hp -= c; e.log.push(`O miasma queima por dentro. _(−${c} de vida)_`); }
    if (hab.tipo === "cura") {
      const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.cura)); j.hp += c; e.log.push(`Uma luz quente fecha suas feridas. _(+${c})_`);
    } else {
      const d = acertar(vsInimigo(hab.tipo, hab.poder, hab), `*${hab.nome}!* ${hab.frase ?? ""}`.trim());
      if (d) {
        if (hab.postura && i.posturaMax) i.postura -= hab.postura;
        if (hab.rouba) { const c = Math.min(j.hpMax - j.hp, Math.round(d * hab.rouba)); j.hp += c; if (c) e.log.push(`O gosto da luta te dá forças. _(+${c})_`); }
        if (hab.curaFixa) { const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.curaFixa)); j.hp += c; if (c) e.log.push(`A luz também cuida de você. _(+${c})_`); }
        if (hab.enfraquece) { i.fraco = hab.enfraquece; e.log.push(`Marcas escuras se espalham pela pele de ${i.nome}. Ele fica mais fraco.`); }
        if (hab.prende) { i.preso = hab.prende; e.log.push(`Raízes saem do chão e prendem ${i.nome}.`); }
      }
      if (hab.protecao) j.protecao = hab.protecao;
    }
  } else if (acao.tipo === "defender") { defendendo = true; e.log.push("Você firma os pés e se protege."); }
  else if (acao.tipo === "item") {
    j.pocoes += 1; consumir = "pocao";
    const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * POCAO.cura)); j.hp += c; e.log.push(`Você bebe uma poção num gole só. _(+${c})_`);
  } else if (acao.tipo === "fugir") {
    if (chance(rng, clamp(50 + (j.at.VEL - i.at.VEL), 10, 90))) { e.log.push("Você corre sem olhar para trás."); return { estado: e, fim: "fuga", consumir }; }
    e.log.push(`Você tenta fugir, mas ${i.nome} corta o caminho.`);
  }

  // Guarda quebrada: o bônus de +50% vale só para a ação seguinte do jogador; depois a guarda volta cheia.
  if (bonusQuebra > 1) { i.vulneravel = false; i.postura = i.posturaMax; }
  else if (i.posturaMax && i.postura <= 0) {
    i.postura = 0; i.atordoado = true; i.vulneravel = true;
    e.log.push(`*A guarda de ${i.nome} se quebra!* Ele cambaleia, aberto. _(perde a vez · seu próximo golpe +50%)_`);
  }

  if (i.hp <= 0) { i.hp = 0; e.log.push(`*${i.nome} cai e não se levanta mais.*`); return { estado: e, fim: "vitoria", consumir }; }

  // 2) Ação do inimigo
  if (i.atordoado) { i.atordoado = false; e.log.push(`${i.nome} ainda está zonzo.`); }
  else if (i.preso > 0) { i.preso -= 1; e.log.push(`${i.nome} se debate contra as raízes.`); }
  else {
    const forte = e.preparando;
    const magico = i.at.MAG > i.at.FOR;
    const r = golpe(rng, { atk: magico ? i.at.MAG : i.at.FOR, nivel: i.nivel, def: magico ? j.at.RES : j.at.DEF,
      poder: forte ? 1.7 : 1, mult: (magico ? multElemento(i.elemento, j.elemento) : 1) * (i.fraco ? 0.75 : 1),
      sor: 0, velAtk: i.at.VEL, velDef: j.at.VEL });
    if (r.esquivou) e.log.push(`${pick(VOCE_DESVIA, e.rodada)}.`);
    else {
      let d = r.dano;
      if (defendendo) d = Math.ceil(d / 2);
      if (j.protecao) { d = Math.ceil(d * (1 - j.protecao)); }
      j.hp -= d;
      e.log.push(forte ? `*${(i.habilidade ?? "Golpe forte").split(":")[0]}!* ${i.nome} solta tudo de uma vez. _(−${d})_`
        : `${r.critico ? "*Em cheio!* " : ""}${n(pick(ATAQUE_INIMIGO[i.arquetipo] ?? ATAQUE_INIMIGO.equilibrado, e.rodada), { i: i.nome })}. _(−${d})_`);
    }
    e.preparando = false;
  }
  if (i.fraco > 0) i.fraco -= 1;
  j.protecao = 0;
  if (j.recarga > 0) j.recarga -= 1;
  // Golpe forte telegrafado a cada 3 rodadas (a partir da 2ª)
  if (!e.preparando && (e.rodada + 1) % 3 === 0 && !i.preso) e.preparando = true;
  // Chefes recuperam 1 de guarda por rodada
  if (i.chefe && !i.vulneravel && i.postura < i.posturaMax) i.postura += 1;

  if (j.hp <= 0) { j.hp = 0; e.log.push("Suas pernas cedem. O chão vem ao seu encontro."); return { estado: e, fim: "derrota", consumir }; }
  e.rodada += 1;
  return { estado: e, fim: null, consumir };
}

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
