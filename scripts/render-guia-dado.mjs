// Infográfico "Como funciona o dado" → data/guia/dado.png (enviado no jogo pelo comando "dado") e docs/img/guia-dado.png.
// Usa os números reais de data/equilibrio.json (rode antes: node scripts/simular-combate.mjs).
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { FAIXAS, PRESSAO, PASSIVAS } from "../src/regras/combate.mjs";

const E = JSON.parse(readFileSync(new URL("../data/equilibrio.json", import.meta.url)));
const COR = { falha: "#c0392b", fraco: "#d98a2b", normal: "#5b7fa6", forte: "#3f9a5a", critico: "#e6b422" };
const faixaDe = (n) => (n === 1 ? "falha" : n === 20 ? "critico" : n <= 6 ? "fraco" : n <= 14 ? "normal" : "forte");
const linhas = [
  ["falha", "1", "Falha", "o golpe erra", "bloqueia só 20%"],
  ["fraco", "2 a 6", "De raspão", "70% do dano", "bloqueia 35%"],
  ["normal", "7 a 14", "Acerto firme", "dano normal", "bloqueia 50%"],
  ["forte", "15 a 19", "Acerto forte", "130% do dano", "bloqueia 70%"],
  ["critico", "20", "Golpe perfeito", "180% do dano", "bloqueia tudo"],
];
const d0 = E.dado[0];
const resumo = E.casos.map((c) => { const v = Object.values(E.tabela[c.id]).map((x) => x.vitoria); return { rotulo: c.rotulo, min: Math.min(...v), max: Math.max(...v), media: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }; });

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box} body{margin:0;background:#0d0b14;color:#ece6f4;font:22px/1.35 "DejaVu Sans",system-ui,sans-serif;width:1080px}
.w{padding:44px 48px 40px} h1{margin:0;font-size:50px;letter-spacing:1px;color:#ffe9a8} .sub{color:#b9aecf;margin:6px 0 26px;font-size:24px}
.dados{display:grid;grid-template-columns:repeat(20,1fr);gap:5px;margin-bottom:8px}
.d{height:56px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:23px;color:#0d0b14}
.leg{display:flex;justify-content:space-between;color:#8f86a6;font-size:17px;margin-bottom:26px}
table{width:100%;border-collapse:separate;border-spacing:0 8px} td{padding:13px 16px;background:#191527} td:first-child{border-radius:12px 0 0 12px;width:150px;text-align:center;font-weight:700;color:#0d0b14;font-size:24px}
td:last-child{border-radius:0 12px 12px 0} th{font-size:16px;color:#8f86a6;text-align:left;padding:0 16px;font-weight:400;text-transform:uppercase;letter-spacing:1px}
.nome{font-weight:700;font-size:25px} .pct{color:#8f86a6;font-size:19px}
h2{font-size:27px;color:#ffe9a8;margin:30px 0 12px} .cx{display:grid;grid-template-columns:1fr 1fr;gap:12px} .c{background:#191527;border-radius:12px;padding:15px 18px;font-size:20px} .c b{color:#ffe9a8}
.bar{display:grid;grid-template-columns:330px 1fr 150px;gap:12px;align-items:center;margin:7px 0;font-size:19px} .tr{height:20px;background:#191527;border-radius:10px;position:relative;overflow:hidden}
.f{position:absolute;top:0;bottom:0;border-radius:10px} .m{position:absolute;top:-3px;bottom:-3px;width:5px;background:#fff;border-radius:3px} .n{color:#b9aecf;text-align:right;font-size:18px}
.rod{margin-top:22px;color:#8f86a6;font-size:17px}
</style><div class="w">
<h1>O DADO DE 20 LADOS</h1><div class="sub">Em toda ação de luta você rola um dado. O número que sai decide a força.</div>
<div class="dados">${Array.from({ length: 20 }, (_, i) => `<div class="d" style="background:${COR[faixaDe(i + 1)]}">${i + 1}</div>`).join("")}</div>
<div class="leg"><span>pior</span><span>cada número tem a mesma chance: 5%</span><span>melhor</span></div>
<table><tr><th>saiu</th><th>resultado</th><th>ao atacar</th><th>ao defender</th></tr>
${linhas.map(([k, faces, nome, atk, def]) => `<tr><td style="background:${COR[k]}">${faces}</td><td><span class="nome">${nome}</span> <span class="pct">· ${d0[k]}% das vezes</span></td><td>${atk}</td><td>${def}</td></tr>`).join("")}</table>
<h2>O que muda o seu dado</h2><div class="cx">
<div class="c"><b>Sorte (SOR)</b><br>A cada 12 pontos de Sorte, +1 no dado (até +3). Com +3, "de raspão" cai de 25% para 10% das vezes.</div>
<div class="c"><b>Habilidades</b><br>Algumas somam no dado (Iaijutsu: +3). Curas e proteções nunca falham de todo.</div>
<div class="c"><b>1 e 20 são sagrados</b><br>O 1 sempre falha e o 20 sempre é perfeito, com qualquer bônus ou pressão.</div>
<div class="c"><b>O inimigo também rola</b><br>Você vê o dado dele. Com 1 ele erra; com 20 acerta em cheio (160%). Defender no golpe forte salva vidas.</div></div>
<h2>Pressão: quanto mais forte o inimigo, mais difícil o dado</h2>
<table><tr><th>inimigo</th><th>o seu dado falha em</th><th>e perde</th><th>na prática</th></tr>
<tr><td style="background:${COR.normal}">Lacaio e comum</td><td>1</td><td>nada</td><td>5% de erro</td></tr>
${Object.values(PRESSAO).map((p, k) => `<tr><td style="background:${[COR.forte, COR.critico, COR.fraco, COR.falha][k]}">${p.nome[0].toUpperCase()}${p.nome.slice(1)}</td><td>${p.falhaAte > 1 ? `1 a ${p.falhaAte}` : "1"}</td><td>${-p.dado} no número</td><td>${p.falhaAte * 5}% de erro, mais golpes de raspão</td></tr>`).join("")}
</table>
<div class="cx" style="margin-top:8px"><div class="c"><b>Chefes não cansam</b><br>Depois da 8ª rodada batem 8% mais forte por rodada. Reis e divindades mudam de fase na metade da vida.</div>
<div class="c"><b>Sua classe ajuda</b><br>Cada classe tem uma passiva sempre ativa (${Object.keys(PASSIVAS).length} ao todo). Veja a sua em <b>habilidades</b>.</div></div>
<h2>O jogo está equilibrado? <span style="font-size:18px;color:#8f86a6">(${E.lutasPorCaso} lutas simuladas por classe)</span></h2>
${resumo.map((r) => `<div class="bar"><div>${r.rotulo}</div><div class="tr"><div class="f" style="left:${r.min}%;width:${Math.max(1.5, r.max - r.min)}%;background:${r.media >= 85 ? COR.forte : r.media >= 55 ? COR.critico : r.media >= 30 ? COR.fraco : COR.falha}"></div><div class="m" style="left:calc(${r.media}% - 2px)"></div></div><div class="n">${r.min === r.max ? `${r.max}%` : `${r.min}–${r.max}%`}</div></div>`).join("")}
<div class="rod">Barra: da classe que menos vence à que mais vence · traço branco: média · no nível indicado, com o equipamento do nível e 3 poções.<br>Dano médio do dado: ${Math.round(d0.media * 100)}% (sem bônus) → ${Math.round(E.dado[3].media * 100)}% (com +3). O dado dá emoção sem mudar a força média.</div>
</div>`;
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 800 }, deviceScaleFactor: 1 });
await p.setContent(html);
const saida = new URL("../data/guia/dado.png", import.meta.url).pathname;
await p.screenshot({ path: saida, fullPage: true });
await b.close();
mkdirSync(new URL("../docs/img/", import.meta.url), { recursive: true });
copyFileSync(saida, new URL("../docs/img/guia-dado.png", import.meta.url).pathname);
console.log("data/guia/dado.png e docs/img/guia-dado.png", Object.keys(FAIXAS).length, "faixas");
