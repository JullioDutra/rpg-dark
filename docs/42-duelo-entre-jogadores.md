# 42 — Duelo amistoso entre jogadores

Regras em `src/regras/duelo.mjs`; servidor em `src/servidor/extras.mjs` (`acaoDuelo`). Números em [42b](42b-duelos-entre-classes.md).

## 42.1 Como se joga

1. No grupo: `duelo @pessoa`. O desafiado responde `aceitar` ou `recusar`.
2. Quem tem mais Velocidade começa. O bot mostra a vida, a mana e a guarda dos dois, e o menu de quem está na vez.
3. O jogador responde **no grupo com o número da ação**: Atacar, Defender, Magia do elemento e as habilidades da classe (mesma mana e mesma recarga das batalhas).
4. Cada ação rola o mesmo d20 das batalhas, às claras: `🎲 14 +2 = 16 · acerto forte ×1,3 … (71 de dano)`.
5. A vez passa para o outro, até alguém cair.

Outros comandos: `desistir`, `painel` (reenvia a situação) e `wo` (vitória se o adversário sumir por 5 minutos).
Fim por nocaute, desistência, abandono, ou por pontos depois de 12 turnos de cada um (vence quem tiver mais vida em %).

## 42.2 O que vale igual às batalhas

| Regra | No duelo |
|-------|----------|
| Dado | Mesmo d20, mesmas faixas (1 erra · até 6 de raspão ×0,7 · 7–14 firme · 15+ forte ×1,3 · 20 perfeito ×1,8), bônus de Sorte e das habilidades |
| Habilidades | As 4 da classe, liberadas pelo nível, com mana e recarga |
| Efeitos | Proteção, foco (+50% no próximo golpe), enfraquecer, dano contínuo, prender (o alvo perde uma vez e fica imune por dois turnos), roubo de vida |
| **Elemento** | Magias com vantagem de elemento batem mais, e com desvantagem batem menos (mesmo ciclo dos reinos) |
| **Guarda** | Cada duelista tem 5 pontos de guarda (◆). Tiram guarda: golpe perfeito (−1), vantagem de elemento (−2), defesa perfeita do adversário (−2) e habilidades de quebra (Golpe de Escudo −2, Investida −3, Quebra-Selo −4, Olhar do Abismo −2). Zerou: a proteção cai e o próximo golpe recebido vale **+50%**; depois a guarda volta. Usar *Defender* de guarda aberta recompõe a postura |
| **Passivas de classe** | Todas valem. As que mexem no dado (Espadachim −4, Meio-humano −1 no dado do adversário; Instinto) valem inteiras |

## 42.3 O que muda no duelo (e por quê)

| Ajuste | Valor | Motivo |
|--------|-------|--------|
| Vida e mana | Os dois entram com a **vida e a mana da ficha**, cheias, numa cópia; a ficha de verdade não muda | É amistoso, e o número mostrado é o que o jogador conhece |
| Dano | Metade | Jogadores têm muito menos vida que vilões; sem isso o duelo acabava em 2 golpes |
| Curas, roubo de vida e regeneração | Metade | Classe que se cura não pode vencer só por durar mais |
| Reduções de dano das passivas | Metade | Feitas para aguentar chefe, eram fortes demais contra outro jogador |
| Defesa física e mágica | Puxadas 50% para a média das duas | Quem só tem uma das duas perdia sempre para o tipo "errado" de adversário |
| Fôlego por classe e nível | `AJUSTE_DUELO` (de ×0,53 a ×1,88): divide o dano **recebido**, sem mexer na vida mostrada | Ver calibração |
| Fôlego contra o ponto fraco | `PAR_DUELO` (20 confrontos, de +4% a +37%), somado ao fôlego da classe | Ver calibração |

## 42.4 Calibração entre classes

Método: `scripts/simular-duelo.mjs` faz todas as classes duelarem entre si (36 pares) nos níveis 10, 30, 60 e 90, com o equipamento do nível, mesmo elemento dos dois lados
e um duelista "razoável" (cura quando precisa, protege-se quando está mal, bate com o mais forte e aproveita a guarda aberta).

| Etapa | Resultado |
|-------|-----------|
| Sem ajuste | De **10%** (Meio-humano) a **80%** (Anti-magia) de vitórias contra o campo, e mudando com o nível (Cavaleiro: 17% no nível 10, 65% no 90) |
| 1. Regras de duelo (curas, passivas e defesas pela metade) | Menos confrontos extremos (de 11 para 6 fora de 30–70%) |
| 2. Vida por classe em 4 faixas de nível (`AJUSTE_DUELO`) | Toda classe entre **47% e 52%** contra o campo, em todos os níveis entre 44% e 61% |
| 3. Fôlego por confronto (`PAR_DUELO`) | **Nenhum** dos 72 confrontos fora de 36–64% |

Antes da etapa 3, o pior caso era Cavaleiro contra Força da Natureza: 8%. Continua existindo vantagem natural (pedra, papel e tesoura), só não é mais sentença.

Para recalibrar depois de mexer em classes ou habilidades:

```bash
node scripts/simular-duelo.mjs calibrar
```

Ele imprime as duas tabelas para colar em `src/regras/duelo.mjs`. Sem o `calibrar`, só mede e regrava o 42b.

## 42.5 Recompensa

Só um pouco de experiência: 2% do XP do nível para quem vence e 1% para quem perde, nos 3 primeiros duelos do dia. Sem ryō, mérito ou itens. A vitória entra em `feitos`.

## 42.6 Limites conhecidos

- A calibração usa um duelista simulado; jogadores reais vão achar combinações melhores para algumas classes.
- Foi medida com os dois lados no mesmo nível e com o mesmo elemento. Diferença de nível e vantagem de elemento continuam valendo como vantagem de verdade.
- Entre as faixas calibradas (10, 30, 60, 90) o ajuste é interpolado.

## 42.7 Correções

- **`duelar @pessoa` não fazia nada:** o comando só aceitava `duelo`. Agora aceita `duelo`, `duelar`, `desafiar`, `x1` e `pvp`.
- **Vida do duelo parecia errada:** o equilíbrio entre classes multiplicava a vida (um Anti-magia aparecia com metade, um Demônio com quase o dobro). Agora a vida é a da ficha e o ajuste virou "fôlego": muda quanto de cada golpe recebido desconta. A conta é a mesma; a simulação continua com as classes entre 47% e 52%.
