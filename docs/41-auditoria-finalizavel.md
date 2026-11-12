# 41 — Auditoria: o jogo é finalizável? Quanto dura?

Números gerados por `node scripts/auditar-jogo.mjs` (ver [41b](41b-auditoria-numeros.md)). Lutas medidas por simulação ([35b](35b-tabela-equilibrio.md)).

## 41.1 Resposta curta

**Sim, hoje é finalizável** — depois de três correções feitas nesta auditoria. Antes delas, não era na prática.

## 41.2 O que estava travado ou sem rumo (e o que foi feito)

| # | Problema | Gravidade | Correção |
|:---:|----------|:---:|----------|
| 1 | **Faltava XP na história.** Fazendo os 54 capítulos, um jogador chegava ao nível 87; só o caminho crítico, 74. O chefe final é nível 100, e explorar rende menos de 1 luta por hora (vigor). Vilões apareciam 18 a 30 níveis acima do jogador | Trava | **Alcance:** vilão de covil luta no máximo 2 níveis acima de quem o enfrenta, e conteúdo acima do seu nível dá mais XP (até ×3). Com isso, só o caminho crítico leva ao nível 98 |
| 2 | **Ruínas de Hinata e Monte Ryūsō** só abriam para quem concluiu a Muralha em pessoa. Herdeiros e companheiros ficavam com capítulo aberto e estrada fechada | Trava | A Muralha agora abre o caminho para o mundo inteiro |
| 3 | **Grandes Itens espalhados.** Com a história compartilhada, cada item lendário fica com quem fechou o capítulo; quem enfrenta o fim podia chegar sem nenhum (10% de vitória) | Quase trava | `dar <Grande Item> @pessoa` no grupo: o grupo arma quem vai lutar |
| 4 | Herdeiro recebia 25% do XP e ficava para trás do grupo | Rumo | Agora 50%, com o bônus de alcance |
| 5 | Dado pouco claro (retorno de jogador): o número aparecia sem o modificador nem o que ele vale | Clareza | Toda luta abre explicando a conta; cada rolagem mostra número, modificador, total e multiplicador |

Conferido e sem problema: 0 erros de estrutura (todo passo de capítulo aponta para lugar, NPC e vilão que existem; todo vilão tem covil; toda região tem rota);
o caminho crítico tem ordem possível (18 capítulos, sem ciclo de exigências); derrota nunca prende (vida volta com o tempo ou descanso);
maldição se desfaz em 48 h; monstro e Calamidade vão embora no prazo; encontro pendente sempre aceita `recuar`.

## 41.3 Caminho até o fim

18 capítulos obrigatórios (lista em 41b), com 29 lutas de história. Os outros 36 capítulos são opcionais, mas dão nível, pets, Grandes Itens e bênçãos.

## 41.4 Quanto tempo dura

Premissas: 25 s por rodada de luta, 45 s por passo de história, 10 min por trecho de viagem, e as taxas de vitória simuladas.

| Cenário | Jogo ativo | Tentativas de luta | Viagens | Observação |
|---------|:---:|:---:|:---:|-----------|
| Um jogador só no caminho crítico | ~17 h | ~116 (29 lutas) | 40 trechos | Sempre abaixo do nível: muitas derrotas. É o modo difícil |
| Todos os 54 capítulos (o mundo inteiro) | ~56 h | ~310 (99 lutas) | 187 trechos | Dividido entre o grupo, já que cada capítulo só acontece uma vez |

O relógio real pesa mais que o jogo ativo: viajar gasta vigor (15 por trecho, volta 10 por hora). Só o caminho crítico pede cerca de 2 dias de espera de vigor (ou 17 rações de viagem); o mundo inteiro, 11 dias (ou 91 rações).

**Estimativa em dias corridos** (jogando cerca de 1 hora por dia cada um):

| Grupo | Até o final | Para esgotar o mundo |
|-------|:---:|:---:|
| 1 jogador | 3 a 4 semanas | 8 a 10 semanas |
| 4 a 6 jogadores | 2 a 3 semanas | 3 a 5 semanas |

O mínimo teórico (grupo focado só no caminho crítico, revezando) fica perto de 1 semana.

## 41.5 Riscos que continuam (para observar com jogadores reais)

1. **Chefe de alto escalão é o degrau mais duro para quem está abaixo do nível** (12% por tentativa). Fazer capítulos opcionais antes resolve; vale observar se alguém empaca nos arcos dos reinos (níveis 40 a 50).
2. **Explorar não serve para subir de nível** (menos de 1 luta por hora). Se quiserem "farmar", o custo de vigor de explorar precisa cair.
3. **Quem entra tarde num mundo adiantado** herda quase tudo e tem pouca história própria; sobra para ele ecos, contratos, monstros e Calamidades.
4. **Calamidade e monstros de cidade** ainda não foram calibrados por simulação.
5. O final "estelar" exige 3 Grandes Itens com quem dá o último golpe; agora depende de o grupo entregar os itens a uma pessoa.
