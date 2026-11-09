# 22b — Balanceamento (gerado por `scripts/simular-progressao.mjs`)

> Não edite à mão. Mude as regras no script e rode de novo.
> **Golpes p/ vencer** = ataques básicos de 1 jogador para derrubar o vilão (sem habilidades, sem crítico).
> **Party 4** = rodadas para uma party de 4 jogadores iguais vencer usando habilidades (×1,6 de média), com o HP do
> vilão escalado por `0,6 + 0,4 × 4 = 2,2` (regra do modo difícil, doc 19).
> **Golpes p/ cair** = ataques básicos do vilão para derrubar 1 jogador.

## Curva de XP

| Nível | XP para o próximo | XP acumulado | Dias de jogo (ritmo normal) |
|:---:|---:|---:|:---:|
| 1 | 50 | 0 | 0 |
| 5 | 559 | 851 | 1 |
| 10 | 1.581 | 5.552 | 4 |
| 15 | 2.905 | 15.998 | 7 |
| 20 | 4.472 | 33.567 | 11 |
| 30 | 8.216 | 94.514 | 19 |
| 40 | 12.649 | 196.099 | 29 |
| 50 | 17.678 | 344.756 | 40 |
| 60 | 23.238 | 546.137 | 52 |
| 70 | 29.283 | 805.334 | 64 |
| 80 | 35.777 | 1.127.032 | 77 |
| 90 | 42.691 | 1.515.579 | 90 |
| 100 | 50.000 | 1.975.061 | 104 |

**Ritmo normal** = por dia, 8 lutas de encontro + meia subfase + parte de um marco de história (~30–40 min de jogo
espalhados no dia). Jogadores mais ativos avançam mais rápido até o limite do Vigor (doc 22.4).
Campanha completa ≈ **106 dias** (~4 meses) para chegar ao nível 100.

## Espadachim

| Nv | HP | Atq principal | DEF | RES | Vilão | HP vilão | Golpes p/ vencer | Party 4 (rodadas) | Golpes p/ cair |
|:---:|---:|---:|---:|---:|---|---:|:---:|:---:|:---:|
| 1 | 112 | 14 FOR | 8 | 7 | comum | 80 | 3 | 1 | 8 |
| 5 | 157 | 32 FOR | 15 | 13 | comum | 160 | 3 | 1 | 6 |
| 10 | 217 | 57 FOR | 23 | 20 | comum | 260 | 2 | 1 | 6 |
| 15 | 286 | 79 FOR | 32 | 28 | comum | 360 | 2 | 1 | 6 |
| 15 | 286 | 79 FOR | 32 | 28 | medio | 935 | 6 | 2 | 5 |
| 20 | 359 | 103 FOR | 40 | 35 | comum | 460 | 2 | 1 | 5 |
| 20 | 359 | 103 FOR | 40 | 35 | medio | 1.195 | 5 | 2 | 5 |
| 30 | 525 | 150 FOR | 57 | 50 | medio | 1.715 | 5 | 2 | 5 |
| 40 | 717 | 196 FOR | 74 | 65 | medio | 2.235 | 5 | 2 | 5 |
| 40 | 717 | 196 FOR | 74 | 65 | alto | 4.300 | 10 | 4 | 4 |
| 50 | 933 | 243 FOR | 91 | 80 | medio | 2.755 | 5 | 2 | 5 |
| 50 | 933 | 243 FOR | 91 | 80 | alto | 5.300 | 10 | 4 | 4 |
| 60 | 1175 | 289 FOR | 108 | 94 | alto | 6.300 | 10 | 4 | 5 |
| 60 | 1175 | 289 FOR | 108 | 94 | rei | 15.120 | 26 | 9 | 4 |
| 70 | 1441 | 336 FOR | 125 | 109 | alto | 7.300 | 10 | 4 | 5 |
| 70 | 1441 | 336 FOR | 125 | 109 | rei | 17.520 | 25 | 9 | 4 |
| 80 | 1733 | 382 FOR | 142 | 124 | alto | 8.300 | 10 | 4 | 5 |
| 80 | 1733 | 382 FOR | 142 | 124 | rei | 19.920 | 25 | 9 | 4 |
| 90 | 2049 | 429 FOR | 159 | 139 | rei | 22.320 | 25 | 9 | 5 |
| 90 | 2049 | 429 FOR | 159 | 139 | divindade | 44.640 | 55 | 19 | 4 |
| 100 | 2391 | 475 FOR | 176 | 154 | rei | 24.720 | 25 | 9 | 5 |
| 100 | 2391 | 475 FOR | 176 | 154 | divindade | 49.440 | 55 | 19 | 4 |

## Mago

| Nv | HP | Atq principal | DEF | RES | Vilão | HP vilão | Golpes p/ vencer | Party 4 (rodadas) | Golpes p/ cair |
|:---:|---:|---:|---:|---:|---|---:|:---:|:---:|:---:|
| 1 | 92 | 15 MAG | 6 | 11 | comum | 80 | 3 | 1 | 6 |
| 5 | 135 | 33 MAG | 13 | 21 | comum | 160 | 3 | 1 | 5 |
| 10 | 193 | 58 MAG | 21 | 33 | comum | 260 | 2 | 1 | 5 |
| 15 | 259 | 80 MAG | 30 | 46 | comum | 360 | 2 | 1 | 5 |
| 15 | 259 | 80 MAG | 30 | 46 | medio | 935 | 6 | 2 | 4 |
| 20 | 329 | 104 MAG | 38 | 58 | comum | 460 | 2 | 1 | 5 |
| 20 | 329 | 104 MAG | 38 | 58 | medio | 1.195 | 5 | 2 | 4 |
| 30 | 491 | 151 MAG | 55 | 83 | medio | 1.715 | 5 | 2 | 5 |
| 40 | 677 | 197 MAG | 72 | 108 | medio | 2.235 | 5 | 2 | 5 |
| 40 | 677 | 197 MAG | 72 | 108 | alto | 4.300 | 10 | 4 | 4 |
| 50 | 889 | 244 MAG | 89 | 133 | medio | 2.755 | 5 | 2 | 5 |
| 50 | 889 | 244 MAG | 89 | 133 | alto | 5.300 | 10 | 4 | 4 |
| 60 | 1125 | 290 MAG | 106 | 157 | alto | 6.300 | 10 | 4 | 5 |
| 60 | 1125 | 290 MAG | 106 | 157 | rei | 15.120 | 25 | 9 | 4 |
| 70 | 1387 | 337 MAG | 123 | 182 | alto | 7.300 | 10 | 4 | 5 |
| 70 | 1387 | 337 MAG | 123 | 182 | rei | 17.520 | 25 | 9 | 4 |
| 80 | 1673 | 383 MAG | 140 | 207 | alto | 8.300 | 10 | 4 | 5 |
| 80 | 1673 | 383 MAG | 140 | 207 | rei | 19.920 | 25 | 9 | 4 |
| 90 | 1985 | 430 MAG | 157 | 232 | rei | 22.320 | 25 | 9 | 4 |
| 90 | 1985 | 430 MAG | 157 | 232 | divindade | 44.640 | 55 | 19 | 3 |
| 100 | 2321 | 476 MAG | 174 | 257 | rei | 24.720 | 25 | 9 | 5 |
| 100 | 2321 | 476 MAG | 174 | 257 | divindade | 49.440 | 55 | 19 | 4 |

## Cavaleiro

| Nv | HP | Atq principal | DEF | RES | Vilão | HP vilão | Golpes p/ vencer | Party 4 (rodadas) | Golpes p/ cair |
|:---:|---:|---:|---:|---:|---|---:|:---:|:---:|:---:|
| 1 | 142 | 13 FOR | 14 | 8 | comum | 80 | 3 | 1 | 11 |
| 5 | 196 | 27 FOR | 29 | 14 | comum | 160 | 3 | 1 | 9 |
| 10 | 279 | 47 FOR | 47 | 21 | comum | 260 | 3 | 1 | 8 |
| 15 | 383 | 64 FOR | 66 | 29 | comum | 360 | 3 | 1 | 9 |
| 15 | 383 | 64 FOR | 66 | 29 | medio | 935 | 7 | 3 | 7 |
| 20 | 503 | 83 FOR | 84 | 36 | comum | 460 | 3 | 1 | 9 |
| 20 | 503 | 83 FOR | 84 | 36 | medio | 1.195 | 7 | 3 | 7 |
| 30 | 802 | 120 FOR | 121 | 51 | medio | 1.715 | 7 | 3 | 8 |
| 40 | 1176 | 156 FOR | 158 | 66 | medio | 2.235 | 7 | 3 | 9 |
| 40 | 1176 | 156 FOR | 158 | 66 | alto | 4.300 | 13 | 5 | 8 |
| 50 | 1625 | 193 FOR | 195 | 81 | medio | 2.755 | 7 | 3 | 11 |
| 50 | 1625 | 193 FOR | 195 | 81 | alto | 5.300 | 13 | 5 | 9 |
| 60 | 2149 | 229 FOR | 232 | 95 | alto | 6.300 | 13 | 5 | 10 |
| 60 | 2149 | 229 FOR | 232 | 95 | rei | 15.120 | 32 | 11 | 8 |
| 70 | 2748 | 266 FOR | 269 | 110 | alto | 7.300 | 13 | 5 | 11 |
| 70 | 2748 | 266 FOR | 269 | 110 | rei | 17.520 | 32 | 11 | 9 |
| 80 | 3422 | 302 FOR | 306 | 125 | alto | 8.300 | 13 | 5 | 12 |
| 80 | 3422 | 302 FOR | 306 | 125 | rei | 19.920 | 32 | 11 | 10 |
| 90 | 4171 | 339 FOR | 343 | 140 | rei | 22.320 | 32 | 11 | 10 |
| 90 | 4171 | 339 FOR | 343 | 140 | divindade | 44.640 | 70 | 24 | 8 |
| 100 | 4995 | 375 FOR | 380 | 155 | rei | 24.720 | 32 | 11 | 11 |
| 100 | 4995 | 375 FOR | 380 | 155 | divindade | 49.440 | 70 | 24 | 9 |

## Anti-magia

| Nv | HP | Atq principal | DEF | RES | Vilão | HP vilão | Golpes p/ vencer | Party 4 (rodadas) | Golpes p/ cair |
|:---:|---:|---:|---:|---:|---|---:|:---:|:---:|:---:|
| 1 | 122 | 14 FOR | 10 | 16 | comum | 80 | 3 | 1 | 9 |
| 5 | 170 | 32 FOR | 21 | 30 | comum | 160 | 3 | 1 | 7 |
| 10 | 240 | 57 FOR | 34 | 47 | comum | 260 | 2 | 1 | 7 |
| 15 | 324 | 79 FOR | 48 | 65 | comum | 360 | 2 | 1 | 7 |
| 15 | 324 | 79 FOR | 48 | 65 | medio | 935 | 6 | 2 | 6 |
| 20 | 419 | 103 FOR | 61 | 82 | comum | 460 | 2 | 1 | 7 |
| 20 | 419 | 103 FOR | 61 | 82 | medio | 1.195 | 5 | 2 | 6 |
| 30 | 648 | 150 FOR | 88 | 117 | medio | 1.715 | 5 | 2 | 7 |
| 40 | 927 | 196 FOR | 115 | 152 | medio | 2.235 | 5 | 2 | 7 |
| 40 | 927 | 196 FOR | 115 | 152 | alto | 4.300 | 10 | 4 | 6 |
| 50 | 1256 | 243 FOR | 142 | 187 | medio | 2.755 | 5 | 2 | 8 |
| 50 | 1256 | 243 FOR | 142 | 187 | alto | 5.300 | 10 | 4 | 7 |
| 60 | 1635 | 289 FOR | 169 | 221 | alto | 6.300 | 10 | 4 | 7 |
| 60 | 1635 | 289 FOR | 169 | 221 | rei | 15.120 | 26 | 9 | 6 |
| 70 | 2064 | 336 FOR | 196 | 256 | alto | 7.300 | 10 | 4 | 8 |
| 70 | 2064 | 336 FOR | 196 | 256 | rei | 17.520 | 25 | 9 | 6 |
| 80 | 2543 | 382 FOR | 223 | 291 | alto | 8.300 | 10 | 4 | 9 |
| 80 | 2543 | 382 FOR | 223 | 291 | rei | 19.920 | 25 | 9 | 7 |
| 90 | 3072 | 429 FOR | 250 | 326 | rei | 22.320 | 25 | 9 | 8 |
| 90 | 3072 | 429 FOR | 250 | 326 | divindade | 44.640 | 55 | 19 | 6 |
| 100 | 3651 | 475 FOR | 277 | 361 | rei | 24.720 | 25 | 9 | 8 |
| 100 | 3651 | 475 FOR | 277 | 361 | divindade | 49.440 | 55 | 19 | 6 |

## Leitura (metas de design)

| Situação | Meta | Por quê |
|----------|------|---------|
| Vilão comum, solo | 3–6 golpes para vencer, 5–10 para cair | Luta rápida (2–4 mensagens), mas com risco real se o jogador ignorar a cura |
| Médio escalão, solo | 5–8 golpes; o jogador cai em 4–8 | Exige habilidades e itens; a party é recomendada |
| Alto escalão, party de 4 | 4–7 rodadas | Uma luta de chefe dura ~10–15 min no grupo |
| Nível rei, party de 4 | 8–14 rodadas, com fases | O evento da semana; precisa de Postura quebrada e combos |
| Divindade, party de 4–5 | 12–20 rodadas | Clímax do Ato IV; só vence quem usa estratégia |

Se uma linha sair muito fora da meta, ajuste `EQUIP`, `MAESTRIA` ou os multiplicadores de tier e rode de novo.
