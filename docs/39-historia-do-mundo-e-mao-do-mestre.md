# 39 — A história é do mundo, conversas com fim e a mão do mestre

## 39.1 Cada capítulo acontece uma vez só

**Regra:** quando um jogador conclui um capítulo, ele está concluído para o mundo inteiro. Ninguém o refaz.

Para o rumo da campanha não travar, quem chega depois **herda** o capítulo na primeira mensagem que mandar no privado:

| O que o herdeiro recebe | O que não recebe |
|-------------------------|------------------|
| A notícia de quem viveu a história | Ryō e mérito do capítulo |
| O segredo (pista), que entra em `segredos` | Itens únicos (Grandes Itens) e núcleos |
| A bandeira da campanha (o próximo passo libera para todos) | O anúncio no grupo |
| 25% do XP do capítulo | |

Consequências pensadas:

- **A campanha vira uma só para o grupo.** O objetivo (`missao`) de todos anda junto. O fim do jogo chega para todos quando alguém vence o Eclipse; quem acompanhou vira Guardião das Estrelas.
- **Nada trava.** Um capítulo fechado por outra pessoa nunca fica "em aberto" para ninguém; passos antigos são apagados.
- **Corrida justa.** Se dois jogadores fazem o mesmo capítulo em separado, o primeiro a terminar fecha; o outro herda no passo seguinte.
- **O que continua para todos:** vilões de covil (como Eco), exploração, contratos da Guilda, amizades, pets, boatos e ecos do passado.

## 39.2 Acompanhar

| Comando (privado) | O que faz |
|-------------------|-----------|
| `acompanhar <nome>` | Junta você a outro jogador que está na mesma região e na mesma história. Os passos de um valem para os dois |
| `seguir sozinho` | Desfaz o grupo. O que já foi feito juntos continua valendo |

- Ao chegar a uma região onde alguém já está no meio da história, o bot avisa e sugere `acompanhar`.
- Cada passo dado por um avisa o outro no privado.
- Na conclusão, **todos do grupo recebem o capítulo inteiro** (XP, ryō, mérito, segredo, bandeira). Itens únicos ficam com quem deu o último passo. O grupo se desfaz ao fim do capítulo.

## 39.3 Conversas com fim

- Não há mais o teto de 40 conversas por dia (ficou só uma trava de custo de 150).
- Cada conversa com a mesma pessoa tem até **4 falas seguidas** (janela de 20 minutos). Da 2ª em diante, o NPC puxa o aventureiro de volta para o próximo passo; a 4ª é a despedida. Insistindo, ele encerra com um texto pronto e mostra o passo da missão.
- Depois de 20 minutos, a conversa pode recomeçar normalmente.

## 39.4 Mão do mestre (secreta)

Só funciona no **privado do bot** e só para os números em `ADMINS`. No grupo, o comando é ignorado em silêncio. Para qualquer outro jogador, a palavra não faz nada.
O grupo só vê o narrador; nenhuma mensagem cita o administrador. Nenhuma ação dá atributo, nível ou equipamento.

| Comando | Efeito |
|---------|--------|
| `mestre` | Lista os comandos |
| `mestre quem` | Personagens, nível e onde estão |
| `mestre maldição <nome>` | Sono de cinzas: o jogador não consegue agir (só ver ficha, itens, missão). O grupo é avisado pela história. Quebra com 2 jogadores digitando `resgatar <nome>` (1, se só houver mais um), ou sozinho em 48 h |
| `mestre libertar <nome>` | Desfaz a maldição |
| `mestre sussurro <nome> <texto>` | Uma voz misteriosa fala só com ele |
| `mestre presságio <texto>` | O narrador anuncia um sinal no grupo |
| `mestre presente <nome> <item>` | Um embrulho sem remetente (só poções, utilidades e materiais) |
| `mestre emboscada <nome>` | Um lacaio da região o cerca agora |

Quem resgata ganha +10 de mérito, e o resgate entra nos feitos do mundo.

## 39.5 Acréscimos

| Comando do mestre | Efeito |
|-------------------|--------|
| `mestre fala <nome> <texto>` | A espiã diz o texto ao jogador, como fala dela (precisa estar acompanhando) |
| `mestre mapa` | Mapa do mundo com uma bandeira por região ocupada e a legenda de quem está onde. Só o mestre recebe |
| `mestre teleporte <nome>` | O jogador recebe um Selo de Passagem de um uso |

**Selo de Passagem (lado do jogador):** `teleportar <região>` mostra o destino e o preço; `pagar vida` (metade da vida máxima), `pagar ryo` (60 × nível) ou `pagar merito` (20) abre a passagem e ele chega na hora.
Não abre durante luta, encontro ou viagem, nem para regiões ainda fechadas para o mundo.

**Conversas:** `falar com a Oharu sobre o pilar` entende preposições e artigos e separa o nome da fala. Depois de falar com alguém, frases soltas continuam a conversa com a mesma pessoa por até 20 minutos
(`>` continua sendo ação; `tchau` encerra). Antes, "falar com a X" podia cair na pessoa errada e a frase seguinte ia para o narrador.

**Mais ações:** o vigor volta 20 por hora (era 10) e o narrador aceita 100 ações livres por dia (era 80). As conversas com NPC pela IA têm trava de 150 por dia.
