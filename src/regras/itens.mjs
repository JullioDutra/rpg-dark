// Catálogo de itens: consumíveis, equipamentos por classe (8 níveis de material), acessórios e materiais.
// Gerado por tabela para manter o balanceamento coerente com o doc 22b (arma ≈ nível × 1,1; armadura ≈ nível × 0,7).
import { readFileSync } from "node:fs";

const LENDARIOS = JSON.parse(readFileSync(new URL("../../data/itens-lendarios.json", import.meta.url), "utf8"));

export const CONSUMIVEIS = {
  pocao: { nome: "Poção de cura", efeito: "recupera 35% da vida", luta: true, fora: true, preco: 30, cura: 0.35 },
  "pocao-mana": { nome: "Poção de mana", efeito: "recupera 40% da mana", luta: true, fora: true, preco: 35, mana: 0.4 },
  elixir: { nome: "Elixir estelar", efeito: "recupera 60% da vida e 60% da mana", luta: true, fora: true, preco: 250, cura: 0.6, mana: 0.6 },
  "bomba-fumaca": { nome: "Bomba de fumaça", efeito: "fuga garantida de uma luta (não funciona contra chefes)", luta: true, fora: false, preco: 60, fuga: true },
  racao: { nome: "Ração de viagem", efeito: "recupera 30 de vigor", luta: false, fora: true, preco: 40, vigor: 30 },
  bandagem: { nome: "Bandagem de ervas", efeito: "cura uma ferida na hora", luta: false, fora: true, preco: 80, curaFerida: true },
  "pergaminho-retorno": { nome: "Pergaminho de retorno", efeito: "leva você na hora para a capital do reino onde está", luta: false, fora: true, preco: 120, retorno: true },
};

export const MATERIAIS_INFO = {
  "mat-obsidiana": { nome: "Fragmento de obsidiana", valor: 15 }, "mat-perola": { nome: "Pérola bruta", valor: 15 },
  "mat-cristal": { nome: "Fragmento de cristal", valor: 15 }, "mat-pluma": { nome: "Pluma do vento", valor: 15 }, "mat-pedra": { nome: "Pedra antiga", valor: 15 },
};

export const NIVEIS_MATERIAL = [
  { n: 1, sufixo: "de aprendiz" }, { n: 5, sufixo: "de ferro" }, { n: 10, sufixo: "de aço" }, { n: 20, sufixo: "de obsidiana" },
  { n: 30, sufixo: "de mithril" }, { n: 45, sufixo: "de cristal-estelar" }, { n: 60, sufixo: "de osso de dragão" }, { n: 80, sufixo: "celeste" },
];
const ARMAS = {
  espada: { nome: "Espada", fisica: true }, katana: { nome: "Katana", fisica: true }, maca: { nome: "Maça", fisica: true },
  adaga: { nome: "Adaga", fisica: true }, manopla: { nome: "Manopla", fisica: true }, garras: { nome: "Garras", fisica: true },
  foice: { nome: "Foice", fisica: true }, cajado: { nome: "Cajado", fisica: false }, bastao: { nome: "Bastão vivo", fisica: false },
};
const ARMADURAS = { pesada: "Armadura", leve: "Couraça leve", manto: "Manto" };

/** O que cada classe pode usar (doc 05). */
export const EQUIP_CLASSE = {
  Mago: { armas: ["cajado"], armaduras: ["manto"] },
  Cavaleiro: { armas: ["espada", "maca"], armaduras: ["pesada"] },
  Bruxo: { armas: ["cajado", "adaga"], armaduras: ["manto"] },
  "Anti-magia": { armas: ["manopla", "espada"], armaduras: ["leve"] },
  Espadachim: { armas: ["katana"], armaduras: ["leve"] },
  "Meio-humano": { armas: ["garras", "adaga"], armaduras: ["leve"] },
  "Força da Natureza": { armas: ["bastao"], armaduras: ["manto", "leve"] },
  "Demônio": { armas: ["foice", "garras"], armaduras: ["leve"] },
  Paladino: { armas: ["maca", "espada"], armaduras: ["pesada"] },
};

const preco = (n) => Math.max(25, Math.round((25 * n ** 1.25) / 5) * 5);
const CATALOGO = new Map();
for (const [id, c] of Object.entries(CONSUMIVEIS)) CATALOGO.set(id, { id, tipo: "consumivel", ...c });
CATALOGO.set("pergaminho-terra", { id: "pergaminho-terra", tipo: "historia", nome: "Pergaminho dos Olhos da Terra",
  efeito: "ensina a ver pelo chão: você fica cego para sempre e ganha Onda Sísmica, Ler o Chão e +2 no dado ao defender (só para quem é da terra)", preco: 0, lendario: true });
for (const [id, m] of Object.entries(MATERIAIS_INFO)) CATALOGO.set(id, { id, tipo: "material", nome: m.nome, efeito: "material: pode ser vendido numa loja", preco: m.valor });
NIVEIS_MATERIAL.forEach((t, i) => {
  const b = Math.round(t.n * 1.1) + 1, a = Math.round(t.n * 0.7) + 1;
  for (const [k, w] of Object.entries(ARMAS)) {
    const bonus = w.fisica ? { FOR: b, MAG: Math.round(b / 2) } : { MAG: b, FOR: Math.round(b / 2) };
    CATALOGO.set(`arma-${k}-${i + 1}`, { id: `arma-${k}-${i + 1}`, tipo: "equipamento", slot: "arma", subtipo: k, nivel: t.n, nome: `${w.nome} ${t.sufixo}`, bonus, preco: preco(t.n) });
  }
  for (const [k, nome] of Object.entries(ARMADURAS)) {
    const bonus = k === "pesada" ? { DEF: a, RES: Math.round(a * 0.6) } : k === "manto" ? { RES: a, DEF: Math.round(a * 0.6) }
      : { DEF: Math.round(a * 0.8), RES: Math.round(a * 0.8), VEL: i + 1 };
    CATALOGO.set(`arm-${k}-${i + 1}`, { id: `arm-${k}-${i + 1}`, tipo: "equipamento", slot: "armadura", subtipo: k, nivel: t.n, nome: `${nome} ${t.sufixo}`, bonus, preco: preco(t.n) });
  }
});
for (const [id, nome, nivel, bonus] of [
  ["ace-sorte", "Amuleto da sorte", 5, { SOR: 4 }], ["ace-vento", "Botas do vento", 10, { VEL: 5 }],
  ["ace-urso", "Cinto do urso", 15, { FOR: 4, DEF: 4 }], ["ace-sabio", "Anel do sábio", 15, { MAG: 4, RES: 4 }],
  ["ace-estrela", "Pingente de estrela", 40, { FOR: 8, MAG: 8, SOR: 5 }],
]) CATALOGO.set(id, { id, tipo: "equipamento", slot: "acessorio", nivel, nome, bonus, preco: preco(nivel) * 2 });
// Os 4 Grandes Itens: só se conquistam (masmorras lendárias). Bônus forte, não vendíveis.
for (const [id, nome, bonus, classes] of [
  ["excalibur", "Excalibur, a Espada que Caiu das Estrelas", { FOR: 115, MAG: 65, SOR: 8 }, null],
  ["kokugai", "Kokūgai, a Égide do Quinto Portador", { DEF: 75, RES: 75 }, null],
  ["tenmon", "Tenmon no Tama, a Joia dos Portões", { VEL: 30, SOR: 12 }, null],
  ["shitencho", "Shitenchō, o Grimório dos Quatro Céus", { MAG: 120, FOR: 60, RES: 20 }, null],
]) CATALOGO.set(id, { id, tipo: "equipamento", slot: id === "kokugai" ? "armadura" : id === "tenmon" ? "acessorio" : "arma", nivel: 60, nome, bonus, lendario: true, classes, preco: 0 });
export const LENDARIOS_DADOS = LENDARIOS;

export const item = (id) => CATALOGO.get(id) ?? null;
export const todosItens = () => [...CATALOGO.values()];

const fmtBonus = (b) => Object.entries(b).map(([k, v]) => `${k} +${v}`).join(" · ");

/** Uma linha explicando o que o item faz. */
export function efeitoItem(it) {
  if (!it) return "";
  if (it.tipo === "equipamento") return `${fmtBonus(it.bonus)}${it.nivel > 1 ? ` · exige nível ${it.nivel}` : ""}`;
  return it.efeito;
}

export function podeEquipar(j, it) {
  if (!it || it.tipo !== "equipamento") return "Isso não se equipa.";
  if (j.nivel < it.nivel) return `Você precisa estar no nível ${it.nivel} para usar ${it.nome}.`;
  if (it.lendario || it.slot === "acessorio") return null;
  const p = EQUIP_CLASSE[j.classe];
  const lista = it.slot === "arma" ? p?.armas : p?.armaduras;
  if (!lista?.includes(it.subtipo)) return `${j.classe} não sabe usar isso. Sua classe usa: ${descricaoEquipClasse(j.classe)}.`;
  return null;
}

export function descricaoEquipClasse(classe) {
  const p = EQUIP_CLASSE[classe];
  if (!p) return "—";
  return `${p.armas.map((a) => ARMAS[a].nome.toLowerCase()).join(" ou ")}; ${p.armaduras.map((a) => ARMADURAS[a].toLowerCase()).join(" ou ")}; qualquer acessório`;
}

/** Soma dos bônus dos itens equipados (linhas de jogo.inventario com equipado = true). */
export function bonusEquip(linhas = []) {
  const b = {};
  for (const l of linhas) if (l.equipado) for (const [k, v] of Object.entries(item(l.item_id)?.bonus ?? {})) b[k] = (b[k] ?? 0) + v;
  return b;
}

/** Kit inicial da classe: arma e armadura de aprendiz. */
export function kitInicial(classe) {
  const p = EQUIP_CLASSE[classe] ?? EQUIP_CLASSE.Espadachim;
  return [`arma-${p.armas[0]}-1`, `arm-${p.armaduras[0]}-1`];
}

/** O que uma loja vende para este jogador. tipo: "completa" (capitais, Kyōkai) ou "simples" (vilas). */
export function estoque(tipo, j) {
  const cons = Object.keys(CONSUMIVEIS).filter((id) => tipo === "completa" || !["elixir", "pergaminho-retorno"].includes(id)).map(item);
  const p = EQUIP_CLASSE[j.classe] ?? { armas: [], armaduras: [] };
  const maxNivel = tipo === "completa" ? j.nivel + 10 : Math.min(10, j.nivel + 5);
  const eq = todosItens().filter((i) => i.tipo === "equipamento" && !i.lendario && i.nivel <= maxNivel && i.nivel >= Math.max(1, j.nivel - 15)
    && (i.slot === "acessorio" ? tipo === "completa" : (i.slot === "arma" ? p.armas : p.armaduras).includes(i.subtipo)))
    .sort((a, b) => a.nivel - b.nivel || a.slot.localeCompare(b.slot));
  return [...cons, ...eq];
}

/**
 * Cada Grande Item, enquanto estiver EQUIPADO, soma uma habilidade ao menu das lutas (além dos atributos).
 * Não substitui nada da classe: é um acréscimo. Guardou o item, a habilidade some.
 */
export const HABILIDADE_ITEM = {
  excalibur: { id: "li-excalibur", nome: "Lâmina das Estrelas", frase: "A espada lembra de onde caiu.", resumo: "golpe de força 2,2 que atravessa 30% da defesa", tipo: "fisico", poder: 2.2, ignoraDef: 0.3, mp: 20, recarga: 4, nivel: 1, origem: "excalibur" },
  kokugai: { id: "li-kokugai", nome: "Égide do Quinto Portador", frase: "A égide se abre como uma asa.", resumo: "corta 80% do dano por 2 rodadas", tipo: "guarda", protecao: 0.8, duracao: 2, mp: 18, recarga: 5, nivel: 1, origem: "kokugai" },
  tenmon: { id: "li-tenmon", nome: "Portão Aberto", frase: "A joia mostra o instante seguinte.", resumo: "esquiva 60% por 1 rodada e o próximo golpe vale +50%", tipo: "guarda", protecao: 0.6, duracao: 1, foco: true, mp: 14, recarga: 4, nivel: 1, origem: "tenmon" },
  shitencho: { id: "li-shitencho", nome: "Quatro Céus", frase: "Quatro páginas viram ao mesmo tempo.", resumo: "quatro golpes de força 0,7, com o seu melhor atributo", tipo: "melhor", poder: 0.7, golpes: 4, mp: 30, recarga: 4, nivel: 1, origem: "shitencho" },
};
/** Habilidades que vêm do que está equipado (linhas de jogo.inventario). */
export const habilidadesDosItens = (linhas = []) => linhas.filter((l) => l.equipado && HABILIDADE_ITEM[l.item_id]).map((l) => HABILIDADE_ITEM[l.item_id]);

export const precoVenda = (it) => (it?.lendario ? 0 : Math.floor((it?.preco ?? 0) * 0.4));
