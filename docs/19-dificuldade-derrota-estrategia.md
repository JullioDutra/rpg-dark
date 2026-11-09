# 19 — Dificuldade, Derrota, Morte e Estratégia

> **Dificuldade padrão: DIFÍCIL.** Os vilões **podem vencer** os jogadores. Decisões ruins têm consequências reais
> e permanentes. Estratégia e criatividade valem tanto quanto atributos.

## 19.1 Princípios

1. **O mundo não protege o jogador.** A IA não "salva" ninguém por pena. Se a decisão foi ruim, o resultado é ruim.
2. **Mas o perigo é sempre anunciado.** Antes de algo mortal, a IA **telegrafa** o risco na narração
   (*"o chão estala sob seus pés; você sente o calor de algo enorme respirando lá embaixo"*). Morrer sem aviso não é justo — morrer ignorando o aviso é.
3. **Inimigos pensam.** Vilões usam táticas (19.4), não só atacam em linha reta.
4. **Recursos são escassos.** Poções caras, cura entre batalhas só descansando (tempo real), dinheiro apertado no começo.
5. **A criatividade é recompensada mecanicamente** (19.5) — e a repetição é punida.

## 19.2 Ajustes de dificuldade (sobre o doc 08)

| Regra | Valor no modo Difícil |
|-------|----------------------|
| HP dos inimigos por tamanho da party | `HP × (0,6 + 0,4 × nº de jogadores)` |
| Recuperação fora de combate | 10% HP/MP por hora real (ou 100% descansando numa capital por 6h reais) |
| Poção de cura básica | 30% HP, custa 120 ryō (≈ 3 batalhas comuns de ouro) |
| Itens que um jogador pode usar por batalha | 2 |
| Fuga | Impossível contra chefes; contra comuns, custa o turno de todo o grupo se falhar |
| Nível dos encontros aleatórios | Nível médio da party + 0 a 3 |
| Emboscadas | 15% dos encontros em regiões de perigo alto (inimigos agem primeiro) |
| Recompensa de chefe | Só na 1ª vitória de cada jogador (sem farm infinito do mesmo chefe) |

## 19.3 Derrota e morte

### Estados

| Estado | Quando | Efeito |
|--------|--------|--------|
| **Caído** | HP chega a 0 na batalha | Fora da luta; aliados podem levantar (item/magia) com 20% HP |
| **Ferido** | Terminou a batalha caído (mesmo que o grupo vença) | Recebe 1 **Ferida**: −10% em um atributo aleatório até curar (24h reais de descanso ou curandeiro caro). Acumulam |
| **Derrota do grupo** | Todos caídos | Consequência decidida pelo **tipo de inimigo** (tabela abaixo) |
| **Marca da Morte** | Cada derrota de grupo em batalha de nível rei/divindade, ou em batalha marcada como mortal | +1 Marca. Some 1 Marca a cada 10 níveis subidos |
| **Morte Verdadeira** | Cair em uma **Batalha Mortal** tendo **3 Marcas da Morte** — ou por consequência direta de uma decisão mortal ignorando o aviso | O personagem **morre permanentemente** |

### Consequência da derrota do grupo (decidida pelo inimigo)

| Tipo de inimigo | O que acontece |
|-----------------|----------------|
| Bestas / animais | Arrastados para o ninho: acordam numa subfase de fuga com 10% HP |
| Bandidos / mercenários | Roubados: perdem 30% do ouro e 1 item não equipado aleatório |
| Arautos / Kanata | **Capturados**: presos numa subfase-prisão; precisam escapar ou ser resgatados por outros jogadores (evento de grupo). Kanata aproveita para sussurrar |
| Mortos-vivos / Yomi | Acordam no Rio dos Mortos: precisam vencer a Barqueira ou pagar com 1 Marca da Morte |
| Ressurgidos / divindades | **Batalha Mortal** — ver Marcas |
| Crises de tempo real | Não há derrota individual: a crise falha e o mundo sofre (aldeia destruída, NPC morto, Relógio do Eclipse sobe) |

### Batalhas Mortais

- Marcadas com **⚠️ BATALHA MORTAL** antes de começar. O jogador pode **recusar** entrar (se for possível na história).
- São mortais: chefes de nível rei e divindade, o final de cada arco de reino, o Ato IV inteiro e qualquer luta que a IA
  marque como consequência de uma decisão claramente suicida (sempre com aviso).

### Depois da Morte Verdadeira

1. O bot publica a **Carta Memorial** do personagem no grupo (moldura negra, feitos registrados).
2. O personagem vira **lenda** do mundo: NPCs falam dele, o túmulo pode ser visitado, itens ficam no local da morte
   (lendários voltam ao lugar de origem ou ficam com quem estiver presente — decisão do motor).
3. O jogador (mesmo número) pode **reencarnar**: novo sorteio completo, começa no nível `max(1, nível_antigo ÷ 3)`,
   com um **Eco** (+5% em um atributo à escolha e uma memória do personagem antigo que a IA usa na narrativa).
4. Reencarnar é permitido 2 vezes por mundo. Depois, o número vira só espectador.

## 19.4 Inteligência tática dos inimigos

A IA escolhe ações dos inimigos seguindo regras por arquétipo, e o motor resolve:

| Arquétipo | Táticas |
|-----------|---------|
| **besta** | Ataca o mais ferido; foge com < 20% HP (se não for chefe); matilhas cercam |
| **assassino** | Ignora tanques, mira curandeiros e magos; age primeiro; usa invisibilidade antes do golpe forte |
| **mago / invocador** | Fica atrás das invocações; silencia quem tem maior MAG; cura aliados |
| **tanque** | Protege o líder; provoca o maior dano do grupo |
| **bruto** | Ataca quem o feriu por último; carrega golpe forte (telegrafado: *"ele ergue o martelo..."*) — **defender no turno certo anula** |
| **chefes** | Mudam de fase em 66% e 33% HP; aprendem: se o mesmo truque for usado 2×, o chefe se adapta (−50% efeito na 3ª vez) |
| **Kanata** | Copia habilidades, manipula durante a luta (sussurra para o jogador mais corrompido) |

## 19.5 Estratégia e criatividade (o Juiz de Táticas)

Toda **ação livre** em combate (`> eu ...`) passa pelo **Juiz de Táticas**: a IA avalia a ação em 5 critérios (0–2 cada),
e o motor transforma a nota em efeito.

| Critério | 0 | 1 | 2 |
|----------|---|---|---|
| **Coerência** | Impossível para a ficha (ex.: voar sem poder) | Plausível | Usa exatamente as capacidades do personagem |
| **Ambiente** | Ignora o cenário | Usa algo do cenário | Usa o cenário de forma decisiva (derrubar o lustre, lava, vento, altura) |
| **Fraqueza** | Ignora | Mira uma fraqueza conhecida | Explora fraqueza descoberta durante a luta |
| **Cooperação** | Solo | Complementa um aliado | Combo planejado com outro jogador no mesmo turno |
| **Originalidade** | Repetida | Variação | Nunca usada neste mundo |

| Nota (0–10) | Resultado |
|:---:|-----------|
| 0–2 | **Falha**: a ação não funciona e o personagem fica exposto (inimigo ganha +20% contra ele no turno) |
| 3–4 | Ação normal (×1,0) |
| 5–6 | ×1,25 de efeito |
| 7–8 | ×1,5 de efeito **+ efeito extra** (atordoar, derrubar, cegar, mudar terreno) |
| 9–10 | ×1,8 **+ efeito extra + vantagem para o próximo aliado** |

- **Coerência 0 zera a ação inteira** (anti-trapaça: "eu destruo o mundo" não faz nada).
- O mesmo truque repetido perde **30% de efeito por repetição** no mesmo mundo.
- O multiplicador é aplicado pelo **motor**, nunca pela IA, e tem teto (×1,8).
- Fora de combate, o mesmo juiz decide testes narrativos (persuadir, investigar, enganar Kanata): nota alta reduz a dificuldade do teste.

## 19.6 O Relógio do Eclipse (pressão global)

Um contador **0–100%** por mundo. Ele mede quão perto Kanata está de abrir o Esquife. É visível com `!relogio`.

| Evento | Relógio |
|--------|:---:|
| Passa 1 semana real sem nenhum marco obrigatório concluído | +3% |
| Crise de tempo real falhada | +5% |
| Núcleo **Arrancado** pelo vilão | +15% |
| Amuleto usado (qualquer um, por qualquer lado) | +2% |
| Ressurgido trazido de volta | +3% |
| Jogador vira Arauto Jogador | +5% |
| Ovo escurecido | +10% |
| Núcleo **Confiado** a um jogador | −5% |
| Ressurgido destruído pela marca do eclipse | −3% |
| Pilar da Muralha restaurado | −5% |

**Efeitos:** 25% — rastejantes do vazio aparecem em todas as regiões · 50% — a Noite do Selo passa a ser semanal ·
75% — a mana do mundo cai 20% permanentemente, Kokū cresce (Kyōkai vira densidade 0) ·
**100% — o Esquife se abre: Final do Eclipse** (a não ser que os jogadores estejam no Ato IV; nesse caso, a batalha final
começa imediatamente nas piores condições).
