# 13 — Comandos

> Códigos curtos de batalha (`a`, `m1`, `h1`, `d`, `i`, `p`, `t`, `pet`, `f`, `?`), Vigor, modos e situações especiais: **[doc 22](22-jogabilidade.md)**.

Tudo é digitado no **grupo** do mundo. Comandos com `!` são processados pelo motor (rápidos, sem IA).
Texto livre começando com `>` (ou mencionando o bot) é uma **ação narrativa** interpretada pela IA.

## Entrada
| Comando | Efeito |
|---------|--------|
| `entrar no mundo` | Inicia a Cerimônia do Sorteio (só 1× por número por grupo) |
| `!ajuda` | Lista de comandos |
| `!continuar` | Retoma a criação de personagem de onde parou |

## Personagem
| Comando | Efeito |
|---------|--------|
| `!ficha` | Envia a carta do personagem (imagem) |
| `!status` | HP/MP/Vigor/região em texto curto |
| `!vigor` | Vigor atual e quando enche |
| `!pistas` | Diário de pistas (privado); `!pistas compartilhar @x` |
| `!inventario` | Itens, grimórios, materiais |
| `!equipar <item>` | Equipa arma/armadura/grimório |
| `!distribuir <atributo> <pontos>` | Só quando houver pontos livres (a cada 10 níveis) |
| `!pet` | Carta do pet (se tiver) · `!pet nome` · `!pet carinho` · `!pet alimentar` (doc 23) |
| `!contar` | Publica no grupo uma cena pessoal que aconteceu no privado |
| `!ranking` | Ranking público (nível, Mérito, vilões únicos) |
| `!aparencia <números>` | Só durante a criação: monta o avatar (doc 21.3) e mostra a prévia; `!aparencia confirmar` trava |
| `!avatar` | Envia o avatar em pixel art |
| `!diario` | Seus feitos registrados |
| `!merito` | Mérito e títulos |

## Mundo
| Comando | Efeito |
|---------|--------|
| `!mapa` | Mapa do mundo em pixel art com você (vermelho) e sua party (azul) |
| `!mapa <reino>` | Mapa ampliado de um reino |
| `!viajar <região>` | Vai para região adjacente |
| `!rota <região>` | Mostra o caminho e o custo até uma região distante |
| `!cidade` | Menu da capital: estalagem, loja, forja, dōjō, missões, templo, taverna |
| `!explorar` | Explora a região (encontros, segredos, subfases) |
| `!subfases` | Subfases descobertas na região |
| `!entrar <subfase>` | Entra numa subfase (solo ou com a party) |
| `!sair-subfase` | Sai e guarda o progresso por 24 h |
| `!entrar-batalha` | Entra numa batalha da sua party já em andamento (na retaguarda) |
| `!loja` / `!comprar` / `!vender` | Comércio nas capitais |
| `!forja <item>` | Cria/melhora equipamento |
| `!leilao` | Leilão de Kyōkai (semanal) |

## Grupo
| Comando | Efeito |
|---------|--------|
| `!party criar` / `!party convidar @x` / `!party sair` | Grupo de até 5 |
| `!trocar @x <item> por <item>` | Troca com confirmação dupla |
| `!acordo @x <texto>` | Registra um acordo (quebrar = −Mérito) |
| `!duelo @x [aposta]` / `!aceitar` / `!recusar` | PvP |
| `!entregar @x <item>` | Entrega voluntária (inclusive lendários) |

## Combate
| Comando | Efeito |
|---------|--------|
| `!atacar [alvo]` | Ataque básico |
| `!magia <nome> [alvo]` | Magia de grimório |
| `!habilidade <nome>` | Habilidade de classe / amuleto |
| `!item <nome>` | Usa consumível |
| `!defender` | −50% dano recebido no turno |
| `!fugir` | Tenta fugir (não funciona contra chefes) |
| `> eu salto do telhado e corto a corda do lustre` | Ação livre: a IA interpreta e o motor resolve |

## Especiais
| Comando | Efeito |
|---------|--------|
| `!amuleto <descrição da habilidade>` | Usa o Amuleto da Perdição (1× no jogo, irreversível após confirmar) |
| `!despertar` | Só aparece quando o motor libera |

## História, segredos e manipulação (no chat privado com o bot)
| Comando | Efeito |
|---------|--------|
| `!ficha` (no privado) | Ficha completa com Corrupção, pactos ativos e segredos |
| `!pacto aceitar` / `!pacto recusar` | Responde a uma oferta de Kanata |
| `!trair` / `!resistir` | Quando o motor perguntar durante uma batalha (só jogadores com pacto de Traição ou Eclipsados) |
| `!revelar-sussurro` | Mostra ao grupo o último sussurro recebido (Corrupção −5) |
| `!contrato-yoru <texto>` | Propõe um contrato a Kanata — ele é obrigado a cumprir o texto literal se assinar |
| `!ler-diario` | Lê um trecho do Diário de Sayo (em cena com Kanata: +1 Dúvida) |
| `!relogio` | Mostra o Relógio do Eclipse do mundo (também funciona no grupo) |
| `!nucleos` | Estado dos 4 núcleos (também no grupo) |

## Admin do grupo
`/ativar-mundo <nome>` · `/pausar-narrador` · `/retomar` · `/forcar-marco <id>` · `/desfazer-ultimo-evento` ·
`/resetar-jogador @x` · `/migrar-jogador @antigo @novo` · `/evento <fato_id>` · `/backup`
