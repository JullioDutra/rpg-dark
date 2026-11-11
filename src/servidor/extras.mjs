// Modos complementares: pet espiritual, duelo e apoio entre jogadores (no grupo), pactos de Kanata e corrupção,
// boatos (contos de cada região) e ecos do passado (flashbacks).
import { readFileSync } from "node:fs";
import { MUNDO, VILOES } from "../mundo/mundo.mjs";
import { REGIAO } from "../regras/exploracao.mjs";
import { atributosEfetivos, rolar, bonusDado, aplicarXP } from "../regras/combate.mjs";
import { bonusEquip } from "../regras/itens.mjs";
import { K } from "../../scripts/balanceamento.mjs";
import { renderizar } from "../avatar/index.mjs";
import { dnaPet, NOMES_ESTAGIO } from "../avatar/dna.mjs";
import { rodape } from "./textos.mjs";
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

  async function comando(j, t, para) {
    let m;
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
      const oferta = await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'oferta-pacto' returning 1", [j.id]);
      if (!oferta.length) return { tratado: true, saidas: [{ para, texto: "Ninguém te ofereceu nada. Ainda." }] };
      if (/^(recusar|resistir|recuso)/.test(t)) {
        await db.query("update jogo.jogadores set merito = merito + 10 where id = $1", [j.id]);
        return { tratado: true, saidas: [{ para, texto: `Você não responde. Depois de um tempo, a voz ri baixinho, sem raiva.\n— Tudo bem. Eu espero.\n${rodape("+10 de mérito")}` }] };
      }
      const n = (await db.query("select 1 from jogo.progresso where jogador_id = $1 and chave like 'b:pacto-%'", [j.id])).length + 1;
      await gravar(j, `b:pacto-${n}`);
      const r = await um(db, "update jogo.jogadores set corrupcao = least(100, corrupcao + $2), corrupcao_max = greatest(corrupcao_max, least(100, corrupcao + $2)) where id = $1 returning corrupcao", [j.id, PACTO.corrupcao]);
      return { tratado: true, saidas: [{ para, texto: `Você aperta uma mão que não está lá. Ela é quente.\n\nA dor some. No lugar dela fica uma força que não é sua — e uma sensação fina, no fundo do peito, de que alguém acabou de aprender o caminho até você.\n${rodape("+15% de dano", `corrupção ${r.corrupcao}/100`, "purificar num templo desfaz o pacto")}` }] };
    }
    if (/^(purificar|purificacao|limpar corrupcao)$/.test(t)) {
      const templo = MUNDO[j.regiao_atual]?.locais.find((l) => l.cena === "templo");
      if (!templo) return { tratado: true, saidas: [{ para, texto: "Só um templo pode fazer isso. Procure um lugar sagrado." }] };
      if (!Number(j.corrupcao)) return { tratado: true, saidas: [{ para, texto: "Não há nada em você para purificar." }] };
      const custo = 100 + j.nivel * 10;
      const pago = await db.query("update jogo.jogadores set ryo = ryo - $2, corrupcao = greatest(0, corrupcao - 25) where id = $1 and ryo >= $2 returning corrupcao", [j.id, custo]);
      if (!pago.length) return { tratado: true, saidas: [{ para, texto: `A oferenda custa ${custo} ryō. Você tem ${j.ryo}.` }] };
      await db.query(`delete from jogo.progresso where jogador_id = $1 and chave = (select max(chave) from jogo.progresso where jogador_id = $1 and chave like 'b:pacto-%')`, [j.id]);
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

  // ── grupo: duelo e apoio ──
  async function noGrupo(msg, mundo, t, autorJog, acharJogador) {
    let m;
    if ((m = t.match(/^[!/]?(duelo|desafio|x1|apoiar|apoio)\b/))) {
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
      return [{ para: msg.chat, texto: `⚔️ *${autorJog.nome}* (nível ${autorJog.nivel}) desafia *${alvo.nome}* (nível ${alvo.nivel}) para um duelo amistoso.\n\n${alvo.nome}, responda *aceitar* ou *recusar* aqui no grupo.\n${rodape("ninguém se fere de verdade", "vale 10 minutos")}` }];
    }
    if (/^[!/]?(aceitar|aceito|recusar|recuso)$/.test(t) && autorJog) {
      const d = await um(db, `select p.jogador_id, p.criado_em from jogo.progresso p join jogo.jogadores x on x.id = p.jogador_id
        where x.mundo_id = $1 and p.chave = 'duelo' and (p.valor->>'alvo')::bigint = $2 order by p.criado_em desc limit 1`, [mundo.id, autorJog.id]);
      if (!d) return [];
      await db.query("delete from jogo.progresso where jogador_id = $1 and chave = 'duelo'", [d.jogador_id]);
      if (agora() - +new Date(d.criado_em) > 600_000) return [{ para: msg.chat, texto: "O desafio já esfriou." }];
      const a = await um(db, "select * from jogo.jogadores where id = $1", [d.jogador_id]);
      if (/^[!/]?recus/.test(t)) return [{ para: msg.chat, texto: `*${autorJog.nome}* recusa o duelo. ${a.nome} guarda a arma.` }];
      for (const x of [a, autorJog]) x.equip = bonusEquip(await db.query("select item_id, equipado from jogo.inventario where jogador_id = $1", [x.id]));
      const r = simularDuelo(a, autorJog, rng);
      await db.query("update jogo.jogadores set merito = merito + 5 where id = $1", [r.vencedor.id]);
      const xp = await darXP(r.vencedor, 10 + r.perdedor.nivel * 8);
      const txt = `⚔️ *${r.vencedor.nome}* venceu *${r.perdedor.nome}* num duelo amistoso.`;
      await feito(r.vencedor, "duelo", txt);
      return [{ para: msg.chat, texto: `⚔️ *Duelo — ${a.nome} × ${autorJog.nome}*\n\n${r.linhas.join("\n")}\n…\n\n*${r.vencedor.nome}* vence, ainda com ${r.resto}% de fôlego. ${r.perdedor.nome} aceita a mão estendida e levanta rindo.\n${rodape(`${r.vencedor.nome}: ${xp}`, "+5 de mérito")}` }];
    }
    return null;
  }

  return { comando, aoConcluir, aoVencer, aoDerrota, noGrupo };
}

export { PETS };
