# 27 — Encruzilhadas: decisões que mudam o rumo da história

> Dados executáveis em `data/historia.yaml → encruzilhadas` e `epilogos_por_bandeira` (validados).

## 27.1 Como funciona

- Uma **encruzilhada** é um ponto em que o mundo **se divide**. Cada opção grava uma **bandeira** no mundo
  (ex.: `verdade_publica`), que é lida por marcos, cenas, preços, NPCs, vilões e pelo epílogo.
- **Quem decide** está definido em cada uma:
  - **grupo**: enquete nativa no grupo, prazo de 12–24 h, quórum de 50% dos ativos (empate → maior Mérito somado);
  - **party**: quem está na cena decide (enquete da party, 2 min; empate → líder);
  - **jogador**: quem viveu a cena decide sozinho (no privado).
- Algumas opções têm **requisito** (uma Chave de Conhecimento, um conto concluído, Dúvida de Kanata…). Opções
  "escondidas" só aparecem para quem cumpre o requisito — é assim que a **trajetória** abre caminhos melhores.
- Toda encruzilhada tem **consequência curta** (na hora) e **longa** (dias ou atos depois). A IA anuncia a curta e
  **nunca anuncia a longa** — o grupo descobre vivendo.

## 27.2 As 12 encruzilhadas

| ID | Momento | Pergunta | Opções (bandeiras) | Opção escondida |
|----|---------|----------|--------------------|-----------------|
| E01 | Festival (A1-M5) | Perseguir o ladrão do Amuleto ou proteger os civis? | perseguir · proteger | — |
| E02 | Arco de Homura | Ryūen ou Hyōsuke? | ryuen · hyosuke | **verdade** (C15): os irmãos param o duelo |
| E03 | Ala Proibida | Revelar ao povo a culpa dos reis antigos? | revelar · guardar | **confissão** (K08): Kaishin confessa com dignidade |
| E04 | Arco de Watatsumi | Levar o núcleo (e a vida) de Kaishin? | aceitar · recusar | — |
| E05 | Pilares Rachados | Destruir ou restaurar as guardiãs? | destruir · **restaurar** (exige G33) | — |
| E06 | O Caçador | Matar, poupar ou recrutar Zero? | matar · poupar | **recrutar** (vencê-lo sem magia) |
| E07 | Leilão do Segredo | Entregar, executar ou soltar o Leiloeiro? | entregar · executar · soltar | — |
| E08 | Recompensa do Ovo | (Portador) Contar ao grupo? | contar · esconder · **isca** | — |
| E09 | Noite em Kyōkai | Trégua com Kanata contra os Arautos rebeldes? | aliar · recusar | — |
| E10 | O Portador que Falhou | Libertar ou derrotar Tōya? | libertar · derrotar | — |
| E11 | Portão do Esquife | Matar Kanata ou estender a mão? | matar | **redimir** (Dúvida ≥ 5) |
| E12 | Rei do Eclipse | Destruir ou redimir Kaien? | destruir | **redimir** (K01 + K05) |

## 27.3 Efeito borboleta: exemplos de como as escolhas se encadeiam

```
E01 proteger civis ──▶ civis viram testemunhas (C03) ──▶ provam a falsa bandeira (A2-HOM-4) sem guerra
                   └─▶ Kanata fica com o Amuleto ──▶ Otohime Negra volta mais forte (A2-WAT-4 mais difícil)

E03 guardar segredo ──▶ em A2-M3 Kanata acusa os JOGADORES de cúmplices ──▶ NPCs hostis em todas as capitais
                                                                          └─▶ só K04 (FB04) limpa o nome do grupo

E06 recrutar Zero ──▶ ele ensina o Manual do Vazio Nº1 ──▶ no final, anula a 1ª Devoração do Shokuō

E08 isca ──▶ um jogador finge ser o portador ──▶ Zero e Arautos caçam a isca ──▶ o portador real chega ao Ninho em paz
                                                                            └─▶ se a isca morrer: Morte Verdadeira possível

E09 trégua ──▶ +2 Dúvida em Kanata ──▶ (com K05 + K12) redenção possível em E11 ──▶ ele segura a Devoração no final
```

## 27.4 Epílogos

O final (Estelar, Selo ou Eclipse — doc 14.8) define o **tom**. As bandeiras acrescentam **parágrafos** (ex.:
`duelo_verdade` → "Ryūen e Hyōsuke governam Homura juntos, alternando as estações"). Cada jogador recebe ainda um
**epílogo pessoal** montado pela IA a partir da sua trajetória (marcas T01–T12), das encruzilhadas em que votou, das
traições que cometeu (reveladas a todos no fim) e de quem ele salvou.

## 27.5 Regras para a IA nas encruzilhadas

1. Apresentar a escolha **dentro da cena**, sem dizer "isto é uma encruzilhada".
2. Mostrar as opções escondidas **só** a quem cumpre o requisito — e sem explicar por que a outra pessoa não vê.
3. Anunciar a consequência curta; guardar a longa para quando acontecer.
4. Nunca desfazer uma bandeira (exceto o admin com `/desfazer-ultimo-evento`, em caso de erro).
