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

Detalhes e calibração em **[42](42-duelo-entre-jogadores.md)**.

## 40.7 Correções: ação livre no meio da luta em grupo

| Problema | Causa | Correção |
|----------|-------|----------|
| A vida "resetava" depois de uma ação livre (`>`) | O contra-ataque do monstro tirava vida sem atualizar o marco de recuperação; a mensagem seguinte calculava horas de descanso e curava tudo | O golpe do monstro (e o preço em vida do Selo de Passagem) agora atualiza esse marco |
| O narrador puxava uma missão do lugar no meio da luta | O narrador não sabia que havia uma ameaça em cena e seguia o capítulo da região | Com monstro na região (ou Calamidade que o jogador golpeou nos últimos 15 min), a cena é a luta: a ação acontece diante do monstro, sem capítulo, e a resposta termina com `Para ferir <monstro>: golpear` |
| Frase livre virava passo de capítulo durante a luta | O atalho "ouvir a Ine" / "subo até X" valia sempre | Desligado enquanto a ameaça estiver em cena |

## 40.8 Habilidades contra monstros e Calamidades

`golpear` agora abre o **mesmo menu das batalhas**: Atacar, Magia do elemento, as habilidades da classe e as magias dos grimórios abertos. O jogador responde com o número (ou `golpear <nº>` direto).

| Efeito da habilidade | Contra a ameaça |
|----------------------|-----------------|
| Força, vários golpes, atravessar defesa, bônus no dado | Valem como nas batalhas |
| Dano contínuo | Entra somado no golpe (+30%) |
| Cura, roubo de vida, custo em vida | Mexem na vida de verdade do jogador |
| Proteção | Reduz o contra-ataque daquele turno |
| Enfraquecer | Contra-ataque 25% menor |
| Prender | O monstro não revida naquele turno |
| Foco ("próximo golpe +50%") | Fica guardado para a próxima ação |
| Mana | Gasta a mana de verdade; não há espera por habilidade, só o intervalo de 5 minutos entre ações |

## 40.9 Pactos com monstros

Durante uma luta contra monstro ou Calamidade, propor um pacto ("quero fazer um pacto com o monstro") abre uma oferta: `aceitar pacto` ou `recusar pacto`.

- **Aceitar:** +15% de dano em **todas** as lutas (mesma regra do pacto de Kanata), +25 de corrupção, e o jogador não pode mais golpear aquela ameaça. O monstro recupera 8% da vida e o grupo é avisado de que alguém fez um pacto, sem dizer quem.
- **Recusar:** +10 de mérito.
- Máximo de 3 pactos por jogador; uma oferta de cena a cada 6 horas. `pactos` mostra quantos o jogador tem e o que valem. `purificar` num templo desfaz um.
- Com 25 ou mais de corrupção, o final "estelar" da história fica fora do alcance de quem dá o último golpe.
- Fora das ameaças, o narrador também pode abrir essa oferta quando o jogador propõe um pacto a um vilão da cena (evento `propor_pacto`).

## 40.10 Itens de cenas e conversas vão para a bolsa

Antes, a IA podia narrar "ela te entrega um frasco" sem nada acontecer. Agora:

- O narrador e os NPCs só podem **propor** um item de uma lista fechada: poção de cura, poção de mana, ração, bandagem, bomba de fumaça e os cinco materiais.
- Quem entrega é o motor: o item entra na bolsa e a mensagem termina com `+1 Poção de cura (na sua bolsa)`.
- Limite: 3 por dia por jogador, com 20 minutos entre um e outro. Fora do limite ou da lista, a cena avisa que nada foi guardado.
- A instrução para a IA passou a ser: nunca dizer que o jogador recebeu algo sem propor o item.
