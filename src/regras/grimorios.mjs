// Os 40 grimórios (data/grimorios.json) como coisa jogável: onde cada um está escondido, quem pode ler e o que
// cada magia faz numa batalha. As descrições originais são texto livre; aqui elas viram os mesmos efeitos das
// habilidades de classe (dano, cura, proteção, foco, enfraquecer, prender, dano contínuo), sem inventar regra nova.
import { readFileSync } from "node:fs";
import { CLASSES } from "./combate.mjs";
import { REGIOES } from "./exploracao.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const SUBFASE = new Map(ler("subfases.json").map((s) => [s.id, s]));
const n = (s) => semAcento(String(s).toLowerCase());

/** Nível mínimo para ler, por rank. */
export const NIVEL_RANK = { E: 1, D: 8, C: 18, B: 30, A: 45, S: 60 };
const PODER_RANK = { E: 1.0, D: 1.2, C: 1.4, B: 1.7, A: 2.0, S: 2.3 };
const num = (s) => Number(String(s).replace(",", "."));

/** Converte a descrição de uma magia nos efeitos de batalha. Devolve null quando a magia é só de exploração/história. */
function efeito(desc, rank) {
  const t = n(desc), base = PODER_RANK[rank];
  const x = {};
  // riders (valem para qualquer magia de dano)
  const prende = /\bprende\b|adormece|petrifica alvo|congela 1 alvo|perde o proximo turno|atordoa 1 turno/.test(t);
  const fraco = /cega|medo|confusao|silencia|nao pode conjurar|precisao|−\d+% (vel|def)|-\d+% (vel|def)|e −def|congelamento \d+%|paralisia \d+%|atordoa \d+%|sela uma habilidade|forca o inimigo/.test(t);
  const queima = /queimadura|veneno|sangramento|chamas que/.test(t) ? (/veneno forte/.test(t) ? 4 : 3) : 0;
  const ign = t.match(/ignora (\d+)% (res|def)/) ? Number(t.match(/ignora (\d+)% (res|def)/)[1]) / 100 : /ignora toda def|dano verdadeiro|ignora escudos/.test(t) ? 0.6 : 0;
  const protege = /escudo|bloqueia|imune|def ×2|\+\d+% def|dano recebido|esquiva|invisivel|reflete|devolve|nao pode ser derrubado|nao cai abaixo|ilusao|anula a proxima magia/.test(t);
  const curaTxt = /^cura\b|\bcura \d+% hp|regen|desfaz o dano|revive|remove efeitos negativos/.test(t) && !/cria passagem/.test(t);
  const guarda = () => { const forte = /bloqueia totalmente|imune|nao cai abaixo|anula/.test(t), medio = /def ×2|escudo|invisivel|ilusao|esquiva/.test(t);
    return { tipo: "guarda", protecao: forte ? 0.8 : medio ? 0.6 : 0.45, duracao: forte || /1 turno/.test(t) ? 1 : 2 }; };
  const cura = () => { const p = t.match(/cura (\d+)% hp/);
    return { tipo: "cura", cura: p ? Number(p[1]) / 100 : /mag×/.test(t) ? 0.3 : /revive/.test(t) ? 0.35 : /regen 10%|desfaz o dano/.test(t) ? 0.3 : 0.18, ...(/escudo|regen/.test(t) && { protecao: 0.3, duracao: 2 }) }; };
  if (curaTxt) return cura();
  // dano com número
  const mm = [...t.matchAll(/(mag|for)×(\d,\d)/g)];
  const varios = t.match(/(\d) (projeteis|golpes|raios)/);
  const invoca = /invoca|golem pequeno aliado|chamar/.test(t);
  if (!mm.length && protege) return guarda();
  if (mm.length || /\bdano\b|golpe a distancia|\d golpes de|usa os 4 elementos|copia a ultima magia|magia aleatoria|destroi uma invocacao/.test(t) || invoca) {
    x.tipo = mm.length && mm.every((m) => m[1] === "for") ? "fisico" : "magico";
    x.poder = mm.length ? Math.min(2.6, mm.reduce((s, m) => s + num(m[2]), 0)) : /\d golpes de (\d+)%/.test(t) ? Number(t.match(/\d golpes de (\d+)%/)[1]) / 100
      : /dano verdadeiro|4 elementos/.test(t) ? 2.6 : base * (/em area|em linha|em todos/.test(t) ? 0.85 : 1) * (invoca ? 0.8 : 1);
    if (varios) x.golpes = Number(varios[1]);
    if (queima || invoca) x.queima = queima || 3;
    if (prende) x.prende = 1; else if (fraco) x.enfraquece = 2;
    if (x.tipo === "magico") x.tipo = "melhor"; // usa o atributo mais forte de quem lê (Anti-magia e guerreiros também leem grimórios)
    if (ign) x.ignoraDef = ign;
    if (/drena hp/.test(t)) x.rouba = 0.4;
    return x;
  }
  if (protege) return guarda();
  // controle puro
  if (prende) return { tipo: "melhor", poder: 0.6, prende: 1 };
  if (fraco || /nenhuma magia no campo/.test(t)) return { tipo: "guarda", protecao: 0, duracao: 0, enfraqueceAlvo: 3 };
  // impulso ofensivo: vira "próximo golpe +50%"
  if (/\+\d+% (for|mag|vel)|\+\d+ controle|proximo (golpe|ataque)|age 2×|critico garantido|age primeiro|contra-ataca|rouba um buff/.test(t)) return { tipo: "guarda", protecao: 0, duracao: 0, foco: true };
  return null; // utilitária: ilumina, revela, respira sob a água, mensagem, fuga, pistas de história…
}

function magia(g, texto, k) {
  const bruto = texto.match(/^(.+?) \(([^)]*)\) — (.+)$/) ?? [null, texto.split(" — ")[0], "", texto.split(" — ")[1] ?? texto];
  const m = [null, bruto[1], (bruto[2].match(/(\d+) MP/) ?? [0, "0"])[1], bruto[3]];
  const ef = efeito(m[3], g.rank);
  if (!ef) return { id: `${g.id.toLowerCase()}${"abc"[k]}`, nome: m[1], descricao: m[3], utilitaria: true };
  const dano = ["fisico", "magico", "melhor"].includes(ef.tipo);
  const resumo = dano ? [`${ef.tipo === "fisico" ? "golpe" : "magia"} ${ef.golpes ? `${ef.golpes}× ` : ""}de força ${String(Math.round(ef.poder * 10) / 10).replace(".", ",")}`, ef.queima && "dano contínuo", ef.prende && "prende 1 rodada",
    ef.enfraquece && "enfraquece", ef.ignoraDef && `atravessa ${Math.round(ef.ignoraDef * 100)}% da defesa`, ef.rouba && "recupera vida"].filter(Boolean).join(", ")
    : ef.tipo === "cura" ? `cura ${Math.round(ef.cura * 100)}% da vida${ef.protecao ? " e protege" : ""}`
      : [ef.protecao ? `corta ${Math.round(ef.protecao * 100)}% do dano por ${ef.duracao} rodada${ef.duracao > 1 ? "s" : ""}` : null, ef.foco && "próximo golpe +50%", ef.enfraqueceAlvo && "enfraquece o inimigo", ef.prendeAlvo && "prende 1 rodada"].filter(Boolean).join(", ");
  const forca = dano ? ef.poder * (ef.golpes ?? 1) : 0;
  return { id: `${g.id.toLowerCase()}${"abc"[k]}`, nome: m[1], frase: `Você abre *${g.nome}* e as letras se levantam da página.`, descricao: m[3], resumo, grimorio: g.id,
    mp: Number(m[2]), recarga: dano ? (ef.prende || forca >= 2 ? 4 : forca >= 1.5 ? 3 : 2) : ef.tipo === "cura" ? 4 : 3, nivel: 1, ...ef };
}

const regiaoDaSubfase = (onde) => {
  const sf = SUBFASE.get(String(onde).split(" ")[0]);
  return sf ? REGIOES.find((r) => n(r.nome) === n(sf.regiao)) ?? REGIOES.find((r) => n(r.nome).includes(n(sf.regiao)) || n(sf.regiao).includes(n(r.nome))) ?? null : null;
};

/** O 41º: único no mundo, só se ganha no evento do Dragão da Aurora (nunca explorando). */
const SETE_LUZES = { id: "G41", nome: "Grimório das Sete Luzes", rank: "S", elemento: "Luz/Aurora", classes: ["todas"], onde: "evento", unico: true, nivelMinimo: 15, regiaoFixa: "R-WAT-5", lugarFixo: "o ninho do Dragão da Aurora",
  magias: ["Arco das Sete Luzes (30 MP) — 7 raios MAG×0,4", "Véu da Aurora (25 MP) — cura 30% HP + escudo", "Sétima Luz (45 MP) — dano MAG×2,4 que ignora 40% RES"] };
export const GRIMORIOS = new Map([...ler("grimorios.json"), SETE_LUZES].map((g) => {
  const magias = g.magias.map((t, k) => magia(g, t, k));
  const sf = SUBFASE.get(String(g.onde).split(" ")[0]);
  return [g.id, { ...g, nivel: g.nivelMinimo ?? NIVEL_RANK[g.rank] ?? 1, magias, regiao: g.regiaoFixa ?? regiaoDaSubfase(g.onde)?.id ?? null, lugar: g.lugarFixo ?? sf?.nome ?? g.onde }];
}));

/** Quantos grimórios a classe consegue manter abertos ao mesmo tempo. */
export const maxGrimorios = (classe) => CLASSES[classe]?.grimorios_max ?? 1;

/** null se o jogador pode ler este grimório; senão, o motivo. */
export function podeLer(j, g) {
  const cl = CLASSES[j.classe] ?? {};
  if (cl.grimorios_permitidos && !g.unico && !cl.grimorios_permitidos.includes(g.id)) return `${j.classe} só consegue ler grimórios do Vazio. Este se apaga nas suas mãos.`;
  if (!g.classes.includes("todas") && !g.classes.includes(j.classe)) return `As letras não ficam paradas para ${j.classe}. Este grimório foi escrito para: ${g.classes.join(", ")}.`;
  if (j.nivel < g.nivel) return `Você ainda não entende esta escrita. Precisa estar no nível ${g.nivel} (rank ${g.rank}).`;
  return null;
}

/** Magias de batalha dos grimórios equipados (ids dos grimórios). */
export const magiasDeBatalha = (ids) => ids.flatMap((id) => GRIMORIOS.get(id)?.magias.filter((m) => !m.utilitaria) ?? []);
/** Grimórios escondidos numa região. */
export const grimoriosDaRegiao = (rid) => [...GRIMORIOS.values()].filter((g) => g.regiao === rid && !g.unico);
export const acharGrimorio = (texto) => { const t = n(texto).trim(); return GRIMORIOS.get(t.toUpperCase()) ?? GRIMORIOS.get(`G${t.padStart(2, "0")}`) ?? (t.length >= 3 ? [...GRIMORIOS.values()].find((g) => n(g.nome).includes(t)) : null) ?? null; };
