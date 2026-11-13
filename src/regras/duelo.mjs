// Duelo amistoso entre dois jogadores, por turnos, com o mesmo dado e as mesmas habilidades das batalhas.
// Ninguém se machuca de verdade: a vida do duelo é uma cópia (os dois entram inteiros) e nada volta para a ficha.
import { KITS, MAGIA, PASSIVAS, FAIXAS, habilidadesDe, atributosEfetivos, elementoBase, multElemento, rolar, bonusDado } from "./combate.mjs";
import { K } from "../../scripts/balanceamento.mjs";

export const DUELO = {
  dano: 0.5,            // golpes valem metade: jogadores têm muito menos vida que vilões, e o duelo precisa durar
  maxTurnos: 12,        // por jogador; depois disso vence quem tiver mais vida (em %)
  esperaMs: 5 * 60_000, // sem resposta nesse tempo, o outro pode pedir a vitória (wo)
  validadeMs: 30 * 60_000,
  xpVencedor: 0.02, xpPerdedor: 0.01, porDia: 3, // fração do XP do nível; só os 3 primeiros duelos do dia rendem
  guarda: 5,            // pontos de guarda de cada duelista; zerou, fica "aberto" (o próximo golpe vale +50%)
  aberto: 1.5,
  cura: 0.5,            // curas, roubo de vida e regeneração valem metade: um duelo não pode virar disputa de quem se cura mais
  passivaDefesa: 0.5,   // reduções de dano das passivas valem metade contra outro jogador
  mistura: 0.5,         // quanto a defesa usada puxa para a média de DEF e RES (0 = como nas batalhas, 1 = só a média)
};
/**
 * Calibração por classe e por faixa de nível (gerada por scripts/simular-duelo.mjs calibrar): multiplicador da vida de duelo.
 * As classes foram pensadas contra vilões; uma contra a outra, sem ajuste, algumas ganham sempre. Meta: 45–55% contra o campo.
 */
export const NIVEIS_AJUSTE = [10, 30, 60, 90];
export const AJUSTE_DUELO = {
  Mago: [0.95, 0.94, 1.00, 1.05],
  Cavaleiro: [1.08, 0.97, 0.83, 0.72],
  Bruxo: [0.97, 1.12, 1.17, 1.15],
  "Anti-magia": [0.58, 0.53, 0.56, 0.53],
  Espadachim: [0.74, 0.67, 0.80, 0.90],
  "Meio-humano": [1.39, 1.18, 1.13, 1.21],
  "Força da Natureza": [1.05, 1.03, 0.99, 0.90],
  "Demônio": [1.18, 1.56, 1.61, 1.88],
  Paladino: [1.15, 1.19, 1.06, 0.93],
};
/**
 * Fôlego extra contra o adversário que é o ponto fraco natural da classe ("Classe|Adversário": multiplicador de vida).
 * Só existe para confrontos que, mesmo com o ajuste por classe, ficavam fora de 35–65%.
 */
export const PAR_DUELO = {
  "Mago|Anti-magia": 1.28,
  "Mago|Demônio": 1.06,
  "Cavaleiro|Bruxo": 1.04,
  "Cavaleiro|Força da Natureza": 1.28,
  "Bruxo|Mago": 1.08,
  "Bruxo|Anti-magia": 1.17,
  "Anti-magia|Espadachim": 1.37,
  "Anti-magia|Meio-humano": 1.33,
  "Espadachim|Cavaleiro": 1.24,
  "Espadachim|Paladino": 1.11,
  "Meio-humano|Cavaleiro": 1.07,
  "Meio-humano|Paladino": 1.12,
  "Força da Natureza|Mago": 1.07,
  "Força da Natureza|Bruxo": 1.18,
  "Força da Natureza|Anti-magia": 1.04,
  "Força da Natureza|Demônio": 1.07,
  "Demônio|Paladino": 1.13,
  "Paladino|Bruxo": 1.11,
  "Paladino|Força da Natureza": 1.13,
  "Bruxo|Demônio": 1.04,
};
export const parDuelo = (classe, adversario) => PAR_DUELO[`${classe}|${adversario}`] ?? 1;
/** Multiplicador de vida de duelo da classe naquele nível (interpola entre as faixas calibradas). */
export function ajusteDuelo(classe, nivel) {
  const t = AJUSTE_DUELO[classe];
  if (!t) return 1;
  if (nivel <= NIVEIS_AJUSTE[0]) return t[0];
  for (let k = 1; k < NIVEIS_AJUSTE.length; k++) if (nivel <= NIVEIS_AJUSTE[k]) {
    const f = (nivel - NIVEIS_AJUSTE[k - 1]) / (NIVEIS_AJUSTE[k] - NIVEIS_AJUSTE[k - 1]);
    return t[k - 1] + (t[k] - t[k - 1]) * f;
  }
  return t.at(-1);
}
const barra = (v, max, n = 8) => { const c = Math.max(0, Math.min(n, Math.round((v / max) * n))); return "▰".repeat(c) + "▱".repeat(n - c); };

function lado(j, adversario = null) {
  const at = atributosEfetivos(j, Date.now(), j.equip ?? {});
  // A vida no duelo é a da ficha (é o número que o jogador conhece). O equilíbrio entre classes entra como "fôlego":
  // quanto do dano recebido realmente desconta. Fôlego 1,5 = cada golpe tira 1/1,5 do que tiraria.
  const folego = ajusteDuelo(j.classe, j.nivel) * (adversario ? parDuelo(j.classe, adversario.classe) : 1);
  const vida = j.hp_max;
  return { id: Number(j.id), nome: j.nome, classe: j.classe, nivel: j.nivel, hp: vida, hpMax: vida, folego, mp: j.mp_max, mpMax: j.mp_max, at, guarda: DUELO.guarda, aberto: false,
    elemento: elementoBase(j.atributo_magico), recargas: {}, protecao: 0, protecaoTurnos: 0, foco: false, fraco: 0, preso: 0, imune: 0, queima: 0, queimaDano: 0, turnos: 0 };
}

export function novoDuelo(a, b, agora = Date.now()) {
  const lados = [lado(a, b), lado(b, a)];
  const e = { lados, vez: lados[0].at.VEL >= lados[1].at.VEL ? 0 : 1, log: [], ultimo: agora, inicio: agora };
  e.log.push(`${lados[e.vez].nome} é mais rápido e começa.`);
  return e;
}

/** Menu numerado de quem está na vez. */
export function menuDuelo(e) {
  const j = e.lados[e.vez], itens = [];
  const add = (acao, rotulo, detalhe = null, bloqueio = null) => itens.push({ n: itens.length + 1, acao, rotulo, detalhe, bloqueio });
  add({ tipo: "atacar" }, "Atacar");
  add({ tipo: "defender" }, "Defender");
  if (j.mpMax > 0) add({ tipo: "magia" }, `Magia de ${j.elemento ?? "mana"}`, `${MAGIA.mp} de mana`, j.mp < MAGIA.mp ? "sem mana" : null);
  for (const h of habilidadesDe(j.classe, j.nivel)) {
    const rec = j.recargas[h.id] ?? 0;
    add({ tipo: "habilidade", id: h.id }, h.nome, `${h.resumo}${h.mp ? ` · ${h.mp} de mana` : ""}`, rec > 0 ? `volta em ${rec}` : j.mp < (h.mp ?? 0) ? "sem mana" : null);
  }
  return itens;
}
export function escolherDuelo(e, texto) {
  const t = String(texto).trim().toLowerCase(), m = menuDuelo(e);
  const x = /^\d+$/.test(t) ? m[Number(t) - 1] : m.find((i) => i.acao.tipo === ({ atacar: "atacar", a: "atacar", defender: "defender", d: "defender", magia: "magia", m: "magia" }[t]));
  if (!x) return /^\d+$/.test(t) ? { erro: `Escolha um número de 1 a ${m.length}.` } : null;
  if (x.bloqueio) return { erro: `${x.rotulo}: ${x.bloqueio}.` };
  return x;
}

export function painelDuelo(e, { menu = true } = {}) {
  const [a, b] = e.lados, j = e.lados[e.vez];
  const linha = (x) => `${x.nome} ${barra(x.hp, x.hpMax)} ${Math.max(0, x.hp)}/${x.hpMax}${x.mpMax ? ` · mana ${x.mp}` : ""}${x.protecaoTurnos ? " · protegido" : ""}${x.foco ? " · concentrado" : ""}${x.fraco ? " · fraco" : ""}${x.queima ? " · ferido" : ""}${x.aberto ? " · *aberto*" : ""}  guarda ${"◆".repeat(Math.max(0, x.guarda))}${"◇".repeat(DUELO.guarda - Math.max(0, x.guarda))}`;
  return [
    `⚔️ *Duelo — ${a.nome} × ${b.nome}*`,
    e.log.length ? e.log.join("\n") : null,
    `${linha(a)}\n${linha(b)}`,
    menu ? `*Vez de ${j.nome}.* Responda aqui com o número:\n${menuDuelo(e).map((x) => `*${x.n}* ${x.rotulo}${x.bloqueio ? ` _(${x.bloqueio})_` : x.detalhe ? ` — _${x.detalhe}_` : ""}`).join("\n")}\n_desistir encerra · mesmo dado das batalhas: 1 erra, 20 é perfeito · guarda ◆ zerada = próximo golpe +50%_` : null,
  ].filter(Boolean).join("\n\n");
}

const dadoTxt = (d) => `🎲 *${d.nat}*${d.total !== d.nat && d.nat !== 1 && d.nat !== 20 ? ` ${d.total > d.nat ? "+" : "−"}${Math.abs(d.total - d.nat)} = ${d.total}` : ""} · ${d.texto}${d.mult && d.mult !== 1 ? ` ×${String(d.mult).replace(".", ",")}` : ""}`;

/** Começo da vez de alguém: recargas, dano contínuo e turno perdido. Devolve o vencedor (índice) se alguém cair aqui, ou null. */
function abrirVez(e) {
  for (let guarda = 0; guarda < 4; guarda++) {
    const j = e.lados[e.vez];
    for (const k of Object.keys(j.recargas)) if (j.recargas[k] > 0) j.recargas[k] -= 1;
    if (j.imune > 0) j.imune -= 1;
    const regen = PASSIVAS[j.classe]?.regen;
    if (regen && j.hp > 0 && j.hp < j.hpMax) j.hp = Math.min(j.hpMax, j.hp + Math.ceil(j.hpMax * regen * DUELO.cura));
    if (j.queima > 0) { j.hp -= j.queimaDano; j.queima -= 1; e.log.push(`${j.nome} sente a ferida arder. _(−${j.queimaDano})_`); if (j.hp <= 0) return 1 - e.vez; }
    if (j.preso > 0) { j.preso -= 1; j.imune = 2; j.turnos += 1; e.log.push(`${j.nome} está preso e perde a vez.`); e.vez = 1 - e.vez; continue; }
    return null;
  }
  return null;
}

/**
 * Executa a ação de quem está na vez. acao: { tipo: 'atacar'|'defender'|'magia'|'habilidade', id? }
 * Devolve { estado, fim: null | { vencedor, perdedor, motivo } }.
 */
export function agirDuelo(estado, acao, rng, agora = Date.now()) {
  const e = structuredClone(estado);
  e.log = [];
  const j = e.lados[e.vez], o = e.lados[1 - e.vez];
  const pj = PASSIVAS[j.classe] ?? {}, po = PASSIVAS[o.classe] ?? {};
  const bd = bonusDado(j.at) + (po.dadoInimigo ?? 0) + (pj.furia && j.hp < j.hpMax / 2 ? pj.furia : 0);
  const curar = (x, q) => { const c = Math.max(0, Math.min(x.hpMax - x.hp, Math.round(q * DUELO.cura))); x.hp += c; return c; };
  const ferir = (tipo, poder, d, nome, x = {}) => {
    if (d.faixa === "falha") { e.log.push(`${dadoTxt(d)}. ${j.nome} usa ${nome}, e ${o.nome} sai do caminho.`); return 0; }
    const magico = tipo === "magico";
    // No duelo, defesa física e mágica se aproximam: sem isso, quem tem só uma das duas perde sempre para o tipo "errado" de adversário
    const media = ((o.at.DEF ?? 0) + (o.at.RES ?? 0)) / 2;
    const def = ((magico ? o.at.RES : o.at.DEF) * (1 - DUELO.mistura) + media * DUELO.mistura) * (1 - (x.ignoraDef ?? 0));
    const reducao = ((po.reducao ?? 0) + (po.reducaoComMana && o.mp > 0 ? po.reducaoComMana : 0) + (magico ? po.reducaoMagia ?? 0 : 0)) * DUELO.passivaDefesa;
    const elemento = magico ? multElemento(j.elemento, o.elemento) : 1;
    const aberto = o.aberto;
    const mult = d.mult * elemento * (aberto ? DUELO.aberto : 1) * (j.foco ? 1.5 : 1) * (j.fraco ? (po.reducao && o.classe === "Bruxo" ? 0.65 : 0.75) : 1) * (1 - reducao)
      * (1 - (o.protecaoTurnos && !aberto ? o.protecao : 0)) * DUELO.dano / (o.folego ?? 1);
    let dano = 0;
    for (let g = 0; g < (x.golpes ?? 1); g++) dano += Math.max(1, Math.round((((magico ? j.at.MAG : j.at.FOR) * 3 * K(j.nivel)) / (K(j.nivel) + Math.max(0, def))) * poder * mult));
    o.hp -= dano; j.foco = false;
    e.log.push(`${dadoTxt(d)}. ${j.nome} acerta ${o.nome} com ${nome}${aberto ? ", de guarda aberta (+50%)" : o.protecaoTurnos ? ", através da proteção" : ""}. _(${dano} de dano)_`);
    if (elemento > 1) e.log.push(`O elemento de ${j.nome} leva vantagem sobre o de ${o.nome}.`);
    else if (elemento < 1) e.log.push(`O elemento de ${o.nome} resiste ao de ${j.nome}.`);
    // guarda: golpe perfeito tira 1, vantagem de elemento tira 2, habilidades de quebra tiram o que dizem
    if (aberto) { o.aberto = false; o.guarda = DUELO.guarda; }
    else {
      o.guarda -= (d.faixa === "critico" ? 1 : 0) + (elemento > 1 ? 2 : 0) + (x.postura ?? 0);
      if (o.guarda <= 0) { o.guarda = 0; o.aberto = true; o.protecao = 0; o.protecaoTurnos = 0; e.log.push(`*A guarda de ${o.nome} quebrou!* O próximo golpe entra com +50%.`); }
    }
    return dano;
  };

  if (acao.tipo === "atacar") ferir(j.at.MAG > j.at.FOR && !j.mpMax ? "magico" : "fisico", 1, rolar(rng, bd), "um golpe direto");
  else if (acao.tipo === "magia") { j.mp -= MAGIA.mp; ferir("magico", MAGIA.poder, rolar(rng, bd), `magia de ${j.elemento ?? "mana"}`); }
  else if (acao.tipo === "defender") {
    const d = rolar(rng, bd);
    j.protecao = Math.min(0.8, FAIXAS[d.faixa].defesa + (pj.defesaExtra ?? 0)); j.protecaoTurnos = 1;
    e.log.push(`${dadoTxt(d)}. ${j.nome} fecha a guarda. _(bloqueia ${Math.round(j.protecao * 100)}% do próximo golpe)_`);
    if (j.aberto) { j.aberto = false; j.guarda = Math.ceil(DUELO.guarda / 2); e.log.push(`${j.nome} recompõe a postura.`); }
    if (d.faixa === "critico" && !o.aberto) { o.guarda = Math.max(0, o.guarda - 2); e.log.push(`Defesa perfeita: ${o.nome} perde o equilíbrio.`); if (!o.guarda) { o.aberto = true; o.protecao = 0; o.protecaoTurnos = 0; e.log.push(`*A guarda de ${o.nome} quebrou!*`); } }
  } else if (acao.tipo === "habilidade") {
    const h = (KITS[j.classe] ?? []).find((x) => x.id === acao.id);
    if (!h) return { estado, fim: null, erro: "Habilidade desconhecida." };
    j.mp -= h.mp ?? 0; j.recargas[h.id] = (h.recarga ?? 0) + 1;
    if (h.custoHp) j.hp -= Math.round(j.hpMax * h.custoHp);
    const d = rolar(rng, bd + (h.dado ?? 0));
    if (h.tipo === "fisico" || h.tipo === "magico") {
      const dano = ferir(h.tipo, h.poder, d, `*${h.nome}*`, h);
      if (dano > 0) {
        if (h.rouba) e.log.push(`${j.nome} recupera ${curar(j, (dano * (o.folego ?? 1) / (j.folego ?? 1)) * h.rouba)} de vida.`);
        if (h.curaFixa) e.log.push(`${j.nome} recupera ${curar(j, j.hpMax * h.curaFixa)} de vida.`);
        if (h.queima) { o.queima = h.queima; o.queimaDano = Math.max(1, Math.round(dano * 0.15)); }
        if (h.enfraquece) o.fraco = h.enfraquece;
        if (h.prende && !o.imune) o.preso = 1;
      }
      if (h.protecao) { j.protecao = h.protecao; j.protecaoTurnos = h.duracao ?? 1; }
    } else {
      const forca = (d.faixa === "falha" ? 0.5 : d.faixa === "critico" ? 1.3 : 1) * (1 + (pj.curaExtra ?? 0));
      const partes = [];
      if (h.cura) partes.push(`recupera ${curar(j, j.hpMax * h.cura * forca)} de vida`);
      if (h.protecao) { j.protecao = Math.min(0.85, h.protecao * forca); j.protecaoTurnos = h.duracao ?? 1; partes.push(`bloqueia ${Math.round(j.protecao * 100)}% por ${j.protecaoTurnos} golpe${j.protecaoTurnos > 1 ? "s" : ""}`); }
      if (h.foco) { j.foco = true; partes.push("o próximo golpe vale +50%"); }
      if (h.enfraqueceAlvo) { o.fraco = h.enfraqueceAlvo; partes.push(`${o.nome} fica fraco`); }
      e.log.push(`${dadoTxt(d)}. ${j.nome} usa *${h.nome}*${partes.length ? `: ${partes.join(", ")}` : ""}.`);
    }
  } else return { estado, fim: null, erro: "Ação desconhecida." };

  // fim do turno de quem agiu: efeitos dele contam um turno; a guarda do outro gasta um golpe
  if (j.fraco > 0) j.fraco -= 1;
  if (o.protecaoTurnos > 0 && acao.tipo !== "defender" && !(acao.tipo === "habilidade" && !["fisico", "magico"].includes((KITS[j.classe] ?? []).find((x) => x.id === acao.id)?.tipo))) { o.protecaoTurnos -= 1; if (!o.protecaoTurnos) o.protecao = 0; }
  j.turnos += 1; e.ultimo = agora;
  const fim = (v, motivo) => ({ estado: e, fim: { vencedor: e.lados[v], perdedor: e.lados[1 - v], motivo } });
  const euIdx = e.vez;
  if (o.hp <= 0) return fim(euIdx, "nocaute");
  if (j.hp <= 0) return fim(1 - euIdx, "nocaute");
  e.vez = 1 - e.vez;
  const caiu = abrirVez(e);
  if (caiu != null) return fim(caiu, "nocaute");
  if (e.lados.every((x) => x.turnos >= DUELO.maxTurnos)) {
    const [a, b] = e.lados, v = a.hp / a.hpMax === b.hp / b.hpMax ? (a.at.SOR >= b.at.SOR ? 0 : 1) : a.hp / a.hpMax > b.hp / b.hpMax ? 0 : 1;
    e.log.push("O juiz levanta a mão: acabou o tempo.");
    return fim(v, "tempo");
  }
  return { estado: e, fim: null };
}
