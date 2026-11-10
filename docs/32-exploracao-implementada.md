# 32 — Exploração: primeira etapa implementada

Depois de criar o personagem, o jogador já pode sair da aldeia pelo privado do bot.
O grupo recebe apenas orientação para continuar no privado. Personagens existentes
continuam válidos: nomes antigos em `regiao_atual` são convertidos nos IDs do mapa.

## Comandos

Aceitam texto simples, `!` ou `/`. Nomes de região aceitam acentos, IDs e trechos
únicos do nome; nomes ambíguos pedem uma escolha explícita antes de gastar vigor.
O interpretador existente também reconhece frases como “olho em volta” e
“vou para o Lago Kagami”. Ações com `>` pertencem à próxima etapa do narrador.

| Comando | Resultado |
|---|---|
| `explorar` | Sorteia um dos seis resultados, custa 10 vigor |
| `mapa [reino]` | PNG com marcador de posição; mostra vizinhos por texto |
| `rota <região>` | Menor caminho aberto, tempo e vigor totais, sem iniciar a viagem |
| `viajar <região>` | Viaja a um vizinho, custa 15 vigor |
| `viagem` | Consulta o prazo ou confirma chegada |
| `vigor` | Energia atual e custos |
| `descobertas` | Até 20 locais descobertos mais recentes |
| `inventario` | Ryō e até 30 tipos de itens coletados |
| `recuar` | Encerra encontro/evento pendente, sem devolver vigor |
| `ajudar` / `1` | Resolve o evento do viajante, recebe 5 ryō uma única vez |
| `seguir` / `2` | Resolve o evento do viajante sem recompensa |

## Tempo e vigor

Vigor tem teto de 100 e recupera 1 ponto a cada 6 minutos reais (10/h), calculado
ao receber mensagens. Frações de intervalo são preservadas; tempo acima do teto
não fica acumulado. Explorar custa 10, viajar 15. O custo 25 de masmorra fica
definido para integração futura; combate não consome vigor. Uma exploração vazia
devolve 5, como previsto no documento 22. Ações com gasto têm intervalo de 3 s.

A viagem dura 10 minutos, ou 5 com `montaria_id` correspondente a um animal de
tipo `montaria` do catálogo. A aquisição de montarias e suas habilidades especiais
não estão nesta etapa. Regiões vizinhas vêm de `data/reinos.json`, e bloqueios
`desbloqueio` exigem o marco concluído pelo jogador ou pelo mundo.

O prazo de chegada é salvo no banco. **Não depende do relógio da VPS**: a primeira
mensagem no privado após o prazo conclui a viagem e informa a chegada, mesmo após
reinício. Antes do prazo, explorar e iniciar outra viagem são bloqueados. A primeira
visita mostra o mapa do reino. Há 30% de chance de um evento de estrada sorteado
na partida, salvo e mostrado uma única vez na chegada. Nesta etapa são cenas de
clima, mercador ou rastros, sem combate, compras ou recompensas automáticas.

## Sorteio e conteúdo

As chances base são 40/15/15/15/10/5 para encontro/descoberta/achado/evento/fauna/nada.
Como os documentos não especificam a fórmula dos modificadores, esta implementação
usa os seguintes pesos, isolados em `src/regras/exploracao.mjs` para balanceamento:

- SOR: bônus limitado entre −5 e +10, calculado como `(SOR − 10) / 5`.
- Perigo: baixo −5, médio 0, alto +10, muito alto +15, extremo +20, divino +25.
- Eclipse: de 0 a +10 no peso de encontros, conforme a porcentagem global.
- Encontro recebe perigo + Eclipse − bônus de SOR. Descoberta e achado recebem
  metade do bônus de SOR cada. Os seis pesos são normalizados para somar 100%.

SOR 10, perigo médio e Eclipse 0 reproduzem exatamente as chances base.

Encontros usam vilões comuns/médios da própria região, com nível mínimo igual ao
nível base do vilão e escala até o jogador. Uma diferença de 5 níveis ou mais
mostra o aviso do corvo. **O motor de combate ainda não existe**: não são calculados
ataques, XP, derrotas ou loot de luta. O encontro fica salvo até `recuar`; `enfrentar`
explica essa limitação. Regiões sem vilões comuns/médios mostram apenas vestígios,
sem substituir chefes de história por inimigos aleatórios.

Descobertas registram entradas de subfases locais ainda desconhecidas, sem revelar
seus segredos. Na falta delas, registram um ponto de observação local. Entrar em
masmorras, abrir atalhos e revelar segredos narrativos dependem das próximas etapas.
Achados concedem 5–20 ryō ou um material por reino (obsidiana, pérola, cristal,
pluma ou pedra), com origem registrada. Fauna apresenta o comportamento de animais
locais; animais lendários ficam fora do sorteio para preservar gatilhos da história.

## Persistência e validação

A migração `0002_exploracao.sql` adiciona saldo de ryō, referência de montaria e
controle de intervalo, além das tabelas `viagens`, `descobertas` e `exploracoes`.
Todas as novas tabelas têm RLS. O inicializador existente aplica a migração ao subir
o servidor; não é necessário executar comandos na VPS para habilitar esta etapa.

Cada ação usa transação curta e `SELECT ... FOR UPDATE` na linha do jogador.
Gasto, resultado, inventário e recompensa são confirmados juntos ou desfeitos juntos.
Há índices únicos para uma viagem em curso, um encontro/evento pendente e uma
descoberta por referência. A deduplicação de mensagens existente do bot permanece
ativa. Mapas são renderizados depois do commit, a partir de cópia do terreno em cache.

Testes com RNG e relógio controlados cobrem os seis resultados, custos, frações de
vigor, bloqueios, recuperação após reinício, montarias, repetição de mensagens,
comandos concorrentes, rollback e compatibilidade com a criação de personagem.

```sh
npm ci
npm run testar
bash db/testar-migracoes.sh
```

Requisitos de teste: Node 22, Postgres 15+ e Python com PyYAML. Se o Postgres estiver
fora do caminho padrão, use `PGBIN=/caminho/do/postgresql/bin` nos dois comandos de teste.
Não são necessárias credenciais de WhatsApp, IA ou banco de produção para esses testes.
