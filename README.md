# 四星 YOTSUHOSHI — RPG de Anime no WhatsApp

> *"Quatro reinos. Quatro elementos. Um vazio no centro do mundo esperando para ser preenchido."*

RPG narrativo jogado em **grupos de WhatsApp**, com mundo temático estilo anime, narração e
continuidade de história gerida por IA (até o **final que o autor definir**), fichas e cartas
de personagem/vilão geradas como imagem, combate por turnos, itens lendários e 100 vilões.

Este repositório contém, nesta fase, o **planejamento completo (Game Design Document)** e os
**dados estruturados** do mundo. A próxima fase é o autor enviar a **história**, e ela será
estruturada em arcos/marcos jogáveis até o final (ver `docs/12-roteiro-da-historia.md`).

---

## Índice do planejamento

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Arquitetura técnica](docs/01-arquitetura-tecnica.md) | Bot de WhatsApp, banco, IA, imagens, segurança anti-trapaça |
| 02 | [O mundo e os 4 reinos](docs/02-mundo-e-reinos.md) | Continente, reinos (nomes em japonês), reis, natureza, mapa detalhado |
| 03 | [Sistema de mana](docs/03-sistema-de-mana.md) | Como a mana funciona: corpo, ambiente, elementos, castas, classes |
| 04 | [Entrada no mundo e sorteio](docs/04-entrada-e-sorteio.md) | "entrar no mundo", aldeias, castas, atributo mágico, pet espiritual |
| 05 | [Classes](docs/05-classes.md) | Mago, Cavaleiro, Bruxo, Anti-magia, Espadachim, Meio-humano, Força da Natureza, Demônio, Paladino |
| 06 | [Itens lendários e grimórios](docs/06-itens-lendarios.md) | Os 4 Grandes Itens, o Amuleto da Perdição, 40 grimórios simples |
| 06b | [Lista dos 40 grimórios](docs/06b-grimorios.md) | Gerado de `data/grimorios.json` |
| 07 | [Subfases e masmorras](docs/07-subfases.md) | 36 subfases com nível, chefes e drops (gerado) |
| 08 | [Progressão e combate](docs/08-progressao-e-combate.md) | Atributos, XP, níveis, ranks, mérito, fórmulas de batalha |
| 09 | [Os 100 vilões](docs/09-viloes.md) | Gerado de `data/viloes.json` (comum → divindade) |
| 10 | [Templates de imagem](docs/10-templates-de-imagem.md) | Cartas de personagem e vilão, prompts de arte |
| 11 | [Motor narrativo de IA](docs/11-motor-narrativo-ia.md) | Como a IA continua a história e chega ao final definido |
| 12 | [Roteiro da história (a preencher)](docs/12-roteiro-da-historia.md) | Formato para o autor enviar a história |
| 13 | [Comandos do jogador](docs/13-comandos.md) | Tudo que o jogador pode digitar no grupo |

## Dados estruturados (`data/`)

| Arquivo | Conteúdo |
|---------|----------|
| `data/reinos.json` | 4 reinos + Terra Central, reis, regiões |
| `data/aldeias.json` | 24 aldeias (6 por reino) com casta e peso de sorteio |
| `data/atributos-magicos.json` | Atributos mágicos sorteáveis e raridades |
| `data/classes.json` | 9 classes, atributos base, restrições |
| `data/pets.json` | Pets espirituais |
| `data/itens-lendarios.json` | 4 Grandes Itens + Amuleto da Perdição |
| `data/grimorios.json` | 40 grimórios simples |
| `data/subfases.json` | 36 subfases |
| `data/viloes.json` | 100 vilões com atributos e prompt de imagem |

## Templates (`templates/`)

- `templates/carta-personagem.html` — carta do jogador (renderizada para PNG e enviada no grupo)
- `templates/carta-vilao.html` — carta de vilão com tier, atributos e habilidade
- `scripts/render-cartas.mjs` — renderiza as cartas de exemplo com Playwright
- `scripts/viloes-fonte.mjs` — fonte editável dos 100 vilões (nome, tier, nível, arquétipo, habilidade…)
- `scripts/gerar-dados.mjs` — calcula atributos dos vilões, valida referências cruzadas e gera
  `data/viloes.json`, `docs/09-viloes.md`, `docs/06b-grimorios.md` e `docs/07-subfases.md`

```bash
node scripts/gerar-dados.mjs        # regenera dados/docs e valida tudo
node scripts/render-cartas.mjs      # gera exemplos de cartas em templates/exemplos/
```

## Números do mundo

| | |
|---|---|
| Reinos | 4 + Terra Central (虚空 Kokū) |
| Regiões | 34 (7 por reino + 6 centrais), cada uma com densidade de mana, perigo, recurso e segredo |
| Aldeias de origem | 24 (6 castas × 4 reinos) |
| Classes | 9 (+18 especializações no Rank B) |
| Atributos mágicos | 4 elementos × variantes + 12 raros/lendários |
| Pets espirituais | 20 |
| Itens lendários | 4 Grandes Itens + Amuleto da Perdição |
| Grimórios simples | 40 (ranks E → S) |
| Subfases | 36 |
| Vilões | 100 (35 comuns · 25 médio · 20 alto · 12 rei · 8 divindades) |
