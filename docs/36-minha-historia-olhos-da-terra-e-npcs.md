# 36 — Minha história, Olhos da Terra e as novas personagens

## 36.1 Minha história

**Objetivo:** dar ao jogador um espaço para dizer quem é o personagem, e fazer o mundo reagir a isso, sem abrir brecha para ganhar poder.

### Como funciona hoje (implementado)

| Comando (no privado) | O que faz |
|----------------------|-----------|
| `minha história` | Mostra o que já foi escrito e explica as partes |
| `minha história origem <texto>` | De onde você veio e como cresceu |
| `minha história sonho <texto>` | O que você mais quer |
| `minha história medo <texto>` | O que você teme ou evita |
| `minha história laço <texto>` | Alguém importante para você |
| `minha história segredo <texto>` | Algo que só você sabe. **Ninguém mais vê**: só o narrador conhece |
| `minha história <texto>` | Uma parte livre, para o que não coube nas outras |
| `minha história apagar` | Volta à página em branco |
| `historia @pessoa` (no grupo) | Mostra a história de alguém, sem o segredo |

**Regras**
- Cada parte tem de 15 a 350 letras; até 6 edições por dia.
- **Não dá poder.** O texto é recusado se pedir atributo, falar em ser imortal, "o mais forte", porcentagens, ser filho de rei ou de deus.
- **Não mexe na história do mundo.** Não pode citar Kaien, Nisteroy, Sayo, Kanata, o Ovo, o Esquife, os núcleos nem os Grandes Itens.
- O **narrador** e os **NPCs** recebem a história como "sabor da cena", com a instrução de nunca transformar aquilo em poder, item, título ou parentesco.
- O **segredo** vai para a IA marcado como algo que nenhum personagem do mundo conhece: ela pode criar clima, nunca revelar.

### Próximas etapas planejadas

| Etapa | O que entra | Por que vale |
|:---:|-------------|--------------|
| 1 | **Perguntas guiadas na criação** (opcional): logo após a carta, o bot pergunta origem e sonho em duas mensagens | Quem nunca escreveria uma história passa a ter uma |
| 2 | **Fio pessoal:** a cada 5 níveis, o motor escolhe uma parte da história (laço, medo ou sonho) e a IA cria uma cena curta em torno dela, num lugar real do mundo | A história vira jogo, não só texto |
| 3 | **O laço vira gente:** se o jogador citar alguém (irmão, mestra), essa pessoa pode aparecer como NPC pessoal numa região, com retrato próprio | Dá um motivo para viajar |
| 4 | **Kanata usa o medo e o segredo:** as ofertas de pacto passam a citar o medo; quem tem segredo recebe sussurros sobre ele | O vilão manipulador fica pessoal |
| 5 | **Marca de trajetória:** ao zerar, o epílogo cita origem e sonho e diz se o sonho se cumpriu | Fecha o arco do personagem |
| 6 | **Roda de histórias no grupo:** uma vez por semana, o bot convida alguém a contar um trecho; os outros reagem e a pessoa ganha mérito | Aproxima o grupo |

Limites que continuam valendo em todas as etapas: nada de atributos, itens ou vantagens de luta saindo da história pessoal.

## 36.2 Olhos da Terra (地眼)

Técnica dos filhos da terra: quem aceita **perde a visão para sempre** e passa a "ver" pelo chão.

| | |
|---|---|
| **Quem pode** | Elemento Terra (qualquer variante) ou nascidos em Daichi |
| **Como conseguir** | Fazer amizade com a **Mestra Tsuchi**, em Ishigaki (Cordilheira Tetsuzan): na segunda conversa ela entrega o pergaminho. `usar pergaminho` → `aceitar a terra` |
| **Pelo administrador** | No grupo: `conceder terra @pessoa` (ou o nome do personagem). Vale para qualquer jogador |
| **Aparência** | O avatar passa a usar uma venda nos olhos; o grupo é avisado |
| **Ganha** | *Onda Sísmica* (golpe pelo chão; o inimigo perde a vez) · *Ler o Chão* (esquiva 70% e prepara o próximo golpe, +50%) · **+2 no dado ao defender** |
| **Perde** | **−2 no dado ao atacar** espíritos e deuses (não tocam o chão), e sem o bônus de defesa contra eles |
| **Custo** | As duas habilidades usam mana; para classes sem mana, custam zero |

É uma troca de verdade: ótima contra bandidos, feras e gigantes; perigosa contra fantasmas, e a reta final tem vários.

## 36.3 Personagens e retratos

- **63 NPCs, 40 femininas.** As 16 novas: Mestra Tsuchi, Kaede, Mio, Tsubaki, Homare, Nagisa, Kasumi, Akemi, Fuyu, Shion, Koto, Tsubame, Kon, Sora, Aoi e Ran.
  Cada uma tem jeito de falar e sabe algo que liga a região à história principal.
- **Todo NPC tem retrato em pixel art**, coerente com gênero, idade, ofício e reino. O retrato aparece em toda conversa (`falar <nome>`).
  Galeria em `assets/avatares/mundo/galeria.png` (`node scripts/render-npcs.mjs`).
- **Criação de personagem:** a primeira pergunta da aparência é *feminino* ou *masculino*. O avatar feminino ganha cílios e lábios;
  há 4 cabelos novos (maria-chiquinha, rabo de cavalo alto, ondulado, liso com franja reta) e os acessórios flor, laço e brincos.
- Os textos de luto, amizade e vingança agora concordam com o gênero do NPC.
