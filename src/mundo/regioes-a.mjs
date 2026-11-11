// Mundo vivo — parte A: Homura (Fogo) e Watatsumi (Água).
// L(id, nome, cena, descrição, extras)  · extras: servicos ["loja"|"descanso"], npcs [ids], viloes [ids, em ordem de encontro]
// N(nome, papel, jeito de falar, o que sabe, mortal?)
// C(id, título, nível sugerido, passos, fim, pista, extras)  · passos: ["falar", npc, texto] | ["ir", local, texto] | ["derrotar", vilão, texto]
// extras do capítulo: requer [bandeiras], da {bandeira, item}, principal (faz parte da campanha)
export const L = (id, nome, cena, desc, x = {}) => ({ id, nome, cena, desc, ...x });
export const N = (nome, papel, jeito, sabe, mortal = false) => ({ nome, papel, jeito, sabe, mortal });
export const C = (id, titulo, nivel, passos, fim, pista, x = {}) => ({ id, titulo, nivel, passos: passos.map(([t, a, txt]) => ({ t, a, txt })), fim, pista, ...x });

export const REGIOES_A = {
  // ───────────────────────── 焔 HOMURA ─────────────────────────
  "R-HOM-1": { tipo: "capital", chegada: "Os degraus de Kagutsuchi-jō sobem pela encosta do vulcão. Sob o vidro das ruas, a lava corre devagar.",
    locais: [
      L("praca", "Praça do Pilar de Fogo", "cidade", "Um pilar de chamas queima no centro da praça de Hibashira desde antes dos avós dos avós. Mercadores gritam em volta dele.", { servicos: ["loja", "descanso"], npcs: ["oharu", "daigo"] }),
      L("coliseu", "Coliseu de Brasas", "arena", "A arena no topo da cidade. A areia é preta, e o público não perdoa quem luta mal.", { npcs: ["juiz-renji"], viloes: ["V038", "V008", "V036"] }),
      L("kurenai", "Jardins de Lava de Kurenai", "palacio", "O distrito dos nobres: pontes finas sobre lagos de lava e máscaras de baile esquecidas nos bancos.", { viloes: ["V061"] }),
      L("camara", "Câmara do Último Duelo", "ruina", "Uma arena antiga escondida sob o coliseu. A última luta que aconteceu aqui nunca terminou de verdade.", { viloes: ["V082"] }),
    ],
    npcs: {
      oharu: N("Oharu", "dona da casa de chá da praça", "fala rindo, chama todo mundo de 'meu bem' e sabe todas as fofocas", "o pilar de fogo ficou preto por um minuto, e um homem de capuz sorriu quando isso aconteceu", true),
      daigo: N("Daigo", "mercador de relíquias falsas", "fala rápido, jura por tudo, muda de assunto quando é pego", "vende 'pedaços da Árvore-Estrela' falsos, mas um deles é quente de verdade e ele não sabe por quê"),
      "juiz-renji": N("Renji", "juiz do coliseu, ex-campeão de um braço só", "fala curto, como quem dá ordens na arena", "a duelista mascarada Kagari luta igual a alguém da família real"),
    },
    capitulos: [
      C("hom1-selo", "Areia Preta", 8, [
        ["falar", "oharu", "Na praça, converse com Oharu, a dona da casa de chá. Ela viu o pilar escurecer."],
        ["ir", "coliseu", "Suba até o Coliseu de Brasas e se inscreva no Torneio dos Novatos."],
        ["derrotar", "V038", "Vença Ōgama, o Campeão Invicto dos novatos."],
        ["falar", "juiz-renji", "Fale com o juiz Renji. Quem vence o torneio recebe o Selo da Guilda."],
      ], "Renji prende o selo de bronze no seu peito. — Com isso, a Guilda de Kyōkai te dá trabalho em qualquer reino. Não me envergonhe.",
      "Na borda do selo há quatro brasões gravados, um de cada reino. Renji diz que esse desenho é mais velho que a própria Guilda.", { principal: true, da: { bandeira: "selo" } }),
      C("hom1-arco", "O Duelo pelo Trono", 40, [
        ["falar", "juiz-renji", "Renji te procura: a duelista mascarada sumiu, e o príncipe exilado voltou à cidade."],
        ["derrotar", "V036", "No coliseu, descubra quem é Kagari, a Duelista Sem Rosto."],
        ["ir", "kurenai", "Siga a pista até os Jardins de Lava de Kurenai."],
        ["derrotar", "V061", "Enfrente Hyōsuke, o Príncipe Exilado, antes que ele desafie o rei."],
      ], "Hyōsuke cai de joelhos. Atrás de você, o rei Ryūen observa em silêncio. Seu olho esquerdo, de obsidiana, brilha por um instante — e ele acena com a cabeça, como quem reconhece alguém.",
      "O olho de obsidiana do rei não é uma ferida de duelo. É o Núcleo Rubro, um pedaço da Árvore-Estrela. Hyōsuke queria arrancá-lo para alguém chamado 'o Profeta'.", { principal: true, requer: ["festival"], da: { bandeira: "arco-homura", nucleo: "rubro" } }),
      C("hom1-ceu", "Céu Rubro", 65, [
        ["ir", "camara", "Desça à câmara escondida sob o coliseu."],
        ["derrotar", "V082", "Termine o duelo que Kagerō Ryūketsu perdeu há 500 anos."],
      ], "O espírito guarda a espada e sorri pela primeira vez em cinco séculos. Nas suas mãos fica um capítulo de um livro muito antigo.",
      "Kagerō enfrentou o rei antigo Ryūga na véspera do selo para impedir alguma coisa. Ele perdeu. No dia seguinte, quatro reis morreram.", { requer: ["arco-homura"], da: { bandeira: "ceu-rubro" } }),
    ] },

  "R-HOM-2": { tipo: "vila", chegada: "O Monte Hinokami ocupa metade do céu. À noite, o topo brilha como um segundo sol.",
    locais: [
      L("enjo", "Quartel de Enjō", "forja", "Uma vila-quartel aos pés do vulcão. O som de treino não para nem de madrugada.", { servicos: ["loja", "descanso"], npcs: ["sargento-ibuki", "velha-sumi"] }),
      L("trilha", "Trilha dos Cães de Fogo", "montanha", "Uma subida de pedra quente onde filhotes de inugami disputam restos de oferendas.", { viloes: ["V007"] }),
      L("cratera", "Coração de Hinokami", "caverna", "A cratera. A cada sete dias o vulcão respira fundo, e as chamas lá dentro andam violetas.", { viloes: ["V062"] }),
      L("forte", "Forte de Guerra de Bakuen", "palacio", "Um forte novo, cheio de armas apontadas para o oeste, que o rei nunca mandou construir.", { viloes: ["V063"] }),
    ],
    npcs: {
      "sargento-ibuki": N("Ibuki", "sargenta instrutora de Enjō", "grita por costume, mas cuida dos recrutas como filhos", "o prisioneiro cultista ria e repetia 'o menino vai voltar'", true),
      "velha-sumi": N("Sumi", "guardiã cega do santuário da fênix", "fala baixo, como quem reza", "a fênix sagrada adoeceu quando as chamas ficaram violetas; ela ainda pode ser salva"),
    },
    capitulos: [
      C("hom2", "As Chamas Violetas", 14, [
        ["falar", "sargento-ibuki", "No quartel, fale com a sargenta Ibuki sobre o prisioneiro que ria."],
        ["derrotar", "V007", "Abra caminho pela trilha dos cães de fogo."],
        ["falar", "velha-sumi", "Procure Sumi, a guardiã cega, e pergunte sobre a fênix."],
        ["derrotar", "V062", "Na cratera, enfrente a Hinotori Corrompida e liberte a fênix do Vazio."],
      ], "As chamas voltam a ser douradas. A fênix encosta a cabeça no seu ombro por um segundo e sobe para o céu.",
      "O Vazio não queima nem congela: ele apaga. E alguém está trazendo pedaços dele para dentro dos reinos, de propósito.", { da: { bandeira: "fenix" } }),
      C("hom2-guerra", "A Guerra Fabricada", 45, [
        ["falar", "sargento-ibuki", "Ibuki desconfia das ordens do general. Ouça o que ela descobriu."],
        ["ir", "forte", "Entre no forte de guerra de Bakuen."],
        ["derrotar", "V063", "Detenha o General Bakuen antes que ele marche contra Watatsumi."],
      ], "Entre os mapas do general você encontra cartas com o selo da Guilda de Kyōkai. Alguém pagou por esta guerra.",
      "A Guilda vende armas para os dois lados. Guerras entre reinos enfraquecem os reis — e reis fracos perdem seus núcleos.", { requer: ["festival"] }),
    ] },

  "R-HOM-3": { tipo: "vila", chegada: "A cinza range sob as botas. No horizonte, cascos de navios dormem na areia de um mar que não existe mais.",
    locais: [
      L("haibara", "Vila de Haibara", "vila", "Casas baixas de pedra negra, cobertas de fuligem. Todo mundo aqui é mineiro, filho de mineiro ou viúva de mineiro.", { servicos: ["loja", "descanso"], npcs: ["tomoe", "kenta"] }),
      L("mina", "Boca da Mina Abandonada", "mina", "Um buraco de vidro negro na duna. O calor que sai dele tem cheiro de ferro.", { viloes: ["V001", "V005"] }),
      L("navios", "Cemitério de Navios", "ruina", "Dezenas de navios encalhados na cinza. À noite, luzes passam pelos conveses.", { npcs: ["anciã-kagero"], viloes: ["V006", "V039"] }),
      L("altar", "Altar das Dunas", "templo", "Um círculo de pedras queimadas onde o Culto da Cinza reza para o mar voltar.", { viloes: ["V037"] }),
    ],
    npcs: {
      tomoe: N("Tomoe", "ferreira de Haibara, mãe da criança sumida", "fala pouco e olha firme; a voz falha quando cita o filho", "o capataz Kurogane mente: a mina não está vazia, alguém leva comida para lá toda noite", true),
      kenta: N("Kenta", "menino entregador, amigo da criança sumida", "fala depressa, cheio de 'juro!'", "viu kobolds de cinza carregando ferramentas para dentro da mina"),
      "anciã-kagero": N("Anciã de Kagerō", "última anciã da vila-miragem", "fala como quem conta um sonho", "a vila-miragem some porque o que a segurava no mundo está acabando: a memória do mar"),
    },
    capitulos: [
      C("hom3", "A Criança da Mina", 6, [
        ["falar", "tomoe", "Em Haibara, fale com Tomoe, a ferreira. O filho dela sumiu na mina."],
        ["ir", "mina", "Vá até a boca da mina abandonada."],
        ["derrotar", "V001", "Passe pelos kobolds de cinza que guardam a entrada."],
        ["derrotar", "V005", "Enfrente o capataz Kurogane e liberte os mineiros presos."],
      ], "No fundo da mina, a criança está viva, com outros doze mineiros. Tomoe não diz nada: só te abraça com as mãos queimadas.",
      "Numa parede de obsidiana, a luz mostra um desenho antigo: um menino correndo com um ovo nos braços. Ninguém em Haibara sabe o que significa.", { principal: true, da: { bandeira: "despertar" } }),
      C("hom3-mar", "O Mar que Sumiu", 20, [
        ["falar", "anciã-kagero", "No cemitério de navios, ouça a última anciã de Kagerō."],
        ["derrotar", "V006", "Enfrente os marinheiros-esqueleto que guardam os conveses."],
        ["derrotar", "V039", "Suba no maior navio e enfrente a Capitã Mizuchi."],
        ["derrotar", "V037", "No Altar das Dunas, acabe com os sacrifícios de Okibi."],
      ], "A capitã olha o horizonte de cinza uma última vez. — Então foi isso. O mar não nos deixou. Ele foi bebido. — E some com o vento.",
      "Aqui havia um mar. Há 500 anos, alguma coisa no centro do mundo o bebeu inteiro numa noite.") ,
    ] },

  "R-HOM-4": { tipo: "ermo", chegada: "Árvores de casca queimada, folhas de brasa. Os vagalumes de fogo desenham constelações entre os galhos.",
    locais: [
      L("clareira", "Clareira das Ervas", "floresta", "Uma clareira onde curandeiras colhem ervas que só crescem perto do fogo.", { servicos: ["descanso"], npcs: ["akane"] }),
      L("ninho", "Ninho do Enxame", "floresta", "Um trecho da floresta onde não há mais animais. Só um zumbido baixo, por toda parte.", { viloes: ["V004"] }),
      L("labirinto", "Labirinto dos Vagalumes", "templo", "Corredores de luz que mudam de lugar. Quem entra sem respeito anda em círculos até cansar.", { viloes: ["V040"] }),
    ],
    npcs: { akane: N("Akane", "curandeira aprendiz", "fala sonhando acordada, mistura remédio com poesia", "na lua nova os vagalumes desenham um mapa: um vale no centro do mundo, com uma árvore enorme", true) },
    capitulos: [
      C("hom4", "O Mapa de Luz", 15, [
        ["falar", "akane", "Na clareira, fale com Akane sobre o desenho dos vagalumes."],
        ["derrotar", "V004", "Acabe com o Enxame Carniceiro que tomou a floresta."],
        ["derrotar", "V040", "No labirinto, passe no teste de Hotaru-hime, a Rainha dos Vagalumes."],
      ], "A rainha sorri. Os vagalumes se juntam no ar e desenham, só para você, uma árvore gigantesca de luz — e ao lado dela, um dragão dormindo.",
      "Antes do buraco, o centro do mundo era um vale verde. Lá crescia a Árvore-Estrela, e um dragão a guardava."),
    ] },

  "R-HOM-5": { tipo: "ermo", chegada: "O Rio Yōgan corre vermelho e lento. As pontes de obsidiana estalam com o calor.",
    locais: [
      L("porto", "Cais dos Barqueiros de Pedra", "porto", "Barqueiros feitos de pedra esperam passageiros sem dizer palavra. Só aceitam moedas quentes.", { servicos: ["descanso"], npcs: ["barqueiro"] }),
      L("margem", "Margem das Salamandras", "caverna", "Tocas na margem do rio. Olhos alaranjados acompanham cada passo seu.", { viloes: ["V002"] }),
      L("forja", "Forja Afundada", "forja", "A antiga forja real, meio engolida pela lava. Um martelo ainda bate lá dentro.", { viloes: ["V041"] }),
      L("ponte", "Ponte do Dragão Adormecido", "ponte", "A maior ponte do rio. As 'pedras' dela têm escamas.", { viloes: ["V064"] }),
    ],
    npcs: { barqueiro: N("O Barqueiro Mais Velho", "barqueiro de pedra", "fala uma palavra de cada vez, com longas pausas", "a ponte grande respira; e o ferreiro Gōen não caiu no rio — foi empurrado por ordem de um nobre") },
    capitulos: [
      C("hom5", "O Que Dorme na Ponte", 38, [
        ["falar", "barqueiro", "No cais, pague uma moeda quente e ouça o barqueiro mais velho."],
        ["derrotar", "V002", "Atravesse a margem das salamandras."],
        ["derrotar", "V041", "Na forja afundada, enfrente Gōen, o Forjador Traído."],
        ["derrotar", "V064", "Acorde e derrote Yōgan-ryū, o Dragão da Ponte."],
      ], "O dragão afunda na lava devagar, quase aliviado. Onde ele dormia, há uma inscrição: 'Aqui passou o último filho do Crepúsculo.'",
      "Os dragões pequenos fugiram do centro do mundo há 500 anos. Fugiam de um dragão maior — ou da dor dele."),
    ] },

  "R-HOM-6": { tipo: "ermo", chegada: "A névoa vermelha da Costa Akashio cobre tudo. O mar chia onde a água quente encontra a fria.",
    locais: [
      L("feira", "Feira da Névoa", "mercado", "Barracas montadas dentro da névoa, onde contrabandistas dos dois reinos fingem não se conhecer.", { servicos: ["loja", "descanso"], npcs: ["nami"] }),
      L("gruta", "Gruta do Mão-Brasa", "caverna", "Um esconderijo entre as pedras, cheio de caixas marcadas com o selo da Guilda.", { viloes: ["V003"] }),
    ],
    npcs: { nami: N("Nami", "barqueira de fronteira", "fala debochada, cobra por tudo, mas cumpre o que promete", "Gonzō anda contrabandeando cristais negros que ninguém tem coragem de segurar por muito tempo", true) },
    capitulos: [
      C("hom6", "Carga Negra", 8, [
        ["falar", "nami", "Na Feira da Névoa, pergunte a Nami sobre a carga estranha."],
        ["ir", "gruta", "Encontre o esconderijo de Gonzō."],
        ["derrotar", "V003", "Enfrente Gonzō Mão-Brasa."],
      ], "Nas caixas de Gonzō há cristais negros que sugam o calor da sua mão. Na tampa, um destino: 'Kyōkai — aos cuidados do Mestre'.",
      "Os cristais negros são mana do Vazio solidificada. Alguém em Kyōkai está comprando todos."),
    ] },

  "R-HOM-7": { tipo: "ermo", chegada: "Só as pontas das torres de Enma escapam do magma endurecido. O silêncio daqui pesa.",
    locais: [
      L("torres", "Torres Afogadas", "ruina", "Topos de torres antigas, ligados por passarelas de pedra. Lá embaixo, a cidade inteira dorme no magma.", { npcs: ["escriba"] }),
      L("portao", "Portão de Enma", "templo", "Um portão de ferro negro que desce para o submundo de fogo. Está entreaberto.", { viloes: ["V081"] }),
    ],
    npcs: { escriba: N("O Escriba Queimado", "fantasma de um escrivão da cidade", "fala formal, como quem lê uma sentença", "Enma-ō condenou a própria cidade porque ela se recusou a mandar homens para 'a obra dos quatro reis'") },
    capitulos: [
      C("hom7", "O Juiz do Submundo", 70, [
        ["falar", "escriba", "Nas torres, ouça o Escriba Queimado."],
        ["derrotar", "V081", "Atravesse o portão e enfrente Enma-ō, o Juiz do Submundo de Fogo."],
      ], "O juiz baixa o martelo pela última vez. — Sentença revista. A cidade era inocente. — E o portão se fecha sozinho.",
      "Quinhentos anos atrás, os quatro reis fizeram uma 'obra' juntos e puniram quem recusou ajudar. Não era um selo. O selo veio depois.", { requer: ["festival"] }),
    ] },

  // ───────────────────────── 水 WATATSUMI ─────────────────────────
  "R-WAT-1": { tipo: "capital", chegada: "Ryūgū-jō flutua dentro de uma bolha d'água sobre o lago. Você sobe por escadas de água que não molham.",
    locais: [
      L("mercado", "Mercado das Pérolas", "mercado", "Bancas de coral onde se vende de tudo, e onde uma dívida de honra vale mais que ouro.", { servicos: ["loja", "descanso"], npcs: ["mestre-uo", "shizu"] }),
      L("portao", "Portão de Coral", "palacio", "A entrada do palácio. Os guardas de coral estão parados demais, e um deles tem os olhos escuros.", { viloes: ["V015"] }),
      L("biblioteca", "Biblioteca Submersa", "biblioteca", "Estantes debaixo d'água. Os livros não molham; quem lê é que precisa prender o fôlego.", { viloes: ["V043"] }),
      L("salao", "Salão das Marés", "palacio", "O salão do trono. O rei Kaishin anda pálido, e o conselheiro nunca sai do lado dele.", { viloes: ["V084", "V068"] }),
    ],
    npcs: {
      "mestre-uo": N("Mestre Uo", "velho peixeiro e ex-guarda do palácio", "fala manso, com ditados de pescador", "o conselheiro Saigō troca os guardas fiéis por guardas de coral 'consertados'", true),
      shizu: N("Shizu", "aprendiz de bibliotecária", "fala sussurrando, até fora da biblioteca", "existe uma Ala Proibida, e a última bibliotecária que entrou lá nunca parou de ler"),
    },
    capitulos: [
      C("wat1-selo", "Água Preta", 16, [
        ["falar", "mestre-uo", "No mercado, converse com Mestre Uo sobre os guardas do palácio."],
        ["derrotar", "V015", "No Portão de Coral, enfrente o Guarda-Coral Corrompido."],
        ["falar", "shizu", "Leve o que encontrou a Shizu. A Guilda paga por esse tipo de serviço."],
      ], "Dentro do guarda quebrado escorre uma água preta e fria. Shizu sela um frasco com ela e te entrega um selo de bronze da Guilda. — Você vai precisar disso para ser ouvido.",
      "A 'água preta' é o Vazio dissolvido. O mesmo líquido escorreu dos lábios do rei Kaishin num banquete.", { principal: true, da: { bandeira: "selo" } }),
      C("wat1-arco", "A Maré do Retorno", 50, [
        ["falar", "shizu", "Shizu achou a chave da Ala Proibida. Ela está com medo de ir sozinha."],
        ["derrotar", "V043", "Na Ala Proibida, enfrente Shiori, a Bibliotecária Afogada."],
        ["derrotar", "V084", "No Salão das Marés, quebre o feitiço de Otohime Negra sobre o rei."],
        ["derrotar", "V068", "Desmascare e derrote Saigō Shiogama, o Conselheiro das Marés."],
      ], "O rei Kaishin respira fundo, livre pela primeira vez em anos. Ele põe a mão no peito, onde algo brilha em azul. — Eu sei toda a verdade, criança. Guardei silêncio para evitar uma guerra. Chegou a hora de falar.",
      "O livro proibido diz: os quatro reis antigos ENCOMENDARAM o roubo do ovo do dragão. Mandaram um emissário convencer um menino pobre a fazer o serviço.", { principal: true, requer: ["festival"], da: { bandeira: "arco-watatsumi", nucleo: "abissal" } }),
    ] },

  "R-WAT-2": { tipo: "vila", chegada: "O Lago Kagami é um espelho perfeito. No reflexo, as nuvens andam para o lado errado.",
    locais: [
      L("minato", "Porto de Minato", "porto", "Um porto barulhento, cheio de cordas, gaivotas e marinheiros que mentem sobre o tamanho dos peixes.", { servicos: ["loja", "descanso"], npcs: ["capitao-goro", "rin"] }),
      L("raso", "Baixio das Lanternas", "lago", "Águas rasas onde medusas brilhantes flutuam como lanternas. Bonitas, até encostarem em você.", { viloes: ["V010"] }),
      L("espelho", "Margem do Espelho", "lago", "O ponto mais parado do lago. O seu reflexo aqui demora um segundo a mais para te imitar.", { viloes: ["V044"] }),
    ],
    npcs: {
      "capitao-goro": N("Capitão Gorō", "capitão do porto", "fala alto, bate nas costas, ri de tudo", "um navio chegou sem tripulação, carregado de cristais negros, vindo da direção de Kyōkai", true),
      rin: N("Rin", "menina que vende água-espelho", "fala baixinho, olhando para o lago", "na lua cheia o reflexo do lago mostra o passado, e ela já viu ali um menino correndo com um ovo"),
    },
    capitulos: [
      C("wat2", "O Navio sem Tripulação", 6, [
        ["falar", "capitao-goro", "Em Minato, fale com o Capitão Gorō sobre o navio fantasma."],
        ["derrotar", "V010", "Limpe o Baixio das Lanternas para chegar ao navio."],
        ["falar", "rin", "Rin viu algo no reflexo do lago. Ouça o que ela tem a dizer."],
      ], "No porão do navio, os cristais negros estão arrumados com cuidado. No diário de bordo, a última linha: 'O Mestre paga em dobro por viagens sem perguntas.'",
      "Rin jura que o lago mostra o passado. E no passado, o centro do mundo não era um buraco: era um vale.", { principal: true, da: { bandeira: "despertar" } }),
      C("wat2-ontem", "Você, de Ontem", 22, [
        ["falar", "rin", "Rin está assustada: o reflexo dela parou de imitá-la."],
        ["ir", "espelho", "Vá até a Margem do Espelho numa noite de lua."],
        ["derrotar", "V044", "Enfrente o Reflexo Invertido — você mesmo, de ontem."],
      ], "O reflexo se desfaz em ondas. Por um instante o lago mostra outra coisa: quatro reis de coroas diferentes, reunidos em segredo ao redor de um mapa.",
      "Os quatro reis antigos se reuniram às escondidas ANTES do desastre. Eles planejavam alguma coisa juntos."),
    ] },

  "R-WAT-3": { tipo: "vila", chegada: "Centenas de ilhotas, casas sobre palafitas, cheiro de sal. Uma baleia passa voando sobre os telhados.",
    locais: [
      L("amiya", "Palafitas de Amiya", "porto", "Uma vila de pescadores sobre estacas. As redes secam ao sol e as crianças pulam de uma casa para outra.", { servicos: ["loja", "descanso"], npcs: ["vo-ume", "taro"] }),
      L("mangue", "Mangue dos Kappas", "pantano", "Raízes tortas e água turva. Coisas pequenas somem dos barcos quando ninguém está olhando.", { viloes: ["V009"] }),
      L("afundadas", "Palafitas Afundadas", "ruina", "A parte velha da vila, engolida pelo mar no naufrágio de 50 anos atrás. Na maré baixa, as casas reaparecem.", { viloes: ["V013", "V011"] }),
      L("ilha", "A Ilha que Anda", "porto", "Uma ilha que muda de lugar no mapa. É o casco de uma tartaruga ancestral, e há piratas acampados nela.", { viloes: ["V046", "V065"] }),
    ],
    npcs: {
      "vo-ume": N("Vó Ume", "a pescadora mais velha de Amiya", "fala devagar, costurando rede, e chama todo mundo de 'menino'", "os afogados pedem 'devolva' porque Sabuurō tirou algo do fundo: um sino do barco naufragado", true),
      taro: N("Tarō", "pescador jovem e medroso", "fala gaguejando quando o assunto é o mar à noite", "viu Sabuurō Dente-de-Ouro mergulhando nas palafitas afundadas com um saco cheio"),
    },
    capitulos: [
      C("wat3", "Devolva", 7, [
        ["falar", "vo-ume", "Em Amiya, fale com a Vó Ume. Os afogados saíram da água pedindo 'devolva'."],
        ["derrotar", "V009", "No mangue, pegue o Kappa Ladrão que anda roubando os barcos."],
        ["derrotar", "V013", "Nas Palafitas Afundadas, acalme o Afogado de Amiya."],
        ["derrotar", "V011", "Enfrente Sabuurō Dente-de-Ouro e recupere o sino roubado."],
      ], "Você devolve o sino ao mar. Os afogados afundam devagar, um por um, e o último acena. Vó Ume chora sem fazer barulho.",
      "No sino há uma data gravada: o barco afundou na noite em que a água do mar ficou preta por uma hora. Faz 50 anos — e está acontecendo de novo.", { principal: true, da: { bandeira: "despertar" } }),
      C("wat3-ilha", "O Senhor da Ilha que Anda", 30, [
        ["falar", "taro", "Tarō viu a ilha dos piratas passar perto da vila. Pergunte para onde ela foi."],
        ["derrotar", "V046", "Suba na ilha e enfrente o Almirante Kujira."],
        ["derrotar", "V065", "Em noite calma, encare Umibōzu, o Monge do Mar."],
      ], "A tartaruga ancestral abre um olho do tamanho de uma casa, olha para você e mergulha devagar. As ondas levam a vila pirata embora.",
      "A tartaruga é mais velha que os reinos. Ela se lembra de quando o céu do centro do mundo ficou negro, e desde então nunca mais nadou para lá."),
    ] },

  "R-WAT-4": { tipo: "vila", chegada: "O pântano Numa-no-Me cheira a folha podre. Olhos amarelos piscam debaixo da água escura.",
    locais: [
      L("kirigakure", "Vila de Kirigakure", "pantano", "Uma vila escondida na névoa. Quem sai daqui esquece o caminho de volta.", { servicos: ["loja", "descanso"], npcs: ["oboro"] }),
      L("charco", "Charco dos Sapos", "pantano", "Um charco onde os sapos coaxam em coro, e um deles coaxa palavras.", { viloes: ["V012", "V045"] }),
      L("cabana", "Cabana da Bruxa-Mãe", "taverna", "Uma cabana sobre pernas de árvore. Na porta, uma placa: 'Grimórios. Paga-se em anos.'", { viloes: ["V047"] }),
    ],
    npcs: { oboro: N("Oboro", "guardião da névoa de Kirigakure", "fala em frases pela metade, como se esquecesse o resto", "a névoa escreveu 'o fruto do dragão'; é assim que as avós daqui chamavam um ovo") },
    capitulos: [
      C("wat4", "O Fruto do Dragão", 12, [
        ["falar", "oboro", "Em Kirigakure, fale com Oboro sobre as letras que a névoa formou."],
        ["derrotar", "V012", "No charco, faça o Sapo-Bruxo falar."],
        ["derrotar", "V045", "Sobreviva a Namazu, o Bagre do Terremoto."],
        ["derrotar", "V047", "Na cabana, enfrente Yamanba, a Bruxa-Mãe, sem assinar nada."],
      ], "A bruxa ri enquanto se desfaz em folhas secas. — Novecentos anos emprestados… e nenhum deles valeu o que aquele menino perdeu numa noite só.",
      "'O fruto do dragão' é um ovo. A bruxa tinha 900 anos e ainda se lembrava: um menino o roubou, e o mundo pagou.", { principal: true, da: { bandeira: "despertar" } }),
    ] },

  "R-WAT-5": { tipo: "ermo", chegada: "A Geleira Hyōga é azul até onde a vista alcança. Dentro do gelo, sombras de soldados em formação.",
    locais: [
      L("acampamento", "Acampamento dos Caçadores", "gelo", "Tendas de pele ao redor de uma fogueira que nunca pode apagar.", { servicos: ["loja", "descanso"], npcs: ["yuki"] }),
      L("planalto", "Planalto dos Lobos", "gelo", "Um descampado branco onde os uivos vêm de todos os lados.", { viloes: ["V014"] }),
      L("legiao", "Legião Congelada", "ruina", "Um exército inteiro preso no gelo. Os estandartes têm QUATRO brasões costurados juntos.", { viloes: ["V066"] }),
    ],
    npcs: { yuki: N("Yuki", "caçadora de mamutes", "fala seca, economiza palavras como economiza lenha", "os soldados do gelo usam quatro brasões juntos; nenhum reino sozinho mandou aquele exército", true) },
    capitulos: [
      C("wat5", "O Exército de Quatro Brasões", 40, [
        ["falar", "yuki", "No acampamento, fale com Yuki sobre os estandartes no gelo."],
        ["derrotar", "V014", "Atravesse o Planalto dos Lobos."],
        ["derrotar", "V066", "Enfrente Hyōō, o Rei do Exército Congelado."],
      ], "O general congelado bate continência antes de cair. — Missão: cercar o vale. Ninguém sai. Ordens… dos quatro. — E o gelo o cobre de novo.",
      "Um exército dos QUATRO reinos marchava para cercar o Vale de Hinata. Os reis sabiam que algo ia acontecer lá — porque foram eles que começaram.", { requer: ["festival"] }),
    ] },

  "R-WAT-6": { tipo: "ermo", chegada: "As cachoeiras Taki-no-Koe rugem. No meio do barulho, a água parece dizer nomes.",
    locais: [
      L("mirante", "Mirante dos Peregrinos", "templo", "Um pequeno santuário com sinos de vento, onde os peregrinos deixam pedidos escritos em folhas.", { servicos: ["descanso"], npcs: ["irma-mizu"] }),
      L("lagoa", "Lagoa do Canto Partido", "lago", "Uma lagoa calma onde uma voz linda canta sempre a mesma música, e sempre desafina no final.", { viloes: ["V016"] }),
      L("santuario", "Santuário Atrás da Queda", "caverna", "Atrás da maior cachoeira, um santuário onde os espíritos animais escolhem seus companheiros.", { viloes: ["V042"] }),
    ],
    npcs: { "irma-mizu": N("Irmã Mizu", "sacerdotisa das águas", "fala cantando as vogais", "Ugetsu, o espírito-carpa, testa quem busca um companheiro espiritual; ele não é mau, é exigente") },
    capitulos: [
      C("wat6", "Quem a Água Chama", 20, [
        ["falar", "irma-mizu", "No mirante, peça a bênção da Irmã Mizu."],
        ["derrotar", "V016", "Na lagoa, liberte a Sereia do Canto Partido da música que a prende."],
        ["derrotar", "V042", "Atrás da queda, passe no teste de Ugetsu, o Guardião."],
      ], "Ugetsu inclina a cabeça. — Digno. — Atrás dele, dezenas de olhos pequenos e curiosos te observam das sombras do santuário.",
      "Os espíritos animais nasceram das sementes que caíram da Árvore-Estrela quando ela se partiu. Por isso só alguns os ouvem.", { da: { bandeira: "santuario-agua" } }),
    ] },

  "R-WAT-7": { tipo: "ermo", chegada: "Na Fossa Shinkai, a luz desiste. A pressão aperta o peito e algo imenso se move lá embaixo.",
    locais: [
      L("borda", "Borda do Abismo", "caverna", "A última pedra iluminada antes da escuridão. Mergulhadores deixam aqui lanternas para achar o caminho de volta.", { npcs: ["mergulhador"] }),
      L("fundo", "Leito do Leviatã", "vazio", "O fundo do mundo. A rocha aqui é fria e fina, como se houvesse um vazio por baixo dela.", { viloes: ["V067", "V083"] }),
    ],
    npcs: { mergulhador: N("Kaito, o Mergulhador", "mergulhador veterano de um pulmão só", "fala entre goles de ar, sem pressa", "o fundo da fossa encosta no Vazio por baixo da terra; é por ali que a água preta sobe") },
    capitulos: [
      C("wat7", "Céu Profundo", 68, [
        ["falar", "mergulhador", "Na borda, ouça o velho mergulhador antes de descer."],
        ["derrotar", "V067", "Passe por Nure-onna, a Serpente das Profundezas."],
        ["derrotar", "V083", "No leito, enfrente o Leviatã de Shinkai."],
      ], "O leviatã se enrola uma última vez e adormece. Entre as escamas dele, intacto, um capítulo de um livro muito antigo.",
      "O buraco no centro do mundo não é só um buraco para baixo. Ele se espalha por baixo de todos os reinos, como raiz.", { requer: ["arco-watatsumi"], da: { bandeira: "ceu-profundo" } }),
    ] },
};
