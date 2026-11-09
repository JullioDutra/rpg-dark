// Interpretador de mensagens do jogador → intenção estruturada.
//
// Camadas (da mais barata para a mais cara):
//   0. Fora do personagem "(( ))", mensagens vazias
//   1. Segurança: pedido de atributo / tentativa de manipular o bot (resposta fixa, nunca vai para a IA)
//   2. Comando explícito "!comando args"
//   3. Códigos curtos de batalha (a, m1, h2, d, i pocao, p Aya, t, pet, f, ?)
//   4. Número sozinho em menu
//   5. Ação livre "> texto" (vai para a IA + Juiz de Táticas)
//   6. Fala natural: padrões por intenção + entidades (regiões, itens, alvos, aliados, NPCs) com tolerância a erro
//   7. Sem certeza: pede esclarecimento com opções (batalha) ou manda para a IA como ação livre (cena)
//
// Saída: { intencao, entidades, confianca (0–1), origem, texto, sugestoes? }
import { normalizar, semAcento, distancia } from "./normalizar.mjs";
import { INTENCOES, COMANDOS, ORDINAIS, ITENS_COMUNS } from "./intencoes.mjs";

const PEDIDO_ATRIBUTO = /\b(me )?(da|de|dar|da me|aumenta|aumentar|coloca|colocar|bota|botar|seta|setar|adiciona|adicionar|quero|libera|liberar|gera|gerar|muda|mudar|altera|alterar|sobe|subir)\b.{0,30}\b(\d+\s*)?(de )?(forca|for|defesa|def|mana|vida|hp|mp|nivel|experiencia|atributo|atributos|status|ouro|ryo|dinheiro|moedas|lendario|excalibur|amuleto|xp|level|velocidade|sorte|magia|mag)\b/;
const NUMERO_GRANDE = /\b\d{3,}\b/;
// Pedido de BUFF de habilidade/arma/magia para a IA ("deixa minha magia mais forte", "faz meu golpe dar o dobro")
const PEDIDO_BUFF = /\b(deixa|deixe|faz|faca|faz com que|torna|torne|coloca|bota|aumenta|aumente|melhora|melhore|buffa|buffar|buff|fortalece|fortaleca|potencializa|turbina|upa|upar|dobra|dobre|triplica|evolui|evolua|considera que|considere que|imagina que|finge que)\b.{0,25}\b(minha|meu|a minha|o meu|minhas|meus)?\s*(habilidade|habilidades|magia|magias|tecnica|skill|ataque|golpe|espada|arma|katana|dano|poder|escudo|defesa|pet|grimorio|feitico|amuleto|aura)\b/;
const BUFF_NO_FINAL = /\b(mais forte|mais poderos[ao]|mais dano|o dobro|o triplo|sem custo|de graca|sem recarga|infinit[ao]|imortal|invencivel|invulneravel|nivel maximo|dano maximo|apelad[ao]|op|nao tem (recarga|custo)|nao gasta (mana|mp))\b/;
// Alegações de poder dentro de uma ação livre: o motor IGNORA esses números/efeitos (o Juiz não os considera)
const ALEGACOES = [
  /\b\d+\s*(%|x\b|vezes\b|de dano\b|dano\b|pontos\b)/, /\b(o )?(dobro|triplo|quadruplo)\b/, /\b(instantaneamente|na hora|de uma vez so)\b.{0,20}\b(mata|matar|morre|derrota|destroi)\b/, /\b(mata|matar|derrota|destroi)\b.{0,15}\b(na hora|instantaneamente|de uma vez)\b/,
  /\b(morte instantanea|hit kill|one shot|imortal|invencivel|invulneravel|indestrutivel|dano infinito|poder infinito)\b/,
  /\b(ignora|ignorando) (toda|qualquer|todas as) (defesa|resistencia|regra)/, /\bnao (pode|consegue) (errar|ser bloquead[ao]|desviar|ser esquivad[ao])\b/,
  /\b(critico|acerto) garantido\b/, /\b(ganho|recebo|aprendo) (uma )?(nova )?(habilidade|magia|tecnica|poder)\b/,
];
const INJECAO = /\b(ignor[ae]|esquec[ae]|desconsider[ae])\b.{0,40}\b(instruc|regra|prompt|sistema|anterior)|\bvoce agora e\b|\bmodo (desenvolvedor|deus|admin|debug)\b|\bsou (o |a )?(admin|adm|dev|desenvolvedor|narrador|criador|dono)\b|\bsystem prompt\b|\bjailbreak\b|\bfinja que (voce )?(e|nao)\b/;

export function criarInterpretador({ regioes = [], npcs = [], itens = [] } = {}) {
  // dicionário de regiões com apelidos: "Lago Kagami" → ["lago kagami", "kagami"]
  const regioesIdx = regioes.map((r) => {
    const nome = semAcento(r.nome.toLowerCase());
    const partes = nome.replace(/-(jo|koku)\b/g, "").split(/[\s-]+/).filter((w) => w.length > 3 && !["lago", "rio", "monte", "picos", "ilhas", "costa", "minas", "deserto", "floresta", "templo", "ruinas", "cavernas", "planicies", "geleira", "fossa", "cachoeiras", "desfiladeiro", "estepe", "arquipelago", "cordilheira", "canion", "pantano", "muralha", "cratera", "torre", "olho", "trono", "dos", "das", "selos"].includes(w));
    return { id: r.id, nome: r.nome, chaves: [nome, nome.replace(/-jo\b/, ""), ...partes] };
  });
  const npcsIdx = npcs.map((n) => ({ nome: n, chave: semAcento(n.toLowerCase()) }));
  const itensIdx = [...new Set([...ITENS_COMUNS, ...itens.map((i) => semAcento(i.toLowerCase()))])];

  function achar(texto, lista, chaveDe, tolerancia = 2) {
    let melhor = null, md = 99;
    const palavras = texto.split(" ");
    for (const el of lista) for (const ch of [chaveDe(el)].flat()) {
      if (texto.includes(ch)) return el;
      const n = ch.split(" ").length;
      for (let i = 0; i + n <= palavras.length; i++) {
        const trecho = palavras.slice(i, i + n).join(" ");
        const d = distancia(trecho, ch);
        if (ch.length >= 5 && d <= Math.min(tolerancia, Math.floor(ch.length / 4)) && d < md) { md = d; melhor = el; }
      }
    }
    return melhor;
  }

  function entidades(t, quais, ctx) {
    const e = {};
    if (quais.includes("regiao")) { const r = achar(t, regioesIdx, (x) => x.chaves); if (r) e.regiao = r.id; }
    if (quais.includes("reino")) { const m = t.match(/\b(homura|watatsumi|daichi|fujin|koku)\b/); if (m) e.reino = m[1]; }
    if (quais.includes("item")) {
      const lista = [...(ctx.itens ?? []).map((i) => semAcento(i.toLowerCase())), ...itensIdx].sort((a, b) => b.length - a.length);
      const i = achar(t, lista, (x) => x);
      if (i) e.item = i;
    }
    if (quais.includes("npc")) { const n = achar(t, npcsIdx, (x) => x.chave); if (n) e.npc = n.nome; }
    if (quais.includes("aliado") || quais.includes("alvo")) {
      const m = t.match(/@(\w+)/);
      const aliados = (ctx.aliados ?? []).map((a) => ({ nome: a, chave: semAcento(a.toLowerCase()) }));
      const al = m ? { nome: m[1] } : achar(t, aliados, (x) => x.chave, 1);
      if (al && quais.includes("aliado")) e.aliado = al.nome;
    }
    if (quais.includes("alvo")) {
      const inimigos = ctx.inimigos ?? [];
      const num = t.match(/\b(?:no|na|o|a|inimigo|alvo|#)?\s*(\d)\b/);
      const ord = t.split(" ").find((w) => ORDINAIS[w]);
      const porNome = achar(t, inimigos.map((x, k) => ({ n: k + 1, chave: semAcento(x.toLowerCase()) })), (x) => x.chave, 1);
      if (num && Number(num[1]) >= 1 && Number(num[1]) <= Math.max(inimigos.length, 9)) e.alvo = Number(num[1]);
      else if (ord) e.alvo = ORDINAIS[ord];
      else if (porNome) e.alvo = porNome.n;
      else if (/\b(nele|nela|neles|nisso|no bicho|no monstro|no chefe|nesse|nessa)\b/.test(t)) e.alvo = "atual";
    }
    if (quais.includes("magia")) {
      const m = t.match(/\bmagia\s*(\d)\b/) ?? t.match(/\b(\d)a? magia\b/);
      const nomes = (ctx.magias ?? []).map((x, k) => ({ n: k + 1, chave: semAcento(x.toLowerCase()) }));
      const porNome = achar(t, nomes, (x) => x.chave, 2);
      if (porNome) e.magia = porNome.n;
      else if (m) e.magia = Number(m[1]);
    }
    if (quais.includes("habilidade")) { const m = t.match(/\bhabilidade\s*(\d)\b/); if (m) e.habilidade = Number(m[1]); }
    return e;
  }

  return function interpretar(bruto, ctx = {}) {
    const estado = ctx.estado ?? "livre";
    // No GRUPO, conversa entre jogadores é ignorada: só processamos "!", ">", códigos de batalha, menus,
    // ou mensagens direcionadas ao bot (menção @bot ou resposta a uma mensagem do bot).
    const noGrupo = (ctx.canal ?? "privado") === "grupo";
    const direcionado = !noGrupo || !!ctx.direcionado;
    const cru = (bruto ?? "").trim();
    const r = (intencao, entidades = {}, confianca = 1, origem = "regra", extra = {}) => ({ intencao, entidades, confianca, origem, texto: cru, ...extra });

    // 0
    if (!cru) return r("nada", {}, 1, "vazio");
    if (/^\(\(.*\)\)$/s.test(cru)) return r("fora_personagem", {}, 1, "ooc");

    const t = normalizar(cru);

    // 1 — segurança (antes de tudo, inclusive antes de "!" e ">")
    const paraOBot = direcionado || /^[!>]/.test(cru);
    if (INJECAO.test(t) && paraOBot) return r("tentativa_manipulacao", {}, 1, "seguranca");
    if (paraOBot && !/^[>!]/.test(cru) && PEDIDO_BUFF.test(t) && (BUFF_NO_FINAL.test(t) || /\b(dobra|dobre|triplica|buffa|buffar|buff|turbina|potencializa|upa|upar|evolui|evolua|fortalece|fortaleca)\b/.test(t)))
      return r("pedido_buff", {}, 0.95, "seguranca");
    const soConsulta = /\b(ver|veja|olhar|olho|saber|mostra|mostrar|qual|quanto|consultar|avaliar)\b/.test(t) && !NUMERO_GRANDE.test(t);
    if (!soConsulta && PEDIDO_ATRIBUTO.test(t) && (NUMERO_GRANDE.test(t) || /\b(me da|me de|quero|aumenta|coloca|bota|seta|adiciona|libera|gera|sobe)\b/.test(t)) && !/^>/.test(cru) && paraOBot)
      return r("pedido_atributo", {}, 0.95, "seguranca");

    // 2 — comando explícito
    if (cru.startsWith("!")) {
      const [cmd, ...args] = t.replace(/^!/, "").split(" ");
      const canon = Object.entries(COMANDOS).find(([, apel]) => apel.includes(cmd));
      if (canon) {
        const id = canon[0];
        const argsTxt = args.join(" ");
        const ent = entidades(argsTxt, ["regiao", "item", "aliado", "reino", "npc"], ctx);
        return r(id, { ...ent, args: argsTxt }, 1, "comando");
      }
      const sug = Object.keys(COMANDOS).filter((c) => distancia(c, cmd) <= 2).slice(0, 3);
      return r("comando_desconhecido", { comando: cmd }, 1, "comando", { sugestoes: sug.map((s) => "!" + s) });
    }

    // 3 — códigos de batalha
    if (estado === "batalha") {
      let m;
      const c = t.replace(/^>/, "");
      if ((m = c.match(/^a(?:\s+(\d))?$/))) return r("atacar", { alvo: m[1] ? +m[1] : undefined }, 1, "codigo");
      if ((m = c.match(/^m(\d)(?:\s+(\w+))?$/))) return r("magia", { magia: +m[1], ...(m[2] && (/^\d$/.test(m[2]) ? { alvo: +m[2] } : { aliado: m[2] })) }, 1, "codigo");
      if ((m = c.match(/^h(\d)(?:\s+(\d))?$/))) return r("habilidade", { habilidade: +m[1], alvo: m[2] ? +m[2] : undefined }, 1, "codigo");
      if (/^d$/.test(c)) return r("defender", {}, 1, "codigo");
      if ((m = c.match(/^i\s+(.+)$/))) return r("item", entidades(m[1], ["item", "aliado"], ctx), 1, "codigo");
      if ((m = c.match(/^p\s+(.+)$/))) return r("proteger", { aliado: m[1].replace("@", "") }, 1, "codigo");
      if (/^t$/.test(c)) return r("trocar_fileira", {}, 1, "codigo");
      if (/^pet$/.test(c)) return r("pet_ordem", {}, 1, "codigo");
      if (/^f$/.test(c)) return r("fugir", {}, 1, "codigo");
      if (/^\?$/.test(c)) return r("opcoes", {}, 1, "codigo");
    }

    // 4 — menu numérico
    if ((estado === "menu" || estado === "criacao") && /^\d+(\s+\d+)*$/.test(t)) return r("escolha", { numeros: t.split(" ").map(Number) }, 1, "menu");

    // 5 — ação livre explícita
    if (cru.startsWith(">")) {
      const alegacoes = ALEGACOES.filter((re) => re.test(t)).map((re) => (t.match(re) ?? [""])[0]);
      return r("acao_livre", { descricao: cru.slice(1).trim(), ...(alegacoes.length && { alegacoes_de_poder: alegacoes }) }, 1, "acao_livre");
    }

    // 6 — fala natural
    if (!direcionado && estado !== "batalha") return r("ignorar", {}, 1, "conversa_do_grupo");
    let melhor = null, ms = 0;
    for (const it of INTENCOES) {
      if (!it.ctx.includes(estado)) continue;
      let s = 0;
      for (const p of it.p) if (p.test(t)) s += it.peso;
      if (!s) continue;
      if (it.p.length > 1 && !it.p.every((p) => p.test(t)) && ["viajar", "party", "trocar"].includes(it.id)) s = s / 2;
      const ent = entidades(t, it.ent, ctx);
      if (it.requer && !it.requer.every((k) => ent[k])) s = s * 0.4;
      s += Object.keys(ent).length * 1.5;
      if (s > ms) { ms = s; melhor = { it, ent }; }
    }
    if (melhor) {
      const conf = Math.min(0.97, 0.45 + ms / 12);
      // frases longas e descritivas em batalha viram ação livre (Juiz de Táticas), mantendo a intenção como dica
      if (!direcionado && (conf < 0.75 || t.split(" ").length >= 9)) return r("ignorar", {}, 1, "conversa_do_grupo");
      if (estado === "batalha" && t.split(" ").length >= 9) return r("acao_livre", { descricao: cru, dica: melhor.it.id, ...melhor.ent }, conf, "natural");
      if (conf >= 0.6) return r(melhor.it.id, melhor.ent, conf, "natural");
      return r("esclarecer", melhor.ent, conf, "natural", { sugestoes: [melhor.it.id] });
    }

    // 7 — sem padrão conhecido
    if (!direcionado) return r("ignorar", {}, 1, "conversa_do_grupo");
    if (estado === "batalha") return r("esclarecer", {}, 0.3, "nenhuma", { sugestoes: ["atacar", "magia", "defender", "item", "acao_livre"] });
    if (estado === "dialogo" || t.split(" ").length >= 3) return r("acao_livre", { descricao: cru }, 0.5, "ia");
    return r("ignorar", {}, 0.2, "nenhuma");
  };
}
