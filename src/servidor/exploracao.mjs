import { readFileSync } from "node:fs";
import {
  MUNDO, REGIAO, SUBFASES, MATERIAIS, normal, comandoExploracao, buscarRegioes,
  vizinhos, liberada, rota, recuperarVigor, duracaoViagem, chancesExploracao,
  sortearCategoria, escolher, inimigosDaRegiao, faunaDaRegiao, CUSTO_VIGOR,
} from "../regras/exploracao.mjs";
import { desenharMapa, finalizar, rotuloReinos, recortar, RECORTES } from "../mapa/mapa.mjs";
import { Tela } from "../avatar/pixel.mjs";
import { textoRegiao, ambiente, rodape } from "./textos.mjs";

let baseMapa;
export function imagemMapa(regiao, reino = null) {
  baseMapa ??= desenharMapa().t;
  // Nunca desenhar marcadores no cache compartilhado entre jogadores.
  const t = new Tela(baseMapa.w, baseMapa.h);
  t.px = baseMapa.px.slice();
  finalizar(t, MUNDO.conexoes, { titulo: !reino, marcadores: [{ regiao, rotulo: "VOCE" }] });
  if (reino) return recortar(t, RECORTES[reino]).png(8);
  rotuloReinos(t);
  return t.png(5);
}

const minutos = (ms) => Math.max(1, Math.ceil(ms / 60_000));
const nomeRegiao = (id) => REGIAO.get(id)?.nome ?? id;
const MATERIAL = Object.fromEntries(Object.values(MATERIAIS).map((m) => [m.id, m.nome]));

export function criarExploracao({ db, rng, agora }) {
  async function executar(q, jogadorId, msg) {
    // Todas as alterações de exploração deste jogador seguem a mesma trava.
    const j = (await q("select * from jogo.jogadores where id = $1 for update", [jogadorId]))[0];
    const saidas = [];
    const dizer = (texto) => saidas.push({ para: msg.chat, texto });
    const mapa = (reino = null) => saidas.push({ para: msg.chat, regiaoMapa: j.regiao_atual, reinoMapa: reino,
      legenda: `🗺️ *${nomeRegiao(j.regiao_atual)}*\n${rodape("viajar <região> · rota <região>")}` });
    const cmd = comandoExploracao(msg.texto);
    const resultado = (tratado = true) => ({ jogador: j, saidas, tratado });
    if (!j) return resultado(false);
    if (j.estado !== "ativo") {
      if (cmd) dizer("Sua jornada está suspensa neste estado. Você ainda pode consultar sua *ficha*.");
      return resultado(!!cmd);
    }
    const tempo = agora();
    const iso = new Date(tempo);
    // Compatibilidade: a criação original gravava o NOME da região, não seu ID.
    if (!REGIAO.has(j.regiao_atual)) {
      const [r] = buscarRegioes(j.regiao_atual ?? "");
      if (!r) { if (cmd) dizer("Não foi possível localizar sua região. Peça ao administrador para conferir sua ficha."); return resultado(!!cmd); }
      j.regiao_atual = r.id;
      await q("update jogo.jogadores set regiao_atual = $2 where id = $1", [j.id, r.id]);
    }
    const vigor = recuperarVigor(j, tempo);
    if (j.vigor !== vigor.vigor || +new Date(j.vigor_em) !== +vigor.vigor_em) {
      Object.assign(j, vigor);
      await q("update jogo.jogadores set vigor = $2, vigor_em = $3 where id = $1", [j.id, j.vigor, j.vigor_em]);
    }
    async function descobrir(tipo, referencia, dados = {}) {
      const rows = await q(`insert into jogo.descobertas (jogador_id, tipo, referencia, dados, criada_em)
        values ($1, $2, $3, $4, $5) on conflict do nothing returning referencia`, [j.id, tipo, referencia, JSON.stringify(dados), iso]);
      return rows.length > 0;
    }
    await descobrir("regiao", j.regiao_atual, { nome: nomeRegiao(j.regiao_atual) });
    let viagem = (await q("select * from jogo.viagens where jogador_id = $1 and concluida_em is null", [j.id]))[0];
    if (viagem && +new Date(viagem.chegada_em) <= tempo) {
      j.regiao_atual = viagem.destino;
      await q("update jogo.jogadores set regiao_atual = $2 where id = $1", [j.id, j.regiao_atual]);
      await q("update jogo.viagens set concluida_em = $2 where id = $1", [viagem.id, iso]);
      const novo = await descobrir("regiao", j.regiao_atual, { nome: nomeRegiao(j.regiao_atual) });
      dizer(`${viagem.evento ? `${viagem.evento.texto}\n\n` : ""}Você chega a *${nomeRegiao(j.regiao_atual)}*. ${ambiente(j.regiao_atual, tempo / 60_000 | 0)}`);
      if (novo) {
        dizer(textoRegiao(j.regiao_atual, { titulo: "_Primeira vez aqui._" }));
        mapa(REGIAO.get(j.regiao_atual).reino);
      }
      viagem = null;
    }
    if (!cmd) return resultado(false);
    const regiao = REGIAO.get(j.regiao_atual);
    const marcos = new Set((await q(`select marco_id from jogo.marcos where mundo_id = $1
      and (jogador_id = $2 or jogador_id is null) and status = 'concluido'`, [j.mundo_id, j.id])).map((r) => r.marco_id));
    const pendente = (await q("select * from jogo.exploracoes where jogador_id = $1 and pendente", [j.id]))[0];
    const emViagem = () => `Você ainda está na estrada para *${nomeRegiao(viagem.destino)}*.\n${rodape(`faltam cerca de ${minutos(+new Date(viagem.chegada_em) - tempo)} min`)}`;
    const gasto = async (custo) => {
      if (j.vigor < custo) {
        const espera = (custo - j.vigor) * 360_000 - (tempo - +new Date(j.vigor_em));
        dizer(`Suas pernas pesam. Você precisa descansar antes de seguir.\n${rodape(`vigor ${j.vigor}/100`, `precisa de ${custo}`, `cerca de ${minutos(espera)} min`)}`);
        return false;
      }
      if (j.exploracao_em && tempo - +new Date(j.exploracao_em) < 3000) { dizer("Calma. Respire um pouco antes do próximo passo."); return false; }
      j.vigor -= custo;
      await q("update jogo.jogadores set vigor = $2, exploracao_em = $3 where id = $1", [j.id, j.vigor, iso]);
      return true;
    };
    const adicionarMaterial = async (m) => q(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados)
      values ($1, $2, 'material', 1, $3) on conflict (jogador_id, item_id)
      do update set qtd = jogo.inventario.qtd + 1`, [j.id, m.id, JSON.stringify({ nome: m.nome })]);

    if (cmd.tipo === "vigor") {
      dizer(`${j.vigor >= 70 ? "Você se sente disposto." : j.vigor >= 30 ? "Um pouco de cansaço pesa nos ombros." : "Você está exausto."}\n${rodape(`vigor ${j.vigor}/100`, "+10 por hora", "explorar 10", "viajar 15", "lutar 0")}${viagem ? `\n\n${emViagem()}` : ""}`);
      return resultado();
    }
    if (cmd.tipo === "viagem") { dizer(viagem ? emViagem() : `Você está em *${regiao.nome}*. Nenhuma viagem em curso.`); return resultado(); }
    if (cmd.tipo === "mapa") {
      const reino = cmd.alvo && normal(cmd.alvo) !== "mundo" ? Object.keys(RECORTES).find((r) => normal(r) === normal(cmd.alvo)) : null;
      if (cmd.alvo && normal(cmd.alvo) !== "mundo" && !reino) { dizer("Use *mapa*, *mapa mundo* ou *mapa Homura/Watatsumi/Daichi/Fujin/Koku*."); return resultado(); }
      mapa(reino);
      dizer(`${viagem ? emViagem() + "\n\n" : ""}*Caminhos a partir daqui*\n${vizinhos(regiao.id).map((id) => `${nomeRegiao(id)}${liberada(REGIAO.get(id), marcos) ? "" : " _(fechado)_"}`).join("\n")}`);
      return resultado();
    }
    if (cmd.tipo === "descobertas") {
      const ds = await q("select * from jogo.descobertas where jogador_id = $1 and tipo <> 'regiao' order by criada_em desc limit 20", [j.id]);
      dizer(ds.length ? `*Lugares que você encontrou*\n${ds.map((d) => d.dados.nome).join("\n")}\n\n${rodape("as masmorras abrem em breve")}` : "Você ainda não encontrou nenhum lugar escondido. Use *explorar*.");
      return resultado();
    }
    if (cmd.tipo === "inventario") {
      const itens = await q("select * from jogo.inventario where jogador_id = $1 order by item_id limit 30", [j.id]);
      dizer(`*Sua bolsa*\n${itens.map((i) => `${i.dados?.nome ?? MATERIAL[i.item_id] ?? i.item_id} ×${i.qtd}`).join("\n") || "Vazia."}\n\n${rodape(`${j.ryo} ryō`)}`);
      return resultado();
    }
    if (["rota", "viajar"].includes(cmd.tipo)) {
      if (viagem) { dizer(emViagem()); return resultado(); }
      const destinos = buscarRegioes(cmd.alvo);
      if (destinos.length !== 1) {
        dizer(destinos.length ? `Qual destes?\n${destinos.map((r) => r.nome).join("\n")}`
          : `Para onde? Use *${cmd.tipo} <lugar>*.\nDaqui você chega a: ${vizinhos(regiao.id).map(nomeRegiao).join(", ")}.`);
        return resultado();
      }
      const destino = destinos[0];
      if (!liberada(destino, marcos)) { dizer("A névoa fecha o caminho. Ainda não é hora de ir para lá."); return resultado(); }
      if (destino.id === regiao.id) { dizer("Você já está aí."); return resultado(); }
      if (cmd.tipo === "rota") {
        const caminho = rota(regiao.id, destino.id, marcos);
        dizer(caminho ? `${caminho.map(nomeRegiao).join(" → ")}\n\n${rodape(`${caminho.length - 1} trechos`, `${(caminho.length - 1) * 15} de vigor`, `${(caminho.length - 1) * duracaoViagem(j.montaria_id) / 60_000} min`, "viaje um trecho por vez")}` : "Não há caminho aberto até lá.");
        return resultado();
      }
      if (!vizinhos(regiao.id).includes(destino.id)) { dizer(`Fica longe demais para ir direto. Veja o caminho com *rota ${destino.nome}*.`); return resultado(); }
      if (pendente) { dizer(textoPendente(pendente)); return resultado(); }
      if (await emBatalha(q, j.id)) { dizer("Você está no meio de uma luta."); return resultado(); }
      if (!(await gasto(CUSTO_VIGOR.viajar))) return resultado();
      // Evento de estrada não bloqueante, sorteado uma única vez na partida e exibido na chegada.
      const evento = rng() < 0.3 ? escolher([
        { tipo: "clima", texto: "Uma chuva fina caiu no meio do caminho. Você esperou debaixo de uma pedra até passar." },
        { tipo: "mercador", texto: "Um mercador cruzou a estrada com sua carroça e apontou as luzes do próximo povoado." },
        { tipo: "vestigios", texto: "Pegadas recentes acompanharam a estrada por um bom tempo. Você seguiu atento, sem parar." },
      ], rng) : null;
      const duracao = duracaoViagem(j.montaria_id);
      await q(`insert into jogo.viagens (jogador_id, origem, destino, partida_em, chegada_em, evento)
        values ($1, $2, $3, $4, $5, $6)`, [j.id, regiao.id, destino.id, iso, new Date(tempo + duracao), JSON.stringify(evento)]);
      dizer(`Você pega a estrada rumo a *${destino.nome}*.${j.montaria_id && duracao < 600_000 ? " Sua montaria encurta a travessia." : ""}\n\n${rodape(`${duracao / 60_000} min de viagem`, `vigor ${j.vigor}/100`, "mande qualquer mensagem depois para chegar")}`);
      return resultado();
    }
    if (["recuar", "enfrentar", "ajudar", "seguir", "escolha"].includes(cmd.tipo)) {
      if (!pendente) { dizer("Não há nada esperando por você agora. Use *explorar*."); return resultado(); }
      if (pendente.tipo === "encontro" && cmd.tipo !== "recuar") { dizer(textoPendente(pendente)); return resultado(); }
      let escolha = cmd.tipo === "escolha" ? ({ 1: "ajudar", 2: "seguir" }[cmd.alvo]) : cmd.tipo;
      if (pendente.tipo === "evento" && !["ajudar", "seguir", "recuar"].includes(escolha)) { dizer(textoPendente(pendente)); return resultado(); }
      const dados = { ...pendente.dados, escolha, recompensa: escolha === "ajudar" ? { ryo: 5 } : {} };
      if (escolha === "ajudar") { await q("update jogo.jogadores set ryo = ryo + 5 where id = $1", [j.id]); j.ryo = (BigInt(j.ryo) + 5n).toString(); }
      await q("update jogo.exploracoes set pendente = false, resolvida_em = $2, dados = $3 where id = $1", [pendente.id, iso, JSON.stringify(dados)]);
      dizer(escolha === "recuar" ? "Você recua devagar, sem dar as costas, até sair de vista." : escolha === "ajudar" ? `Juntos, vocês erguem a carroça. O viajante sorri e coloca umas moedas na sua mão.\n${rodape("+5 ryō")}` : "Você acena e segue seu caminho.");
      return resultado();
    }
    if (cmd.tipo === "explorar") {
      if (viagem) { dizer(emViagem()); return resultado(); }
      if (pendente) { dizer(textoPendente(pendente)); return resultado(); }
      if (!liberada(regiao, marcos)) { dizer("Uma força estranha te impede de avançar aqui. Ainda não é hora."); return resultado(); }
      if (await emBatalha(q, j.id)) { dizer("Você está no meio de uma luta."); return resultado(); }
      if (!(await gasto(CUSTO_VIGOR.explorar))) return resultado();
      const mundo = (await q("select relogio_eclipse from jogo.mundos where id = $1", [j.mundo_id]))[0];
      const chances = chancesExploracao({ sorte: j.atributos.SOR, perigo: regiao.perigo, eclipse: mundo.relogio_eclipse });
      const tipo = sortearCategoria(chances, rng);
      let dados = { chances }, espera = false;
      if (tipo === "encontro") {
        // Solo: inimigos comuns na maioria das vezes; elite (médio escalão) só 15% (party recomendada).
        const todos = inimigosDaRegiao(regiao), comuns = todos.filter((v) => v.tier === "comum"), elites = todos.filter((v) => v.tier !== "comum");
        const inimigo = escolher(comuns.length && (!elites.length || rng() >= 0.15) ? comuns : elites, rng);
        if (inimigo) {
          const nivel = Math.max(j.nivel, inimigo.nivel);
          dados = { ...dados, inimigo: { id: inimigo.id, nome: inimigo.nome, nivel }, perigoso: nivel >= j.nivel + 5, elite: inimigo.tier !== "comum", nivelJogador: j.nivel };
          espera = true;
          dizer(textoPendente({ tipo, dados }));
        } else dizer(`${ambiente(regiao.id, tempo)}\nMarcas de garras na pedra. Algo passou por aqui… mas já foi embora.`);
      } else if (tipo === "descoberta") {
        const conhecidas = new Set((await q("select referencia from jogo.descobertas where jogador_id = $1 and tipo = 'subfase'", [j.id])).map((d) => d.referencia));
        const subfase = escolher(SUBFASES.filter((s) => normal(s.regiao) === normal(regiao.nome) && !conhecidas.has(s.id)), rng);
        const referencia = subfase?.id ?? `mirante:${regiao.id}`;
        const nome = subfase?.nome ?? `Ponto de observação de ${regiao.nome}`;
        const nova = await descobrir(subfase ? "subfase" : "local", referencia, { nome, regiao: regiao.id });
        dados = { ...dados, referencia, nome, nova };
        dizer(subfase ? `${ambiente(regiao.id, tempo)}\nEscondida no meio do caminho, você encontra a entrada de *${nome}*. Lá dentro, só escuridão.\n${rodape(nova ? "lugar anotado nas suas descobertas" : "você já conhecia este lugar", "masmorras abrem em breve")}`
          : `Você sobe num ponto alto. Dali dá para ver as estradas de ${regiao.nome} se espalhando até o horizonte.`);
      } else if (tipo === "achado") {
        if (rng() < 0.5) {
          const ryo = 5 + Math.floor(rng() * 16);
          await q("update jogo.jogadores set ryo = ryo + $2 where id = $1", [j.id, ryo]);
          j.ryo = (BigInt(j.ryo) + BigInt(ryo)).toString();
          dados.recompensa = { ryo }; dizer(`${ambiente(regiao.id, tempo)}\nNo chão, um saquinho esquecido. Dentro, algumas moedas.\n${rodape(`+${ryo} ryō`)}`);
        } else {
          const m = MATERIAIS[regiao.reino];
          await adicionarMaterial(m); dados.recompensa = { material: m.id, qtd: 1 };
          dizer(`${ambiente(regiao.id, tempo)}\nAlgo brilha entre as pedras: *${m.nome}*. Você guarda na bolsa.\n${rodape("+1 material")}`);
        }
      } else if (tipo === "evento") {
        dados.evento = "viajante-carga"; espera = true;
        dizer(textoPendente({ tipo, dados }));
      } else if (tipo === "fauna") {
        const animal = escolher(faunaDaRegiao(regiao), rng);
        dados.animal = animal?.id ?? null;
        dizer(animal ? `Você para e prende a respiração: *${animal.nome}*.\n${animal.comportamento}.\nVocê observa de longe, sem fazer barulho.` : "Rastros frescos somem entre as pedras. A criatura não quer ser vista.");
      } else {
        j.vigor = Math.min(100, j.vigor + 5);
        await q("update jogo.jogadores set vigor = $2 where id = $1", [j.id, j.vigor]);
        dados.recompensa = { vigor: 5 }; dizer(`${ambiente(regiao.id, tempo)}\nNada acontece. Você se senta um pouco e recupera o fôlego.\n${rodape("+5 de vigor")}`);
      }
      await q(`insert into jogo.exploracoes (jogador_id, mensagem_id, regiao, tipo, dados, pendente, criada_em, resolvida_em)
        values ($1, $2, $3, $4, $5, $6, $7, $8)`, [j.id, `${msg.chat}:${msg.id}`, regiao.id, tipo, JSON.stringify(dados), espera, iso, espera ? null : iso]);
      // O vigor vai discreto no fim da última mensagem
      const ult = saidas.at(-1);
      if (ult?.texto) ult.texto = /\n_[^\n]+_$/.test(ult.texto) ? ult.texto.replace(/_$/, ` · vigor ${j.vigor}/100_`) : `${ult.texto}\n${rodape(`vigor ${j.vigor}/100`)}`;
      return resultado();
    }
    return resultado(false);
  }

  return async (jogadorId, msg) => {
    const r = await db.script(async (q) => {
      await q("begin");
      try {
        await q("set local statement_timeout = '10s'");
        const saida = await executar(q, jogadorId, msg);
        await q("commit");
        return saida;
      } catch (e) { await q("rollback"); throw e; }
    });
    // A renderização fica fora da transação para não prolongar a trava.
    r.saidas = r.saidas.map(({ regiaoMapa, reinoMapa, ...s }) => regiaoMapa ? { ...s, imagem: imagemMapa(regiaoMapa, reinoMapa) } : s);
    return r;
  };
}

async function emBatalha(q, id) {
  return (await q(`select 1 from jogo.participantes_batalha p join jogo.batalhas b on b.id = p.batalha_id
    where p.jogador_id = $1 and b.status <> 'encerrada' limit 1`, [id])).length > 0;
}
const VILOES_DESC = new Map(JSON.parse(readFileSync(new URL("../../data/viloes.json", import.meta.url), "utf8")).map((v) => [v.id, v]));
function textoPendente(p) {
  if (p.tipo === "evento") return "Na estrada, um velho tenta erguer sozinho uma carroça tombada. Ele olha para você, mas não pede nada.\n\n*1* ajudar · *2* seguir em frente";
  const v = VILOES_DESC.get(p.dados.inimigo.id);
  const aviso = p.dados.perigoso ? "⚠️ Um corvo pousa no seu ombro e grasna. Mau sinal: esse inimigo é forte demais para você.\n\n"
    : p.dados.elite ? "⚠️ Inimigo de elite. Sozinho, a luta vai ser muito difícil.\n\n" : "";
  const forte = !p.dados.perigoso && p.dados.inimigo.nivel >= (p.dados.nivelJogador ?? 99) + 3 ? "parece mais forte que você" : null;
  return `${aviso}${v?.descricao ? `${v.descricao}\n` : ""}*${v?.nome_completo ?? p.dados.inimigo.nome}* bloqueia o caminho.\n\n*lutar* · *recuar*\n${rodape(`nível ${p.dados.inimigo.nivel}`, forte)}`;
}
