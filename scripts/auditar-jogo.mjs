// Auditoria: o jogo é finalizável? Quanto dura? Roda sem banco, só com os dados do mundo e as regras.
// Uso: node scripts/auditar-jogo.mjs  → imprime o relatório e grava docs/41b-auditoria-numeros.md
import { readFileSync, writeFileSync } from "node:fs";
import { MUNDO, CAPITULO, VILOES, COVIL, validarMundo } from "../src/mundo/mundo.mjs";
import { REGIAO, rota, duracaoViagem, CUSTO_VIGOR } from "../src/regras/exploracao.mjs";
import { XP_PROXIMO, XP_VILAO } from "./balanceamento.mjs";
import { multAlcance, nivelDeLuta } from "../src/regras/combate.mjs";
import { INTERVALO_VIGOR } from "../src/regras/exploracao.mjs";

const E = JSON.parse(readFileSync(new URL("../data/equilibrio.json", import.meta.url)));
const media = (id) => { const v = Object.values(E.tabela[id]); return { vit: v.reduce((s, x) => s + x.vitoria, 0) / v.length / 100, rod: v.reduce((s, x) => s + x.rodadas, 0) / v.length }; };
const POR_TIER = { comum: media("comum"), medio: media("elite"), alto: media("chefe"), rei: media("rei"), divindade: media("divindade-pronto") };
// Vitória medida por simulação quando o jogador está abaixo do nível e o vilão luta 2 níveis acima dele (teto do "alcance")
const ACIMA = { comum: 0.62, medio: 0.24, alto: 0.12, rei: 0.22, divindade: 0.36 };
const xpCapitulo = (nivel) => Math.round(60 * nivel ** 1.2);
const SEG = { rodada: 25, passo: 45, leitura: 60 }; // segundos de jogador por rodada de luta, por passo de história, por capítulo lido
const caps = [...CAPITULO.values()];
const quemDa = (b) => caps.filter((c) => c.da?.bandeira === b || (b === "despertar")).sort((a, b2) => a.nivel - b2.nivel);

// 1) Caminho crítico: do capítulo final para trás, pelas bandeiras exigidas
const final = caps.find((c) => c.final);
const critico = new Map();
const erros = [...validarMundo(new Set(REGIAO.keys()))];
(function subir(c) {
  if (critico.has(c.id)) return;
  critico.set(c.id, c);
  for (const b of c.requer ?? []) {
    if (b === "despertar") continue; // qualquer capítulo dá
    const fontes = quemDa(b).filter((x) => x.da?.bandeira === b);
    if (!fontes.length) { erros.push(`bandeira "${b}" exigida por ${c.id} não é dada por nenhum capítulo`); continue; }
    subir(fontes[0]);
  }
  // capítulos anteriores da mesma região vêm antes (a região entrega um por vez)
  const lista = MUNDO[c.regiao].capitulos;
  for (const ant of lista.slice(0, lista.findIndex((x) => x.id === c.id))) subir(CAPITULO.get(ant.id));
})(final);
// ciclos / ordem possível
const ordem = [], B = new Set(), feitos = new Set();
let andou = true;
while (andou) {
  andou = false;
  for (const c of [...critico.values()].sort((a, b) => a.nivel - b.nivel)) {
    if (feitos.has(c.id)) continue;
    const lista = MUNDO[c.regiao].capitulos, antes = lista.slice(0, lista.findIndex((x) => x.id === c.id));
    if ((c.requer ?? []).every((r) => B.has(r) || r === "despertar" && feitos.size) && antes.every((a) => feitos.has(a.id))) {
      feitos.add(c.id); ordem.push(c); B.add("despertar"); if (c.da?.bandeira) B.add(c.da.bandeira); andou = true;
    }
  }
}
for (const c of critico.values()) if (!feitos.has(c.id)) erros.push(`capítulo do caminho crítico nunca libera: ${c.id} (exige ${c.requer})`);
// regiões alcançáveis
const inicio = ordem[0].regiao;
for (const c of caps) if (!rota(inicio, c.regiao, new Set(["A1-M1", "A2-M1", "A3-M1", "A4-M1"])) && c.regiao !== inicio) erros.push(`região sem rota: ${c.regiao} (${c.id})`);

// 2) Progressão: nível do jogador ao longo de um conjunto de capítulos (só XP de capítulos e dos vilões dos passos)
function percorrer(lista, { extraPorCapitulo = 0 } = {}) {
  let nivel = 1, xp = 0, seg = 0, lutas = 0, viagens = 0, onde = lista[0].regiao, tentativas = 0;
  const ganhar = (q) => { xp += q; while (xp >= XP_PROXIMO(nivel) && nivel < 100) { xp -= XP_PROXIMO(nivel); nivel++; } };
  const linhas = [];
  for (const c of lista) {
    const r = rota(onde, c.regiao, new Set(["A1-M1", "A2-M1", "A3-M1", "A4-M1"])) ?? [onde, c.regiao];
    viagens += r.length - 1; seg += (r.length - 1) * (duracaoViagem() / 1000); onde = c.regiao;
    const antes = nivel;
    let pior = 0;
    for (const p of c.passos) {
      seg += SEG.passo;
      if (p.t !== "derrotar") continue;
      const v = VILOES.get(p.a), t = POR_TIER[v.tier];
      const esperadas = 1 / Math.max(0.05, v.nivel > nivel ? ACIMA[v.tier] : t.vit); // tentativas esperadas
      lutas++; tentativas += esperadas; seg += esperadas * t.rod * SEG.rodada;
      pior = Math.max(pior, nivelDeLuta(v.nivel, nivel) - nivel);
      ganhar(Math.round(XP_VILAO(v.nivel, v.tier) * 1.5 * multAlcance(nivel, v.nivel)));
    }
    ganhar(Math.round(xpCapitulo(c.nivel) * multAlcance(nivel, c.nivel))); seg += SEG.leitura;
    if (extraPorCapitulo) ganhar(Math.round(XP_PROXIMO(nivel) * extraPorCapitulo));
    linhas.push({ id: c.id, titulo: c.titulo, nivelCap: c.nivel, chegou: antes, saiu: nivel, deficit: pior });
  }
  // Calendário: cada trecho de viagem custa vigor; depois dos 100 iniciais, o vigor volta 10 por hora (ração de viagem: +30)
  const vigor = viagens * CUSTO_VIGOR.viajar, horasVigor = Math.max(0, vigor - 100) * (INTERVALO_VIGOR / 3_600_000);
  return { nivel, horas: seg / 3600, lutas, viagens, tentativas, linhas, vigor, diasVigor: horasVigor / 24, racoes: Math.ceil(Math.max(0, vigor - 100) / 30) };
}
const soCritico = percorrer(ordem);
const tudo = percorrer([...caps].sort((a, b) => a.nivel - b.nivel));
// XP de todos os vilões fora dos capítulos (covis opcionais), se alguém limpar o mundo inteiro
const nosCaps = new Set(caps.flatMap((c) => c.passos.filter((p) => p.t === "derrotar").map((p) => p.a)));
const opcionais = [...VILOES.values()].filter((v) => !nosCaps.has(v.id));
const xpOpcional = opcionais.reduce((s, v) => s + Math.round(XP_VILAO(v.nivel, v.tier) * 1.5), 0);
const xpAte = (n) => { let s = 0; for (let k = 1; k < n; k++) s += XP_PROXIMO(k); return s; };
const nivelCom = (total) => { let n = 1; while (n < 100 && total >= XP_PROXIMO(n)) { total -= XP_PROXIMO(n); n++; } return n; };
const xpTudo = caps.reduce((s, c) => s + xpCapitulo(c.nivel), 0) + [...nosCaps].reduce((s, id) => s + Math.round(XP_VILAO(VILOES.get(id).nivel, VILOES.get(id).tier) * 1.5), 0);

const maiores = (r) => r.linhas.filter((l) => l.deficit > 2).sort((a, b) => b.deficit - a.deficit).slice(0, 8);
const fmt = (r) => `nível final ${r.nivel} · ${r.lutas} lutas de história (${r.tentativas.toFixed(0)} tentativas esperadas) · ${r.viagens} viagens · ${r.horas.toFixed(1)} h de jogo ativo · vigor de viagem: ${r.vigor} (${r.diasVigor.toFixed(1)} dias só esperando o vigor voltar, ou ${r.racoes} rações)`;
const md = `# 41b — Números da auditoria (gerado por \`scripts/auditar-jogo.mjs\`)

> Não edite à mão. Tempos: ${SEG.rodada}s por rodada de luta, ${SEG.passo}s por passo de história, ${duracaoViagem() / 60000} min por trecho de viagem.

## Estrutura
- Capítulos: ${caps.length} · no caminho crítico até o final: **${ordem.length}** · vilões: ${VILOES.size} (${nosCaps.size} dentro de capítulos, ${opcionais.length} opcionais)
- Erros de estrutura (travas): **${erros.length}**${erros.length ? "\n" + erros.map((e) => `  - ${e}`).join("\n") : ""}

## Progressão sem moer (só XP de capítulos e dos vilões dos capítulos)
- Só o caminho crítico: ${fmt(soCritico)}
- Todos os ${caps.length} capítulos: ${fmt(tudo)}
- XP total da história: ${xpTudo.toLocaleString("pt-BR")} → nível ${nivelCom(xpTudo)} · com os ${opcionais.length} vilões opcionais: nível ${nivelCom(xpTudo + xpOpcional)} · para o nível 98 são precisos ${xpAte(98).toLocaleString("pt-BR")}

## Onde o jogador enfrenta vilão acima do próprio nível (no caminho crítico, sem nada além dele)
| Capítulo | Nível do capítulo | Jogador chega no | Sai no | Luta acima em |
|---|:---:|:---:|:---:|:---:|
${soCritico.linhas.map((l) => `| ${l.titulo} | ${l.nivelCap} | ${l.chegou} | ${l.saiu} | ${l.deficit > 0 ? `+${l.deficit}` : "—"} |`).join("\n")}

## O mesmo, fazendo todos os capítulos em ordem de nível (só os piores)
| Capítulo | Nível do capítulo | Jogador chega no | Vilão acima em |
|---|:---:|:---:|:---:|
${maiores(tudo).map((l) => `| ${l.titulo} | ${l.nivelCap} | ${l.chegou} | +${l.deficit} |`).join("\n") || "| — | | | |"}

## Caminho crítico, na ordem
${ordem.map((c, i) => `${i + 1}. ${c.titulo} (${REGIAO.get(c.regiao)?.nome}, nível ${c.nivel})`).join("\n")}
`;
writeFileSync(new URL("../docs/41b-auditoria-numeros.md", import.meta.url), md);
console.log(md);
export { erros, ordem };
