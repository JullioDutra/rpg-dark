# 47 — Transformação mística dos Meio-humanos

Código: `src/regras/fera.mjs` (dados e regras), `src/servidor/fera.mjs` (comandos), arte em `src/avatar/especiais.mjs` (`desenharTransformacao`).
Exemplos da arte: `docs/img/fera-raposa-3.png`, `docs/img/fera-lobo-2.png`, `docs/img/fera-dragao-3.png`.

## 47.1 Planejamento

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Quem | Só a classe Meio-humano, no animal sorteado na criação (raposa, lobo, tigre, corvo, serpente, coelho, dragão menor) | É o animal que o personagem "carrega no sangue" |
| Estágios | 3 por animal, cada um com nome próprio | Pedido: três níveis de evolução |
| O que cada estágio dá | **Uma habilidade nova**, que entra no menu das lutas | Soma às habilidades da classe; não troca nem retira nenhuma |
| Atributos | Não mudam | Regra do jogo: atributo só por mérito (nível e pontos) |
| Como sobe | Relíquia do Sangue Antigo (achada explorando) **ou** `mestre transformar <nome>` | Pedido: item achado ou comando do mestre |
| Nível mínimo (pela relíquia) | 1º: nível 1 · 2º: nível 20 · 3º: nível 40 | Espalha a evolução pela campanha; o mestre pode passar por cima |
| Anúncio | Arte no grupo e no privado, a cada despertar | Pedido: imagem impactante no grupo principal |
| Arte | À esquerda o retrato do jogador; à direita a forma animal **com as cores dele** (pelo = cabelo, olhos = olhos, aura = elemento); raio ligando os dois; lua, anéis e moldura crescem com o estágio | Mantém clara a identidade do jogador |

## 47.2 Como funciona no jogo

- **Achar a relíquia:** ao `explorar`, um Meio-humano que ainda pode evoluir e já tem o nível do próximo despertar tem 6% de chance de achar uma Relíquia do Sangue Antigo (só uma por vez na bolsa).
- **Despertar:** `usar relíquia`. Se o nível não bastar, a relíquia não é gasta.
- **Pelo mestre:** `mestre transformar <nome>`, um estágio por comando, até 3. Para o grupo é só a história: nada cita o mestre.
- **Ver:** `fera` mostra a arte da forma atual, os estágios despertos com suas habilidades e o que falta para o próximo. `habilidades` lista tudo junto.
- **Nas lutas:** as habilidades da fera aparecem no menu das batalhas, das lutas em conjunto e do `golpear`. Não valem no duelo amistoso.

## 47.3 As 21 habilidades

| Animal | Estágio | Forma | Habilidade | Efeito | Mana | Espera |
|--------|:---:|-------|------------|--------|:---:|:---:|
| raposa | 1 | Raposa de Uma Cauda | **Fogo-Fátuo** | golpe de força 1,3 e queimadura por 3 rodadas | 10 | 3 |
|  | 2 | Raposa de Três Caudas | **Ilusão das Três Caudas** | esquiva 70% por 1 rodada e o próximo golpe vale +50% | 12 | 4 |
|  | 3 | Kyūbi, a de Nove Caudas | **Nove Caudas** | cinco golpes de força 0,5 | 26 | 5 |
| lobo | 1 | Lobo Jovem | **Mordida da Matilha** | golpe de força 1,6 que recupera vida | 10 | 3 |
|  | 2 | Lobo da Lua Cheia | **Uivo da Lua Cheia** | enfraquece o inimigo por 3 rodadas e o próximo golpe vale +50% | 12 | 4 |
|  | 3 | Ōkami, o Lobo Ancestral | **Caçada** | golpe de força 2,4 que atravessa 30% da defesa | 24 | 5 |
| tigre | 1 | Tigre Rajado | **Garra Rajada** | dois golpes de força 0,9 | 10 | 3 |
|  | 2 | Tigre das Montanhas | **Bote** | golpe de força 1,9 que quebra a guarda | 14 | 4 |
|  | 3 | Byakko, o Tigre Branco | **Rugido do Rei** | golpe de força 2,2 que prende o inimigo por 1 rodada | 26 | 5 |
| corvo | 1 | Corvo Mensageiro | **Chuva de Penas** | três golpes de força 0,55 | 10 | 3 |
|  | 2 | Corvo de Três Olhos | **Olho do Presságio** | esquiva 60% por 1 rodada e o próximo golpe vale +50% | 12 | 4 |
|  | 3 | Yatagarasu, o Corvo do Sol | **Asas da Meia-Noite** | golpe de força 2,3 que enfraquece e atravessa 20% da defesa | 24 | 5 |
| serpente | 1 | Serpente do Capim | **Presa Venenosa** | golpe de força 1,2 e veneno por 4 rodadas | 10 | 3 |
|  | 2 | Serpente Branca | **Constrição** | golpe de força 1,4 que prende por 1 rodada | 16 | 5 |
|  | 3 | Orochi, a Serpente Sem Fim | **Troca de Pele** | cura 35% da vida e protege por 2 rodadas | 24 | 5 |
| coelho | 1 | Coelho do Campo | **Salto Lunar** | golpe de força 1,5 com +3 no dado | 8 | 3 |
|  | 2 | Coelho das Neves | **Pé Ligeiro** | esquiva 80% por 1 rodada e o próximo golpe vale +50% | 12 | 4 |
|  | 3 | Tsuki no Usagi, o Coelho da Lua | **Elixir da Lua** | cura 30% da vida e protege por 2 rodadas | 22 | 5 |
| dragão menor | 1 | Filhote de Dragão | **Sopro Menor** | golpe de força 1,5 e queimadura por 3 rodadas | 12 | 3 |
|  | 2 | Dragão Alado | **Escamas** | corta 70% do dano por 2 rodadas | 14 | 5 |
|  | 3 | Ryūjin, o Dragão Menor Desperto | **Voo Rasante** | golpe de força 2,5 que atravessa 30% da defesa | 28 | 5 |

## 47.3b O personagem depois da união

A arte tem **três quadros**: o personagem como era, a fera (com as cores dele) e, em destaque na moldura dourada, **o personagem depois da união**.
Essa terceira imagem passa a ser a aparência dele de verdade: a `ficha` e a carta mostram o retrato novo a partir do despertar.

| Estágio | O que o retrato ganha (todos os animais) | Por animal |
|:---:|------------------------------------------|------------|
| 1 | Presas e olhar de fera | Orelhas ou traço do animal (raposa, lobo, tigre; penas para o corvo; chifres pequenos para serpente e dragão) |
| 2 | Pelagem no corpo e a marca da lua no rosto | Tigre: cicatriz · Corvo: pena · Coelho: rubor · Dragão: chifres de dragão |
| 3 | Aura, fagulhas e olhos acesos | Serpente: olhos de dragão · Dragão: asas e sombra de dragão |

Rosto, cabelo, cor do cabelo, cor dos olhos, pele e roupa **não mudam**: continua sendo o mesmo personagem. O retrato original fica guardado, e o que ele ganhar por outros caminhos (como a venda dos Olhos da Terra) é mantido.

## 47.5 Força da Natureza: o espírito do reino

A mesma lógica vale para a classe **Força da Natureza**. Em vez de um animal, ela carrega o **espírito da floresta do reino onde nasceu** (um kodama), que cresce em três estágios: broto, guardião e árvore anciã.

- **Como desperta:** com a **Semente do Primeiro Bosque** (aparece explorando, 6% de chance, só quando o jogador já tem nível para o próximo estágio e não tem outra na bolsa) e `usar semente`, ou pelo mestre com `mestre transformar <nome>` (ignora o nível). Níveis mínimos: 1, 20 e 40, iguais aos da fera.
- **Cada linhagem só usa o seu item:** a Relíquia não serve para a Força da Natureza e a Semente não serve para o Meio-humano. O item não é gasto se não der certo, e pode ser dado a outro jogador.
- **A arte no grupo** tem os mesmos três quadros: quem era, o espírito (árvore com os olhos do jogador e o coração na cor do cabelo dele) e quem é agora.
- **Comando:** `forma` (ou `espirito`, `fera`) mostra os estágios, as habilidades e os atributos.

| Reino | Estágio | Nome | Habilidade | O que faz | Mana | Recarga |
|-------|:---:|------|-----------|-----------|:---:|:---:|
| Homura | 1 | Broto de Cinza | **Semente de Brasa** | golpe de força 1,3 e queimadura por 3 rodadas | 10 | 3 |
|  | 2 | Guardião da Queimada | **Casca de Carvão** | corta 70% do dano por 2 rodadas | 14 | 5 |
|  | 3 | Hi-no-Kodama, a Floresta que Renasce | **Renascer das Cinzas** | cura 35% da vida e protege por 2 rodadas | 24 | 5 |
| Watatsumi | 1 | Broto de Lótus | **Raiz Encharcada** | golpe de força 1,2 que prende por 1 rodada | 12 | 4 |
|  | 2 | Guardião do Mangue | **Orvalho** | cura 30% da vida | 14 | 4 |
|  | 3 | Mizu-no-Kodama, o Lótus de Mil Anos | **Maré Verde** | golpe de força 2,3 que enfraquece | 26 | 5 |
| Daichi (e Kokū) | 1 | Broto de Carvalho | **Chicote de Cipó** | dois golpes de força 0,8 | 10 | 3 |
|  | 2 | Guardião do Bosque | **Casca de Carvalho** | corta 75% do dano por 2 rodadas | 14 | 5 |
|  | 3 | Ō-Kodama, o Carvalho Ancião | **Punho da Floresta** | golpe de força 2,5 que quebra a guarda | 28 | 5 |
| Fūjin | 1 | Broto de Cerejeira | **Chuva de Pétalas** | três golpes de força 0,55 | 10 | 3 |
|  | 2 | Guardião do Bambuzal | **Dobrar com o Vento** | esquiva 80% por 1 rodada e o próximo golpe vale +50% | 12 | 4 |
|  | 3 | Kaze-no-Kodama, a Cerejeira Eterna | **Florada** | cinco golpes de força 0,5 | 26 | 5 |

**O retrato depois da união:** estágio 1, folhas no cabelo e um ramo no ombro; estágio 2, galhos como uma galhada, olhos acesos e o traço do reino (brasas em Homura, fitas de água em Watatsumi, raízes em Daichi, pena em Fūjin); estágio 3, coroa de flores, veios de seiva e aura. Folhas e flores saem na cor do reino (laranja-brasa, verde-água com lótus rosa, verde com flor amarela, rosa-cerejeira). Rosto, cabelo, olhos, pele e roupa não mudam.

Exemplos: `docs/img/despertar-natureza-daichi-1.png`, `-daichi-2.png`, `-daichi-3.png`, `-homura-3.png`, `-fujin-3.png`, `-watatsumi-3.png`.

## 47.6 Atributos por estágio (as duas linhagens)

Além da habilidade, cada despertar fortalece dois atributos da forma. O bônus é calculado sobre os atributos do próprio jogador e **não se acumula**: o do estágio novo substitui o anterior.

| Estágio | Bônus |
|:---:|:---:|
| 1 | +6% |
| 2 | +12% |
| 3 | +20% |

| Forma | Atributos | Forma | Atributos |
|-------|-----------|-------|-----------|
| raposa | MAG e VEL | dragão menor | FOR e MAG |
| lobo | FOR e VEL | espírito de Homura | MAG e FOR |
| tigre | FOR e DEF | espírito de Watatsumi | MAG e RES |
| corvo | VEL e SOR | espírito de Daichi/Kokū | DEF e RES |
| serpente | RES e MAG | espírito de Fūjin | MAG e VEL |
| coelho | VEL e SOR | | |

O bônus funciona como um equipamento que não sai: não altera os atributos de base (mérito, pontos de nível), mas é somado em **todas** as contas — batalha, luta em grupo, calamidades e monstros, duelos — e aparece na `ficha` (linha "Forma desperta"), na carta e em `forma`. Exemplo: MAG 40 no 3º estágio de Homura vira MAG 48.

Quem já tinha despertado antes desta mudança recebe o bônus automaticamente (ele é calculado na hora, a partir do estágio guardado).

## 47.7 Duelos: vale tudo o que o jogador tem

Antes, o duelo usava só Atacar, Defender, Magia e as habilidades da classe. Agora o menu do duelo traz também, com a origem ao lado do nome:

- habilidades do **despertar** (fera ou espírito);
- magias dos **grimórios abertos** (as de batalha; as utilitárias continuam fora);
- habilidades dos **Grandes Itens equipados**;
- as dos **Olhos da Terra**;
- o **companheiro** ataca junto sempre que o dono parte para cima, como nas batalhas.

Os atributos do duelo já incluíam o equipamento; agora incluem também o bônus do despertar. Quem não tem mana usa essas habilidades sem custo, como nas batalhas. Recargas e efeitos (queimadura, prender, enfraquecer, quebrar a guarda, proteção, cura reduzida de duelo) seguem as regras do duelo.

## 47.9 Mago: os Círculos Arcanos

A mesma lógica para o **Mago**. Em vez de fera ou espírito, ele abre **três Círculos Arcanos** da escola do seu elemento.

- **Como abre:** com o **Selo Arcano** (aparece explorando, 6% de chance, mesmas condições das outras linhagens) e `usar selo arcano`, ou pelo mestre com `mestre transformar <nome>`. Níveis mínimos 1, 20 e 40. (`usar selo`, sozinho, continua sendo o teletransporte do mestre.)
- **Escola pelo elemento:** Chama (Fogo, Lava, Explosão, Cinzas) · Maré (Água, Gelo, Espelho, Veneno) · Pedra (Terra, Metal, Cristal, Madeira, Natureza) · Tempestade (Vento, Raio, Som) · Véu (Trevas, Luz, Alma, Tempo, Espaço e qualquer outro).
- **A arte no grupo:** quem era · o "eu arcano" (centelha → vulto encapuzado com um círculo → arquimago com três círculos e orbes, na cor do elemento e com os olhos do jogador) · quem é agora.
- **O retrato:** 1º círculo, runas no ombro e uma marca sob o olho; 2º, um círculo mágico atrás da cabeça e olhos acesos; 3º, orbes em órbita, aura e o traço da escola. Tudo na cor do elemento do mago.
- **Atributos:** +6% / +12% / +20% em MAG e mais um: VEL (Chama e Tempestade), RES (Maré), DEF (Pedra), SOR (Véu).
- **Comando:** `circulos` (ou `forma`, `arcano`).

| Escola | Círculo | Título | Habilidade | O que faz | Mana | Recarga |
|--------|:---:|--------|-----------|-----------|:---:|:---:|
| Chama | 1 | Iniciado da Chama | **Lança de Chamas** | magia de força 1,4 e queimadura por 3 rodadas | 12 | 3 |
|  | 2 | Adepto da Chama | **Manto Incandescente** | corta 60% do dano por 2 rodadas e o próximo golpe vale +50% | 16 | 5 |
|  | 3 | Arquimago do Sol | **Sol Menor** | magia de força 2,6 e queimadura por 3 rodadas | 30 | 5 |
| Maré | 1 | Iniciado da Maré | **Agulhas de Gelo** | três magias de força 0,55 | 12 | 3 |
|  | 2 | Adepto da Maré | **Espelho d'Água** | corta 75% do dano por 2 rodadas | 16 | 5 |
|  | 3 | Arquimago do Abismo | **Maré Absoluta** | magia de força 2,2 que prende por 1 rodada | 30 | 5 |
| Pedra | 1 | Iniciado da Pedra | **Estilhaço** | magia de força 1,4 que abala a guarda | 12 | 3 |
|  | 2 | Adepto da Pedra | **Muralha Rúnica** | corta 80% do dano por 2 rodadas | 16 | 5 |
|  | 3 | Arquimago da Montanha | **Meteoro** | magia de força 2,6 que atravessa 30% da defesa | 30 | 5 |
| Tempestade | 1 | Iniciado da Tempestade | **Fagulha em Cadeia** | duas magias de força 0,8 | 12 | 3 |
|  | 2 | Adepto da Tempestade | **Passo do Relâmpago** | esquiva 80% por 1 rodada e o próximo golpe vale +50% | 14 | 4 |
|  | 3 | Arquimago do Trovão | **Juízo do Trovão** | magia de força 2,4 que prende por 1 rodada | 30 | 5 |
| Véu | 1 | Iniciado do Véu | **Dardo Astral** | magia de força 1,3 com +3 no dado | 12 | 3 |
|  | 2 | Adepto do Véu | **Véu das Horas** | cura 30% da vida e protege por 2 rodadas | 18 | 5 |
|  | 3 | Arquimago das Estrelas | **Colapso Estelar** | magia de força 2,5 que enfraquece | 30 | 5 |

As magias dos círculos são sempre mágicas (usam MAG e o elemento do mago, com vantagem e desvantagem de elemento), somam-se ao kit do Mago e valem em batalhas, calamidades e duelos.

Exemplos: `docs/img/despertar-arcano-veu-1.png`, `-veu-2.png`, `-veu-3.png`, `-chama-3.png`, `-mare-3.png`, `-pedra-3.png`, `-tempestade-3.png`.

## 47.8 Limites conhecidos

- As habilidades não foram calibradas por simulação. As do 3º estágio equivalem às habilidades de nível 25 das classes; um Meio-humano no 3º despertar tem três habilidades a mais que as outras classes.
- A forma animal usa os desenhos de criatura que o jogo já tinha (raposa, lobo, tigre e coelho partem do mesmo molde de fera, mudando orelhas, focinho, caudas e marcas).
- O jogador não "vira" o animal durante a luta: a transformação é o despertar, e o que fica são as habilidades.
- Os bônus de atributo e as habilidades da Força da Natureza também não foram calibrados por simulação. Nas batalhas, um jogador desperto fica um pouco acima das metas de dificuldade medidas no doc 38 (até +20% em dois atributos no 3º estágio).
- **Duelos:** a calibração entre classes (doc 42) foi feita só com as habilidades de classe e continua valendo para dois jogadores "limpos". Com grimórios, Grandes Itens e despertar no duelo, quem tem mais coisas leva vantagem real; isso é intencional ("vale tudo"), mas não está medido.
- Os Círculos Arcanos também não foram calibrados por simulação. O Mago já era a classe de maior dano mágico; no 3º círculo ele ganha +20% de MAG e três magias a mais.
