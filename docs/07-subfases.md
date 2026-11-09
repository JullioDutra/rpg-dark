# 07 — Subfases e Masmorras

> Arquivo **gerado** a partir de `data/subfases.json`.

Subfases são áreas instanciadas dentro das regiões: masmorras, arenas, labirintos, provações e santuários.
São descobertas por **exploração** (comando `!explorar`), por **pistas da IA narradora**, por **itens** ou por
**marcos da história**. Cada subfase tem:

- **Faixa de nível** recomendada (entrar abaixo é permitido, mas arriscado).
- **Mecânica única** — nenhuma subfase joga igual à outra.
- **Chefe** (dos 100 vilões) e inimigos comuns.
- **Grimório(s) simples** como recompensa garantida na 1ª vitória de cada jogador.
- **Chance de Amuleto da Perdição** e um **segredo** (gancho narrativo para a IA usar).
- Podem ser feitas **solo** ou em **party de até 5** (`!party`).
- Subfases **[LENDÁRIA]** guardam os Grandes Itens: o primeiro a vencer leva; as seguintes vitórias dão só XP/ouro.

**Tipos:** masmorra · arena · labirinto · enigma · investigação · provação · santuário · treino · horda · chefe · evento · lendária · torre

| Reino | Qtd |
|---|:---:|
| 焔 Homura-koku | 8 |
| 水 Watatsumi-koku | 8 |
| 土 Daichi-koku | 8 |
| 風 Fūjin-koku | 8 |
| 虚空 Kokū — Terra Central | 4 |
| **Total** | **36** |

---

## 焔 Homura-koku

### SF-HOM-01 · A Mina de Obsidiana Abandonada
*Deserto de Haijin · masmorra · Nível 1–8*

Túneis de vidro negro onde o capataz Kurogane prende mineiros perdidos. O calor aumenta a cada andar.

- **Mecânica:** Calor crescente: −2% HP por sala para quem não tem afinidade Fogo. Salvar mineiros dá Mérito.
- **Chefe:** V005 Capataz Kurogane
- **Inimigos:** V001 Haikobo
- **Grimórios:** G01 Caderno de Faíscas do Mineiro
- **Segredo:** Uma parede de obsidiana reflete a imagem do Quinto Portador quando iluminada com Lanterna de Brasa.

### SF-HOM-02 · Torneio dos Novatos do Coliseu de Brasas
*Kagutsuchi-jō · arena · Nível 8–14*

Torneio de chaveamento: 3 lutas seguidas sem cura entre elas, diante da plateia e do rei Ryūen.

- **Mecânica:** Plateia: ações ousadas dão +Fama (bônus de 5% por luta). Fugir = desclassificação e −Mérito.
- **Chefe:** V038 Ōgama
- **Inimigos:** V003 Gonzō Mão-Brasa, V008 Enkai
- **Grimórios:** G02 Manual do Duelista Rubro
- **Segredo:** O vencedor recebe uma audiência com o rei Ryūen (gancho de história).

### SF-HOM-03 · O Labirinto dos Vagalumes
*Floresta Hotaru-bi · labirinto · Nível 10–16*

As árvores mudam de lugar a cada hora. Só os vagalumes sabem o caminho — se você souber ler constelações.

- **Mecânica:** Labirinto por escolhas (esquerda/direita/seguir luz). Escolhas erradas geram encontros.
- **Chefe:** V040 Hotaru-hime
- **Inimigos:** V004 Enxame Carniceiro
- **Grimórios:** G03 Constelário dos Vagalumes
- **Segredo:** Na lua nova, os vagalumes desenham o mapa até as Ruínas de Enma.

### SF-HOM-04 · Os Navios Fantasmas de Haijin
*Deserto de Haijin · masmorra · Nível 12–20*

Uma frota encalhada nas dunas de cinza. À noite, os mortos voltam a remar na areia.

- **Mecânica:** Só aparece à noite (18h–6h real). Luz causa dano dobrado aqui.
- **Chefe:** V039 Capitã Mizuchi
- **Inimigos:** V006 Marinheiro-Esqueleto
- **Grimórios:** G04 Diário de Bordo das Cinzas
- **Segredo:** O diário da capitã diz para onde o mar foi: para dentro do Vazio.

### SF-HOM-05 · O Coração de Hinokami
*Monte Hinokami · santuario · Nível 25–35*

A cratera do vulcão sagrado abre a cada 7 dias reais. Dentro, o ninho da fênix — agora corrompida. Também é o Santuário Espiritual do Fogo.

- **Mecânica:** Só abre 1 dia a cada 7. Elegíveis a pet de fogo fazem a provação aqui após vencer o chefe.
- **Chefe:** V062 Hinotori Corrompida
- **Inimigos:** V007 Inugami Filhote
- **Grimórios:** G05 Pergaminho da Fênix
- **Amuleto da Perdição:** 3% por vitória
- **Segredo:** Uma pena da fênix pura sobreviveu — item de cura total única.

### SF-HOM-06 · A Ponte do Dragão Adormecido
*Rio Yōgan · chefe · Nível 32–42*

Atravessar o Rio Yōgan pela ponte mais antiga… que respira.

- **Mecânica:** Batalha em 3 fases: sobre a ponte, na lava (dano por turno sem resistência a fogo), e no ar.
- **Chefe:** V064 Yōgan-ryū
- **Inimigos:** V002 Salamandra Faminta, V041 Gōen
- **Grimórios:** G06 Escamas do Rio Yōgan
- **Amuleto da Perdição:** 5% por vitória
- **Segredo:** Escamas do dragão forjam a melhor armadura de fogo do jogo (via Gōen, se redimido).

### SF-HOM-07 · O Portão de Enma
*Ruínas de Enma · masmorra · Nível 55–70*

Descer pelas torres afundadas até o tribunal do submundo de fogo.

- **Mecânica:** Julgamento: o chefe fica mais forte conforme o número de vilões que o grupo já matou (misericórdia conta).
- **Chefe:** V081 Enma-ō
- **Inimigos:** V063 General Bakuen, V006 Marinheiro-Esqueleto
- **Grimórios:** G07 Códice do Juiz Infernal
- **Amuleto da Perdição:** 10% por vitória
- **Segredo:** O livro de registros de Enma tem o nome verdadeiro do Quinto Portador.

### SF-HOM-08 · [LENDÁRIA] A Câmara do Último Duelo
*Kagutsuchi-jō · lendaria · Nível 60+*

Sob o Coliseu de Brasas, a arena onde o Quinto Portador lutou seu último duelo. O adversário ainda espera.

- **Mecânica:** Duelo Eterno: o chefe escolhe um jogador para 1×1 por 3 turnos; o resto do grupo só pode assistir/curar.
- **Chefe:** V082 Kagerō Ryūketsu
- **Grimórios:** G08 Tratado da Chama Eterna
- **⭐ Item lendário:** Shitenchō — Capítulo do Fogo (Céu Rubro)
- **Amuleto da Perdição:** 15% por vitória


---

## 水 Watatsumi-koku

### SF-WAT-01 · As Palafitas Afundadas de Amiya
*Arquipélago Shiranami · masmorra · Nível 1–8*

A vila de pescadores foi tomada por piratas e os afogados não deixam ninguém sair.

- **Mecânica:** Maré: a cada 3 turnos o nível da água sobe (−VEL para quem não é de Água).
- **Chefe:** V011 Sabuurō Dente-de-Ouro
- **Inimigos:** V009 Kappa Ladrão, V013 Afogado de Amiya
- **Grimórios:** G09 Cartilha das Marés de Amiya
- **Segredo:** Os afogados param de atacar se alguém fizer o funeral deles (missão de Mérito).

### SF-WAT-02 · A Biblioteca Submersa — Ala Proibida
*Ryūgū-jō · enigma · Nível 15–22*

Corredores de livros encharcados que sussurram. Barulho acorda a bibliotecária.

- **Mecânica:** Furtividade: cada ação barulhenta (magia de área, explosão) acumula Ruído; 100 de Ruído = chefe aparece fortalecido.
- **Chefe:** V043 Shiori
- **Inimigos:** V015 Guarda-Coral Corrompido
- **Grimórios:** G10 Índice da Ala Proibida
- **Amuleto da Perdição:** 2% por vitória
- **Segredo:** Um livro registra a guerra antiga entre Fogo e Água — e quem a começou de verdade.

### SF-WAT-03 · O Reflexo do Passado
*Lago Kagami · provacao · Nível 18–26*

Na lua cheia, mergulhar no reflexo leva a uma versão do lago no passado. Seu reflexo não quer que você volte.

- **Mecânica:** O chefe copia os atributos do jogador. Vence quem usar algo que o 'eu de ontem' não tinha (itens/aprendizados recentes).
- **Chefe:** V044 O Reflexo Invertido
- **Grimórios:** G11 Espelho de Kagami
- **Amuleto da Perdição:** 3% por vitória
- **Segredo:** No passado, é possível ver um evento-chave da história do autor.

### SF-WAT-04 · A Ilha que Anda
*Arquipélago Shiranami · masmorra · Nível 22–30*

A frota do Almirante Kujira acampou no casco de uma tartaruga ancestral que vaga pelo arquipélago.

- **Mecânica:** A ilha se move: a cada 5 turnos, a subfase muda de região do arquipélago (novos inimigos).
- **Chefe:** V046 Almirante Kujira
- **Inimigos:** V011 Sabuurō Dente-de-Ouro, V009 Kappa Ladrão
- **Grimórios:** G12 Carta Náutica do Almirante
- **Amuleto da Perdição:** 3% por vitória
- **Segredo:** Libertar a tartaruga dá uma montaria marítima única.

### SF-WAT-05 · O Pântano dos Pactos
*Pântano Numa-no-Me · masmorra · Nível 25–34*

Onde bruxos vêm assinar contratos. Yamanba vende grimórios por anos de vida — ou você pode tomá-los.

- **Mecânica:** Pode-se negociar em vez de lutar: perde 5% do HP máx permanente (até recuperar por mérito) e ganha o grimório sem combate.
- **Chefe:** V047 Yamanba
- **Inimigos:** V012 Sapo-Bruxo, V045 Namazu
- **Grimórios:** G13 Grimório do Pacto de Lótus
- **Amuleto da Perdição:** 4% por vitória
- **Segredo:** Yamanba sabe quem fez o pacto que rachou o primeiro selo.

### SF-WAT-06 · O Santuário Atrás da Queda
*Cachoeiras Taki-no-Koe · santuario · Nível 18–28*

Atrás da maior cachoeira, o santuário dos espíritos. O guardião-carpa testa quem quer um pet.

- **Mecânica:** Santuário Espiritual da Água: elegíveis a pet fazem a provação. Não elegíveis podem lutar só pelo grimório.
- **Chefe:** V042 Ugetsu
- **Inimigos:** V016 Sereia do Canto Partido
- **Grimórios:** G14 Canções de Taki-no-Koe
- **Segredo:** A água canta o nome de um jogador do grupo… (evento de história).

### SF-WAT-07 · A Legião Congelada de Hyōga
*Geleira Hyōga · horda · Nível 38–48*

Um exército inteiro preso no gelo começa a descongelar.

- **Mecânica:** Horda: 5 ondas de inimigos antes do chefe. Fogo derrete o gelo mas acorda mais soldados.
- **Chefe:** V066 Hyōō
- **Inimigos:** V014 Lobo de Hyōga
- **Grimórios:** G15 Ordens da Legião Congelada
- **Amuleto da Perdição:** 6% por vitória
- **Segredo:** Os estandartes do exército são do Quinto Portador — eles lutaram ao lado dele.

### SF-WAT-08 · [LENDÁRIA] O Leito do Leviatã
*Fossa Shinkai · lendaria · Nível 65+*

Descer ao fundo da fossa, onde a luz não chega e o leviatã dorme sobre o capítulo da água.

- **Mecânica:** Pressão: −5% HP máx por andar (5 andares) sem item de respiração/afinidade Água.
- **Chefe:** V083 Leviatã de Shinkai
- **Inimigos:** V067 Nure-onna
- **Grimórios:** G16 Códice Abissal
- **⭐ Item lendário:** Shitenchō — Capítulo da Água (Céu Profundo)
- **Amuleto da Perdição:** 15% por vitória
- **Segredo:** O fundo da fossa toca o Vazio por baixo da terra.


---

## 土 Daichi-koku

### SF-DAI-01 · Os Ninhos nos Trigais
*Planícies Kogane · masmorra · Nível 1–8*

Túneis de ratos-toupeira sob o trigo dourado e um espantalho que acordou.

- **Mecânica:** Emboscadas: inimigos saem do chão (teste de VEL para não ser surpreendido).
- **Chefe:** V018 Kakashi
- **Inimigos:** V017 Rato-Toupeira Gigante
- **Grimórios:** G17 Almanaque do Lavrador
- **Segredo:** Os círculos nas plantações formam um aviso em língua antiga.

### SF-DAI-02 · A Rebelião dos Golens
*Iwakura-jō · masmorra · Nível 8–15*

Os golens dos elevadores pararam a cidade vertical. O primeiro golem que pensou exige direitos.

- **Mecânica:** Pode terminar em diálogo: convencer Tetsuo (teste narrativo julgado pela IA + SOR) evita a luta e dá Mérito dobrado.
- **Chefe:** V050 Tetsuo
- **Inimigos:** V019 Golem de Treino Defeituoso
- **Grimórios:** G18 Runas do Golem
- **Segredo:** Os golens ouviram o coração da montanha bater mais rápido.

### SF-DAI-03 · A Porta na Árvore
*Floresta Kodama · enigma · Nível 15–22*

Uma árvore-colosso tem uma porta. Dentro, uma biblioteca de raízes — e uma aranha nos galhos.

- **Mecânica:** Enigmas dos kodama (respostas de texto livre avaliadas pela IA). Errar invoca inimigos.
- **Chefe:** V051 Guardião das Raízes
- **Inimigos:** V020 Kodama Raivoso, V048 Tsuchigumo
- **Grimórios:** G19 Livro das Raízes Antigas
- **Amuleto da Perdição:** 2% por vitória
- **Segredo:** Uma raiz guarda a semente da primeira árvore (item de história).

### SF-DAI-04 · As Profundezas Cristalinas
*Minas de Shōseki · masmorra · Nível 28–36*

Os níveis mais fundos das minas, onde cristais negros (Vazio solidificado) começam a aparecer.

- **Mecânica:** Cristais de mana regeneram MP do grupo; cristais negros drenam. O mapa mostra a cor só para quem tem Controle ≥ 40.
- **Chefe:** V053 Hari
- **Inimigos:** V021 Minerador de Olhos de Cristal
- **Grimórios:** G20 Prisma de Shōseki
- **Amuleto da Perdição:** 4% por vitória
- **Segredo:** Os cristais negros estão crescendo em direção a Iwakura.

### SF-DAI-05 · O Teste dos Mil Degraus
*Cordilheira Tetsuzan · treino · Nível 20–30*

Subir mil degraus de ferro sob raios até o eremita. Subfase de treino: dá atributos por mérito.

- **Mecânica:** 10 etapas de desafios rápidos (comandos em tempo limite). Cada etapa: +1 em um atributo físico (máx. 1× por jogador).
- **Chefe:** V052 Mestre Tetsuzan
- **Inimigos:** V023 Jūbei Garra-de-Ferro
- **Grimórios:** G21 Sutra dos Mil Degraus
- **Segredo:** O eremita conheceu o Quinto Portador quando criança.

### SF-DAI-06 · O Crânio que Pensa
*Cânion Ryūkotsu · chefe · Nível 35–45*

Entrar pela órbita do crânio do dragão e enfrentar sua mente.

- **Mecânica:** O chefe usa magias aleatórias do próprio grupo. Grupos menores e variados levam vantagem.
- **Chefe:** V070 O Crânio de Ryūkotsu
- **Inimigos:** V022 Abutre-Osso
- **Grimórios:** G22 Memórias do Dragão de Ossos
- **Amuleto da Perdição:** 6% por vitória
- **Segredo:** O dragão lembra quem o matou — e não foi um humano.

### SF-DAI-07 · O Rio dos Mortos
*Cavernas Yomi-no-Ana · masmorra · Nível 48–58*

Descer até o rio subterrâneo onde a barqueira decide quem volta.

- **Mecânica:** Jogadores derrotados aqui viram inimigos controlados pela barqueira até o fim da batalha.
- **Chefe:** V072 Yomotsu
- **Inimigos:** V024 Sombra de Yomi
- **Grimórios:** G23 Livro de Yomi
- **Amuleto da Perdição:** 10% por vitória
- **Segredo:** É possível conversar com um morto importante para a história.

### SF-DAI-08 · [LENDÁRIA] O Coração da Montanha
*Iwakura-jō · lendaria · Nível 62+*

No centro da montanha-capital, um coração de pedra bate. Cada batida treme o reino.

- **Mecânica:** Ritmo: a cada 3 turnos uma Batida atordoa — quem 'defender' no turno certo é imune.
- **Chefe:** V086 O Coração da Montanha
- **Grimórios:** G24 Código da Raiz do Mundo
- **⭐ Item lendário:** Shitenchō — Capítulo da Terra (Céu de Pedra)
- **Amuleto da Perdição:** 15% por vitória
- **Segredo:** O coração é de Ōyamatsumi, o deus da montanha.


---

## 風 Fūjin-koku

### SF-FUJ-01 · Os Ninhos de Harpias
*Estepe Susuki · masmorra · Nível 1–8*

Rochedos no meio do capim prateado onde harpias guardam cavalos roubados — e um tengu novato quer provar valor.

- **Mecânica:** Vento lateral: ataques à distância têm −20% precisão, exceto afinidade Vento.
- **Chefe:** V026 Karasu
- **Inimigos:** V025 Harpia da Estepe
- **Grimórios:** G25 Diário do Mensageiro
- **Segredo:** Devolver os cavalos aos nômades dá uma montaria-vento.

### SF-FUJ-02 · As Correntes Sabotadas
*Amagumo-jō · investigacao · Nível 12–18*

Alguém está cortando as correntes que prendem a cidade ao céu. Descobrir quem, antes que ela caia.

- **Mecânica:** Investigação: coletar 3 pistas conversando com NPCs (IA); acusar a pessoa certa evita a luta pior.
- **Chefe:** V055 Kurokaze
- **Inimigos:** V028 Sabotador Encapuzado
- **Grimórios:** G26 Cifra dos Espiões
- **Segredo:** O espião recebe ordens de alguém da família real.

### SF-FUJ-03 · O Desafio do Vento
*Picos Tengu · provacao · Nível 20–28*

No mosteiro dos tengu, quem vencer o abade em combate ganha o Livro da Espada-Vento. Também é o Santuário Espiritual do Vento.

- **Mecânica:** Desafio de honra: itens consumíveis proibidos. Elegíveis a pet de vento fazem a provação aqui.
- **Chefe:** V056 Sōjōbō
- **Inimigos:** V026 Karasu
- **Grimórios:** G27 Kenpū — O Livro da Espada-Vento
- **Segredo:** Os tengu guardam uma pena do Quinto Portador.

### SF-FUJ-04 · As Vozes de Kazenaki
*Desfiladeiro Kazenaki · masmorra · Nível 22–30*

O vento chora com vozes humanas. Algumas pedem socorro; outras mentem.

- **Mecânica:** Escolhas de voz: seguir a voz certa leva ao chefe; a errada leva a emboscadas. Silêncio (G28) ajuda.
- **Chefe:** V057 Coro de Kazenaki
- **Inimigos:** V030 Fantasma Chorão
- **Grimórios:** G28 Partitura de Kazenaki
- **Amuleto da Perdição:** 3% por vitória
- **Segredo:** Uma das vozes é de um personagem que o autor pode querer trazer de volta.

### SF-FUJ-05 · A Ilha Presa
*Ilhas Ukishima · masmorra · Nível 35–45*

A única ilha flutuante que não se move. Embaixo dela, correntes — e algo preso.

- **Mecânica:** Combate aéreo: quem cair da ilha volta após 1 turno com −10% HP. A corsária Hayabusa pode ajudar ou atrapalhar.
- **Chefe:** V075 Kusarigami
- **Inimigos:** V029 Grifo Selvagem, V058 Hayabusa
- **Grimórios:** G29 Manual da Pedra Flutuante
- **Amuleto da Perdição:** 5% por vitória
- **Segredo:** As correntes são iguais às que prendem Amagumo-jō.

### SF-FUJ-06 · [LENDÁRIA] O Templo do Deus Adormecido
*Templo Raijin · lendaria · Nível 65+*

A sacerdotisa conseguiu: o deus do trovão acordou. E guarda o capítulo do vento.

- **Mecânica:** Tempestade: a cada turno um raio cai em alguém aleatório (inclusive inimigos). Metal atrai raios.
- **Chefe:** V087 Raijin Desperto
- **Inimigos:** V027 Raposa-Trovão, V059 Raiko, V074 Nue
- **Grimórios:** G30 Rolo dos Tambores de Raijin
- **⭐ Item lendário:** Shitenchō — Capítulo do Vento (Céu Errante)
- **Amuleto da Perdição:** 15% por vitória

### SF-FUJ-07 · [LENDÁRIA] O Círculo sem Vento
*Estepe Susuki · lendaria · Nível 50+*

No meio da estepe, um círculo onde o capim não se mexe. No centro, uma espada numa pedra.

- **Mecânica:** Prova do Coração: o motor avalia o histórico de Mérito/honra do jogador. Só um jogador por vez.
- **Chefe:** V079 O Guardião sem Vento
- **⭐ Item lendário:** Excalibur
- **Segredo:** A pedra tem uma inscrição: 'Para o quinto que vier.'

### SF-FUJ-08 · [LENDÁRIA] A Torre Fora do Mapa
*Olho da Tempestade Arashi-no-Me · lendaria · Nível 70+*

Atravessar o furacão eterno até o olho silencioso, onde uma torre que não aparece em mapas guarda a joia do espaço.

- **Mecânica:** Andares que se reorganizam (portas levam a andares aleatórios). Jogadores podem ser separados.
- **Chefe:** V089 O Arquivista
- **Inimigos:** V073 Arashimaru, V032 Elemental de Rajada
- **⭐ Item lendário:** Tenmon no Tama
- **Amuleto da Perdição:** 20% por vitória
- **Segredo:** O arquivo da torre contém tudo o que já aconteceu no mundo — inclusive neste grupo.


---

## 虚空 Kokū — Terra Central

### SF-KOK-01 · O Leilão das Sombras
*Kyōkai · evento · Nível 20+*

Leilão semanal do mercado negro (evento de tempo real, 1× por semana). Grimórios, informações e às vezes amuletos.

- **Mecânica:** Lances com ouro/itens entre jogadores. Roubar o leilão é possível — e inicia a luta contra o Leiloeiro.
- **Chefe:** V060 O Leiloeiro Sem Sombra
- **Inimigos:** V034 Tatsu Dois-Preços
- **Grimórios:** G31 Livro-Caixa do Leilão, G32 Manual do Vazio Nº 1 — Corrente Zero
- **Amuleto da Perdição:** 10% por vitória
- **Segredo:** Um lote do leilão é sempre 'informação sobre um item lendário'.

### SF-KOK-02 · Os Pilares Rachados
*Muralha dos Selos · chefe · Nível 55–68*

Dois pilares da Muralha dos Selos racharam. As guardiãs gêmeas estão sendo devoradas pelo Vazio.

- **Mecânica:** Chefe duplo: matar uma gêmea enfurece a outra. Restaurar o selo (G33) em vez de matar dá Mérito alto.
- **Chefe:** V077 Kanae, V078 Shizuku
- **Inimigos:** V033 Rastejante do Vazio
- **Grimórios:** G33 Fragmento do Selo Leste, G34 Manual do Vazio Nº 2 — Lâmina Branca
- **Amuleto da Perdição:** 12% por vitória
- **Segredo:** Cada pilar quebrado libera um vilão — o motor pode soltar vilões de nível rei.

### SF-KOK-03 · [LENDÁRIA] A Floresta Petrificada
*Floresta Petrificada Ishi-no-Mori · lendaria · Nível 70+*

Tudo é pedra cinza. As estátuas se mexem quando ninguém olha. No centro, o Rei de Pedra em um trono de gente.

- **Mecânica:** Olhar: a cada turno o grupo escolhe quem 'vigia' (as estátuas não atacam essa pessoa). Espelhos refletem o olhar do chefe.
- **Chefe:** V090 Sekiō
- **Inimigos:** V035 Estátua Andante
- **Grimórios:** G35 Herbário de Pedra
- **⭐ Item lendário:** Kokūgai — A Égide do Quinto Portador
- **Amuleto da Perdição:** 20% por vitória
- **Segredo:** Despetrificar as pessoas do trono revela um vilarejo inteiro perdido (gancho).

### SF-KOK-04 · [ENDGAME] A Torre Sem Fim (Owari-naki Tō)
*Cratera do Vazio · torre · Nível 75–100*

Uma torre que desce para dentro da cratera. 100 andares. Cada 10 andares, um guardião.

- **Mecânica:** Andar 10: V080 · 20: V091 · 30–40: vilões de nível rei aleatórios · 50: capa do Shitenchō · 60–90: os quatro deuses caídos (V093–V096) · 92: V097 · 94: V098 · 96: V092 · 98: V099 · 100: o final da história (V100 provisório).
- **Chefe:** V080 Zero, V091 Yoru, V092 O Quinto que Falhou, V093 Kagutsuchi, V094 Watatsumi, V095 Ōyamatsumi, V096 Shinatsuhiko, V097 Tsukuyomi Partido, V098 Hiruko, V099 Muhyō, V100 KOKŪ
- **Inimigos:** V033 Rastejante do Vazio, V035 Estátua Andante
- **Grimórios:** G36 Grimório Estelar, G37 Grimório do Crepúsculo, G38 Manual do Vazio Nº 3 — O Fim da Magia, G39 Grimório do Tempo Partido, G40 Grimório do Quinto Elemento (incompleto)
- **⭐ Item lendário:** Shitenchō — Capa (andar 50)
- **Amuleto da Perdição:** 25% por vitória
- **Segredo:** O final pertence à história do autor.

