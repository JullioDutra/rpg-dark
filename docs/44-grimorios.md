# 44 — Grimórios

Os 40 grimórios de `data/grimorios.json` agora existem no jogo. Tabela completa em [44b](44b-grimorios-tabela.md).
Código: `src/regras/grimorios.mjs` (regras e conversão das magias), `src/servidor/grimorios.mjs` (comandos), tabela `jogo.grimorios_jogador`.

## 44.1 Como o jogador consegue

| Caminho | Regra |
|---------|-------|
| Explorando | Cada grimório está escondido numa região. Ao `explorar` ali, há 20% de chance de achar um que a classe e o nível do jogador consigam ler |
| Concluindo um capítulo | Ao concluir um capítulo numa região, o jogador recebe o grimório de menor rank dali que ainda não tem (mesmo que ainda não consiga ler: fica guardado) |
| Pelo mestre | `mestre grimorio <nome> <nº>`; para o jogador, ele "acorda com um livro debaixo do braço" |

Cada jogador tem a própria cópia (grimório não é item único como os Grandes Itens). Não entra na bolsa, não se vende e não se dá.

## 44.2 Comandos (privado)

| Comando | Efeito |
|---------|--------|
| `grimorios` | Lista os que o jogador tem, com as magias e quais estão abertos |
| `abrir grimorio <nº ou nome>` | Abre: as magias de batalha dele entram no menu das lutas |
| `fechar grimorio <nº ou nome>` | Fecha |

## 44.3 Quem pode ler

- **Classe:** cada grimório lista as classes que conseguem ler (alguns servem para todas).
- **Nível por rank:** E 1 · D 8 · C 18 · B 30 · A 45 · S 60.
- **Quantos abertos ao mesmo tempo:** Mago 3; as outras classes 1.
- **Anti-magia:** só lê os grimórios do Vazio (G21, G26, G32, G34, G38) e não gasta mana, só a espera entre usos.

## 44.4 As magias na batalha

As descrições originais eram texto livre ("dano MAG×1,4 + confusão", "escudo de 25% do HP máx no grupo"). Cada uma foi convertida para os efeitos que o combate já tem:

| Descrição original | Vira |
|--------------------|------|
| `MAG×1,4`, `FOR×1,3`, "3 projéteis ×0,6" | Golpe ou magia com essa força (usa o melhor atributo de quem lê) e esse número de golpes |
| "dano" sem número | Força pelo rank (E 1,0 → S 2,3), um pouco menor se for em área |
| queimadura, veneno, sangramento, invocações | Dano contínuo por 3 rodadas |
| prende, adormece, petrifica | Prende 1 rodada (espera de 4 rodadas para usar de novo) |
| cega, medo, confusão, silencia, −VEL, −DEF | Enfraquece o inimigo |
| "ignora 30% RES", "ignora toda DEF mágica" | Atravessa parte da defesa |
| cura, regen, "desfaz o dano", revive | Cura de 15% a 35% da vida |
| escudo, +DEF, bloqueia, imune, esquiva | Proteção de 45% a 80% por 1 ou 2 rodadas |
| +FOR, +MAG, "age primeiro", "crítico garantido" | Próximo golpe +50% |

Custo de mana: o do texto original. Espera: 2 a 4 rodadas, conforme a força.
**20 das 120 magias são de exploração ou de história** (iluminar, respirar sob a água, ver o passado, mandar mensagem): aparecem na lista do grimório como "fora de luta" e ainda não têm efeito mecânico.

## 44.5 Para o mestre

- `mestre grimorios`: os 40, com rank, região e quem já tem (e se está aberto).
- `mestre grimorio <nome> <nº>`: entrega um.

## 44.6 Limites conhecidos

- As magias não foram calibradas por simulação. As mais fortes (rank A e S, força 2,2 a 2,6) equivalem às habilidades de nível 25 das classes, mas um Mago com 3 grimórios abertos tem bem mais opções que hoje.
- Grimórios não valem no duelo amistoso nem nas lutas contra monstro/Calamidade (`golpear`).
- A conversão simplifica: efeitos de grupo viram efeito no próprio jogador, invocações viram dano contínuo.
