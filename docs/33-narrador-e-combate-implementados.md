# 33 — Narrador, combate e progressão: o que já funciona

Continuação do [doc 32](32-exploracao-implementada.md). Tudo no **privado do bot**.

## Textos da origem e da região
- Ao terminar a criação, o jogador recebe: **Sua casa** (aldeia e casta explicadas em palavras simples), **Sua região**
  (como é, perigo, o que tem), o **reino** (quem governa, capital, bônus de quem nasce lá) e **O que fazer agora**.
- Ao chegar numa região pela primeira vez: texto da região + mapa do reino.
- Comandos: `onde estou`, `aldeia`, `reino`. Textos em `data/textos-mundo.json` (sem segredos da história).

## Narrador (ação livre)
- `> o que meu personagem faz` (ou uma frase longa que não seja comando) → o Sabiá narra a cena.
- A IA recebe: tom e proibições do roteiro, região, reino, aldeia, gancho da aldeia, marco atual e as últimas 6 cenas.
- **Travas**: pedido de atributo/poder e tentativa de mudar as regras são recusados **sem chamar a IA**; alegações de
  poder ("1000% de dano") vão marcadas como ignoradas; a IA só pode puxar luta com vilões **do marco e da região**.
- Marco **A1-M1 (Despertar)** termina na primeira cena e abre **A1-M2**.
- Limites: 6 s entre cenas, 80 cenas por dia por jogador.

## Combate solo
- Um encontro (da exploração ou do narrador) espera a resposta: `lutar` ou `recuar`.
- Ações: `a` atacar · `m1` magia do seu elemento (6 MP) · `h1` habilidade da classe · `d` defender ·
  `i pocao` poção (máx. 2 por luta) · `f` fugir (não vale contra chefes) · `?` painel.
- Habilidades: Mago *Rajada Arcana* · Cavaleiro *Golpe de Escudo* · Bruxo *Maldição* · Anti-magia *Corte do Vazio* ·
  Espadachim *Iaijutsu* · Meio-humano *Fúria da Fera* · Força da Natureza *Raízes* · Demônio *Miasma* · Paladino *Golpe Sagrado*.
- Fórmulas do doc 08 (K, crítico, esquiva), ciclo elemental e ponto fraco (+25%), **guarda** de inimigos de elite que
  quebra (perde a ação, +50% de dano no golpe seguinte), **golpe forte avisado** uma rodada antes.
- Elite (médio escalão) sozinho: −30% de vida e −15% de ataque; na exploração solo aparece 15% das vezes, com aviso.
- Até o sistema de equipamentos existir, todos usam o **equipamento-base** da faixa de nível (o mesmo do doc 22b).

## Depois da luta
- **Vitória**: XP (campônios +20%), ryō, 30% de chance de material. Vencer alguém 5+ níveis acima: +1 no atributo principal.
- **Subida de nível**: crescimento da classe, +HP = 8 + DEF/4, +MP = 4 × mult_MP, vida e mana cheias, rank novo,
  **+3 pontos livres** a cada 10 níveis → `distribuir FOR 2 VEL 1`.
- **Derrota**: acorda com 10% de vida e uma **ferida** (−10% num atributo por 24 h); contra humanos perde 30% do ryō.
- Fora de combate, vida e mana voltam **20% por hora**. Kit inicial: 3 poções.
- Todo ganho de atributo fica no livro-razão (`jogo.eventos_atributo`).

## Testes
`node scripts/testar-combate.mjs` (regras) e `node scripts/testar-servidor.mjs` (fluxo completo num Postgres temporário).
