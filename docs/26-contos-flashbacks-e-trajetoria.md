# 26 — Contos, Desafios, Flashbacks e Trajetória

> Dados em `data/contos.yaml` (validado por `python3 scripts/validar-historia.py`).

## 26.1 A filosofia: difícil de resolver, possível de viver

O jogo **não se resolve com força nem com sorte**. Os grandes desafios do final pedem coisas que **só se conquistam
vivendo a história**:

```
   TRAJETÓRIA (como você joga)  ──┐
   CONTOS (o que você fez)        ├──▶  CHAVES DE CONHECIMENTO  ──▶  soluções dos desafios finais
   FLASHBACKS (o que você viveu)  ┘         (pertencem a quem as viveu)
```

**Regras invioláveis para a IA:**
1. **Nunca** revelar uma Chave de Conhecimento a quem não a conquistou — nem como dica direta.
2. Dicas existem em **3 níveis** (vago → metáfora → "onde procurar") e cada nível **custa algo** (Mérito do grupo, tempo, Relógio).
3. **A chave é do jogador que a viveu.** Para o grupo usar, esse jogador precisa **contar** (`!contar` ou falando no grupo).
   Se esse jogador sair do jogo sem contar, o conhecimento se perde (há sempre uma 2ª forma de obter, mais difícil).
4. A IA julga respostas de enigmas por **significado** (aceita sinônimos), não por palavra exata.

### O que é preciso para o melhor final (e por que é difícil)

| Desafio final | Sem a chave | Com a chave |
|---------------|-------------|-------------|
| Entrar no Esquife | Tenmon no Tama **ou** rachar o selo (Relógio +10%) | **K06**: entra pela emenda de Gōzan |
| Vencer o Shokuō | Ele rouba cada habilidade usada (luta quase impossível) | **K09**: o grupo luta com básicos, combos e ações livres |
| Separar Nisteroy de Kaien | Ovo desperto + 3 Grandes Itens | **K02**: Ovo + o Nome Não Dado (só 2 itens) |
| Redimir Kaien | Impossível (só "destruir") | **K01** cantada + **K05** mostrada |
| Redimir Kanata | Ele luta até a morte | **K05** + **K12** + Dúvida ≥ 5 |
| Final do Selo sem sacrifício | Alguém morre para virar selo | **K03** completa (4 frases de 4 jogadores) + Shitenchō |
| Evitar a guerra Fogo × Água | Batalhas de guerra por 14 dias | **K04** mostrada aos dois reis |
| Excalibur | Mérito 500 | **K10**: Mérito 350 |

## 26.2 Chaves de Conhecimento (12)

| ID | Chave | Para que serve | Como se obtém |
|----|-------|----------------|---------------|
| K01 | A Canção do Vale | Abre a redenção de Kaien | FB01 *Pão de Cinza* · C17 *A Padeira de Kyōkai* |
| K02 | O Nome Não Dado | Separa Nisteroy com só 2 Grandes Itens | FB07 *O Ninho* (o nome é dito **uma única vez**) |
| K03 | As Palavras do Selo | Final do Selo sem sacrifício | FB03 *Quatro Coroas* (cada jogador aprende 1 das 4 frases) |
| K04 | A Confissão do Emissário | +2 Dúvida em Kanata; evita a guerra | FB04 · capturar o Leiloeiro (A3-M4) |
| K05 | O Perdão de Sayo | +3 Dúvida; redenção de Kanata e Kaien | Diário de Sayo (A2-DAI-3) · FB02 *O Poço* |
| K06 | A Costura do Esquife | Entrar sem Tenmon e sem rachar o selo | FB05 *A Forja de Gōzan* |
| K07 | Por que o Ovo Recusou | O ovo desperta mesmo com Corrupção até 40 | FB06 *As Lanternas de Tōya* |
| K08 | O Juramento de Kaishin | Kaishin confessa sem revolta | FB08 · SF-WAT-03 |
| K09 | A Lição de Ryūga | Vencer o Shokuō sem ter as técnicas roubadas | FB03 · C09 *O Velho que Lutou com um Deus* |
| K10 | O Quinto que Vier | Excalibur com Mérito 350 | FB09 *Para o Quinto que Vier* |
| K11 | A Rota das Lanternas | Pula 20 andares da Torre | FB06 · C20 *O Diário de Tōya* |
| K12 | O Medo de Kanata | +2 Dúvida; encerrar a luta sem morte | C14 *As Luvas de Yoru* · FB06 |

## 26.3 Ecos do Passado (flashbacks jogáveis)

O jogador **vive** um momento do passado na pele de outra pessoa. É o coração emocional do jogo.

**Como funciona:**
- Disparado por um **lugar + objeto + condição** (ex.: tocar a soleira queimada da casa de Kaien).
- O jogador recebe a **ficha do eco** (atributos do personagem histórico, não os seus) e joga **no privado**
  (FB03 e FB10 são em grupo).
- **O passado não muda.** Kaien sempre aceita a oferta; Sayo sempre fica no poço. Mas **as escolhas do jogador
  revelam fragmentos diferentes** — dois jogadores que vivem o mesmo flashback podem descobrir coisas diferentes.
- **Cair ou "forçar" o personagem** contra a natureza dele desfaz a memória: nova tentativa em 24 h.
- O fim de cada eco grava uma **Lembrança** no `!pistas` do jogador (texto + Chave, se houver).
- Visual: as mensagens do eco usam um marcador próprio (`🕯️ ECO DO PASSADO`) e a IA narra no pretérito, em tom sépia.

| ID | Eco | Quem você é | Gatilho | Desafio | Chave |
|----|-----|-------------|---------|---------|-------|
| FB01 | Pão de Cinza | Kaien, na véspera do roubo | Soleira das Ruínas de Hinata | Diálogo (tentar fazê-lo recusar) | K01 |
| FB02 | O Poço | Sayo, 7 anos, na noite do fogo | Poço Seco / Diário na lua nova | Furtividade com 1 HP | K05 |
| FB03 | Quatro Coroas | Os 4 reis antigos (1 jogador cada) | Shitenchō reunido na Muralha / A4-M3 | Debate: o acordo só sai se compartilharem segredos | K03, K09 |
| FB04 | O Homem do Manto | O emissário | Manto do Leiloeiro / Anel dos Quatro Brasões | Dilema (tentar fazê-lo pagar Kaien) | K04 |
| FB05 | A Forja de Gōzan | Rei Gōzan forjando o Esquife | Coração da Montanha vencido | Ritmo (sequência escondida no G21) | K06 |
| FB06 | As Lanternas de Tōya | Tōya descendo a Torre | Andar 30 / diário de Tōya | Convencer Tōya a desistir (Juiz ≥ 8) | K07, K11, K12 |
| FB07 | O Ninho | Nisteroy na noite do roubo | Portador dorme no Ninho Vazio | **Memória**: o nome é dito uma vez | K02 |
| FB08 | O Juramento | Kaishin jovem | Reflexo do Ontem na lua cheia | Recusar ou aceitar o juramento | K08 |
| FB09 | Para o Quinto que Vier | Rei Tsukumo | Tocar a pedra sem puxar a espada | Escrever a frase gravada (a sua frase fica na pedra para todos) | K10 |
| FB10 | Dois Lutos | Kaien e Nisteroy (party) | Ato IV, com K01 e K02 ou Kanata redimido | Dizer o que mais dói (sinceridade) | Shokuō começa na fase 2 |

## 26.4 Contos (20 histórias secundárias)

Contos são histórias de 2 a 4 etapas espalhadas pelo mundo. **Todo conto liga-se ao mistério principal**: uma pista,
uma testemunha, uma Chave ou um aliado para o final. Lista completa em `data/contos.yaml`. Destaques:

| ID | Conto | Região | Tipo de desafio | Por que importa |
|----|-------|--------|-----------------|-----------------|
| C01 | A Criança da Mina | Deserto de Haijin | Dilema | Salamandra que detecta cristais negros |
| C05 | Os Círculos no Trigo | Planícies Kogane | **Enigma** (alfabeto antigo) | Primeira pista física do Ovo |
| C09 | O Velho que Lutou com um Deus | Cordilheira Tetsuzan | **Prova** (vencer sem habilidades) | K09 |
| C10 | O Leilão da Pena | Kyōkai | **Leilão entre jogadores** | Conflito real entre jogadores |
| C13 | O Nome na Cachoeira | Cachoeiras | Batalha Mortal anunciada com 7 dias | Mostra que o destino pode mudar |
| C14 | As Luvas de Yoru | Kyōkai | Furtividade social | K12 e a identidade de Yoru |
| C17 | A Padeira de Kyōkai | Kyōkai | **Tempo real** (só ao amanhecer) | K01 sem ir ao Vale |
| C19 | Os Três Mentirosos | Kyōkai | **Enigma lógico** | Atalho em A3-M6 |
| C20 | O Diário de Tōya | Cratera | Escalada (5 testes) | Abre o FB06 |

### Tipos de desafio
| Tipo | Como funciona |
|------|---------------|
| **Enigma** | Resposta única, julgada por significado. 3 dicas progressivas; cada uma custa 10 de Mérito do grupo |
| **Dilema** | Nenhuma escolha é a certa; as consequências chegam dias depois |
| **Investigação** | Pistas em NPCs e lugares; `!acusar` errado custa caro |
| **Prova** | Regra especial (sem itens, sem habilidades, só ação livre…) |
| **Cooperativo** | Exige 2+ jogadores de classes/elementos diferentes na mesma rodada |
| **Tempo real** | Só funciona num horário, dia da semana ou estação real |
| **Escolta** | Proteger um NPC que não pode cair |
| **Memória** | Informação dita uma única vez; a IA não repete |

### Exemplo de enigma (C19 — Os Três Mentirosos)
> *Akai diz: "O núcleo está no porto. Shiro mente." · Shiro diz: "O núcleo não está no porto. Kuro diz a verdade." ·
> Kuro diz: "Akai mente. O núcleo está na torre." — Um deles diz a verdade nas duas frases; os outros dois mentem nas duas.*
> **Solução:** Akai. Se Shiro fosse o verdadeiro, Kuro também seria (dois verdadeiros: impossível). Se Kuro fosse,
> "Akai mente" tornaria verdade que "Shiro mente"… é falso, então Shiro seria verdadeiro (impossível). Só Akai fecha.
> O núcleo está **no porto**. A IA aceita "porto", "no cais", "Akai está certo" etc.

## 26.5 Marcas de Trajetória

O jogo observa **como** cada jogador joga e transforma padrões em **identidade**. As marcas aparecem na carta,
mudam diálogos, abrem opções no Momento Decisivo (doc 25.7) e entram no **epílogo pessoal**.

| ID | Marca | Como se conquista | O que muda |
|----|-------|-------------------|------------|
| T01 | Misericordioso | Poupar 10 rendidos | Poupados voltam como aliados; opção de diálogo com Kaien |
| T02 | Implacável | Finalizar 15 rendidos | +10% dano em quem fugiu; NPCs temem você; Nisteroy ganha uma fase contra você |
| T03 | Erudito | Ler 8 registros | Decifra runas; +1 dica grátis por enigma |
| T04 | Andarilho | Visitar todas as regiões | Viagens −25%; atalhos em subfases |
| T05 | Amigo das Feras | Domar 3 animais, nunca matar pacíficos | Animais avisam emboscadas; Grifo-Real sem prova |
| T06 | Escudo dos Outros | Proteger 40 vezes | Proteger grátis 1× por batalha |
| T07 | Língua de Prata | Resolver 5 histórias por diálogo | Vantagem em persuasão; debates com Kanata |
| T08 | Sombra | 5 desafios furtivos sem ser visto | Imune a emboscadas; furtar com vantagem |
| T09 | Fiel à Palavra | Cumprir 10 acordos, nunca quebrar | Peso em julgamentos; Excalibur −50 de Mérito |
| T10 | Traidor | Trair ou quebrar 2 acordos | **Permanente**, visível na carta; Kanata oferece mais |
| T11 | Lembrador | Viver 4 flashbacks | +1 Dúvida em toda conversa com Kanata |
| T12 | Sobrevivente | Sobreviver a 3 Batalhas Mortais | −1 Marca da Morte permanente |

Marcas podem **conflitar** (Misericordioso e Implacável não convivem: a mais recente apaga a outra). T10 nunca some.
