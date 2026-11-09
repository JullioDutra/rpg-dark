# 12 — Roteiro da História (formato para o autor enviar)

> Esta é a próxima etapa. Envie a história no formato que for mais natural para você — texto corrido serve.
> Depois eu estruturo tudo neste formato (atos → capítulos → marcos → fatos → final) e gero o
> `data/historia.yaml` que o Diretor de História vai usar.

## O que eu preciso de você

### 1. Premissa (1–3 parágrafos)
Qual é o conflito central? O que ameaça o mundo? (Pode usar, mudar ou descartar a lore base do Vazio/Quinto Portador.)

### 2. O final
- Como a história termina? Quem é o inimigo final (pode ser o V100 ou outro)?
- O que os jogadores precisam ter feito para "zerar"? (ex.: reunir o Shitenchō, restaurar os 4 selos, vencer X)
- Há finais alternativos? (ex.: final bom se Mérito médio do grupo ≥ 500)

### 3. Atos e capítulos
Uma lista do que acontece, em ordem. Exemplo:

```
ATO 1 — O Selo Racha
  Cap 1: Os jogadores despertam em suas aldeias; tremor; criaturas do Vazio aparecem.
  Cap 2: Cada reino culpa o outro. O Torneio dos Novatos revela um traidor.
  Cap 3: O primeiro pilar cai. Os reis convocam heróis.
ATO 2 — A Guerra dos Quatro
  ...
ATO 3 — O Quinto Portador
  ...
```

### 4. Fatos que podem acontecer
Eventos que a IA **pode** usar quando fizer sentido (não obrigatórios), por exemplo:
- "O rei Sorahiko é sequestrado"
- "Hyōsuke propõe aliança aos jogadores"
- "Uma aldeia de um jogador é atacada"

### 5. Papéis dos 4 reis e NPCs importantes
Aliados? Traidores? Algum morre? Algum vira vilão?

### 6. Proibições
O que **nunca** pode acontecer (ex.: "o rei Gōtetsu nunca trai", "ninguém descobre a identidade de Yoru antes do Ato 3").

### 7. Tom
Mais sombrio? Mais aventura? Romance permitido? Mortes de personagens jogadores permitidas?

---

## Formato final que eu vou gerar (exemplo)

```yaml
historia:
  titulo: "..."
  premissa: "..."
  final:
    marco_final: A3-C4-M5
    condicoes: ["Shitenchō completo em algum jogador", "4 selos restaurados"]
    epilogos:
      - condicao: "merito_medio >= 500"
        texto: "..."
      - condicao: "padrao"
        texto: "..."
  atos:
    - id: A1
      titulo: "O Selo Racha"
      capitulos:
        - id: A1-C1
          titulo: "Despertar"
          nivel_sugerido: "1–8"
          marcos:
            - id: A1-C1-M1
              tipo: obrigatorio
              gatilho: "todo jogador ao concluir o sorteio"
              objetivo: "..."
              condicao_conclusao: "..."
              fatos_disponiveis: [F01, F02]
              viloes_permitidos: [V001, V009, V017, V025]
              se_atrasar: "..."
  fatos:
    - id: F01
      descricao: "..."
      uso_unico: true
  proibicoes:
    - "..."
```

Com isso o jogo terá um caminho garantido do sorteio inicial até o final, com espaço para a IA improvisar no meio.
