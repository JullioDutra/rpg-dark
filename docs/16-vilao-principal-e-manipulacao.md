# 16 — O Vilão Principal e o Sistema de Manipulação

## 16.1 Kanata (彼方) — "Yoru, o Mestre da Guilda de Kyōkai"

| | |
|---|---|
| **Nome real** | Kanata, da linhagem de Sayo (descendente de 14ª geração) |
| **Identidade pública** | **Yoru (夜)**, Mestre da Guilda de Kyōkai — nunca visto de dia |
| **Idade** | 34 |
| **Aparência** | Alto, magro, cabelo branco preso, olhos que refletem a lua; manto preto com o brasão da Guilda; luvas que nunca tira (por baixo, as mãos têm marcas de queimadura iguais às que Tōya teve) |
| **Personalidade** | Educado, paciente, generoso, ouve mais do que fala. Nunca grita. Acredita sinceramente que é o herói da história |
| **Motivação** | "Libertar Kaien, um menino inocente que os reis usaram e enterraram vivo, e fazer os quatro reinos pagarem pela mentira" |
| **Poder** | **Eco da Devoração**: ao tocar alguém, copia uma habilidade dela por 24h (real). Pode **emprestar** essa habilidade a um servo. **Mil Contratos**: todo contrato assinado com a Guilda dá a ele um fio de controle sobre o contratante |
| **Ficha de combate** | V091 (fases 1 e 2) — ver doc 09 |

### O que ele quer de cada jogador

Kanata **não quer matar os jogadores** no começo. Quer **usá-los**. Jogadores fortes são as melhores ferramentas
para tirar núcleos de reis e encontrar o ovo. Só quando um jogador se torna obstáculo claro, ele manda os Arautos
— ou Zero.

### As 5 fases do plano

| Fase | Ato | O que Kanata faz | O que os jogadores percebem |
|:---:|:---:|------------------|----------------------------|
| 1. **Semente** | I | Oferece missões da Guilda bem pagas. Cada uma tem uma **função oculta** (ex.: "escoltar um mercador" = levar cristais negros para Iwakura) | Nada, a princípio. Pistas: as missões sempre levam a lugares onde algo ruim acontece depois |
| 2. **Arautos** | I–II | Liberta e recruta os Arautos do Eclipse e os Ressurgidos (doc 17) | Ataques nas aldeias, traições nas cortes |
| 3. **Sussurros** | II | Começa a falar **em particular** com os jogadores (chat privado do bot) | Ofertas tentadoras, segredos sobre outros jogadores |
| 4. **Revelação** | II–III | Com 2 núcleos ou ao ser descoberto, assume publicamente quem é. Declara a "verdade" sobre os reis ao mundo | O grupo pode rachar: quem acredita nele? |
| 5. **O Ovo** | III–IV | Anuncia que **um dos jogadores carrega o ovo** e oferece uma recompensa enorme a quem entregá-lo | Paranoia, duelos, alianças, mentiras |

---

## 16.2 Como o vilão manipula os jogadores

### Os Sussurros (中の声)

Kanata fala com cada jogador **no privado** (o bot envia mensagem direta ao número do jogador vinculado ao personagem).
Os sussurros são gerados pela IA com base no **perfil psicológico** que o motor monta de cada jogador:

| Perfil detectado (pelo histórico) | Isca usada por Kanata |
|-----------------------------------|----------------------|
| Busca poder (pergunta muito de atributos, escolhe sempre atacar) | "Posso te dar o que os deuses te negam." Oferece **Pactos de Poder** |
| Leal a um NPC / aldeia | Ameaça ou promessa sobre essa pessoa/aldeia |
| Competitivo com outro jogador | Segredos (verdadeiros ou falsos) sobre o rival; "ele vai ser o Seiō, não você" |
| Justiceiro | A verdade sobre os reis — "você está protegendo assassinos" |
| Curioso / investigador | Pistas reais sobre o ovo, em troca de "pequenos favores" |
| Isolado (joga pouco com o grupo) | Amizade. Kanata é o único que "entende" |

**Regras dos sussurros:**
- No máximo **1 sussurro por jogador a cada 2 dias reais** (para não virar spam).
- O jogador pode **responder** (conversa com a IA no papel de Kanata), **ignorar** ou **denunciar ao grupo**
  (`!revelar-sussurro` mostra o texto ao grupo — Kanata perde influência sobre ele: Corrupção −5).
- Kanata **nunca mente no texto de um contrato** (ver 16.4), mas mente livremente em conversa.

### Pactos de Poder (契約)

Ofertas formais que o jogador aceita com `!pacto aceitar` no privado. Exemplos:

| Pacto | O que o jogador ganha | O que Kanata pede | Corrupção |
|-------|----------------------|-------------------|:---:|
| **Fogo Emprestado** | +30% MAG por 3 dias reais | "Diga-me onde seu grupo vai amanhã" | +10 |
| **Olho de Yoru** | Ver os atributos de qualquer vilão por 7 dias | Entregar 1 grimório à Guilda | +10 |
| **Vida por Vida** | Salvar um NPC que iria morrer | Deixar outro NPC escolhido por ele morrer | +15 |
| **A Lâmina na Sombra** | Uma habilidade copiada de outro jogador por 24h | Não ajudar esse jogador na próxima batalha | +15 |
| **O Segredo do Ovo** | Uma pista real sobre quem é o portador | Contar a Kanata quem você suspeita que é | +20 |
| **Traição** | Um item raro ou Amuleto da Perdição | Atacar um aliado num momento escolhido por Kanata (o motor pergunta no privado durante a batalha: `!trair` ou `!resistir`) | +30 |

O ganho é **real e mecânico** (registrado com `fonte = "pacto"`, temporário) — por isso é tentador.

### Corrupção (蝕度, 0–100)

| Faixa | Estado | Efeitos |
|:---:|--------|---------|
| 0–24 | **Limpo** | — |
| 25–49 | **Marcado** | Kanata sabe sempre em que região você está. O Ovo não te escolhe/rejeita você. NPCs sensíveis (Paladinos, Kirin) percebem |
| 50–74 | **Servo** | Recebe **ordens** em vez de ofertas. Recusar uma ordem custa 10% do HP máx até o próximo descanso. +10% em todos os atributos (a corrupção dá poder). O Ovo escurece se você for o portador |
| 75–99 | **Eclipsado** | Em batalhas de história, o motor pode te pedir em privado para trair. +20% atributos. Aparência muda na carta (olhos de eclipse). A Excalibur não te aceita |
| 100 | **Arauto Jogador** | Você **passa para o lado do Eclipse** como Arauto. Continua jogando, com objetivos próprios enviados em privado (vencer pelo Final do Eclipse). Outros jogadores podem te derrotar ou **redimir** |

**Como reduzir a Corrupção (só por mérito):**
- Revelar um sussurro ao grupo: −5
- Recusar uma ordem de Kanata (como Servo): −5 (e paga o custo de HP)
- Purificação por um Paladino (magia específica, 1×/dia): −10
- Missão de redenção (gerada pela IA, cumprir um ato de sacrifício real): −25
- Ler o **Diário de Sayo** inteiro: −15 (1× no jogo)
- Ser derrotado por um aliado em duelo e poupado (Arauto Jogador): volta para 60

**Visibilidade:** a Corrupção é **secreta**. Aparece só no `!ficha` enviado em privado. No grupo, só sinais
indiretos (a carta pública não mostra o valor, mas a moldura escurece a partir de 50).

---

## 16.3 Como o vilão joga os jogadores uns contra os outros

| Tática | Como funciona | Contra-jogada dos jogadores |
|--------|---------------|-----------------------------|
| **Rumor** | Kanata espalha no grupo (como NPC "arauto da Guilda") boatos: *"dizem que X aceitou ouro da Guilda"* — às vezes verdade, às vezes mentira | Investigar, confrontar, usar *Ler o Inimigo* / Yatagarasu / Hakutaku em NPCs informantes |
| **A Recompensa do Ovo** | No Ato III, a Guilda oferece um **Amuleto da Perdição + 50.000 ryō** a quem entregar "a pedra morna" | O portador pode mentir, esconder, ou usar a ganância como isca |
| **O Seiō é um só** | Lembra a cada jogador que só um será Rei-Estrela, e que o outro está "à frente" | Pactos entre jogadores (`!acordo`) — quebrá-los custa Mérito |
| **Empréstimo de habilidade** | Copia a habilidade de um jogador e a usa num crime — testemunhas acusam o jogador errado | Álibis, investigação, a habilidade copiada dura só 24h |
| **O Contrato Esquecido** | Missões da Guilda criam fios de controle: num momento dramático, Kanata **puxa o fio** e o jogador perde o turno | Quebrar os contratos (custa ouro e Mérito na Guilda) ou cumprir de um jeito que o prejudique (16.4) |
| **Duas verdades** | Mostra aos jogadores a culpa real dos reis (Camada 3) e pergunta: "vocês vão morrer por eles?" | A Camada 6 (abrir o Esquife destrói o mundo) é a resposta — precisa ser descoberta |

**Limites de justiça (regras do motor):**
- Nenhum jogador perde personagem, itens lendários ou o ovo **apenas por manipulação**: sempre há uma escolha do jogador.
- Toda traição exige **comando explícito** do jogador traidor (`!trair`). A IA nunca decide por ele.
- Ações de traição são registradas e **reveladas no epílogo** a todos.

---

## 16.4 Como os jogadores podem manipular o vilão

Kanata é perigoso, mas **tem fraquezas exploráveis**. Estratégia e criatividade valem mais aqui do que força.

1. **O Juramento do Contratante.** Por causa dos Mil Contratos, Kanata **nunca pode quebrar o texto literal** de um
   contrato que assinou. Um jogador esperto pode propor um contrato (`!contrato-yoru <texto>`) cheio de brechas. A IA,
   no papel de Kanata, tenta detectar as armadilhas — mas o motor obriga Kanata a cumprir o que estiver escrito.
   Ex.: *"Entrego a pedra morna que está no meu inventário em troca da libertação dos reféns."* (O jogador comprou uma
   pedra morna comum no mercado de Kyōkai antes.)
2. **Sayo.** O Diário de Sayo é a arma emocional. Ler trechos para Kanata em momentos certos causa **Dúvida** (contador
   0–5). Com 5 de Dúvida antes do Ato IV, Kanata **pode ser redimido** e virar aliado na batalha final (morre se
   sacrificando contra o Eclipse — Final Estelar ainda melhor no epílogo).
3. **O orgulho.** Kanata não recusa um **debate público** na Guilda. Vencê-lo (argumentação julgada pela IA + teste de SOR)
   faz NPCs da Guilda desertarem — enfraquece a rede de espiões dele (sussurros chegam a cada 4 dias em vez de 2).
4. **Iscas.** Kanata quer o ovo acima de tudo. Mentir sobre quem é o portador (inclusive fazendo o verdadeiro portador
   parecer o menos provável) pode atrair Kanata ou um Arauto para uma emboscada.
5. **Agentes duplos.** Um jogador pode **fingir** aceitar pactos e passar informações falsas. O motor permite: a
   Corrupção sobe mesmo assim (o pacto é real), mas a informação pode ser falsa. Risco calculado.
6. **As mãos queimadas.** Quem descobrir que as mãos de Kanata têm as mesmas queimaduras de Tōya pode deduzir que **o ovo
   já o rejeitou** — e usar isso para quebrar a confiança dele em si mesmo (+2 Dúvida).

---

## 16.5 Combate contra Kanata (V091)

- **Fase 1 — Yoru:** usa as habilidades copiadas dos jogadores presentes (copia 1 por turno). Quanto mais variado o grupo,
  mais armas ele tem — grupos inteligentes **escondem** habilidades até a fase 2.
- **Fase 2 — Kanata Revelado:** tira as luvas. Ativa *Mil Contratos*: cada jogador que fez missão da Guilda sofre −20%.
  Quem nunca aceitou missão da Guilda é imune — recompensa por desconfiar desde o começo.
- **Fase 3 (só se Dúvida ≥ 3):** Kanata hesita. Uma ação narrativa certa (mostrar o diário, a memória do poço) encerra
  a luta sem morte.
