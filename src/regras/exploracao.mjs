// Regras puras da primeira etapa. Nenhum texto do jogador ou da IA concede recompensas.
import { readFileSync } from "node:fs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { criarInterpretador } from "../linguagem/interpretar.mjs";

const ler = (nome) => JSON.parse(readFileSync(new URL(`../../data/${nome}.json`, import.meta.url), "utf8"));
export const MUNDO = ler("reinos");
export const REGIOES = MUNDO.reinos.flatMap((r) => r.regioes.map((g) => ({ ...g, reino: r.id })));
export const REGIAO = new Map(REGIOES.map((r) => [r.id, r]));
export const SUBFASES = ler("subfases");
export const ANIMAIS = ler("animais");
const VILOES = ler("viloes");
export const CUSTO_VIGOR = Object.freeze({ explorar: 10, viajar: 15, masmorra: 25 });
export const INTERVALO_VIGOR = 360_000; // 1 ponto a cada 6 minutos = 10 por hora
export const CHANCES_BASE = Object.freeze({ encontro: 40, descoberta: 15, achado: 15, evento: 15, fauna: 10, nada: 5 });
export const MATERIAIS = {
  Homura: { id: "mat-obsidiana", nome: "Fragmento de obsidiana" },
  Watatsumi: { id: "mat-perola", nome: "Pérola bruta" },
  Daichi: { id: "mat-cristal", nome: "Fragmento de cristal" },
  "Fūjin": { id: "mat-pluma", nome: "Pluma do vento" },
  "Kokū": { id: "mat-pedra", nome: "Pedra antiga" },
};
export const normal = (s) => semAcento(String(s).toLowerCase()).trim().replace(/\s+/g, " ");
const interpretar = criarInterpretador({ regioes: REGIOES });

export function comandoExploracao(texto) {
  const t = normal(texto).replace(/^[/!]/, "").replace(/^(bolsa|mochila|minha bolsa)$/, "inventario");
  const m = t.match(/^(explorar|viajar|mapa|rota|vigor|viagem|descobertas|inventario|recuar|enfrentar|ajudar|seguir)(?:\s+(.*))?$/);
  if (m) return { tipo: m[1], alvo: m[2] ?? "" };
  if (/^[12]$/.test(t)) return { tipo: "escolha", alvo: t };
  const i = interpretar(texto);
  if (["explorar", "viajar", "mapa", "rota"].includes(i.intencao))
    return { tipo: i.intencao, alvo: i.entidades.regiao ?? i.entidades.reino ?? "" };
  return null;
}

/** Nomes exatos têm prioridade; um apelido ambíguo nunca escolhe um destino sozinho. */
export function buscarRegioes(alvo) {
  if (!normal(alvo)) return [];
  const exatas = REGIOES.filter((r) => [normal(r.id), normal(r.nome)].includes(normal(alvo)));
  return exatas.length ? exatas : REGIOES.filter((r) => normal(r.nome).includes(normal(alvo)));
}
export function vizinhos(id) {
  return MUNDO.conexoes.flatMap(([a, b]) => a === id ? [b] : b === id ? [a] : []);
}
export function liberada(regiao, marcos = new Set()) {
  return !!regiao && (!regiao.desbloqueio || marcos.has(regiao.desbloqueio));
}
export function rota(origem, destino, marcos = new Set()) {
  if (!REGIAO.has(origem) || !liberada(REGIAO.get(destino), marcos)) return null;
  const fila = [[origem]], visitados = new Set([origem]);
  for (let i = 0; i < fila.length; i++) {
    const caminho = fila[i], atual = caminho.at(-1);
    if (atual === destino) return caminho;
    for (const id of vizinhos(atual)) if (!visitados.has(id) && liberada(REGIAO.get(id), marcos)) {
      visitados.add(id); fila.push([...caminho, id]);
    }
  }
  return null;
}

/** Preserva frações de 6 min; energia acumulada além do teto não fica guardada. */
export function recuperarVigor(j, agora) {
  const desde = new Date(j.vigor_em).getTime();
  const tempo = Math.max(desde, agora);
  const pontos = Math.floor((tempo - desde) / INTERVALO_VIGOR);
  const vigor = Math.min(100, j.vigor + pontos);
  return { vigor, vigor_em: new Date(vigor === 100 ? tempo : desde + pontos * INTERVALO_VIGOR) };
}
export function duracaoViagem(montariaId) {
  // Só um animal de tipo montaria persistido pelo motor reduz o prazo. Domar/comprar vem depois.
  return ANIMAIS.some((a) => a.id === montariaId && a.tipo === "montaria") ? 300_000 : 600_000;
}

/** SOR 10 / perigo médio / Eclipse 0 reproduzem exatamente 40/15/15/15/10/5. */
export function chancesExploracao({ sorte = 10, perigo = "medio", eclipse = 0 } = {}) {
  const risco = { baixo: -5, medio: 0, alto: 10, "muito alto": 15, extremo: 20, divino: 25 }[normal(perigo)] ?? 0;
  const sorteBonus = Math.max(-5, Math.min(10, (sorte - 10) / 5));
  const pressao = Math.max(0, Math.min(100, Number(eclipse))) / 10;
  const pesos = { ...CHANCES_BASE, encontro: 40 + risco + pressao - sorteBonus,
    descoberta: 15 + sorteBonus / 2, achado: 15 + sorteBonus / 2 };
  const total = Object.values(pesos).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(pesos).map(([k, v]) => [k, v * 100 / total]));
}
export function sortearCategoria(chances, rng) {
  let n = rng() * 100;
  for (const [tipo, peso] of Object.entries(chances)) { n -= peso; if (n < 0) return tipo; }
  return "nada";
}
export const escolher = (lista, rng) => lista[Math.floor(rng() * lista.length)];
export function inimigosDaRegiao(regiao) {
  return VILOES.filter((v) => normal(v.regiao) === normal(regiao.nome) && ["comum", "medio"].includes(v.tier));
}
export function faunaDaRegiao(regiao) {
  // Fauna lendária exige gatilhos da história; o filhote do epílogo nunca sai num sorteio comum.
  return ANIMAIS.filter((a) => normal(a.regiao) === normal(regiao.nome) && a.tipo !== "lendario");
}
