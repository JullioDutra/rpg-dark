// Combate solo por rodadas (doc 08.4, 22.8, 19). Regras puras: recebem estado + ação + rng e devolvem o novo estado.
// O servidor guarda o estado em jogo.batalhas.estado e aplica XP/HP/recompensas ao final.
import { readFileSync } from "node:fs";
import { TIERS, XP_VILAO, XP_PROXIMO, K, atributosVilao } from "../../scripts/balanceamento.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const CICLO = ler("reinos.json").ciclo_elemental;
export const CLASSES = ler("classes.json").classes;

// Uma habilidade por classe (h1). Fácil de lembrar, cada uma com um papel diferente.
export const HABILIDADES = {
  Mago: { nome: "Rajada Arcana", tipo: "magico", poder: 1.8, mp: 14, recarga: 2, texto: "magia forte" },
  Cavaleiro: { nome: "Golpe de Escudo", tipo: "fisico", poder: 1.3, mp: 8, recarga: 2, postura: 2, protecao: 0.5, texto: "golpe que quebra a guarda e protege você" },
  Bruxo: { nome: "Maldição", tipo: "magico", poder: 1.3, mp: 12, recarga: 3, enfraquece: 2, texto: "enfraquece o inimigo por 2 rodadas" },
  "Anti-magia": { nome: "Corte do Vazio", tipo: "fisico", poder: 1.7, mp: 0, recarga: 2, ignoraDef: 0.3, texto: "corte que atravessa defesas" },
  Espadachim: { nome: "Iaijutsu", tipo: "fisico", poder: 1.6, mp: 8, recarga: 2, critico: 15, texto: "saque rápido, crítico fácil" },
  "Meio-humano": { nome: "Fúria da Fera", tipo: "fisico", poder: 1.5, mp: 8, recarga: 2, rouba: 0.25, texto: "golpe que recupera vida" },
  "Força da Natureza": { nome: "Raízes", tipo: "magico", poder: 1.2, mp: 12, recarga: 3, prende: 1, texto: "prende o inimigo por 1 rodada" },
  "Demônio": { nome: "Miasma", tipo: "magico", poder: 1.7, mp: 0, custoHp: 0.05, recarga: 2, texto: "magia sombria que custa vida" },
  Paladino: { nome: "Golpe Sagrado", tipo: "fisico", poder: 1.5, mp: 10, recarga: 2, curaFixa: 0.12, texto: "golpe de luz que também cura" },
};
export const MAGIA = { nome: "Magia elemental", poder: 1.3, mp: 6 };
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

/** Lista curta das ações disponíveis, para o painel. */
export function opcoes(e) {
  const h = HABILIDADES[e.jogador.classe];
  const ops = ["*a* atacar"];
  if (e.jogador.mpMax > 0) ops.push(`*m1* magia (${MAGIA.mp} MP)`);
  if (h) ops.push(`*h1* ${h.nome}${h.mp ? ` (${h.mp} MP)` : ""}${e.jogador.recarga ? ` ⏳${e.jogador.recarga}` : ""}`);
  ops.push("*d* defender", "*i pocao* poção", ...(e.inimigo.chefe ? [] : ["*f* fugir"]));
  return ops.join(" · ");
}

const barra = (v, max, n = 10) => "▰".repeat(Math.round((Math.max(0, v) / max) * n)) + "▱".repeat(n - Math.round((Math.max(0, v) / max) * n));

export function painel(e) {
  const { jogador: j, inimigo: i } = e;
  return [
    `⚔️ *Rodada ${e.rodada}* — ${i.nome} (Nv ${i.nivel})`,
    `👹 ${i.nome} ${barra(i.hp, i.hpMax)} ${Math.max(0, i.hp)}/${i.hpMax}${i.posturaMax ? `\n🛡️ Guarda ${barra(i.postura, i.posturaMax, i.posturaMax)}` : ""}` +
      `${i.vulneravel ? " 💥 *GUARDA QUEBRADA* (+50% de dano)" : ""}${i.preso ? " 🌿 preso" : ""}${i.fraco ? " 🩸 enfraquecido" : ""}`,
    e.preparando ? `⚠️ *${i.nome} está preparando um golpe forte!* Defender (*d*) reduz o dano pela metade.` : null,
    `🧑 ${j.nome} ${barra(j.hp, j.hpMax)} ${Math.max(0, j.hp)}/${j.hpMax} · 🔷 MP ${j.mp}/${j.mpMax}`,
    e.log.length ? `━━━━━━━━━━\n${e.log.map((l) => `• ${l}`).join("\n")}` : null,
    `━━━━━━━━━━\n${opcoes(e)}`,
  ].filter(Boolean).join("\n");
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
  const acertar = (r, nomeAcao) => {
    if (r.esquivou) { e.log.push(`${i.nome} desviou do seu ${nomeAcao}.`); return 0; }
    i.hp -= r.dano;
    e.log.push(`Seu ${nomeAcao} causou *${r.dano}* de dano${r.critico ? " (CRÍTICO!)" : ""}.`);
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
  if (acao.tipo === "atacar") acertar(vsInimigo("fisico", 1), "ataque");
  else if (acao.tipo === "magia") {
    j.mp -= MAGIA.mp;
    const fraqueza = multElemento(j.elemento, i.elemento, i.fraqueza) > 1;
    const d = acertar(vsInimigo("magico", MAGIA.poder), `feitiço de ${j.elemento ?? "mana"}`);
    if (d && fraqueza) { e.log.push("É super efetivo! 🔥"); if (i.posturaMax) i.postura -= 2; }
  } else if (acao.tipo === "habilidade") {
    j.mp -= hab.mp; j.recarga = hab.recarga + 1;
    if (hab.custoHp) { const c = Math.ceil(j.hpMax * hab.custoHp); j.hp -= c; e.log.push(`${hab.nome} consumiu ${c} de vida.`); }
    if (hab.tipo === "cura") {
      const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.cura)); j.hp += c; e.log.push(`${hab.nome} curou *${c}* de vida.`);
    } else {
      const d = acertar(vsInimigo(hab.tipo, hab.poder, hab), hab.nome);
      if (d) {
        if (hab.postura && i.posturaMax) i.postura -= hab.postura;
        if (hab.rouba) { const c = Math.min(j.hpMax - j.hp, Math.round(d * hab.rouba)); j.hp += c; if (c) e.log.push(`Você recuperou ${c} de vida.`); }
        if (hab.curaFixa) { const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * hab.curaFixa)); j.hp += c; if (c) e.log.push(`A luz curou ${c} de vida.`); }
        if (hab.enfraquece) { i.fraco = hab.enfraquece; e.log.push(`${i.nome} ficou enfraquecido.`); }
        if (hab.prende) { i.preso = hab.prende; e.log.push(`${i.nome} ficou preso pelas raízes!`); }
      }
      if (hab.protecao) j.protecao = hab.protecao;
    }
  } else if (acao.tipo === "defender") { defendendo = true; e.log.push("Você se defende."); }
  else if (acao.tipo === "item") {
    j.pocoes += 1; consumir = "pocao";
    const c = Math.min(j.hpMax - j.hp, Math.round(j.hpMax * POCAO.cura)); j.hp += c; e.log.push(`Você bebeu uma poção: +${c} de vida.`);
  } else if (acao.tipo === "fugir") {
    if (chance(rng, clamp(50 + (j.at.VEL - i.at.VEL), 10, 90))) { e.log.push("Você fugiu da batalha!"); return { estado: e, fim: "fuga", consumir }; }
    e.log.push("Você tentou fugir, mas não conseguiu!");
  }

  // Guarda quebrada: o bônus de +50% vale só para a ação seguinte do jogador; depois a guarda volta cheia.
  if (bonusQuebra > 1) { i.vulneravel = false; i.postura = i.posturaMax; }
  else if (i.posturaMax && i.postura <= 0) {
    i.postura = 0; i.atordoado = true; i.vulneravel = true;
    e.log.push(`💥 *A guarda de ${i.nome} quebrou!* Ele perde a ação e seu próximo golpe causa +50% de dano.`);
  }

  if (i.hp <= 0) { i.hp = 0; e.log.push(`🏆 *${i.nome} foi derrotado!*`); return { estado: e, fim: "vitoria", consumir }; }

  // 2) Ação do inimigo
  if (i.atordoado) { i.atordoado = false; e.log.push(`${i.nome} está atordoado e não age.`); }
  else if (i.preso > 0) { i.preso -= 1; e.log.push(`${i.nome} tenta se soltar das raízes.`); }
  else {
    const forte = e.preparando;
    const magico = i.at.MAG > i.at.FOR;
    const r = golpe(rng, { atk: magico ? i.at.MAG : i.at.FOR, nivel: i.nivel, def: magico ? j.at.RES : j.at.DEF,
      poder: forte ? 1.7 : 1, mult: (magico ? multElemento(i.elemento, j.elemento) : 1) * (i.fraco ? 0.75 : 1),
      sor: 0, velAtk: i.at.VEL, velDef: j.at.VEL });
    if (r.esquivou) e.log.push(`Você desviou ${forte ? "do golpe forte" : "do ataque"} de ${i.nome}!`);
    else {
      let d = r.dano;
      if (defendendo) d = Math.ceil(d / 2);
      if (j.protecao) { d = Math.ceil(d * (1 - j.protecao)); }
      j.hp -= d;
      e.log.push(forte ? `${i.nome} usou *${(i.habilidade ?? "golpe forte").split(":")[0]}*: *${d}* de dano em você!` : `${i.nome} atacou: *${d}* de dano em você${r.critico ? " (CRÍTICO!)" : ""}.`);
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

  if (j.hp <= 0) { j.hp = 0; e.log.push(`☠️ *Você caiu diante de ${i.nome}.*`); return { estado: e, fim: "derrota", consumir }; }
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
