// Testes do mundo vivo: consistência dos dados (36 regiões, 100 vilões em covis, capítulos) e o fluxo no servidor
// (chegada com imagens, locais, NPCs, capítulos, derrota única/eco, feitos no grupo, itens, vingança, reset, final).
// A parte de servidor roda dentro de scripts/testar-servidor.mjs (usa o mesmo Postgres temporário).
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { MUNDO, VILOES, COVIL, CAPITULO, NPC, validarMundo } from "../src/mundo/mundo.mjs";
import { REGIAO } from "../src/regras/exploracao.mjs";
import { TIPOS_CENA, renderCena } from "../src/cena/cena.mjs";
import { objetivoCampanha } from "../src/servidor/mundo.mjs";
import { criarJogo } from "../src/servidor/jogo.mjs";

let total = 0;
const t = async (nome, fn) => { await fn(); total++; console.log(`  ✔ mundo: ${nome}`); };

export async function testarDadosDoMundo() {
  await t("36 regiões, 100 vilões em covis únicos, referências válidas", async () => {
    assert.deepEqual(validarMundo(new Set(REGIAO.keys())), []);
    assert.equal(Object.keys(MUNDO).length, 36); assert.equal(COVIL.size, 100); assert.equal(VILOES.size, 100);
    assert(NPC.size >= 45 && CAPITULO.size >= 50);
  });
  await t("toda região tem imagem de cena; a mesma semente dá a mesma imagem", async () => {
    for (const [rid, r] of Object.entries(MUNDO)) for (const l of r.locais) assert(TIPOS_CENA.includes(l.cena), `${rid}/${l.id}: cena ${l.cena}`);
    const a = renderCena("vila", "Homura", "x"), b = renderCena("vila", "Homura", "x"), c = renderCena("vila", "Homura", "y");
    assert(a.length > 2000 && a.equals(b) && !a.equals(c));
    assert.equal(a.subarray(1, 4).toString(), "PNG");
  });
  await t("a campanha tem um caminho completo até o final", async () => {
    // Simula as bandeiras: a cada passo, deve existir um capítulo liberado que entrega a próxima
    const B = new Set(), ordem = ["despertar", "selo", "festival", "arco-homura", "arco-watatsumi", "arco-daichi", "arco-fujin", "rosto", "muralha", "poco", "ninho", "kanata", "descida", "reis-antigos", "eclipse-vencido"];
    for (const alvo of ordem) {
      const caps = [...CAPITULO.values()].filter((c) => (alvo === "despertar" ? c.principal : c.da?.bandeira === alvo));
      assert(caps.length, `nenhum capítulo entrega ${alvo}`);
      assert(caps.some((c) => (c.requer ?? []).every((r) => B.has(r))), `capítulo de ${alvo} exige algo ainda não conquistado`);
      const antes = objetivoCampanha(B); B.add(alvo);
      assert.notEqual(objetivoCampanha(B), alvo === "arco-homura" || alvo === "arco-watatsumi" || alvo === "arco-daichi" ? "" : antes);
    }
    assert.match(objetivoCampanha(B), /fim da história/);
    assert([...CAPITULO.values()].filter((c) => c.final).length === 1);
  });
  await t("todo capítulo tem passos, pista e nível; chefes finais existem", async () => {
    for (const c of CAPITULO.values()) { assert(c.passos.length >= 1 && c.nivel >= 1, c.id); if (!c.final) assert(c.fim.length > 20 && c.pista.length > 20, c.id); }
    assert.equal(COVIL.get("V100").regiao, "R-KOK-6"); assert.equal(COVIL.get("V091").regiao, "R-KOK-1");
  });
}

export async function testarMundoServidor({ db, jogador, outro, mensagem, grupo, outroGrupo, outroPrivado, adminPrivado, admin, GRUPO }) {
  let clock = Date.now() + 7 * 86_400_000, dados = [];
  const rng = () => (dados.length ? dados.shift() : 0.5);
  const novoJogo = (ia = null) => criarJogo({ db, sal: "teste", admins: [admin], rng, agora: () => clock, ia });
  let jogo = novoJogo();
  const enviar = (txt) => { clock += 5000; return jogo.processar({ ...mensagem(txt), quando: clock }); };
  const noGrupo = (m) => { clock += 5000; return jogo.processar({ ...m, quando: clock }); };
  const texto = (s) => s.map((x) => x.texto ?? x.legenda ?? "").join("\n---\n");
  const doGrupo = (s) => s.filter((x) => x.para === GRUPO);
  const atual = async () => (await db.query("select * from jogo.jogadores where id = $1", [jogador.id]))[0];
  const forte = (extra = "") => db.query(`update jogo.jogadores set atributos = '{"FOR":9000,"DEF":9000,"MAG":9000,"RES":9000,"VEL":900,"SOR":10}', hp = 99999, hp_max = 99999, mp = 999, mp_max = 999, vigor = 100 ${extra} where id = $1`, [jogador.id]);
  const matar = async (local) => { const a = await enviar(`ir ${local}`); const l = await enviar("lutar"); const f = await enviar("1"); return { a, l, f }; };

  await db.query("delete from jogo.exploracoes where jogador_id = $1", [jogador.id]);
  await db.query("update jogo.viagens set concluida_em = now() where jogador_id = $1 and concluida_em is null", [jogador.id]);
  await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-3', local_atual = null, nivel = 1, xp = 0, ryo = 500 where id = $1", [jogador.id]);
  await forte();

  await t("locais lista os lugares da região; ir mostra a imagem e as pessoas", async () => {
    const s = await enviar("locais");
    assert.match(texto(s), /Palafitas de Amiya.*loja/); assert.match(texto(s), /Mangue dos Kappas.*perigo/);
    const v = await enviar("ir 1");
    assert(v[0].imagem?.length > 2000); assert.match(v[0].legenda, /Vó Ume/);
    assert.equal((await atual()).local_atual, "amiya");
  });
  await t("falar com NPC avança o capítulo; conversa de novo não repete o passo", async () => {
    const s = await enviar("falar vó ume");
    assert.match(texto(s), /sino/); assert.match(texto(s), /A história avança/); assert.match(texto(s), /Devolva.*2\/4/);
    assert.doesNotMatch(texto(await enviar("falar ume como vai?")), /A história avança/);
    assert.match(texto(await enviar("missao")), /Kappa Ladrão/);
  });
  await t("vilão no covil aparece com imagem; primeira derrota do mundo é anunciada no grupo", async () => {
    const { a, f } = await matar("mangue");
    assert(a.some((x) => x.imagem && /Kappa Ladrão, o Ladrão das Redes/.test(x.legenda)), "imagem do vilão");
    assert.match(texto(f), /Vitória/); assert.match(texto(f), /🎲/);
    assert(doGrupo(f).some((x) => /derrotou \*Kappa Ladrão/.test(x.texto ?? x.legenda)));
    assert.equal((await db.query("select primeiro from jogo.derrotas_vilao where vilao_id = 'V009' and jogador_id = $1", [jogador.id]))[0].primeiro, true);
    assert.match(texto(f), /Devolva.*3\/4/);
  });
  await t("vilão derrotado não volta: o covil fica vazio e explorar só traz lacaios", async () => {
    const s = await enviar("ir mangue");
    assert(!s.some((x) => /lutar/.test(x.legenda ?? x.texto ?? "")));
    await forte(); dados = [0.1, 0.1, 0.9];           // exploração: encontro
    const e = await enviar("explorar");
    assert(e.some((x) => x.imagem && /bloqueia o caminho/.test(x.legenda)), "lacaio com imagem");
    assert.match(texto(e), /(Cria|Capanga|Sombra|Guarda|Aprendiz|Seguidor) de /);
    await enviar("recuar");
  });
  await t("quem chega depois enfrenta o Eco (sem manchete no grupo)", async () => {
    await db.query("insert into jogo.derrotas_vilao (mundo_id, vilao_id, jogador_id, primeiro) values ($1, 'V013', $2, true)", [jogador.mundo_id, outro.id]);
    const { a, f } = await matar("afundadas");
    assert.match(texto(a), /Eco de Afogado de Amiya/);
    assert.match(texto(f), /era um Eco/);
    assert(!doGrupo(f).some((x) => /derrotou/.test(x.texto ?? "")));
  });
  await t("concluir o capítulo dá pista, XP, bandeira e anúncio; segredos lista o que foi descoberto", async () => {
    await forte();
    const { f } = await matar("afundadas");            // Sabuurō
    assert.match(texto(f), /Capítulo concluído — Devolva/); assert.match(texto(f), /O que você descobriu/); assert.match(texto(f), /Seu caminho.*Selo da Guilda/s);
    assert(doGrupo(f).some((x) => /concluiu \*Devolva\*/.test(x.texto ?? "")));
    const chaves = (await db.query("select chave from jogo.progresso where jogador_id = $1", [jogador.id])).map((x) => x.chave);
    assert(chaves.includes("c:wat3") && chaves.includes("b:despertar"));
    assert.match(texto(await enviar("segredos")), /sino há uma data/);
    assert.match(texto(f), /Ainda há o que fazer aqui/);   // próximo capítulo da região
  });
  await t("itens: bolsa detalhada com usos, comprar, usar, equipar com restrição de classe, descansar", async () => {
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-3', hp = 10, hp_max = 200, mp = 5, mp_max = 50, ryo = 500, nivel = 6 where id = $1", [jogador.id]);
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd) values ($1, 'pocao', 'consumivel', 3) on conflict (jogador_id, item_id) do update set qtd = 3`, [jogador.id]);
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, equipado) values ($1, 'ace-sorte', 'equipamento', 1, true) on conflict (jogador_id, item_id) do update set equipado = true`, [jogador.id]);
    const b = texto(await enviar("itens"));
    assert.match(b, /Poção de cura — 3 usos/); assert.match(b, /recupera 35% da vida/); assert.match(b, /\(equipado\)/);
    assert.match(texto(await enviar("usar poção de cura")), /\+70 de vida.*restam 2/s);
    const loja = texto(await enviar("loja"));
    assert.match(loja, /Poção de mana — 35 ryō/);
    const n = loja.split("\n").find((l) => /Poção de mana/.test(l)).match(/\*(\d+)\*/)[1];
    assert.match(texto(await enviar(`comprar ${n} 2`)), /−70 ryō/);
    assert.equal((await atual()).ryo, "430");
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd) values ($1, $2, 'equipamento', 1) on conflict do nothing`, [jogador.id, jogador.classe === "Mago" ? "arma-katana-1" : "arma-cajado-1"]);
    if (!["Bruxo", "Mago"].includes(jogador.classe)) assert.match(texto(await enviar("equipar cajado de aprendiz")), /não sabe usar/);
    assert.match(texto(await enviar("descansar")), /acorda inteiro/);
    assert.equal((await atual()).hp, 200);
    assert.match(texto(await enviar("habilidades")), /aprende no nível/);
  });
  await t("destino: covil de capítulo futuro fica fechado até a história chegar", async () => {
    await db.query("update jogo.jogadores set regiao_atual = 'R-KOK-6', local_atual = null where id = $1", [jogador.id]);
    const s = await enviar("ir 1");
    assert.match(texto(s), /ainda não te trouxe até aqui/); assert(!s.some((x) => /lutar/.test(x.legenda ?? "")));
  });
  await t("amizade cresce com o tempo; às vezes um amigo é morto; vingar dá juramento e a vingança é anunciada", async () => {
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-1', local_atual = null where id = $1", [jogador.id]);
    for (let i = 0; i < 3; i++) { clock += 7 * 3_600_000; await enviar("falar mestre uo"); }
    assert.equal((await db.query("select amizade from jogo.relacoes where jogador_id = $1 and npc = 'R-WAT-1:mestre-uo'", [jogador.id]))[0].amizade, 3);
    assert.match(texto(await enviar("amigos")), /Mestre Uo.*amigo/);
    // sai e volta: chegada sorteia a morte (rng 0 < 12%)
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-2' where id = $1", [jogador.id]);
    await db.query(`insert into jogo.viagens (jogador_id, origem, destino, partida_em, chegada_em) values ($1, 'R-WAT-2', 'R-WAT-1', $2, $3)`, [jogador.id, new Date(clock - 700_000), new Date(clock - 1000)]);
    dados = [0, 0, 0];
    const ch = await enviar("viagem");
    assert(ch.some((x) => x.imagem && /Ryūgū-jō/.test(x.legenda)), "chegada com imagem da cidade");
    assert.match(texto(ch), /Mestre Uo\* está no chão/);
    assert(doGrupo(ch).some((x) => /foi morto por/.test(x.texto)));
    const morto = (await db.query("select * from jogo.npcs_mortos where jogador_id = $1", [jogador.id]))[0];
    const v = await enviar("vingar");
    assert.match(texto(v), /\+15% de dano/); assert(doGrupo(v).some((x) => /jurou vingar/.test(x.texto)));
    assert.match(texto(await enviar("falar mestre uo")), /flores/);        // túmulo: a história não trava
    // derrota o assassino
    await forte(); const c = COVIL.get(morto.vilao_id);
    await db.query("update jogo.jogadores set regiao_atual = $2 where id = $1", [jogador.id, c.regiao]);
    for (const vid of MUNDO[c.regiao].locais.find((l) => l.id === c.local).viloes) {
      if (vid === morto.vilao_id) break;
      await db.query("insert into jogo.derrotas_vilao (mundo_id, vilao_id, jogador_id) values ($1, $2, $3) on conflict do nothing", [jogador.mundo_id, vid, jogador.id]);
    }
    await db.query("insert into jogo.progresso (jogador_id, chave) values ($1, 'b:festival'), ($1, 'b:selo') on conflict do nothing", [jogador.id]);
    const { l, f } = await matar(c.local);
    assert.match(texto(l), /juramento/); assert.match(texto(f), /vingança cumprida/);
    assert(doGrupo(f).some((x) => /cumpriu o juramento/.test(x.texto ?? x.legenda ?? "")));
  });
  await t("narrador recebe o capítulo e o passo atual (IA presa ao trilho)", async () => {
    const pedidos = [];
    jogo = novoJogo({ nome: "falsa", async gerarJSON(a) { pedidos.push(a); return { ok: true, provedor: "falsa", dados: a.esquema.properties.fala ? { fala: "— Cuidado com o lago, menino." } : { narracao: "O vento muda.", eventos: [] } }; } });
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-2', local_atual = 'minato' where id = $1", [jogador.id]);
    clock += 60_000; const n1 = await enviar("> olho o porto procurando o navio estranho");
    assert.match(texto(n1), /O vento muda\.[\s\S]*A história continua com:_ \*falar Gorō\*/, "o motor mostra o comando exato que faz a história andar");
    const ctx = pedidos.at(-1).mensagens.at(-1).content;
    assert.match(ctx, /O Navio sem Tripulação/); assert.match(ctx, /passo_atual/); assert.match(ctx, /só avança por comandos do jogo[\s\S]*Nunca traga o jogador de volta à força/);
    assert.match(pedidos.at(-1).sistema, /Capitão Gorō/);
    assert.match(pedidos.at(-1).sistema, /A ação do jogador SEMPRE acontece[\s\S]*Não repita a cena/);
    // frase livre que é uma ação do jogo vira o comando (era aqui que o jogador ficava em loop com o narrador)
    clock += 60_000;
    const livre = await enviar("quero sentar e ouvir o que o capitão Gorō tem a dizer");
    assert.match(texto(livre), /\*Capitão Gorō\*[\s\S]*Cuidado com o lago/); assert.match(texto(livre), /A história avança|Capítulo concluído/, "ouvir a pessoa do passo faz o capítulo andar");
    // no meio da conversa, o que soa como ação vai para o narrador, não para o NPC
    clock += 60_000;
    const acao2 = await enviar("eu quero tentar pescar no lago");
    assert.match(texto(acao2), /O vento muda/); assert.doesNotMatch(texto(acao2), /Cuidado com o lago/);
    // e uma pergunta solta logo depois de falar com alguém continua a conversa
    clock += 60_000; await enviar("falar gorō");
    clock += 60_000; assert.match(texto(await enviar("e o navio, capitão?")), /Cuidado com o lago/);
    clock += 60_000;
    const f = await enviar("falar gorō o que houve com o navio?");
    assert.match(texto(f), /Cuidado com o lago/); assert.match(pedidos.at(-1).sistema, /Você interpreta Capitão Gorō/);
    jogo = novoJogo();
  });
  await t("pet: elegível conclui o capítulo de um santuário e um espírito o escolhe; luta junto e ganha carinho", async () => {
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-6', local_atual = null, elegivel_pet = true where id = $1", [jogador.id]);
    await forte(", nivel = 30");
    await enviar("falar irmã mizu"); await matar("lagoa");
    await forte(", nivel = 30"); dados = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.9, 0.2];
    const { f } = await matar("santuario");
    assert.match(texto(f), /Capítulo concluído — Quem a Água Chama/);
    assert(f.some((x) => x.imagem && /decide ficar/.test(x.legenda ?? "")), "pet com imagem no privado");
    assert(doGrupo(f).some((x) => x.imagem && /Um espírito escolheu/.test(x.legenda ?? "")), "pet anunciado no grupo");
    const pet = (await db.query("select * from jogo.pets where jogador_id = $1", [jogador.id]))[0];
    assert(pet && pet.estagio === 1);
    assert.match(texto(await enviar("pet carinho")), /\+3 de vínculo/);
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-3' where id = $1", [jogador.id]);
    await forte(); dados = [0.1, 0.1, 0.9];
    await enviar("explorar"); const l = await enviar("lutar"); const v = await enviar("1");
    assert.match(texto(v), /Vitória/); assert(l.length);
    assert.equal((await db.query("select vitorias from jogo.pets where jogador_id = $1", [jogador.id]))[0].vitorias, 1);
  });
  await t("boatos contam os contos da região; pacto de Kanata aparece na derrota e cobra corrupção", async () => {
    assert.match(texto(await enviar("boatos")), /Dizem que/);
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-3', local_atual = null, hp = 30, hp_max = 30, mp = 0, nivel = 1, atributos = '{\"FOR\":1,\"DEF\":1,\"MAG\":1,\"RES\":1,\"VEL\":1,\"SOR\":1}' where id = $1", [jogador.id]);
    await db.query("delete from jogo.inventario where jogador_id = $1 and item_id in ('pocao','pocao-mana','elixir','bomba-fumaca')", [jogador.id]);
    await enviar("ir ilha"); await enviar("lutar");
    let fim = ""; for (let k = 0; k < 12 && !/Derrota/.test(fim); k++) fim = texto(await enviar("1"));
    assert.match(fim, /Derrota/); assert.match(fim, /Mestre Yoru/); assert.match(fim, /aceitar pacto/);
    const p = texto(await enviar("aceitar pacto"));
    assert.match(p, /\+15% de dano/); assert.equal((await atual()).corrupcao, 25);
    assert.match(texto(await enviar("aceitar pacto")), /Ninguém te ofereceu/);
  });
  await t("grupo: apoiar manda forças (1 por dia) e duelo amistoso é resolvido com dados", async () => {
    await db.query(`update jogo.jogadores set estado = 'ativo', etapa_criacao = null, nome = 'Rin', nome_normalizado = 'rin', classe = 'Mago', nivel = 3,
      atributos = '{"FOR":4,"DEF":5,"MAG":14,"RES":10,"VEL":7,"SOR":6}', hp = 90, hp_max = 90, mp = 50, mp_max = 50, regiao_atual = 'R-WAT-1' where id = $1`, [outro.id]);
    const ap = await noGrupo(outroGrupo("apoiar Kaito"));
    assert.match(texto(ap), /manda forças para \*Kaito Ryuen\*/);
    assert.match(texto(await noGrupo(outroGrupo("apoiar Kaito"))), /já mandou seu apoio hoje/);
    assert.equal(Number((await db.query("select valor from jogo.progresso where jogador_id = $1 and chave = 'apoio'", [jogador.id]))[0].valor), 1);
    const d = await noGrupo(outroGrupo("duelo Kaito"));
    assert.match(texto(d), /desafia \*Kaito Ryuen\*/);
    const r = await noGrupo(grupo("aceitar", false));
    assert.match(texto(r), /Duelo — Rin × Kaito Ryuen[\s\S]*Vez de (Rin|Kaito Ryuen)[\s\S]*\*1\* Atacar/, "o duelo abre com o painel e o menu de quem começa");
    const xpAntes = Object.fromEntries((await db.query("select id, xp, nivel from jogo.jogadores where id = any($1)", [[jogador.id, outro.id]])).map((x) => [x.id, x]));
    const vez = (s) => /Vez de Rin/.test(texto(s)) ? "rin" : "kaito";
    let s = r, fora = await noGrupo(vez(r) === "rin" ? grupo("1", false) : outroGrupo("1"));
    assert.match(texto(fora), /Ainda é a vez de/, "quem não está na vez não joga");
    for (let k = 0; k < 60 && !/vence/.test(texto(s)); k++) s = await noGrupo(vez(s) === "rin" ? outroGrupo(k % 5 === 4 ? "2" : "1") : grupo(k % 5 === 4 ? "2" : "1", false));
    assert.match(texto(s), /🎲 \*\d+\*[\s\S]*vence/, "cada turno rola o dado às claras e o duelo termina");
    assert.match(texto(s), /XP/);
    const ganhos = [...texto(s).matchAll(/\+(\d+) XP/g)].map((m) => Number(m[1]));
    assert(ganhos.length === 2 && ganhos.every((g) => g <= 300), "duelo dá só um pouco de experiência");
    assert.equal((await db.query("select count(*)::int n from jogo.progresso where chave in ('duelo-ativo', 'duelo-estado')"))[0].n, 0, "o duelo não deixa resto");
  });
  await t("minha história: salva por partes, recusa poderes e lore, segredo fica privado, grupo lê o resto", async () => {
    assert.match(texto(await enviar("minha história")), /Origem.*em branco/);
    assert.match(texto(await enviar("minha história origem Cresci nas palafitas de Amiya, remendando redes com a minha avó.")), /Anotado.*origem/s);
    assert.match(texto(await enviar("minha história segredo Fui eu que deixei o barco do meu pai à deriva naquela noite.")), /só o narrador conhece/);
    assert.match(texto(await enviar("minha história sonho Sou imortal e o mais forte do mundo, com 1000% de dano")), /não o quanto você é forte/);
    assert.match(texto(await enviar("minha história origem Sou o filho perdido de Kaien e herdei o ovo")), /não pode mexer na história do mundo/);
    assert.match(texto(await enviar("minha história laço oi")), /Conte um pouco mais/);
    const ver = texto(await enviar("minha história"));
    assert.match(ver, /palafitas de Amiya/); assert.match(ver, /barco do meu pai/); assert.match(ver, /Sonho.*em branco/);
    const pub = texto(await noGrupo(outroGrupo("historia Kaito")));
    assert.match(pub, /palafitas de Amiya/); assert.doesNotMatch(pub, /barco do meu pai/);
    const pedidos = [];
    jogo = novoJogo({ nome: "falsa", async gerarJSON(a) { pedidos.push(a); return { ok: true, provedor: "falsa", dados: a.esquema.properties.fala ? { fala: "— Sei." } : { narracao: "O vento muda.", eventos: [] } }; } });
    await db.query("update jogo.jogadores set regiao_atual = 'R-WAT-2', local_atual = 'minato' where id = $1", [jogador.id]);
    clock += 60_000; await enviar("> sento no cais e penso na minha avó");
    assert.match(pedidos.at(-1).mensagens.at(-1).content, /historia_pessoal.*palafitas de Amiya/s);
    assert.match(pedidos.at(-1).mensagens.at(-1).content, /NUNCA concede poder/);
    jogo = novoJogo();
  });
  await t("Guilda e convívio: contratos do dia pagam sozinhos, sonho ao descansar aponta a história, ranking, dar item e abas da loja", async () => {
    const { criarSocial, contratosDoDia } = await import("../src/servidor/social.mjs");
    const { MUNDO } = await import("../src/mundo/mundo.mjs");
    const rid = Object.keys(MUNDO).find((k) => MUNDO[k].tipo === "capital" && MUNDO[k].locais.some((l) => l.servicos?.includes("loja")));
    await db.query("update jogo.jogadores set regiao_atual = $2, local_atual = null, ryo = 500, hp = hp_max where id = $1", [jogador.id, rid]);
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave in ('contratos', 'sonhos', 'presentes')", [jogador.id]);
    const q = texto(await enviar("contratos"));
    assert.match(q, /Quadro da Guilda[\s\S]*Limpar a estrada[\s\S]*Ouvir o povo/);
    const j = await atual(), hoje = new Date(clock).toISOString().slice(0, 10);
    const social = criarSocial({ db, rng: () => 0, agora: () => clock });
    const cacar = contratosDoDia(j, hoje).find((c) => c.id === "cacar");
    let pago = [];
    for (let i = 0; i < cacar.alvo; i++) pago = await social.aoEventos(j, [{ tipo: "vitoria" }], "pv");
    assert.match(texto(pago), /Contrato cumprido[\s\S]*ryō/);
    assert.equal(Number((await atual()).ryo), 500 + cacar.ryo);
    assert.deepEqual(await social.aoEventos(j, [{ tipo: "vitoria" }], "pv"), [], "contrato pago não paga de novo");
    assert.match(texto(await enviar("contratos")), /cumprido/);
    // sonho: sempre termina no próximo passo da campanha
    assert.match(texto(await social.sonho(j, "pv")), /você sonha[\s\S]*certeza quieta/);
    // ranking, no privado e no grupo
    assert.match(texto(await enviar("ranking")), /nomes mais falados[\s\S]*Rin/);
    assert.match(texto(await noGrupo(grupo("ranking"))), /nomes mais falados/);
    // abas da loja mantêm a numeração
    const tudo = texto(await enviar("loja")), pocoes = texto(await enviar("loja poções"));
    assert.match(pocoes, /poções e utilidades[\s\S]*Poção de cura/); assert.doesNotMatch(pocoes, /Espada|Cajado|Katana|Manto/);
    assert(tudo.length > pocoes.length);
    // dar: poção e ryō passam de um jogador para o outro; equipamento não
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'pocao', 'consumivel', 2, '{}') on conflict (jogador_id, item_id) do update set qtd = 2`, [jogador.id]);
    const antes = (await db.query("select coalesce(sum(qtd), 0)::int n from jogo.inventario where jogador_id = $1 and item_id = 'pocao'", [outro.id]))[0].n;
    assert.match(texto(await noGrupo(grupo("dar poção Rin"))), /Kaito Ryuen\* entrega \*Poção de cura\* a \*Rin/);
    assert.equal((await db.query("select sum(qtd)::int n from jogo.inventario where jogador_id = $1 and item_id = 'pocao'", [outro.id]))[0].n, antes + 1);
    assert.match(texto(await noGrupo(grupo("dar 40 ryo Rin"))), /entrega 40 ryō/);
    assert.match(texto(await noGrupo(grupo("dar 999999 ryo Rin"))), /Quantidade inválida|não tem/);
    assert.match(texto(await noGrupo(grupo("dar espada Rin"))), /não tem isso para dar/);
  });
  await t("a história é do mundo: capítulo concluído não se repete, quem chega depois herda a notícia e a bandeira; acompanhar faz os dois concluírem juntos", async () => {
    const { MUNDO, CAPITULO } = await import("../src/mundo/mundo.mjs");
    const prog = async (id, chave) => (await db.query("select valor from jogo.progresso where jogador_id = $1 and chave = $2", [id, chave]))[0]?.valor;
    // 1) herança: Kaito viveu um capítulo que Rin não viveu
    let feito = (await db.query("select chave from jogo.progresso where jogador_id = $1 and chave like 'c:%' and coalesce(valor->>'herdado','') = '' limit 1", [jogador.id]))[0]?.chave;
    if (!feito) { feito = `c:${[...CAPITULO.values()][0].id}`; await db.query("insert into jogo.progresso (jogador_id, chave, valor) values ($1, $2, 'true')", [jogador.id, feito]); }
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave like 'c:%'", [outro.id]);
    const nivelAntes = (await db.query("select xp, nivel from jogo.jogadores where id = $1", [outro.id]))[0];
    const h = await noGrupo(outroPrivado("missao"));
    assert.match(texto(h), /já fo(i|ram) vivida[\s\S]*não se repete[\s\S]*Seu caminho/);
    assert.equal((await prog(outro.id, feito)).herdado, true);
    const depois = (await db.query("select xp, nivel from jogo.jogadores where id = $1", [outro.id]))[0];
    assert(depois.nivel > nivelAntes.nivel || Number(depois.xp) > Number(nivelAntes.xp), "herdeiro ganha parte do XP");
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("missao"))), /não se repete/, "a notícia chega uma vez só");
    // 2) acompanhar: um capítulo aberto para os dois, com passos de ir/falar
    const abertos = new Set((await db.query("select chave from jogo.progresso where jogador_id = any($1) and chave like 'c:%'", [[jogador.id, outro.id]])).map((x) => x.chave.slice(2)));
    const cap = [...CAPITULO.values()].find((c) => !abertos.has(c.id) && !c.final && c.passos.length >= 2 && c.passos.every((p) => p.t !== "derrotar")
      && MUNDO[c.regiao].capitulos.every((o) => o.id === c.id || abertos.has(o.id) || MUNDO[c.regiao].capitulos.indexOf(o) > MUNDO[c.regiao].capitulos.indexOf(c)));
    assert(cap, "existe um capítulo só de ir/falar para o teste");
    for (const id of [jogador.id, outro.id]) {
      await db.query("update jogo.jogadores set regiao_atual = $2, local_atual = null, hp = hp_max where id = $1", [id, cap.regiao]);
      await db.query("delete from jogo.exploracoes where jogador_id = $1 and pendente", [id]);
      for (const r of cap.requer ?? []) await db.query("insert into jogo.progresso (jogador_id, chave, valor) values ($1, $2, 'true') on conflict do nothing", [id, `b:${r}`]);
    }
    assert.match(texto(await noGrupo(outroPrivado("acompanhar Kaito"))), /lado a lado/);
    const passo = async (p) => { clock += 7 * 3_600_000; return enviar(p.t === "ir" ? `ir ${MUNDO[cap.regiao].locais.find((l) => l.id === p.a).nome}` : `falar ${MUNDO[cap.regiao].npcs[p.a].nome.split(" ").at(-1)}`); };
    let r = [];
    for (const p of cap.passos) {
      if (p.t === "falar") { const l = MUNDO[cap.regiao].locais.find((x) => (x.npcs ?? []).includes(p.a)); if (l) await enviar(`ir ${l.nome}`); }
      r = await passo(p);
    }
    assert((await prog(jogador.id, `c:${cap.id}`)) === true, "quem deu o último passo concluiu");
    assert.equal((await prog(outro.id, `c:${cap.id}`)).com, "Kaito Ryuen", "quem acompanhou concluiu junto");
    assert(r.some((x) => /ao lado de Kaito Ryuen/.test(x.texto ?? "")), "o companheiro recebe o capítulo no privado");
    assert(doGrupo(r).some((x) => /ao lado de \*Rin/.test(x.texto)), "o grupo sabe que foram os dois");
    assert.equal(await prog(outro.id, "acomp"), undefined, "o grupo de viagem se desfaz ao fim do capítulo");
  });
  await t("mão do mestre: maldição secreta pelo privado do admin, resgate pelos companheiros, sussurro e presente; ninguém mais usa", async () => {
    await db.query("update jogo.jogadores set hp = hp_max where id = any($1)", [[jogador.id, outro.id]]);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("mestre maldição Kaito"))), /Mão do mestre|Feito/);
    assert.deepEqual(await noGrupo(grupo("mestre maldição Rin", true)), [], "no grupo o comando é ignorado");
    assert.match(texto(await noGrupo(adminPrivado("mestre"))), /Mão do mestre/);
    const m = await noGrupo(adminPrivado("mestre maldição Rin"));
    assert(doGrupo(m).some((x) => /sono de cinzas caiu sobre Rin/.test(x.texto) && !/admin|mestre/i.test(x.texto)), "o grupo vê a história, não o admin");
    assert.match(texto(await noGrupo(outroPrivado("explorar"))), /corpo não responde[\s\S]*resgatar Rin/);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("itens"))), /corpo não responde/);
    assert.match(texto(await noGrupo(outroGrupo("resgatar Rin"))), /não consegue puxar a si mesmo/);
    const res = await noGrupo(grupo("resgatar Rin"));
    assert.match(texto(res), /sono de cinzas se quebrou/);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("explorar"))), /corpo não responde/);
    assert.match(texto(await noGrupo(adminPrivado("mestre sussurro Rin Não confie no homem do sino."))), /Uma voz que não é sua[\s\S]*homem do sino[\s\S]*Feito/);
    const antes = (await db.query("select coalesce(sum(qtd), 0)::int n from jogo.inventario where jogador_id = $1 and item_id = 'elixir'", [outro.id]))[0].n;
    assert.match(texto(await noGrupo(adminPrivado("mestre presente Rin elixir"))), /embrulho[\s\S]*Elixir estelar/);
    assert.equal((await db.query("select sum(qtd)::int n from jogo.inventario where jogador_id = $1 and item_id = 'elixir'", [outro.id]))[0].n, antes + 1);
    assert.match(texto(await noGrupo(adminPrivado("mestre presente Rin excalibur"))), /Só poções/);
    assert(doGrupo(await noGrupo(adminPrivado("mestre presságio As estrelas piscaram duas vezes."))).some((x) => /estrelas piscaram/.test(x.texto)));
  });
  await t("relógio: a chegada de viagem avisa sozinha e a crônica do dia sai no grupo", async () => {
    const { MUNDO } = await import("../src/mundo/mundo.mjs");
    const r = (await db.query("select regiao_atual from jogo.jogadores where id = $1", [outro.id]))[0].regiao_atual;
    const destino = Object.keys(MUNDO).find((k) => k !== r);
    await db.query("delete from jogo.viagens where jogador_id = $1 and concluida_em is null", [outro.id]);
    await db.query("insert into jogo.viagens (jogador_id, origem, destino, partida_em, chegada_em) values ($1, $2, $3, $4, $5)", [outro.id, r, destino, new Date(clock - 600_000), new Date(clock - 1000)]);
    const ch = await jogo.aoTick({ tipo: "chegada", jogador: Number(outro.id) });
    assert(ch.length && ch.some((x) => x.imagem), "chegada manda a cena do lugar no privado");
    assert.equal((await db.query("select regiao_atual from jogo.jogadores where id = $1", [outro.id]))[0].regiao_atual, destino);
    assert.deepEqual(await jogo.aoTick({ tipo: "chegada", jogador: Number(outro.id) }), [], "não avisa duas vezes");
    const cr = await jogo.aoTick({ tipo: "resumo" });
    assert(doGrupo(cr).some((x) => /Crônica do dia/.test(x.texto)), "crônica no grupo");
  });
  await t("ameaças: monstro numa cidade (luta em grupo, loja fechada, recompensa), Calamidade só com história desenvolvida, espiã do mestre", async () => {
    const { MUNDO } = await import("../src/mundo/mundo.mjs");
    const { AMEACA } = await import("../src/servidor/ameacas.mjs");
    const rid = Object.keys(MUNDO).find((k) => MUNDO[k].tipo === "capital" && MUNDO[k].locais.some((l) => l.servicos?.includes("loja")));
    const longe = Object.keys(MUNDO).find((k) => k !== rid);
    await db.query("delete from jogo.viagens where concluida_em is null");
    await db.query("update jogo.jogadores set hp = hp_max, regiao_atual = $2, local_atual = null where id = $1", [jogador.id, rid]);
    await db.query("update jogo.jogadores set hp = hp_max, regiao_atual = $2, local_atual = null where id = $1", [outro.id, longe]);
    assert.match(texto(await noGrupo(adminPrivado("mestre monstros"))), /\*01\* Gakidama[\s\S]*\*20\* Amanozako/);
    assert.match(texto(await noGrupo(adminPrivado("mestre monstro 17 x"))), /Use: mestre monstro|grande demais/);
    const inv = await noGrupo(adminPrivado(`mestre monstro 6 ${(await import("../src/regras/exploracao.mjs")).REGIAO.get(rid).nome}`));
    assert(doGrupo(inv).some((x) => x.imagem?.length > 1000 && /Tsuchigumo[\s\S]*apareceu em/.test(x.legenda) && !/mestre|admin/i.test(x.legenda)), "anúncio com imagem, sem citar o mestre");
    assert.match(texto(await enviar("loja")), /Portas trancadas/);
    assert.match(texto(await noGrupo(outroPrivado("golpear"))), /chegue lá/);
    const g1 = texto(await enviar("golpear"));
    assert.match(g1, /🎲[\s\S]*Tsuchigumo/);
    assert.match(texto(await enviar("golpear")), /recuperando o fôlego/);
    // ação livre no meio da luta: a vida não "reseta" e o narrador fica na luta, sem puxar missão do lugar
    await db.query("update jogo.jogadores set hp = hp_max - 40, recuperacao_em = $2 where id = $1", [jogador.id, new Date(clock - 20 * 3_600_000)]);
    await db.query("update jogo.ameaca_golpes set ultimo_em = $2 where jogador_id = $1", [jogador.id, new Date(clock - 10 * 60_000)]);
    let apanhou = null;
    for (let k = 0; k < 8 && !apanhou; k++) { const antes = Number((await atual()).hp); await enviar("golpear"); const dep = Number((await atual()).hp);
      if (dep < antes) apanhou = dep; else { clock += 6 * 60_000; await db.query("update jogo.jogadores set recuperacao_em = $2 where id = $1", [jogador.id, new Date(clock - 20 * 3_600_000)]); } }
    assert(apanhou, "o monstro acertou pelo menos uma vez");
    const pedidosA = [];
    jogo = novoJogo({ nome: "falsa", async gerarJSON(a) { pedidosA.push(a); return { ok: true, provedor: "falsa", dados: { narracao: "Você rola para trás de uma carroça.", eventos: [] } }; } });
    clock += 30_000;
    const livreA = await enviar("> me escondo atrás da carroça e observo o monstro");
    assert(Number((await atual()).hp) <= apanhou + 2, "a vida não volta sozinha por causa de uma ação livre");
    assert.match(pedidosA.at(-1).mensagens.at(-1).content, /ameaca_presente[\s\S]*Tsuchigumo[\s\S]*Não comece nem continue missões/);
    assert.doesNotMatch(pedidosA.at(-1).mensagens.at(-1).content, /passo_atual/);
    assert.match(texto(livreA), /carroça[\s\S]*Para ferir Tsuchigumo:_ \*golpear\*/);
    jogo = novoJogo(); clock += 6 * 60_000;
    await db.query("update jogo.jogadores set regiao_atual = $2, hp = hp_max where id = $1", [outro.id, rid]);
    assert.match(texto(await noGrupo(outroPrivado("golpear"))), /lutando junto: \+25%|passa no vazio/);
    const am = (await db.query("select * from jogo.ameacas where estado = 'ativa' and tipo = 'monstro'"))[0];
    await db.query("update jogo.ameacas set hp = 1 where id = $1", [am.id]);
    await db.query("update jogo.jogadores set hp = hp_max where id = $1", [jogador.id]);
    const ryo = Number((await atual()).ryo);
    let fim = [];
    for (let k = 0; k < 12 && !doGrupo(fim).some((x) => /está livre/.test(x.texto)); k++) { clock += 6 * 60_000; await db.query("update jogo.jogadores set hp = hp_max where id = $1", [jogador.id]); fim = await enviar("golpear"); }
    assert(doGrupo(fim).some((x) => /está livre[\s\S]*Kaito Ryuen/.test(x.texto)), "vitória anunciada com o placar");
    assert(Number((await atual()).ryo) > ryo, "quem lutou recebe ryō");
    assert.doesNotMatch(texto(await enviar("loja")), /Portas trancadas/);
    // Calamidade: só com a história desenvolvida
    const mundoId = (await atual()).mundo_id;
    const n = Number((await db.query("select count(distinct p.chave) n from jogo.progresso p join jogo.jogadores j on j.id = p.jogador_id where j.mundo_id = $1 and p.chave like 'c:%' and coalesce(p.valor->>'herdado','') = ''", [mundoId]))[0].n);
    if (n < AMEACA.capitulosParaCalamidade) assert.match(texto(await noGrupo(adminPrivado("mestre calamidade"))), /história ainda está no começo/);
    const antes = AMEACA.capitulosParaCalamidade; AMEACA.capitulosParaCalamidade = 0;
    const cal = await noGrupo(adminPrivado("mestre calamidade 19"));
    AMEACA.capitulosParaCalamidade = antes;
    assert(doGrupo(cal).some((x) => /CALAMIDADE[\s\S]*Gashadokuro/.test(x.legenda ?? "")), "Calamidade anunciada no grupo");
    await db.query("update jogo.jogadores set regiao_atual = $2, hp = hp_max where id = $1", [outro.id, longe]);
    clock += 6 * 60_000;
    assert.match(texto(await noGrupo(outroPrivado("golpear"))), /🎲[\s\S]*Gashadokuro/, "a Calamidade se ataca de qualquer lugar");
    const c = (await db.query("select * from jogo.ameacas where estado = 'ativa' and tipo = 'calamidade'"))[0];
    clock += 49 * 3_600_000;
    assert(doGrupo(await jogo.aoTick({ tipo: "ameaca", ameaca: Number(c.id) })).some((x) => /vai embora/.test(x.texto)), "sem vitória, ela vai embora no prazo");
    // espiã
    const e = await noGrupo(adminPrivado("mestre espiã Rin"));
    assert(e.some((x) => /Shiori/.test(x.texto) && x.para !== GRUPO) && !doGrupo(e).length, "a espiã chega só no privado do jogador");
    await noGrupo(outroPrivado("itens"));
    assert.match(texto(await noGrupo(adminPrivado("mestre relatório Rin"))), /Relatório de Shiori[\s\S]*itens/);
    assert.match(texto(await noGrupo(adminPrivado("mestre recolher Rin"))), /Meu mapa acaba aqui[\s\S]*Feito/);
  });
  await t("mestre: fala pela espiã, mapa com todos, selo de teleporte que cobra um preço; conversa com NPC continua sem repetir o nome", async () => {
    const { MUNDO } = await import("../src/mundo/mundo.mjs");
    const { REGIAO } = await import("../src/regras/exploracao.mjs");
    await db.query("delete from jogo.viagens where concluida_em is null"); await db.query("delete from jogo.exploracoes where pendente");
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'");
    await db.query("update jogo.jogadores set hp = hp_max, ryo = 5, merito = 0 where id = $1", [outro.id]);
    // fala pela espiã
    assert.match(texto(await noGrupo(adminPrivado("mestre fala Rin oi"))), /Ninguém está acompanhando/);
    await noGrupo(adminPrivado("mestre espiã Rin"));
    const f = await noGrupo(adminPrivado("mestre fala Rin Eu não iria por esse caminho hoje."));
    assert(f.some((x) => /Shiori encosta[\s\S]*não iria por esse caminho/.test(x.texto) && x.para !== GRUPO) && !doGrupo(f).length);
    // mapa só para o mestre
    const mp = await noGrupo(adminPrivado("mestre mapa"));
    assert(mp[0].imagem?.length > 5000 && /Onde cada um está[\s\S]*Rin/.test(mp[0].legenda) && !doGrupo(mp).length);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("mestre mapa"))), /Onde cada um está/);
    // selo de teleporte
    assert.match(texto(await noGrupo(outroPrivado("teleportar Kyōkai"))), /não tem como abrir uma passagem/);
    const s = await noGrupo(adminPrivado("mestre teleporte Rin"));
    assert(s.some((x) => /selo de pedra clara/.test(x.texto)) && !doGrupo(s).length);
    const aqui = (await db.query("select regiao_atual from jogo.jogadores where id = $1", [outro.id]))[0].regiao_atual;
    const destino = [...REGIAO.values()].find((r) => r.id !== aqui && !r.desbloqueio && MUNDO[r.id]);
    assert.match(texto(await noGrupo(outroPrivado(`teleportar ${destino.nome}`))), /com o que você paga[\s\S]*pagar vida[\s\S]*pagar ryo[\s\S]*você não tem/);
    assert.match(texto(await noGrupo(outroPrivado("pagar ryo"))), /não tem ryō suficiente/);
    const hp = (await db.query("select hp, hp_max from jogo.jogadores where id = $1", [outro.id]))[0];
    const ch = await noGrupo(outroPrivado("pagar vida"));
    assert.match(texto(ch), /paga em sangue/); assert(ch.some((x) => x.imagem), "chega vendo o lugar");
    const dep = (await db.query("select hp, regiao_atual from jogo.jogadores where id = $1", [outro.id]))[0];
    assert.equal(dep.regiao_atual, destino.id); assert.equal(dep.hp, hp.hp - Math.floor(hp.hp_max / 2));
    assert.match(texto(await noGrupo(outroPrivado(`teleportar ${REGIAO.get(aqui).nome}`))), /não tem como abrir/, "o selo é de um uso só");
    await noGrupo(adminPrivado("mestre recolher Rin"));
    // conversa: "falar com a <nome>" acha a pessoa certa, e a frase seguinte continua com ela
    const rid = Object.keys(MUNDO).find((k) => Object.keys(MUNDO[k].npcs ?? {}).length >= 2);
    await db.query("update jogo.jogadores set regiao_atual = $2, local_atual = null, hp = hp_max where id = $1", [jogador.id, rid]);
    const [n1, n2] = Object.values(MUNDO[rid].npcs);
    clock += 30 * 60_000;
    const c1 = await enviar(`falar com a ${n2.nome.split(" ").at(-1)}`);
    assert.match(texto(c1), new RegExp(`\\*${n2.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*`), "preposição e artigo não confundem o nome");
    const c2 = await enviar("e o que mais?");
    assert.match(texto(c2), new RegExp(n2.nome.split(" ")[0]), "frase solta continua com a mesma pessoa");
    assert.doesNotMatch(texto(c2), new RegExp(`\\*${n1.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*,`));
    assert.match(texto(await enviar("tchau")), /acena com a cabeça/);
    assert.doesNotMatch(texto(await enviar("e o que mais?")), new RegExp(`\\*${n2.nome.split(" ")[0]}`), "depois do tchau a conversa acabou");
  });
  await t("mestre mover: transporta um jogador ou todos de uma vez, mostra o lugar a cada um e não cita o mestre", async () => {
    const { REGIAO } = await import("../src/regras/exploracao.mjs");
    const { MUNDO } = await import("../src/mundo/mundo.mjs");
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'");
    const onde = async (id) => (await db.query("select regiao_atual from jogo.jogadores where id = $1", [id]))[0].regiao_atual;
    const [d1, d2] = [...REGIAO.values()].filter((r) => MUNDO[r.id] && !r.desbloqueio && ![jogador.regiao_atual].includes(r.id)).slice(3, 5);
    await db.query("update jogo.jogadores set regiao_atual = $2 where id = any($1)", [[jogador.id, outro.id], [...REGIAO.values()].find((r) => r.id !== d1.id && r.id !== d2.id && MUNDO[r.id]).id]);
    const um1 = await noGrupo(adminPrivado(`mestre mover Rin ${d1.nome}`));
    assert.equal(await onde(outro.id), d1.id); assert.notEqual(await onde(jogador.id), d1.id);
    assert(um1.some((x) => x.imagem && x.para !== GRUPO), "o jogador vê o lugar aonde chegou");
    assert(um1.some((x) => /se rasga sem barulho/.test(x.texto ?? "")) && /Feito\. Em /.test(um1.at(-1).texto) && !doGrupo(um1).length);
    const todos = await noGrupo(adminPrivado(`mestre mover todos ${d2.nome}`));
    assert.equal(await onde(outro.id), d2.id); assert.equal(await onde(jogador.id), d2.id);
    assert(doGrupo(todos).some((x) => /todas as estrelas[\s\S]*Ninguém sabe quem os chamou/.test(x.texto) && !/mestre|admin/i.test(x.texto)));
    assert.match(todos.at(-1).texto, /Feito\. Em [\s\S]*Kaito Ryuen[\s\S]*Rin|Feito\. Em [\s\S]*Rin[\s\S]*Kaito Ryuen/);
    assert.match(texto(await noGrupo(adminPrivado(`mestre mover todos ${d2.nome}`))), /já está lá/);
    assert.match(texto(await noGrupo(adminPrivado("mestre mover todos lugarnenhum"))), /Para onde\?/);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado(`mestre mover todos ${d1.nome}`))), /Feito/);
  });
  await t("luta em conjunto: vilão de médio escalão com vida compartilhada entre quem acompanha a história; entrar é opcional e a vitória é de todos", async () => {
    const { VILOES, COVIL } = await import("../src/mundo/mundo.mjs");
    const v = [...VILOES.values()].find((x) => x.tier === "medio"), c = COVIL.get(v.id);
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'"); await db.query("delete from jogo.exploracoes where pendente");
    await db.query("delete from jogo.viagens where concluida_em is null"); await db.query("delete from jogo.lutas_grupo");
    await db.query("delete from jogo.derrotas_vilao where vilao_id = $1", [v.id]);
    await db.query("update jogo.jogadores set regiao_atual = $2, local_atual = $3, hp = 99999, hp_max = 99999, nivel = $4 where id = any($1)", [[jogador.id, outro.id], c.regiao, c.local, v.nivel]);
    await db.query(`insert into jogo.progresso (jogador_id, chave, valor) values ($1, 'acomp', $2) on conflict (jogador_id, chave) do update set valor = excluded.valor`, [outro.id, JSON.stringify({ lider: Number(jogador.id), rid: c.regiao })]);
    const pendente = (id) => db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em) values ($1, $2, $3, 'encontro', $4, true, $5)`,
      [id, `t:${id}:${clock}`, c.regiao, JSON.stringify({ inimigo: { id: v.id, nome: v.nome, nivel: v.nivel }, fixo: true, eco: false, local: c.local }), new Date(clock)]);
    await pendente(jogador.id);
    const ini = await enviar("lutar");
    assert.match(texto(ini), /companheiros foram avisados/); assert(ini.some((x) => /começou a luta contra[\s\S]*entrar na luta/.test(x.texto ?? "") && x.para !== GRUPO), "o companheiro é convidado no privado");
    const luta0 = (await db.query("select * from jogo.lutas_grupo"))[0];
    assert.equal(luta0.membros.length, 1);
    const ent = await noGrupo(outroPrivado("entrar na luta"));
    assert.match(texto(ent), /entra na luta ao lado de \*Kaito Ryuen\*[\s\S]*\*1\* Atacar/);
    assert(ent.some((x) => /Rin\* entrou na luta ao seu lado/.test(x.texto ?? "")), "quem já lutava é avisado");
    const luta1 = (await db.query("select * from jogo.lutas_grupo"))[0];
    assert.equal(luta1.membros.length, 2); assert(luta1.inimigo.hpMax > luta0.inimigo.hpMax, "o vilão ganha fôlego com mais um adversário");
    // um golpe de Rin aparece no vilão que Kaito enfrenta
    let hpAntes = luta1.inimigo.hp;
    for (let k = 0; k < 6 && (await db.query("select inimigo from jogo.lutas_grupo"))[0].inimigo.hp >= hpAntes; k++) await noGrupo(outroPrivado("1"));
    const luta2 = (await db.query("select * from jogo.lutas_grupo"))[0];
    assert(luta2.inimigo.hp < hpAntes, "o dano de um vale para todos");
    assert.match(texto(await enviar("?")), new RegExp(`${luta2.inimigo.hp}`), "o painel do companheiro mostra a vida compartilhada");
    // golpe final de um: vitória para os dois
    await db.query("update jogo.lutas_grupo set inimigo = jsonb_set(inimigo, '{hp}', '1')");
    let fimK = [];
    for (let k = 0; k < 10 && !/Vitória/.test(texto(fimK)); k++) fimK = await enviar("1");
    assert.match(texto(fimK), /Vitória/); assert(fimK.some((x) => /caiu![\s\S]*golpe final foi de \*Kaito Ryuen\*[\s\S]*ok/.test(x.texto ?? "")), "o companheiro é chamado para recolher a vitória");
    const rec = await noGrupo(outroPrivado("ok"));
    assert.match(texto(rec), /Vitória[\s\S]*XP/, "quem lutou junto recebe a vitória");
    assert.equal((await db.query("select count(*)::int n from jogo.batalhas where status <> 'encerrada'"))[0].n, 0);
    // sozinho continua valendo: sem companheiros, nenhuma luta de grupo é aberta
    await db.query("delete from jogo.progresso where chave = 'acomp'"); await db.query("delete from jogo.lutas_grupo");
    await db.query("update jogo.jogadores set regiao_atual = 'R-HOM-1' where id = $1", [outro.id]);
    await pendente(jogador.id);
    assert.doesNotMatch(texto(await enviar("lutar")), /companheiros foram avisados/);
    assert.equal((await db.query("select count(*)::int n from jogo.lutas_grupo"))[0].n, 0);
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'");
  });
  await t("rumo do capítulo: ir ao covil funciona com a dica copiada inteira e com ação livre; a dica não aparece em toda mensagem; mapa tem legenda", async () => {
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'"); await db.query("delete from jogo.exploracoes where pendente");
    await db.query("delete from jogo.viagens where concluida_em is null"); await db.query("delete from jogo.lutas_grupo"); await db.query("delete from jogo.ameacas");
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave in ('c:dai5', 'p:dai5', 'rumo', 'falando', 'acomp')", [jogador.id]);
    await db.query("delete from jogo.derrotas_vilao where jogador_id = $1 and vilao_id in ('V017', 'V018')", [jogador.id]);
    await db.query("insert into jogo.progresso (jogador_id, chave, valor) values ($1, 'p:dai5', '1')", [jogador.id]);
    await db.query("update jogo.jogadores set regiao_atual = 'R-DAI-5', local_atual = null, hp = hp_max where id = $1", [jogador.id]);
    clock += 60_000;
    const copiado = await enviar("ir Ninhos no Trigal (e depois lutar)");
    assert.match(texto(copiado), /Ninhos no Trigal[\s\S]*Rato-Toupeira[\s\S]*lutar/, "a dica copiada com parênteses leva ao covil e mostra o vilão");
    await enviar("recuar"); clock += 60_000;
    const pedidos = [];
    jogo = novoJogo({ nome: "falsa", async gerarJSON(a) { pedidos.push(a); return { ok: true, provedor: "falsa", dados: { narracao: "O trigo balança.", eventos: [] } }; } });
    const livre = await enviar("> vou até os ninhos no trigal ver o que tem lá");
    assert.match(texto(livre), /Rato-Toupeira[\s\S]*lutar/, "ação livre que pede o lugar do passo vai de verdade até lá");
    assert.equal(pedidos.length, 0, "não gastou narração para isso");
    await enviar("recuar");
    // a dica aparece na 1ª narração do passo e depois só a cada 4
    const dicas = [];
    for (let k = 0; k < 5; k++) { clock += 60_000; dicas.push(/A história continua com:_ \*ir Ninhos no Trigal\*/.test(texto(await enviar("> olho o céu por um tempo")))); }
    assert.deepEqual(dicas, [true, false, false, false, true]);
    jogo = novoJogo();
    const mp = await enviar("mapa");
    assert(mp[0].imagem && /Você está em Planícies Kogane[\s\S]*Homura[\s\S]*5 Planícies Kogane/.test(mp[0].legenda), "o mapa vem com a legenda dos números");
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave in ('p:dai5', 'rumo')", [jogador.id]);
  });
  await t("mestre tesouros: mapa e legenda dos Grandes Itens, núcleos, santuários e pergaminho, com quem está com cada um; só o mestre vê", async () => {
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'excalibur', 'equipamento', 1, '{}') on conflict do nothing`, [outro.id]);
    const r = await noGrupo(adminPrivado("mestre tesouros"));
    assert(r[0].imagem?.length > 5000 && !doGrupo(r).length);
    assert.match(texto(r), /Os 4 Grandes Itens[\s\S]*Excalibur: com \*Rin[\s\S]*Tenmon no Tama: ainda em[\s\S]*Grimório dos Quatro Céus[\s\S]*núcleos da Árvore-Estrela[\s\S]*Santuários de pet[\s\S]*Mestra Tsuchi/);
    assert.doesNotMatch(texto(await noGrupo(outroPrivado("mestre tesouros"))), /Tesouros do mundo/);
    await db.query("delete from jogo.inventario where jogador_id = $1 and item_id = 'excalibur'", [outro.id]);
  });
  await t("grimórios: 40 no jogo, achados explorando ou pelo mestre; abrir respeita classe, nível e limite; as magias entram no menu da luta e funcionam", async () => {
    const G = await import("../src/regras/grimorios.mjs");
    const { criarGrimorios } = await import("../src/servidor/grimorios.mjs");
    assert.equal(G.GRIMORIOS.size, 40);
    for (const g of G.GRIMORIOS.values()) { assert(g.regiao, `${g.id} tem região`); assert(g.magias.some((m) => !m.utilitaria), `${g.id} tem magia de batalha`); }
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'"); await db.query("delete from jogo.exploracoes where pendente");
    await db.query("delete from jogo.grimorios_jogador"); await db.query("delete from jogo.lutas_grupo"); await db.query("delete from jogo.viagens where concluida_em is null");
    await db.query("update jogo.jogadores set classe = 'Mago', nivel = 20, hp = hp_max, mp = 200, mp_max = 200, regiao_atual = 'R-HOM-3', local_atual = null where id = $1", [jogador.id]);
    assert.match(texto(await enviar("grimorios")), /ainda não tem nenhum grimório/);
    // explorando na região onde ele está escondido
    const gr = criarGrimorios({ db, rng: () => 0 });
    const achou = await gr.aoExplorar(await atual(), "pv");
    assert.match(texto(achou), /encontrou um grimório[\s\S]*Caderno de Faíscas do Mineiro[\s\S]*Faísca/);
    assert.deepEqual(await criarGrimorios({ db, rng: () => 0.99 }).aoExplorar(await atual(), "pv"), [], "nem toda exploração acha");
    // pelo mestre, sem citar o mestre
    const dado = await noGrupo(adminPrivado("mestre grimorio Kaito 8"));
    assert(dado.some((x) => /encontrou um grimório[\s\S]*Ignição Absoluta/.test(x.texto ?? "")) && /Feito/.test(dado.at(-1).texto) && !doGrupo(dado).length);
    await noGrupo(adminPrivado("mestre grimorio Kaito 2")); await noGrupo(adminPrivado("mestre grimorio Kaito 5")); await noGrupo(adminPrivado("mestre grimorio Kaito 9")); await noGrupo(adminPrivado("mestre grimorio Kaito 17"));
    assert.match(texto(await noGrupo(adminPrivado("mestre grimorios"))), /\*01\* Caderno de Faíscas[\s\S]*com Kaito Ryuen/);
    const lista = texto(await enviar("grimorios"));
    assert.match(lista, /Seus grimórios[\s\S]*0 de 3 abertos \(Mago\)[\s\S]*6 de 40/);
    // regras para abrir
    assert.match(texto(await enviar("abrir grimorio manual do duelista")), /foi escrito para: Espadachim, Cavaleiro, Paladino/);
    assert.match(texto(await enviar("abrir grimorio g08")), /nível 45/);
    assert.match(texto(await enviar("abrir grimorio 1")), /Você abre \*Caderno de Faíscas[\s\S]*Faísca[\s\S]*menu das suas lutas/);
    await enviar("abrir grimorio pergaminho da fenix"); await enviar("abrir grimorio g09");
    assert.match(texto(await enviar("abrir grimorio g17")), /3 grimórios abertos de cada vez/);
    assert.match(texto(await enviar("fechar grimorio g09")), /fecha/);
    // na luta: as magias aparecem no menu e causam efeito
    await db.query(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em) values ($1, $2, 'R-HOM-3', 'encontro', $3, true, $4)`,
      [jogador.id, `g:${clock}`, JSON.stringify({ inimigo: { id: "V001", nome: "x", nivel: 20 }, lacaio: true }), new Date(clock)]);
    const luta = texto(await enviar("lutar"));
    assert.match(luta, /Faísca — _magia de força 1 · 4 de mana_[\s\S]*Penas Ardentes[\s\S]*Calor Restaurador/);
    const nFaisca = luta.match(/\*(\d+)\* Faísca/)[1];
    const b0 = (await db.query("select estado from jogo.batalhas where status <> 'encerrada'"))[0].estado;
    let usou = "";
    for (let k = 0; k < 6 && !/Faísca|Vitória/.test(usou); k++) usou = texto(await enviar(nFaisca));
    assert.match(usou, /Faísca|Vitória/);
    const b1 = (await db.query("select estado from jogo.batalhas order by id desc limit 1"))[0].estado;
    assert(b1.jogador.mp < b0.jogador.mp || /Vitória/.test(usou), "a magia do grimório gasta mana");
    await db.query("update jogo.batalhas set status = 'encerrada' where status <> 'encerrada'");
    // Anti-magia só lê os do Vazio
    assert.match(G.podeLer({ classe: "Anti-magia", nivel: 99 }, G.GRIMORIOS.get("G01")), /só consegue ler grimórios do Vazio/);
    assert.equal(G.podeLer({ classe: "Anti-magia", nivel: 99 }, G.GRIMORIOS.get("G32")), null);
  });
  await t("Olhos da Terra: a mestra entrega o pergaminho a quem é da terra; ler cega e dá as habilidades; admin também concede", async () => {
    await db.query("update jogo.jogadores set regiao_atual = 'R-DAI-6', local_atual = null, atributo_magico = 'Fogo (Chama)', reino = 'Homura' where id = $1", [jogador.id]);
    await enviar("falar tsuchi"); clock += 7 * 3_600_000;
    assert.match(texto(await enviar("falar tsuchi")), /não têm raiz/);
    await db.query("update jogo.jogadores set atributo_magico = 'Terra (Rocha)' where id = $1", [jogador.id]);
    clock += 7 * 3_600_000;
    const g = await enviar("falar mestra tsuchi");
    assert(g[0].imagem?.length > 1000, "retrato da NPC na conversa");
    assert.match(texto(g), /Pergaminho dos Olhos da Terra/);
    assert.match(texto(await enviar("itens")), /Pergaminho dos Olhos da Terra[\s\S]*fica cego para sempre/);
    assert.match(texto(await enviar("usar pergaminho")), /não tem volta/);
    assert.match(texto(await enviar("fechar o pergaminho")), /continua na sua bolsa/);
    await enviar("usar pergaminho");
    const a = await enviar("aceitar a terra");
    assert.match(texto(a), /Onda Sísmica/); assert(doGrupo(a).some((x) => /Olhos da Terra/.test(x.texto)));
    assert((await atual()).avatar_dna.acessorios.includes("venda-olhos"));
    assert.equal((await db.query("select count(*)::int n from jogo.inventario where jogador_id = $1 and item_id = 'pergaminho-terra'", [jogador.id]))[0].n, 0);
    assert.match(texto(await enviar("habilidades")), /Olhos da Terra[\s\S]*Ler o Chão/);
    assert.match(texto(await noGrupo(outroGrupo("conceder terra Kaito"))), /Só um administrador/);
    const c = await noGrupo(grupo("conceder terra Rin", true));
    assert.match(texto(c), /Rin\* fechou os olhos/); assert(c.some((x) => /A terra te escolheu/.test(x.texto)));
    assert.match(texto(await noGrupo(grupo("conceder terra Rin", true))), /já tem os Olhos da Terra/);
  });
  await t("comando dado envia o infográfico no privado e no grupo", async () => {
    const pv = await enviar("dado"); assert(pv[0].imagem?.length > 20000 && /falha[\s\S]*pressão/.test(pv[0].legenda));
    assert((await noGrupo(outroGrupo("dado")))[0].imagem?.length > 20000);
  });
  await t("final: derrotar o Rei do Eclipse coroa o Seiō e anuncia no grupo", async () => {
    await db.query(`insert into jogo.progresso (jogador_id, chave) select $1, 'b:' || x from unnest($2::text[]) x on conflict do nothing`,
      [jogador.id, ["reis-antigos", "descida", "kanata", "ninho", "poco", "muralha", "rosto", "arco-homura", "arco-watatsumi", "arco-daichi", "arco-fujin"]]);
    for (const id of ["excalibur", "kokugai", "tenmon"]) await db.query("insert into jogo.inventario (jogador_id, item_id, tipo, qtd) values ($1, $2, 'equipamento', 1) on conflict do nothing", [jogador.id, id]);
    await db.query("update jogo.jogadores set regiao_atual = 'R-KOK-6', local_atual = null, corrupcao = 0 where id = $1", [jogador.id]);
    await db.query("delete from jogo.exploracoes where jogador_id = $1", [jogador.id]);
    await forte(", nivel = 100");
    const a = await matar("esquife");
    assert(doGrupo(a.f).some((x) => /UM DEUS CAIU/.test(x.legenda ?? x.texto)), "queda de divindade com imagem e impacto: " + texto(a.a).slice(0, 300) + " // " + texto(a.f).slice(0, 400));
    await forte(", nivel = 100");
    const b = await matar("esquife");
    assert.match(texto(b.f), /Rei-Estrela/); assert.match(texto(b.f), /final estelar/);
    assert(doGrupo(b.f).some((x) => /O ECLIPSE ACABOU/.test(x.legenda ?? x.texto)));
    assert.equal((await db.query("select final from jogo.mundos where id = $1", [jogador.mundo_id]))[0].final, "estelar");
    assert.match((await atual()).titulo, /Seiō/);
    assert.match(texto(await enviar("feitos")), /ECLIPSE|DEUS|Rei/i);
  });
  await t("resetar-jogador funciona por nome, por número digitado e por menção", async () => {
    assert.match(texto(await noGrupo(grupo("resetar-jogador", false))), /Só um administrador/);
    assert.match(texto(await noGrupo(grupo("resetar-jogador Ninguém", true))), /Não achei/);
    const s = await noGrupo(grupo(`resetar-jogador ${jogador.nome}`, true));
    assert.match(texto(s), /apagado das estrelas/);
    assert.equal((await db.query("select count(*)::int n from jogo.jogadores where id = $1", [jogador.id]))[0].n, 0);
    assert.equal((await db.query("select count(*)::int n from jogo.progresso where jogador_id = $1", [jogador.id]))[0].n, 0);
  });
  console.log(`  ${total} verificações do mundo vivo passaram.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await testarDadosDoMundo();
  console.log(`${total} verificações de dados do mundo passaram.`);
}
