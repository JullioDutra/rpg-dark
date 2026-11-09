# 13 — Comandos

Tudo é digitado no **grupo** do mundo. Comandos com `!` são processados pelo motor (rápidos, sem IA).
Texto livre começando com `>` (ou mencionando o bot) é uma **ação narrativa** interpretada pela IA.

## Entrada
| Comando | Efeito |
|---------|--------|
| `entrar no mundo` | Inicia a Cerimônia do Sorteio (só 1× por número por grupo) |
| `!ajuda` | Lista de comandos |

## Personagem
| Comando | Efeito |
|---------|--------|
| `!ficha` | Envia a carta do personagem (imagem) |
| `!status` | HP/MP/região em texto curto |
| `!inventario` | Itens, grimórios, materiais |
| `!equipar <item>` | Equipa arma/armadura/grimório |
| `!distribuir <atributo> <pontos>` | Só quando houver pontos livres (a cada 10 níveis) |
| `!pet` | Carta do pet (se tiver) |
| `!diario` | Seus feitos registrados |
| `!merito` | Mérito e títulos |

## Mundo
| Comando | Efeito |
|---------|--------|
| `!mapa` | Imagem do mapa com sua posição |
| `!viajar <região>` | Vai para região adjacente |
| `!explorar` | Explora a região (encontros, segredos, subfases) |
| `!subfases` | Subfases descobertas na região |
| `!entrar <subfase>` | Entra numa subfase (solo ou com a party) |
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

## Admin do grupo
`/ativar-mundo <nome>` · `/pausar-narrador` · `/retomar` · `/forcar-marco <id>` · `/desfazer-ultimo-evento` ·
`/resetar-jogador @x` · `/evento <fato_id>` · `/backup`
