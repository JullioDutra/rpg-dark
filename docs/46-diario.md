# 46 — Diário

`diario` (privado) mostra tudo o que **aquele jogador** já descobriu do mundo. Código: `src/servidor/diario.mjs`. Teste de vazamento: `scripts/testar-diario.mjs` (entra no `npm run testar`).

## 46.1 Como o jogador usa

| Comando | Mostra |
|---------|--------|
| `diario` | O índice das partes e a primeira (a apresentação do mundo) |
| `diario <nº>` ou `diario pessoas` | Uma parte |
| `diario tudo` | Todas, em mensagens separadas (partes longas são divididas em páginas) |

## 46.2 Ordem e conteúdo

Começa pelo que qualquer recém-chegado sabe e segue para o que o jogador descobriu. Partes sem nenhuma descoberta não aparecem.

| # | Parte | O que entra | De onde vem (já mostrado ao jogador) |
|:---:|-------|-------------|--------------------------------------|
| 1 | O mundo como te contaram | Apresentação do continente, os quatro reinos e a Terra Central, a aldeia natal | Textos públicos (`data/textos-mundo.json`, sem segredos) |
| 2 | Lugares onde você esteve | Só as regiões em que ele esteve, com a descrição pública e os nomes dos lugares de lá | Chegada à região |
| 3 | Histórias | **Vividas:** desfecho e pista. **Só ouvidas** (outra pessoa concluiu): pista e quem viveu, sem o desfecho. **Em aberto:** só até o passo atual | Conclusão do capítulo, notícia de herança, `missao` |
| 4 | Pessoas que você conheceu | Só com quem ele conversou: nome, papel, laço e o que a pessoa contou | Conversa com o NPC |
| 5 | Inimigos que você enfrentou | Vilões derrotados e monstros/Calamidades que ele golpeou | Encontro e anúncio |
| 6 | Boatos e ecos | Boatos ouvidos, memórias vividas (`lembrar`) e os ecos do menino recebidos | `boatos`, `lembrar`, evento das Sete Luzes |
| 7 | O que você carrega | Título, pet, Grandes Itens, grimórios, Olhos da Terra, pactos | Ficha e bolsa |

## 46.3 Por que não vaza

1. **Duas etapas separadas.** `coletar` lê do banco só *ids e contadores* do que o jogador conquistou. `montarDiario` é uma função pura que transforma cada id no mesmo texto que o jogo já mostrou. O que não está na lista não tem como aparecer.
2. **Regras conservadoras:**
   - Capítulo em aberto só entra se o jogador já andou nele ou está no lugar agora; capítulo ainda fechado (exigências não cumpridas) não entra, nem pelo título.
   - Capítulo herdado nunca mostra o desfecho nem os passos, só a pista (que a notícia de herança já deu).
   - NPC só entra depois de pelo menos uma conversa.
   - Vilão só entra depois de derrotado.
3. **Teste de vazamento automático.** Monta 3.000 diários com conhecimentos sorteados (de quase nada a quase tudo) e procura, em cada um, qualquer pista, desfecho, passo futuro, fala de NPC, descrição de vilão, boato, eco ou região que não estava na lista. Também confirma que o detector enxerga um vazamento plantado de propósito.
4. **Teste com banco.** Um jogador zerado vê só o mundo e os lugares; conversar com alguém faz a pessoa aparecer; concluir um capítulo faz desfecho e pista aparecerem; nenhuma história que ninguém contou a ele aparece.

## 46.4 Limites conhecidos

- "Lugares onde você esteve" é reconstruído a partir de viagens concluídas, do lugar atual e de onde ele viveu algo. Quem foi movido pelo mestre e saiu sem fazer nada pode não ter aquele lugar listado.
- Alguns títulos de capítulo são também o nome de um lugar, de um vilão ou de um boato ("O Poço Seco", "Céu Rubro", "A Criança da Mina"); nesses casos o nome aparece pela outra origem, que o jogador já conhece.
- O que o narrador (IA) inventou em cenas livres não entra no diário: só o que é do jogo.
