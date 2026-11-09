# 05 — Classes

Atributos: **FOR** (força), **DEF** (defesa), **MAG** (poder mágico), **RES** (resistência mágica),
**VEL** (velocidade/ordem de turno/esquiva), **SOR** (sorte: crítico, drops), **HP**, **MP**.

Valores base no nível 1 (antes de casta/reino). Crescimento por nível entre parênteses.

| Classe | FOR | DEF | MAG | RES | VEL | SOR | HP base | Mult. MP | Papel |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|-------|
| 🔮 Mago | 4 (+1) | 5 (+1) | 14 (+3) | 10 (+2) | 7 (+1) | 6 (+1) | 90 | ×1,4 | Dano mágico em área, controle |
| 🛡️ Cavaleiro | 12 (+2) | 13 (+3) | 4 (+1) | 7 (+1) | 6 (+1) | 5 (+1) | 140 | ×0,8 | Tanque, proteção de aliados |
| 🕯️ Bruxo | 5 (+1) | 6 (+1) | 12 (+3) | 8 (+2) | 7 (+1) | 9 (+2) | 95 | ×1,1 | Maldições, invocações, pactos |
| ⛓️ Anti-magia | 13 (+3) | 9 (+2) | 0 (+0) | 15 (+3) | 10 (+2) | 4 (+1) | 120 | ×0 | Caçador de magos, anula feitiços |
| ⚔️ Espadachim | 13 (+3) | 7 (+1) | 5 (+1) | 6 (+1) | 13 (+3) | 7 (+1) | 110 | ×0,7 | Dano físico rápido, críticos |
| 🐺 Meio-humano | 11 (+2) | 8 (+2) | 6 (+1) | 6 (+1) | 12 (+2) | 8 (+1) | 115 | ×0,8 | Transformação, instinto |
| 🌿 Força da Natureza | 7 (+1) | 8 (+2) | 11 (+2) | 9 (+2) | 7 (+1) | 7 (+1) | 105 | ×0,9 | Dano ambiental, terreno |
| 😈 Demônio | 12 (+2) | 7 (+1) | 12 (+2) | 6 (+1) | 10 (+2) | 6 (+1) | 110 | ×1,0 | Dreno de vida, dano alto, auto-regeneração |
| ✝️ Paladino | 10 (+2) | 12 (+2) | 8 (+2) | 11 (+2) | 5 (+1) | 6 (+1) | 130 | ×0,9 | Cura, escudos, anti-demônio |

## Descrição e kit inicial

### 🔮 Mago (魔導士, Madōshi)
Estudiosos da canalização pura. Carregam até **3 grimórios** equipados (outras classes: 1).
- **Passiva — Leitura Profunda**: +20% Pureza; aprende magias de grimório 2× mais rápido.
- **Habilidade inicial — Disparo Elemental**: projétil do seu elemento (custo 8 MP, dano MAG×1,2).
- **Despertar**: *Círculo Arcano* — 3 turnos onde toda magia é lançada duas vezes.

### 🛡️ Cavaleiro (騎士, Kishi)
Juramentados. A mana deles reforça corpo e armadura.
- **Passiva — Juramento**: escolhe um aliado; recebe 50% do dano destinado a ele.
- **Inicial — Aura de Combate**: −5 MP/turno, +30% FOR e DEF enquanto ativa.
- **Despertar**: *Bastião Inquebrável* — aliados não podem cair abaixo de 1 HP por 2 turnos.

### 🕯️ Bruxo (魔女/呪術師, Jujutsushi)
Fazem pactos com entidades. Poder emprestado tem preço.
- **Passiva — Dívida**: pode conjurar sem MP acumulando Dívida (1 MP = 1 Dívida). Dívida > 100 → "o Cobrador vem" (vilão de evento). Dívida se paga com MP ou com itens raros.
- **Inicial — Marca da Maldição**: alvo recebe +15% de dano por 3 turnos.
- **Despertar**: *Contrato Supremo* — invoca a entidade do pacto por 2 turnos.

### ⛓️ Anti-magia (反魔法, Hanmahō)
Nasceram sem mana — tocados pelo Vazio. Odiados por uns, temidos por todos.
- **Passiva — Corpo do Vazio**: imune a efeitos mentais e maldições; −40% dano mágico recebido.
- **Recurso — Vazio (VZ)**: barra 0–100. Enche +10 a cada magia recebida/anulada e +5 por golpe dado.
- **Inicial — Corte Anulador**: golpe que cancela o buff mágico ativo do alvo.
- **Restrição**: não usa grimórios comuns (há 3 grimórios anti-mágicos únicos).
- **Despertar**: *Zona Morta* — raio onde nenhuma magia funciona por 3 turnos (inclusive aliados).

### ⚔️ Espadachim (剣士, Kenshi)
Mestres da lâmina. Mana usada só para afiar o golpe.
- **Passiva — Fio de Mana**: golpes consecutivos no mesmo alvo +10% dano (acumula até 5×).
- **Inicial — Iaijutsu**: saque instantâneo; ataca primeiro no turno (custo 5 MP).
- **Despertar**: *Mil Cortes do Horizonte* — 7 golpes de 60% em um turno.

### 🐺 Meio-humano (半人, Hanjin)
Sangue de fera. Tipo sorteado: raposa (magia/ilusão), lobo (matilha), tigre (força), corvo (velocidade/visão), serpente (veneno), coelho (esquiva), dragão-menor (2%, sopro elemental).
- **Passiva — Instinto**: +15% esquiva; sente emboscadas.
- **Recurso — Fera**: enche com dano dado/recebido. Cheia → **Transformação** 3 turnos (+50% nos atributos do tipo).
- **Despertar**: *Forma Ancestral* — transformação permanente na batalha + habilidade única do tipo.

### 🌿 Força da Natureza (自然の力, Shizen no Chikara)
Canalizam a mana do mundo, não a própria.
- **Passiva — Simbiose**: magias custam 50% menos; o poder escala com a densidade de mana da região (×0,4 no Vazio a ×1,6 em densidade 5).
- **Inicial — Terreno Vivo**: muda o terreno da batalha para o seu elemento por 3 turnos (+20% para afins).
- **Despertar**: *Fúria do Mundo* — desastre natural (terremoto, tsunami, tornado, erupção).

### 😈 Demônio (悪魔, Akuma)
Sangue corrompido. Mana = Miasma.
- **Passiva — Fome**: recupera 20% do dano causado como HP e 10% como MP. Mais forte à noite (18h–6h real: +15%).
- **Fraqueza**: dano sagrado/luz +50%; não pode entrar em templos sem item especial; NPCs podem reagir mal.
- **Inicial — Garra de Miasma**: dano + veneno de mana (−5 MP/turno do alvo).
- **Despertar**: *Forma Verdadeira* — +60% FOR/MAG por 3 turnos, mas perde 5% HP/turno.

### ✝️ Paladino (聖騎士, Seikishi)
Guerreiros da luz consagrada.
- **Passiva — Bênção**: cada cura dada concede +5% DEF temporária (acumula 5×) ao curado.
- **Inicial — Luz Restauradora**: cura MAG×1,5 em um aliado (10 MP).
- **Bônus**: +40% dano contra Demônios, mortos-vivos e criaturas do Vazio.
- **Despertar**: *Julgamento Celestial* — dano sagrado em área + cura total do grupo 1×.

## Evolução de classe (Rank B)

Ao chegar ao **Rank B** (nível 40) e cumprir uma missão de classe, o jogador escolhe uma especialização:

| Classe | Especialização A | Especialização B |
|--------|------------------|------------------|
| Mago | Arquimago (dano) | Mago-Selador (controle) |
| Cavaleiro | Cavaleiro-Dragão (montaria) | Guardião da Muralha (tanque) |
| Bruxo | Necromante | Feiticeiro de Contratos |
| Anti-magia | Devorador de Magia (absorve) | Executor do Vazio (dano) |
| Espadachim | Kensei (santo da espada) | Lâmina Sombria (assassino) |
| Meio-humano | Primordial (fera) | Equilíbrio (humano + fera) |
| Força da Natureza | Avatar Elemental | Druida das Estações |
| Demônio | Lorde Demônio | Demônio Redimido (vira meio-paladino) |
| Paladino | Cruzado (ataque) | Santo (cura) |
