// Constantes de balanceamento compartilhadas (gerador de vilões, simulador, motor do jogo).
// Calibradas com scripts/simular-progressao.mjs para o modo DIFÍCIL (doc 22b).
export const TIERS = {
  comum:     { rotulo: "Nível Comum",   emoji: "⚪", stat: 1.0,  hp: 1.0,  xp: 1,   amuleto: 0,    nivel: [1, 20] },
  medio:     { rotulo: "Médio Escalão", emoji: "🟢", stat: 1.2,  hp: 2.6,  xp: 2.5, amuleto: 0.01, nivel: [14, 32] },
  alto:      { rotulo: "Alto Escalão",  emoji: "🔵", stat: 1.45, hp: 5.0,  xp: 6,   amuleto: 0.03, nivel: [32, 58] },
  rei:       { rotulo: "Nível Rei",     emoji: "🟣", stat: 1.8,  hp: 12.0, xp: 15,  amuleto: 0.10, nivel: [65, 85] },
  divindade: { rotulo: "Divindade",     emoji: "🟡", stat: 2.4,  hp: 24.0, xp: 40,  amuleto: 0.25, nivel: [88, 100] },
};
export const XP_PROXIMO = (n) => Math.round(50 * n ** 1.5);
// XP de um vilão derrotado. Encontros aleatórios ESCALAM para o nível médio da party (doc 22.7),
// então o XP acompanha o jogador sem precisar "farmar" monstros antigos.
export const XP_VILAO = (nivel, tier) => Math.round(nivel * 15 * TIERS[tier].xp);
// Modelo de um dia de jogo "normal" (~30–40 min espalhados): 8 lutas de encontro + meia subfase + parte de marcos
export const XP_DIA = (n) => 8 * XP_VILAO(n, "comum") * 1.5 + 0.5 * XP_VILAO(n, "alto") + 0.25 * XP_PROXIMO(n);
export const K = (nivel) => 20 + 5 * nivel;
export const dano = (atk, nivelAtacante, def) => (atk * 3 * K(nivelAtacante)) / (K(nivelAtacante) + def);
export const ESCALA_PARTY = (n) => 0.6 + 0.4 * n;
