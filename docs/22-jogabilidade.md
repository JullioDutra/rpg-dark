# 22 — Jogabilidade Completa no WhatsApp

> Como o jogo **flui** num chat: cada modo, cada comando, cada situação. Os números de equilíbrio estão no
> [doc 22b](22b-balanceamento.md) (gerado pelo simulador). Este documento prevalece sobre regras antigas dos docs 08 e 13.

---

## 22.0 Os 7 pilares de fluidez (por que o jogo é desenhado assim)

| # | Pilar | Na prática |
|:---:|-------|-----------|
| 1 | **Ninguém espera ninguém** | Combate em **rodada simultânea** (todos agem ao mesmo tempo, com prazo). Exploração e lutas comuns são **individuais e no privado** |
| 2 | **O grupo é o palco, o privado é a mochila** | No grupo: história, chefes, crises, anúncios. No privado: ficha, inventário, lutas solo, segredos |
| 3 | **Uma mensagem viva em vez de vinte** | O bot **edita** a mesma mensagem de painel durante a batalha em vez de mandar uma nova a cada ação |
| 4 | **Digitar pouco** | Códigos curtos (`a`, `m2`, `d`), menus numerados, **enquetes nativas** do WhatsApp para votos, **reações** como atalho |
| 5 | **Texto livre sempre funciona** | Qualquer frase começando com `>` vira ação narrativa; o Juiz de Táticas premia criatividade (doc 19.5) |
| 6 | **Imagem só no momento certo** | Carta/mapa/avatar só ao pedir ou em momentos-chave (início de chefe, vitória, level up, item lendário) |
| 7 | **O mundo anda mesmo sem você** | Crises com prazo real, Relógio do Eclipse, chefes de mundo assíncronos. Mas ninguém perde por ficar 1 dia fora |

---

## 22.1 Onde cada coisa acontece

| Atividade | 👥 Grupo | 🔒 Privado | Por quê |
|-----------|:---:|:---:|---------|
| Entrar no mundo (comando) | ✔ | | Todos veem o recém-chegado |
| Sorteio, nome e criador de avatar | | ✔ | Várias mensagens; não poluir o grupo. No fim, a carta é publicada no grupo |
| Narrativa de história (marcos de mundo) | ✔ | | Experiência coletiva |
| Exploração, viagem, encontros comuns | | ✔ | Individual, no ritmo de cada um |
| Combate solo | | ✔ | Sem spam no grupo |
| Combate de party (2–5) | ✔ *(ou um grupo de party)* | | A party joga junta; o grupo vê o resumo final |
| Chefe de subfase / chefe de arco | ✔ | | Evento coletivo, todos podem assistir |
| Chefe de Mundo (assíncrono) | ✔ painel | ✔ ataques | Painel no grupo; cada um ataca do privado quando puder |
| Crises de tempo real | ✔ | ✔ ações | Anúncio e contagem no grupo |
| Ficha completa, inventário, Corrupção, pactos, Ovo | | ✔ | Segredos |
| Loja, forja, treino, distribuir pontos | | ✔ | Menus longos |
| Trocas, duelos, acordos | ✔ | | Precisa de testemunhas |
| Votações de mundo (decisões do grupo) | ✔ enquete | | Enquete nativa do WhatsApp |

**Grupo de party (opcional):** quando uma party se forma, o bot pode criar um grupo pequeno "⚔️ Party de Kaito"
com os membros (se o número do bot tiver permissão). Assim batalhas longas não enchem o grupo principal.

---

## 22.2 Técnicas de interface no WhatsApp (via Baileys)

| Técnica | Uso |
|---------|-----|
| **Editar mensagem** | Painel de batalha, contagem de crise, progresso de subfase — uma mensagem atualizada |
| **Enquete nativa** (até 12 opções) | Votos da party (qual porta abrir), decisões de mundo, escolha de classe no sorteio |
| **Reações** | 👍 = confirmar · ❌ = cancelar · 🔁 = repetir a última ação de batalha · ❤️ no painel = "estou pronto" |
| **Responder (citar)** | Responder ao painel de batalha com `a 2` age naquela batalha (útil se houver mais de uma) |
| **Menções** | O bot marca só quem precisa agir ("@Kaito, falta você — 40s") |
| **Menus numerados** | Toda lista termina com números; o jogador responde só o número |
| **Imagem com legenda** | Carta + texto curto numa única mensagem |
| **Mensagem fixada** (admin) | O bot pede para fixar o "Quadro do Mundo" (relógio, núcleos, crise ativa) |

**Limites anti-spam do bot:** no máximo 1 mensagem nova a cada 3 s por chat (o resto é edição ou fila); no grupo,
no máximo 20 mensagens novas por 10 min fora de batalha de chefe; mensagens longas têm no máximo ~900 caracteres.

**Horário silencioso:** 00h–08h (horário de Brasília): nenhuma crise começa, ninguém é marcado. Ações dos jogadores funcionam normalmente.

**Fora do personagem:** mensagens entre `(( ))` ou que não começam com `!`, `>` ou um código de batalha **são ignoradas
pelo bot**. O grupo pode conversar à vontade.

---

## 22.3 Criação de personagem (fluxo completo, ~3 minutos)

```
👥 GRUPO     Jogador: entrar no mundo
👥 GRUPO     Bot: "🌌 As estrelas te chamam, @Kaito. Continue comigo no privado ➜"
🔒 PRIVADO   1. NOME          → o jogador digita o nome do personagem
🔒 PRIVADO   2. SORTEIO       → 4 estrelas reveladas com suspense (aldeia/casta, mana, espírito, caminho)
🔒 PRIVADO   3. CLASSE        → enquete com as classes permitidas pela casta
🔒 PRIVADO   4. APARÊNCIA     → criador de avatar (doc 21.3), prévia em pixel art, refaz até confirmar
🔒 PRIVADO   5. CONFIRMAÇÃO   → resumo + "👍 para nascer em Yotsuhoshi"
👥 GRUPO     Bot publica a CARTA do novo personagem + 2 linhas de apresentação
🔒 PRIVADO   6. PRÓLOGO       → cena de abertura da aldeia (A1-M1) + mini-tutorial de 3 passos
```

Se o jogador nunca falou com o bot no privado, o WhatsApp pode filtrar a mensagem: o bot pede no grupo
"mande **oi** para mim no privado para começar". Cada etapa espera **15 min**; depois, o rascunho fica salvo e
`!continuar` retoma de onde parou.

### Escolha do nome

O jogador **escolhe livremente o nome do personagem**:

| Regra | Detalhe |
|-------|---------|
| Tamanho | 2 a 18 caracteres |
| Caracteres | Letras (com acentos e macron: ā ō ū), espaço, hífen e apóstrofo. Sem números e sem emojis |
| Formato | Primeira letra maiúscula automática ("kaito ren" → "Kaito Ren") |
| Único no mundo | Não pode repetir o nome de outro jogador do mesmo grupo (ignora maiúsculas e acentos) |
| Proibidos | Nomes de NPCs e vilões importantes (Kanata, Yoru, Kaien, Sayo, Nisteroy, Ryūen, Kaishin, Gōtetsu, Sorahiko…), "Admin", "Bot", "Narrador", nomes ofensivos (filtro + revisão da IA) |
| Sobrenome/clã | Opcional: "Kaito **do clã Haibara**" — o bot sugere o nome da aldeia como sobrenome |
| Título | Não se escolhe: é **conquistado** (ex.: "Matador de Dragões") e aparece acima do nome na carta |
| Trocar depois | Só com o item raro **Pergaminho do Novo Nome** (drop de chefe ou missão), 1× no jogo, ou pelo admin |

Se o nome for recusado, o bot explica o motivo e sugere 3 alternativas inspiradas na aldeia sorteada.

### Mini-tutorial (no prólogo)
1. "Digite `!explorar` para olhar ao redor." → acontece um encontro fácil e garantido.
2. Batalha guiada: o bot explica `a`, `m1` e `d` em 1 linha cada.
3. "Digite `!ficha` para ver sua carta." → fim do tutorial, +1 Poção.

---

## 22.4 Vigor e ritmo diário

**Vigor (気力)** é a energia de ação fora de combate: 0–100, regenera **+10 por hora real** (cheio em 10 h).

| Ação | Vigor |
|------|:---:|
| `!explorar` | 10 |
| `!viajar` (região adjacente) | 15 |
| Entrar numa subfase | 25 |
| Treino na capital | 20 |
| Combate (qualquer) | 0 — lutar nunca gasta vigor |
| Conversar com NPC, loja, forja, inventário, história | 0 |
| Descansar numa estalagem (6 h reais) | Recupera HP/MP total e +30 Vigor |

**Por que existe:** impede que quem joga 10 horas por dia deixe os outros para trás, e cria um ritmo natural de
"sessões" curtas. O modelo de ritmo do doc 22b considera ~8 lutas + meia subfase por dia.
**Bônus de retorno:** quem ficar 3+ dias fora volta com **XP descansado** (+50% de XP até recuperar 1 dia de ritmo).

---

## 22.5 Modo Exploração (`!explorar`)

Explorar a região atual sorteia um resultado, influenciado pelo **perigo** da região, pela **SOR** e pelo Relógio do Eclipse:

| Resultado | Chance base | O que acontece |
|-----------|:---:|----------------|
| ⚔️ Encontro | 40% | Combate com vilão da região (escalado, 22.7). Em perigo alto, 15% de chance de **emboscada** |
| 🧭 Descoberta | 15% | Subfase, atalho, NPC escondido ou segredo da região (doc 02) |
| 💎 Achado | 15% | Material, ryō, consumível; raramente grimório de rank E/D |
| 🎭 Evento | 15% | Cena narrativa curta com uma escolha (ajudar um viajante, seguir rastros…) |
| 🐾 Fauna | 10% | Animal do bestiário (doc 18): avisos de perigo, domar, caçar |
| 🌫️ Nada | 5% | Uma frase de ambientação — e +5 de Vigor de volta |

**Telegrafia:** se o próximo encontro for perigoso (vilão 5+ níveis acima), a cena avisa antes: "*O corvo de Enma pousa
no seu ombro…*". O jogador pode responder `recuar` (não luta, gasta o Vigor).

Ação livre também explora: `> procuro rastros perto do rio` → a IA cria a cena e o motor decide a categoria.

---

## 22.6 Modo Viagem (`!viajar <região>`)

- Só para regiões **adjacentes** (estradas do mapa). Destinos distantes: `!rota <região>` mostra o caminho e o custo.
- Viajar leva **10 min reais**; durante o trajeto, 30% de chance de um evento de estrada (encontro, mercador, clima).
- **Montarias** (doc 18) reduzem o tempo pela metade; o **Grifo-Real** ignora fronteiras; a **Joia dos Portões** teleporta.
- **Party viaja junta** se o líder usar `!viajar` e os membros reagirem 👍 em até 2 min (quem não reage fica).
- Ao chegar numa região nova pela primeira vez: cena de chegada (IA) + o **mapa do reino** com a região destacada.

---

## 22.7 Encontros e escalonamento

- Os vilões comuns e médios de uma região **escalam** para o nível médio da party (mínimo = nível base do vilão).
  Assim, o mundo inteiro continua relevante e não existe "farm" de monstros fracos.
- Chefes de subfase, de arco e lendários **não escalam**: têm nível fixo. Entrar abaixo do nível é permitido e mortal.
- Composição: solo = 1–2 inimigos; party = 1 + (membros − 1) inimigos; emboscada = +1 inimigo.

---

## 22.8 Modo Combate

### Tipos de combate

| Tipo | Onde | Participantes | Prazo por rodada | Observação |
|------|------|---------------|:---:|-----------|
| **Encontro solo** | Privado | 1 | sem prazo (até 24 h) | Joga no seu ritmo |
| **Encontro de party** | Grupo/party | 2–5 | 90 s | Rodada simultânea |
| **Emboscada** | Onde estiver | — | igual | Inimigos agem primeiro na 1ª rodada |
| **Chefe** (subfase/arco) | Grupo | 1–5 | 120 s | Fases, Postura, telegrafias |
| **Batalha Mortal** | Grupo | 1–5 | 120 s | ⚠️ aviso antes; Marcas da Morte (doc 19) |
| **Chefe de Mundo** | Painel no grupo, ataques no privado | Todos | assíncrono (24–72 h) | HP compartilhado pelo mundo inteiro |
| **Duelo (PvP)** | Grupo | 2 | 60 s | Só com `!duelo` aceito |
| **Horda / defesa** | Grupo | Todos presentes | 90 s | Ondas; usado nas crises (ex.: Festival) |

### A Rodada Simultânea (o coração do combate)

```
1. ABERTURA   O bot posta o PAINEL (uma mensagem que será editada). Imagem do chefe só na 1ª rodada.
2. DECLARAÇÃO Cada jogador manda o código da ação. O bot reage ✅ à mensagem (ação recebida, ainda dá para trocar).
              Quando todos declararam → resolve na hora. Se o prazo acabar → quem não agiu faz "defender".
3. RESOLUÇÃO  Ordem de iniciativa (VEL + d20). Inimigos agem conforme as táticas (doc 19.4).
4. NARRAÇÃO   O painel é editado com o resultado + 1 a 3 linhas de narração da IA (curtas, de impacto).
5. Repete até vitória, derrota ou fuga.
```

**Exemplo de painel (editado a cada rodada):**

```
⚔️ RODADA 3 — Ponte do Dragão Adormecido
━━━━━━━━━━━━━━━━━━━━━━
🐉 Yōgan-ryū  ▰▰▰▰▰▰▱▱▱▱ 61%   🛡️ Postura ▰▰▰▱▱
   ⚠️ Inspira fundo... (Sopro de Magma na próxima rodada!)
━━━━━━━━━━━━━━━━━━━━━━
🟥 FRENTE
 Kaito ⚔️   ▰▰▰▰▰▰▰▱▱▱ 412/520  MP 61  ✅
 Rin 🛡️     ▰▰▰▰▰▰▰▰▰▱ 690/720  MP 30  ⏳
🟦 RETAGUARDA
 Aya 🔮     ▰▰▰▰▱▱▱▱▱▱ 180/410  MP 140 ✅  🔥queimando(2)
 Tōma ✝️    ▰▰▰▰▰▰▰▰▱▱ 350/430  MP 88  ⏳
━━━━━━━━━━━━━━━━━━━━━━
Rodada anterior: Rin provocou o dragão; Aya + Kaito fizeram
🌀 VAPOR (Água + Fogo) — o dragão está CEGO por 1 rodada!
⏱️ 74 s · faltam @Rin @Tōma
```

### Códigos de ação (digitar o mínimo)

| Código | Ação | Exemplo |
|--------|------|---------|
| `a [alvo]` | Ataque básico | `a`, `a 2` (inimigo 2) |
| `m<n> [alvo]` | Magia nº n do grimório equipado | `m1`, `m3 1` |
| `h<n> [alvo]` | Habilidade de classe nº n | `h1` |
| `d` | Defender (−50% dano; +1 Postura de volta) | `d` |
| `i <item> [alvo]` | Usar item (máx. 2 por batalha no modo difícil) | `i pocao`, `i pocao Aya` |
| `p` | Proteger aliado (fica na frente dele) | `p Aya` |
| `t` | Trocar de fileira (frente ↔ retaguarda) | `t` |
| `pet` | Ordem especial ao pet espiritual (1× por batalha) | `pet` |
| `f` | Tentar fugir (não funciona em chefes) | `f` |
| `> texto` | Ação livre (Juiz de Táticas) | `> chuto a brasa na cara dele e rolo para trás` |
| `?` | Mostra suas opções com números | `?` |

**Alvos aliados por nome ou número**; sem alvo, o motor escolhe o mais lógico (ataque: inimigo com menos HP;
cura: aliado com menos HP).

### Fileiras: Frente e Retaguarda
- **Frente** recebe 70% dos ataques corpo a corpo inimigos; **Retaguarda** só é atingida por ataques à distância,
  em área ou por assassinos.
- Ataques corpo a corpo **da retaguarda** causam −30% (exceto lanças e magias).
- Se toda a frente cair, a retaguarda vira frente automaticamente.
- Padrão por classe: Cavaleiro, Paladino, Espadachim, Meio-humano, Anti-magia e Demônio na frente; Mago, Bruxo e Força da Natureza atrás.

### Postura (quebra) — a mecânica de estratégia dos chefes
- Todo inimigo médio ou acima tem uma barra de **Postura**.
- A Postura cai com: golpes na **fraqueza elemental** (−2), **combos** (−2), críticos (−1), ação livre com nota ≥ 7 (−2), anti-magia anulando magia (−2).
- **Postura zerada → QUEBRA**: o inimigo perde a próxima ação e recebe **+50% de dano** naquela rodada. A barra volta cheia depois.
- Chefes regeneram 1 de Postura por rodada sem receber golpe na fraqueza. **Força bruta sem estratégia não vence chefes de nível rei.**

### Reações elementais (combos entre jogadores na mesma rodada)

Quando dois jogadores acertam o mesmo alvo com elementos diferentes **na mesma rodada**, nasce uma reação:

| Combinação | Reação | Efeito |
|------------|--------|--------|
| Fogo + Água | 🌀 **Vapor** | Cega o alvo 1 rodada |
| Fogo + Vento | 🔥 **Tempestade de Fogo** | +40% de dano em área |
| Água + Raio | ⚡ **Eletrocutar** | Paralisa 1 rodada (chefes: −3 Postura) |
| Água + Terra | 🟫 **Lamaçal** | −50% VEL por 2 rodadas |
| Terra + Fogo | 🌋 **Magma** | Queimadura forte (3 rodadas) |
| Vento + Terra | 🌪️ **Tempestade de Areia** | −30% precisão inimiga por 2 rodadas |
| Gelo + Fogo | 💨 **Choque Térmico** | Ignora 50% da DEF no golpe |
| Luz + Trevas | ☯️ **Eclipse Menor** | Dano verdadeiro (ignora resistências) |
| Qualquer + Vazio | ⛓️ **Anulação** | Remove todos os buffs do alvo |
| Físico + Físico (2 golpes "a" no mesmo alvo) | 🤝 **Golpe Duplo** | +25% de dano e −1 Postura |

O painel sempre anuncia a reação: é a recompensa visível de jogar em equipe.

### Estados (duração em rodadas)

| Estado | Efeito |
|--------|--------|
| 🔥 Queimando | −5% HP por rodada; impede cura (Lâmina Rubra) |
| 🧊 Congelado | Perde a ação; o próximo golpe físico causa ×1,5 e quebra o gelo |
| ⚡ Paralisado | 50% de chance de perder a ação |
| 🕸️ Preso | Não pode trocar de fileira nem fugir; esquiva 0 |
| ☠️ Veneno | −4% HP e −5 MP por rodada |
| 🌑 Cego | 50% de errar |
| 🔇 Silêncio | Sem magias (habilidades físicas ok) |
| 😨 Medo | −20% FOR e MAG |
| 🗿 Petrificado | Perde ações até ser curado; recebe −50% de dano |
| 🛡️ Escudo | Absorve X de dano |
| ✨ Inspirado | +20% em tudo (Despertar, pets, itens raros) |

### Inimigos que pensam (resumo; detalhes no doc 19.4)
- Telegrafam golpes fortes 1 rodada antes (⚠️ no painel). **Defender ou proteger no turno certo anula o golpe.**
- Chefes mudam de fase em 66% e 33% de HP (o painel anuncia a fase com uma imagem nova).
- Se o mesmo truque for usado 2×, o chefe se adapta (−50% de efeito na 3ª vez).

### Ausentes, atrasados e quedas de conexão
- Não agiu no prazo → **defende** automaticamente. 3 rodadas seguidas sem agir → entra em **Piloto Automático**
  (ataque básico no alvo mais fraco, sem itens e sem habilidades caras) e é marcado como ausente; volta ao mandar qualquer ação.
- Chegou atrasado? Um membro da party pode **entrar no meio** de uma batalha no início de qualquer rodada (`!entrar-batalha`), na retaguarda.
- O bot reiniciou? Todo estado de batalha é salvo a cada rodada; ao voltar, o painel é repostado com "⏸️ Retomando…" e o prazo reinicia.

### Fim de combate
- **Vitória:** XP **cheio para cada participante** (não é dividido — incentiva a party), ryō dividido, **loot individual**
  (cada jogador rola o seu, sem brigas). Itens únicos de chefe: enquete de "quem precisa" → sorteio entre os votos.
- **Derrota:** consequência pelo tipo de inimigo (doc 19.3).
- **Fuga:** sem XP; inimigos comuns podem perseguir (30%).
- Mensagem final no grupo: 2–3 linhas + imagem só se houve **level up**, **item raro** ou **chefe vencido**.

### Chefe de Mundo (assíncrono — perfeito para chat)
- Usado em crises grandes (ex.: Daidarabotchi marchando, Leviatã, Raijin desperto).
- O chefe tem **HP compartilhado pelo mundo** e um prazo (24–72 h). O painel no grupo mostra a barra global e o ranking de dano.
- Cada jogador luta **no privado** contra uma "manifestação" do chefe, em lutas curtas (5 rodadas). O dano causado desconta da barra global.
- Cada jogador tem 3 tentativas por dia (sem Vigor). Combos de party contam em dobro.
- Se a barra zerar no prazo: vitória do mundo, recompensa para todos que participaram. Se não: a crise falha (Relógio do Eclipse ↑).

### Duelos (PvP)
- `!duelo @x [aposta]` → `!aceitar`. Rodada simultânea de 60 s, sem itens, sem pets, sem Ovo.
- Termina em 1 HP (ninguém morre em duelo), exceto o **Duelo de Sangue** de história (doc 15.1), que é Mortal.
- Para luta de verdade entre jogadores, existe a **luta real** (`!luta-real @x`, consentida), que termina no **Veredito**: o vencedor escolhe finalizar, deixar ir ou exigir rendição (doc 29.4).
- Vitória dá Mérito só se for contra alguém de nível igual ou maior (anti-abuso).

---

## 22.9 Subida de atributos (o sistema completo)

**Princípio:** todo ponto de atributo tem **origem registrada** (`eventos_atributo`). Nada sobe porque o jogador pediu.

### As 8 fontes de crescimento

| # | Fonte | Quanto | Quando |
|:---:|-------|--------|--------|
| 1 | **Subir de nível** | Crescimento da classe (`data/classes.json → cresc`), +HP e +MP | Automático |
| 2 | **Pontos livres** | +3 pontos para distribuir | A cada 10 níveis (`!distribuir`) |
| 3 | **Maestria (uso)** | +1 no atributo mais usado | Ver tabela abaixo |
| 4 | **Treino** | +1 por etapa de subfase de treino (ex.: Mil Degraus) | 1× por jogador por subfase |
| 5 | **Feitos** | +1 permanente em um atributo ligado ao feito | Conquistas únicas (tabela) |
| 6 | **Vitória superior** | +2% MP máx e +1 no atributo principal | Vencer vilão de tier acima do seu nível |
| 7 | **Despertar** | Habilidade nova + aura | 1× por rank, por marco de história |
| 8 | **Equipamento, pet, bênçãos** | Bônus enquanto equipado/ativo | Itens, pet espiritual, núcleos confiados |

### Maestria — o atributo cresce com o uso
O motor conta o que cada jogador faz em batalhas **contra inimigos de nível ≥ (seu nível − 5)** (anti-farm):

| Contador | Sobe | A cada |
|----------|------|:---:|
| Golpes físicos acertados | FOR | 60 |
| Magias conjuradas | MAG | 50 |
| Dano físico recebido sem cair | DEF | 3.000 × nível/10 |
| Magias recebidas / anuladas | RES | 40 |
| Agir primeiro na rodada ou esquivar | VEL | 40 |
| Críticos | SOR | 25 |

**Teto de Maestria por rank:** E–D: +5 · C: +10 · B: +15 · A: +20 · S–SS: +25 (soma de todos os atributos).
Cada estilo de jogo molda o personagem: dois Espadachins nível 50 nunca são iguais.

### Feitos (+1 permanente, uma vez cada)

| Feito | Atributo |
|-------|----------|
| Vencer um chefe sem ninguém da party cair | DEF |
| Quebrar a Postura de um chefe de nível rei | FOR ou MAG |
| Fazer 10 reações elementais diferentes | MAG |
| Vencer um duelo contra alguém 10+ níveis acima | VEL |
| Completar uma crise de tempo real como MVP | SOR |
| Resolver um marco por diálogo, sem lutar | SOR |
| Sobreviver a uma Batalha Mortal com 1 HP | DEF |
| Recusar 3 pactos de Kanata | RES |

### Pontos livres (`!distribuir`)
```
🔒 Você tem 3 pontos livres.
FOR 82 · DEF 31 · MAG 28 · RES 29 · VEL 76 · SOR 30
Responda, por exemplo: "for 2 vel 1"   (👍 para confirmar)
```
Irreversível após confirmar. O motor bloqueia mais de 3 pontos no mesmo atributo por vez.

### Mensagem de level up (no privado; no grupo só a 1ª linha)
```
⬆️ NÍVEL 25! (Kaito)
FOR +3 · DEF +1 · MAG +1 · RES +1 · VEL +3 · SOR +1 · HP +16 · MP +3
🗡️ Nova técnica desbloqueada no grimório: "Postura do Sol"
```

---

## 22.10 Modo Subfase (masmorras)

- Cada subfase é um **pequeno grafo de 4–8 salas** gerado a partir de `data/subfases.json` (tipo + mecânica única).
- Entrar custa 25 de Vigor (o líder paga; os outros da party pagam metade).
- A cada sala, o bot descreve a cena (IA) e oferece **2–4 caminhos** — em party, **enquete nativa** com 60 s; empate = o líder decide.
- Tipos de sala: ⚔️ combate · 🪤 armadilha (teste de atributo ou ação livre) · 🧩 enigma (texto livre julgado pela IA) ·
  💎 tesouro · ⛩️ altar (descanso: +30% HP/MP, 1× por subfase) · 👹 chefe.
- O progresso fica salvo por **24 h reais**: dá para sair (`!sair-subfase`) e voltar da última sala.
- Recompensa garantida na primeira vitória de cada jogador: o grimório da subfase (doc 07).
- Subfases **lendárias**: só uma party por vez; o item lendário vai para quem der o golpe final **ou** para quem a party votar (enquete antes do chefe).

---

## 22.11 Modo Cidade (capitais e Kyōkai)

`!cidade` abre o menu da capital onde o jogador está:

| Local | O que faz |
|-------|-----------|
| 🏨 Estalagem | Descanso (6 h reais): HP/MP cheios, +30 Vigor, cura Feridas leves |
| 🛒 Loja | Poções, antídotos, pergaminhos de fuga, comida de viagem (preços por reino) |
| ⚒️ Forja | Cria/melhora armas e armaduras com materiais de vilões da região (receitas por reino) |
| 🥋 Dōjō | Treino: −20 Vigor, +XP de Maestria no atributo escolhido (×2 de contador por 1 h) |
| 📜 Quadro de missões | Missões do reino (sem a "função oculta" da Guilda) e missões da Guilda de Kyōkai (pagam mais...) |
| ⛩️ Templo | Purificação (−10 Corrupção, 1×/dia, custa ryō), remove maldições |
| 🍶 Taverna | Rumores (pistas de história geradas pela IA a partir dos fatos disponíveis), recrutar party |

---

## 22.12 Modo Diálogo e Investigação

- Falar com NPCs é sempre **ação livre**: `> pergunto ao barqueiro se ele viu alguém de manto preto`.
- A IA responde no papel do NPC (personalidade da ficha); informações importantes só saem com **teste**:
  persuadir (SOR), intimidar (FOR), enganar (SOR, com Corrupção +1 se for mentira grave), perceber (VEL), saber (MAG).
- O **Juiz de Táticas** (doc 19.5) ajusta a dificuldade: um bom argumento vale mais do que um dado alto.
- **Diário de pistas** (`!pistas`, privado): o bot registra automaticamente pistas encontradas; pistas de um jogador
  podem ser compartilhadas com `!pistas compartilhar @x`.

---

## 22.13 Modo História (cenas coletivas e decisões do grupo)

- Marcos de **escopo mundo** acontecem no grupo: a IA narra em 2–4 mensagens espaçadas (efeito de cena).
- **Decisões de mundo** (ex.: revelar a culpa dos reis ao povo — A2-WAT-2): **enquete nativa** com prazo (12–24 h);
  quórum mínimo de 50% dos jogadores ativos; empate → a IA decide pelo lado com maior Mérito somado.
- **Cenas pessoais** (escopo jogador) acontecem no privado e podem ser "publicadas" pelo jogador (`!contar`).
- O **Quadro do Mundo** (mensagem fixada, editada pelo bot) mostra: Ato/marco atual (sem spoiler), Relógio do Eclipse,
  estado dos 4 núcleos, crise ativa, próximo evento semanal.

---

## 22.14 Crises de tempo real

```
🚨 CRISE — A Queda de Amagumo (12 h)
As correntes cederam! A cidade flutuante está caindo.
Ações de salvamento valem pontos (meta: 10). Use:
 • !salvar correntes  (FOR/DEF)   • !salvar cidadãos (VEL)
 • !salvar magia      (MAG)       • > ação livre (Juiz de Táticas)
Progresso ▰▰▰▱▱▱▱▱▱▱ 3/10   ⏳ 09:42 restantes
```
- Cada jogador pode contribuir a cada 30 min. Ações criativas valem até 3 pontos.
- O painel é editado; a cada 3 h, uma narração mostra a consequência (um distrito cai, um NPC é salvo…).
- Crises nunca começam no horário silencioso e sempre dão pelo menos 12 h de prazo.

---

## 22.15 Calendário semanal (eventos fixos)

| Dia | Evento |
|-----|--------|
| Segunda | 🌸 Nova estação (a cada 7 dias): Maré Alta de um elemento |
| Quarta | 📜 Missões da semana renovam |
| Sexta (noite) | ⚔️ Torneio do Coliseu (duelos por chave, 20h–22h) |
| Sábado | 🎭 Leilão das Sombras em Kyōkai (lances por 24 h) |
| A cada 28 dias | 🌑 Noite do Selo (mana −20%, criaturas do vazio em todo lugar, chefe de mundo especial) |

---

## 22.16 Social

| Recurso | Como |
|---------|------|
| **Party** | `!party criar`, `!party convidar @x` (aceite com 👍), até 5; líder decide viagens/votos de desempate |
| **Trocas** | `!trocar @x <item> por <item>` → os dois confirmam com 👍 |
| **Acordos** | `!acordo @x <texto>` → registrado; quebrar custa Mérito (doc 08) |
| **Presentear** | `!dar @x <item>` |
| **Duelos** | ver 22.8 |
| **Ranking** | `!ranking` (nível, Mérito, vilões únicos derrotados) — sem mostrar segredos |
| **Fora do personagem** | `(( ... ))` ou qualquer mensagem sem comando: o bot ignora |

---

## 22.17 Pets espirituais em jogo

Ver [doc 23](23-pets-espirituais.md): como se encontra o pet, como ele age no combate, vínculo e evolução.

---

## 22.18 Todas as situações difíceis (e o que o bot faz)

| Situação | Comportamento |
|----------|---------------|
| Dois jogadores mandam ação ao mesmo tempo | Sem problema: rodada simultânea; cada um tem a sua ação |
| Jogador manda duas ações na mesma rodada | Vale a **última** antes do prazo (o ✅ muda de mensagem) |
| Mensagem ambígua ("ataca") | O bot responde com as opções numeradas (`?`) só para aquele jogador |
| Jogador some no meio da batalha | Defende automático → Piloto Automático após 3 rodadas |
| Jogador sai do grupo | Personagem congela (doc 01); sai da party; itens lendários voltam à origem após 7 dias |
| Jogador troca de número | Só o admin migra (`/migrar-jogador`) |
| Mensagem apagada | Se era uma ação ainda não resolvida, a ação é cancelada |
| Mensagem editada | Ignorada (vale a original) — evita trapaça depois de ver o resultado |
| Áudio, figurinha, foto | Ignorados (o grupo pode conversar normalmente) |
| Flood/spam de comandos | 1 comando a cada 3 s por jogador; excesso é descartado com um aviso único |
| Bot reinicia/cai | Estado salvo a cada rodada; ao voltar, reposta os painéis com "⏸️ Retomando" |
| Jogador entra no Ato III | Prólogo curto, marco de alcance e XP +50% até a média do grupo (doc 11) |
| Ninguém joga por uma semana | O Relógio do Eclipse **só avança** se houver ≥ 1 jogador ativo na semana (o mundo "dorme") |
| Party com níveis muito diferentes | Encontros escalam pela **média**; quem está 10+ níveis abaixo ganha +25% XP e o mais alto ganha Mérito por ajudar |
| Empate de votos | Líder da party decide; em decisões de mundo, a IA decide pelo maior Mérito somado |
| Pedido de mudar atributo/nome/aparência | Recusado *in-character* (doc 01.5); nome só com o Pergaminho do Novo Nome |
| Tentativa de prompt injection | Classificador bloqueia; resposta fixa in-character |
| Jogador corrompido trai em batalha | Só via `!trair` no privado (doc 16); o painel narra a traição sem dizer quem até o fim da luta |
| Morte Verdadeira | Carta Memorial no grupo; reencarnação no privado (doc 19.3) |

---

## 22.19 Um dia típico (exemplo)

```
08:12 🔒 Kaito: !explorar
      Bot: Névoa vermelha na Costa Akashio... ⚔️ Um contrabandista te cerca! [painel solo]
08:13 🔒 Kaito: h1   → Iaijutsu, crítico. Vitória. +840 XP, Escama de Caranguejo-Vapor.
12:30 👥 Bot: 🚨 CRISE — Sacrifícios nas Dunas (48 h). @Kaito @Aya @Rin
12:31 👥 Kaito: !party criar · Aya 👍 · Rin 👍
19:02 👥 Kaito: !entrar SF-HOM-04   → enquete "Porão ou convés?" → Convés (2 votos)
19:20 👥 Chefe: Capitã Mizuchi. 6 rodadas. Aya + Rin: ⚡ ELETROCUTAR → Postura quebrada!
19:26 👥 Vitória. ⬆️ Kaito chegou ao nível 25. Grimório G04 para os três.
22:40 🔒 Bot (sussurro, assinado "Uma voz amiga"): "Você luta bem, Kaito. Bem demais para servir a um rei que mente."
```
