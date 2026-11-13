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

## 47.4 Limites conhecidos

- As habilidades não foram calibradas por simulação. As do 3º estágio equivalem às habilidades de nível 25 das classes; um Meio-humano no 3º despertar tem três habilidades a mais que as outras classes.
- A forma animal usa os desenhos de criatura que o jogo já tinha (raposa, lobo, tigre e coelho partem do mesmo molde de fera, mudando orelhas, focinho, caudas e marcas).
- O jogador não "vira" o animal durante a luta: a transformação é o despertar, e o que fica são as habilidades.
