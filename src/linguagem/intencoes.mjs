// Catálogo de intenções do jogador. Cada intenção: contextos onde vale, padrões (regex sobre o texto
// NORMALIZADO, sem acento e com gírias expandidas), peso e entidades que tenta extrair.
// Contextos: livre (explorando), batalha, menu (esperando um número), dialogo (cena com NPC), criacao.

const P = (s) => new RegExp(`\\b(?:${s})\\b`);

export const INTENCOES = [
  // ───────────── BATALHA ─────────────
  { id: "atacar", ctx: ["batalha"], peso: 3, ent: ["alvo"],
    p: [P("ataco|ataca|atacar|atacando|ataque|bato|bate|bater|soco|socar|soco nele|chuto|chute|chutar|golpeio|golpear|golpe|corto|corta|cortar|acerto|acertar|espadada|porrada|investida|avanco nele|meto a espada|furo|furar|mordo|morder|arranho")] },
  { id: "magia", ctx: ["batalha"], peso: 4, ent: ["magia", "alvo"],
    p: [P("magia|feitico|conjuro|conjurar|conjura|lanco|lancar|lanca|solto|soltar|disparo|disparar|invoco"), P("bola de fogo|raio|jato|lamina de vento|punho de terra|cura|escudo de")] },
  { id: "habilidade", ctx: ["batalha"], peso: 4, ent: ["habilidade", "alvo"],
    p: [P("habilidade|tecnica|especial|golpe especial|minha tecnica|iaijutsu|aura de combate|corte anulador|garra de miasma|luz restauradora|marca da maldicao|terreno vivo|disparo elemental")] },
  { id: "defender", ctx: ["batalha"], peso: 4, ent: [],
    p: [P("defendo|defender|defende|me defendo|bloqueio|bloquear|bloqueia|levanto o escudo|guarda alta|fico na defensiva|esquivo|esquivar|me protejo|aguento")] },
  { id: "item", ctx: ["batalha", "livre"], peso: 4, ent: ["item", "aliado"],
    p: [P("uso|usar|usa|tomo|tomar|toma|bebo|beber|bebe|jogo|joga|passo|aplico|aplicar|dou")], requer: ["item"] },
  { id: "proteger", ctx: ["batalha"], peso: 4, ent: ["aliado"],
    p: [P("protejo|proteger|protege|cubro|cobrir|fico na frente|entro na frente|salvo|defendo (o|a)")], requer: ["aliado"] },
  { id: "trocar_fileira", ctx: ["batalha"], peso: 3, ent: [],
    p: [P("recuo para tras|vou para tras|vou para a retaguarda|volto para tras|vou para frente|vou para a frente|avanco para a frente|troco de fileira|mudo de posicao|mudo de fileira")] },
  { id: "fugir", ctx: ["batalha"], peso: 4, ent: [],
    p: [P("fujo|fugir|foge|fuga|corre|correr|corro|vazar|vazo|sair correndo|saio correndo|bater em retirada|retirada|escapar|escapo")] },
  { id: "pet_ordem", ctx: ["batalha"], peso: 3, ent: ["alvo"],
    p: [P("pet|meu espirito|meu companheiro|meu bicho|kitsune|hiyoko|koi|raiju")] },
  { id: "opcoes", ctx: ["batalha", "livre", "menu"], peso: 2, ent: [],
    p: [/^\?$/, P("o que (eu )?posso fazer|quais (sao )?(as )?opcoes|opcoes|me ajuda aqui")] },

  // ───────────── EXPLORAÇÃO E MUNDO ─────────────
  { id: "explorar", ctx: ["livre"], peso: 3, ent: [],
    p: [P("explorar|exploro|explora|explorando|olho em volta|olhar em volta|procuro algo|procurar algo|vasculho|vasculhar|investigar a area|o que tem aqui|dou uma volta|andar por ai|ando por ai|rodo por ai")] },
  { id: "viajar", ctx: ["livre"], peso: 3, ent: ["regiao"],
    p: [P("vou|ir|indo|viajo|viajar|sigo|seguir|parto|partir|caminho|caminhar|vamos|levar"), P("para|ate|rumo|em direcao")], requer: ["regiao"] },
  { id: "rota", ctx: ["livre"], peso: 4, ent: ["regiao"],
    p: [P("como (eu )?(chego|vou|faco para chegar)|qual (o )?caminho|rota|quanto falta para")] },
  { id: "mapa", ctx: ["livre", "batalha"], peso: 3, ent: ["reino"],
    p: [P("mapa|onde (eu )?estou|onde estamos|onde fica|em que lugar")] },
  { id: "ficha", ctx: ["livre", "batalha"], peso: 3, ent: [],
    p: [P("ficha|minha carta|meu personagem|meus atributos|atributos|minha ficha|meu status completo")] },
  { id: "status", ctx: ["livre", "batalha"], peso: 2, ent: [],
    p: [P("status|como (eu )?estou|quanto de (vida|mana)|minha vida|minha mana|estou ferido")] },
  { id: "inventario", ctx: ["livre", "batalha"], peso: 3, ent: [],
    p: [P("inventario|mochila|bolsa|meus itens|o que eu tenho|minhas coisas|itens")] },
  { id: "equipar", ctx: ["livre"], peso: 3, ent: ["item"],
    p: [P("equipo|equipar|equipa|visto|vestir|empunho|empunhar|coloco a|ponho a")] },
  { id: "descansar", ctx: ["livre"], peso: 3, ent: [],
    p: [P("descansar|descanso|dormir|durmo|vou dormir|estalagem|pousada|recuperar as forcas")] },
  { id: "loja", ctx: ["livre"], peso: 3, ent: ["item"],
    p: [P("loja|comprar|compro|vender|vendo|mercador|quanto custa|preco")] },
  { id: "cidade", ctx: ["livre"], peso: 3, ent: [],
    p: [P("cidade|forja|ferreiro|dojo|treinar|templo|taverna|bar|quadro de missoes|missoes")] },
  { id: "missoes", ctx: ["livre"], peso: 3, ent: [],
    p: [P("missao|missoes|quest|tarefa|o que eu faco agora|qual o proximo passo|objetivo")] },
  { id: "party", ctx: ["livre"], peso: 3, ent: ["aliado"],
    p: [P("party|equipe|grupo de batalha|time"), P("criar|cria|monta|montar|convida|convidar|chama|chamar|sair|saio|entrar|entro")] },
  { id: "duelo", ctx: ["livre"], peso: 5, ent: ["aliado"],
    p: [P("duelo|te desafio|desafio (voce|o|a)|x1|1v1|vamos lutar")] },
  { id: "trocar", ctx: ["livre"], peso: 4, ent: ["aliado", "item"],
    p: [P("troca|trocar|troco|trocamos"), P("por")] },
  { id: "pet_ver", ctx: ["livre"], peso: 3, ent: [],
    p: [P("meu pet|meu espirito|meu companheiro|carinho no pet|alimentar o pet|dar comida")] },
  { id: "pistas", ctx: ["livre"], peso: 3, ent: [],
    p: [P("pistas|diario|anotacoes|o que eu sei|lembrancas|memorias")] },
  { id: "relogio", ctx: ["livre"], peso: 4, ent: [],
    p: [P("relogio|quanto falta para o eclipse|nucleos|como esta o mundo")] },
  { id: "vigor", ctx: ["livre"], peso: 3, ent: [],
    p: [P("vigor|energia|estou cansado|to cansado")] },
  { id: "avaliar", ctx: ["livre"], peso: 5, ent: ["aliado"],
    p: [P("avaliar|avalio|avalia|ler a aura|leio a aura|ver o nivel|ver a ficha|qual (o )?nivel d[aeo]|quao forte e|olho avaliador|analiso|analisar")] },
  { id: "ocultar_aura", ctx: ["livre"], peso: 5, ent: [],
    p: [P("ocultar (minha )?aura|oculto (minha )?aura|esconder (minha )?aura|escondo (minha )?aura|disfarco (minha )?aura")] },
  { id: "ajuda", ctx: ["livre", "batalha", "menu", "dialogo", "criacao"], peso: 2, ent: [],
    p: [P("ajuda|socorro|como (se )?joga|nao sei jogar|help|tutorial|comandos")] },

  // ───────────── DIÁLOGO / RESPOSTAS ─────────────
  { id: "falar", ctx: ["livre", "dialogo"], peso: 2, ent: ["npc"],
    p: [P("falo|falar|pergunto|perguntar|converso|conversar|digo|dizer|chamo|grito para|cumprimento|peco")] },
  { id: "confirmar", ctx: ["menu", "criacao", "dialogo", "livre"], peso: 6, ent: [],
    p: [/^(sim|aceito|aceitar|confirmo|confirmar|fechado|beleza|pode ser|vamos|ok|okay|isso)$/] },
  { id: "negar", ctx: ["menu", "criacao", "dialogo", "livre"], peso: 6, ent: [],
    p: [/^(nao|recuso|recusar|cancelar|cancela|negativo|deixa|deixa para la)$/] },
];

// Comandos explícitos com "!" e seus apelidos (o primeiro é o nome canônico)
export const COMANDOS = {
  explorar: ["explorar", "e", "exp"], viajar: ["viajar", "ir", "v"], rota: ["rota"], mapa: ["mapa"],
  ficha: ["ficha", "f", "carta"], status: ["status", "st"], inventario: ["inventario", "inv", "mochila", "i"],
  equipar: ["equipar", "eq"], descansar: ["descansar", "dormir"], cidade: ["cidade"], loja: ["loja", "comprar", "vender"],
  forja: ["forja"], missoes: ["missoes", "missao"], party: ["party", "grupo"], trocar: ["trocar"], dar: ["dar"],
  acordo: ["acordo"], duelo: ["duelo", "x1"], aceitar: ["aceitar", "aceito"], recusar: ["recusar"],
  pet: ["pet"], pistas: ["pistas"], relogio: ["relogio"], nucleos: ["nucleos"], vigor: ["vigor"], ranking: ["ranking"],
  distribuir: ["distribuir", "pontos"], entrar: ["entrar"], sair_subfase: ["sair-subfase"], entrar_batalha: ["entrar-batalha"],
  aparencia: ["aparencia"], avatar: ["avatar"], amuleto: ["amuleto"], despertar: ["despertar"], continuar: ["continuar"],
  pacto: ["pacto"], trair: ["trair"], resistir: ["resistir"], revelar_sussurro: ["revelar-sussurro"],
  contrato_yoru: ["contrato-yoru"], ler_diario: ["ler-diario"], contar: ["contar"], julgamento: ["acusar", "julgamento"],
  rival: ["rival"], paz: ["paz"], disputa: ["disputa"], furtar: ["furtar", "roubar"], juramento: ["juramento", "faccao"],
  ignorar_jogador: ["ignorar"], emboscar: ["emboscar"], trajetoria: ["trajetoria"],
  avaliar: ["avaliar", "ler", "olhar"], ocultar_aura: ["ocultar"], luta_real: ["luta-real", "lutareal"], veredito: ["finalizar", "poupar", "rendicao"],
  tecnicas: ["tecnicas", "tecnica"], teleportar: ["teleportar", "portal", "tp"],
  ajuda: ["ajuda", "help", "comandos"],
};

export const ORDINAIS = { primeiro: 1, primeira: 1, segundo: 2, segunda: 2, dois: 2, terceiro: 3, terceira: 3, tres: 3, quarto: 4, quarta: 4, quatro: 4, quinto: 5, quinta: 5, cinco: 5 };

export const ITENS_COMUNS = ["pocao", "pocao de cura", "pocao de mana", "antidoto", "elixir", "ervas", "pergaminho de fuga", "bomba de fumaca", "racao", "agua benta", "cristal de mana"];
