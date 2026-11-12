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

**Mais ações:** o vigor volta 20 por hora (era 10) e o narrador aceita 200 ações livres por dia e as conversas com NPC pela IA também têm limite de 200 por dia.

## 39.6 Correção do "loop do narrador" e varredura de diálogos e ações

**O que aconteceu:** o jogador fazia uma ação livre ("quero colher o orvalho") e o narrador o puxava de volta para o passo do capítulo ("Ine te puxa de volta… ouça minha teoria"), sem nunca avançar.
Duas causas somadas: (1) a regra do narrador mandava "trazer a cena de volta" ao passo; (2) responder "ouvir Ine" continuava sendo texto livre, e só o comando `falar Ine` fazia o capítulo andar.

| Correção | Efeito |
|----------|--------|
| Regras do narrador | A ação do jogador sempre acontece e tem resultado; ninguém o puxa, segura ou dá sermão; escolha oferecida é cumprida; não repete a mesma proposta; termina com pergunta aberta |
| Rumo vem do motor | Quando há capítulo ativo, a narração termina com `A história continua com: falar Ine` (o comando exato) |
| Frase livre vira comando | "quero ouvir a Ine", "sento para escutar o capitão" → `falar`; "subo até as costelas" → `ir`. Com `>` na frente, só conversa vira comando |
| Conversa × ação | Depois de falar com alguém, perguntas continuam a conversa; frases que soam como ação ("eu quero…", "vou…", "tento…") vão para o narrador. Quando o narrador responde, a conversa anterior se encerra |
| NPC não insiste | Lembra a missão no máximo uma vez por conversa, só fala (não descreve nem move o jogador) e não termina com duas opções |

**Varredura dos 171 passos dos 54 capítulos** (`falar`, `ir`, `derrotar`):

| Achado | Correção |
|--------|----------|
| "Mestre Uo": nome de duas letras não era reconhecido pelo `falar` | Aceita nomes curtos; o rumo mostra o nome inteiro quando o último é curto |
| Em 23 capítulos o vilão do passo dividia o covil com outro vilão que vinha antes; se o da frente fosse de um capítulo ainda fechado, a "névoa" travava o caminho | O vilão do passo atual vem sempre primeiro, e vilão de capítulo fechado não bloqueia os outros |

## 39.7 Transporte direto pelo mestre

| Comando | Efeito |
|---------|--------|
| `mestre mover <nome> <região>` | Transporta o jogador na hora, sem custo. Ele recebe uma cena curta ("o ar se rasga") e a imagem do lugar |
| `mestre mover todos <região>` | Transporta todos os jogadores do mundo. Cada um vê a chegada no privado e o grupo recebe um anúncio do narrador |

Quem está em luta não é movido (o mestre recebe a lista). Viagem em curso e encontro pendente são encerrados. Diferente do Selo de Passagem (`mestre teleporte`), aqui o destino é escolhido pelo mestre e o jogador não paga nada.

## 39.8 Ajustes vindos de jogadores (mapa e dica do rumo)

| Retorno do jogador | Causa | Correção |
|--------------------|-------|----------|
| "Já fui nos Ninhos no Trigal e não apareceu nada" | A dica vinha como `ir Ninhos no Trigal (e depois lutar)`; copiada inteira, o `ir` não achava o lugar. E "ir" escrito como ação livre (`> vou até os ninhos`) era só narrado | A dica agora é só o comando (`ir Ninhos no Trigal`), o `ir` ignora parênteses, e ação livre que pede o lugar do passo atual leva de verdade até lá (aparece o vilão) |
| "Tudo que converso fica com essa mensagem embaixo" | A dica do rumo saía em toda narração | Aparece quando o passo muda e depois só a cada 4 narrações |
| "Tem legenda do mapa?" | O mapa só tinha números | `mapa` traz a lista numerada das regiões de cada reino (os mesmos números do desenho); `locais` mostra os lugares de onde o jogador está |

## 39.9 Mapa dos tesouros (só o mestre)

`mestre tesouros` envia o mapa do mundo com uma bandeira por região e, na mensagem seguinte, a legenda:

- **Os 4 Grandes Itens:** onde cada um se conquista (região, capítulo e nível) ou com quem está agora, se está em uso e onde essa pessoa está. O Shitenchō (grimório) mostra os quatro capítulos de Céu e quantos já foram feitos no mundo.
- **Os 4 núcleos da Árvore-Estrela:** com qual rei estão ou a quem foram confiados.
- **Santuários de pet:** os quatro lugares e quais já foram visitados; quem já tem pet.
- **Pergaminho dos Olhos da Terra:** onde a Mestra Tsuchi o entrega e quem tem uma cópia.

Dois tesouros na mesma região dividem a mesma letra.
