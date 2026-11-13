# 45 — Evento: o Grimório das Sete Luzes

Um 41º grimório, único no mundo, conquistado num evento que o mestre inicia. Código: `src/servidor/seteluzes.mjs`, artes em `src/avatar/especiais.mjs`
(`docs/img/dragao-da-aurora.png`, `docs/img/grimorio-sete-luzes.png`).

## 45.1 Roteiro

| Fase | O que acontece |
|------|----------------|
| 1. Chamado | O mestre digita `mestre sete luzes` no privado. O grupo recebe a imagem do grimório e o chamado: a aurora desceu sobre a **Geleira Hyōga** (Watatsumi, região 5). Nada diz que o livro é um só |
| 2. Escolha | Cada jogador responde `aceitar missão` ou `recusar missão` (no grupo ou no privado). A escolha é única: não dá para voltar atrás |
| 3. Luta | Só quem aceitou encontra **Kōryū, o Dragão da Aurora**. É preciso ir até a geleira (`viajar Geleira Hyōga`) e usar `golpear`: a mesma luta em grupo das ameaças, com menu de habilidades e vida compartilhada. O chamado dura 3 dias |
| 4. Revelação | Quando o dragão cai, o grupo descobre: há um livro só, e várias pessoas que lutaram por ele |
| 5. Disputa | `votar <nome>` (um voto por participante; quem passar da metade leva) ou `duelo @pessoa` entre dois participantes (quem perde sai da disputa; se sobrar um, ele leva). Prazo de 24 horas; sem decisão, vai para o mais votado e, no empate, para quem mais feriu o dragão |
| 6. Entrega | O vencedor recebe o grimório, o grupo recebe o anúncio com a imagem, e as sete luzes "se apagam" |

Se só uma pessoa lutou, ela leva o livro direto, sem disputa.

## 45.2 Quem recusa

Não encontra o caminho (o `golpear` na geleira responde que a aurora passa por cima). Em troca, recebe no privado **ecos do menino que roubou o ovo**: um ao recusar e outro quando o dragão cai.
São quatro fragmentos curtos (a mãe que tossia ao fazer pão no Vale de Hinata, a irmã Sayo, as moedas debaixo do poço, o homem com o anel de quatro brasões), sem nome e sem contar o fim da história.

## 45.3 O grimório

**Grimório das Sete Luzes** — rank S, todas as classes (inclusive Anti-magia), a partir do nível 15. Não se acha explorando nem em capítulos.

| Magia | Efeito na batalha |
|-------|-------------------|
| Arco das Sete Luzes (30 de mana) | 7 golpes de força 0,4 |
| Véu da Aurora (25 de mana) | Cura 30% da vida e protege |
| Sétima Luz (45 de mana) | Força 2,4, atravessa 40% da defesa |

## 45.4 Comandos do mestre

| Comando | Efeito |
|---------|--------|
| `mestre sete luzes` | Abre o chamado (um por mundo; não abre se o grimório já tem dono) |
| `mestre sete luzes status` | Quem aceitou, quem recusou, vida do dragão, quem disputa e os votos |
| `mestre sete luzes entregar <nome>` | Encerra a disputa dando o livro a alguém |

## 45.5 Limites conhecidos

- A vida do dragão é calculada pelos jogadores do mundo no momento do chamado, não pelo número de quem aceitou.
- Se ninguém derrubar o dragão em 3 dias, ele vai embora com a mensagem padrão das ameaças; o mestre pode abrir o chamado de novo.
- Quem tem pacto com o dragão não pode golpeá-lo (regra geral dos pactos com monstros).
