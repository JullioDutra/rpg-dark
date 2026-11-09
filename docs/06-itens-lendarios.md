# 06 — Os Grandes Itens, o Amuleto da Perdição e os Grimórios

Os **4 Grandes Itens** são as relíquias que os **quatro reis antigos** deixaram, há 500 anos, para o
**Quinto Portador** — o nome que a profecia dá a quem um dia carregaria a quinta peça, o Ovo Eterno, até o Esquife
(doc 14). Juntos, eles são o que torna possível entrar no Esquife e vencer. O **Final Estelar exige pelo menos 3 dos 4**
nas mãos do grupo final.

| Item | Origem | Papel no final |
|------|--------|----------------|
| Shitenchō | O ritual do selo, escrito pelos 4 reis antigos | Completo, refaz o selo sem sacrifício (Final do Selo) e conduz a Coroação |
| Excalibur | Caiu do céu na noite do selo; o rei Hayate Tsukumo a fincou na estepe | *Luz de Avalon* bloqueia a Devoração do Shokuō por 2 turnos |
| Kokūgai | Forjada pelo rei Iwanaga Gōzan para quem entrasse no Esquife | Sem ela por perto, todos perdem 5% HP/turno dentro do Esquife |
| Tenmon no Tama | Guardada pelo rei Minazuki Shizuha | Abre uma porta para dentro do Esquife sem rachá-lo (sem ela: Relógio +10%) |

Regras gerais:

- **Únicos por mundo** (grupo). Tabela `itens_lendarios_posse` com PK `(mundo_id, item_id)` garante isso no banco.
- Só podem mudar de dono por: **derrota em duelo formal** aceito pelos dois, **morte narrativa** definida
  em marco de história, ou **entrega voluntária** (comando `!entregar`, com confirmação dupla).
- Ao ser obtido, o bot anuncia no grupo com uma carta especial (template lendário).
- Cada item tem **Requisito de Portador** — sem ele, o item fica no inventário mas só libera 10% do poder.
- Cada item tem um **Fardo**: um custo ou risco que impede que vire "botão de vitória".

---

## 1. 四天帳 SHITENCHŌ — *O Grimório dos Quatro Céus*

> *"Quatro céus, quatro capítulos. Quem ler todos verá o quinto."*

| | |
|---|---|
| **Tipo** | Grimório lendário |
| **Como obter** | Dividido em **5 partes**: 4 capítulos (um em cada subfase lendária de reino) + a **capa** (andar 50 da Torre Sem Fim). Cada capítulo pode ser obtido por jogadores diferentes; o grimório só se forma quando **um único jogador** reunir os 5 (negociação, duelos e alianças viram parte do jogo) |
| **Capítulos** | 焔 *Céu Rubro* (HOM-08) · 水 *Céu Profundo* (WAT-08) · 土 *Céu de Pedra* (DAI-08) · 風 *Céu Errante* (FUJ-06) |
| **Requisito** | Rank B+, Controle ≥ 60 |
| **Poder (por capítulo)** | Cada capítulo isolado: conjura magias daquele elemento **sem penalidade de afinidade** + 1 magia lendária do elemento |
| **Poder (completo)** | Todas as 4 afinidades · **Quinto Céu**: magia que funde os 4 elementos (dano verdadeiro, ignora resistência e ciclo elemental), 1× por batalha · +40% MP máx |
| **Fardo** | Cada uso do Quinto Céu consome 30% do HP máx do portador. O grimório "fala" — sussurra trechos de lore (gancho para a IA) e às vezes mente |

Magias lendárias dos capítulos: *Sol do Meio-Dia Eterno* (Fogo), *Dilúvio Primordial* (Água),
*Coluna do Mundo* (Terra), *Vento Que Corta o Céu* (Vento).

---

## 2. 聖剣 EXCALIBUR — *A Espada Sagrada que Caiu das Estrelas*

> *"Ela não escolhe o mais forte. Escolhe o que não a usaria para si."*

| | |
|---|---|
| **Tipo** | Espada lendária (Luz) |
| **Onde** | Cravada numa pedra no **Círculo sem Vento**, no meio da Estepe Susuki (subfase FUJ-07) |
| **Como obter** | Vencer o **Guardião sem Vento** e passar na **Prova do Coração**: o motor verifica o histórico do jogador — Mérito ≥ 500, nunca abandonou aliado em batalha, nunca traiu acordo registrado. A IA narra a prova; **a decisão é do motor** |
| **Requisito** | Qualquer classe (até Anti-magia — a espada não precisa de mana). Demônio pode empunhar, mas recebe 5% de dano por turno |
| **Atributos** | +120 FOR · ignora 50% da DEF · dano de Luz · +30% contra Trevas/Vazio |
| **Habilidades** | **Luz de Avalon**: corte de luz em linha que atinge todos os inimigos (1× por batalha) · **Bainha Sagrada**: enquanto embainhada (não atacando no turno), regenera 8% HP/turno |
| **Fardo** | Se o portador agir de forma desonrosa (registro de traição, ataque a aliado, fuga deixando aliados), a espada **fica pesada**: −50% poder até reparar a honra com uma missão de redenção. Na terceira vez, ela volta para a pedra |

---

## 3. 虚空鎧 KOKŪGAI — *A Égide do Quinto Portador*

> *"Ele vestiu o vazio para que o vazio não o vestisse."*

| | |
|---|---|
| **Tipo** | Armadura lendária |
| **Onde** | No trono de Sekiō, o Rei de Pedra, no coração da **Floresta Petrificada** (KOK-03) |
| **Requisito** | Rank A+, DEF ≥ 150 |
| **Atributos** | +300 DEF · +300 RES · todo dano recebido −40% · imune a morte instantânea, petrificação e maldições |
| **Habilidades** | **Última Muralha**: 1× por dia real, sobrevive a um golpe letal com 1 HP · **Égide Compartilhada**: transfere 50% da proteção para um aliado por 2 turnos |
| **Fardo** | Peso do Quinto: −30% VEL. A armadura absorve um pouco do Vazio: o portador **não pode ser curado por magia** acima de 50% do HP (só por itens/descanso). Quem a usar por muito tempo começa a ouvir o Vazio (gancho de história) |

---

## 4. 天門珠 TENMON NO TAMA — *A Joia dos Portões Celestes*

> *"Toda distância é só uma porta que ainda não foi aberta."*

| | |
|---|---|
| **Tipo** | Joia lendária (Espaço) |
| **Onde** | No topo da **Torre Fora do Mapa**, dentro do Olho da Tempestade (FUJ-08), guardada pelo Arquivista |
| **Requisito** | Controle ≥ 70 (sem isso, o teleporte tem 30% de chance de enviar a um lugar aleatório) |
| **Habilidades** | **Portão Celeste** (fora de combate): teleporta o portador + até 4 aliados para qualquer região **já visitada** (cooldown 1h real) · **Dobra** (combate): troca de lugar com qualquer combatente ou redireciona um ataque para outro alvo (1× por batalha) · **Olho do Portão**: vê qualquer região já visitada (espionagem) |
| **Fardo** | Não funciona na Terra Central (densidade 0) — o Vazio "come" os portões. Cada uso marca o portador: criaturas do Vazio o rastreiam (+encontros) |

---

## 5. 滅びの勾玉 HOROBI NO MAGATAMA — *O Amuleto da Perdição* (o "quinto item", mais comum)

> *"Ele te dará o que você pedir. E cobrará o que você não pediu."*

| | |
|---|---|
| **Origem** | São as **pequenas esferas da Árvore-Estrela** que a natureza espalhou ao se destruir. Cada uso consome um pedaço da Árvore para sempre (**Relógio do Eclipse +2%**) |
| **Estoque** | Fixo por mundo: `3 + 1 por jogador`. Kanata também os caça — cada um que ele obtém traz um Ressurgido de volta (doc 17) |
| **Raridade** | Incomum dentre os lendários: vários existem no mundo. Drop raro de vilões de alto escalão+ (3–25%) e segredos de subfases |
| **Limite** | **Cada jogador só pode usar UM amuleto em todo o jogo.** Depois de usar, outros amuletos que encontrar só servem como moeda de troca/presente (não pode usar de novo) |
| **Efeito** | O jogador **escolhe uma habilidade nova** descrevendo-a com suas palavras |

### Processo do desejo

1. Jogador usa `!amuleto` e descreve a habilidade (ex.: *"quero poder conversar com os mortos e pedir que lutem por mim"*).
2. O **Validador** (motor + IA com prompt próprio) checa a **Lista Proibida**:
   - imortalidade, não poder morrer, ressurreição ilimitada, invulnerabilidade;
   - alterar a estabilidade do mundo: destruir/criar reinos, parar o tempo global, apagar o Vazio, mudar o final da história;
   - onisciência, ver o roteiro, controlar o narrador/as regras/o bot;
   - alterar atributos permanentemente (próprios ou de outros jogadores), XP/nível infinito, mana infinita;
   - obter ou invocar itens lendários; matar instantaneamente reis/divindades/jogadores;
   - controle mental permanente de jogadores.
3. Se passar, o motor converte o desejo em uma **habilidade balanceada** com **orçamento de poder** pelo rank do jogador:
   custo de MP, cooldown, alcance, duração.
4. Toda habilidade recebe uma **Perdição**: um custo narrativo/mecânico proporcional (ex.: falar com os mortos →
   os mortos também te procuram à noite; −10% HP máx enquanto houver mortos invocados).
5. A IA narra o ritual; o jogador **confirma** (é irreversível). Gravado em `habilidade_amuleto`.
6. Se recusado, o amuleto **não é consumido** e a IA explica *in-character* por que os deuses recusaram.

---

## 6. Grimórios simples

São **40 grimórios** espalhados pelas subfases (lista completa gerada a partir de `data/grimorios.json`
em [06b-grimorios.md](06b-grimorios.md)).

| Rank | Qtd | Onde aparecem | Magias |
|:---:|:---:|---------------|--------|
| E | 4 | Subfases iniciais (nv 1–8), uma por reino | Básicas |
| D | 6 | Subfases nv 8–30 | Utilidade + ataque |
| C | 14 | Subfases nv 15–45 e Leilão de Kyōkai | Combos, invocações menores |
| B | 7 | Subfases nv 35–70 | Fortes, com efeito especial |
| A | 6 | Subfases lendárias de reino e andares 25/40 da Torre | Quase lendárias |
| S | 3 | Andares 70, 85 e 99 da Torre Sem Fim | Raríssimas |

- Equipar: Mago até 3; demais classes 1 (Anti-magia só os Manuais do Vazio).
- Cada grimório tem 3 magias; a **2ª e 3ª páginas** desbloqueiam usando a anterior 5× em batalha.
- **Dominar** (todas as magias usadas 10×) dá +5 Pureza permanente — crescimento por mérito.
- Grimórios podem ser **trocados** entre jogadores (`!trocar`) ou vendidos no Leilão de Kyōkai.
