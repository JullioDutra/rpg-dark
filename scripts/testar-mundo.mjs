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
    clock += 60_000; await enviar("> olho o porto procurando o navio estranho");
    const ctx = pedidos.at(-1).mensagens.at(-1).content;
    assert.match(ctx, /O Navio sem Tripulação/); assert.match(ctx, /passo_atual/); assert.match(ctx, /FICA neste passo/);
    assert.match(pedidos.at(-1).sistema, /Capitão Gorō/);
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
    assert.match(texto(r), /Duelo — Rin × Kaito Ryuen/); assert.match(texto(r), /🎲/); assert.match(texto(r), /vence/);
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
