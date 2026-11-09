# 04 — Entrada no mundo e sorteio inicial

## 4.1 Fluxo "entrar no mundo"

1. O grupo precisa estar **ativado** como mundo (`/ativar-mundo` por um admin).
2. Jogador envia no grupo: **`entrar no mundo`** (aceita variações: "entrar no mundo", "entrar", "!entrar").
3. O motor verifica: o número já tem personagem neste mundo? → responde com a ficha existente.
4. O bot pede o **nome do personagem** (resposta em até 5 min; nomes ofensivos/duplicados são recusados).
5. **Cerimônia do Sorteio** — o bot envia 4 mensagens em sequência com suspense (2–3 s entre elas):

```
🌌 As Quatro Estrelas giram sobre você, KAITO...

⭐ 1ª Estrela — ORIGEM
   Você nasceu na aldeia de *Haibara*, no reino de 焔 Homura-koku.
   Casta: 🧑‍🌾 CAMPONÊS

⭐ 2ª Estrela — MANA
   Atributo mágico: 🔥 Fogo — variante *Cinzas*
   Reservatório: 54 MP

⭐ 3ª Estrela — ESPÍRITO
   ✨ Você é ELEGÍVEL a um Pet Espiritual.
   (Ele não vem até você. Você terá que encontrá-lo.)

⭐ 4ª Estrela — CAMINHO
   Escolha sua classe respondendo com o número:
   1. Espadachim   2. Força da Natureza   3. Cavaleiro   4. Meio-humano
```

6. Jogador escolhe a classe (entre as **permitidas pela sua casta**, ver 4.5).
7. O motor gera os atributos, o **retrato** (IA de imagem com prompt montado das escolhas) e
   envia a **Carta de Personagem** (PNG).
8. A narração de abertura (IA) apresenta a aldeia e o primeiro gancho da história.

**Nada disso pode ser re-rolado.** Existe só um comando de reset, exclusivo do admin
(`/resetar-jogador @numero`), registrado em log.

## 4.2 Sorteio 1 — Aldeia e casta

Primeiro sorteia a **casta**, depois uma aldeia daquela casta (o reino vem da aldeia).

| Casta | Chance | Mana | Descrição |
|-------|:---:|------|-----------|
| 🧑‍🌾 Camponês | 32% | Baixa | Vilas rurais, mineração, pesca. Crescem rápido (+20% XP) |
| 🧑 Plebeu | 28% | Média | Cidades e vilas comerciais |
| 🛡️ Cavaleiro | 16% | Mana + atributos físicos | Vilas-fortaleza, ordens militares |
| 👑 Realeza | 12% | Alta | Cortes e cidades nobres |
| ❓ Indefinido | 10% | Qualquer (0 – 250) | Órfãos, nômades, gente sem registro, vilas que "não existem" |
| 🔱 Rei | 2% | **Única** | Linhagem real oculta. Máx. 1 por reino por mundo |

**Sorte de pity (anti-frustração)**: não há re-roll, mas se um mundo tem 10+ jogadores e
nenhum Rei, a chance de Rei para o próximo sobe +1% por jogador (até 8%).

## 4.3 As 24 aldeias (6 por reino)

| Reino | Camponês | Plebeu | Cavaleiro | Realeza | Indefinido | Rei |
|-------|----------|--------|-----------|---------|-----------|-----|
| 焔 **Homura** | **Haibara** (灰原) — vila de mineiros de obsidiana nas cinzas | **Hibashira** (火柱) — cidade-mercado ao redor de um pilar de fogo | **Enjō** (炎城) — vila-quartel aos pés do vulcão | **Kurenai** (紅) — distrito nobre de jardins de lava | **Kagerō** (陽炎) — vila que aparece e some como miragem no deserto | **Ryūketsu** (竜血) — câmara secreta da linhagem do dragão |
| 水 **Watatsumi** | **Amiya** (網屋) — vila de pescadores em palafitas | **Minato** (港) — porto movimentado | **Kaigarajō** (貝殻城) — fortaleza de conchas da guarda marinha | **Shinju** (真珠) — ilha nobre das pérolas | **Kirigakure** (霧隠) — vila escondida na névoa, ninguém lembra de ter ido lá | **Ryūjin-no-Ma** (竜神の間) — salão abissal dos herdeiros do mar |
| 土 **Daichi** | **Mugibatake** (麦畑) — vila do trigo nas Planícies Kogane | **Kanayama** (金山) — cidade dos ferreiros | **Ishigaki** (石垣) — vila-muralha dos guardiões | **Kōgyoku** (鋼玉) — cidadela de cristal dos clãs nobres | **Kodama-mura** (木霊村) — vila dentro de uma árvore; alguns moradores não são humanos | **Iwane** (岩根) — raiz da montanha, berço dos reis da terra |
| 風 **Fūjin** | **Susukino** (薄野) — acampamento de pastores da estepe | **Kazamachi** (風待) — cidade dos mensageiros | **Tsubasa** (翼) — ninho dos cavaleiros-grifo | **Hagoromo** (羽衣) — mansões flutuantes | **Mayoi** (迷い) — vila nômade que vive dentro de um redemoinho | **Sora-no-Za** (空の座) — assento do céu, onde o vento escolhe reis |

> Indefinidos têm 15% de chance de vir de **Kyōkai** (Terra Central) em vez de um reino — sem afinidade de reino.

## 4.4 Sorteio 2 — Atributo mágico

**Passo A — base elemental**: 70% elemento do reino da aldeia; 30% outro elemento base aleatório.

**Passo B — variante ou raro** (rolagem d1000):

| Resultado | Chance | Pool |
|-----------|:---:|------|
| Variante comum | 75% | Fogo: Chama, Cinzas, Brasas · Água: Correnteza, Névoa, Chuva · Terra: Rocha, Areia, Lama · Vento: Brisa, Rajada, Corte |
| Variante incomum | 17% | Fogo: Lava, Explosão · Água: Gelo, Cura · Terra: Metal, Cristal, Madeira · Vento: Raio, Som |
| Raro | 6% | Luz, Trevas, Natureza, Gravidade, Sangue, Veneno |
| Muito raro | 1,7% | Tempo, Espaço, Alma, Sonho |
| Lendário | 0,3% | **Vazio** (só Indefinido/anti-magia), **Estelar** (só Rei/Realeza) |

Modificadores por casta: Realeza ×1,5 chance em raro+; Rei ×3; Camponês ×0,8; Indefinido ×2 (mas pode tirar 0 de mana).

**Regra especial — 0 de mana**: um Indefinido que rolar mana < 15 (≈ 8% dos Indefinidos)
não tem mana alguma → atributo vira **Vazio** e a classe **Anti-magia** é desbloqueada.

## 4.5 Sorteio 3 — Pet Espiritual (elegibilidade)

| Casta | Chance de ser elegível |
|-------|:---:|
| Camponês | 22% |
| Plebeu | 20% |
| Cavaleiro | 25% (pets montaria têm +chance) |
| Realeza | 35% |
| Indefinido | 30% |
| Rei | 100% |

Elegível **não** recebe o pet de imediato. Ganha o status `elegivel_pet = true` e um
**Sinal do Espírito** que leva a um dos 4 **Santuários dos Espíritos** (um por reino):
Cachoeiras Taki-no-Koe (Água), Floresta Kodama (Terra), Monte Hinokami (Fogo), Picos Tengu (Vento).
Lá passa por uma provação; o pet escolhido depende do elemento do jogador + rolagem.
Não-elegíveis **nunca** terão pet (exceto um evento de história definido pelo autor).

Pets em `data/pets.json`: evoluem em 3 estágios (Filhote → Desperto → Ascendido) por vitórias em batalha juntos.

## 4.6 Sorteio 4 — Classe (escolha restrita)

O jogador escolhe, mas só entre as classes que a casta permite:

| Classe | Camponês | Plebeu | Cavaleiro | Realeza | Indefinido | Rei |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|
| Mago | — | ✔ | — | ✔ | ✔ | ✔ |
| Cavaleiro | ✔ | ✔ | ✔ | ✔ | — | ✔ |
| Bruxo | — | ✔ | — | ✔ | ✔ | — |
| Anti-magia | — | — | — | — | **só com 0 mana** | — |
| Espadachim | ✔ | ✔ | ✔ | — | ✔ | ✔ |
| Meio-humano | ✔ | — | — | — | ✔ | — |
| Força da Natureza | ✔ | ✔ | — | — | ✔ | ✔ |
| Demônio | — | — | — | — | ✔ (rolagem 1/4) | — |
| Paladino | — | — | ✔ | ✔ | — | ✔ |

- **Demônio**: Indefinido tem 25% de chance de "sangue demoníaco"; só então aparece a opção.
- **Meio-humano**: o tipo animal é sorteado (raposa, lobo, tigre, corvo, serpente, coelho, dragão-menor 2%).
- Se a casta só permitir uma classe por causa de regras especiais, ela é atribuída diretamente.

## 4.7 Geração dos atributos iniciais

```
atributo_final = base_da_classe + bônus_casta + bônus_reino_nativo + rolagem(−2..+2)
MP máx         = rolagem da casta × multiplicador_classe
HP máx         = 100 + 10 × DEF + bônus_casta
```
Tudo é gravado em `eventos_atributo` com `fonte = "sorteio_inicial"`.
