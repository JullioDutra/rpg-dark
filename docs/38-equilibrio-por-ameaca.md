# 38 — Equilíbrio por nível de ameaça (pesquisa, plano e o que foi aplicado)

Objetivo: cada degrau de combate deve ser **condizente com o que ele é na história e nunca fácil de graça**.
Os números finais estão em [35b](35b-tabela-equilibrio.md) (gerados por simulação, 400 lutas por célula).

## 38.1 O que os RPGs de referência fazem

| Ideia | De onde vem | Como usamos |
|-------|-------------|-------------|
| **Precisão limitada** (o dado sempre importa; acerto perto de 65% contra um alvo do seu nível) | D&D 5ª edição, *bounded accuracy* | O d20 tem 5 faixas e o bônus vai só de −3 a +3. Nível alto não transforma o dado em enfeite |
| **Faixas de ameaça** (trivial, baixa, moderada, severa, extrema), com chefes 2 a 4 níveis acima do grupo | Pathfinder 2ª edição, construção de encontros | Cada degrau do jogo virou uma faixa com meta de vitória (tabela 38.2) |
| **Economia de ações**: um chefe sozinho contra vários perde por agir menos | Análises de luta de chefe em D&D | Aqui é o contrário (um jogador contra um chefe), então o chefe foi ajustado para duelo (`AJUSTE_SOLO`) em vez de ganhar ações extras |
| **Golpe anunciado** (o jogador vê o perigo e decide) | Ações de vilão / lendárias | Já existia: a cada 3 rodadas o vilão prepara o golpe forte |
| **Fases** (o chefe muda no meio da luta) | Design de chefes em jogos de mesa e eletrônicos | Novo: reis e divindades têm segunda fase aos 50% de vida |
| **Fúria suave** (a luta não pode se arrastar para sempre) | *Soft enrage* | Novo: depois da 8ª rodada, chefes batem 8% mais forte por rodada |

Fontes consultadas: discussões de *bounded accuracy* (enworld.org, blackcitadelrpg.com, rpgbot.net, dandwiki), regras de construção de encontros
do Pathfinder 2e (2e.aonprd.com, pf2calc), e textos de design de chefes (theangrygm.com, slyflourish.com, coinsandscrolls, wayline.io).

## 38.2 Metas por degrau

A meta é a **média das 9 classes**, jogador no nível do vilão, com o preparo que a campanha entrega até ali.

| Degrau | Faixa de ameaça | Meta de vitória | Resultado |
|--------|-----------------|:---:|:---:|
| Lacaio (explorando) | Trivial | 95–100% | 100% |
| Vilão comum, no covil | Baixa | 80–95% | 95% |
| Vilão comum 3 níveis acima | Severa | 25–55% | 47% |
| Elite (médio escalão) | Moderada | 60–80% | 79% |
| Chefe (alto escalão) | Severa | 45–65% | 62% |
| Rei das sombras | Extrema | 35–55% | 43% |
| Kanata | Extrema | 40–60% | 56% |
| Divindade, só com as bênçãos | Além do extremo | 5–25% | 6% |
| Divindade, preparado | Severa | 60–80% | 77% |
| Rei do Eclipse, sem Grandes Itens | Além do extremo | 5–25% | 10% |
| Rei do Eclipse, preparado | Severa | 55–75% | 66% |

Antes deste ajuste: elite 96–100%, chefe até 100%, divindade preparado 98–100%. Ou seja, quem chegava preparado não corria risco.

## 38.3 Alavancas (todas em `src/regras/combate.mjs`)

| Alavanca | O que faz | Valor |
|----------|-----------|-------|
| `AJUSTE_SOLO` | Vida e ataque do vilão no duelo, por degrau (agora inclui lacaio e comum) | ver código |
| Normalização de arquétipo | Em chefes, o arquétipo pesa metade (um "bruto" e um "assassino" do mesmo degrau ficam parecidos em dificuldade) | expoente −0,5 |
| `AJUSTE_VILAO` | Ajuste fino por vilão quando a história pede (Kanata) | vida ×1,3, ataque ×1,15 |
| `PASSIVAS` | Uma passiva por classe: dá identidade e aproxima as classes frágeis das fortes | 9 passivas |
| `FURIA` | Chefes batem mais forte a cada rodada depois da 8ª | +8%/rodada, até +200% |
| `PERFURA_CHEFE` | Ataques de chefe atravessam parte da defesa | 20% (comum), 40% (golpe forte) |
| `TETO_BONUS` | Bênçãos, apoio, juramento e pactos somam até um teto | ×1,4 |
| `SEGUNDA_FASE` | Aos 50% de vida, reis e divindades refazem a guarda e batem mais forte | rei +12%, divindade +20% |
| Elixir estelar | Era cura total; agora recupera 60% da vida e da mana | 60% |
| Pet | Dano do pet um pouco menor | 0,15 + 0,07 por estágio |
| Grandes Itens | Ocupam o espaço da arma/armadura/acessório e valem cerca de 30% mais que o equipamento celeste | ver `itens.mjs` |

## 38.4 A campanha continua possível

- Nenhum capítulo foi fechado nem mudou de ordem. Só a dificuldade das lutas mudou.
- Perder não trava ninguém: o jogador volta, descansa, sobe de nível e tenta de novo. Um nível acima do vilão já muda bastante a conta.
- O caminho do preparo é a própria história: arcos dos reinos (bênçãos), santuários (pet), masmorras lendárias (Grandes Itens) e o grupo (`apoiar`).
- Quem chega ao fim sem os Grandes Itens ainda pode vencer (cerca de 1 em 10), e o final muda conforme o que conquistou (doc 34).

## 38.5 Como reavaliar

Mude uma alavanca, rode a simulação e compare a coluna *Média* com a *Meta*:

```bash
node scripts/simular-combate.mjs
```

```bash
node scripts/render-guia-dado.mjs
```

```bash
npm run testar
```
