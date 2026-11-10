import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { criarJogo } from "../src/servidor/jogo.mjs";
import { imagemMapa } from "../src/servidor/exploracao.mjs";
import { REGIOES, REGIAO, MUNDO, ANIMAIS, CHANCES_BASE, chancesExploracao, sortearCategoria,
  recuperarVigor, rota, vizinhos, buscarRegioes, duracaoViagem, comandoExploracao, faunaDaRegiao } from "../src/regras/exploracao.mjs";

const texto = (s) => s.map((x) => x.texto ?? x.legenda ?? "").join("\n");
let total = 0;
const t = async (nome, fn) => { await fn(); total++; console.log(`  ✔ exploração: ${nome}`); };

export async function testarRegrasExploracao() {
  await t("36 regiões e grafo sem destinos inexistentes", () => {
    assert.equal(REGIOES.length, 36);
    for (const [a, b] of MUNDO.conexoes) { assert(REGIAO.has(a)); assert(REGIAO.has(b)); assert(vizinhos(a).includes(b)); assert(vizinhos(b).includes(a)); }
    for (const r of REGIOES) assert(rota("R-HOM-1", r.id, new Set(["A3-M1"])));
  });
  await t("rotas mínimas respeitam os bloqueios da história", () => {
    assert.deepEqual(rota("R-HOM-3", "R-HOM-5"), ["R-HOM-3", "R-HOM-1", "R-HOM-2", "R-HOM-5"]);
    assert.equal(rota("R-KOK-2", "R-KOK-7"), null);
    assert.deepEqual(rota("R-KOK-2", "R-KOK-7", new Set(["A3-M1"])), ["R-KOK-2", "R-KOK-7"]);
    assert.equal(rota("invalida", "R-HOM-1"), null);
  });
  await t("IDs, nomes sem acento, abreviações e ambiguidades", () => {
    assert.equal(buscarRegioes("r-hom-3")[0].nome, "Deserto de Haijin");
    assert.equal(buscarRegioes("Ryugu-jo")[0].id, "R-WAT-1");
    assert.equal(buscarRegioes("Haijin").length, 1);
    assert(buscarRegioes("Floresta").length > 1);
    assert.equal(buscarRegioes("").length, 0);
  });
  await t("comandos e linguagem natural; > permanece ação livre", () => {
    assert.equal(comandoExploracao("!explorar").tipo, "explorar");
    assert.equal(comandoExploracao("/viajar R-HOM-1").alvo, "r-hom-1");
    assert.equal(comandoExploracao("olho em volta").tipo, "explorar");
    assert.equal(comandoExploracao("vou para o Lago Kagami").alvo, "R-WAT-2");
    assert.equal(comandoExploracao("> explorar com 1000% de sorte"), null);
    assert.equal(comandoExploracao("me dê 1000 de vigor"), null);
  });
  await t("sorteio base e limites das seis faixas", () => {
    assert.deepEqual(chancesExploracao(), CHANCES_BASE);
    for (const [n, tipo] of [[0, "encontro"], [.39999, "encontro"], [.40, "descoberta"], [.55, "achado"], [.70, "evento"], [.85, "fauna"], [.95, "nada"]])
      assert.equal(sortearCategoria(CHANCES_BASE, () => n), tipo);
    const base = chancesExploracao();
    assert(chancesExploracao({ sorte: 60 }).encontro < base.encontro);
    assert(chancesExploracao({ eclipse: 100 }).encontro > base.encontro);
    assert(chancesExploracao({ perigo: "extremo" }).encontro > base.encontro);
    for (const perigo of ["baixo", "médio", "alto", "muito alto", "extremo", "divino"]) for (const sorte of [0, 10, 10000]) {
      const p = chancesExploracao({ perigo, sorte, eclipse: 100 });
      assert(Object.values(p).every((v) => v > 0));
      assert(Math.abs(Object.values(p).reduce((a, b) => a + b, 0) - 100) < 1e-9);
    }
  });
  await t("vigor preserva fração de hora e respeita teto/relogin", () => {
    const inicio = Date.UTC(2026, 0, 1), j = { vigor: 20, vigor_em: new Date(inicio) };
    assert.equal(recuperarVigor(j, inicio + 3_600_000).vigor, 30);
    let p = recuperarVigor(j, inicio + 359_999);
    assert.equal(p.vigor, 20); assert.equal(+p.vigor_em, inicio);
    p = recuperarVigor(p, inicio + 360_000);
    assert.equal(p.vigor, 21);
    p = recuperarVigor(j, inicio + 12 * 3_600_000);
    assert.equal(p.vigor, 100); assert.equal(+p.vigor_em, inicio + 12 * 3_600_000);
    assert.equal(recuperarVigor({ ...p, vigor: 85 }, +p.vigor_em).vigor, 85);
    assert.equal(recuperarVigor(j, inicio - 1000).vigor, 20);
  });
  await t("somente montarias reconhecidas reduzem viagem; fauna não entrega epílogo", () => {
    assert.equal(duracaoViagem(null), 600_000);
    assert.equal(duracaoViagem("inventada"), 600_000);
    assert.equal(duracaoViagem("AN01"), 600_000);
    for (const a of ANIMAIS.filter((a) => a.tipo === "montaria")) assert.equal(duracaoViagem(a.id), 300_000);
    assert(!faunaDaRegiao(REGIAO.get("R-KOK-8")).some((a) => a.id === "AN34"));
  });
  await t("mapas PNG não vazam marcadores entre jogadores", () => {
    const a = imagemMapa("R-HOM-3"), b = imagemMapa("R-WAT-2");
    assert.equal(a.subarray(1, 4).toString(), "PNG");
    assert(!a.equals(b)); assert(a.equals(imagemMapa("R-HOM-3")));
    assert.equal(a.readUInt32BE(16), 960); assert.equal(a.readUInt32BE(20), 720);
    for (const reino of MUNDO.reinos) assert(imagemMapa(reino.regioes[0].id, reino.id).length > 1000);
  });
}

/** Chamado pelo teste de servidor, com personagem criado pelo fluxo real de mensagens. */
export async function testarExploracaoServidor({ db, jogador, mensagem, grupo }) {
  let clock = Date.now(), numeros = [];
  const rng = () => numeros.shift() ?? .99;
  const novoJogo = () => criarJogo({ db, rng, agora: () => clock });
  let jogo = novoJogo();
  const msg = (txt) => ({ ...mensagem(txt), quando: clock });
  const enviar = (txt) => jogo.processar(msg(txt));
  const atual = async () => (await db.query("select * from jogo.jogadores where id = $1", [jogador.id]))[0];
  const limpar = async (regiao = "R-HOM-3", vigor = 100) => {
    clock += 4000; numeros = [];
    await db.query("delete from jogo.batalhas where id in (select batalha_id from jogo.participantes_batalha where jogador_id = $1)", [jogador.id]);
    await db.query("delete from jogo.exploracoes where jogador_id = $1", [jogador.id]);
    await db.query("delete from jogo.viagens where jogador_id = $1", [jogador.id]);
    await db.query("delete from jogo.descobertas where jogador_id = $1", [jogador.id]);
    await db.query("delete from jogo.inventario where jogador_id = $1", [jogador.id]);
    await db.query(`update jogo.jogadores set regiao_atual = $2, vigor = $3, vigor_em = $4,
      exploracao_em = null, ryo = 0, montaria_id = null, estado = 'ativo', nivel = 1 where id = $1`, [jogador.id, regiao, vigor, new Date(clock)]);
  };
  await t("migração aditiva e RLS", async () => {
    const tables = await db.query("select tablename from pg_tables where schemaname = 'jogo' and not rowsecurity");
    assert.equal(tables.length, 0);
    assert.equal((await atual()).ryo, "0");
  });
  await t("personagem existente converte região pelo nome e consulta mapa", async () => {
    // A criação já grava o ID; simula um personagem antigo que guardava o NOME da região.
    assert(REGIAO.has(jogador.regiao_atual));
    await db.query("update jogo.jogadores set regiao_atual = $2 where id = $1", [jogador.id, REGIAO.get(jogador.regiao_atual).nome]);
    const s = await enviar("mapa"); assert(s.some((x) => x.imagem));
    assert(REGIAO.has((await atual()).regiao_atual));
  });
  await t("grupo orienta ao privado sem gastar vigor", async () => {
    await limpar(); const s = await jogo.processar({ ...grupo("!explorar"), quando: clock });
    assert.match(texto(s), /privado/); assert.equal((await atual()).vigor, 100);
  });
  await t("destino inválido, distante, atual ou ambíguo não gasta vigor", async () => {
    await limpar();
    for (const alvo of ["Atlântida", "R-WAT-7", "R-HOM-3", "floresta", ""]) await enviar(`viajar ${alvo}`);
    assert.equal((await atual()).vigor, 100);
    assert.equal((await db.query("select * from jogo.viagens where jogador_id = $1", [jogador.id])).length, 0);
    assert.match(texto(await enviar("rota R-HOM-5")), /45 de vigor · 30 min/);
  });
  await t("viagem cobra uma vez, impede exploração e sobrevive a reinício", async () => {
    await limpar();
    const m = msg("viajar R-HOM-1");
    assert.match(texto(await jogo.processar(m)), /10 min/);
    assert.equal((await jogo.processar(m)).length, 0);
    assert.equal((await atual()).vigor, 85);
    assert.equal((await atual()).regiao_atual, "R-HOM-3");
    assert.match(texto(await enviar("explorar")), /ainda está na estrada/);
    jogo = novoJogo(); clock += 599_999;
    assert.match(texto(await enviar("viagem")), /ainda está na estrada/);
    clock++;
    const s = await enviar("viagem");
    assert.match(texto(s), /Você chega a/); assert(s.some((x) => x.imagem));
    assert.equal((await atual()).regiao_atual, "R-HOM-1");
    assert.equal((await atual()).vigor, 86);
    assert.doesNotMatch(texto(await enviar("viagem")), /Você chega a/);
  });
  await t("evento de estrada persistido aparece só uma vez, no prazo", async () => {
    await limpar(); numeros = [.1, 0]; await enviar("viajar R-HOM-1");
    jogo = novoJogo(); clock += 600_000;
    assert.match(texto(await enviar("ficha")), /chuva fina/);
    assert.doesNotMatch(texto(await enviar("ficha")), /chuva fina/);
  });
  await t("montaria reduz a viagem para 5 min sem reduzir o custo", async () => {
    await limpar(); await db.query("update jogo.jogadores set montaria_id = 'AN18' where id = $1", [jogador.id]);
    assert.match(texto(await enviar("viajar R-HOM-1")), /5 min/);
    assert.equal((await atual()).vigor, 85); clock += 300_000;
    assert.match(texto(await enviar("viagem")), /Você chega a/);
  });
  await t("passagem selada só abre com marco concluído deste mundo/jogador", async () => {
    await limpar("R-KOK-2");
    assert.match(texto(await enviar("viajar R-KOK-7")), /névoa fecha o caminho/);
    assert.equal((await atual()).vigor, 100);
    await db.query("insert into jogo.marcos (mundo_id, jogador_id, marco_id) values ($1, $2, 'A3-M1')", [jogador.mundo_id, jogador.id]);
    assert.match(texto(await enviar("rota R-KOK-7")), /névoa fecha o caminho/);
    await db.query("update jogo.marcos set status = 'concluido' where jogador_id = $1 and marco_id = 'A3-M1'", [jogador.id]);
    assert.match(texto(await enviar("viajar R-KOK-7")), /pega a estrada/);
    await db.query("delete from jogo.marcos where jogador_id = $1 and marco_id = 'A3-M1'", [jogador.id]);
  });
  await t("vigor insuficiente não cria viagem nem evento", async () => {
    await limpar("R-HOM-3", 9);
    assert.match(texto(await enviar("explorar")), /precisa descansar/);
    assert.match(texto(await enviar("viajar R-HOM-1")), /precisa descansar/);
    assert.equal((await atual()).vigor, 9);
    clock += 360_000; numeros = [.99];
    assert.match(texto(await enviar("explorar")), /recupera o fôlego/);
    assert.equal((await atual()).vigor, 5);
  });
  await t("achado em dinheiro tem origem registrada e não duplica por mensagem", async () => {
    await limpar(); numeros = [.60, .1, 0];
    const m = msg("explorar");
    assert.match(texto(await jogo.processar(m)), /5 ryō/);
    await jogo.processar(m);
    assert.equal((await atual()).ryo, "5"); assert.equal((await atual()).vigor, 90);
    const es = await db.query("select * from jogo.exploracoes where jogador_id = $1", [jogador.id]);
    assert.equal(es.length, 1); assert.equal(es[0].dados.recompensa.ryo, 5);
    assert.match(texto(await enviar("inventario")), /5 ryō/);
  });
  await t("materiais acumulam no inventário com auditoria", async () => {
    await limpar();
    for (let i = 0; i < 2; i++) { clock += 4000; numeros = [.60, .99]; await enviar("explorar"); }
    const itens = await db.query("select * from jogo.inventario where jogador_id = $1", [jogador.id]);
    assert.equal(itens.length, 1); assert.equal(itens[0].qtd, 2);
    assert.match(texto(await enviar("inventario")), /obsidiana ×2/);
  });
  await t("descoberta guarda localização sem entregar segredos da masmorra", async () => {
    await limpar(); numeros = [.48, 0];
    const s = await enviar("explorar");
    assert.match(texto(s), /entrada de/); assert.doesNotMatch(texto(s), /menino carregando um ovo/);
    const ds = await db.query("select * from jogo.descobertas where jogador_id = $1 and tipo = 'subfase'", [jogador.id]);
    assert.equal(ds.length, 1); assert.equal(ds[0].referencia, "SF-HOM-01");
    assert.match(texto(await enviar("descobertas")), /Obsidiana/);
    clock += 4000; numeros = [.48, 0]; await enviar("explorar");
    assert.equal((await db.query("select * from jogo.descobertas where jogador_id = $1 and referencia = 'SF-HOM-01'", [jogador.id])).length, 1);
  });
  await t("encontro perigoso avisa; recuar encerra; enfrentar abre o combate", async () => {
    await limpar(); numeros = [0, .99];
    assert.match(texto(await enviar("explorar")), /corvo/);
    assert.match(texto(await enviar("viajar R-HOM-1")), /recuar/);
    assert.match(texto(await enviar("recuar")), /recua devagar/);
    assert.equal((await atual()).vigor, 90);
    assert.equal((await db.query("select * from jogo.exploracoes where jogador_id = $1 and pendente", [jogador.id])).length, 0);
  });
  await t("evento persiste após reinício; ajudar concede uma única recompensa", async () => {
    await limpar(); numeros = [.80]; await enviar("explorar"); jogo = novoJogo();
    assert.match(texto(await enviar("explorar")), /carroça tombada/);
    assert.equal((await atual()).vigor, 90);
    const ss = await Promise.all([enviar("1"), enviar("ajudar")]);
    assert.equal((await atual()).ryo, "5");
    assert.equal(ss.filter((s) => /umas moedas/.test(texto(s))).length, 1);
  });
  await t("seguir encerra evento sem recompensa", async () => {
    await limpar(); numeros = [.80]; await enviar("explorar");
    assert.match(texto(await enviar("2")), /segue seu caminho/);
    assert.equal((await atual()).ryo, "0");
  });
  await t("fauna regional observa sem conceder pet nem atributos", async () => {
    await limpar(); numeros = [.92, 0]; const antes = await atual();
    assert.match(texto(await enviar("explorar")), /Escaravelho-Obsidiana/);
    assert.deepEqual((await atual()).atributos, antes.atributos);
    assert.equal((await atual()).ryo, "0");
  });
  await t("duas explorações simultâneas não duplicam gasto/recompensa", async () => {
    await limpar(); numeros = [.60, .1, 0, .60, .1, 0];
    const ss = await Promise.all([enviar("explorar"), enviar("explorar")]);
    assert.equal((await atual()).vigor, 90); assert.equal((await atual()).ryo, "5");
    assert.equal(ss.filter((s) => /Respire um pouco/.test(texto(s))).length, 1);
  });
  await t("duas viagens simultâneas geram um único prazo", async () => {
    await limpar(); await Promise.all([enviar("viajar R-HOM-1"), enviar("viajar R-HOM-6")]);
    assert.equal((await atual()).vigor, 85);
    assert.equal((await db.query("select * from jogo.viagens where jogador_id = $1 and concluida_em is null", [jogador.id])).length, 1);
  });
  await t("falha ao registrar resultado desfaz gasto e recompensa juntos", async () => {
    await limpar(); numeros = [.60, .1, 0];
    const dbFalho = { ...db, script: (fn) => db.script((q) => fn(async (sql, params) => {
      if (sql.includes("insert into jogo.exploracoes")) throw new Error("falha simulada no registro");
      return q(sql, params);
    })) };
    const falho = criarJogo({ db: dbFalho, rng, agora: () => clock });
    await assert.rejects(falho.processar(msg("explorar")), /falha simulada/);
    assert.equal((await atual()).vigor, 100); assert.equal((await atual()).ryo, "0");
    assert.equal((await db.query("select * from jogo.exploracoes where jogador_id = $1", [jogador.id])).length, 0);
  });
  await t("personagem congelado não explora nem viaja", async () => {
    await limpar(); await db.query("update jogo.jogadores set estado = 'congelado' where id = $1", [jogador.id]);
    assert.match(texto(await enviar("explorar")), /suspensa/);
    assert.match(texto(await enviar("viajar R-HOM-1")), /suspensa/);
    assert.equal((await atual()).vigor, 100);
  });
  await t("batalha ativa impede ações fora de combate", async () => {
    await limpar();
    const [b] = await db.query("insert into jogo.batalhas (mundo_id, tipo, canal_wa_id, estado) values ($1, 'solo', 'teste', '{}') returning id", [jogador.mundo_id]);
    await db.query("insert into jogo.participantes_batalha (batalha_id, jogador_id) values ($1, $2)", [b.id, jogador.id]);
    assert.match(texto(await enviar("explorar")), /meio de uma luta/);
    assert.match(texto(await enviar("viajar R-HOM-1")), /meio de uma luta/);
    assert.equal((await atual()).vigor, 100); await db.query("delete from jogo.batalhas where id = $1", [b.id]);
  });
  await limpar();
  console.log(`  ${total} verificações de exploração passaram.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await testarRegrasExploracao();
  console.log(`${total} verificações de exploração passaram.`);
}
