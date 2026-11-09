# 10 — Templates de Imagem

Duas camadas de imagem:

1. **Avatar (retrato)** — pixel art montada pelo **criador de avatares procedural** a partir de um DNA (doc 21). Sem IA: instantâneo, gratuito e sempre igual para o mesmo DNA.
2. **Carta** — template HTML fixo (`templates/*.html`) onde o motor injeta dados + retrato e tira um
   screenshot PNG de 800×1120 para enviar no WhatsApp.

Avatar e carta são baratos e instantâneos: a carta é regenerada sempre que os atributos mudam (`!ficha`).

| Exemplo de carta de personagem | Exemplo de carta de vilão |
|:---:|:---:|
| ![personagem](../templates/exemplos/personagem-exemplo.png) | ![vilão](../templates/exemplos/vilao-V090.png) |

Exemplos de todos os tiers em `templates/exemplos/` (gerados com `node scripts/render-cartas.mjs`).
Sem retrato, o template usa um placeholder com o kanji do elemento.

## 10.1 Carta de Personagem (`templates/carta-personagem.html`)

| Elemento visual | Fonte do dado |
|-----------------|---------------|
| **Moldura** (cor) | Rank: E ferro · D bronze · C prata · B ouro · A platina · S obsidiana · SS arco-íris |
| **Medalhão** (canto) | Letra do rank |
| **Kanji do reino** + aldeia | `reino`, `aldeia` |
| **Cor de fundo/aura** | Elemento do atributo mágico |
| **Retrato** | `retrato_url` (IA) ou placeholder |
| **Título + Nome** | Título vem de mérito/feitos (ex.: "Aprendiz das Cinzas", "Matador de Dragões") |
| **Tags** | Atributo mágico · classe · casta · pet/elegibilidade |
| **Barras** | HP, MP (ou Vazio para anti-magia), XP |
| **Mana** | Fluxo, Pureza, Controle |
| **Atributos** | FOR, DEF, MAG, RES, VEL, SOR |
| **Equipamento** | Arma, grimório, relíquia (borda brilhante se for item lendário) |
| **Rodapé** | Mérito e nome do mundo (grupo) |

## 10.2 Carta de Vilão (`templates/carta-vilao.html`)

Recebe diretamente um objeto de `data/viloes.json`.

| Tier | Cor da moldura | Estrelas |
|------|----------------|:---:|
| Comum | Cinza-prata | ★☆☆☆☆ |
| Médio escalão | Verde-jade | ★★☆☆☆ |
| Alto escalão | Azul-safira | ★★★☆☆ |
| Nível rei | Roxo-ametista | ★★★★☆ |
| Divindade | Ouro | ★★★★★ |

Mostra: faixa do tier, ID e nível, poder total, nome e título, elemento/arquétipo/região, HP/MP/FOR/DEF/MAG/RES/VEL,
habilidade, fraqueza, descrição e recompensa (XP, ouro, chance de Amuleto).

> **Máscara pública (anti-spoiler):** vilões ligados a segredos da história (Kanata, o Leiloeiro, Tōya, os reis
> antigos, Nisteroy, o Rei do Eclipse) têm um campo `mascara` em `data/viloes.json`. Até o marco `revela_em` ser
> concluído no mundo, a carta mostra o nome/título/descrição públicos e esconde habilidade e fraqueza
> (exemplos: `templates/exemplos/vilao-V091-mascara.png` e `vilao-V100-mascara.png`).

> Ao **encontrar** um vilão pela primeira vez, o jogador vê a carta com atributos ocultos (`???`) — só a
> magia *Ler o Inimigo* (G10), o pet Hakutaku ou derrotá-lo uma vez revelam os números. (Flag `oculto` no render.)

## 10.3 Retratos

Os retratos são **avatares em pixel art** gerados pelo criador procedural (`src/avatar/`), descrito no
[doc 21](21-criador-de-avatares-e-mapas.md). A direção de arte (paletas, formas, escala por tier) está no
[doc 20](20-direcao-de-arte.md). Nas cartas, o retrato usa `image-rendering: pixelated` para os pixels ficarem nítidos.

## 10.4 Outras imagens planejadas

| Imagem | Quando | Como |
|--------|--------|------|
| Mapa com posição | `!mapa` | SVG base do continente + marcador do jogador e da party |
| Carta de Item Lendário | Ao obter um dos 4 Grandes Itens | Template dourado especial com anúncio no grupo |
| Carta de Pet | `!pet` | Template menor, cor do elemento, estágio |
| Tela de Batalha | Início de batalha | Composição: cartas mini dos jogadores × vilões |
| Tela de Vitória / Level up | Fim de batalha | Banner com XP ganho, drops |
| Cerimônia do Sorteio | Entrada | 4 cartas-estrela reveladas em sequência |
