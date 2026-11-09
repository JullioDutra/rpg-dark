# 25 — Combate Individual (lutas solo, em detalhe)

Lutas solo acontecem **no privado** (encontros, provações, duelos de história, Duelo Eterno, flashbacks). Sem a pressa
de esperar os outros, elas podem ser **mais profundas**: leitura do inimigo, distância, Fluxo, Defesa Perfeita,
Momento Decisivo, rendição. As fórmulas base são as do doc 08/22 (`scripts/balanceamento.mjs`).

---

## 25.1 Antes da luta: Abordagem

Se o jogador **viu o inimigo primeiro** (exploração normal, sem emboscada), escolhe a abordagem:

| Abordagem | Efeito | Risco |
|-----------|--------|-------|
| ⚔️ **Ofensiva** | +10% dano nas 2 primeiras rodadas | −10% DEF nas mesmas rodadas |
| 🛡️ **Cautelosa** | Começa lendo o inimigo (intenção revelada por completo na 1ª rodada) | O inimigo age primeiro na rodada 1 |
| 🥷 **Furtiva** (teste VEL vs percepção) | Sucesso: ataque surpresa com crítico garantido | Falha: emboscada invertida (o inimigo ganha +1 ação) |
| 🗣️ **Conversar** | Humanoides podem negociar, mentir ou se render sem luta | Bestas atacam; perde a iniciativa |
| 🏃 **Evitar** | Sai sem lutar (gasta o Vigor da exploração) | Inimigos rápidos (VEL maior) perseguem 40% |

Emboscada: sem abordagem — o inimigo age primeiro e a 1ª rodada não tem leitura.

## 25.2 O painel solo

```
⚔️ RODADA 2 · Kaito vs Ōgama, o Campeão Invicto        🏟️ Coliseu de Brasas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👹 Ōgama   ▰▰▰▰▰▰▰▱▱▱ 860/1150   🛡️ Postura ▰▰▰▰▱
   👁️ Intenção: ergue o Martelo-Sol acima da cabeça… (GOLPE PESADO)
📏 Distância: CURTA
🧍 Kaito   ▰▰▰▰▰▰▰▰▰▱ 254/271   MP 34/45   🌊 Fluxo ●●○○○
🌍 Cenário: 🪨 pilar rachado · 🔥 braseiro · 🏳️ estandarte pendurado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
a ataque · h1 Iaijutsu (5 MP) · m1 Corte Flamejante (6 MP) · d defender
i item · t recuar/avançar · > ação livre
```

Elementos do painel:
- **Intenção** do inimigo (a próxima ação, telegrafada). Quão clara ela aparece depende de **VEL e Maestria**:
  jogador mais lento vê "ele se prepara…"; mais rápido vê "GOLPE PESADO em você, linha reta".
- **Distância** (curta / média / longa).
- **Fluxo** do jogador (0–5).
- **Cenário**: 2–3 elementos do lugar que **ações livres** podem usar (definidos pela região; a IA escolhe).

## 25.3 Distância

| Distância | Corpo a corpo | Magia / à distância | Como muda |
|-----------|---------------|---------------------|-----------|
| **Curta** | Normal | −10% (magos no meio da briga) | `t` recua para média |
| **Média** | −30% (precisa avançar) | Normal | `t` avança (curta) ou recua (longa) |
| **Longa** | Impossível | +10% (magos) | Só magia, itens, ação livre |

Inimigos têm preferência (brutos e bestas avançam; magos e invocadores recuam). Mudar de distância **gasta a ação**,
exceto para o Espadachim (Iaijutsu já fecha a distância) e o Meio-humano (salto).

## 25.4 Fluxo (o combo do solo)

- **+1 Fluxo** cada vez que o jogador faz uma ação **diferente** da anterior que deu certo (acerto, cura, defesa útil).
- **Repetir a mesma ação** zera o Fluxo. Isso premia variedade em vez de `a a a a`.
- Com **3 de Fluxo**, a próxima habilidade custa 0 de MP. Com **5**, libera a **Técnica de Fluxo** da classe
  (Espadachim: *Corte do Horizonte*, 3 golpes de 80%; Mago: *Ressonância*, magia ×2; Cavaleiro: *Contra-muralha*; etc.).
  O Fluxo é consumido ao usá-la.

## 25.5 Defesa Perfeita e contra-ataque

- Quando o inimigo **telegrafa** um golpe pesado e o jogador responde com `d` (ou uma ação livre de defesa coerente)
  **naquela rodada**: **Defesa Perfeita** → 0 de dano, **−2 Postura** do inimigo e **contra-ataque gratuito** (ataque básico).
- Se o jogador **atacar** em vez de defender, os dois golpes acontecem pela ordem de iniciativa (troca de golpes).
- Inimigos inteligentes **fintam**: 20% dos telegrafados de chefes são falsos (o painel mostra "…algo estranho no olhar
  dele" para quem tem VEL alta).

## 25.6 Resolução de uma ação, passo a passo

```
1. VALIDAÇÃO   A ação é possível? (MP, distância, item, estado: silêncio, preso…)
2. INICIATIVA  VEL + d20 de cada lado (empate: SOR). Telegrafados pesados agem POR ÚLTIMO.
3. ACERTO      Chance = 95% − esquiva do alvo (máx. 35%) − cegueira (50%) + bônus (Fluxo ≥ 3: +10%)
4. CRÍTICO     5% + SOR/4 (máx. 40%); furtividade = crítico garantido
5. DANO        base = ATQ × poder × 3 × K / (K + DEF)      K = 20 + 5 × nível do atacante
               × elemento (+25% / −20%) × crítico (1,75) × distância × Juiz de Táticas (0,6–1,8) × variação (0,9–1,1)
6. POSTURA     fraqueza −2 · crítico −1 · Defesa Perfeita −2 · nota ≥ 7 −2 → zerou = QUEBRA (perde a ação, +50% dano)
7. ESTADOS     aplica/decrementa (queimadura, veneno, preso…)
8. CONTADORES  Maestria (doc 22.9), Fluxo, Trajetória (doc 26), feitos
9. NARRAÇÃO    IA: 1 linha de ação + 1 de impacto + 1 de reação do inimigo (com fala, se for humanoide)
```

## 25.7 Momento Decisivo

**Uma vez por luta**, quando o jogador **ou** o inimigo cai abaixo de **25% de HP**, a luta "congela" e o bot oferece
**3 escolhas cinematográficas** com **30 s** de prazo (no privado):

```
⏳ MOMENTO DECISIVO — Ōgama cambaleia, o martelo rachado.
1) 🔥 Tudo ou nada: golpe final arriscado (dano ×2,5; se errar, você fica exposto)
2) 🛡️ Recuar e respirar: recupera 25% do HP, o inimigo recupera Postura
3) 🗣️ "Você já perdeu, campeão." — oferecer rendição (teste de SOR + sua trajetória)
⏱️ 30 s (sem resposta = 2)
```

- As opções variam com a **trajetória** (doc 26): um *Misericordioso* tem a opção de rendição mais fácil; um *Implacável*
  tem "Golpe de Execução"; um *Erudito* pode "lembrar a fraqueza do inimigo" (revela o elemento fraco se ainda for desconhecido).
- Quando é o **jogador** que está abaixo de 25%, as opções são de sobrevivência (último fôlego, fuga dramática, pedir ajuda ao pet).

## 25.8 Rendição, misericórdia e fuga do inimigo

- Humanoides **comuns e médios** podem se render abaixo de 15% de HP (chance pela personalidade).
- O jogador escolhe: **poupar** (+Mérito; conta para *Misericordioso*; o inimigo pode reaparecer como aliado ou informante)
  ou **finalizar** (conta para *Implacável*; drop extra de 10%).
- Bestas fogem abaixo de 20% (não chefes). Persegui-las custa 1 rodada extra e dá o drop completo.
- **Chefes nunca se rendem** — exceto os que a história permite (Hyōsuke, Kanata, Zero, Tōya).

## 25.9 Fim da luta solo

```
🏆 VITÓRIA — 6 rodadas
+1.050 XP · +336 両 · Martelo Rachado (material)
📈 Maestria: FOR 42/60 · VEL 18/40
🌊 Melhor Fluxo: 5 (Corte do Horizonte!)
✨ Feito desbloqueado: "Defesa Perfeita contra um Campeão" (+1 DEF)
🧭 Trajetória: Misericordioso 4/10
```
No grupo aparece só: "⚔️ **Kaito** venceu **Ōgama, o Campeão Invicto** em 6 rodadas." (e a imagem se for um chefe).

---

## 25.10 Exemplo completo (números reais do jogo)

**Kaito** — Espadachim nível 14 (Homura): HP 271 · MP 45 · FOR 73 · DEF 30 · VEL 52 · SOR 20 · Katana de Obsidiana.
**Ōgama** — Médio escalão nível 14 (V038): HP 1.150 · FOR 37 · DEF 31 · VEL 21 · *Martelo-Sol a cada 2 rodadas*.
K = 20 + 5×14 = **90**. Ataque básico de Kaito: 73 × 3 × 90/(90+31) ≈ **163**. Golpe de Ōgama: 37 × 3 × 90/(90+30) ≈ **83**;
Martelo-Sol (×2,2) ≈ **183** (dois terços da vida de Kaito).

| Rodada | Intenção mostrada | Kaito faz | Resolução | Resultado |
|:---:|-------------------|-----------|-----------|-----------|
| 0 | — | Abordagem **Cautelosa** | Ōgama age primeiro na 1ª rodada | — |
| 1 | "Avança com o ombro" (investida) | `d` | Ōgama: 83 → defendido 42. Kaito ganha leitura total | Kaito 229/271 · Fluxo 1 |
| 2 | **"Ergue o Martelo-Sol" (PESADO)** | `h1` Iaijutsu (ação **diferente**) | Iaijutsu age primeiro: 163 × 1,4 = 228 (variação 0,96 → **219**). Martelo acerta: **183** | Ōgama 931 · Kaito 46/271 😰 · Fluxo 2 |
| — | *Erro de Kaito:* atacou em vez de defender o golpe telegrafado. Agora está abaixo de 25% → **Momento Decisivo do jogador** | escolhe **2) Recuar e respirar** | +68 HP; Ōgama recupera 1 Postura | Kaito 114 |
| 3 | "Respira pesado, martelo baixo" (ataque leve) | `i pocao` | +30% HP (81) antes do golpe; leva 83 | Kaito 112 · Fluxo 3 |
| 4 | **"Ergue o Martelo-Sol"** | `d` (aprendeu) | **DEFESA PERFEITA**: 0 dano, Postura −2, contra-ataque 163 | Ōgama 768 · Postura 2/5 · Fluxo 4 |
| 5 | "Gira o martelo" (ataque em área) | `> rolo para trás do braseiro e chuto as brasas no rosto dele` | Juiz de Táticas: coerência 2, ambiente 2, fraqueza 1, cooperação 0, originalidade 2 = **7** → chute (poder 0,5 ≈ 80) ×1,5 = **120** + cego 1 rodada; Postura −2 → **QUEBRA** | Ōgama 648 · cego e atordoado · Fluxo 5 |
| 6 | (atordoado) | `h2` **Corte do Horizonte** (Fluxo 5) | 3 × 163 × 0,8 × 1,5 (quebra) ≈ **587** | Ōgama 61/1150 → **Momento Decisivo do inimigo** |
| — | — | **3) Oferecer rendição** | SOR + trajetória → sucesso | Ōgama se rende: "Você... venceu o campeão." |

Depois disso: Kaito poupa Ōgama (+15 Mérito, *Misericordioso* +1). No Ato II, Ōgama aparece no Torneio como aliado
e conta quem envenenou a bebida dele (pista de A2-HOM-1). **A luta foi difícil** — um erro na rodada 2 quase matou
Kaito — e **a estratégia venceu**: leitura, Defesa Perfeita, cenário, Fluxo e misericórdia.

---

## 25.11 Lutas solo especiais

| Tipo | Regra especial |
|------|----------------|
| **Duelo Eterno** (Kagerō, HOM-08) | 1×1 de 3 rodadas dentro da batalha de chefe; o resto da party só assiste/cura |
| **Provação do Santuário** (pets) | 1 combate + 2 desafios narrativos; não há morte, a derrota só adia 24 h |
| **Reflexo do Ontem** (V044) | O inimigo copia a sua ficha: vence quem fizer algo que o "eu de ontem" não faria (Juiz de Táticas recompensa ações inéditas) |
| **Flashbacks** (doc 26) | Você luta com a ficha do personagem histórico; cair desfaz a memória (sem morte real) |
| **Duelo PvP** | Rodada simultânea de 60 s; sem Momento Decisivo; termina em 1 HP |
| **Luta contra o próprio sussurro** | Jogador com Corrupção ≥ 75 enfrenta a sua sombra num sonho: ganhar reduz Corrupção em 20 |
