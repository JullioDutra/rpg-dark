# 34 — Mundo vivo, combate com dado, itens, feitos e auditoria

Continuação dos docs 32 e 33. Tudo aqui está implementado e coberto por testes (`npm run testar`).

## 34.1 O que o jogador vive agora

| Momento | O que acontece |
|---------|----------------|
| **Chegar numa região** | Imagem em pixel art do lugar principal, frase de chegada, lista numerada dos locais e o passo atual da história dali. Quem está só de passagem segue viagem: a história espera |
| **`ir <nº ou nome>`** | Imagem do local, quem está lá, o que dá para fazer (loja, descanso). Se houver um vilão no covil, ele aparece **com imagem**, descrição, nível e ponto fraco |
| **`falar <nome>`** | Conversa com o NPC (a IA interpreta o personagem com o jeito de falar e o que ele sabe; sem IA, usa o texto pronto). Cria amizade com o tempo; amigos dão presente |
| **`missao`** | O caminho da campanha em uma frase + o capítulo e o passo da região atual + contadores |
| **Luta** | Menu numerado com tudo o que o jogador pode fazer agora (atacar, defender, magia, habilidades da classe, itens, fugir). Cada ação rola um **d20** que define a força |
| **`itens`** | Bolsa numerada: o que cada item faz, quantos usos tem, o que está equipado e o bônus total |
| **Grupo** | Os feitos aparecem sozinhos: vilões derrotados (com impacto por nível), descobertas, capítulos, núcleos, itens lendários, ranks, lutos e vinganças, pets, duelos, o final |

## 34.2 Combate v2 (`src/regras/combate.mjs`)

- **Dado (d20 + bônus de Sorte, até +3):** 1 = falha · até 6 = de raspão (×0,7) · 7–14 = firme (×1) · 15–19 = forte (×1,3) · 20 = perfeito (×1,8).
  Defender também rola: bloqueia de 20% a 100% e devolve um pouco de mana. O inimigo rola o dado dele à vista do jogador.
- **Habilidades:** 4 por classe, liberadas nos níveis 1, 5, 12 e 25 (`habilidades` mostra as que tem e as que virão).
  Efeitos: proteção por rodadas, foco (+50% no próximo golpe), dano contínuo, prender, roubo de vida, cura, quebra de guarda, dobro contra certos inimigos.
- **Itens na luta:** poção de cura, poção de mana, elixir, bomba de fumaça (máx. 2 por luta).
- **Pet espiritual:** um ataque extra por rodada. **Juramento de vingança:** +15%. **Apoio do grupo:** +10% por apoio. **Bênçãos da campanha:** +5% por arco de reino.
- Elite e chefes enfrentados sozinhos têm vida e ataque reduzidos (`AJUSTE_SOLO`); simulações em `scripts` mostram comuns em ~95–100% de vitória no nível certo,
  elite 60–100%, chefes "alto" 50–100%, reis e divindades difíceis de propósito (pedem nível, itens, apoio e as classes certas).

## 34.3 Itens (`src/regras/itens.mjs`)

- **Consumíveis:** poção de cura, poção de mana, elixir estelar, bomba de fumaça, ração de viagem (vigor), bandagem (cura ferida), pergaminho de retorno (teleporta para a capital).
- **Equipamento por classe**, em 8 materiais (aprendiz → celeste, níveis 1/5/10/20/30/45/60/80): cada classe tem suas armas e armaduras
  (ex.: Espadachim usa katana e couraça leve; Mago usa cajado e manto). Acessórios servem para todos.
- **4 Grandes Itens** (Excalibur, Kokūgai, Tenmon no Tama, Shitenchō): só se conquistam nos capítulos lendários; 3 deles abrem o final Estelar.
- Comandos: `itens`, `equipar`, `desequipar`, `usar`, `loja`, `comprar <nº> [qtd]`, `vender <nº>`, `descansar`. Lojas completas nas capitais e em Kyōkai; simples nas vilas.

## 34.4 Mundo vivo (`src/mundo/`)

- **36 regiões, 106 locais, 47 NPCs, 54 capítulos, 100 vilões** — cada vilão num covil específico.
- **Imagens:** 23 tipos de cena (`src/cena/cena.mjs`) com a paleta de cada reino; a mesma semente sempre gera a mesma imagem.
- **Vilões caem uma vez por mundo.** O primeiro a derrotar derruba o vilão de verdade (manchete no grupo, XP ×1,5, mais espólio).
  Para quem vem depois, o Vazio devolve um **Eco** (a sombra dele, com 80% da vida): a história de cada jogador continua, mas o feito é de quem chegou primeiro.
- **Explorando** só aparecem **lacaios** (crias, capangas, sombras) no nível do jogador — é assim que se treina.
- **Destino:** covis de capítulos futuros ficam fechados até a história chegar lá (ninguém enfrenta o Rei do Eclipse no nível 5).

## 34.5 História e fluidez

- O **motor** avança os passos por ações concretas: `ir`, `falar`, `derrotar`. A **IA** recebe o capítulo e o passo atual com a regra de
  manter a cena ali até o jogador cumprir o passo; sem capítulo ativo, ela só narra uma cena de passagem. A IA só consegue puxar lacaios.
- **Campanha completa:** despertar (qualquer capítulo) → Selo da Guilda (uma capital) → Festival em Kyōkai → 4 arcos de reino (núcleos)
  → O Rosto de Yoru → Muralha dos Selos → Poço Seco → Ninho de Nisteroy → A Noite em Kyōkai (Kanata) → Cratera → Torre (reis antigos) → **Rei do Eclipse**.
- **Finais:** *Estelar* (3 dos 4 Grandes Itens e corrupção abaixo de 25) ou *do Selo*. O primeiro a vencer é coroado **Seiō**; os demais viram Guardiões das Estrelas.
- Cada capítulo entrega um **segredo do mundo** (`segredos` lista os descobertos), XP, ryō e, nos principais, bandeiras que abrem o próximo trecho.
- **NPCs:** amizade cresce com conversas (no máximo 1 ponto a cada 6 h). De vez em quando (12% ao voltar a uma região, no máximo uma vez por semana),
  um vilão ainda vivo dali mata um amigo. O jogador pode `vingar`: juramento (+15% contra o assassino) e anúncio no grupo quando cumprir.
  Se o NPC morto era necessário à história, um bilhete no túmulo entrega a informação (a campanha nunca trava).

## 34.6 Modos complementares (`src/servidor/extras.mjs`)

| Modo | Como funciona |
|------|---------------|
| **Pet espiritual** | Quem é elegível e conclui o capítulo de um santuário (Hinokami, Queda, Porta na Árvore, Mosteiro do Vento) é escolhido por um espírito. `pet`, `pet carinho`. Evolui com vitórias e vínculo (imagem nova, anúncio) |
| **Duelo amistoso** | No grupo: `duelo @pessoa` → `aceitar`. O motor resolve com dados e narra; ninguém se fere |
| **Apoio** | No grupo: `apoiar @pessoa` (1 por dia) → +10% de dano na próxima luta de covil do apoiado (até 3) |
| **Pactos de Kanata** | Depois do Festival, ao ser derrotado por um vilão o jogador pode ouvir uma oferta: `aceitar pacto` (+15% de dano, +25 de corrupção) ou `recusar pacto` (+mérito). `purificar` num templo desfaz |
| **Boatos** | `boatos`: os 20 contos, contados como rumores de cada região (XP na primeira vez) |
| **Ecos do passado** | `lembrar`: os 10 flashbacks, onde a história aconteceu (exige ter concluído um capítulo do lugar) |
| **Masmorras** | As 36 subfases viraram os covis dos locais: vilões em sequência, chefe no fim |

## 34.7 Auditoria: o que foi corrigido

1. **`resetar-jogador` não funcionava com menções em LID** → agora aceita menção, número digitado (com ou sem o 9) e nome do personagem; limpa batalhas e progresso.
2. Menções vinham em `data.contextInfo` em algumas versões da Evolution → lidas dos três lugares.
3. Frases como "falar sobre o mapa" abriam o mapa → comandos com verbo próprio têm prioridade.
4. Vilões com nome reapareciam em encontros aleatórios e podiam ser puxados pela IA → só lacaios; o vilão fica no covil.
5. "Equipamento-base" provisório → equipamento real por classe, com loja e espólios (sem repetir o que o jogador já tem).
6. Narrador sem trilho → recebe capítulo, passo, local e NPCs existentes.
7. Poções não tinham explicação nem contagem → `itens` mostra efeito e usos.
8. Evento de estrada único → 5 situações.

## 34.8 O que ainda falta ou merece atenção

- **Luta em grupo ao mesmo tempo** (rodadas com prazo no grupo) e **Chefe de Mundo**: dependem do relógio na VPS (`RELOGIO_URL` ainda não configurada). Hoje a cooperação é por apoio, duelo e feitos.
- **Facções, julgamento, furto e luta real entre jogadores** (doc 28): não implementados.
- **Encruzilhadas com votação** (doc 27) e crises com prazo real: não implementadas.
- **Conversas com NPC pela IA** não têm limite diário próprio (o narrador tem 80 cenas/dia). Vale acompanhar o consumo da Maritaca.
- **Balanceamento alto:** reis e divindades são muito duros para Mago, Bruxo, Espadachim e Demônio sozinhos. É intencional no modo difícil, mas precisa de teste com jogadores reais.
- **Segurança:** a Evolution está em `http://` (sem TLS) e as chaves que passaram pelo chat devem ser trocadas.
- Textos de luto usam "morta(o)": os NPCs não têm gênero marcado nos dados.
