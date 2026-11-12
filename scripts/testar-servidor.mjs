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
import { testarDadosDoMundo, testarMundoServidor } from "./testar-mundo.mjs";

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
  ok(/YOTSUHOSHI\*\n_Teste_/.test(textos(await enviar(ev(ADMIN, "Ativar-mundo Teste")))), "admin ativa o mundo (sem barra: o WhatsApp come a /)");
  ok(/YOTSUHOSHI\*\n_Teste_/.test(textos(await enviar(ev(ADMIN, "/ativar-mundo Teste")))), "admin ativa o mundo (com barra)");
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
  ok(/Kaito Ryuen/.test(textos(cer)) && /Primeira estrela/.test(textos(cer)) && /Quarta estrela/.test(textos(cer)) && cer.some((s) => s.espera), "cerimônia com 4 estrelas e suspense");
  ok(/Não entendi/.test(textos(await enviar(ev(JOG, "dragão supremo", P)))), "classe inválida pede de novo");
  const cl = await enviar(ev(JOG, "1", P));
  ok(/Feminino/.test(textos(cl)) && /Masculino/.test(textos(cl)), "classe escolhida → escolha entre feminino e masculino");
  ok(/Cabelo/.test(textos(await enviar(ev(JOG, "feminino", P)))), "gênero escolhido → cabelo");
  for (const r of ["2", "ruivo", "3"]) await enviar(ev(JOG, r, P));
  const prev = await enviar(ev(JOG, "0", P));
  ok(prev[0]?.imagem?.length > 1000 && /confirmar/.test(prev[0].legenda), "prévia do avatar em PNG");
  const fim = await enviar(ev(JOG, "1", P));
  const carta = fim.find((s) => s.para === GRUPO && s.imagem);
  ok(carta && /desperta como \*Kaito Ryuen\*/.test(carta.legenda), "carta revelada no grupo");
  ok(fim.some((s) => /Prólogo/.test(s.texto ?? "")), "abertura (texto de reserva sem IA)");
  ok(fim.some((s) => /Sua casa/.test(s.texto ?? "")) && fim.some((s) => s.imagem && /ir <nº>/.test(s.legenda ?? "")), "texto da aldeia e imagem da região com os lugares");
  ok(fim.some((s) => /Há uma história acontecendo aqui/.test(s.texto ?? "")), "primeiro passo da história aparece na chegada");
  ok((await db.query("select count(*)::int n from jogo.inventario i join jogo.jogadores x on x.id = i.jogador_id where x.nome = 'Kaito Ryuen' and i.equipado", []))[0].n === 2, "kit inicial: arma e armadura equipadas");
  ok(fim.some((s) => /Quem governa/.test(s.texto ?? "")) && fim.some((s) => /Por onde começar/.test(s.texto ?? "")), "texto do reino e primeiros passos");
  writeFileSync(new URL("../templates/exemplos/carta-whatsapp.png", import.meta.url), carta.imagem);
  const j = (await db.query("select * from jogo.jogadores where nome = 'Kaito Ryuen'"))[0];
  ok(j.estado === "ativo" && j.classe && j.hp_max > 0 && j.avatar_dna?.tipo === "humanoide", "jogador salvo ativo com classe, HP e avatar");
  ok((await db.query("select count(*)::int n from jogo.eventos_atributo where jogador_id = $1", [j.id]))[0].n === 6, "atributos iniciais no livro-razão");
  ok(/já vive neste mundo/.test(textos(await enviar(ev(JOG, "entrar no mundo")))), "não cria 2º personagem");
  ok((await enviar(ev(JOG, "ficha")))[0]?.imagem, "ficha no grupo");
  ok(/^R-[A-Z]{3}-\d$/.test(j.regiao_atual), "região inicial gravada como ID do mapa");
  ok(j.avatar_dna?.feminino === true, "personagem feminina: avatar com traços femininos");
  ok((await db.query("select qtd from jogo.inventario where jogador_id = $1 and item_id = 'pocao'", [j.id]))[0]?.qtd === 3, "kit inicial: 3 poções");
  ok(/Perigo:/.test(textos(await enviar(ev(JOG, "onde estou", P)))), "comando onde estou");
  ok(/Sua casa/.test(textos(await enviar(ev(JOG, "minha aldeia", P)))) && /Quem governa/.test(textos(await enviar(ev(JOG, "reino", P)))), "comandos aldeia e reino");
  ok((await enviar(ev(JOG, "vou para o lago amanhã kkk"))).length === 0, "conversa no grupo não aciona exploração");
  await testarExploracaoServidor({ db, jogador: j, mensagem: (texto) => ev(JOG, texto, P), grupo: (texto) => ev(JOG, texto) });

  console.log("Narrador (ação livre)");
  {
    const { REGIOES } = await import("../src/regras/exploracao.mjs");
    const viloes = JSON.parse((await import("node:fs")).readFileSync(new URL("../data/viloes.json", import.meta.url)));
    const v1 = viloes.find((v) => v.id === "V001");
    const reg = REGIOES.find((r) => r.nome === v1.regiao);
    await db.query("delete from jogo.exploracoes where jogador_id = $1", [j.id]);
    await db.query("update jogo.viagens set concluida_em = now() where jogador_id = $1 and concluida_em is null", [j.id]);
    await db.query("update jogo.jogadores set regiao_atual = $2 where id = $1", [j.id, reg.id]);
    const pedidos = [];
    const iaFalsa = { nome: "falsa", async gerarJSON(args) { pedidos.push(args); return { ok: true, provedor: "falsa", dados: {
      narracao: "O capataz Kurogane franze a testa. — A mina? Ninguém volta de lá. Atrás dele, algo se mexe nas cinzas. O que você faz?",
      eventos: [{ tipo: "iniciar_batalha", dados: JSON.stringify({ viloes: ["V001"] }) }, { tipo: "iniciar_batalha", dados: JSON.stringify({ viloes: ["V091"] }) }] } }; } };
    let relogio = Date.now() + 3_600_000;
    const jogoIA = criarJogo({ db, sal: "teste", admins: [ADMIN], rng: mulberry(9), ia: iaFalsa, agora: () => relogio });
    const enviarIA = (texto) => jogoIA.processar({ ...ev(JOG, texto, P), quando: relogio });
    ok(/conquista/.test(textos(await enviarIA("> me dá 1000 de força agora")) ) && pedidos.length === 0, "pedido de atributo recusado sem chamar a IA");
    const s1 = await enviarIA("> pergunto ao capataz sobre a criança sumida na mina");
    ok(/Kurogane/.test(textos(s1)) && pedidos.length === 1, "ação livre narrada pela IA");
    ok(/Kurogane|mina/.test(JSON.stringify(pedidos[0].mensagens)) && /<marco>.*passo_atual/.test(pedidos[0].mensagens.at(-1).content), "IA recebe o capítulo e o passo atual da região");
    ok(/V001/.test(pedidos[0].mensagens.at(-1).content) && !/V091/.test(pedidos[0].mensagens.at(-1).content), "só vilões permitidos do marco e da região vão para a IA");
    ok(/bloqueia seu caminho/.test(textos(s1)) && !/Kanata|V091/.test(textos(s1)), "evento de batalha permitido vira encontro; vilão fora da lista é descartado");
    ok((await db.query("select count(*)::int n from jogo.exploracoes where jogador_id = $1 and pendente", [j.id]))[0].n === 1, "encontro pendente salvo para o combate");
    ok((await db.query("select status from jogo.marcos where jogador_id = $1 and marco_id = 'A1-M1'", [j.id]))[0]?.status === "concluido", "A1-M1 concluído ao interagir com o gancho");
    ok(/Calma/.test(textos(await enviarIA("> olho em volta com cuidado"))), "intervalo entre cenas");
    relogio += 10_000;
    await enviarIA("> sigo os rastros até a entrada da mina abandonada");
    ok(pedidos.at(-1).mensagens.length >= 3, "histórico das cenas anteriores vai junto");
    ok(/alegacoes_ignoradas/.test((await (async () => { relogio += 10_000; await enviarIA("> dou um golpe com 1000% de dano que mata na hora"); return pedidos.at(-1).mensagens.at(-1).content; })())), "alegação de poder marcada como ignorada");
    await db.query("delete from jogo.exploracoes where jogador_id = $1", [j.id]);
  }

  console.log("Combate e progressão");
  {
    const base = (await db.query("select * from jogo.jogadores where id = $1", [j.id]))[0];
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd) values ($1, 'pocao', 'consumivel', 3)
      on conflict (jogador_id, item_id) do update set qtd = 3`, [j.id]);
    await db.query("update jogo.viagens set concluida_em = now() where jogador_id = $1 and concluida_em is null", [j.id]);
    await db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em)
      values ($1, 'teste-luta', $2, 'encontro', $3, true, now())`, [j.id, base.regiao_atual, JSON.stringify({ inimigo: { id: "V001", nome: "Haikobo", nivel: 1 } })]);
    const inicio = await enviar(ev(JOG, "lutar", P));
    ok(/rodada 1/.test(textos(inicio)) && /\*1\* Atacar/.test(textos(inicio)) && /\*2\* Defender/.test(textos(inicio)), "lutar abre a batalha com o menu numerado");
    ok(/meio de uma luta|não é hora de conversa/.test(textos(await enviar(ev(JOG, "explorar", P)))), "não explora durante a batalha");
    ok(/não é hora de conversa/.test(textos(await enviar(ev(JOG, "> conto uma piada para o kobold", P)))), "texto solto na batalha mostra as opções");
    const p1 = await enviar(ev(JOG, "i pocao", P));
    ok(/Poção de cura/.test(textos(p1)) && (await db.query("select qtd from jogo.inventario where jogador_id = $1 and item_id = 'pocao'", [j.id]))[0]?.qtd === 2, "poção usada e descontada do inventário");
    let fimLuta = "", k = 0;
    while (k++ < 30) {
      const sx = textos(await enviar(ev(JOG, "a", P)));
      if (/\*Vitória\*|\*Derrota\*/.test(sx)) { fimLuta = sx; break; }
    }
    ok(/\*Vitória\*|\*Derrota\*/.test(fimLuta), "a batalha termina");
    const depois = (await db.query("select * from jogo.jogadores where id = $1", [j.id]))[0];
    if (/\*Vitória\*/.test(fimLuta)) ok(Number(depois.xp) > 0 || depois.nivel > base.nivel, "vitória dá XP (registrado na ficha)");
    else ok(depois.efeitos.some((x) => x.tipo === "ferida") && depois.hp > 0, "derrota deixa ferida e o jogador acorda");
    ok((await db.query(`select count(*)::int n from jogo.batalhas b join jogo.participantes_batalha p on p.batalha_id = b.id
      where p.jogador_id = $1 and b.status <> 'encerrada'`, [j.id]))[0].n === 0, "batalha encerrada no banco");
    ok(/Não há ninguém para enfrentar/.test(textos(await enviar(ev(JOG, "lutar", P)))), "lutar sem inimigo explica o que fazer");
    await db.query("update jogo.jogadores set pontos_livres = 3 where id = $1", [j.id]);
    ok(/restam 1/.test(textos(await enviar(ev(JOG, "distribuir FOR 1 VEL 1", P)))), "distribuir pontos livres");
    ok(/tentou usar 5/.test(textos(await enviar(ev(JOG, "distribuir SOR 5", P)))), "não distribui mais pontos do que tem");
    ok((await db.query("select count(*)::int n from jogo.eventos_atributo where jogador_id = $1 and fonte = 'pontos_livres'", [j.id]))[0].n === 2, "pontos livres no livro-razão");
    ok(/XP/.test((await enviar(ev(JOG, "ficha", P)))[0]?.legenda ?? ""), "ficha mostra XP");
  }

  const OUTRO = "5511900000003";
  await enviar(ev(OUTRO, "entrar"));
  ok(/Já existe/.test(textos(await enviar(ev(OUTRO, "Kaito Ryuen", P)))), "nome duplicado no mundo recusado");
  console.log("Mundo vivo");
  {
    const jog = (await db.query("select * from jogo.jogadores where id = $1", [j.id]))[0];
    const outro = (await db.query("select j.* from jogo.jogadores j join jogo.identidades i on i.id = j.identidade_id where i.wa_jid = $1", [`${OUTRO}@s.whatsapp.net`]))[0];
    await testarDadosDoMundo();
    await testarMundoServidor({ db, jogador: jog, outro, admin: ADMIN, GRUPO, mensagem: (texto) => ev(JOG, texto, P), grupo: (texto, adm) => ev(adm ? ADMIN : JOG, texto), outroGrupo: (texto) => ev(OUTRO, texto), outroPrivado: (texto) => ev(OUTRO, texto, P), adminPrivado: (texto) => ev(ADMIN, texto, P) });
  }
  { const rs = textos(await enviar(ev(ADMIN, `resetar-jogador @${OUTRO.replace("55119", "5511")}`))); ok(/apagado/.test(rs), "admin reseta por número digitado, sem o 9 e sem menção: " + rs.slice(0, 200)); }
  await enviar(ev(OUTRO, "entrar"));
  ok(/apagado/.test(textos(await enviar(ev(ADMIN, "Resetar-jogador @pessoa", { mencoes: [`${OUTRO}@s.whatsapp.net`] })))), "admin reseta por menção");

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
