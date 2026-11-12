# 43 — Luta em conjunto contra vilões da história

Vale para vilões de covil de **médio escalão para cima** (elite, chefe, rei das sombras, divindade). É **opcional**: quem está sozinho na missão luta sozinho, como sempre.
Código: `src/servidor/combate.mjs` (`LUTA_GRUPO`), migração `0007_lutas_grupo.sql`.

## 43.1 Como funciona para o jogador

1. Dois ou mais jogadores estão na mesma história (`acompanhar <nome>`, doc 39).
2. Um deles chega ao covil e digita `lutar`. A batalha dele começa normalmente, e os companheiros recebem no privado: "Fulano começou a luta… digite *entrar na luta*".
3. Quem quiser digita `entrar na luta` (de qualquer lugar da mesma região). Recebe o próprio painel e o próprio menu numerado, igual a qualquer batalha.
4. Cada um joga no seu ritmo, no seu privado: escolhe a ação pelo número, rola o d20, usa habilidades, itens e pet. O vilão revida contra quem acabou de agir.
5. **O vilão é um só:** vida, guarda, estados (fraco, preso, ferido, aberto) e segunda fase são compartilhados. O painel de cada um já mostra o que os outros fizeram.
6. Quem dá o golpe final recebe a vitória na hora. Os outros recebem "o vilão caiu… digite *ok*" e, ao responder, ganham a vitória completa (XP, ryō, espólio e o passo do capítulo).

## 43.2 Regras

| Regra | Valor |
|-------|-------|
| Quem pode entrar | Só quem está no mesmo grupo de história (`acompanhar`) e na mesma região |
| Vida do vilão | A de um jogador só, mais **85%** por companheiro que entra (soma na vida atual e na máxima) |
| Ataques do vilão | Um por ação de jogador, contra quem agiu. Golpe forte anunciado, fúria e segunda fase continuam valendo, cada um no seu painel |
| Queda de um jogador | Só ele sai da luta (derrota normal). A luta continua com quem está de pé, e os outros são avisados |
| Avisos entre companheiros | Entrada de alguém, marcos de 75%, 50% e 25%, queda de um companheiro e golpe final |
| Luta aberta | Por até 2 horas. Se todos caírem, o vilão guarda os ferimentos nesse período |
| Recompensa | Cada um recebe a sua, inteira. Só o primeiro a derrubar aquele vilão no mundo conta como "primeiro" |
| Vilões comuns e lacaios | Continuam solo |

## 43.3 Por que assim

- **Mesmo estilo de batalha:** ninguém aprende comando novo; é o mesmo painel, o mesmo menu, o mesmo dado.
- **Ritmo do WhatsApp:** não há turno travado esperando o outro. Cada um age quando pode; o vilão compartilhado junta os esforços.
- **Sem obrigação:** se ninguém entrar, a luta é idêntica à de sempre (o vilão não ganha vida extra).

## 43.4 Limite conhecido

O ganho de vida por companheiro (85%) é uma escolha inicial: em dupla o vilão recebe o dobro de golpes e tem 1,85 vez a vida, então lutar junto fica um pouco mais fácil por cabeça. Não foi calibrado por simulação.
