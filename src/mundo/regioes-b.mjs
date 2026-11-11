// Mundo vivo — parte B: Daichi (Terra), Fūjin (Vento) e Kokū (Terra Central). Mesmo formato da parte A.
import { L, N, C } from "./regioes-a.mjs";

export const REGIOES_B = {
  // ───────────────────────── 土 DAICHI ─────────────────────────
  "R-DAI-1": { tipo: "capital", chegada: "Iwakura-jō é uma cidade dentro de uma montanha. Elevadores de pedra sobem e descem, puxados por golens.",
    locais: [
      L("forjas", "Rua das Forjas de Kanayama", "forja", "Cem martelos batendo no mesmo ritmo. Dizem que é o ritmo do coração da montanha.", { servicos: ["loja", "descanso"], npcs: ["mestre-ganji", "kiku"] }),
      L("patio", "Pátio dos Golens", "arena", "O pátio onde os golens de treino são consertados. Alguns andam se consertando sozinhos.", { viloes: ["V019", "V050"] }),
      L("coracao", "Coração da Montanha", "caverna", "Uma câmara no fundo de tudo, onde uma batida grave faz o chão tremer. Tum. Tum.", { viloes: ["V086"] }),
    ],
    npcs: {
      "mestre-ganji": N("Mestre Ganji", "ferreiro-chefe de Kanayama", "fala alto por causa dos martelos, e bate na mesa para pontuar", "os martelos pararam sozinhos porque a montanha bateu fora do ritmo; isso nunca tinha acontecido", true),
      kiku: N("Kiku", "consertadora de golens", "fala com os golens como se fossem gente, e com gente como se fossem golens", "o golem Tetsuo foi o primeiro a dizer 'não'; ele não é mau, só não quer mais obedecer"),
    },
    capitulos: [
      C("dai1-selo", "A Batida Fora do Ritmo", 9, [
        ["falar", "mestre-ganji", "Na Rua das Forjas, fale com Mestre Ganji sobre os martelos que pararam."],
        ["derrotar", "V019", "No pátio, desligue o Golem de Treino Defeituoso."],
        ["falar", "kiku", "Fale com Kiku sobre o golem que aprendeu a dizer 'não'."],
        ["derrotar", "V050", "Enfrente Tetsuo, o Golem-Comandante, e acabe com a rebelião."],
      ], "Tetsuo se ajoelha, vencido, e Kiku coloca a mão no peito de pedra dele. — Ele só queria escolher. — Ganji te entrega um selo de bronze da Guilda, ainda quente da forja.",
      "Os golens acordaram porque o coração da montanha mudou de ritmo. Alguma coisa lá embaixo está com medo.", { principal: true, da: { bandeira: "selo" } }),
      C("dai1-ceu", "Céu de Pedra", 68, [
        ["ir", "coracao", "Desça até o Coração da Montanha."],
        ["derrotar", "V086", "Enfrente O Que Bate Sob Iwakura."],
      ], "A batida volta ao ritmo certo. Tum. Tum. Na pedra, onde antes não havia nada, repousa um capítulo de um livro muito antigo.",
      "O coração da montanha é o Núcleo Raiz. O rei Gōtetsu está preso a ele: se o núcleo sair, o rei morre. Ele sonha com uma menina chorando num poço.", { requer: ["arco-daichi"], da: { bandeira: "ceu-pedra" } }),
    ] },

  "R-DAI-2": { tipo: "vila", chegada: "As árvores da Floresta Kodama somem nas nuvens. Uma vozinha repete sua última palavra, escondida nas folhas.",
    locais: [
      L("kodama-mura", "Kodama-mura", "floresta", "Uma vila inteira dentro de uma árvore oca. Alguns moradores têm folhas no lugar do cabelo.", { servicos: ["loja", "descanso"], npcs: ["avo-nara", "pequeno-eco"] }),
      L("teias", "Bosque das Teias", "floresta", "Teias brancas entre os troncos. As mais velhas viraram pedra.", { viloes: ["V020", "V048"] }),
      L("porta", "A Porta na Árvore", "biblioteca", "Uma porta pequena no tronco da maior árvore do mundo. Lá dentro, uma biblioteca feita de raízes.", { viloes: ["V051"] }),
    ],
    npcs: {
      "avo-nara": N("Avó Nara", "anciã de Kodama-mura", "fala como quem embala criança", "uma mulher chamada Sayo viveu escondida aqui há muito tempo, e deixou um diário atrás da porta na árvore", true),
      "pequeno-eco": N("Pequeno Eco", "um kodama curioso", "repete a última palavra do que você diz, e às vezes acrescenta uma", "os kodama sussurram o nome 'Sayo' desde que a porta na árvore rangeu"),
    },
    capitulos: [
      C("dai2", "A Porta na Árvore", 18, [
        ["falar", "avo-nara", "Em Kodama-mura, ouça a Avó Nara falar de Sayo."],
        ["derrotar", "V020", "Acalme o Kodama Raivoso no Bosque das Teias."],
        ["derrotar", "V048", "Enfrente Tsuchigumo, a Aranha da Terra."],
        ["derrotar", "V051", "Convença — ou vença — o Guardião das Raízes e abra a porta."],
      ], "Na biblioteca de raízes há um caderno pequeno, de capa gasta. Na primeira página, em letra de criança: 'Meu irmão não é um monstro. — Sayo'.",
      "Sayo era irmã do menino que roubou o ovo. Ela sobreviveu. E, segundo o diário, ela fugiu levando o ovo — que nunca chocou.", { principal: true, da: { bandeira: "diario", item: null } }),
    ] },

  "R-DAI-3": { tipo: "vila", chegada: "As Minas de Shōseki brilham por dentro. Cristais de todas as cores, e mineradores de olhos vidrados.",
    locais: [
      L("kogyoku", "Cidadela de Kōgyoku", "palacio", "A cidadela de cristal dos clãs nobres. Tudo aqui tem preço, inclusive as amizades.", { servicos: ["loja", "descanso"], npcs: ["contador-shin", "hana"] }),
      L("galerias", "Galerias de Cristal", "mina", "Túneis onde os cristais crescem tão rápido que dá para ouvir.", { viloes: ["V021", "V053"] }),
      L("salao", "Salão do Clã Kurogane", "palacio", "Um salão de contratos. Sobre a mesa, um pergaminho com o selo da Guilda de Kyōkai.", { viloes: ["V071"] }),
    ],
    npcs: {
      "contador-shin": N("Shin", "contador do clã Kurogane", "fala baixo, conta moedas enquanto fala", "o clã financia a Guilda de Kyōkai, e o senhor Masamune despreza o Mestre da Guilda: 'aquele menino de Kodama'"),
      hana: N("Hana", "mineradora que perdeu o irmão para os cristais", "fala com raiva contida", "nas profundezas há cristais pretos, e quem os toca fica de olhos vidrados e para de sonhar", true),
    },
    capitulos: [
      C("dai3", "Os Cristais Negros", 30, [
        ["falar", "hana", "Em Kōgyoku, fale com Hana. O irmão dela desceu às galerias e voltou diferente."],
        ["derrotar", "V021", "Nas galerias, detenha o Minerador de Olhos de Cristal sem matá-lo."],
        ["derrotar", "V053", "Enfrente Hari, a Rainha Cristalina."],
      ], "Quando a rainha de cristal se parte, cem mineradores piscam ao mesmo tempo, como quem acorda. O irmão de Hana chora sem saber por quê.",
      "Os cristais pretos são Vazio endurecido. Eles crescem debaixo de TODOS os reinos. O buraco não está parado: ele se espalha."),
      C("dai3-arco", "O Golpe dos Clãs", 50, [
        ["falar", "contador-shin", "O contador Shin quer vender um segredo do patrão. Ouça."],
        ["ir", "salao", "Entre no Salão do Clã Kurogane."],
        ["derrotar", "V071", "Enfrente Kurogane Masamune, o Senhor dos Clãs."],
      ], "Masamune cospe sangue e ri. — Vocês acham que o Mestre da Guilda quer poder? Aquele menino de Kodama-mura só quer desenterrar um defunto. — O rei Gōtetsu chega tarde, pesado como a montanha, e põe a mão no seu ombro.",
      "O Mestre da Guilda nasceu em Kodama-mura — a vila onde Sayo se escondeu. Ele é descendente dela. E quer abrir o Esquife.", { principal: true, requer: ["festival"], da: { bandeira: "arco-daichi", nucleo: "raiz" } }),
    ] },

  "R-DAI-4": { tipo: "ermo", chegada: "O Cânion Ryūkotsu é feito de ossos. Costelas do tamanho de pontes formam arcos sobre a trilha.",
    locais: [
      L("acampamento", "Acampamento dos Escavadores", "campo", "Barracas de estudiosos que medem ossos e discutem o dia inteiro.", { servicos: ["descanso"], npcs: ["professora-ine"] }),
      L("costelas", "Arcos das Costelas", "montanha", "Abutres de osso esperam empoleirados nas costelas do dragão.", { viloes: ["V022"] }),
      L("cranio", "O Crânio que Pensa", "caverna", "A caveira do dragão, grande como um castelo. Lá dentro, uma luz fraca pisca como um pensamento.", { viloes: ["V070"] }),
    ],
    npcs: { "professora-ine": N("Professora Ine", "estudiosa de ossos de dragão", "fala empolgada, atropela as próprias frases", "este dragão não morreu de velhice: morreu fugindo do centro do mundo, há exatamente 500 anos") },
    capitulos: [
      C("dai4", "A Mente do Dragão Morto", 38, [
        ["falar", "professora-ine", "No acampamento, ouça a teoria da Professora Ine."],
        ["derrotar", "V022", "Espante os Abutres-Osso dos arcos."],
        ["derrotar", "V070", "Dentro da caveira, enfrente o Crânio de Ryūkotsu."],
      ], "A luz dentro do crânio se apaga devagar. A última coisa que ela diz não é uma ameaça: — Nisteroy… perdoe… nós fugimos…",
      "O dragão guardião da Árvore-Estrela se chamava Nisteroy. Os outros dragões fugiram da fúria dele na noite do desastre."),
    ] },

  "R-DAI-5": { tipo: "vila", chegada: "O trigo dourado das Planícies Kogane balança até o horizonte. Um moinho de pedra gira devagar.",
    locais: [
      L("mugibatake", "Vila de Mugibatake", "vila", "Uma vila de camponeses com mais crianças e velhos do que deveria. Os jovens foram 'levados para as minas'.", { servicos: ["loja", "descanso"], npcs: ["tia-yone", "sota"] }),
      L("trigal", "Ninhos no Trigal", "campo", "No meio do trigo, buracos fundos e espantalhos que não estavam ali ontem.", { viloes: ["V017", "V018"] }),
      L("solar", "Solar do Barão", "palacio", "Um casarão de pedra cercado de guardas. Das janelas do porão vem barulho de correntes.", { viloes: ["V049"] }),
      L("lagos", "Pegadas do Gigante", "lago", "Lagos redondos, em fila, cada um do tamanho de uma vila. São pegadas.", { viloes: ["V085"] }),
    ],
    npcs: {
      "tia-yone": N("Tia Yone", "padeira de Mugibatake", "fala enquanto amassa pão, sem levantar os olhos", "o Barão Kōsaku dobrou os impostos e os jovens não foram para mina nenhuma: estão presos no solar", true),
      sota: N("Sōta", "menino pastor", "fala contando nos dedos", "os círculos no trigal aparecem sempre antes de alguma coisa ruim; desta vez apareceram três"),
    },
    capitulos: [
      C("dai5", "Os Jovens que Sumiram", 7, [
        ["falar", "tia-yone", "Em Mugibatake, fale com a Tia Yone sobre os jovens levados."],
        ["derrotar", "V017", "Limpe os ninhos de Rato-Toupeira no trigal."],
        ["derrotar", "V018", "Enfrente Kakashi, o espantalho que anda."],
        ["falar", "sota", "Sōta viu para onde levaram os jovens. Ouça o menino."],
      ], "Sōta aponta para o solar do barão. — Eles não foram pra mina. Eu contei. Entraram vinte e três. Não saiu nenhum.",
      "No bolso do espantalho há um recibo da Guilda de Kyōkai: 'vinte e três pares de braços, entrega no Solar'. A Guilda vende gente.", { principal: true, da: { bandeira: "despertar" } }),
      C("dai5-barao", "O Coletor de Sangue", 26, [
        ["ir", "solar", "Entre no Solar do Barão."],
        ["derrotar", "V049", "Enfrente o Barão Kōsaku e liberte os jovens."],
      ], "Vinte e três jovens saem do porão piscando contra a luz. Tia Yone deixa cair a massa de pão e corre.",
      "O barão mandava os jovens cavar à procura de 'um poço seco muito antigo'. A ordem vinha de Kyōkai."),
      C("dai5-gigante", "O Gigante dos Lagos", 75, [
        ["ir", "lagos", "Siga as pegadas até o último lago."],
        ["derrotar", "V085", "Enfrente Daidarabotchi antes que ele chegue às vilas."],
      ], "O gigante se senta, cansado, e vira uma colina. No ano que vem vai nascer trigo em cima dele.",
      "O gigante andava para o leste, para longe do centro. Até os gigantes sentem o Esquife rachar.", { requer: ["arco-daichi"] }),
    ] },

  "R-DAI-6": { tipo: "vila", chegada: "A Cordilheira Tetsuzan atrai raios. A trilha dos peregrinos sobe em degraus gastos por mil anos de pés.",
    locais: [
      L("ishigaki", "Vila-Muralha de Ishigaki", "forja", "Uma vila construída em cima de uma muralha. Os guardiões daqui vigiam a fronteira do centro.", { servicos: ["loja", "descanso"], npcs: ["capita-tsuru"] }),
      L("passo", "Passo do Garra-de-Ferro", "montanha", "Um desfiladeiro estreito onde um bandido cobra pedágio em sangue.", { viloes: ["V023"] }),
      L("degraus", "Os Mil Degraus", "templo", "Mil degraus até o topo. No último, um velho de bengala espera sentado.", { viloes: ["V052"] }),
      L("voltas", "As Sete Voltas", "montanha", "Uma montanha com uma 'estrada' em espiral. A estrada tem pernas.", { viloes: ["V069"] }),
    ],
    npcs: { "capita-tsuru": N("Capitã Tsuru", "capitã dos guardiões da muralha", "fala firme, mas olha para o oeste o tempo todo", "metade de uma patrulha voltou transformada em pedra, vinda da direção da Floresta Petrificada", true) },
    capitulos: [
      C("dai6", "O Teste dos Mil Degraus", 22, [
        ["falar", "capita-tsuru", "Em Ishigaki, fale com a Capitã Tsuru sobre a patrulha de pedra."],
        ["derrotar", "V023", "Limpe o passo de Jūbei Garra-de-Ferro."],
        ["derrotar", "V052", "Suba os mil degraus e passe no teste do Mestre Tetsuzan."],
      ], "O velho bate a bengala no chão, satisfeito. — Força você tem. Agora aprenda a perguntar: por que quatro reis morreriam por um selo que eles mesmos precisaram fazer?",
      "O Mestre Tetsuzan guarda uma tradição antiga: os quatro reis não foram heróis que se sacrificaram. Foram culpados que pagaram.", { principal: true, da: { bandeira: "despertar" } }),
      C("dai6-centopeia", "A Centopeia-Montanha", 42, [
        ["ir", "voltas", "Vá até a montanha das sete voltas."],
        ["derrotar", "V069", "Enfrente Ōmukade, a Centopeia-Montanha."],
      ], "A centopeia desenrola a montanha e afunda na terra. A estrada para o oeste fica livre pela primeira vez em cem anos.",
      "No ninho da centopeia há armaduras de quatro reinos diferentes, lado a lado. Soldados que marchavam juntos, para o centro."),
    ] },

  "R-DAI-7": { tipo: "ermo", chegada: "As cavernas Yomi-no-Ana descem para onde os mortos andam. O frio sobe pelas pernas.",
    locais: [
      L("entrada", "Boca de Yomi", "caverna", "A entrada das cavernas. Há oferendas frescas, embora ninguém admita vir aqui.", { npcs: ["monge-jizo"] }),
      L("rio", "Rio dos Mortos", "vazio", "Um rio subterrâneo sem som. Uma barca espera na margem, e alguém segura o remo.", { viloes: ["V024", "V072"] }),
    ],
    npcs: { "monge-jizo": N("Monge Jizō", "monge que cuida das almas perdidas", "fala calmo, quase sorrindo", "os mortos daqui guardam memórias de outras eras; alguns ainda lembram da noite em que o céu ficou negro") },
    capitulos: [
      C("dai7", "A Barqueira de Yomi", 52, [
        ["falar", "monge-jizo", "Na boca de Yomi, peça orientação ao Monge Jizō."],
        ["derrotar", "V024", "Passe pela Sombra de Yomi."],
        ["derrotar", "V072", "Enfrente Yomotsu, a Barqueira, e ganhe o direito de voltar."],
      ], "A barqueira te devolve à margem dos vivos. — Um menino passou por aqui há 500 anos, mas não inteiro. Metade dele ficou lá em cima, presa. Ainda chama pela irmã.",
      "O menino que roubou o ovo se chamava Kaien. Ele não morreu. Está preso dentro do Esquife — fundido com o dragão.", { requer: ["festival"] }),
    ] },

  // ───────────────────────── 風 FŪJIN ─────────────────────────
  "R-FUJ-1": { tipo: "capital", chegada: "Amagumo-jō flutua sobre o mar de nuvens, presa aos picos por correntes enormes. As pontes de corda balançam.",
    locais: [
      L("mensageiros", "Praça dos Mensageiros de Kazamachi", "cidade", "Pássaros, cartas e gente correndo. Aqui uma notícia chega antes de acontecer.", { servicos: ["loja", "descanso"], npcs: ["carteira-suzu", "velho-kaze"] }),
      L("correntes", "Casa das Correntes", "torre", "As âncoras da cidade. Os elos estão enferrujando em lugares que ninguém alcança por acidente.", { viloes: ["V028", "V055"] }),
      L("mirante", "Mirante do Rei", "palacio", "O ponto mais alto de Amagumo, onde o rei Sorahiko gosta de sentar com os pés para fora.", { viloes: ["V076"] }),
    ],
    npcs: {
      "carteira-suzu": N("Suzu", "carteira-chefe de Kazamachi", "fala correndo, sempre atrasada para alguma coisa", "chegou uma carta sem remetente: 'as correntes vão quebrar no dia do festival'", true),
      "velho-kaze": N("Velho Kaze", "ex-espião aposentado, vende pipas", "fala por enigmas e ri sozinho", "Kurokaze, o mestre espião, recebe moedas de alguém da família real"),
    },
    capitulos: [
      C("fuj1-selo", "As Correntes", 12, [
        ["falar", "carteira-suzu", "Na praça, fale com Suzu sobre a carta sem remetente."],
        ["ir", "correntes", "Investigue a Casa das Correntes."],
        ["derrotar", "V028", "Pegue o Sabotador Encapuzado em flagrante."],
        ["falar", "velho-kaze", "Mostre ao Velho Kaze o que o sabotador carregava."],
      ], "O Velho Kaze vira a moeda do sabotador entre os dedos. — Cunhada no palácio. — Ele te joga um selo de bronze da Guilda. — Toma. Roubei de um agente deles. Você vai usar melhor.",
      "Alguém DENTRO do palácio quer derrubar a cidade. E quem ganha quando um rei cai?", { principal: true, da: { bandeira: "selo" } }),
      C("fuj1-arco", "A Queda de Amagumo", 50, [
        ["derrotar", "V055", "Na Casa das Correntes, enfrente Kurokaze, o Mestre Espião Traidor."],
        ["ir", "mirante", "Corra para o Mirante do Rei. As correntes estão cedendo."],
        ["derrotar", "V076", "Enfrente Hayate Kuroha, o Primo Rival, no alto da cidade que cai."],
      ], "As correntes seguram. Kuroha cai sentado, e o rei Sorahiko pousa ao seu lado rindo, descalço. — Então o vento não errou de pessoa. — O ar ao redor de você gira, curioso, como se te cheirasse.",
      "O Núcleo Celeste não está num lugar: está no vento que escolheu Sorahiko. Kuroha tinha um amuleto que sussurrava — presente do 'Profeta'.", { principal: true, requer: ["festival"], da: { bandeira: "arco-fujin", nucleo: "celeste" } }),
    ] },

  "R-FUJ-2": { tipo: "vila", chegada: "Os Picos Tengu furam as nuvens como agulhas. Um sino toca num mosteiro lá no alto.",
    locais: [
      L("tsubasa", "Ninho de Tsubasa", "montanha", "A vila dos cavaleiros-grifo, pendurada na rocha. Os grifos andam inquietos.", { servicos: ["loja", "descanso"], npcs: ["tratador-hiko"] }),
      L("penhasco", "Penhasco dos Corvos", "montanha", "Um penhasco onde um tengu jovem desafia todo viajante para um duelo.", { viloes: ["V026"] }),
      L("mosteiro", "Mosteiro do Vento", "templo", "O mosteiro dos tengu. Só entra quem vence o Desafio do Vento.", { viloes: ["V056"] }),
    ],
    npcs: { "tratador-hiko": N("Hiko", "tratador de grifos", "fala baixo para não assustar os bichos", "nenhum grifo aceita voar para o centro do continente; eles sentem algo que a gente não sente", true) },
    capitulos: [
      C("fuj2", "O Desafio do Vento", 20, [
        ["falar", "tratador-hiko", "Em Tsubasa, pergunte a Hiko por que os grifos não voam para o centro."],
        ["derrotar", "V026", "No penhasco, vença o duelo contra Karasu."],
        ["derrotar", "V056", "No mosteiro, enfrente Sōjōbō, o Grande Abade Tengu."],
      ], "O abade te entrega um pergaminho fino. — A Espada-Vento não se aprende. Se lembra. — E, mais baixo: — Os grifos têm razão. O Esquife está rachando.",
      "Os tengu vigiam o centro do mundo desde o dia do selo. Eles contam os anos: faltam poucos para o selo completar 500 — e selos têm prazo.", { principal: true, da: { bandeira: "despertar" } }),
    ] },

  "R-FUJ-3": { tipo: "vila", chegada: "A Estepe Susuki é um mar de capim prateado. O céu aqui parece maior do que em qualquer outro lugar.",
    locais: [
      L("susukino", "Acampamento de Susukino", "campo", "Tendas redondas, cavalos soltos e fogueiras. Os pastores se mudam com o vento.", { servicos: ["loja", "descanso"], npcs: ["khan-borte", "anciao-mayoi"] }),
      L("ninhos", "Ninhos das Harpias", "montanha", "Rochas altas cobertas de penas e de coisas roubadas.", { viloes: ["V025", "V054"] }),
      L("pedagio", "Passo de Tōgo", "campo", "Uma ponte de pedra onde um bandido enorme cobra passagem.", { viloes: ["V031"] }),
      L("circulo", "O Círculo sem Vento", "ruina", "No meio da estepe, um círculo onde o capim não se mexe. No centro, uma espada fincada numa pedra.", { viloes: ["V079"] }),
    ],
    npcs: {
      "khan-borte": N("Börte", "líder dos pastores de Susukino", "fala pouco, olhando o horizonte", "as harpias roubaram os cavalos e, no ninho delas, há um mapa da estepe com um círculo marcado", true),
      "anciao-mayoi": N("Ancião de Mayoi", "guardião da vila do redemoinho", "fala girando o dedo no ar", "o redemoinho parou e deixou no centro uma pena negra de dragão, ainda morna"),
    },
    capitulos: [
      C("fuj3", "O Mapa das Harpias", 6, [
        ["falar", "khan-borte", "Em Susukino, fale com Börte sobre os cavalos roubados."],
        ["derrotar", "V025", "Suba aos ninhos e enfrente a Harpia da Estepe."],
        ["falar", "anciao-mayoi", "Mostre o mapa do ninho ao Ancião de Mayoi."],
      ], "O ancião encosta a pena negra no mapa. O círculo marcado e a pena apontam para o mesmo lugar: o centro da estepe, onde o vento nunca sopra.",
      "Há uma espada fincada numa pedra no Círculo sem Vento. Um rei antigo a deixou ali antes de morrer, 'para o quinto que vier'.", { principal: true, da: { bandeira: "despertar" } }),
      C("fuj3-espada", "A Espada na Pedra", 52, [
        ["derrotar", "V054", "Passe por Kamaitachi, as Três Doninhas-Foice."],
        ["derrotar", "V031", "Tire Tōgo do caminho."],
        ["ir", "circulo", "Entre no Círculo sem Vento."],
        ["derrotar", "V079", "Seja julgado pelo Guardião sem Vento."],
      ], "O cavaleiro espectral baixa a lança e se ajoelha. A espada sai da pedra sem resistência, como se estivesse esperando por você.",
      "Excalibur caiu das estrelas com a Árvore. O rei antigo do Vento a fincou aqui porque sabia que quatro reis não bastariam: faltava um quinto.", { requer: ["festival"], da: { bandeira: "excalibur", item: "excalibur" } }),
    ] },

  "R-FUJ-4": { tipo: "vila", chegada: "As Ilhas Ukishima flutuam e mudam de lugar. Lá embaixo, só nuvens.",
    locais: [
      L("hagoromo", "Mansões de Hagoromo", "ceu", "Mansões flutuantes ligadas por pontes de seda. Os nobres daqui nunca pisaram no chão.", { servicos: ["loja", "descanso"], npcs: ["dama-ito"] }),
      L("ninhal", "Ninhal dos Grifos", "montanha", "Uma ilha selvagem onde grifos sem dono caçam o que voa perto.", { viloes: ["V029"] }),
      L("nave", "Nave da Corsária", "porto", "Uma nave de vento ancorada numa nuvem. A bandeira é uma gaivota mostrando a língua.", { viloes: ["V058"] }),
      L("presa", "A Ilha Presa", "ruina", "A única ilha que nunca se move. Embaixo dela, correntes descem para dentro das nuvens.", { viloes: ["V075"] }),
    ],
    npcs: { "dama-ito": N("Dama Ito", "nobre entediada de Hagoromo", "fala arrastado, abanando um leque", "Hayate Kuroha anda distribuindo cargos e amuletos que sussurram; ela recusou o dela e ele não gostou", true) },
    capitulos: [
      C("fuj4", "O Acorrentado", 36, [
        ["falar", "dama-ito", "Em Hagoromo, ouça a Dama Ito sobre os amuletos de Kuroha."],
        ["derrotar", "V029", "Atravesse o Ninhal dos Grifos."],
        ["derrotar", "V058", "Vença Hayabusa, a Corsária dos Céus — ela respeita quem ganha."],
        ["derrotar", "V075", "Desça sob a Ilha Presa e enfrente Kusarigami, o Acorrentado."],
      ], "As correntes se soltam. O ser levanta o rosto e, pela primeira vez em séculos, fala: — Eu fui o carcereiro. Eles me prenderam para eu nunca contar onde fica a quinta porta.",
      "O Esquife tem cinco fechos, não quatro. Quatro núcleos… e uma quinta peça que ninguém sabe onde está.", { principal: true, da: { bandeira: "despertar" } }),
    ] },

  "R-FUJ-5": { tipo: "ermo", chegada: "O Olho da Tempestade ruge por fora. No centro, um silêncio tão grande que zune.",
    locais: [
      L("parede", "Parede do Furacão", "ceu", "A muralha de vento que gira sem parar. Para entrar, é preciso ir junto com ela.", { viloes: ["V032"] }),
      L("torre", "A Torre Fora do Mapa", "torre", "Uma torre branca no centro do silêncio. Não aparece em mapa nenhum, e guarda um arquivo de tudo o que já aconteceu.", { npcs: ["eco-do-arquivo"], viloes: ["V073", "V089"] }),
    ],
    npcs: { "eco-do-arquivo": N("O Eco do Arquivo", "uma voz que mora nas estantes", "fala com as vozes de pessoas diferentes, uma por frase", "o arquivo registra tudo, inclusive a reunião secreta dos quatro reis e o nome do menino que eles escolheram") },
    capitulos: [
      C("fuj5", "A Torre Fora do Mapa", 72, [
        ["derrotar", "V032", "Atravesse a parede do furacão vencendo o Elemental de Rajada."],
        ["falar", "eco-do-arquivo", "Na torre, pergunte ao Eco do Arquivo o que aconteceu há 500 anos."],
        ["derrotar", "V073", "Enfrente Arashimaru, o Guardião Enlouquecido."],
        ["derrotar", "V089", "Enfrente O Arquivista e conquiste a Joia dos Portões."],
      ], "O Arquivista fecha o livro. — Registrado: alguém finalmente leu até o fim. — A joia flutua até a sua mão, morna como um coração.",
      "O arquivo guarda a ata da reunião: os reis queriam o poder do ovo para acabar com a 'Era da Brasa Fraca'. Escolheram um menino pobre porque ninguém sentiria falta dele.", { requer: ["arco-fujin"], da: { bandeira: "tenmon", item: "tenmon" } }),
    ] },

  "R-FUJ-6": { tipo: "ermo", chegada: "No Desfiladeiro Kazenaki o vento passa pelas rochas e chora. Por um momento, você jura ouvir seu nome.",
    locais: [
      L("abrigo", "Abrigo dos Surdos", "taverna", "Uma estalagem de paredes grossas. Os donos são surdos de nascença, e por isso continuam aqui.", { servicos: ["loja", "descanso"], npcs: ["oto"] }),
      L("garganta", "Garganta das Vozes", "montanha", "O trecho mais estreito. As vozes aqui pedem ajuda, e não são eco.", { viloes: ["V030", "V057"] }),
      L("ninho", "Ninho dos Ventos Mortos", "vazio", "Uma gruta onde o vento não sai mais. Mil vozes presas giram no escuro.", { viloes: ["V088"] }),
    ],
    npcs: { oto: N("Oto", "dona surda da estalagem, lê lábios", "fala por gestos e por bilhetes curtos", "as vozes do desfiladeiro são de gente de verdade; a filha dela é uma delas", true) },
    capitulos: [
      C("fuj6", "As Vozes Roubadas", 24, [
        ["falar", "oto", "No abrigo, leia os bilhetes de Oto. A filha dela foi levada pelo vento."],
        ["derrotar", "V030", "Na garganta, acalme o Fantasma Chorão."],
        ["derrotar", "V057", "Enfrente o Coro de Kazenaki, as Mil Vozes."],
      ], "Uma a uma, as vozes se calam — menos uma, de menina, que diz 'mãe?' e some na direção da estalagem.",
      "Quem prende as vozes é a Mãe dos Ventos Mortos. Ela junta vozes para gritar um nome só, alto o bastante para acordar alguém no Esquife."),
      C("fuj6-mae", "A Mãe dos Ventos Mortos", 70, [
        ["ir", "ninho", "Desça ao Ninho dos Ventos Mortos."],
        ["derrotar", "V088", "Enfrente Kazenaki-no-Haha."],
      ], "As mil vozes voam livres. A última coisa que a Mãe diz é um nome, baixinho, como quem desiste: — Kaien…",
      "A Mãe dos Ventos Mortos era a mãe de Kaien. Ela passou 500 anos juntando vozes para chamar o filho.", { requer: ["festival"] }),
    ] },

  "R-FUJ-7": { tipo: "ermo", chegada: "O Templo Raijin é atingido por raios o tempo inteiro. Seu cabelo arrepia com a energia no ar.",
    locais: [
      L("escadaria", "Escadaria dos Raios", "templo", "Degraus rachados e chamuscados. Raposas de pelo elétrico correm entre as colunas.", { npcs: ["monge-raiden"], viloes: ["V027", "V074"] }),
      L("altar", "Altar do Trovão", "templo", "O altar central, onde uma sacerdotisa canta para acordar um deus.", { viloes: ["V059"] }),
      L("trono", "Trono do Deus Adormecido", "ceu", "No topo do templo, uma figura imensa dorme sentada. As nuvens giram em volta dela.", { viloes: ["V087"] }),
    ],
    npcs: { "monge-raiden": N("Raiden", "último monge do templo", "fala entre um trovão e outro", "a sacerdotisa Raiko quer acordar o deus do trovão; se ele acordar com raiva, não sobra templo") },
    capitulos: [
      C("fuj7", "Céu Errante", 68, [
        ["falar", "monge-raiden", "Na escadaria, fale com o monge Raiden."],
        ["derrotar", "V027", "Passe pela Raposa-Trovão."],
        ["derrotar", "V059", "No altar, interrompa o ritual de Raiko."],
        ["derrotar", "V074", "Enfrente Nue, a Quimera do Trovão."],
        ["derrotar", "V087", "O deus acordou. Enfrente Raijin Desperto."],
      ], "O deus do trovão te olha por um longo tempo, boceja, e volta a dormir. Onde ele pisou, fica um capítulo de um livro muito antigo.",
      "Até um deus prefere dormir a olhar para o centro do mundo. O que está no Esquife assusta os deuses.", { requer: ["arco-fujin"], da: { bandeira: "ceu-errante" } }),
    ] },

  // ───────────────────────── 虚空 KOKŪ ─────────────────────────
  "R-KOK-1": { tipo: "capital", chegada: "Kyōkai, a cidade da fronteira. Mercenários de todos os reinos, e ninguém pergunta de onde você veio.",
    locais: [
      L("guilda", "Salão da Guilda de Kyōkai", "taverna", "O maior salão de missões do continente. No fundo, uma porta que só abre à noite: a sala do Mestre.", { servicos: ["loja", "descanso"], npcs: ["recepcionista-mei", "yoru"] }),
      L("praca", "Praça do Festival", "cidade", "A praça central, enfeitada com lanternas dos quatro reinos para o Festival dos Quinhentos Anos.", { npcs: ["bardo-utai"], viloes: ["V034"] }),
      L("leilao", "Casa de Leilões", "mercado", "Um salão de veludo onde se vendem grimórios, relíquias e segredos. O leiloeiro não tem sombra.", { viloes: ["V060"] }),
      L("becos", "Becos da Fronteira", "ruina", "Vielas escuras por onde anda um caçador de magos — e, numa certa noite, o próprio Mestre da Guilda.", { viloes: ["V080", "V091"] }),
    ],
    npcs: {
      "recepcionista-mei": N("Mei", "recepcionista da Guilda", "fala sorrindo, carimbando papéis sem olhar", "o Mestre Yoru nunca foi visto de dia, e paga orfanatos em todos os reinos com o próprio bolso", true),
      yoru: N("Mestre Yoru", "Mestre da Guilda de Kyōkai", "fala calmo e gentil, lembra o nome de todo mundo, nunca levanta a voz", "ele sabe mais sobre o Esquife do que qualquer rei, e acredita de verdade que quer salvar alguém"),
      "bardo-utai": N("Utai", "bardo cego do festival", "fala em versos, mas para no meio quando esquece a rima", "a canção oficial diz 'um demônio surgiu'; a versão antiga, proibida, diz 'um menino chorou'"),
    },
    capitulos: [
      C("kok1-festival", "O Festival dos Quinhentos Anos", 14, [
        ["falar", "recepcionista-mei", "No Salão da Guilda, apresente seu selo a Mei."],
        ["falar", "bardo-utai", "Na praça, ouça a canção proibida do bardo Utai."],
        ["derrotar", "V034", "Um golpista tenta roubar o bardo: enfrente Tatsu Dois-Preços."],
        ["falar", "yoru", "À noite, o Mestre Yoru quer conhecer quem defendeu o bardo."],
      ], "Yoru serve chá para você, sem pressa. — Dizem que um demônio destruiu o centro do mundo. Eu acho que foi só um menino com medo. Você não acha estranho enterrar um menino vivo e chamar isso de heroísmo? — Ele sorri. Você acredita nele. Esse é o problema.",
      "O 'demônio' do mito era um garoto chamado Kaien, fundido a um dragão. O buraco negro foi aberto pela fúria do dragão, não pelo menino.", { principal: true, requer: ["selo"], da: { bandeira: "festival" } }),
      C("kok1-leilao", "O Leiloeiro Sem Sombra", 32, [
        ["ir", "leilao", "Entre na Casa de Leilões numa noite de venda."],
        ["derrotar", "V060", "Enfrente o Leiloeiro Sem Sombra — e tente deixá-lo vivo."],
      ], "O leiloeiro tira as luvas. As mãos dele tremem há 500 anos. — Fui eu que falei com o menino. Os reis me mandaram. Me deram uma gota de seiva para eu nunca morrer… e nunca contar. Estou cansado de não contar.",
      "O Leiloeiro é o Emissário: o homem que, a mando dos quatro reis, convenceu Kaien a roubar o ovo de Nisteroy.", { requer: ["festival"], da: { bandeira: "emissario" } }),
      C("kok1-rosto", "O Rosto de Yoru", 58, [
        ["falar", "recepcionista-mei", "Mei te chama em segredo: há um contrato de caça com o SEU nome."],
        ["derrotar", "V080", "Nos becos, enfrente Zero, o Caçador de Magos."],
        ["falar", "yoru", "Suba até a sala do Mestre. Chegou a hora de perguntar quem assinou o contrato."],
      ], "Yoru não nega. Tira os óculos, e por um segundo os olhos dele lembram os de alguém num retrato muito antigo. — Meu nome é Kanata. Sayo era a avó da avó da minha avó. Eu só quero tirar o irmão dela daquele caixão. Preciso dos quatro núcleos… e do ovo. Me ajude — ou saia da frente.",
      "Yoru é Kanata, descendente de Sayo. Ele quer abrir o Esquife com os 4 núcleos e o Ovo Eterno para libertar Kaien.", { principal: true, requer: ["arco-homura", "arco-watatsumi", "arco-daichi", "arco-fujin"], da: { bandeira: "rosto" } }),
      C("kok1-noite", "A Noite em Kyōkai", 85, [
        ["ir", "becos", "A Guilda inteira foi mandada embora. Nos becos, só resta um homem esperando."],
        ["derrotar", "V091", "Enfrente Kanata, o Profeta do Esquife."],
      ], "Kanata cai contra a parede, os óculos quebrados. — Você não entende. Ele está lá há quinhentos anos. Sozinho. — E então, mais baixo: — …E se não for mais ele? — Pela primeira vez, ele tem medo. Atrás de vocês, no centro do mundo, o céu racha.",
      "Abrir o Esquife não liberta Kaien: destampa o buraco e solta o Rei do Eclipse. Kanata nunca soube. O selo, porém, já está cedendo sozinho.", { principal: true, requer: ["ninho"], da: { bandeira: "kanata" } }),
    ] },

  "R-KOK-2": { tipo: "ermo", chegada: "A Muralha dos Selos: um anel de pilares gigantes, gravados com os quatro elementos. Alguns estão rachados.",
    locais: [
      L("posto", "Posto dos Vigias", "torre", "Uma torre de vigia quase vazia. Os que ainda vigiam não dormem direito.", { servicos: ["descanso"], npcs: ["vigia-tobi"] }),
      L("brecha", "A Brecha", "vazio", "Um pilar rachado de cima a baixo. Coisas sem cor rastejam para fora da rachadura.", { viloes: ["V033"] }),
      L("pilares", "Pilares Leste e Oeste", "templo", "Os dois pilares maiores. Suas guardiãs são irmãs gêmeas, e o Vazio está comendo as duas.", { viloes: ["V077", "V078"] }),
    ],
    npcs: { "vigia-tobi": N("Tobi", "o último vigia da muralha", "fala rápido, olhando por cima do ombro", "as guardiãs Kanae e Shizuku estão sendo devoradas pelo Vazio; se uma cair, a outra enlouquece", true) },
    capitulos: [
      C("kok2", "Os Pilares Rachados", 58, [
        ["falar", "vigia-tobi", "No posto, fale com Tobi, o último vigia."],
        ["derrotar", "V033", "Feche a brecha enfrentando o Rastejante do Vazio."],
        ["derrotar", "V077", "Liberte Kanae, a Guardiã do Pilar Leste."],
        ["derrotar", "V078", "Liberte Shizuku, a Guardiã do Pilar Oeste."],
      ], "As gêmeas se abraçam, livres, e apontam para dentro do anel. — O caminho para o Vale de Hinata está aberto. Ninguém pisa lá há 500 anos. Vá ver com os seus olhos o que os reis fizeram.",
      "Os pilares não foram feitos para manter algo DENTRO. Foram feitos para ninguém entrar e ver o que restou do vale.", { principal: true, requer: ["rosto"], da: { bandeira: "muralha" } }),
    ] },

  "R-KOK-3": { tipo: "ermo", chegada: "Na Floresta Petrificada tudo virou pedra cinza: árvores, pássaros, pessoas. Não há vento.",
    locais: [
      L("clareira", "Clareira das Estátuas", "floresta", "Dezenas de estátuas de gente, paradas no meio de um passo. Você tem certeza de que uma delas estava em outro lugar.", { viloes: ["V035"] }),
      L("trono", "Trono de Pedra", "ruina", "No centro da floresta, um rei de pedra sentado sobre uma armadura que não é deste mundo.", { viloes: ["V090"] }),
    ],
    npcs: {},
    capitulos: [
      C("kok3", "O Rei de Pedra", 78, [
        ["derrotar", "V035", "Atravesse a clareira enfrentando a Estátua Andante."],
        ["derrotar", "V090", "Enfrente Sekiō, o Rei de Pedra, e conquiste a Égide."],
      ], "O rei de pedra racha ao meio e, dentro dele, não há nada: só pó. A armadura, intacta, se ajusta ao seu corpo sozinha.",
      "Kokūgai, a Égide do Quinto Portador, foi feita para alguém que os quatro reis esperavam e que nunca veio. O 'quinto' deveria ter sido o portador do ovo.", { requer: ["muralha"], da: { bandeira: "kokugai", item: "kokugai" } }),
    ] },

  "R-KOK-7": { tipo: "ermo", chegada: "As Ruínas de Hinata. Casas de cinza petrificada, um poço seco no meio da aldeia. Há 500 anos, aqui havia risadas.",
    locais: [
      L("aldeia", "Aldeia de Cinzas", "ruina", "As casas ainda têm pratos na mesa. Tudo virou pedra cinza no mesmo instante.", { npcs: ["eco-de-sayo"] }),
      L("poco", "O Poço Seco", "caverna", "Um poço sem água. No fundo, um ninho de panos velhos, do tamanho de uma criança abraçada a um ovo.", {}),
    ],
    npcs: { "eco-de-sayo": N("Eco de Sayo", "a memória de uma menina de nove anos", "fala baixinho, como criança escondida", "ela viu tudo de dentro do poço: o irmão voltando com o ovo, o dragão descendo, o céu rasgando") },
    capitulos: [
      C("kok7", "O Poço Seco", 60, [
        ["ir", "aldeia", "Ande pela Aldeia de Cinzas."],
        ["falar", "eco-de-sayo", "Uma menina de nove anos te observa de trás de uma parede. Fale com ela."],
        ["ir", "poco", "Desça ao Poço Seco."],
      ], "No fundo do poço, a memória se completa: Kaien entrega o ovo à irmã. — Esconde. Eu volto. — Ele não voltou. O dragão o alcançou na floresta, e a dor dos dois virou uma coisa só. Sayo ficou três dias no poço, abraçada a um ovo morno.",
      "Sayo sobreviveu com o ovo. O Ovo Eterno ainda existe — e, segundo a memória, ele escolhe quem o carrega.", { principal: true, requer: ["muralha"], da: { bandeira: "poco" } }),
    ] },

  "R-KOK-8": { tipo: "ermo", chegada: "O Monte Ryūsō. Um ninho enorme e vazio no alto, e ao lado dele o toco de cristal de uma árvore que tocava o céu.",
    locais: [
      L("toco", "Toco da Árvore-Estrela", "templo", "Um toco de cristal do tamanho de uma praça. Ainda está morno.", {}),
      L("ninho", "O Ninho Vazio", "montanha", "O ninho de Nisteroy. No centro, a marca redonda de onde um ovo foi tirado.", {}),
    ],
    npcs: {},
    capitulos: [
      C("kok8", "A Voz de Nisteroy", 62, [
        ["ir", "toco", "Toque o toco da Árvore-Estrela."],
        ["ir", "ninho", "Suba ao Ninho Vazio."],
      ], "Quando você pisa no ninho, uma voz imensa e cansada fala dentro da sua cabeça: — Você tem o cheiro do meu filho. — Algo morno pulsa junto ao seu peito. Sempre esteve com você. — Leve-o até mim. Se ele nascer diante dos meus olhos, eu solto o menino.",
      "O Ovo Eterno pode romper a fusão: se chocar diante de Nisteroy, o dragão reconhece o filho e liberta o que resta de Kaien. O ovo esteve com você o tempo todo.", { principal: true, requer: ["poco"], da: { bandeira: "ninho" } }),
    ] },

  "R-KOK-4": { tipo: "ermo", chegada: "A Cratera do Vazio. O som some. As cores desbotam. Você não ouve nem os próprios passos.",
    locais: [
      L("beira", "Beira da Cratera", "vazio", "A borda do buraco. Olhar para baixo dá a sensação de estar sendo olhado de volta.", { viloes: ["V099"] }),
    ],
    npcs: {},
    capitulos: [
      C("kok4", "A Descida", 95, [
        ["derrotar", "V099", "Na beira da cratera, cale Muhyō, o Arauto do Vazio."],
      ], "A voz do Vazio se cala. No silêncio que fica, você escuta, muito lá embaixo, um menino chorando.",
      "O Vazio não é mau. É fome. O que o mantém aberto é uma dor que nunca foi consolada.", { principal: true, requer: ["kanata"], da: { bandeira: "descida" } }),
    ] },

  "R-KOK-5": { tipo: "ermo", chegada: "A Torre Sem Fim não sobe: desce. Cada andar é mais silencioso que o anterior.",
    locais: [
      L("andares", "Andares dos Reis", "torre", "Quatro salões, quatro tronos, quatro reis antigos presos ao selo que fizeram.", { viloes: ["V093", "V094", "V095", "V096"] }),
      L("fundo", "O Andar da Lua", "vazio", "O último andar. Um deus quebrado e um homem que falhou esperam quem conseguir chegar.", { viloes: ["V092", "V097"] }),
    ],
    npcs: {},
    capitulos: [
      C("kok5", "Os Reis Antigos", 88, [
        ["derrotar", "V093", "Liberte Akatsuki Ryūga, o Rei Antigo do Fogo."],
        ["derrotar", "V094", "Liberte Minazuki Shizuha, o Rei Antigo da Água."],
        ["derrotar", "V095", "Liberte Iwanaga Gōzan, o Rei Antigo da Terra."],
        ["derrotar", "V096", "Liberte Hayate Tsukumo, o Rei Antigo do Vento."],
        ["derrotar", "V092", "Enfrente Tōya, o Portador que Falhou."],
        ["derrotar", "V097", "Enfrente Tsukuyomi Partido, o Deus da Lua Quebrada."],
      ], "Os quatro reis antigos, enfim livres, se curvam diante de você — eles, que nunca se curvaram para ninguém. — Nós roubamos um filho e enterramos um menino. Não nos perdoe. Só termine o que não tivemos coragem de terminar.",
      "Os reis não se sacrificaram por heroísmo. Selaram o próprio crime. E esperaram 500 anos por alguém que consertasse de verdade.", { principal: true, requer: ["descida"], da: { bandeira: "reis-antigos" } }),
    ] },

  "R-KOK-6": { tipo: "ermo", chegada: "O Trono dos Deuses Caídos. No fundo de tudo, um caixão de cristal de quatro cores, rachado de cima a baixo.",
    locais: [
      L("esquife", "O Esquife dos Quatro Céus", "vazio", "O caixão do mundo. Dentro dele, um menino de olhos de dragão abraçado a um dragão de olhos de menino.", { viloes: ["V098", "V100"] }),
    ],
    npcs: {},
    capitulos: [
      C("kok6", "O Rei do Eclipse", 98, [
        ["derrotar", "V098", "Enfrente Nisteroy, o Dragão do Crepúsculo — a dor de um pai."],
        ["derrotar", "V100", "Enfrente Shokuō, o Rei do Eclipse."],
      ], "", "", { principal: true, requer: ["reis-antigos"], da: { bandeira: "eclipse-vencido" }, final: true }),
    ] },
};
