# 12 — Roteiro da História (status e como editar)

✅ **A história foi recebida e estruturada.**

| Onde | O quê |
|------|-------|
| [doc 14](14-historia-principal.md) | Cânone: prólogo de 500 anos atrás, o Ovo Eterno, Kanata, os núcleos, o Seiō, camadas de verdade, finais |
| [doc 15](15-arcos-dos-reinos.md) | Arcos complementares de cada reino, ganchos das 24 aldeias, Vale de Hinata |
| [doc 16](16-vilao-principal-e-manipulacao.md) | Kanata, sussurros, pactos, Corrupção, como ele vira os jogadores uns contra os outros e como manipulá-lo |
| [doc 17](17-sub-viloes.md) | Arautos do Eclipse, Ressurgidos e servos |
| [doc 18](18-animais.md) | Bestiário |
| [doc 19](19-dificuldade-derrota-estrategia.md) | Dificuldade, derrota/morte, Juiz de Táticas, Relógio do Eclipse |
| `data/historia.yaml` | **O roteiro executável**: 4 atos, 53 marcos, 20 fatos, proibições e finais |

## Como o autor adiciona ou muda coisas

- **Novo acontecimento possível** → adicionar em `fatos:` (ex.: `{id: F21, descricao: "..."}`) e citar o ID em
  `fatos_disponiveis` dos marcos onde ele pode ocorrer.
- **Novo marco** → adicionar no ato certo com `requer`, `objetivo`, `cena` e `condicao_conclusao`.
- **Algo que nunca pode acontecer** → `proibicoes:`.
- **Mudar um final** → `finais:`.
- Depois de editar: `python3 scripts/validar-historia.py` (aponta marcos, vilões, subfases ou fatos inexistentes).

## Formato de marco

```yaml
- id: A2-HOM-3
  titulo: "Sacrifícios nas Dunas"
  tipo: crise                 # obrigatorio | opcional | secreto | crise
  escopo: party               # mundo | jogador | party
  requer: [A2-HOM-2]
  prazo_horas_reais: 48       # só para crise
  subfases: [SF-HOM-04]
  viloes_permitidos: [V037, V039, V006]
  objetivo: "Impedir o ritual de Okibi"
  cena: "orientação de cenário/clima/NPCs para a IA"
  condicao_conclusao: "Vencer Okibi antes do prazo"
  falha: "o que acontece no mundo se falharem"
  relogio: {sucesso: -2, falha: 5}
  verdade: 3                  # camada de verdade liberada (opcional)
  batalha_mortal: true        # opcional
```
