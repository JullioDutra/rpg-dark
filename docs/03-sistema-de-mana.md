# 03 — Sistema de Mana (魔力, Maryoku)

A mana é o coração de Yotsuhoshi. Ela existe **em dois lugares**: dentro das pessoas
(**mana interna**) e no ambiente (**mana ambiente**). Toda magia é a interação entre as duas.

## 3.1 Os cinco componentes da mana de um personagem

| Componente | Sigla | O que é | Faixa | Como evolui |
|-----------|:---:|---------|:---:|-------------|
| **Reservatório** | MP máx | Quanto de mana o corpo comporta | 0 – 9999 | Nível, casta, itens, marcos de história |
| **Fluxo** | FLX | Quanto regenera por turno de combate / por hora fora de combate | 1 – 100 | Treino, itens, região |
| **Pureza** | PUR | Eficiência: reduz o custo das magias | 0 – 100% | Vitórias com magia, grimórios dominados |
| **Afinidade** | AFI | Elemento(s) que o corpo aceita. Magias fora da afinidade custam 2× e causam 50% | 1 elemento base (+ secundário raro) | Só por marcos de história ou Amuleto |
| **Controle** | CTL | Precisão/estabilidade; chance de a magia sair como planejado | 0 – 100 | Prática (uso), subfases de treino |

### Fórmulas

```
Custo real   = custo_base × (1 − PUR/200) × modificador_afinidade × modificador_região
Regen/turno  = FLX × densidade_regional × maré_estação
Falha mágica = se rolagem d100 > CTL + 30 → magia sai com 50% ou explode (−10% HP do conjurador)
```

## 3.2 Mana por casta (definida pela aldeia de origem)

| Casta | MP máx inicial | FLX inicial | PUR inicial | Observação |
|-------|:---:|:---:|:---:|------------|
| **Camponês** (農民) | 40 – 70 | 3 | 5% | Mana baixa, mas **+20% XP** ("quem nasce com pouco aprende mais rápido") e +15% HP |
| **Plebeu** (平民) | 80 – 120 | 5 | 10% | Equilibrado |
| **Cavaleiro** (騎士) | 60 – 90 | 4 | 5% | Mana flui para o corpo: **+20% FOR/DEF**, pode converter MP em reforço físico |
| **Realeza** (貴族) | 150 – 200 | 7 | 20% | Mana alta, mas −10% HP (corpo pouco treinado) |
| **Indefinido** (不定) | 10 – 250 (rolagem aberta) | 1 – 10 | 0 – 25% | **Pode ser qualquer coisa.** Rolagem com distribuição em "U": muito baixo ou muito alto é mais comum que o meio. Única casta que pode sortear 0 mana (→ anti-magia) |
| **Rei / Linhagem Real** (王) | 220 – 260 | 8 | 25% | Recebe **Mana Única**: um atributo mágico exclusivo, que nenhum outro jogador do mundo terá |

### Mana Única (casta Rei)

- Ao sortear casta Rei, o motor gera uma **Mana Única** combinando: elemento do reino
  de origem + um conceito raro (tempo, som, memória, gravidade, sombra, cristal, sangue,
  sonho, destino, espelho...) e registra no mundo como **ocupado**.
- Exemplos: *Chama da Memória* (queima lembranças), *Maré Gravitacional*, *Cristal do Tempo*, *Vento Espelhado*.
- Limite: **máx. 1 jogador Rei por reino por mundo** (4 no total). Se já houver, a rolagem vira Realeza.

## 3.3 Mana ambiente por região

Cada região tem uma **densidade** de 0 a 5 (●) — ver `docs/02-mundo-e-reinos.md`.

| Densidade | Multiplicador de regen | Efeito |
|:---:|:---:|-----------|
| ○○○○○ (0) | ×0 | Nenhuma regeneração. Magias custam +50%. Anti-magia +30% dano |
| ●○○○○ (1) | ×0,5 | Magias custam +25% |
| ●●○○○ (2) | ×0,8 | — |
| ●●●○○ (3) | ×1,0 | Padrão |
| ●●●●○ (4) | ×1,3 | Força da Natureza +15% |
| ●●●●● (5) | ×1,6 | Magias +10% dano. Risco de **Sobrecarga** (ver 3.6) |

### Ressonância regional

- Estar no **reino do seu elemento**: +15% regen e −10% custo.
- Estar no **reino do elemento que te vence** (ex.: Fogo em Watatsumi): −15% regen.
- Estações e Maré Alta: ver 2.2.

## 3.4 Natureza da mana de cada reino

| Reino | Natureza | Mecânica especial dos nativos |
|-------|----------|-------------------------------|
| 焔 Homura (Fogo) | **Volátil** | *Ignição*: podem gastar 2× mana numa magia para causar 2,5× dano. Ao chegar a 0 MP, recebem +20% FOR por 2 turnos ("fúria das brasas") |
| 水 Watatsumi (Água) | **Fluida** | *Maré*: a cada 3 turnos regeneram o dobro. *Mimetismo*: 1× por batalha copiam o elemento do último ataque recebido por 2 turnos |
| 土 Daichi (Terra) | **Densa** | *Cristalizar*: podem guardar até 30% do MP em um cristal (item) para usar depois. Mana deles não pode ser drenada por inimigos (−70% de dreno) |
| 風 Fūjin (Vento) | **Leve** | *Conjuração rápida*: magias de nível 1–2 não gastam o turno (1× a cada 2 turnos). Efeitos duradouros (buffs) duram 1 turno a menos |

## 3.5 Como cada classe usa a mana

| Classe | Forma de uso | Recurso | Particularidade |
|--------|-------------|---------|-----------------|
| **Mago** | Canalização pura via grimório | MP | Única classe que pode usar **3 grimórios** equipados. +20% PUR |
| **Cavaleiro** | Mana corporal (reforço) | MP → buffs físicos | *Aura de Combate*: gasta MP/turno para +FOR/+DEF |
| **Bruxo** | Mana emprestada por **pacto** | MP + **Dívida** | Pode conjurar mesmo sem MP, acumulando *Dívida*; dívida alta chama um "cobrador" (evento/vilão) |
| **Anti-magia** | Não possui mana — possui **Vazio** | Barra de **Vazio (VZ)** 0–100 que enche ao ser atingido por magia | Anula magias, corta feitiços, imune a efeitos mentais. Não pode usar grimórios comuns |
| **Espadachim** | Mana na lâmina | MP (baixo uso) | *Fio de Mana*: cada golpe consecutivo +10% dano; técnicas de espada (katas) custam pouco MP |
| **Meio-humano** | Mana bestial / instintiva | MP + **Fera** (barra) | *Transformação*: ao encher a barra de Fera, assume forma animal por 3 turnos |
| **Força da Natureza** | Mana do ambiente | Usa a **densidade da região** | Quase não gasta MP próprio; poder varia com a região (fraco no Vazio, devastador em densidade 5) |
| **Demônio** | Mana corrompida: **Miasma** | MP + regen por dano causado | Regenera MP ao causar dano e à noite (horário real 18h–6h). Itens sagrados o ferem |
| **Paladino** | Mana sagrada | MP | Cura e escudos; cada cura dá +5% DEF temporária. Ganha força contra Demônios e criaturas do Vazio |

## 3.6 Estados da mana

| Estado | Condição | Efeito |
|--------|----------|--------|
| **Plena** | MP ≥ 80% | +5% CTL |
| **Normal** | 20% – 80% | — |
| **Esgotada** | MP < 20% | −10% em todos os atributos mágicos |
| **Vazia** | MP = 0 | Usar magia custa HP (1 MP = 2 HP). Exceção: Bruxo (dívida), Fogo (fúria) |
| **Sobrecarga** | Região densidade 5 e MP > 100% (via itens) | +25% dano mágico, mas 10% chance/turno de explodir (dano em área, incluindo aliados) |
| **Despertar** (覚醒) | Evento de história ou HP < 10% com marco liberado | Mana ultrapassa o limite por 3 turnos, revela nova habilidade. **Só acontece 1× por rank** e é concedido pelo motor quando a condição do marco é cumprida |

## 3.7 Atributo mágico (elemento) sorteado

Ver probabilidades em `docs/04-entrada-e-sorteio.md` e `data/atributos-magicos.json`.

Estrutura: **Elemento base** (Fogo, Água, Terra, Vento) + **Variante** (ex.: Fogo → Chama, Lava, Explosão, Cinzas)
ou um **elemento raro** (Luz, Trevas, Raio, Gelo, Natureza, Metal, Som, Gravidade, Tempo, Espaço, Sangue, Alma, Vazio).

- O elemento base geralmente é o do reino da aldeia (70%); 30% nasce com afinidade "estrangeira" (gancho narrativo).
- Elementos raros ignoram o ciclo elemental padrão e têm suas próprias relações (ver JSON).

## 3.8 Crescimento da mana (só por mérito)

| Fonte | Ganho |
|-------|-------|
| Subir de nível | +MP conforme classe/casta (tabela em `docs/08`) |
| Vitória contra vilão de tier superior ao seu | +2% MP máx permanente |
| Dominar um grimório (usar todas as magias 10×) | +5 PUR |
| Completar subfase de treino | +1 a +3 FLX ou CTL |
| Marco de história | Definido pelo autor (ex.: "Despertar") |
| Itens equipados | Bônus enquanto equipados |

**Nunca** por pedido do jogador.
