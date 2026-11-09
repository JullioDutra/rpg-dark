# 15 — Arcos dos Reinos (histórias complementares)

Cada reino tem um **arco próprio** dentro do Ato II, jogável em qualquer ordem e em paralelo por parties
diferentes. Cada arco gira em torno de **um Núcleo da Árvore-Estrela**, **um rei**, **um Arauto do Eclipse**
(sub-vilão de Kanata, doc 17) e **uma verdade** escondida.

Estrutura comum de cada arco:

```
Chegada → Sinal do mal → Investigação → Traição revelada → Crise (tempo real) → Confronto → Destino do Núcleo
```

**Destino do Núcleo** — todo arco termina num destes estados, gravados no mundo e com consequências até o final:

| Estado | Como acontece | Consequência |
|--------|---------------|--------------|
| 🟢 **Confiado** | O rei entrega o núcleo a um jogador digno (Mérito alto, Corrupção < 25) | O jogador ganha a bênção elemental (+ afinidade do elemento, +10% atributos fortes do reino). O rei vive, sem mana única |
| 🟡 **Protegido** | O rei sobrevive e mantém o núcleo | Fica seguro por enquanto; o vilão tentará de novo no Ato III |
| 🔴 **Arrancado** | O rei morre e o Arauto/Kanata leva o núcleo | Relógio do Eclipse +15%. Os jogadores precisam recuperá-lo do vilão (batalha extra no Ato III/IV) |
| ⚫ **Corrompido** | Um jogador com Corrupção ≥ 50 fica com o núcleo | O núcleo fica sob influência de Kanata; o jogador recebe sussurros fortes; o Ovo esquenta perto dele |

---

## 15.0 Prólogo — Cada um na sua aldeia (Ato I)

Cada jogador começa **na aldeia sorteada**, com uma cena de abertura própria gerada pela IA a partir de:
`aldeia.descricao` + casta + classe + atributo mágico + um **gancho de aldeia** (abaixo). Na primeira semana,
os jogadores de reinos diferentes **não se encontram**: cada um vive o primeiro sinal do mal no seu canto.
Todos os caminhos levam ao **Festival dos Quinhentos Anos**, em Kyōkai (marco `A1-M5`), onde o grupo se reúne.

| Aldeia | Gancho de abertura |
|--------|-------------------|
| **Haibara** (camponês, Fogo) | Uma criança da vila some na mina abandonada; o capataz Kurogane diz que "o deserto levou" |
| **Hibashira** (plebeu, Fogo) | O pilar de fogo da praça fica preto por um minuto. Um mercador vende "pedaços da Árvore-Estrela" falsos |
| **Enjō** (cavaleiro, Fogo) | O jogador é escalado para escoltar um prisioneiro: um cultista da Cinza que ri e diz "o menino vai voltar" |
| **Kurenai** (realeza, Fogo) | Um baile na corte; o príncipe exilado Hyōsuke aparece mascarado e deixa uma carta para o jogador |
| **Kagerō** (indefinido, Fogo) | A vila-miragem começa a sumir de vez. Os anciões dizem que é a última vez que ela aparece |
| **Ryūketsu** (rei, Fogo) | O jogador sonha com um olho de obsidiana que chora — e acorda com uma cicatriz no olho esquerdo |
| **Amiya** (camponês, Água) | Os afogados saem da água pela primeira vez em 50 anos, pedindo "devolva" |
| **Minato** (plebeu, Água) | Um navio chega ao porto sem tripulação, com uma carga de cristais negros |
| **Kaigarajō** (cavaleiro, Água) | A guarda marinha recebe ordem secreta do conselheiro Saigō para afundar um barco de refugiados |
| **Shinju** (realeza, Água) | O rei Kaishin desmaia num banquete. Os médicos dizem "cansaço"; o jogador vê água preta escorrer dos lábios dele |
| **Kirigakure** (indefinido, Água) | A névoa da vila forma letras: *"o fruto do dragão"* |
| **Ryūjin-no-Ma** (rei, Água) | Uma voz no salão abissal chama o jogador pelo nome — com a voz do rei Kaishin, 200 anos mais jovem |
| **Mugibatake** (camponês, Terra) | O Barão Kōsaku dobra os impostos e leva os jovens "para as minas" |
| **Kanayama** (plebeu, Terra) | Os martelos param sozinhos ao mesmo tempo. A montanha bateu fora do ritmo |
| **Ishigaki** (cavaleiro, Terra) | Uma patrulha de fronteira volta com metade dos soldados transformados em pedra |
| **Kōgyoku** (realeza, Terra) | O clã Kurogane convida a família do jogador para uma "aliança" — com um contrato da Guilda de Kyōkai |
| **Kodama-mura** (indefinido, Terra) | Os kodama sussurram o nome *Sayo* e apontam para uma árvore com uma porta |
| **Iwane** (rei, Terra) | O jogador encosta na rocha e ouve uma batida de coração — e uma menina chorando dentro de um poço |
| **Susukino** (camponês, Vento) | Harpias roubam os cavalos; no ninho delas há um mapa da Estepe com um círculo marcado |
| **Kazamachi** (plebeu, Vento) | Uma mensagem chega para o jogador sem remetente: *"as correntes vão quebrar no dia do festival"* |
| **Tsubasa** (cavaleiro, Vento) | O grifo do jogador se recusa a voar para o centro do continente |
| **Hagoromo** (realeza, Vento) | Hayate Kuroha, primo do rei, oferece ao jogador um cargo — e um amuleto que sussurra |
| **Mayoi** (indefinido, Vento) | O redemoinho da vila para de girar pela primeira vez; no centro, uma pena negra de dragão |
| **Sora-no-Za** (rei, Vento) | O vento envolve o jogador como fez com Sorahiko — mas para no meio, como se tivesse mudado de ideia |
| *(Kyōkai, indefinido sem reino)* | O jogador acorda devendo um contrato à Guilda que não lembra de ter assinado |

---

## 15.1 焔 Homura-koku — *"O Juramento das Brasas"*

**Núcleo:** Núcleo Rubro, no olho esquerdo de obsidiana do rei **Akatsuki Ryūen**.
**Arauto do Eclipse:** **Hyōsuke, o Príncipe Exilado** (V061), irmão de Ryūen.
**Apoio do mal:** General Bakuen (V063), Okibi e o Culto da Cinza (V037), Enma-ō ressurgido (V081).
**Verdade local:** o ancestral **Akatsuki Ryūga** foi quem escolheu o emissário que convenceu Kaien.

### Capítulos

| # | Capítulo | O que acontece | Decisões e ramificações |
|:---:|---------|----------------|------------------------|
| 1 | **O Torneio das Brasas** | O Torneio dos Novatos (SF-HOM-02) vira palco: o vencedor ganha audiência com o rei. Durante a final, alguém envenena o campeão Ōgama | Investigar o veneno (pista: Culto da Cinza) **ou** focar em vencer. Quem vence ganha a audiência |
| 2 | **A Audiência** | Ryūen recebe os jogadores. Seu olho de obsidiana brilha quando ele fala do ancestral Ryūga. Pede ajuda: o culto está sequestrando pessoas no Deserto de Haijin | Aceitar a missão do rei **ou** aceitar a carta de Hyōsuke (que diz que Ryūen matou o pai deles) |
| 3 | **Sacrifícios nas Dunas** | Okibi quer "devolver o mar" ao deserto sacrificando 100 pessoas nos Navios Fantasmas (SF-HOM-04). Na verdade, o ritual alimenta o Esquife | **Crise de tempo real (48h):** se não impedirem, o ritual acontece: Relógio +5% e uma aldeia (Haibara) é destruída permanentemente |
| 4 | **A Guerra Fabricada** | Agentes de Saigō (Água) atacam a Costa Akashio vestidos de soldados de Homura. Bakuen exige guerra contra Watatsumi | Provar a falsa bandeira (capturar um agente vivo) **ou** a guerra começa: rotas entre Fogo e Água fechadas por 2 semanas, vilões de guerra aparecem |
| 5 | **O Duelo pelo Trono** | Hyōsuke desafia Ryūen ao Duelo de Sangue no Coliseu. A lei de Homura obriga o rei a aceitar. Kanata emprestou a Hyōsuke uma habilidade copiada | Os jogadores podem: ser **campeões** de Ryūen (lutam no lugar dele), **sabotar** o empréstimo de Kanata (descobrir e anular — anti-magia ou G10 *Selar Página*), ou **apoiar Hyōsuke** (ele promete o núcleo a quem o ajudar — mentira de Kanata) |
| 6 | **O Olho do Sol** | Desfecho: se Ryūen vence com ajuda, ele revela o núcleo e a verdade da sua linhagem | **Destino do Núcleo** (ver tabela). Ryūen confia o núcleo a quem lutou por ele com honra. Se Hyōsuke vencer, ele arranca o olho do irmão → núcleo Arrancado |

**Final alternativo do arco:** se os jogadores convencerem **Hyōsuke** de que Kanata o usa (prova: a habilidade emprestada
desaparece no meio do duelo), ele se volta contra o Eclipse e pode virar aliado no Ato IV.

**Subfases ligadas:** SF-HOM-02, 04, 05 (Coração de Hinokami, santuário do pet de fogo), 07 (Enma-ō ressurgido por Okibi), 08.

---

## 15.2 海神 Watatsumi-koku — *"A Maré das Mentiras"*

**Núcleo:** Núcleo Abissal, no coração do rei **Minazuki Kaishin** (o que o mantém vivo há 200 anos).
**Arauto do Eclipse:** **Saigō Shiogama, o Conselheiro das Marés** (V068).
**Apoio do mal:** Otohime Negra ressurgida (V084), Yamanba (V047, neutra-vendida), o Leiloeiro (V060).
**Verdade local:** Kaishin **sabe tudo** (Camada 3). Os registros estão na Ala Proibida da Biblioteca Submersa.

| # | Capítulo | O que acontece | Decisões e ramificações |
|:---:|---------|----------------|------------------------|
| 1 | **A Água Preta** | O rei Kaishin adoece. Saigō governa "temporariamente". Refugiados são afastados das ilhas | Ajudar os refugiados (Mérito) ou seguir as ordens da corte (acesso ao palácio mais rápido) |
| 2 | **A Ala Proibida** | Para descobrir o veneno, os jogadores invadem a Biblioteca Submersa (SF-WAT-02). Encontram os registros: **os quatro reis encomendaram o roubo do ovo** (Camada 3) | **Decisão moral:** revelar a verdade ao povo (caos: Homura e Watatsumi à beira da guerra; Relógio +5%; mas Kanata perde um argumento de manipulação) **ou** guardar o segredo (Kanata pode revelá-la depois, de forma distorcida, e usar contra os jogadores) |
| 3 | **O Reflexo do Ontem** | No Lago Kagami (SF-WAT-03), na lua cheia, veem o jovem Kaishin, 200 anos atrás, recebendo o núcleo do rei anterior — e jurando silêncio | Pista para o antídoto: a água-espelho do lago |
| 4 | **O Banquete das Pérolas** | Saigō dá um banquete em Ryūgū-jō para anunciar Kaishin como "incapaz". Otohime Negra, ressurgida por Kanata, está entre os convidados disfarçada | **Crise (tempo real 24h):** levar o antídoto antes do anúncio. Se falharem, Saigō vira regente: o arco fica mais difícil (guarda do palácio hostil) |
| 5 | **A Maré do Retorno** | Kaishin acorda e usa sua mana única pela última vez para revelar a mente de Saigō: ele é servo de Kanata há 30 anos | Enfrentar Saigō no palácio (V068) e Otohime (V084). Se Otohime for vencida, ela devolve os anos roubados às vítimas |
| 6 | **O Coração do Rei** | Kaishin está velho demais. O núcleo é o que o mantém vivo | **Decisão trágica:** pedir o núcleo (Kaishin morre em paz, núcleo Confiado), **ou** deixá-lo viver (núcleo Protegido — mas Kaishin não sobreviverá a outro ataque no Ato III) |

**Subfases ligadas:** SF-WAT-02, 03, 05 (Yamanba vende a localização do Leiloeiro), 06 (santuário do pet de água), 08.

---

## 15.3 大地 Daichi-koku — *"A Montanha que Sangra"*

**Núcleo:** Núcleo Raiz, no **Coração da Montanha** sob Iwakura; o rei **Gōtetsu Iwanaga** está ligado a ele.
**Arauto do Eclipse:** **Kurogane Masamune, o Senhor dos Clãs** (V071).
**Apoio do mal:** Barão Kōsaku (V049), Rainha Cristalina Hari (V053), Daidarabotchi ressurgido (V085).
**Verdade local:** **Sayo** fugiu para o leste. O **Diário de Sayo** está na biblioteca de raízes da Floresta Kodama (Camada 4).

| # | Capítulo | O que acontece | Decisões e ramificações |
|:---:|---------|----------------|------------------------|
| 1 | **Os Cristais Negros** | Nas Minas de Shōseki, cristais negros (Vazio solidificado) crescem em direção a Iwakura. Mineiros viram "olhos de cristal" | Destruir os cristais (rápido, mas acorda Hari) ou rastrear a origem (leva às Profundezas — SF-DAI-04) |
| 2 | **Os Escravos do Barão** | Kōsaku leva camponeses de Mugibatake para minerar os cristais negros e vender a Kurogane | Libertar os escravos (Mérito alto, inimizade dos clãs) ou infiltrar-se como trabalhador (descobre o contrato da Guilda) |
| 3 | **A Porta na Árvore** | Seguindo os kodama, os jogadores acham a biblioteca de raízes (SF-DAI-03) e o **Diário de Sayo** | **Item de história chave.** Quem pega o diário passa a ter a única arma emocional contra Kanata (doc 16). O Ovo Eterno **esquenta** perto do diário — pista para o portador |
| 4 | **O Golpe dos Clãs** | Kurogane convoca os clãs nobres e acusa Gōtetsu de esconder "o poder que pertence aos clãs". Exército de Kurogane cerca Iwakura | Defender a capital (batalha de horda) ou negociar com os clãs menores um a um (testes de persuasão — criatividade conta) |
| 5 | **O Gigante dos Lagos** | Kanata ressurge Daidarabotchi (V085) nas Planícies Kogane para distrair o exército real | **Crise (tempo real 36h):** se o gigante chegar a Mugibatake, a aldeia é destruída. Dividir o grupo é uma opção estratégica |
| 6 | **O Coração da Montanha** | Kurogane invade o Coração (SF-DAI-08) para arrancar o núcleo — o que mataria Gōtetsu | Lutar contra Kurogane dentro do Coração (V086 desperta e ataca **todos**, inclusive o vilão). Gōtetsu pode transferir o núcleo para um jogador e sobreviver com metade da força |

**Subfases ligadas:** SF-DAI-01, 02, 03 (Diário de Sayo), 04, 05 (Mil Degraus — o eremita conheceu Tōya), 07 (pode-se falar com o eco de Sayo no Rio dos Mortos), 08.

---

## 15.4 風神 Fūjin-koku — *"O Vento que Escolhe"*

**Núcleo:** Núcleo Celeste, vivendo no vento que escolheu **Hayate Sorahiko**.
**Arauto do Eclipse:** **Hayate Kuroha, o Primo Rival** (V076), com o espião **Kurokaze** (V055).
**Apoio do mal:** Kazenaki-no-Haha ressurgida (V088), Raiko (V059).
**Verdade local:** o Rei Antigo do Vento, **Hayate Tsukumo**, fincou a **Excalibur** no Círculo sem Vento antes do último combate — "para o quinto que vier". O núcleo celeste só pode ser tirado de Sorahiko se ele **deixar de se mover** (preso, petrificado ou morto).

| # | Capítulo | O que acontece | Decisões e ramificações |
|:---:|---------|----------------|------------------------|
| 1 | **As Correntes** | Alguém sabota as correntes que prendem Amagumo-jō (SF-FUJ-02) | Descobrir o espião Kurokaze **ou** reforçar as correntes (não resolve, só adia) |
| 2 | **O Rei que Ri** | Sorahiko recebe os jogadores numa corrida pelos telhados. Parece imaturo; na verdade testa cada um | Quem o acompanhar na corrida (teste de VEL ou criatividade) ganha a confiança dele |
| 3 | **As Vozes Roubadas** | Pessoas de Amagumo perdem a voz uma a uma. Kazenaki-no-Haha (V088) as aprisiona no desfiladeiro | Libertar as vozes (SF-FUJ-04 + chefe rei) devolve testemunhas que viram Kuroha com Kanata |
| 4 | **A Queda de Amagumo** | No dia marcado, as correntes se rompem. A cidade começa a cair | **Crise (tempo real 12h, a mais curta do jogo):** salvar a cidade (Levitar G29, Ilha Escudo, grifos, criatividade) — cada hora que passa, um distrito cai e NPCs morrem. Kuroha usa o caos para prender Sorahiko |
| 5 | **O Rei Parado** | Sorahiko é capturado e preso numa gaiola de chumbo no Templo Raijin — parado, o núcleo pode ser arrancado | Resgatar Sorahiko antes de Kuroha completar o ritual. O deus Raijin desperta (V087) e ataca todos |
| 6 | **O Vento Escolhe de Novo** | Livre, Sorahiko percebe que o vento hesitou ao escolhê-lo | **O núcleo celeste escolhe sozinho:** pode ficar com Sorahiko, ir para o jogador de maior Mérito presente, ou — se Kuroha estiver vivo e algum jogador tiver Corrupção ≥ 50 — para o corrompido |

**Subfases ligadas:** SF-FUJ-02, 03 (santuário do pet de vento), 04, 06, 07 (Excalibur), 08 (Tenmon no Tama).

---

## 15.5 虚空 Kokū — *"A Guilda e o Esquife"* (fio condutor de todos os atos)

**Kyōkai** é onde as linhas se cruzam. É o território de **Yoru/Kanata**.

| Momento | Evento |
|---------|--------|
| Ato I | Os jogadores se registram na Guilda (obrigatório para missões pagas). Yoru é gentil, generoso, dá missões úteis. **Toda missão da Guilda tem uma segunda função secreta** que ajuda o plano de Kanata (doc 16) |
| Ato I — Festival | O Festival dos Quinhentos Anos. Os quatro reis vêm. O primeiro pilar da Muralha dos Selos racha durante a cerimônia; rastejantes do vazio atacam a multidão. Uma voz fala em todas as cabeças: *"Quinhentos anos. Devolvam o que roubaram."* |
| Ato II | Pilares rachados (SF-KOK-02). As guardiãs Kanae e Shizuku podem ser salvas ou mortas. Zero caça os jogadores mais fortes |
| Ato II — Revelação | Yoru é Kanata (Camada 5): descoberto por investigação ou revelado por ele quando tiver 2 núcleos |
| Ato III | A Floresta Petrificada (Kokūgai), o Leilão das Sombras (informação sobre o ovo é leiloada!), a descida à Torre Sem Fim |
| Ato IV | O fundo da Torre: o Esquife dos Quatro Céus |

---

## 15.6 O Monte Ryūsō e o Vale de Hinata (região nova — Ato III)

O antigo ninho de Nisteroy fica no **anel interno do Kokū**, sobre a borda do buraco. Só pode ser alcançado depois
de `A3-M1`. É o lugar onde tudo começou.

| Local | Descrição |
|-------|-----------|
| **Ruínas de Hinata** | A aldeia de Kaien, cinzas petrificadas há 500 anos. A silhueta dos pais ainda está na soleira |
| **O Poço Seco** | Onde Sayo se escondeu com o ovo. Se o portador do ovo descer aqui, o ovo **pulsa** e o portador vê a memória de Sayo (revela que ele é o portador — Camada 4 pessoal) |
| **O Ninho Vazio** | No cume do Monte Ryūsō. Escamas de Nisteroy do tamanho de escudos. Aqui o Ovo, se claro, pode ser "despertado" (pré-requisito do Final Estelar) |
| **O Toco da Árvore-Estrela** | Um toco gigante de cristal morto. Usar um Amuleto da Perdição aqui é proibido — consome a última raiz (Relógio +10%) |
