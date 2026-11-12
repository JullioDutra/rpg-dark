# 40 — Calamidades, monstros de cidade e a espiã

Tudo aqui é **paralelo à campanha**: dá ryō, mérito e XP, nunca fecha capítulo nem libera passo da história.
Código: `src/servidor/ameacas.mjs`, `src/mundo/monstros.mjs`, `src/servidor/mestre.mjs`, migração `0006_ameacas.sql`.

## 40.1 Luta em grupo (vida compartilhada)

| Regra | Valor |
|-------|-------|
| Comando | `golpear` no privado (`monstro` ou `calamidade` mostra a situação e a imagem) |
| Vida | Uma só para todos; calculada pelo nível e equipamento dos jogadores do mundo |
| Dado | O mesmo d20; contra graus 3 e 4 o dado falha de 1 a 2 e perde 1 |
| Recarga | 1 golpe a cada 5 minutos por jogador |
| Lutar junto | Se outro jogador golpeou nos últimos 10 minutos, o seu golpe vale +25% |
| Contra-ataque | O monstro também rola; a vida do jogador nunca cai abaixo de 1. Com menos de 20% da vida, precisa se curar antes de voltar |
| Grupo | Recebe o anúncio, os marcos de 75%, 50% e 25% e o placar final (não cada golpe) |
| Recompensa | Todos que golpearam recebem; se o monstro for embora, só +5 de mérito |

## 40.2 Calamidade

- Vale para o mundo inteiro: ataca-se de qualquer lugar. Dura 48 horas.
- **Só aparece com a história desenvolvida:** sozinha, quando o mundo completa 12, 24, 36 e 48 capítulos; pelo mestre, só a partir de 10 capítulos.
- São os quatro monstros de grau 4: Ōmukade, Yamata, Gashadokuro e Amanozako.
- Vencida: o Relógio do Eclipse recua 5. Se for embora viva: avança 5.

## 40.3 Monstros de cidade (20, graus 1 a 4)

O mestre solta um monstro numa região com `mestre monstro <nº> <cidade>`. Só quem está na região pode golpear.
Enquanto ele vive (até 24 horas), **loja e descanso ficam fechados** ali. Lista completa no jogo: `mestre monstros`.

| Grau | Monstros |
|:---:|----------|
| 1 | Gakidama, Nezumi-ō, Kawa-onna, Hibashiri, Kazekiri |
| 2 | Tsuchigumo, Umibōzu, Onibi-gashira, Yamajii, Nure-hebi, Raijū |
| 3 | Kage-kujira, Jorōgumo, Daidarabotchi, Shinigami-bana, Fūjin-no-ko |
| 4 (Calamidades) | Ōmukade, Yamata, Gashadokuro, Amanozako |

## 40.4 A espiã

| Comando do mestre (privado) | Efeito |
|-----------------------------|--------|
| `mestre espiã <nome>` | Shiori, "uma cartógrafa de estrada", pede para viajar com o jogador. Ele não sabe o que ela é |
| `mestre relatório <nome>` | Nível, vida, ryō, onde está, o que carrega e as últimas 25 ações com horário |
| `mestre recolher <nome>` | Ela se despede |

De vez em quando ela aparece na cena com uma frase, para parecer só uma companheira de estrada. Ela não luta nem dá nada.

## 40.5 Relógio do Eclipse (como está hoje)

É um número de 0 a 100 guardado por mundo. Hoje ele: sobe 1 quando um jogador perde para um chefe (alto escalão, rei ou divindade), sobe 5 quando uma Calamidade vai embora viva,
desce 3 quando um rei ou divindade cai, desce 5 quando uma Calamidade é vencida, e aumenta a chance de encontros perigosos ao explorar.
Ainda **não** é mostrado aos jogadores nem muda o mundo em 25/50/75% (item C do doc 37).

## 40.6 Duelo amistoso por turnos (no grupo)

`duelo @pessoa` → o desafiado responde `aceitar` ou `recusar`. A partir daí o duelo acontece no próprio grupo, um turno de cada vez:

- Quem tem mais Velocidade começa. Na sua vez, o jogador responde com o **número da ação**, como numa batalha: Atacar, Defender, Magia e as habilidades da classe (com mana e recarga).
- Cada ação rola o **mesmo d20** das batalhas, mostrado às claras (número, modificador, total e multiplicador).
- Os dois entram com vida e mana cheias numa cópia: **a ficha de verdade não muda**. Os golpes valem metade, para o duelo durar.
- Termina por nocaute, por `desistir`, por pontos depois de 12 turnos de cada um, ou por `wo` se o outro sumir por 5 minutos. `painel` reenvia a situação.
- **Recompensa:** só um pouco de experiência (2% do nível para quem vence, 1% para quem perde), e só nos 3 primeiros duelos do dia. Sem ryō, sem mérito, sem itens.

Regras em `src/regras/duelo.mjs`; servidor em `src/servidor/extras.mjs` (`acaoDuelo`).
