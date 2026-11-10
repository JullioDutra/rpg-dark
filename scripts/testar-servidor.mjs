// Testa o servidor do bot de ponta a ponta num Postgres temporário (sem WhatsApp, sem IA de verdade):
// migrações automáticas → /ativar-mundo → entrar no mundo → nome → sorteio → classe → aparência → carta.
// Uso: node scripts/testar-servidor.mjs   (precisa do Postgres instalado, como em db/testar-migracoes.sh)
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chownSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { garantirEsquema } from "../src/servidor/db.mjs";
import { criarJogo, escolherOpcao, dados, mesmoNumero } from "../src/servidor/jogo.mjs";
import { lerMensagem, enviarSaidas } from "../src/servidor/evolution.mjs";
import { sortear } from "../src/servidor/sorteio.mjs";
import { testarExploracaoServidor } from "./testar-exploracao.mjs";

const { Pool } = createRequire(import.meta.url)("pg");
let falhas = 0, total = 0;
const ok = (cond, nome) => { total++; if (cond) console.log(`  ✔ ${nome}`); else { falhas++; console.log(`  ✘ ${nome}`); } };

// ── Postgres temporário ──
const PGBIN = process.env.PGBIN ?? execSync("ls -d /usr/lib/postgresql/*/bin | tail -1").toString().trim();
const TMP = mkdtempSync(join(tmpdir(), "rpg-pg-"));
const root = process.getuid?.() === 0;
if (root) execSync(`chown -R postgres ${TMP}`);
const run = (c) => execSync(root ? `su postgres -c "${c}"` : c, { stdio: "pipe" });
run(`${PGBIN}/initdb -D ${TMP}/data -A trust -U postgres`);
run(`${PGBIN}/pg_ctl -D ${TMP}/data -o '-k ${TMP} -p 54330 -c listen_addresses=' -l ${TMP}/log start -w`);
const pool = new Pool({ host: TMP, port: 54330, user: "postgres", database: "postgres" });
const db = {
  query: (t, p) => pool.query(t, p).then((r) => r.rows),
  script: async (fn) => { const c = await pool.connect(); try { return await fn((t, p) => c.query(t, p).then((r) => r.rows)); } finally { c.release(); } },
};

try {
  console.log("Sorteio");
  const D = dados();
  const contagem = {};
  let rng = mulberry(42);
  for (let i = 0; i < 4000; i++) { const s = sortear(D, {}, rng); contagem[s.casta] = (contagem[s.casta] ?? 0) + 1;
    if (s.elemento === "Vazio" && !s.classes.includes("Anti-magia")) { ok(false, "Vazio libera Anti-magia"); break; }
    if (!s.classes.every((c) => D.classes.classes[c])) { ok(false, `classe inexistente ${s.classes}`); break; } }
  ok(Math.abs(contagem.campones / 4000 - 0.32) < 0.03, `camponês ~32% (${(contagem.campones / 40).toFixed(1)}%)`);
  ok(contagem.rei > 0 && contagem.rei / 4000 < 0.04, `rei raro (${(contagem.rei / 40).toFixed(1)}%)`);
  const semRei = sortear(D, { reisPorReino: new Set(["Homura", "Watatsumi", "Daichi", "Fūjin"]) }, () => 0.999);
  ok(semRei.casta !== "rei", "limite de 1 Rei por reino respeitado");
  ok(escolherOpcao("3", ["a", "b", "c"]) === "c" && escolherOpcao("ruivo", ["preto", "ruivo"]) === "ruivo" && escolherOpcao("9", ["a"]) === null, "escolha por número e por nome");

  ok(mesmoNumero("5562993259733", "556293259733") && mesmoNumero("556293259733", "5562993259733") && !mesmoNumero("5562993259733", "5562993259734"), "número BR com e sem o 9");
  console.log("Migrações automáticas");
  const m1 = await garantirEsquema(db);
  ok(m1.aplicadas.includes("0001_esquema_inicial.sql"), "0001 aplicada pelo servidor");
  ok((await db.query("select count(*)::int n from jogo.migracoes"))[0].n >= 1, "registrada em jogo.migracoes");

  console.log("Fluxo do WhatsApp");
  const ADMIN = "5511900000001", JOG = "5511900000002", GRUPO = "120363000000000001@g.us";
  const jogo = criarJogo({ db, sal: "teste", admins: [ADMIN], rng: mulberry(7) });
  let n = 0;
  const ev = (de, texto, { grupo = true, mencoes } = {}) => lerMensagem({ event: "messages.upsert", instance: "rpg-yotsuhoshi", data: {
    key: { id: `M${++n}`, fromMe: false, remoteJid: grupo ? GRUPO : `${de}@s.whatsapp.net`, ...(grupo && { participant: `${de}@s.whatsapp.net` }) },
    pushName: "Teste", messageTimestamp: Math.floor(Date.now() / 1000),
    message: mencoes ? { extendedTextMessage: { text: texto, contextInfo: { mentionedJid: mencoes } } } : { conversation: texto } } });
  const enviar = async (m) => jogo.processar(m);
  const textos = (s) => s.filter((x) => x.texto || x.legenda).map((x) => x.texto ?? x.legenda).join("\n---\n");

  ok((await enviar(ev(JOG, "oi gente"))).length === 0, "grupo sem mundo: bot quieto");
  ok(/Só um administrador/.test(textos(await enviar(ev(JOG, "/ativar-mundo Hack")))), "não-admin não ativa o mundo");
  ok(/YOTSUHOSHI — Teste/.test(textos(await enviar(ev(ADMIN, "Ativar-mundo Teste")))), "admin ativa o mundo (sem barra: o WhatsApp come a /)");
  ok(/YOTSUHOSHI — Teste/.test(textos(await enviar(ev(ADMIN, "/ativar-mundo Teste")))), "admin ativa o mundo (com barra)");
  ok((await enviar(ev(JOG, "kkkk alguém viu o jogo ontem?"))).length === 0, "conversa do grupo ignorada");

  const e1 = await enviar(ev(JOG, "Entrar no mundo"));
  ok(e1.some((s) => s.para === GRUPO && s.mencoes?.length) && e1.some((s) => s.para === `${JOG}@s.whatsapp.net` && /nome/.test(s.texto)), "entrar: aviso no grupo + pergunta do nome no privado");
  const dup = ev(JOG, "entrar no mundo");
  await enviar(dup);
  ok((await enviar(dup)).length === 0, "mensagem repetida pela Evolution é processada uma vez só");

  const P = { grupo: false };
  ok(/não serve/.test(textos(await enviar(ev(JOG, "x", P)))), "nome curto recusado");
  ok(/pertence à história/.test(textos(await enviar(ev(JOG, "Kanata", P)))), "nome reservado recusado");
  const cer = await enviar(ev(JOG, "kaito  ryuen", P));
  ok(/KAITO RYUEN/.test(textos(cer)) && /1ª Estrela/.test(textos(cer)) && /4ª Estrela/.test(textos(cer)) && cer.some((s) => s.espera), "cerimônia com 4 estrelas e suspense");
  ok(/Não entendi/.test(textos(await enviar(ev(JOG, "dragão supremo", P)))), "classe inválida pede de novo");
  const cl = await enviar(ev(JOG, "1", P));
  ok(/Cabelo/.test(textos(cl)), "classe escolhida → aparência");
  for (const r of ["2", "ruivo", "3"]) await enviar(ev(JOG, r, P));
  const prev = await enviar(ev(JOG, "0", P));
  ok(prev[0]?.imagem?.length > 1000 && /Confirmar/.test(prev[0].legenda), "prévia do avatar em PNG");
  const fim = await enviar(ev(JOG, "1", P));
  const carta = fim.find((s) => s.para === GRUPO && s.imagem);
  ok(carta && /despertou como \*Kaito Ryuen\*/.test(carta.legenda), "carta revelada no grupo");
  ok(fim.some((s) => /Prólogo/.test(s.texto ?? "")), "abertura (texto de reserva sem IA)");
  ok(fim.some((s) => /Sua casa/.test(s.texto ?? "") && /Sua região/.test(s.texto) && /Perigo/.test(s.texto)), "texto fácil da aldeia e da região");
  ok(fim.some((s) => /Quem governa/.test(s.texto ?? "")) && fim.some((s) => /O que fazer agora/.test(s.texto ?? "")), "texto do reino e primeiros passos");
  writeFileSync(new URL("../templates/exemplos/carta-whatsapp.png", import.meta.url), carta.imagem);
  const j = (await db.query("select * from jogo.jogadores where nome = 'Kaito Ryuen'"))[0];
  ok(j.estado === "ativo" && j.classe && j.hp_max > 0 && j.avatar_dna?.tipo === "humanoide", "jogador salvo ativo com classe, HP e avatar");
  ok((await db.query("select count(*)::int n from jogo.eventos_atributo where jogador_id = $1", [j.id]))[0].n === 6, "atributos iniciais no livro-razão");
  ok(/já vive neste mundo/.test(textos(await enviar(ev(JOG, "entrar no mundo")))), "não cria 2º personagem");
  ok((await enviar(ev(JOG, "ficha")))[0]?.imagem, "ficha no grupo");
  ok(/^R-[A-Z]{3}-\d$/.test(j.regiao_atual), "região inicial gravada como ID do mapa");
  ok(/Onde você está/.test(textos(await enviar(ev(JOG, "onde estou", P)))), "comando onde estou");
  ok(/Sua casa/.test(textos(await enviar(ev(JOG, "minha aldeia", P)))) && /Quem governa/.test(textos(await enviar(ev(JOG, "reino", P)))), "comandos aldeia e reino");
  ok((await enviar(ev(JOG, "vou para o lago amanhã kkk"))).length === 0, "conversa no grupo não aciona exploração");
  await testarExploracaoServidor({ db, jogador: j, mensagem: (texto) => ev(JOG, texto, P), grupo: (texto) => ev(JOG, texto) });

  const OUTRO = "5511900000003";
  await enviar(ev(OUTRO, "entrar"));
  ok(/Já existe/.test(textos(await enviar(ev(OUTRO, "Kaito Ryuen", P)))), "nome duplicado no mundo recusado");
  ok(/apagado/.test(textos(await enviar(ev(ADMIN, `resetar-jogador @${JOG}`, { mencoes: [`${JOG}@s.whatsapp.net`] })))), "admin reseta jogador");

  const lid = lerMensagem({ event: "messages.upsert", data: { key: { id: "L1", remoteJid: GRUPO, participant: "99887766@lid", participantAlt: `${JOG}@s.whatsapp.net` }, message: { conversation: "oi" } } });
  ok(lid.autor.pn === `${JOG}@s.whatsapp.net` && lid.autor.lid === "99887766@lid", "lê LID e número do participante");
  ok(lerMensagem({ event: "messages.upsert", data: { key: { id: "X", fromMe: true, remoteJid: GRUPO }, message: { conversation: "a" } } }) === null, "ignora mensagens do próprio bot");

  const enviados = [];
  const erros = await enviarSaidas({ texto: async (p, t) => enviados.push(t), imagem: async () => { throw new Error("falhou"); } },
    [{ para: "x", texto: "a" }, { espera: 1 }, { para: "x", imagem: Buffer.from("p") }, { para: "x", texto: "b" }], { dormir: async () => {} });
  ok(enviados.join() === "a,b" && erros.length === 1, "falha num envio não interrompe os outros");
} finally {
  await pool.end();
  run(`${PGBIN}/pg_ctl -D ${TMP}/data stop -m immediate`);
  rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n${total - falhas}/${total} testes passaram`);
process.exit(falhas ? 1 : 0);

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
