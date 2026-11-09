# 08 — Progressão, Mérito e Combate

## 8.1 Níveis e Ranks

Nível máximo: **100**. O rank é o "título" do jogador, exibido na carta e na moldura.

| Rank | Níveis | Título | Moldura da carta | Desbloqueia |
|:---:|:---:|--------|------------------|-------------|
| E | 1–9 | Aprendiz | Ferro | Subfases iniciais |
| D | 10–19 | Iniciado | Bronze | Party, Torneio dos Novatos |
| C | 20–39 | Guerreiro | Prata | Viagem entre reinos, Leilão de Kyōkai |
| B | 40–59 | Elite | Ouro | Especialização de classe, Shitenchō |
| A | 60–79 | Herói | Platina | Kokūgai, Terra Central profunda |
| S | 80–94 | Lenda | Obsidiana | Torre Sem Fim (andares 50+) |
| SS | 95–100 | Portador | Arco-íris (5 elementos) | Andares finais e o final da história |

**Curva de XP:** `XP para o próximo nível = 50 × nível^1,6` (nv 1→2: 50 · nv 10: ~2.000 · nv 50: ~26.000 · nv 99: ~78.000).

**Ganhos por nível:** atributos conforme `cresc` da classe (`data/classes.json`), `+HP = 8 + DEF/4`, `+MP = 4 × mult_MP`.
A cada 10 níveis: **+3 pontos livres** — o *único* momento em que o jogador escolhe onde colocar atributos (comando `!distribuir`).

## 8.2 Fontes de crescimento (só por mérito)

| Fonte | O que dá | Registro (`eventos_atributo.fonte`) |
|-------|----------|----------------|
| Vitória em batalha | XP, ouro, drops | `vitoria` |
| Vitória contra tier acima do seu nível | +2% MP máx, +1 atributo principal | `vitoria_superior` |
| Subir de nível | Crescimento de classe | `subida_de_nivel` |
| Pontos livres (a cada 10 níveis) | +3 pontos | `pontos_livres` |
| Subfase de treino (Mil Degraus, etc.) | +1 atributo por etapa, 1× por jogador | `treino` |
| Itens equipados | Bônus enquanto equipado | `item` (não permanente) |
| Dominar grimório | +5 Pureza | `dominio_grimorio` |
| Pet evoluir | Bônus do pet | `pet` |
| Marco de história | Definido pelo autor | `marco_historia` |
| Despertar (1× por rank) | Habilidade nova | `despertar` |
| Amuleto da Perdição (1× no jogo) | Habilidade customizada | `amuleto` |

## 8.3 Mérito (功績, Kōseki)

Pontuação de **honra/feitos**, separada do XP. Usada pela Excalibur, por títulos e pelo respeito de NPCs.

| Ação | Mérito |
|------|:---:|
| Salvar NPC / completar missão de ajuda | +10 a +30 |
| Vencer chefe de subfase | +15 |
| Restaurar selo, poupar inimigo rendido, resolver por diálogo | +20 a +40 |
| Ajudar jogador mais fraco em batalha (party com diferença ≥ 10 níveis) | +5 |
| Abandonar aliado em batalha (fugir sozinho) | −30 |
| Trair acordo registrado (`!acordo`) | −80 e marca permanente |
| Atacar jogador sem duelo aceito | −50 |

Títulos por Mérito: 100 *Confiável* · 300 *Honrado* · 500 *Digno* (requisito da Excalibur) · 1000 *Lendário*.

## 8.4 Combate por turnos no chat

### Ordem
1. Iniciativa = `VEL + d20`. Empate: maior SOR.
2. Cada jogador tem **90 segundos** para agir no seu turno (senão faz "Defender" automático).
3. Ações: `!atacar [alvo]`, `!magia <nome> [alvo]`, `!habilidade <nome>`, `!item <nome>`, `!defender`, `!fugir`, ou **ação livre** descrita em texto (a IA interpreta e o motor converte numa ação válida).

### Fórmulas

```
K            = 20 + 5 × nível_do_atacante
Dano físico  = FOR × poder_golpe × 3 × K / (K + DEF_alvo)
Dano mágico  = MAG × poder_magia × 3 × K / (K + RES_alvo)
Multiplicadores: elemento (+25% / −20%) · crítico (×1,75) · Ressonância regional · buffs · variação aleatória (0,9–1,1)
Crítico      = 5% + SOR/4 % (máx 40%)
Esquiva      = (VEL_alvo − VEL_atacante)/3 % (mín 0%, máx 35%)
Fugir        = 50% + (VEL média do grupo − VEL média inimiga)%  · impossível contra chefes
```

Referência (gerada pelas fórmulas): um Espadachim nível 2 (FOR ~16) causa ~39 de dano no Haikobo (V001, 120 HP) → ~3 golpes.
Um grupo de 4 jogadores nível 38 derruba o Yōgan-ryū (V064, 2.560 HP) em ~3–4 rodadas usando habilidades.

### Derrota
O jogo é **difícil**: vilões podem vencer. Estados (Caído, Ferido, Capturado, Marca da Morte, **Morte Verdadeira**),
consequências por tipo de inimigo, Batalhas Mortais e reencarnação estão no **[doc 19](19-dificuldade-derrota-estrategia.md)**,
que prevalece sobre qualquer regra deste documento.

### PvP
- Só por **duelo aceito** (`!duelo @jogador` + `!aceitar`). Pode apostar itens (não lendários, exceto em "Duelo de Relíquia" com confirmação dupla).
- Ataque fora de duelo é bloqueado pelo motor.

## 8.5 Economia

- Moeda: **Ryō (両)** — ouro. Cristais de mana (Daichi) servem como moeda premium de troca entre jogadores.
- Lojas nas capitais (poções, equipamentos comuns), forjas (melhorar armas com materiais de vilões), Leilão de Kyōkai (semanal).
- Itens têm raridade: Comum · Incomum · Raro · Épico · Lendário (só os 4 Grandes).

## 8.6 Equipamento

Slots: Arma · Armadura · Acessório ×2 · Grimório(s) · Pet.
Cada vilão tem chance de dropar material da sua região; materiais + ouro na forja = equipamento da região
(ex.: escamas do Yōgan-ryū → *Armadura de Escamas de Lava*, +DEF e resistência a Fogo).
