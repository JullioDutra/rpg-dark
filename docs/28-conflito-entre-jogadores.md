# 28 — Conflito entre Jogadores

> Conflito é **conteúdo**: rivalidade, disputa, traição e julgamento fazem parte da história. Mas o jogo precisa
> continuar divertido para todos, então **todo conflito tem regras, custo, limite e saída**.

## 28.1 Princípios

1. **Consentimento no confronto direto.** Ninguém é atacado sem aceitar, exceto em zonas sem lei avisadas e por
   traição prevista pela história (doc 16).
2. **Consequência real.** Trair, roubar ou mentir tem efeito mecânico e social (Mérito, marca T10, julgamento).
3. **Teto de perda.** Nenhum conflito faz alguém perder itens lendários, o Ovo ou o personagem — exceto no Duelo de
   Relíquia, aceito pelos dois com confirmação dupla.
4. **Sempre há uma saída.** Paz, julgamento, reparação ou o admin.
5. **A IA narra os dois lados com justiça**, sem tomar partido.

## 28.2 Os tipos de conflito

| Conflito | Origem típica | Ferramenta do jogo |
|----------|---------------|-------------------|
| **Rivalidade** | Competição saudável (quem sobe mais rápido, quem vence o torneio) | `!rival` |
| **Disputa** | Os dois querem a mesma coisa (item de chefe, núcleo, pena de Nisteroy, liderança da party) | `!disputa` |
| **Acusação** | Alguém quebrou um acordo, furtou, traiu em batalha, mentiu | `!acusar` → Julgamento |
| **Facções** | Visões opostas sobre os reis, Kanata e o Ovo (Ato II em diante) | `!juramento` |
| **Traição** | Pacto com Kanata (doc 16) | `!trair` (só no privado) |
| **Furto** | Jogadores furtivos ou desesperados | `!furtar` |
| **Corrida pelo Seiō** | Só um será coroado (doc 14.5) | Pontuação Estelar |

## 28.3 Rivalidade (`!rival @x`)

- Precisa ser **aceita** pelo outro jogador (👍). Dura até alguém usar `!paz`.
- **Desafio semanal automático**: o bot sorteia uma meta (mais vilões únicos derrotados, mais Mérito, primeiro a
  vencer uma subfase). Quem vencer ganha +5% de XP na semana seguinte e o título *"Rival de <nome>"*.
- Rivais podem se duelar sem esperar as 6 h de intervalo.
- Rivais na mesma party causam **+10% de dano** quando competem pelo último golpe ("quem derruba primeiro?") —
  a rivalidade faz os dois jogarem melhor.

## 28.4 Disputa (`!disputa @x <objeto>`)

Quando dois jogadores querem a mesma coisa, o **desafiado escolhe a forma** de resolver:

| Forma | Como |
|-------|------|
| ⚔️ **Duelo de honra** | Duelo comum; o vencedor leva |
| 🏛️ **Mediação** | A IA (como juiz de Kyōkai) ouve os dois argumentos (1 mensagem cada) e decide por mérito, necessidade e acordos anteriores |
| 💰 **Lance** | Leilão fechado entre os dois (cada um manda o lance no privado; o maior paga e leva) |
| 🎲 **Sorte** | Sorteio pelos deuses (d100 + SOR) |
| 🤝 **Divisão** | O objeto fica com um; o outro recebe uma compensação acordada e registrada como acordo |

Se o desafiado não responder em 12 h, a forma vira **Mediação**.

## 28.5 Julgamento em Kyōkai (`!acusar @x <motivo>`)

Para conflitos graves: acordo quebrado, furto, traição, ataque a aliado, mentira que custou uma crise.

```
1. ACUSAÇÃO   O acusador escreve o motivo. O bot verifica se há EVIDÊNCIA registrada pelo motor
              (acordos, logs de batalha, furtos, pactos já revelados). Sem evidência, a acusação vira boato.
2. DEFESA     O acusado tem 12 h para se defender (1 mensagem) e pode chamar 1 testemunha.
3. JÚRI       Os outros jogadores ativos votam por enquete (12 h): culpado / inocente. Quem é parte não vota.
4. VEREDITO   O Juiz de Kyōkai (IA) narra o veredito considerando votos E evidências.
              Evidência forte + maioria = culpado. Sem evidência, nunca culpado.
5. PENA       Escolhida pelo júri entre penas proporcionais:
```

| Pena | Para quê |
|------|----------|
| **Reparação** | Devolver o item/ouro + 20% |
| **Multa de Mérito** | −20 a −80 |
| **Marca do Traidor** (T10) | Só para traição comprovada |
| **Exílio da Guilda** | Sem missões da Guilda por 7 dias reais |
| **Serviço** | Uma missão obrigatória em favor da vítima |

- **Acusação falsa** (inocente por evidência): o acusador perde 30 de Mérito.
- O julgamento vira **cena pública** narrada pela IA (é conteúdo para todos).
- Kanata adora julgamentos: durante um, ele pode sussurrar para o jurado mais corrompido.

## 28.6 Facções (Juramentos) — a partir de A2-M3

Depois que Yoru se revela, cada jogador pode fazer um **Juramento** (`!juramento <facção>`). Não é obrigatório.

| Facção | Crença | Vantagem | Missões |
|--------|--------|----------|---------|
| 🛡️ **Guarda dos Quatro** | Os reis erraram, mas o selo precisa deles | Ajuda dos exércitos reais em crises | Proteger reis e núcleos |
| 🕯️ **Caminho de Sayo** | A verdade e o perdão salvam o mundo | +Dúvida em Kanata; flashbacks mais fáceis | Buscar memórias e redenção |
| 💰 **Mão de Kyōkai** | Pragmatismo: quem paga, manda | Preços −20%, acesso ao mercado negro | Contratos, leilões, informação |
| 🌑 **Arautos** *(secreta)* | Kanata tem razão | Pactos mais fortes, informações de Kanata | Ordens de Kanata (Corrupção ≥ 50 só) |

- Membros de facções diferentes podem jogar juntos, mas **missões de facção podem ser opostas** (proteger um núcleo
  × entregá-lo à Guilda). Esse é o motor dos conflitos do Ato III.
- Mudar de facção: 1 vez no jogo, com missão de transição e −30 de Mérito.
- A facção vencedora (maior soma de contribuição) influencia o epílogo.

## 28.7 Furto (`!furtar @x`)

| Regra | Valor |
|-------|-------|
| O que pode ser furtado | Só consumíveis, materiais e ryō (até 15%). **Nunca** equipamentos, grimórios, lendários, o Ovo, núcleos |
| Chance | (VEL + SOR do ladrão) × 2 − (VEL + SOR da vítima); *Sombra* (T08) com vantagem |
| Sucesso | A vítima percebe a falta, mas não sabe quem |
| Falha | A vítima e o grupo são avisados de quem tentou; vira evidência para julgamento |
| Proteção | Jogadores abaixo do nível 10 são imunes; o mesmo alvo só 1× por semana; 1 furto por dia |
| Custo | +5 de Corrupção por furto bem-sucedido (Kanata gosta) |

## 28.8 PvP sem consentimento: só nas Terras sem Lei

> **Atualizado:** o fim de uma luta real (inclusive nas Terras sem Lei) agora termina num **Veredito** em que o
> vencedor escolhe **finalizar, deixar ir ou exigir rendição** — regras e consequências no [doc 29.4](29-travas-tecnicas-e-casos-especiais.md).

- Em duas regiões (**Floresta Petrificada** e os **arredores da Cratera**), ao entrar, o bot avisa:
  *"⚠️ Terra sem lei: aqui, outros viajantes podem te atacar."* O jogador precisa confirmar.
- Lá, `!emboscar @x` inicia uma **luta real** (rodada simultânea) que termina no **Veredito** (doc 29.4).
- Atacar alguém 10+ níveis abaixo custa Mérito; acima de 15 níveis de diferença, a emboscada é bloqueada.
- Proteção anti-gangue: máximo 2 contra 1, e a vítima recebe +20% de DEF para cada atacante extra.

## 28.9 Paz e reconciliação (`!paz @x`)

- Os dois confirmam. A rivalidade, a disputa ou a inimizade acabam.
- Recebem o **Laço Forjado**: +10% de dano em combos entre os dois. Inimigos que viram aliados fazem as melhores duplas.
- Um conflito resolvido por paz conta para *Língua de Prata* (T07) nos dois.

## 28.10 Proteções contra abuso

| Proteção | Regra |
|----------|-------|
| `!ignorar @x` | Bloqueia duelos, disputas, trocas e rivalidade daquele jogador (não bloqueia julgamentos nem a história) |
| Novatos | Abaixo do nível 10: imunes a furto, disputa e emboscada |
| Teto de perdas | Nenhuma perda de lendários, Ovo, núcleos ou personagem por conflito entre jogadores (exceto Duelo de Relíquia aceito) |
| Cooldowns | Acusações (1 a cada 3 dias), duelos (6 h por par), furtos (1/dia) |
| Admin | `/encerrar-conflito @a @b` congela qualquer conflito entre dois jogadores |
| Assédio real | Insultos reais (fora do personagem) não são conflito de jogo: o bot só registra; o admin decide |

## 28.11 Exemplo completo

```
1. Aya e Rin querem a Pena de Nisteroy (C10). Rin vence o leilão com o ouro que Aya emprestou "por acordo".
2. Rin não devolve o ouro no prazo do acordo registrado (!acordo).
3. Aya: !acusar @Rin quebrou o acordo de 2.000 両
   Bot: evidência encontrada (acordo #41, prazo vencido há 2 dias). Rin tem 12 h para se defender.
4. Rin: "Kanata me sussurrou que a Aya era a isca do Ovo; eu precisava da pena para proteger o portador."
   (é verdade — mas Rin também aceitou um pacto)
5. Júri (enquete): 4 culpado × 2 inocente. Juiz de Kyōkai: culpado. Pena escolhida: Reparação (2.400 両).
6. Durante o julgamento, Kanata sussurra para Tōma (Corrupção 55): "vote inocente e eu te digo quem é o portador".
   Tōma recusa e revela o sussurro ao grupo (−5 Corrupção).
7. Rin paga. Uma semana depois, Rin e Aya enfrentam a Barqueira de Yomi juntas; Rin protege Aya na rodada final.
   !paz → Laço Forjado. Na batalha final, o combo das duas quebra a Postura do Shokuō.
```
