// Técnica universal "Olho Avaliador" (霊視 Reishi): ver o card de outro jogador.
// Exige atributos mínimos e gasta energia. Quanto maior a margem (leitura × defesa), mais o card revela.
// NUNCA revela: Corrupção, pactos, portador do Ovo, Chaves de Conhecimento, facção secreta, Amuleto usado.

export const REQUISITOS = { nivelMin: 5, somaMagSorMin: 20, vigor: 15, mp: 10, vazioAntiMagia: 20, recargaMesmoAlvoHoras: 6 };

const NIVEIS = [
  { min: -Infinity, nivel: 0, nome: "Aura turva" },
  { min: -10, nivel: 1, nome: "Silhueta" },
  { min: 1, nivel: 2, nome: "Contorno" },
  { min: 16, nivel: 3, nome: "Leitura" },
  { min: 31, nivel: 4, nome: "Visão completa" },
];

export function podeAvaliar(av) {
  if (av.nivel < REQUISITOS.nivelMin) return { ok: false, motivo: `Você precisa ser nível ${REQUISITOS.nivelMin}+ para ler auras.` };
  if (!av.tecnicas?.includes("olho-avaliador")) return { ok: false, motivo: "Você não conhece a técnica Olho Avaliador (aprenda num Dōjō)." };
  if (av.classe !== "Anti-magia" && av.atributos.MAG + av.atributos.SOR < REQUISITOS.somaMagSorMin)
    return { ok: false, motivo: `Sua percepção é fraca demais (MAG + SOR ≥ ${REQUISITOS.somaMagSorMin}).` };
  if (av.vigor < REQUISITOS.vigor) return { ok: false, motivo: `Vigor insuficiente (${REQUISITOS.vigor}).` };
  if (av.classe === "Anti-magia" ? (av.vazio ?? 0) < REQUISITOS.vazioAntiMagia : av.mp < REQUISITOS.mp)
    return { ok: false, motivo: av.classe === "Anti-magia" ? "Vazio insuficiente." : `MP insuficiente (${REQUISITOS.mp}).` };
  return { ok: true };
}

export function poderLeitura(av) {
  const base = av.classe === "Anti-magia" ? av.atributos.RES * 0.5 + av.atributos.SOR : av.atributos.MAG * 0.5 + av.atributos.SOR;
  const bonus = (["Mago", "Paladino", "Bruxo"].includes(av.classe) ? 8 : 0) + (av.pet === "P20" ? 15 : 0) + (av.marcas?.includes("T03") ? 5 : 0);
  return base + 2 * av.nivel + bonus;
}

export function defesaLeitura(alvo) {
  const ocultar = alvo.efeitos?.includes("ocultar-aura") ? 30 : 0;
  const sombra = alvo.marcas?.includes("T08") ? 15 : 0;
  const armadura = alvo.equipamento?.reliquia === "Kokūgai" ? 25 : 0;
  return alvo.atributos.RES * 0.5 + alvo.atributos.VEL * 0.5 + 2 * alvo.nivel + ocultar + sombra + armadura;
}

// d20: função de rolagem injetável (testes usam valor fixo)
export function avaliar(av, alvo, d20 = () => 1 + Math.floor(Math.random() * 20)) {
  const pode = podeAvaliar(av);
  if (!pode.ok) return { ok: false, motivo: pode.motivo, custo: null };
  const rolagem = d20();
  const margem = Math.round(poderLeitura(av) - defesaLeitura(alvo) + (rolagem - 10));
  const faixa = [...NIVEIS].reverse().find((n) => margem >= n.min);
  const custo = av.classe === "Anti-magia" ? { vigor: REQUISITOS.vigor, vazio: REQUISITOS.vazioAntiMagia } : { vigor: REQUISITOS.vigor, mp: REQUISITOS.mp };
  return {
    ok: true, custo, rolagem, margem, nivel: faixa.nivel, nomeNivel: faixa.nome,
    card: montarCard(alvo, faixa.nivel),
    // o alvo sente o olhar se a leitura foi fraca (e descobre quem foi se a margem for muito negativa)
    alvoPercebe: margem < 15 && !av.marcas?.includes("T08"),
    alvoDescobreQuem: margem < -10,
  };
}

const aprox = (v, p = 0.2) => { const d = Math.max(1, Math.round(v * p)); return `${Math.max(0, v - d)}–${v + d}`; };

// Monta a versão "vista" do card: campos não revelados viram null (o template mostra "???")
export function montarCard(a, nivel) {
  const c = {
    nome: a.nome, titulo: null, rank: null, reino: null, aldeia: null, casta: null, classe: null, atributo_magico: null,
    nivel: null, hp: null, hp_max: null, mp: null, mp_max: null, xp: null, xp_prox: null, fluxo: null, pureza: null, controle: null,
    merito: null, atributos: { FOR: null, DEF: null, MAG: null, RES: null, VEL: null, SOR: null }, equipamento: null,
    pet: null, retrato_url: a.retrato_url, faixas: null, nivelLeitura: nivel,
  };
  if (nivel === 0) return c;
  Object.assign(c, { rank: a.rank, reino: a.reino, classe: a.classe });
  if (nivel >= 2) Object.assign(c, { nivel: a.nivel, atributo_magico: a.atributo_magico, faixas: { hp: aprox(a.hp_max) }, aldeia: a.aldeia });
  if (nivel >= 3) {
    Object.assign(c, { titulo: a.titulo, pet: a.pet, casta: a.casta });
    c.faixas.atributos = Object.fromEntries(Object.entries(a.atributos).map(([k, v]) => [k, aprox(v)]));
  }
  if (nivel >= 4) Object.assign(c, {
    hp: a.hp, hp_max: a.hp_max, mp: a.mp, mp_max: a.mp_max, atributos: { ...a.atributos }, equipamento: a.equipamento,
    merito: a.merito, fluxo: a.fluxo, pureza: a.pureza, controle: a.controle, faixas: null,
  });
  return c;
}

// Técnica "Ocultar Aura": +30 na defesa de leitura por 1 h. Custa 10 de Vigor.
export const OCULTAR_AURA = { vigor: 10, duracaoMin: 60 };
