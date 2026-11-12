# 37 — Plano de melhorias e de novas funcionalidades

Planejamento, não implementação. Cada item diz o problema, a proposta e o esforço (P = pequeno, M = médio, G = grande).
A ordem dentro de cada tabela é a ordem sugerida.

## 37.1 Princípios de fluidez

1. **Uma mensagem, uma decisão.** Cada resposta do bot termina deixando claro o que o jogador pode fazer agora.
2. **Número antes de texto.** Tudo que é escolha vira lista numerada (como na luta). Digitar "2" é mais rápido que digitar um nome.
3. **Imagem nos momentos, texto no caminho.** Chegada, vilão, conversa, vitória importante: imagem. Passos intermediários: texto curto.
4. **O grupo vê os feitos, o privado vive a história.** Nada de poluir o grupo com mecânica.
5. **Nunca travar.** Toda situação tem saída (recuar, eco, bilhete no túmulo, descanso).

## 37.2 Melhorias por área

### Entrada e primeiros 10 minutos

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 1 | A criação tem muitas mensagens seguidas no final | Juntar "sua casa" + reino numa só; mandar "por onde começar" só depois da primeira ação | P |
| 2 | Quem nasce numa região de nível alto (Monte Hinokami, Minas de Shōseki) não tem vilão do seu nível | Primeiro capítulo dessas regiões ganhar um passo inicial contra um lacaio, com vitória garantida de tutorial | M |
| 3 | O jogador não sabe que pode trocar de aparência depois | Comando `aparência` numa capital, pago em ryō | P |
| 4 | Personagens antigos não escolheram gênero | Perguntar uma vez, no próximo `ficha` | P |

### Exploração e viagem

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 5 | Viajar 10 minutos sem nada para fazer | Durante a viagem, liberar `boatos`, `itens`, `minha história` e uma cena de estrada narrada | P |
| 6 | A chegada só aparece quando o jogador manda mensagem | Com o relógio na VPS, o bot avisa sozinho: "você chegou" | M (depende do relógio) |
| 7 | `explorar` repete os mesmos 6 resultados | Tabela de achados por região (um item único por lugar), encontros com NPCs viajantes, clima que muda o texto | M |
| 8 | Montarias existem nos dados e não no jogo | Comprar ou domar montaria: metade do tempo de viagem | M |
| 9 | O mapa não mostra onde há história pendente | Marcar no mapa as regiões com capítulo aberto e as já concluídas | P |

### Combate

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 10 | O painel repete o menu inteiro a cada rodada | Depois da 2ª rodada, mostrar o menu em uma linha; `?` reabre o completo | P |
| 11 | Classes frágeis sofrem no fim (doc 35.3) | Segunda proteção no nível 25 ou −10% no ataque das divindades; decidir com dados reais | P |
| 12 | Luta final fácil para quem está preparado | Segunda fase do Rei do Eclipse, que ignora parte dos bônus | M |
| 13 | Grimórios (40) existem nos dados e não no jogo | Grimório equipado troca a "magia do elemento" por 2 magias próprias | G |
| 14 | Estados de luta são poucos | Cegueira, medo e congelamento, sempre avisados uma rodada antes | M |
| 15 | Ação livre na luta (`> texto`) não vale nada | Juiz de Táticas: a IA dá nota de 0 a 10 e o motor converte em +1 a +3 no dado | M |

### História e NPCs

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 16 | Capítulos são lineares | Encruzilhadas (doc 27): 12 decisões com votação no grupo, que mudam capítulos seguintes | G |
| 17 | Conversa com NPC não tem limite de uso da IA | Limite de 40 conversas por dia por jogador; depois disso, texto pronto | P |
| 18 | NPCs não lembram do que foi dito | Guardar um resumo de 2 linhas por NPC e por jogador | M |
| 19 | Amizade só rende poções | Cada NPC amigo ensina algo do ofício: desconto na loja, pista de covil, receita | M |
| 20 | Morte de NPC é sorteio simples | Avisar antes ("alguém anda perguntando por você na vila"): dá chance de impedir derrotando o vilão a tempo | M |
| 21 | Fim da campanha é uma mensagem só | Epílogo por jogador: cita capítulos, amigos, vinganças, história pessoal e o que o mundo virou | M |

### Itens e economia

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 22 | Materiais só servem para vender | Forja: 3 materiais + ryō melhoram a arma em um nível | M |
| 23 | Ryō sobra no meio do jogo | Casa na capital (descanso grátis, baú), doações que rendem mérito | M |
| 24 | Troca entre jogadores não existe | `dar <item> @pessoa` no grupo, com confirmação | P |
| 25 | Loja mostra lista longa | Abas: `loja poções`, `loja armas`, `loja armaduras` | P |

### Grupo

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 26 | Não há luta em conjunto | Rodadas simultâneas no grupo com prazo (depende do relógio na VPS) | G |
| 27 | Feitos somem na conversa | Resumo diário às 21h: quem derrotou o quê, quem subiu, ranking do dia | M (relógio) |
| 28 | Não há ranking | `ranking`: nível, vilões primeiros, capítulos, mérito | P |
| 29 | Jogador novo entra perdido | Padrinho: um veterano que `apoia` um novato ganha mérito quando o novato conclui o primeiro capítulo | P |

### Técnica e operação

| # | Problema | Proposta | Esforço |
|:---:|----------|----------|:---:|
| 30 | Evolution em HTTP, chaves que passaram pelo chat | Domínio com HTTPS no Traefik da VPS; trocar as chaves | P (seu lado) |
| 31 | Sem relógio, nada acontece sozinho | Subir o container do relógio (doc 31, passo 5) | P (seu lado) |
| 32 | Imagens são geradas a cada mensagem | Guardar em memória as cenas e retratos já gerados; depois, no Blob | P |
| 33 | Sem painel de acompanhamento | Página de admin: jogadores, níveis, onde estão, consumo de IA, erros | M |
| 34 | Erro de envio só aparece no log | Guardar envios falhos e reenviar na próxima mensagem do jogador | M |
| 35 | Backup do banco | Exportação semanal automática do Neon para o Blob | P |

## 37.3 Novas funcionalidades

| # | Funcionalidade | O que é | Por que eleva o jogo | Esforço |
|:---:|----------------|---------|----------------------|:---:|
| A | **Chefe de Mundo** | Um vilão gigante com vida compartilhada; cada jogador ataca no privado ao longo de 2 ou 3 dias; painel no grupo | Junta o grupo inteiro num objetivo, no ritmo do WhatsApp | G |
| B | **Estações e clima** | A cada semana real muda a estação: um reino fica mais forte, rotas abrem e fecham, lojas mudam preços | O mundo parece vivo mesmo para quem só passa | M |
| C | **Relógio do Eclipse ativo** | A barra sobe com derrotas e com o tempo; em 25/50/75% o mundo muda (lacaios mais fortes, NPCs com medo, céu rachado nas imagens) | Dá urgência coletiva e sentido às vitórias | M |
| D | **Crises com prazo** | "A vila cai em 6 horas": quem estiver na região defende; o resultado muda o lugar (loja fecha, NPC morre ou vira herói) | Consequência real e memória coletiva | G |
| E | **Facções (juramentos)** | Guarda, Sayo, Kyōkai e Arautos: cada uma com missões, loja e um jeito de ver a verdade; rivalidade sadia no grupo | Rejogabilidade e conflito entre jogadores com regras | G |
| F | **Diário ilustrado** | `diário`: uma imagem com a linha do tempo do personagem (capítulos, vilões, amigos, perdas) | Orgulho de mostrar no grupo | M |
| G | **Carta de memorial** | Quando um NPC amigo morre ou um jogador zera, o bot gera uma carta comemorativa | Dá peso aos momentos | P |
| H | **Torneio do Coliseu** | Uma vez por semana, chave de duelos entre jogadores em Kagutsuchi-jō, com prêmio e título | Evento social previsível | M |
| I | **Ofícios** | Ferreiro, alquimista, pescador, cartógrafo: um por personagem, sobe com o uso, produz itens que só jogadores fazem | Economia entre jogadores | G |
| J | **Lar e baú** | Casa na capital do seu reino: descanso, baú, troféus dos vilões derrotados | Sensação de pertencimento | M |
| K | **Missões da Guilda** | Quadro diário em Kyōkai e nas capitais: 3 contratos por dia (caçar, escoltar, investigar), com mérito e ryō | Algo para fazer todo dia em 5 minutos | M |
| L | **Sonhos** | Ao descansar, às vezes o jogador sonha: fragmentos do passado, do segredo dele ou um sussurro de Kanata | Entrega lore sem pedir esforço | P |
| M | **Segunda vida** | Reencarnação após zerar: novo sorteio, herda um eco (título e uma lembrança), dificuldade maior | Rejogar com sentido | M |
| N | **Vozes do mundo** | Uma vez por dia, um NPC "escreve" no grupo uma fofoca verdadeira sobre o que os jogadores fizeram | O grupo vira parte do mundo | P |

## 37.4 Sequência recomendada

| Ciclo | Foco | Itens |
|:---:|------|-------|
| 1 | **Polir o que existe** (sem depender de nada) | 1, 2, 4, 9, 10, 17, 24, 25, 28, 32 |
| 2 | **Ligar o tempo** (depois do relógio na VPS) | 31, 6, 27, C, N |
| 3 | **Jogar junto** | 26, A, H |
| 4 | **Profundidade** | 13, 15, 18, 19, 20, 22, K, L |
| 5 | **Mundo que muda** | 16, B, D, E |
| 6 | **Longo prazo** | 12, 21, F, G, I, J, M |

O ciclo 1 cabe numa rodada de trabalho e melhora a experiência de todo mundo na hora. Os ciclos 2 e 3 dependem do relógio.
