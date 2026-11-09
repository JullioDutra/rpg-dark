# 09 — Os 100 Vilões

> Arquivo **gerado** por `scripts/gerar-dados.mjs` a partir de `scripts/viloes-fonte.mjs`. Não edite à mão.
> Atributos são calculados por fórmula (tier × nível × arquétipo) para manter o balanceamento.

| Tier | Qtd | Faixa de nível | Multiplicador de atributos | Multiplicador de HP | Chance de Amuleto |
|------|:---:|:---:|:---:|:---:|:---:|
| ⚪ Nível Comum | 35 | 1–20 | ×1 | ×1 | 0% |
| 🟢 Médio Escalão | 25 | 14–32 | ×1.2 | ×1.6 | 1% |
| 🔵 Alto Escalão | 20 | 32–58 | ×1.45 | ×2.6 | 3% |
| 🟣 Nível Rei | 12 | 65–85 | ×1.8 | ×5 | 10% |
| 🟡 Divindade | 8 | 88–100 | ×2.4 | ×10 | 25% |
| **Total** | **100** | | | | |

**Fórmulas:** `base = 5 + nível×1,2` · `atributo = base × mult_tier × peso_arquétipo` ·
`HP = (60 + nível×20) × mult_HP_tier × peso_HP` · `XP = nível × 15 × mult_xp`.
Cada vilão tem uma carta gerada a partir de `templates/carta-vilao.html` e um prompt de imagem em `data/viloes.json`.

Os **4 reis dos reinos** (Ryūen, Kaishin, Gōtetsu, Sorahiko) **não** estão nesta lista: são NPCs cujo papel
(aliado, rival ou inimigo) será definido pela história do autor.

---

## ⚪ Nível Comum (35)

| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |
|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|
| V001 | **Haikobo** | 2 | Deserto de Haijin | Fogo | 120 | 10 | 7 | 4 | 6 | 9 | — |
| V002 | **Salamandra Faminta** | 4 | Rio Yōgan | Fogo | 170 | 13 | 10 | 6 | 8 | 12 | — |
| V003 | **Gonzō Mão-Brasa** | 6 | Costa Akashio | Fogo | 155 | 16 | 9 | 9 | 9 | 20 | — |
| V004 | **Enxame Carniceiro** | 5 | Floresta Hotaru-bi | Fogo | 190 | 14 | 11 | 7 | 9 | 13 | — |
| V005 | **Capataz Kurogane** | 8 | Deserto de Haijin | Fogo | 285 | 20 | 18 | 7 | 10 | 12 | SF-HOM-01 |
| V006 | **Marinheiro-Esqueleto** | 10 | Deserto de Haijin | Trevas | 285 | 17 | 19 | 15 | 10 | 12 | — |
| V007 | **Inugami Filhote** | 12 | Monte Hinokami | Fogo | 360 | 25 | 19 | 12 | 16 | 23 | — |
| V008 | **Enkai** | 15 | Kagutsuchi-jō | Fogo | 360 | 25 | 23 | 23 | 23 | 23 | — |
| V009 | **Kappa Ladrão** | 2 | Arquipélago Shiranami | Água | 85 | 10 | 5 | 5 | 5 | 12 | — |
| V010 | **Medusa-Lanterna** | 4 | Lago Kagami | Água | 110 | 5 | 7 | 16 | 13 | 9 | — |
| V011 | **Sabuurō Dente-de-Ouro** | 7 | Arquipélago Shiranami | Água | 200 | 15 | 13 | 13 | 13 | 13 | SF-WAT-01 |
| V012 | **Sapo-Bruxo** | 9 | Pântano Numa-no-Me | Veneno | 190 | 8 | 11 | 25 | 21 | 14 | — |
| V013 | **Afogado de Amiya** | 5 | Arquipélago Shiranami | Água | 175 | 11 | 12 | 10 | 7 | 8 | — |
| V014 | **Lobo de Hyōga** | 13 | Geleira Hyōga | Gelo | 385 | 27 | 21 | 12 | 16 | 25 | — |
| V015 | **Guarda-Coral Corrompido** | 16 | Ryūgū-jō | Água | 610 | 24 | 39 | 15 | 29 | 15 | — |
| V016 | **Sereia do Canto Partido** | 18 | Cachoeiras Taki-no-Koe | Som | 335 | 13 | 19 | 43 | 35 | 24 | — |
| V017 | **Rato-Toupeira Gigante** | 2 | Planícies Kogane | Terra | 120 | 10 | 7 | 4 | 6 | 9 | — |
| V018 | **Kakashi** | 5 | Planícies Kogane | Madeira | 160 | 12 | 11 | 11 | 11 | 11 | SF-DAI-01 |
| V019 | **Golem de Treino Defeituoso** | 7 | Iwakura-jō | Terra | 320 | 13 | 21 | 8 | 16 | 8 | — |
| V020 | **Kodama Raivoso** | 9 | Floresta Kodama | Natureza | 190 | 8 | 11 | 25 | 21 | 14 | — |
| V021 | **Minerador de Olhos de Cristal** | 12 | Minas de Shōseki | Cristal | 390 | 27 | 23 | 10 | 14 | 16 | — |
| V022 | **Abutre-Osso** | 11 | Cânion Ryūkotsu | Terra | 335 | 24 | 18 | 11 | 15 | 22 | — |
| V023 | **Jūbei Garra-de-Ferro** | 15 | Cordilheira Tetsuzan | Metal | 305 | 30 | 16 | 16 | 16 | 37 | — |
| V024 | **Sombra de Yomi** | 18 | Cavernas Yomi-no-Ana | Trevas | 460 | 27 | 29 | 24 | 16 | 19 | — |
| V025 | **Harpia da Estepe** | 3 | Estepe Susuki | Vento | 100 | 11 | 6 | 6 | 6 | 14 | — |
| V026 | **Karasu** | 6 | Picos Tengu | Vento | 180 | 13 | 12 | 12 | 12 | 12 | SF-FUJ-01 |
| V027 | **Raposa-Trovão** | 8 | Templo Raijin | Raio | 265 | 19 | 15 | 9 | 12 | 18 | — |
| V028 | **Sabotador Encapuzado** | 10 | Amagumo-jō | Vento | 220 | 22 | 12 | 12 | 12 | 27 | — |
| V029 | **Grifo Selvagem** | 13 | Ilhas Ukishima | Vento | 385 | 27 | 21 | 12 | 16 | 25 | — |
| V030 | **Fantasma Chorão** | 14 | Desfiladeiro Kazenaki | Som | 270 | 11 | 15 | 35 | 28 | 20 | — |
| V031 | **Tōgo** | 16 | Estepe Susuki | Vento | 495 | 34 | 29 | 12 | 17 | 19 | — |
| V032 | **Elemental de Rajada** | 19 | Olho da Tempestade Arashi-no-Me | Vento | 350 | 14 | 19 | 44 | 36 | 25 | — |
| V033 | **Rastejante do Vazio** | 14 | Muralha dos Selos | Vazio | 410 | 28 | 22 | 13 | 17 | 26 | — |
| V034 | **Tatsu Dois-Preços** | 17 | Kyōkai | Metal | 340 | 33 | 18 | 18 | 18 | 41 | — |
| V035 | **Estátua Andante** | 20 | Floresta Petrificada Ishi-no-Mori | Terra | 735 | 29 | 46 | 17 | 35 | 17 | — |

#### V001 · Haikobo, o Kobold de Cinzas
*Nível Comum · Nv 2 · Fogo · besta · Deserto de Haijin*  
**Habilidade:** Sopro de Cinza: cega o alvo por 1 turno · **Fraqueza:** Água · **Recompensa:** 30 XP, 16 ouro  
> Pequenas criaturas que roubam ferramentas dos mineiros e sopram cinza nos olhos de quem os persegue.

#### V002 · Salamandra Faminta, a Sombra das Pontes
*Nível Comum · Nv 4 · Fogo · besta · Rio Yōgan*  
**Habilidade:** Mordida Incandescente: queimadura por 3 turnos · **Fraqueza:** Água · **Recompensa:** 60 XP, 32 ouro  
> Lagartos de lava que seguem viajantes pelas pontes de obsidiana esperando um passo em falso.

#### V003 · Gonzō Mão-Brasa, o Contrabandista
*Nível Comum · Nv 6 · Fogo · assassino · Costa Akashio*  
**Habilidade:** Lâmina Aquecida: ignora 20% da DEF · **Fraqueza:** Água · **Recompensa:** 90 XP, 48 ouro  
> Contrabandista da névoa vermelha que prefere esfaquear a negociar.

#### V004 · Enxame Carniceiro, dos Vagalumes Famintos
*Nível Comum · Nv 5 · Fogo · besta · Floresta Hotaru-bi*  
**Habilidade:** Enxame: 3 ataques fracos por turno · **Fraqueza:** Vento · **Recompensa:** 75 XP, 40 ouro  
> Vagalumes de fogo que, numa noite sem lua, descobriram o gosto de carne.

#### V005 · Capataz Kurogane, o Senhor da Mina
*Nível Comum · Nv 8 · Fogo · bruto · Deserto de Haijin*  
**Habilidade:** Golpe de Picareta: atordoa por 1 turno · **Fraqueza:** Água · **Recompensa:** 120 XP, 64 ouro  
> Ex-capataz que tomou a mina de obsidiana abandonada e escraviza mineiros perdidos.

#### V006 · Marinheiro-Esqueleto, da Tripulação Perdida
*Nível Comum · Nv 10 · Trevas · morto-vivo · Deserto de Haijin*  
**Habilidade:** Âncora Fantasma: puxa o alvo e reduz sua VEL · **Fraqueza:** Luz · **Recompensa:** 150 XP, 80 ouro  
> Tripulantes de navios que afundaram num mar que virou deserto. Ainda remam na areia.

#### V007 · Inugami Filhote, o Cão das Três Chamas
*Nível Comum · Nv 12 · Fogo · besta · Monte Hinokami*  
**Habilidade:** Uivo Flamejante: −10% DEF de todos os inimigos · **Fraqueza:** Água · **Recompensa:** 180 XP, 96 ouro  
> Cão-espírito de fogo, ainda jovem e já cruel; anda em matilhas na encosta do vulcão.

#### V008 · Enkai, o Monge Renegado
*Nível Comum · Nv 15 · Fogo · equilibrado · Kagutsuchi-jō*  
**Habilidade:** Palma Ardente: dano e empurra o alvo para trás na ordem de turno · **Fraqueza:** Água · **Recompensa:** 225 XP, 120 ouro  
> Expulso do Coliseu por matar um oponente que já tinha se rendido. Agora caça duelistas pelas ruas.

#### V009 · Kappa Ladrão, o Ladrão das Redes
*Nível Comum · Nv 2 · Água · assassino · Arquipélago Shiranami*  
**Habilidade:** Puxão Traiçoeiro: rouba um item consumível · **Fraqueza:** Raio · **Recompensa:** 30 XP, 16 ouro  
> Rouba redes, sandálias e, dizem, crianças distraídas na beira das palafitas.

#### V010 · Medusa-Lanterna, a Luz do Lago
*Nível Comum · Nv 4 · Água · mago · Lago Kagami*  
**Habilidade:** Pulso Hipnótico: confunde por 1 turno · **Fraqueza:** Raio · **Recompensa:** 60 XP, 32 ouro  
> Água-viva que flutua no ar à noite, atraindo viajantes para o fundo do lago.

#### V011 · Sabuurō Dente-de-Ouro, o Pirata
*Nível Comum · Nv 7 · Água · equilibrado · Arquipélago Shiranami*  
**Habilidade:** Pistola de Maré: tiro que ignora esquiva · **Fraqueza:** Raio · **Recompensa:** 105 XP, 56 ouro  
> Capitão pirata de três dentes de ouro e nenhum escrúpulo. Tomou as palafitas de Amiya.

#### V012 · Sapo-Bruxo, do Pântano Negro
*Nível Comum · Nv 9 · Veneno · mago · Pântano Numa-no-Me*  
**Habilidade:** Língua Venenosa: veneno por 4 turnos · **Fraqueza:** Fogo · **Recompensa:** 135 XP, 72 ouro  
> Sapo gigante que aprendeu maldições ouvindo a bruxa do pântano.

#### V013 · Afogado de Amiya, o Pescador que Não Aceitou
*Nível Comum · Nv 5 · Água · morto-vivo · Arquipélago Shiranami*  
**Habilidade:** Abraço Encharcado: prende o alvo por 2 turnos · **Fraqueza:** Fogo · **Recompensa:** 75 XP, 40 ouro  
> Pescadores que morreram no naufrágio de Amiya e ainda tentam voltar para casa.

#### V014 · Lobo de Hyōga, o Caçador Branco
*Nível Comum · Nv 13 · Gelo · besta · Geleira Hyōga*  
**Habilidade:** Matilha: invoca +1 lobo se o HP cair abaixo de 50% · **Fraqueza:** Fogo · **Recompensa:** 195 XP, 104 ouro  
> Lobos brancos de olhos azuis que caçam em silêncio absoluto sobre o gelo.

#### V015 · Guarda-Coral Corrompido, o Soldado Negro
*Nível Comum · Nv 16 · Água · tanque · Ryūgū-jō*  
**Habilidade:** Carapaça de Coral: −30% dano físico por 2 turnos · **Fraqueza:** Raio · **Recompensa:** 240 XP, 128 ouro  
> Soldado da guarda marinha tomado por um coral negro que cresce para dentro.

#### V016 · Sereia do Canto Partido, a Que Canta Nomes
*Nível Comum · Nv 18 · Som · mago · Cachoeiras Taki-no-Koe*  
**Habilidade:** Canção Cortante: dano em todos + silêncio 1 turno · **Fraqueza:** Terra · **Recompensa:** 270 XP, 144 ouro  
> Canta o nome de quem vai morrer — e às vezes dá uma mãozinha ao destino.

#### V017 · Rato-Toupeira Gigante, a Praga dos Trigais
*Nível Comum · Nv 2 · Terra · besta · Planícies Kogane*  
**Habilidade:** Emboscada Subterrânea: sempre ataca primeiro no 1º turno · **Fraqueza:** Vento · **Recompensa:** 30 XP, 16 ouro  
> Pragas do tamanho de cães que devoram as plantações de trigo dourado.

#### V018 · Kakashi, o Espantalho Vivo
*Nível Comum · Nv 5 · Madeira · equilibrado · Planícies Kogane*  
**Habilidade:** Foice Ceifadora: crítico garantido em alvos abaixo de 30% HP · **Fraqueza:** Fogo · **Recompensa:** 75 XP, 40 ouro  
> Ganha vida nas noites de colheita e protege o campo de qualquer um — inclusive do dono.

#### V019 · Golem de Treino Defeituoso, o Que Não Para
*Nível Comum · Nv 7 · Terra · tanque · Iwakura-jō*  
**Habilidade:** Soco Pesado: dano alto, mas age por último · **Fraqueza:** Água · **Recompensa:** 105 XP, 56 ouro  
> Golem de treino da guarda que enlouqueceu e não aceita mais comandos.

#### V020 · Kodama Raivoso, o Eco da Dor
*Nível Comum · Nv 9 · Natureza · mago · Floresta Kodama*  
**Habilidade:** Eco Amaldiçoado: repete o último ataque que recebeu · **Fraqueza:** Fogo · **Recompensa:** 135 XP, 72 ouro  
> Espírito pequenino da floresta que passou a repetir só gritos de dor.

#### V021 · Minerador de Olhos de Cristal, o Que Viu Demais
*Nível Comum · Nv 12 · Cristal · bruto · Minas de Shōseki*  
**Habilidade:** Estilhaço: dano + sangramento · **Fraqueza:** Vento · **Recompensa:** 180 XP, 96 ouro  
> Ficou tempo demais perto dos cristais de mana. Agora os cristais enxergam por ele.

#### V022 · Abutre-Osso, o Comedor de Medula
*Nível Comum · Nv 11 · Terra · besta · Cânion Ryūkotsu*  
**Habilidade:** Mergulho: +20% chance de crítico · **Fraqueza:** Raio · **Recompensa:** 165 XP, 88 ouro  
> Abutres que se alimentam da medula do dragão colossal que forma o cânion.

#### V023 · Jūbei Garra-de-Ferro, o Bandoleiro da Trilha
*Nível Comum · Nv 15 · Metal · assassino · Cordilheira Tetsuzan*  
**Habilidade:** Garra de Ferro-Estelar: ignora escudos mágicos · **Fraqueza:** Fogo · **Recompensa:** 225 XP, 120 ouro  
> Saqueia peregrinos que tentam o Teste dos 1000 Degraus.

#### V024 · Sombra de Yomi, a Alma Perdida
*Nível Comum · Nv 18 · Trevas · morto-vivo · Cavernas Yomi-no-Ana*  
**Habilidade:** Toque Gélido: drena 10% do MP · **Fraqueza:** Luz · **Recompensa:** 270 XP, 144 ouro  
> Restos de almas que se perderam na descida para o mundo dos mortos.

#### V025 · Harpia da Estepe, a Ladra de Cavalos
*Nível Comum · Nv 3 · Vento · assassino · Estepe Susuki*  
**Habilidade:** Rasante: ataca e ganha +30% esquiva no turno · **Fraqueza:** Raio · **Recompensa:** 45 XP, 24 ouro  
> Roubam os cavalos-vento dos nômades e os largam do alto.

#### V026 · Karasu, o Tengu Novato
*Nível Comum · Nv 6 · Vento · equilibrado · Picos Tengu*  
**Habilidade:** Leque Cortante: dano em 2 alvos · **Fraqueza:** Fogo · **Recompensa:** 90 XP, 48 ouro  
> Aprendiz tengu arrogante que desafia todo viajante para provar seu valor.

#### V027 · Raposa-Trovão, a Faísca Viva
*Nível Comum · Nv 8 · Raio · besta · Templo Raijin*  
**Habilidade:** Choque: 20% de chance de paralisar · **Fraqueza:** Terra · **Recompensa:** 120 XP, 64 ouro  
> Raposas de pelagem elétrica que nascem dos raios que caem no templo.

#### V028 · Sabotador Encapuzado, o Cortador de Correntes
*Nível Comum · Nv 10 · Vento · assassino · Amagumo-jō*  
**Habilidade:** Bomba de Fumaça: foge garantido se HP < 30% · **Fraqueza:** Terra · **Recompensa:** 150 XP, 80 ouro  
> Agente que enfraquece, uma a uma, as correntes que prendem a cidade flutuante.

#### V029 · Grifo Selvagem, o Senhor do Ninho
*Nível Comum · Nv 13 · Vento · besta · Ilhas Ukishima*  
**Habilidade:** Garras do Céu: dano dobrado em alvos voando · **Fraqueza:** Raio · **Recompensa:** 195 XP, 104 ouro  
> Grifos não domados, extremamente territoriais.

#### V030 · Fantasma Chorão, a Voz no Vento
*Nível Comum · Nv 14 · Som · mago · Desfiladeiro Kazenaki*  
**Habilidade:** Lamento: medo, −15% FOR por 2 turnos · **Fraqueza:** Luz · **Recompensa:** 210 XP, 112 ouro  
> Uma das vozes presas no vento do desfiladeiro que ganhou forma — e raiva.

#### V031 · Tōgo, o Cavaleiro Nômade Desonrado
*Nível Comum · Nv 16 · Vento · bruto · Estepe Susuki*  
**Habilidade:** Investida: dano dobrado no 1º turno · **Fraqueza:** Terra · **Recompensa:** 240 XP, 128 ouro  
> Expulso do clã por covardia; vende a lança para quem pagar.

#### V032 · Elemental de Rajada, o Fragmento do Furacão
*Nível Comum · Nv 19 · Vento · mago · Olho da Tempestade Arashi-no-Me*  
**Habilidade:** Ciclone: dano em área · **Fraqueza:** Terra · **Recompensa:** 285 XP, 152 ouro  
> Pedaço vivo do furacão eterno, que se desprendeu e vaga com fome de movimento.

#### V033 · Rastejante do Vazio, o Sem Cor
*Nível Comum · Nv 14 · Vazio · besta · Muralha dos Selos*  
**Habilidade:** Mordida Anuladora: drena 20% do MP · **Fraqueza:** Luz · **Recompensa:** 210 XP, 112 ouro  
> Criaturas sem cor e sem rosto que saem pelas rachaduras dos pilares.

#### V034 · Tatsu Dois-Preços, o Mercenário
*Nível Comum · Nv 17 · Metal · assassino · Kyōkai*  
**Habilidade:** Contrato Duplo: se receber suborno, troca de lado no meio da luta · **Fraqueza:** Nenhuma · **Recompensa:** 255 XP, 136 ouro  
> Trabalha para quem paga mais — e costuma cobrar dos dois lados.

#### V035 · Estátua Andante, o Que Se Move no Escuro
*Nível Comum · Nv 20 · Terra · tanque · Floresta Petrificada Ishi-no-Mori*  
**Habilidade:** Imóvel ao Olhar: só pode ser atingida se o jogador passar num teste de VEL · **Fraqueza:** Raio · **Recompensa:** 300 XP, 160 ouro  
> Pessoas petrificadas que se movem quando ninguém está olhando.


---

## 🟢 Médio Escalão (25)

| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |
|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|
| V036 | **Kagari** | 20 | Kagutsuchi-jō | Fogo | 625 | 45 | 24 | 24 | 24 | 56 | — |
| V037 | **Okibi** | 22 | Deserto de Haijin | Cinzas | 720 | 23 | 30 | 53 | 45 | 30 | — |
| V038 | **Ōgama** | 14 | Kagutsuchi-jō | Fogo | 705 | 37 | 31 | 13 | 18 | 21 | SF-HOM-02 |
| V039 | **Capitã Mizuchi** | 18 | Deserto de Haijin | Trevas | 670 | 35 | 32 | 32 | 32 | 32 | SF-HOM-04 |
| V040 | **Hotaru-hime** | 15 | Floresta Hotaru-bi | Fogo | 520 | 17 | 22 | 39 | 33 | 22 | SF-HOM-03 |
| V041 | **Gōen** | 28 | Rio Yōgan | Lava | 1585 | 46 | 74 | 28 | 56 | 28 | — |
| V042 | **Ugetsu** | 22 | Cachoeiras Taki-no-Koe | Água | 800 | 30 | 34 | 49 | 49 | 41 | SF-WAT-06 |
| V043 | **Shiori** | 18 | Ryūgū-jō | Água | 540 | 16 | 22 | 51 | 41 | 29 | SF-WAT-02 |
| V044 | **O Reflexo Invertido** | 22 | Lago Kagami | Espelho | 800 | 41 | 38 | 38 | 38 | 38 | SF-WAT-03 |
| V045 | **Namazu** | 26 | Pântano Numa-no-Me | Terra | 1115 | 56 | 43 | 26 | 35 | 52 | — |
| V046 | **Almirante Kujira** | 25 | Arquipélago Shiranami | Água | 895 | 46 | 42 | 42 | 42 | 42 | SF-WAT-04 |
| V047 | **Yamanba** | 30 | Pântano Numa-no-Me | Trevas | 950 | 30 | 39 | 69 | 59 | 39 | SF-WAT-05 |
| V048 | **Tsuchigumo** | 20 | Floresta Kodama | Terra | 625 | 45 | 24 | 24 | 24 | 56 | — |
| V049 | **Barão Kōsaku** | 24 | Planícies Kogane | Metal | 865 | 45 | 41 | 41 | 41 | 41 | — |
| V050 | **Tetsuo** | 14 | Iwakura-jō | Terra | 870 | 26 | 42 | 16 | 31 | 16 | SF-DAI-02 |
| V051 | **Guardião das Raízes** | 20 | Floresta Kodama | Madeira | 1180 | 35 | 56 | 21 | 42 | 21 | SF-DAI-03 |
| V052 | **Mestre Tetsuzan** | 28 | Cordilheira Tetsuzan | Terra | 990 | 51 | 46 | 46 | 46 | 46 | SF-DAI-05 |
| V053 | **Hari** | 32 | Minas de Shōseki | Cristal | 895 | 26 | 36 | 83 | 68 | 47 | SF-DAI-04 |
| V054 | **Kamaitachi** | 18 | Estepe Susuki | Vento | 570 | 41 | 22 | 22 | 22 | 51 | — |
| V055 | **Kurokaze** | 16 | Amagumo-jō | Vento | 515 | 38 | 20 | 20 | 20 | 46 | SF-FUJ-02 |
| V056 | **Sōjōbō** | 25 | Picos Tengu | Vento | 895 | 46 | 42 | 42 | 42 | 42 | SF-FUJ-03 |
| V057 | **Coro de Kazenaki** | 24 | Desfiladeiro Kazenaki | Som | 780 | 24 | 32 | 57 | 49 | 32 | SF-FUJ-04 |
| V058 | **Hayabusa** | 28 | Ilhas Ukishima | Vento | 845 | 60 | 32 | 32 | 32 | 74 | — |
| V059 | **Raiko** | 32 | Templo Raijin | Raio | 895 | 26 | 36 | 83 | 68 | 47 | — |
| V060 | **O Leiloeiro Sem Sombra** | 30 | Kyōkai | Trevas | 950 | 30 | 39 | 69 | 59 | 39 | SF-KOK-01 |

#### V036 · Kagari, a Duelista Sem Rosto
*Médio Escalão · Nv 20 · Fogo · assassino · Kagutsuchi-jō*  
**Habilidade:** Contra-Ataque Espelhado: devolve 50% do dano do 1º golpe recebido · **Fraqueza:** Água · **Recompensa:** 750 XP, 400 ouro, 1% Amuleto  
> Campeã mascarada do Coliseu de Brasas. Ninguém sabe quem ela é — talvez alguém da corte.

#### V037 · Okibi, o Sacerdote da Cinza
*Médio Escalão · Nv 22 · Cinzas · invocador · Deserto de Haijin*  
**Habilidade:** Chamado dos Afogados: invoca 2 Marinheiros-Esqueleto · **Fraqueza:** Água · **Recompensa:** 825 XP, 440 ouro, 1% Amuleto  
> Lidera um culto que quer 'devolver o mar ao deserto' — com sacrifícios humanos.

#### V038 · Ōgama, o Campeão Invicto
*Médio Escalão · Nv 14 · Fogo · bruto · Kagutsuchi-jō*  
**Habilidade:** Martelo-Sol: dano muito alto a cada 2 turnos · **Fraqueza:** Água · **Recompensa:** 525 XP, 280 ouro, 1% Amuleto  
> Campeão do Torneio dos Novatos há três anos. Arrogante, mas honrado — respeita quem o vence.

#### V039 · Capitã Mizuchi, a Fantasma do Mar Perdido
*Médio Escalão · Nv 18 · Trevas · equilibrado · Deserto de Haijin*  
**Habilidade:** Comando da Tripulação: aliados mortos-vivos +30% dano · **Fraqueza:** Luz · **Recompensa:** 675 XP, 360 ouro, 1% Amuleto  
> Capitã do maior navio afundado no deserto. Procura o mar que desapareceu.

#### V040 · Hotaru-hime, a Rainha dos Vagalumes
*Médio Escalão · Nv 15 · Fogo · invocador · Floresta Hotaru-bi*  
**Habilidade:** Constelação: invoca 2 Enxames Carniceiros · **Fraqueza:** Vento · **Recompensa:** 563 XP, 300 ouro, 1% Amuleto  
> Espírito antigo que guarda o labirinto da floresta. Testa todos que entram.

#### V041 · Gōen, o Forjador Traído
*Médio Escalão · Nv 28 · Lava · tanque · Rio Yōgan*  
**Habilidade:** Armadura de Magma: reflete 25% do dano físico · **Fraqueza:** Água · **Recompensa:** 1050 XP, 560 ouro, 1% Amuleto  
> Ferreiro real que foi jogado no rio de lava por inveja. Voltou feito de magma.

#### V042 · Ugetsu, o Guardião da Queda
*Médio Escalão · Nv 22 · Água · espiritual · Cachoeiras Taki-no-Koe*  
**Habilidade:** Véu d'Água: +40% esquiva · **Fraqueza:** Raio · **Recompensa:** 825 XP, 440 ouro, 1% Amuleto  
> Espírito-carpa que testa quem é digno de um pet espiritual. Não é mau — é exigente.

#### V043 · Shiori, a Bibliotecária Afogada
*Médio Escalão · Nv 18 · Água · mago · Ryūgū-jō*  
**Habilidade:** Página Proibida: sela uma magia do alvo por 3 turnos · **Fraqueza:** Fogo · **Recompensa:** 675 XP, 360 ouro, 1% Amuleto  
> Morreu lendo o livro proibido. Continua lendo. Não gosta de barulho.

#### V044 · O Reflexo Invertido, Você, de Ontem
*Médio Escalão · Nv 22 · Espelho · equilibrado · Lago Kagami*  
**Habilidade:** Cópia: assume os atributos e a habilidade do jogador que o enfrenta · **Fraqueza:** A fraqueza do próprio jogador · **Recompensa:** 825 XP, 440 ouro, 1% Amuleto  
> Seu reflexo do passado decidiu que ele merece ser você.

#### V045 · Namazu, o Bagre do Terremoto
*Médio Escalão · Nv 26 · Terra · besta · Pântano Numa-no-Me*  
**Habilidade:** Tremor: atordoa todos por 1 turno (recarga 3) · **Fraqueza:** Raio · **Recompensa:** 975 XP, 520 ouro, 1% Amuleto  
> Bagre colossal que faz o chão tremer ao se mexer.

#### V046 · Almirante Kujira, o Senhor da Ilha que Anda
*Médio Escalão · Nv 25 · Água · equilibrado · Arquipélago Shiranami*  
**Habilidade:** Canhonaço de Maré: dano em linha · **Fraqueza:** Raio · **Recompensa:** 938 XP, 500 ouro, 1% Amuleto  
> Lidera a frota pirata que acampou no casco da tartaruga ancestral.

#### V047 · Yamanba, a Bruxa-Mãe
*Médio Escalão · Nv 30 · Trevas · invocador · Pântano Numa-no-Me*  
**Habilidade:** Pacto Cobrado: rouba 20% do MP de todos · **Fraqueza:** Luz · **Recompensa:** 1125 XP, 600 ouro, 1% Amuleto  
> Vende grimórios em troca de anos de vida. Dizem que tem 900 anos 'emprestados'.

#### V048 · Tsuchigumo, a Aranha da Terra
*Médio Escalão · Nv 20 · Terra · assassino · Floresta Kodama*  
**Habilidade:** Teia de Pedra: prende o alvo por 2 turnos · **Fraqueza:** Fogo · **Recompensa:** 750 XP, 400 ouro, 1% Amuleto  
> Tece teias de seda que petrificam ao contato com o ar.

#### V049 · Barão Kōsaku, o Coletor de Sangue
*Médio Escalão · Nv 24 · Metal · equilibrado · Planícies Kogane*  
**Habilidade:** Imposto de Sangue: drena 5% do HP de todos por turno · **Fraqueza:** Fogo · **Recompensa:** 900 XP, 480 ouro, 1% Amuleto  
> Nobre corrupto que escraviza a aldeia de Mugibatake e esconde do rei.

#### V050 · Tetsuo, o Golem-Comandante
*Médio Escalão · Nv 14 · Terra · tanque · Iwakura-jō*  
**Habilidade:** Comando Rúnico: golens aliados +30% DEF · **Fraqueza:** Água · **Recompensa:** 525 XP, 280 ouro, 1% Amuleto  
> O primeiro golem que pensou. Liderou a rebelião dos golens.

#### V051 · Guardião das Raízes, o Porteiro da Árvore
*Médio Escalão · Nv 20 · Madeira · tanque · Floresta Kodama*  
**Habilidade:** Raízes Profundas: regenera 10% HP por turno · **Fraqueza:** Fogo · **Recompensa:** 750 XP, 400 ouro, 1% Amuleto  
> Protege a biblioteca escondida dentro da árvore-colosso.

#### V052 · Mestre Tetsuzan, o Eremita do Degrau Mil
*Médio Escalão · Nv 28 · Terra · equilibrado · Cordilheira Tetsuzan*  
**Habilidade:** Mil Golpes: ataque extra a cada 3 turnos · **Fraqueza:** Nenhuma · **Recompensa:** 1050 XP, 560 ouro, 1% Amuleto  
> Não é mau: ele é o teste. Mas não pega leve com ninguém.

#### V053 · Hari, a Rainha Cristalina
*Médio Escalão · Nv 32 · Cristal · mago · Minas de Shōseki*  
**Habilidade:** Prisão de Cristal: congela 1 alvo por 2 turnos · **Fraqueza:** Som · **Recompensa:** 1200 XP, 640 ouro, 1% Amuleto  
> Mineradora transformada em cristal vivo. Controla todos os mineiros de olhos de cristal.

#### V054 · Kamaitachi, as Três Doninhas-Foice
*Médio Escalão · Nv 18 · Vento · assassino · Estepe Susuki*  
**Habilidade:** Corte Triplo: 3 ataques por turno (uma derruba, uma corta, uma cura) · **Fraqueza:** Terra · **Recompensa:** 675 XP, 360 ouro, 1% Amuleto  
> Trio de doninhas que viajam num redemoinho. Nunca se separam.

#### V055 · Kurokaze, o Mestre Espião Traidor
*Médio Escalão · Nv 16 · Vento · assassino · Amagumo-jō*  
**Habilidade:** Desaparecer: invisível por 1 turno · **Fraqueza:** Luz · **Recompensa:** 600 XP, 320 ouro, 1% Amuleto  
> Infiltrado na rede de espiões do rei. Quem está pagando por ele?

#### V056 · Sōjōbō, o Grande Abade Tengu
*Médio Escalão · Nv 25 · Vento · equilibrado · Picos Tengu*  
**Habilidade:** Leque dos Mil Ventos: dano em área + empurra · **Fraqueza:** Raio · **Recompensa:** 938 XP, 500 ouro, 1% Amuleto  
> Mestre do mosteiro tengu. Quem o vencer recebe o Livro da Espada-Vento.

#### V057 · Coro de Kazenaki, as Mil Vozes
*Médio Escalão · Nv 24 · Som · invocador · Desfiladeiro Kazenaki*  
**Habilidade:** Crescendo: dano aumenta 15% a cada turno · **Fraqueza:** Terra · **Recompensa:** 900 XP, 480 ouro, 1% Amuleto  
> As vozes presas no vento unidas em um só ser.

#### V058 · Hayabusa, a Corsária dos Céus
*Médio Escalão · Nv 28 · Vento · assassino · Ilhas Ukishima*  
**Habilidade:** Abordagem: rouba um buff do alvo · **Fraqueza:** Raio · **Recompensa:** 1050 XP, 560 ouro, 1% Amuleto  
> Pirata de nave de vento, rápida, debochada e surpreendentemente justa.

#### V059 · Raiko, a Sacerdotisa do Trovão
*Médio Escalão · Nv 32 · Raio · mago · Templo Raijin*  
**Habilidade:** Julgamento do Raio: dano alto em alvo aleatório · **Fraqueza:** Terra · **Recompensa:** 1200 XP, 640 ouro, 1% Amuleto  
> Tenta acordar o deus do trovão com sacrifícios.

#### V060 · O Leiloeiro Sem Sombra, o Dono do Mercado Negro
*Médio Escalão · Nv 30 · Trevas · invocador · Kyōkai*  
**Habilidade:** Lance Final: força o alvo a escolher entre perder um item ou 30% do HP · **Fraqueza:** Luz · **Recompensa:** 1125 XP, 600 ouro, 1% Amuleto  
> Comanda o leilão das sombras. Não projeta sombra alguma.


---

## 🔵 Alto Escalão (20)

| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |
|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|
| V061 | **Hyōsuke** | 40 | Kurenai | Fogo | 2235 | 85 | 77 | 77 | 77 | 77 | — |
| V062 | **Hinotori Corrompida** | 32 | Monte Hinokami | Fogo | 1820 | 50 | 57 | 82 | 82 | 69 | SF-HOM-05 |
| V063 | **General Bakuen** | 45 | Enjō | Explosão | 3245 | 120 | 103 | 43 | 60 | 68 | — |
| V064 | **Yōgan-ryū** | 38 | Rio Yōgan | Lava | 2560 | 95 | 73 | 44 | 59 | 88 | SF-HOM-06 |
| V065 | **Umibōzu** | 42 | Arquipélago Shiranami | Água | 2810 | 104 | 80 | 48 | 64 | 96 | — |
| V066 | **Hyōō** | 40 | Geleira Hyōga | Gelo | 2010 | 46 | 61 | 108 | 92 | 61 | SF-WAT-07 |
| V067 | **Nure-onna** | 48 | Fossa Shinkai | Água | 2255 | 118 | 64 | 64 | 64 | 145 | — |
| V068 | **Saigō Shiogama** | 52 | Ryūgū-jō | Água | 2290 | 49 | 68 | 156 | 127 | 88 | — |
| V069 | **Ōmukade** | 40 | Cordilheira Tetsuzan | Metal | 2685 | 100 | 77 | 46 | 61 | 92 | — |
| V070 | **O Crânio de Ryūkotsu** | 38 | Cânion Ryūkotsu | Alma | 1705 | 37 | 51 | 117 | 95 | 66 | SF-DAI-06 |
| V071 | **Kurogane Masamune** | 50 | Kōgyoku | Metal | 4410 | 94 | 151 | 57 | 113 | 57 | — |
| V072 | **Yomotsu** | 52 | Cavernas Yomi-no-Ana | Trevas | 2575 | 59 | 78 | 137 | 117 | 78 | SF-DAI-07 |
| V073 | **Arashimaru** | 45 | Olho da Tempestade Arashi-no-Me | Vento | 1995 | 43 | 60 | 137 | 111 | 77 | — |
| V074 | **Nue** | 42 | Templo Raijin | Raio | 2810 | 104 | 80 | 48 | 64 | 96 | — |
| V075 | **Kusarigami** | 38 | Ilhas Ukishima | Metal | 3410 | 73 | 117 | 44 | 88 | 44 | SF-FUJ-05 |
| V076 | **Hayate Kuroha** | 50 | Amagumo-jō | Vento | 2345 | 123 | 66 | 66 | 66 | 151 | — |
| V077 | **Kanae** | 55 | Muralha dos Selos | Terra | 4825 | 103 | 165 | 62 | 124 | 62 | SF-KOK-02 |
| V078 | **Shizuku** | 55 | Muralha dos Selos | Água | 2415 | 51 | 72 | 165 | 134 | 93 | SF-KOK-02 |
| V079 | **O Guardião sem Vento** | 50 | Estepe Susuki | Luz | 2755 | 104 | 94 | 94 | 94 | 94 | SF-FUJ-07 |
| V080 | **Zero** | 58 | Kyōkai | Vazio | 2695 | 141 | 76 | 76 | 76 | 173 | SF-KOK-04 |

#### V061 · Hyōsuke, o Príncipe Exilado de Kurenai
*Alto Escalão · Nv 40 · Fogo · equilibrado · Kurenai*  
**Habilidade:** Lâmina Rubra: queimadura que impede cura · **Fraqueza:** Água · **Recompensa:** 3600 XP, 1920 ouro, 3% Amuleto  
> Irmão do rei Ryūen. Perdeu o duelo pelo trono e jurou queimar o reino que o rejeitou.

#### V062 · Hinotori Corrompida, a Fênix do Vazio
*Alto Escalão · Nv 32 · Fogo · espiritual · Monte Hinokami*  
**Habilidade:** Renascer: revive 1× com 50% do HP · **Fraqueza:** Água · **Recompensa:** 2880 XP, 1536 ouro, 3% Amuleto  
> A fênix sagrada do vulcão foi infectada pelo Vazio. Suas chamas agora são violeta.

#### V063 · General Bakuen, o Senhor da Guerra
*Alto Escalão · Nv 45 · Explosão · bruto · Enjō*  
**Habilidade:** Detonação: dano em área, também se fere em 10% · **Fraqueza:** Água · **Recompensa:** 4050 XP, 2160 ouro, 3% Amuleto  
> General de Homura que quer guerra total contra Watatsumi, com ou sem o rei.

#### V064 · Yōgan-ryū, o Dragão da Ponte
*Alto Escalão · Nv 38 · Lava · besta · Rio Yōgan*  
**Habilidade:** Sopro de Magma: dano em linha + queimadura · **Fraqueza:** Água · **Recompensa:** 3420 XP, 1824 ouro, 3% Amuleto  
> Fingiu ser uma ponte por mil anos. Acordou com fome.

#### V065 · Umibōzu, o Monge do Mar
*Alto Escalão · Nv 42 · Água · besta · Arquipélago Shiranami*  
**Habilidade:** Engolir: tira um aliado da batalha por 2 turnos · **Fraqueza:** Raio · **Recompensa:** 3780 XP, 2016 ouro, 3% Amuleto  
> Gigante negro que surge do mar em noites calmas e pede um barril. Se você der um balde, ele afunda o barco.

#### V066 · Hyōō, o Rei do Exército Congelado
*Alto Escalão · Nv 40 · Gelo · invocador · Geleira Hyōga*  
**Habilidade:** Despertar das Legiões: invoca 3 soldados de gelo · **Fraqueza:** Fogo · **Recompensa:** 3600 XP, 1920 ouro, 3% Amuleto  
> General de uma guerra que ninguém lembra, ainda dando ordens a um exército de gelo.

#### V067 · Nure-onna, a Serpente das Profundezas
*Alto Escalão · Nv 48 · Água · assassino · Fossa Shinkai*  
**Habilidade:** Sangue de Serpente: drena HP igual a 30% do dano · **Fraqueza:** Raio · **Recompensa:** 4320 XP, 2304 ouro, 3% Amuleto  
> Mulher-serpente que caça nas profundezas onde a luz não chega.

#### V068 · Saigō Shiogama, o Conselheiro das Marés
*Alto Escalão · Nv 52 · Água · mago · Ryūgū-jō*  
**Habilidade:** Maré Política: controla um inimigo por 1 turno · **Fraqueza:** Raio · **Recompensa:** 4680 XP, 2496 ouro, 3% Amuleto  
> Conselheiro do rei Kaishin. Manipula a corte há décadas.

#### V069 · Ōmukade, a Centopeia-Montanha
*Alto Escalão · Nv 40 · Metal · besta · Cordilheira Tetsuzan*  
**Habilidade:** Carapaça de Ferro: imune a acertos críticos · **Fraqueza:** Fogo · **Recompensa:** 3600 XP, 1920 ouro, 3% Amuleto  
> Centopeia gigantesca que dá sete voltas numa montanha.

#### V070 · O Crânio de Ryūkotsu, a Mente do Dragão Morto
*Alto Escalão · Nv 38 · Alma · mago · Cânion Ryūkotsu*  
**Habilidade:** Memória Ancestral: usa uma magia aleatória do grupo inimigo · **Fraqueza:** Luz · **Recompensa:** 3420 XP, 1824 ouro, 3% Amuleto  
> O crânio do dragão que forma o cânion ainda pensa — e quer um corpo novo.

#### V071 · Kurogane Masamune, o Senhor dos Clãs
*Alto Escalão · Nv 50 · Metal · tanque · Kōgyoku*  
**Habilidade:** Juramento de Sangue: guardas aliados recebem o dano por ele · **Fraqueza:** Fogo · **Recompensa:** 4500 XP, 2400 ouro, 3% Amuleto  
> Nobre que conspira para derrubar o rei Gōtetsu e tomar Daichi-koku.

#### V072 · Yomotsu, a Barqueira de Yomi
*Alto Escalão · Nv 52 · Trevas · invocador · Cavernas Yomi-no-Ana*  
**Habilidade:** Rio dos Mortos: aliados caídos voltam lutando por ela · **Fraqueza:** Luz · **Recompensa:** 4680 XP, 2496 ouro, 3% Amuleto  
> Leva almas pelo rio subterrâneo. Decide quem não volta.

#### V073 · Arashimaru, o Guardião Enlouquecido
*Alto Escalão · Nv 45 · Vento · mago · Olho da Tempestade Arashi-no-Me*  
**Habilidade:** Tufão Cortante: dano em área + sangramento · **Fraqueza:** Terra · **Recompensa:** 4050 XP, 2160 ouro, 3% Amuleto  
> Ex-guardião da torre que enlouqueceu no silêncio do olho do furacão.

#### V074 · Nue, a Quimera do Trovão
*Alto Escalão · Nv 42 · Raio · besta · Templo Raijin*  
**Habilidade:** Cauda-Serpente: veneno + paralisia · **Fraqueza:** Terra · **Recompensa:** 3780 XP, 2016 ouro, 3% Amuleto  
> Rosto de macaco, corpo de tanuki, patas de tigre e cauda de serpente. Seu grito traz azar.

#### V075 · Kusarigami, o Acorrentado
*Alto Escalão · Nv 38 · Metal · tanque · Ilhas Ukishima*  
**Habilidade:** Correntes: prende 2 alvos por 2 turnos · **Fraqueza:** Raio · **Recompensa:** 3420 XP, 1824 ouro, 3% Amuleto  
> O ser acorrentado sob a ilha que nunca se move. Quem o prendeu ali?

#### V076 · Hayate Kuroha, o Primo Rival
*Alto Escalão · Nv 50 · Vento · assassino · Amagumo-jō*  
**Habilidade:** Passo Negro: ataca 2× por turno · **Fraqueza:** Luz · **Recompensa:** 4500 XP, 2400 ouro, 3% Amuleto  
> Primo do rei Sorahiko. Acha que o tornado errou de pessoa.

#### V077 · Kanae, a Guardiã do Pilar Leste
*Alto Escalão · Nv 55 · Terra · tanque · Muralha dos Selos*  
**Habilidade:** Selo Rachado: a cada turno perde DEF e ganha FOR · **Fraqueza:** Raio · **Recompensa:** 4950 XP, 2640 ouro, 3% Amuleto  
> Uma das guardiãs dos selos, sendo devorada pelo Vazio aos poucos.

#### V078 · Shizuku, a Guardiã do Pilar Oeste
*Alto Escalão · Nv 55 · Água · mago · Muralha dos Selos*  
**Habilidade:** Maré Negra: dano + reduz cura recebida em 50% · **Fraqueza:** Raio · **Recompensa:** 4950 XP, 2640 ouro, 3% Amuleto  
> Irmã gêmea de Kanae. Luta ao lado dela; se uma cair, a outra enlouquece (+50% dano).

#### V079 · O Guardião sem Vento, o Cavaleiro da Pedra
*Alto Escalão · Nv 50 · Luz · equilibrado · Estepe Susuki*  
**Habilidade:** Prova do Coração: quanto menor o Mérito do jogador, maior o dano · **Fraqueza:** Nenhuma · **Recompensa:** 4500 XP, 2400 ouro, 3% Amuleto  
> Cavaleiro espectral que protege a Excalibur há séculos. Não luta para matar — luta para julgar.

#### V080 · Zero, o Caçador de Magos
*Alto Escalão · Nv 58 · Vazio · assassino · Kyōkai*  
**Habilidade:** Anulação Total: cancela todas as magias do turno · **Fraqueza:** Luz · **Recompensa:** 5220 XP, 2784 ouro, 3% Amuleto  
> Anti-magia que caça magos por recompensa. Pode virar aliado se for vencido sem magia.


---

## 🟣 Nível Rei (12)

| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |
|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|
| V081 | **Enma-ō** | 70 | Ruínas de Enma | Fogo | 9490 | 224 | 192 | 80 | 112 | 128 | SF-HOM-07 |
| V082 | **Kagerō Ryūketsu** | 65 | Kagutsuchi-jō | Fogo | 6800 | 164 | 149 | 149 | 149 | 149 | SF-HOM-08 |
| V083 | **Leviatã de Shinkai** | 72 | Fossa Shinkai | Água | 9000 | 214 | 165 | 99 | 132 | 197 | SF-WAT-08 |
| V084 | **Otohime Negra** | 66 | Ryūgū-jō | Tempo | 5520 | 76 | 106 | 242 | 197 | 136 | — |
| V085 | **Daidarabotchi** | 75 | Planícies Kogane | Terra | 10140 | 239 | 205 | 86 | 120 | 137 | — |
| V086 | **O Coração da Montanha** | 68 | Iwakura-jō | Alma | 11360 | 156 | 249 | 94 | 187 | 94 | SF-DAI-08 |
| V087 | **Raijin Desperto** | 72 | Templo Raijin | Raio | 6000 | 82 | 115 | 263 | 214 | 148 | SF-FUJ-06 |
| V088 | **Kazenaki-no-Haha** | 70 | Desfiladeiro Kazenaki | Alma | 6570 | 96 | 128 | 224 | 192 | 128 | — |
| V089 | **O Arquivista** | 78 | Olho da Tempestade Arashi-no-Me | Espaço | 6480 | 89 | 124 | 284 | 231 | 160 | SF-FUJ-08 |
| V090 | **Sekiō** | 80 | Floresta Petrificada Ishi-no-Mori | Terra | 13280 | 182 | 291 | 109 | 218 | 109 | SF-KOK-03 |
| V091 | **Yoru** | 82 | Kyōkai | Trevas | 7225 | 242 | 130 | 130 | 130 | 298 | SF-KOK-04 |
| V092 | **O Quinto que Falhou** | 85 | Torre Sem Fim | Vazio | 8800 | 212 | 193 | 193 | 193 | 193 | SF-KOK-04 |

#### V081 · Enma-ō, o Juiz do Submundo de Fogo
*Nível Rei · Nv 70 · Fogo · bruto · Ruínas de Enma*  
**Habilidade:** Julgamento Infernal: dano proporcional às vitórias do alvo · **Fraqueza:** Água · **Recompensa:** 15750 XP, 8400 ouro, 10% Amuleto  
> Juiz dos mortos do fogo, aprisionado sob as ruínas da cidade que ele mesmo condenou.

#### V082 · Kagerō Ryūketsu, o Primeiro Dragão-Sangue
*Nível Rei · Nv 65 · Fogo · equilibrado · Kagutsuchi-jō*  
**Habilidade:** Duelo Eterno: força 1×1 com um único jogador por 3 turnos · **Fraqueza:** Água · **Recompensa:** 14625 XP, 7800 ouro, 10% Amuleto  
> Espírito do duelista que enfrentou o Quinto Portador. Guarda o capítulo Céu Rubro do Shitenchō.

#### V083 · Leviatã de Shinkai, a Serpente do Abismo
*Nível Rei · Nv 72 · Água · besta · Fossa Shinkai*  
**Habilidade:** Maelstrom: dano em todos + puxa para o fundo (−VEL) · **Fraqueza:** Raio · **Recompensa:** 16200 XP, 8640 ouro, 10% Amuleto  
> Serpente do abismo, maior que uma cidade. Guarda o capítulo Céu Profundo.

#### V084 · Otohime Negra, a Princesa que Roubou o Tempo
*Nível Rei · Nv 66 · Tempo · mago · Ryūgū-jō*  
**Habilidade:** Tamatebako: envelhece o alvo (−15% em todos os atributos por 3 turnos) · **Fraqueza:** Luz · **Recompensa:** 14850 XP, 7920 ouro, 10% Amuleto  
> Antiga princesa do palácio submerso que vive roubando os anos dos outros.

#### V085 · Daidarabotchi, o Gigante dos Lagos
*Nível Rei · Nv 75 · Terra · bruto · Planícies Kogane*  
**Habilidade:** Passo do Gigante: dano em todos + derruba · **Fraqueza:** Vento · **Recompensa:** 16875 XP, 9000 ouro, 10% Amuleto  
> Gigante tão grande que suas pegadas viraram lagos.

#### V086 · O Coração da Montanha, o Que Bate Sob Iwakura
*Nível Rei · Nv 68 · Alma · tanque · Iwakura-jō*  
**Habilidade:** Batida: a cada 3 turnos, pulso que atordoa todos · **Fraqueza:** Vento · **Recompensa:** 15300 XP, 8160 ouro, 10% Amuleto  
> O coração que bate dentro da montanha. Guarda o capítulo Céu de Pedra.

#### V087 · Raijin Desperto, o Deus do Trovão Furioso
*Nível Rei · Nv 72 · Raio · mago · Templo Raijin*  
**Habilidade:** Tambores do Trovão: 3 raios aleatórios por turno · **Fraqueza:** Terra · **Recompensa:** 16200 XP, 8640 ouro, 10% Amuleto  
> O deus do trovão acordou — e quer saber quem o acordou. Guarda o capítulo Céu Errante.

#### V088 · Kazenaki-no-Haha, a Mãe dos Ventos Mortos
*Nível Rei · Nv 70 · Alma · invocador · Desfiladeiro Kazenaki*  
**Habilidade:** Prisão de Vozes: sela a voz (magias) de um jogador por 3 turnos · **Fraqueza:** Terra · **Recompensa:** 15750 XP, 8400 ouro, 10% Amuleto  
> Ela prende as vozes das pessoas no vento. Para quê?

#### V089 · O Arquivista, o Guardião da Torre Fora do Mapa
*Nível Rei · Nv 78 · Espaço · mago · Olho da Tempestade Arashi-no-Me*  
**Habilidade:** Dobra Espacial: troca posições e redireciona ataques · **Fraqueza:** Vazio · **Recompensa:** 17550 XP, 9360 ouro, 10% Amuleto  
> Guarda a Joia dos Portões Celestes e um arquivo de tudo que já aconteceu.

#### V090 · Sekiō, o Rei de Pedra
*Nível Rei · Nv 80 · Terra · tanque · Floresta Petrificada Ishi-no-Mori*  
**Habilidade:** Olhar Petrificante: petrifica 1 alvo (2 turnos ou até ser curado) · **Fraqueza:** Espelho · **Recompensa:** 18000 XP, 9600 ouro, 10% Amuleto  
> Petrificou a floresta inteira. Sentado sobre a Égide do Quinto Portador.

#### V091 · Yoru, o Mestre da Guilda de Kyōkai
*Nível Rei · Nv 82 · Trevas · assassino · Kyōkai*  
**Habilidade:** Mil Contratos: cada jogador que já aceitou missão da guilda recebe −20% em tudo · **Fraqueza:** Luz · **Recompensa:** 18450 XP, 9840 ouro, 10% Amuleto  
> Nunca foi visto de dia. Sabe de todos os segredos — porque é ele quem os vende.

#### V092 · O Quinto que Falhou, o Eco do Portador
*Nível Rei · Nv 85 · Vazio · equilibrado · Torre Sem Fim*  
**Habilidade:** Eco do Portador: usa as 4 afinidades elementais · **Fraqueza:** Nenhuma · **Recompensa:** 19125 XP, 10200 ouro, 10% Amuleto  
> Alguém que tentou ser o Quinto Portador antes. O Vazio o devolveu — vazio.


---

## 🟡 Divindade (8)

| ID | Nome | Nv | Região | Elemento | HP | FOR | DEF | MAG | RES | VEL | Chefe de |
|---|---|:---:|---|---|---:|---:|---:|---:|---:|---:|---|
| V093 | **Kagutsuchi** | 88 | Torre Sem Fim | Fogo | 21840 | 345 | 345 | 345 | 345 | 292 | SF-KOK-04 |
| V094 | **Watatsumi** | 88 | Torre Sem Fim | Água | 21840 | 345 | 345 | 345 | 345 | 292 | SF-KOK-04 |
| V095 | **Ōyamatsumi** | 88 | Torre Sem Fim | Terra | 21840 | 345 | 345 | 345 | 345 | 292 | SF-KOK-04 |
| V096 | **Shinatsuhiko** | 88 | Torre Sem Fim | Vento | 21840 | 345 | 345 | 345 | 345 | 292 | SF-KOK-04 |
| V097 | **Tsukuyomi Partido** | 93 | Torre Sem Fim | Trevas | 23040 | 364 | 364 | 364 | 364 | 308 | SF-KOK-04 |
| V098 | **Hiruko** | 95 | Torre Sem Fim | Alma | 23520 | 371 | 371 | 371 | 371 | 314 | SF-KOK-04 |
| V099 | **Muhyō** | 97 | Cratera do Vazio | Vazio | 24000 | 379 | 379 | 379 | 379 | 320 | SF-KOK-04 |
| V100 | **KOKŪ** | 100 | Trono dos Deuses Caídos | Vazio | 24720 | 390 | 390 | 390 | 390 | 330 | SF-KOK-04 |

#### V093 · Kagutsuchi, o Deus-Patrono Caído do Fogo
*Divindade · Nv 88 · Fogo · divino · Torre Sem Fim*  
**Habilidade:** Nascimento Ardente: o campo de batalha vira lava (dano por turno a todos) · **Fraqueza:** Água · **Recompensa:** 52800 XP, 28160 ouro, 25% Amuleto  
> O deus que deu nome à capital do fogo. Caiu ao tentar devorar o Vazio sozinho.

#### V094 · Watatsumi, o Deus-Patrono Caído do Mar
*Divindade · Nv 88 · Água · divino · Torre Sem Fim*  
**Habilidade:** Dilúvio do Fim: afoga — dano crescente a cada turno · **Fraqueza:** Raio · **Recompensa:** 52800 XP, 28160 ouro, 25% Amuleto  
> Patrono do reino da água. Seu corpo virou o abismo de Shinkai.

#### V095 · Ōyamatsumi, o Deus-Patrono Caído da Montanha
*Divindade · Nv 88 · Terra · divino · Torre Sem Fim*  
**Habilidade:** Peso do Mundo: VEL de todos cai pela metade · **Fraqueza:** Vento · **Recompensa:** 52800 XP, 28160 ouro, 25% Amuleto  
> Patrono da terra. Dorme dentro da montanha — ou dormia.

#### V096 · Shinatsuhiko, o Deus-Patrono Caído do Vento
*Divindade · Nv 88 · Vento · divino · Torre Sem Fim*  
**Habilidade:** Sopro que Apaga Nomes: silencia todo o grupo 1 turno · **Fraqueza:** Terra · **Recompensa:** 52800 XP, 28160 ouro, 25% Amuleto  
> Patrono do vento, que escolhe os reis de Fūjin. Escolheu errado de propósito?

#### V097 · Tsukuyomi Partido, o Deus da Lua Quebrada
*Divindade · Nv 93 · Trevas · divino · Torre Sem Fim*  
**Habilidade:** Noite Eterna: Demônios inimigos +50%, cura −50% · **Fraqueza:** Luz · **Recompensa:** 55800 XP, 29760 ouro, 25% Amuleto  
> A lua do mundo foi partida em uma guerra antiga. Ele é o que sobrou.

#### V098 · Hiruko, o Deus Esquecido
*Divindade · Nv 95 · Alma · divino · Torre Sem Fim*  
**Habilidade:** Esquecimento: apaga 1 habilidade aleatória do alvo pela batalha · **Fraqueza:** Nenhuma · **Recompensa:** 57000 XP, 30400 ouro, 25% Amuleto  
> O primeiro deus, descartado pelos outros ao nascer. Nunca perdoou.

#### V099 · Muhyō, o Arauto do Vazio
*Divindade · Nv 97 · Vazio · divino · Cratera do Vazio*  
**Habilidade:** Silêncio Absoluto: nenhuma magia funciona por 2 turnos · **Fraqueza:** Luz · **Recompensa:** 58200 XP, 31040 ouro, 25% Amuleto  
> A voz do Vazio no mundo. Fala pelas bocas de quem ouviu o Vazio demais.

#### V100 · KOKŪ, o Vazio Primordial
*Divindade · Nv 100 · Vazio · divino · Trono dos Deuses Caídos*  
**Habilidade:** Fome Primordial: devora um elemento do campo por turno (provisório — definido pela história) · **Fraqueza:** A definir pela história · **Recompensa:** 60000 XP, 32000 ouro, 25% Amuleto  
> A fome sem forma que o Quinto Portador selou. Chefe final provisório: o autor define o verdadeiro final.

