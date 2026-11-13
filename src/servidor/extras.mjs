// Modos complementares: pet espiritual, duelo e apoio entre jogadores (no grupo), pactos de Kanata e corrupção,
// boatos (contos de cada região) e ecos do passado (flashbacks).
import { readFileSync } from "node:fs";
import { MUNDO, VILOES } from "../mundo/mundo.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
import { atributosEfetivos, rolar, bonusDado, aplicarXP } from "../regras/combate.mjs";
import { bonusEquip } from "../regras/itens.mjs";
import { K, XP_PROXIMO } from "../../scripts/balanceamento.mjs";
import { DUELO, novoDuelo, painelDuelo, escolherDuelo, agirDuelo } from "../regras/duelo.mjs";
import { renderizar } from "../avatar/index.mjs";
import { dnaPet, NOMES_ESTAGIO } from "../avatar/dna.mjs";
import { rodape } from "./textos.mjs";
import { criarInterpretador } from "../linguagem/interpretar.mjs";
import { semAcento } from "../linguagem/normalizar.mjs";
import { elementoBase } from "../regras/combate.mjs";
import { um } from "./db.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
const PETS = new Map(ler("pets.json").pets.map((p) => [p.id, p]));
const { contos: CONTOS, flashbacks: FLASHBACKS } = ler("contos.json");

// Santuários: concluir o capítulo do lugar permite que um espírito escolha quem é elegível.
export const SANTUARIOS = { hom2: ["P01", "P02", "P03", "P04"], wat6: ["P05", "P06", "P07", "P08"], dai2: ["P09", "P10", "P11", "P12"], fuj2: ["P13", "P14", "P15", "P16"] };
const RAROS = ["P17", "P18", "P19", "P20"];
export const EVOLUCAO = { 2: { vitorias: 15, vinculo: 30 }, 3: { vitorias: 45, vinculo: 80 } };
const ECO_REGIAO = { FB01: "R-KOK-7", FB02: "R-KOK-7", FB03: "R-KOK-5", FB04: "R-KOK-1", FB05: "R-DAI-1", FB06: "R-KOK-5", FB07: "R-KOK-8", FB08: "R-WAT-1", FB09: "R-FUJ-3", FB10: "R-KOK-6" };
export const PACTO = { corrupcao: 25, intervaloMs: 3 * 86_400_000, max: 3 };

// ── Minha história ──
export const HISTORIA = {
  secoes: { origem: "De onde você veio e como cresceu", sonho: "O que você mais quer", medo: "O que você teme ou evita", laco: "Alguém importante para você", segredo: "Algo que só você sabe (ninguém mais vê)" },
  min: 15, max: 350, edicoesPorDia: 6,
};
const interpretar = criarInterpretador({});
const MUNDO_INTOCAVEL = /\b(kaien|nisteroy|sayo|kanata|yoru|shokuo|seio|rei[- ]estrela|ovo eterno|esquife|nucleo|excalibur|kokugai|tenmon|shitencho)\b/;
const PODER_NA_HISTORIA = /\b(imortal|invencivel|invulneravel|onipotente|mais forte do mundo|poder infinito|nivel \d+|\d+\s*%|filh[oa] d[eo] (rei|deus|dragao)|herdeir[oa] do trono|escolhid[oa] d[ao]s? (deuses|estrelas)|semideus|deus[a]?)\b/;
/** Devolve o motivo da recusa, ou null se o texto pode entrar na história do personagem. */
export function validarHistoria(texto) {
  const t = semAcento(texto.toLowerCase());
  if (texto.length < HISTORIA.min) return `Conte um pouco mais (pelo menos ${HISTORIA.min} letras).`;
  if (texto.length > HISTORIA.max) return `Ficou longo demais: use até ${HISTORIA.max} letras por parte (você escreveu ${texto.length}).`;
  if (["pedido_atributo", "pedido_buff", "tentativa_manipulacao"].includes(interpretar(texto, { estado: "livre", direcionado: true }).intencao) || PODER_NA_HISTORIA.test(t))
    return "Sua história conta quem você é, não o quanto você é forte. Poder se conquista jogando. Reescreva sem poderes, títulos ou números.";
  if (MUNDO_INTOCAVEL.test(t)) return "Sua história não pode mexer na história do mundo (reis, dragões, o Ovo, os grandes nomes). Fale da sua vida: família, aldeia, perdas, promessas.";
  return null;
}
export const ehDaTerra = (j) => elementoBase(j.atributo_magico) === "Terra" || j.reino === "Daichi";

export const imagemPet = (petId, estagio) => renderizar(dnaPet(petId, estagio), 6);

/** Duelo amistoso resolvido pelo motor: cada um ataca com o melhor atributo; o dado decide. Ninguém morre. */
export function simularDuelo(a, b, rng) {
  const lado = (j) => { const at = atributosEfetivos(j, Date.now(), j.equip ?? {}); return { nome: j.nome, nivel: j.nivel, at, hp: j.hp_max, max: j.hp_max, magico: at.MAG > at.FOR }; };
  const A = lado(a), B = lado(b), linhas = [];
  let [x, y] = A.at.VEL >= B.at.VEL ? [A, B] : [B, A];
  for (let r = 1; r <= 12 && A.hp > 0 && B.hp > 0; r++) {
    for (const [atk, def] of [[x, y], [y, x]]) {
      if (atk.hp <= 0 || def.hp <= 0) continue;
      const d = rolar(rng, bonusDado(atk.at));
      const bruto = ((atk.magico ? atk.at.MAG : atk.at.FOR) * 3 * K(atk.nivel)) / (K(atk.nivel) + (atk.magico ? def.at.RES : def.at.DEF));
      const dano = Math.round(bruto * d.mult * 0.6);
      def.hp -= dano;
      if (linhas.length < 8) linhas.push(d.faixa === "falha" ? `🎲 ${d.nat} — ${atk.nome} erra.` : `🎲 ${d.nat} — ${atk.nome} acerta ${d.faixa === "critico" ? "em cheio" : d.faixa === "forte" ? "forte" : d.faixa === "fraco" ? "de raspão" : "firme"}. _(${dano})_`);
    }
  }
  const vencedor = A.hp === B.hp ? (A.at.SOR >= B.at.SOR ? A : B) : A.hp > B.hp ? A : B;
  return { vencedor: vencedor === A ? a : b, perdedor: vencedor === A ? b : a, linhas, resto: Math.max(0, Math.round((vencedor.hp / vencedor.max) * 100)) };
}

export function criarExtras({ db, rng, agora }) {
  const gravar = (j, chave, valor = true) => db.query(`insert into jogo.progresso (jogador_id, chave, valor, criado_em) values ($1, $2, $3, $4)
    on conflict (jogador_id, chave) do update set valor = excluded.valor, criado_em = excluded.criado_em`, [j.id, chave, JSON.stringify(valor), new Date(agora())]);
  const grupoDe = async (j) => (await um(db, "select grupo_wa_id from jogo.mundos where id = $1", [j.mundo_id]))?.grupo_wa_id;
  const feito = (j, tipo, texto) => db.query("insert into jogo.feitos (mundo_id, jogador_id, tipo, texto, criado_em) values ($1, $2, $3, $4, $5)", [j.mundo_id, j.id, tipo, texto.slice(0, 400), new Date(agora())]);

  // ── pet ──
  async function aoConcluir(j, cap, para) {
    const pool = SANTUARIOS[cap.id];
    if (!pool) return [];
    if (await um(db, "select 1 from jogo.pets where jogador_id = $1", [j.id])) return [];
    if (!j.elegivel_pet) return [{ para, texto: "Olhos pequenos te observam das sombras do santuário. Nenhum se aproxima: as estrelas não te marcaram para isso. Mas eles lembram do seu rosto." }];
    const id = rng() < 0.06 ? RAROS[Math.floor(rng() * RAROS.length)] : pool[Math.floor(rng() * pool.length)];
    const p = PETS.get(id);
    await db.query("insert into jogo.pets (jogador_id, pet_id, nome, estagio) values ($1, $2, $3, 1) on conflict do nothing", [j.id, id, p.nome]);
    const grupo = await grupoDe(j);
    const txt = `⭐ Um espírito escolheu *${j.nome}*: *${p.nome}*, ${p.especie}${RAROS.includes(id) ? " — um espírito raríssimo" : ""}.`;
    await feito(j, "pet", txt);
    return [{ para, imagem: imagemPet(id, 1), legenda: `Algo pequeno sai das sombras, cheira sua mão e decide ficar.\n\n*${p.nome}*, ${p.especie}.\n_${p.habilidade}_\n\n${rodape("ele luta ao seu lado em toda batalha", "pet · pet carinho")}` },
      ...(grupo ? [{ para: grupo, imagem: imagemPet(id, 1), legenda: txt }] : [])];
  }

  /** Depois de uma vitória: o pet ganha experiência e pode evoluir. */
  async function aoVencer(j, para) {
    const pet = await um(db, "update jogo.pets set vitorias = vitorias + 1, vinculo = least(100, vinculo + 2) where jogador_id = $1 returning *", [j.id]);
    if (!pet || pet.estagio >= 3) return [];
    const alvo = EVOLUCAO[pet.estagio + 1];
    if (pet.vitorias < alvo.vitorias || pet.vinculo < alvo.vinculo) return [];
    await db.query("update jogo.pets set estagio = estagio + 1 where jogador_id = $1", [j.id]);
    const grupo = await grupoDe(j), est = pet.estagio + 1;
    const txt = `⭐ *${pet.nome}*, o companheiro de ${j.nome}, evoluiu: agora é *${NOMES_ESTAGIO[est - 1]}*.`;
    await feito(j, "pet", txt);
    return [{ para, imagem: imagemPet(pet.pet_id, est), legenda: `${pet.nome} brilha. Quando a luz baixa, ele está maior — e olha para você do mesmo jeito de sempre.\n\n*${pet.nome}* agora é *${NOMES_ESTAGIO[est - 1]}*.\n${rodape("o ataque dele ficou mais forte")}` },
      ...(grupo ? [{ para: grupo, imagem: imagemPet(pet.pet_id, est), legenda: txt }] : [])];
  }

  // ── pactos de Kanata ──
  async function aoDerrota(j, para) {
    const b = new Set((await db.query("select chave from jogo.progresso where jogador_id = $1 and (chave like 'b:%' or chave = 'oferta-pacto')", [j.id])).map((x) => x.chave));
    if (!b.has("b:festival") || b.has("b:kanata") || b.has("oferta-pacto")) return [];
    const pactos = [...b].filter((k) => k.startsWith("b:pacto-")).length;
    const ultima = await um(db, "select criado_em from jogo.progresso where jogador_id = $1 and chave = 'ultima-oferta'", [j.id]);
    if (pactos >= PACTO.max || (ultima && agora() - +new Date(ultima.criado_em) < PACTO.intervaloMs)) return [];
    await gravar(j, "oferta-pacto"); await gravar(j, "ultima-oferta");
    return [{ para, texto: "Enquanto você tenta se levantar, uma voz calma fala bem perto, como se alguém estivesse sentado ao seu lado.\n\n— Dói perder, eu sei. Eu posso te emprestar força. Sem contrato, sem letras miúdas. Só um aperto de mão.\n\nVocê conhece essa voz. É a do Mestre Yoru.\n\n*aceitar pacto* · *recusar pacto*\n" + rodape("aceitar: +15% de dano para sempre, +25 de corrupção", "a corrupção fecha o melhor final") }];
  }

  /**
   * Pacto oferecido por um vilão ou monstro da cena (o jogador propôs, ou o narrador propôs por ele).
   * Vale o mesmo que o pacto de Kanata: +15% de dano em todas as lutas e corrupção. Com um monstro solto, o preço inclui parar de atacá-lo.
   */
  async function ofertaPacto(j, de, para, { ameaca = null } = {}) {
    const b = new Set((await db.query("select chave from jogo.progresso where jogador_id = $1 and (chave like 'b:pacto-%' or chave = 'oferta-pacto')", [j.id])).map((x) => x.chave));
    if (b.has("oferta-pacto")) return [{ para, texto: "Já há uma oferta esperando a sua resposta: *aceitar pacto* ou *recusar pacto*." }];
    const pactos = [...b].filter((k) => k.startsWith("b:pacto-")).length;
    if (pactos >= PACTO.max) return [{ para, texto: `${de || "A coisa"} olha dentro de você e recua.
— Você já deve demais. Não sobrou onde assinar.
${rodape(`${pactos} pactos é o máximo`, "purificar num templo desfaz um")}` }];
    const ultima = await um(db, "select criado_em from jogo.progresso where jogador_id = $1 and chave = 'ultima-oferta-cena'", [j.id]);
    if (ultima && agora() - +new Date(ultima.criado_em) < 6 * 3_600_000) return [{ para, texto: `${de || "A coisa"} não responde. Hoje ninguém quer negociar com você.` }];
    await gravar(j, "oferta-pacto", { de: de || "a coisa", ameaca }); await gravar(j, "ultima-oferta-cena");
    return [{ para, texto: `*${de || "A coisa"}* para. Inclina a cabeça, como quem escuta uma proposta pela primeira vez em muito tempo.

Você não ouve palavras, mas entende a resposta: força em troca de um lugar dentro de você.${ameaca ? " E a sua palavra de que não vai mais levantar a mão contra ela." : ""}

*aceitar pacto* · *recusar pacto*
${rodape("+15% de dano em todas as lutas", `+${PACTO.corrupcao} de corrupção`, ameaca ? "você não poderá mais golpear esta ameaça" : null, "um templo desfaz o pacto")}` }];
  }

  async function comando(j, t, para, bruto = t) {
    let m;
    if (/^minha historia\b/.test(t)) return { tratado: true, saidas: await minhaHistoria(j, bruto, para) };
    if (/^(aceitar a terra|aceito a terra|fechar o pergaminho|fechar pergaminho)$/.test(t)) {
      const oferta = await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'oferta-terra' returning 1", [j.id]);
      if (!oferta.length) return { tratado: true, saidas: [{ para, texto: "Não há nenhum pergaminho aberto diante de você." }] };
      if (/^fechar/.test(t)) return { tratado: true, saidas: [{ para, texto: "Você enrola o pergaminho de novo, com cuidado. Ele continua na sua bolsa, esperando." }] };
      const tem = await db.query("delete from jogo.inventario where jogador_id = $1 and item_id = 'pergaminho-terra' returning 1", [j.id]);
      if (!tem.length) return { tratado: true, saidas: [{ para, texto: "O pergaminho não está mais com você." }] };
      const anuncio = await concederTerra(j, "pergaminho");
      const grupo = await grupoDe(j);
      return { tratado: true, saidas: [{ para, texto: `Você lê até a última linha.\n\n${textoTerra}` }, ...(anuncio && grupo ? [{ para: grupo, texto: anuncio }] : [])] };
    }
    if (/^(pet|meu pet|companheiro)$/.test(t) || (m = t.match(/^pet (carinho|afagar|brincar)$/))) {
      const pet = await um(db, "select * from jogo.pets where jogador_id = $1", [j.id]);
      if (!pet) return { tratado: true, saidas: [{ para, texto: j.elegivel_pet ? "Você ainda não encontrou seu companheiro. Os espíritos vivem nos santuários: o Coração de Hinokami, o Santuário Atrás da Queda, a Porta na Árvore e o Mosteiro do Vento. Termine a história de um desses lugares." : "As estrelas não te deram um companheiro espiritual. Isso não te faz menor: te faz diferente." }] };
      const p = PETS.get(pet.pet_id);
      let extra = "";
      if (m) {
        const pode = !pet.carinho_em || agora() - +new Date(pet.carinho_em) > 20 * 3_600_000;
        if (pode) { await db.query("update jogo.pets set vinculo = least(100, vinculo + 3), carinho_em = $2 where jogador_id = $1", [j.id, new Date(agora())]); pet.vinculo = Math.min(100, pet.vinculo + 3); extra = `\n\n${pet.nome} fecha os olhos e encosta em você. _(+3 de vínculo)_`; }
        else extra = `\n\n${pet.nome} já ganhou carinho hoje, mas aceita mais um pouco.`;
      }
      const alvo = EVOLUCAO[pet.estagio + 1];
      return { tratado: true, saidas: [{ para, imagem: imagemPet(pet.pet_id, pet.estagio), legenda: `*${pet.nome}* — ${p.especie} (${NOMES_ESTAGIO[pet.estagio - 1]})\n_${p.habilidade}_${extra}\n\n${rodape(`vínculo ${pet.vinculo}/100`, `${pet.vitorias} vitórias juntos`, alvo ? `evolui com ${alvo.vitorias} vitórias e vínculo ${alvo.vinculo}` : "forma final")}` }] };
    }
    if (/^(aceitar pacto|pacto|aceito o pacto)$/.test(t) || /^(recusar pacto|resistir|recuso o pacto)$/.test(t)) {
      const oferta = await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'oferta-pacto' returning valor", [j.id]);
      const quem = oferta[0]?.valor?.de ?? null, ameaca = oferta[0]?.valor?.ameaca ?? null;
      if (!oferta.length) return { tratado: true, saidas: [{ para, texto: "Ninguém te ofereceu nada. Ainda." }] };
      if (/^(recusar|resistir|recuso)/.test(t)) {
        await db.query("update jogo.jogadores set merito = merito + 10 where id = $1", [j.id]);
        return { tratado: true, saidas: [{ para, texto: quem ? `Você balança a cabeça. *${quem}* te olha por mais um instante, e alguma coisa nela parece quase aliviada.\n${rodape("+10 de mérito")}` : `Você não responde. Depois de um tempo, a voz ri baixinho, sem raiva.\n— Tudo bem. Eu espero.\n${rodape("+10 de mérito")}` }] };
      }
      const n = (await db.query("select 1 from jogo.progresso where jogador_id = $1 and chave like 'b:pacto-%'", [j.id])).length + 1;
      await gravar(j, `b:pacto-${n}`);
      const r = await um(db, "update jogo.jogadores set corrupcao = least(100, corrupcao + $2), corrupcao_max = greatest(corrupcao_max, least(100, corrupcao + $2)) where id = $1 returning corrupcao", [j.id, PACTO.corrupcao]);
      if (ameaca) await gravar(j, "pacto-ameaca", { id: ameaca });
      if (quem) return { tratado: true, pactoAmeaca: ameaca, saidas: [{ para, texto: `Você estende a mão. *${quem}* não a aperta: encosta a testa nela, e algo frio passa para dentro do seu braço e sobe até o peito.\n\nA partir de agora, uma parte da força dela anda com você. E uma parte de você anda com ela.\n${rodape("+15% de dano em todas as lutas", `corrupção ${r.corrupcao}/100`, ameaca ? "você não pode mais golpear esta ameaça" : null, "pactos mostra os seus", "purificar num templo desfaz")}` }] };
      return { tratado: true, saidas: [{ para, texto: `Você aperta uma mão que não está lá. Ela é quente.\n\nA dor some. No lugar dela fica uma força que não é sua — e uma sensação fina, no fundo do peito, de que alguém acabou de aprender o caminho até você.\n${rodape("+15% de dano", `corrupção ${r.corrupcao}/100`, "purificar num templo desfaz o pacto")}` }] };
    }
    if (/^(pactos|meus pactos)$/.test(t)) {
      const n = (await db.query("select 1 from jogo.progresso where jogador_id = $1 and chave like 'b:pacto-%'", [j.id])).length;
      return { tratado: true, saidas: [{ para, texto: n ? `*Seus pactos*\n\nVocê carrega *${n}* pacto${n > 1 ? "s" : ""}.\n${rodape(`+${n * 15}% de dano em todas as lutas`, `corrupção ${Number(j.corrupcao ?? 0)}/100`, "com 25 ou mais de corrupção, o final da história muda", "purificar num templo desfaz um pacto")}` : "Você não deve nada a ninguém. Ainda." }] };
    }
    if (/^(purificar|purificacao|limpar corrupcao)$/.test(t)) {
      const templo = MUNDO[j.regiao_atual]?.locais.find((l) => l.cena === "templo");
      if (!templo) return { tratado: true, saidas: [{ para, texto: "Só um templo pode fazer isso. Procure um lugar sagrado." }] };
      if (!Number(j.corrupcao)) return { tratado: true, saidas: [{ para, texto: "Não há nada em você para purificar." }] };
      const custo = 100 + j.nivel * 10;
      const pago = await db.query("update jogo.jogadores set ryo = ryo - $2, corrupcao = greatest(0, corrupcao - 25) where id = $1 and ryo >= $2 returning corrupcao", [j.id, custo]);
      if (!pago.length) return { tratado: true, saidas: [{ para, texto: `A oferenda custa ${custo} ryō. Você tem ${j.ryo}.` }] };
      await db.query(`delete from jogo.progresso where jogador_id = $1 and chave = (select max(chave) from jogo.progresso where jogador_id = $1 and chave like 'b:pacto-%')`, [j.id]);
      await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'pacto-ameaca'", [j.id]); // a palavra dada a um monstro também se desfaz
      return { tratado: true, saidas: [{ para, texto: `Em ${templo.nome}, você queima a oferenda e fica em silêncio até a fumaça acabar. Alguma coisa solta do seu ombro.\n${rodape(`corrupção ${pago[0].corrupcao}/100`, "um pacto foi desfeito (−15% de dano)", `−${custo} ryō`)}` }] };
    }
    if (/^(boatos|boato|rumores|contos|ouvir)$/.test(t)) {
      const daqui = CONTOS.filter((c) => c.regiao === j.regiao_atual);
      if (!daqui.length) return { tratado: true, saidas: [{ para, texto: "Ninguém por aqui tem histórias novas para contar." }] };
      const vistos = new Set((await db.query("select chave from jogo.progresso where jogador_id = $1 and chave like 'conto:%'", [j.id])).map((x) => x.chave));
      const c = daqui.find((x) => !vistos.has(`conto:${x.id}`)) ?? daqui[Math.floor(rng() * daqui.length)];
      const novo = !vistos.has(`conto:${c.id}`);
      let ganho = "";
      if (novo) { await gravar(j, `conto:${c.id}`); ganho = await darXP(j, 15 + j.nivel * 5); }
      return { tratado: true, saidas: [{ para, texto: `_Na roda de conversa, alguém baixa a voz._\n\n*${c.titulo}*\n${c.resumo}\n\n_Dizem que: ${String(c.liga_a ?? "").replace(/^Pista:\s*/i, "")}_${novo ? `\n${rodape(ganho, `${vistos.size + 1} de ${CONTOS.length} boatos ouvidos`)}` : ""}` }] };
    }
    if (/^(lembrar|ecos|eco|memorias|flashback)$/.test(t)) {
      const aqui = FLASHBACKS.filter((f) => ECO_REGIAO[f.id] === j.regiao_atual);
      if (!aqui.length) return { tratado: true, saidas: [{ para, texto: "Este lugar não guarda memórias fortes o bastante. Os ecos do passado moram onde a história aconteceu: Hinata, o Monte Ryūsō, a Torre, as capitais antigas." }] };
      const fez = await um(db, `select 1 from jogo.progresso where jogador_id = $1 and chave like 'c:%' and chave = any($2)`, [j.id, (MUNDO[j.regiao_atual].capitulos ?? []).map((c) => `c:${c.id}`)]);
      if (!fez) return { tratado: true, saidas: [{ para, texto: "Há memórias presas aqui, mas elas não se abrem para quem está só de passagem. Termine a história deste lugar primeiro." }] };
      const vistos = new Set((await db.query("select chave from jogo.progresso where jogador_id = $1 and chave like 'eco:%'", [j.id])).map((x) => x.chave));
      const f = aqui.find((x) => !vistos.has(`eco:${x.id}`)) ?? aqui[0];
      const novo = !vistos.has(`eco:${f.id}`);
      let ganho = "";
      if (novo) { await gravar(j, `eco:${f.id}`); ganho = await darXP(j, 60 + j.nivel * 12); }
      return { tratado: true, saidas: [{ para, texto: `_O mundo perde a cor. Por um instante, você é outra pessoa._\n\n*${f.titulo}*\n_${f.personagem}_\n\n${f.cena}\n\n${(f.revela ?? []).map((r) => `• ${r}`).join("\n")}\n\n_A memória se desfaz. Você volta a ser você._${novo ? `\n${rodape(ganho, `${vistos.size + 1} de ${FLASHBACKS.length} ecos vividos`)}` : ""}` }] };
    }
    return { tratado: false, saidas: [] };
  }

  async function darXP(j, xp) {
    const jog = await um(db, "select * from jogo.jogadores where id = $1", [j.id]);
    const d = aplicarXP(jog, xp);
    await db.query(`update jogo.jogadores set nivel = $2, xp = $3, atributos = $4, hp = $5, hp_max = $6, mp = $7, mp_max = $8, pontos_livres = $9, rank = $10 where id = $1`,
      [j.id, d.nivel, d.xp, JSON.stringify(d.atributos), d.hp, d.hp_max, d.mp, d.mp_max, d.pontos_livres, d.rank]);
    for (const ev of d.eventos) await db.query(`insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte, detalhe) values ($1, $2, $3, 'marco_historia', '{}')`, [j.id, ev.atributo, ev.delta]);
    return `+${xp} XP${d.niveis.length ? ` · nível ${d.nivel}` : ""}`;
  }

  // ── Olhos da Terra ──
  async function concederTerra(j, origem) {
    if (await um(db, "select 1 from jogo.progresso where jogador_id = $1 and chave = 'b:olhos-da-terra'", [j.id])) return null;
    await gravar(j, "b:olhos-da-terra", { origem });
    const jog = await um(db, "select avatar_dna from jogo.jogadores where id = $1", [j.id]);
    const dna = jog?.avatar_dna ?? {};
    if (dna.tipo === "humanoide") {
      dna.acessorios = [...new Set([...(dna.acessorios ?? []), "venda-olhos"])];
      await db.query("update jogo.jogadores set avatar_dna = $2 where id = $1", [j.id, JSON.stringify(dna)]);
    }
    const txt = `⭐ *${j.nome}* fechou os olhos para sempre e despertou os *Olhos da Terra*. Agora enxerga pelo chão o que ninguém mais vê.`;
    await feito(j, "tecnica", txt);
    return txt;
  }
  const textoTerra = "O mundo escurece — e, no mesmo instante, acende de outro jeito. Cada passo ao redor vira um desenho na sua cabeça: o peso das pessoas, a água correndo sob a pedra, o coração de um rato a vinte passos.\n\nVocê nunca mais vai ver um rosto. Mas ninguém nunca mais vai te pegar de surpresa.\n" +
    rodape("novas habilidades: Onda Sísmica e Ler o Chão", "+2 no dado ao defender", "−2 no dado contra espíritos e deuses", "veja em habilidades");

  /** Presentes de NPC ligados à amizade (hoje: o pergaminho da Mestra Tsuchi para quem é da terra). */
  async function aoFalar(j, npc, amizade, para) {
    if (npc !== "R-DAI-6:mestra-tsuchi" || amizade < 2) return [];
    if (await um(db, "select 1 from jogo.progresso where jogador_id = $1 and chave in ('b:olhos-da-terra', 'recebeu-pergaminho-terra')", [j.id])) return [];
    if (!ehDaTerra(j)) return [{ para, texto: "A mestra bate o pé no chão e inclina a cabeça.\n— Hum. Seus passos não têm raiz. O que eu ensino é para quem nasceu da terra, criança. Mas volte para o chá." }];
    await gravar(j, "recebeu-pergaminho-terra");
    await db.query(`insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados) values ($1, 'pergaminho-terra', 'historia', 1, '{}') on conflict do nothing`, [j.id]);
    return [{ para, texto: `A Mestra Tsuchi tira um rolo de dentro da manga e o empurra na sua direção, sem errar a mão.\n— Seus passos têm raiz. Leia, se tiver coragem. Mas saiba o preço: quem aprende a ver com os pés nunca mais vê com os olhos.\n${rodape("você recebeu: Pergaminho dos Olhos da Terra", "para ler: usar pergaminho")}` }];
  }

  async function lerPergaminho(j, para) {
    if (!ehDaTerra(j)) return [{ para, texto: "As letras do pergaminho escorrem como areia entre os dedos. Isso não foi escrito para você: só quem é da terra consegue ler." }];
    await gravar(j, "oferta-terra");
    return [{ para, texto: "Você desenrola o pergaminho. As primeiras linhas são um aviso:\n\n_\"Quem ler até o fim deixa de ver com os olhos — para sempre. Em troca, a terra passa a ver por você.\"_\n\n*aceitar a terra* · *fechar o pergaminho*\n" + rodape("não tem volta") }];
  }

  // ── Minha história ──
  async function historiaDe(j) { return (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'historia'", [j.id]))?.valor ?? {}; }
  /** Uma linha para a IA (narrador e NPCs): só sabor. O segredo vai junto, mas marcado como algo que ninguém do mundo sabe. */
  async function historiaPara(j) {
    const h = await historiaDe(j);
    const partes = Object.keys(HISTORIA.secoes).filter((k) => h[k] && k !== "segredo").map((k) => `${k}: ${h[k]}`);
    if (h.livre) partes.push(`mais: ${h.livre}`);
    if (!partes.length && !h.segredo) return "";
    return `História pessoal de ${j.nome} (apenas sabor para a cena; NUNCA concede poder, item, título ou parentesco com figuras do mundo): ${partes.join(" | ")}` +
      (h.segredo ? ` | segredo que nenhum personagem do mundo conhece (não revele; pode no máximo criar um clima): ${h.segredo}` : "");
  }
  function textoHistoria(j, h, publico = false) {
    const linhas = Object.entries(HISTORIA.secoes).filter(([k]) => !(publico && k === "segredo")).map(([k, dica]) =>
      h[k] ? `*${k[0].toUpperCase()}${k.slice(1)}*\n${h[k]}` : publico ? null : `*${k[0].toUpperCase()}${k.slice(1)}* — _${dica.toLowerCase()} (em branco)_`).filter(Boolean);
    if (h.livre) linhas.push(`*Mais sobre ${j.nome}*\n${h.livre}`);
    return linhas.join("\n\n");
  }
  async function minhaHistoria(j, bruto, para) {
    const corpo = bruto.trim().replace(/^[!/]?\s*minha\s+hist[óo]ria\s*:?\s*/i, "").trim();
    const h = await historiaDe(j);
    if (!corpo) {
      return [{ para, texto: `*A história de ${j.nome}*\n\n${textoHistoria(j, h) || "Ainda em branco."}\n\n` +
        `_Como escrever:_\n*minha história origem* Nasci numa família de pescadores…\n*minha história sonho* Quero achar meu irmão…\n*minha história medo* · *laço* · *segredo*\nou só *minha história* e o texto, para uma parte livre.\n\n` +
        rodape("o narrador e as pessoas do mundo passam a levar isso em conta", "o segredo só o narrador conhece", "não dá poderes: é quem você é") }];
    }
    if (/^(apagar|limpar|zerar)$/i.test(corpo)) { await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'historia'", [j.id]); return [{ para, texto: "Sua história volta a ser uma página em branco." }]; }
    const m = corpo.match(/^(origem|sonho|medo|la[cç]o|segredo)\s*[:\-–]?\s+([\s\S]+)$/i);
    const secao = m ? semAcento(m[1].toLowerCase()) : "livre", texto = (m ? m[2] : corpo).replace(/\s+/g, " ").trim();
    const erro = validarHistoria(texto);
    if (erro) return [{ para, texto: erro }];
    const hoje = new Date(agora()).toISOString().slice(0, 10);
    const edicoes = h.dia === hoje ? (h.edicoes ?? 0) : 0;
    if (edicoes >= HISTORIA.edicoesPorDia) return [{ para, texto: "Você já reescreveu sua história várias vezes hoje. Deixe a tinta secar até amanhã." }];
    const novo = { ...h, [secao]: texto, dia: hoje, edicoes: edicoes + 1 };
    await gravar(j, "historia", novo);
    const faltam = Object.keys(HISTORIA.secoes).filter((k) => !novo[k]);
    return [{ para, texto: `Anotado na sua história${secao === "livre" ? "" : ` (*${secao}*)`}:\n_${texto}_\n\n${rodape(secao === "segredo" ? "só o narrador conhece o seu segredo" : "o mundo passa a levar isso em conta", faltam.length ? `ainda em branco: ${faltam.join(", ")}` : "história completa", "minha história para ver tudo")}` }];
  }

  // ── grupo: duelo e apoio ──
  async function noGrupo(msg, mundo, t, autorJog, acharJogador, ehAdmin = false) {
    let m;
    if (/^[!/]?historia\b/.test(t)) {
      const alvo = (await acharJogador(msg)) ?? autorJog;
      if (!alvo) return [{ para: msg.chat, texto: "Use: *historia @pessoa* (ou o nome do personagem)." }];
      const txt = textoHistoria(alvo, await historiaDe(alvo), true);
      return [{ para: msg.chat, texto: txt ? `*A história de ${alvo.nome}*\n\n${txt}` : `*${alvo.nome}* ainda não contou a própria história. _(no privado: minha história)_` }];
    }
    if (/^[!/]?conceder\b/.test(t)) {
      if (!ehAdmin) return [{ para: msg.chat, texto: "Só um administrador do RPG pode conceder técnicas." }];
      if (!/\b(terra|olhos da terra|olhos-da-terra)\b/.test(t)) return [{ para: msg.chat, texto: "Use: *conceder terra @pessoa* (Olhos da Terra)." }];
      const alvo = await acharJogador({ ...msg, texto: msg.texto.replace(/olhos[- ]da[- ]terra|terra/i, "") });
      if (!alvo) return [{ para: msg.chat, texto: "Não achei esse personagem. Use: *conceder terra @pessoa* ou o nome do personagem." }];
      const anuncio = await concederTerra(alvo, "admin");
      if (!anuncio) return [{ para: msg.chat, texto: `*${alvo.nome}* já tem os Olhos da Terra.` }];
      const pv = alvo.wa_jid ?? alvo.wa_lid;
      return [{ para: msg.chat, texto: anuncio }, ...(pv ? [{ para: pv, texto: `A terra te escolheu.\n\n${textoTerra}` }] : [])];
    }
    if ((m = t.match(/^[!/]?(duelo|duelar|duelando|desafio|desafiar|desafio|x1|pvp|apoiar|apoio)\b/))) {
      if (!autorJog) return [{ para: msg.chat, texto: "Você ainda não tem personagem neste mundo." }];
      const alvo = await acharJogador(msg);
      if (!alvo || alvo.id === autorJog.id) return [{ para: msg.chat, texto: `Marque a pessoa: *${m[1]} @pessoa* (ou o nome do personagem).` }];
      if (/^(apoiar|apoio)$/.test(m[1])) {
        const hoje = await um(db, "select criado_em from jogo.progresso where jogador_id = $1 and chave = 'apoiou'", [autorJog.id]);
        if (hoje && agora() - +new Date(hoje.criado_em) < 20 * 3_600_000) return [{ para: msg.chat, texto: `*${autorJog.nome}* já mandou seu apoio hoje. Amanhã tem mais.` }];
        const atual = Number((await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'apoio'", [alvo.id]))?.valor ?? 0);
        if (atual >= 3) return [{ para: msg.chat, texto: `*${alvo.nome}* já carrega o apoio de três companheiros. É o máximo que um coração aguenta.` }];
        await gravar(autorJog, "apoiou"); await gravar(alvo, "apoio", atual + 1);
        return [{ para: msg.chat, texto: `*${autorJog.nome}* manda forças para *${alvo.nome}*. Onde quer que esteja, ${alvo.nome} sente que não luta só.\n${rodape(`+10% de dano na próxima luta contra um vilão`, `apoios guardados: ${atual + 1}/3`)}` }];
      }
      await gravar(autorJog, "duelo", { alvo: alvo.id });
      return [{ para: msg.chat, texto: `⚔️ *${autorJog.nome}* (nível ${autorJog.nivel}) desafia *${alvo.nome}* (nível ${alvo.nivel}) para um duelo amistoso.\n\n${alvo.nome}, responda *aceitar* ou *recusar* aqui no grupo. O duelo é por turnos: cada um escolhe a ação pelo número, como numa batalha.\n${rodape("ninguém se fere de verdade", "vale 10 minutos")}` }];
    }
    if (/^[!/]?(aceitar|aceito|recusar|recuso)$/.test(t) && autorJog) {
      const d = await um(db, `select p.jogador_id, p.criado_em from jogo.progresso p join jogo.jogadores x on x.id = p.jogador_id
        where x.mundo_id = $1 and p.chave = 'duelo' and (p.valor->>'alvo')::bigint = $2 order by p.criado_em desc limit 1`, [mundo.id, autorJog.id]);
      if (!d) return [];
      await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'duelo'", [d.jogador_id]);
      if (agora() - +new Date(d.criado_em) > 600_000) return [{ para: msg.chat, texto: "O desafio já esfriou." }];
      const a = await um(db, "select * from jogo.jogadores where id = $1", [d.jogador_id]);
      if (/^[!/]?recus/.test(t)) return [{ para: msg.chat, texto: `*${autorJog.nome}* recusa o duelo. ${a.nome} guarda a arma.` }];
      for (const x of [a, autorJog]) {
        x.equip = bonusEquip(await db.query("select item_id, equipado from jogo.inventario where jogador_id = $1", [x.id]));
        if (await dueloDe(x)) return [{ para: msg.chat, texto: `*${x.nome}* já está num duelo. Um de cada vez.` }];
      }
      const e = novoDuelo(a, autorJog, agora());
      await gravar(a, "duelo-estado", e);
      for (const x of [a, autorJog]) await gravar(x, "duelo-ativo", { dono: Number(a.id), grupo: msg.chat });
      return [{ para: msg.chat, texto: `${painelDuelo(e)}\n\n${rodape("cada um joga na sua vez, aqui no grupo", "ninguém se machuca de verdade", "vale só um pouco de experiência")}` }];
    }
    return null;
  }

  // ── duelo amistoso por turnos (no grupo) ──
  /** Duelo em andamento deste jogador: { dono, estado } ou null (limpa os vencidos pelo tempo). */
  async function dueloDe(j) {
    const ref = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'duelo-ativo'", [j.id]))?.valor;
    if (!ref) return null;
    const estado = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'duelo-estado'", [ref.dono]))?.valor;
    if (!estado || agora() - Number(estado.ultimo) > DUELO.validadeMs) { await encerrarDuelo(estado, ref.dono, j.id); return null; }
    return { dono: ref.dono, estado };
  }
  async function encerrarDuelo(estado, dono, ...outros) {
    const ids = [...new Set([dono, ...outros, ...(estado?.lados ?? []).map((x) => x.id)].map(Number))];
    await db.query("delete from jogo.progresso where jogador_id = any($1) and chave = 'duelo-ativo'", [ids]);
    await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'duelo-estado'", [dono]);
  }
  /** Um pouco de experiência, só nos primeiros duelos do dia (para não virar atalho de nível). */
  async function xpDeDuelo(lado, fracao) {
    const hoje = new Date(agora()).toISOString().slice(0, 10);
    const uso = (await um(db, "select valor from jogo.progresso where jogador_id = $1 and chave = 'duelos-dia'", [lado.id]))?.valor;
    const n = uso?.dia === hoje ? Number(uso.n ?? 0) : 0;
    await gravar({ id: lado.id }, "duelos-dia", { dia: hoje, n: n + 1 });
    if (n >= DUELO.porDia) return "sem XP (já duelou bastante hoje)";
    return darXP({ id: lado.id }, Math.max(1, Math.round(XP_PROXIMO(lado.nivel) * fracao)));
  }
  async function fimDoDuelo(d, fim, chat, extra = "") {
    await encerrarDuelo(d.estado, d.dono);
    const xv = await xpDeDuelo(fim.vencedor, DUELO.xpVencedor), xp = await xpDeDuelo(fim.perdedor, DUELO.xpPerdedor);
    const jv = await um(db, "select * from jogo.jogadores where id = $1", [fim.vencedor.id]);
    await feito(jv, "duelo", `⚔️ *${fim.vencedor.nome}* venceu *${fim.perdedor.nome}* num duelo amistoso.`);
    const resto = Math.max(0, Math.round((fim.vencedor.hp / fim.vencedor.hpMax) * 100));
    return [{ para: chat, texto: `${extra}*${fim.vencedor.nome}* vence${fim.motivo === "tempo" ? " por pontos" : fim.motivo === "desistencia" ? " por desistência" : fim.motivo === "wo" ? " por abandono" : ""}, ainda com ${resto}% de fôlego. ${fim.perdedor.nome} aceita a mão estendida e levanta rindo.\n${rodape(`${fim.vencedor.nome}: ${xv}`, `${fim.perdedor.nome}: ${xp}`, "a vida de verdade não mudou")}` }];
  }
  /** Mensagem no grupo de alguém que está num duelo: número ou nome da ação, desistir, wo. Devolve null se não for do duelo. */
  async function acaoDuelo(msg, j, t) {
    if (!j || !/^[!/]?(\d{1,2}|atacar|a|defender|d|magia|m|desistir|render|rendo|wo|w\.o\.|painel)$/.test(t)) return null;
    const d = await dueloDe(j);
    if (!d) return null;
    const e = d.estado, eu = e.lados.findIndex((x) => x.id === Number(j.id)), outro = e.lados[1 - eu];
    const cmd = t.replace(/^[!/]/, "");
    if (/^(desistir|render|rendo)$/.test(cmd)) return fimDoDuelo(d, { vencedor: outro, perdedor: e.lados[eu], motivo: "desistencia" }, msg.chat, `*${j.nome}* baixa a arma.\n\n`);
    if (cmd === "painel") return [{ para: msg.chat, texto: painelDuelo({ ...e, log: [] }) }];
    if (/^(wo|w\.o\.)$/.test(cmd)) {
      if (e.vez === eu) return [{ para: msg.chat, texto: "É a sua vez: escolha uma ação." }];
      const falta = DUELO.esperaMs - (agora() - Number(e.ultimo));
      if (falta > 0) return [{ para: msg.chat, texto: `${outro.nome} ainda tem ${Math.ceil(falta / 60_000)} min para responder.` }];
      return fimDoDuelo(d, { vencedor: e.lados[eu], perdedor: outro, motivo: "wo" }, msg.chat, `${outro.nome} não voltou para a arena.\n\n`);
    }
    if (e.vez !== eu) return [{ para: msg.chat, texto: `Ainda é a vez de *${outro.nome}*.` }];
    const esc = escolherDuelo(e, cmd);
    if (!esc) return null;
    if (esc.erro) return [{ para: msg.chat, texto: esc.erro }];
    const r = agirDuelo(e, esc.acao, rng, agora());
    if (r.erro) return [{ para: msg.chat, texto: r.erro }];
    if (r.fim) return fimDoDuelo({ dono: d.dono, estado: r.estado }, r.fim, msg.chat, `${painelDuelo(r.estado, { menu: false })}\n\n`);
    await gravar({ id: d.dono }, "duelo-estado", r.estado);
    return [{ para: msg.chat, texto: painelDuelo(r.estado) }];
  }

  return { comando, aoConcluir, aoVencer, aoDerrota, aoFalar, historiaPara, lerPergaminho, noGrupo, acaoDuelo, ofertaPacto };
}

export { PETS };
