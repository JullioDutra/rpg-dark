# 30 — Infraestrutura: WhatsApp (Evolution API), Vercel e Banco de Dados

## 30.1 Respostas rápidas

| Pergunta | Resposta |
|----------|----------|
| **Pode ser a Evolution API?** | **Sim — é a recomendação.** Ela usa o Baileys por baixo (o que o planejamento já previa), expõe uma API REST e manda os eventos por **webhook**. Suporta grupos, menções, mídia, enquetes e edição de mensagens (confirmar os endpoints na versão instalada, ver 30.3) |
| **Já tenho um bot em outro número na Evolution. Atrapalha?** | **Não atrapalha.** A Evolution roda **várias instâncias** (uma por número) no mesmo servidor, cada uma com sessão e fila próprias. Basta criar uma **nova instância** para o número do RPG |
| **Preciso subir outro serviço da Evolution?** | **Não.** Use o mesmo servidor e configure o **webhook só da instância nova** para a URL do jogo. Se o seu servidor usa um **webhook global**, o jogo filtra pelo campo `instance` e ignora os eventos do outro bot |
| **Dá para rodar na Vercel?** | **O servidor do jogo, sim. A Evolution, não.** A Evolution precisa de uma conexão permanente com o WhatsApp (ela continua onde está hoje). O jogo é feito de "reações a eventos" (webhook → processa → responde), o que combina com funções da Vercel. Os temporizadores ficam no banco (30.4) |
| **Banco de dados?** | **Supabase (Postgres).** O esquema está pronto e testado (`db/migrations/0001_esquema_inicial.sql`). Falta escolher o projeto (30.6) |

## 30.2 Arquitetura

```
             WhatsApp (grupo + privados)
                       ▲   │
                       │   ▼
   ┌──────────────────────────────────────────┐
   │  EVOLUTION API (seu servidor atual)       │
   │   instância "bot-antigo"  → webhook dele  │
   │   instância "rpg-yotsuhoshi" ─────────────┼──┐  POST /api/webhook/evolution
   └──────────────────────────────────────────┘  │   (header com segredo)
                       ▲                         ▼
                       │ REST: sendText, sendMedia, sendPoll, updateMessage
   ┌───────────────────┴──────────────────────────────────────────────┐
   │  VERCEL — servidor do jogo (Node.js, Fluid compute)               │
   │   /api/webhook/evolution  recebe → responde 200 rápido → processa │
   │                           (waitUntil)                             │
   │   /api/tick               chamado a cada minuto pelo banco        │
   │   src/linguagem  src/regras  src/avatar  src/mapa  narrador (IA)  │
   └──────┬──────────────────────────────────┬────────────────────────┘
          │ SQL (pooler, modo transação)      │ HTTPS
          ▼                                   ▼
   ┌───────────────────────────────┐   ┌─────────────────────┐
   │ SUPABASE                       │   │ Claude API (IA)     │
   │  Postgres (schema "jogo")      │   │  narração, Juiz de  │
   │  pg_cron → chama /api/tick     │   │  Táticas, diálogo   │
   │  Storage (cartas e avatares)   │   └─────────────────────┘
   └───────────────────────────────┘
```

## 30.3 Evolution API — configuração da instância do RPG

1. Criar a instância (painel da Evolution ou API): nome `rpg-yotsuhoshi`, integração **WHATSAPP-BAILEYS**.
2. Ler o QR code com o **número dedicado ao RPG** (nunca o mesmo número do outro bot — conectar o mesmo número em
   duas sessões causa desconexões).
3. Webhook **da instância** (`POST /webhook/set/rpg-yotsuhoshi`) apontando para
   `https://<seu-projeto>.vercel.app/api/webhook/evolution`, com os eventos:
   `MESSAGES_UPSERT` (mensagens novas), `MESSAGES_UPDATE` (votos de enquete, edições), `GROUP_PARTICIPANTS_UPDATE`
   (entrou/saiu do grupo), `CONNECTION_UPDATE` (bot caiu/voltou).
4. Recursos usados pelo jogo e o que conferir na sua versão da Evolution v2:

| Recurso | Uso no jogo | Conferir |
|---------|-------------|----------|
| Enviar texto com menções | Tudo | `sendText` com `mentioned` |
| Enviar imagem com legenda | Cartas, mapas, avatares | `sendMedia` |
| **Editar mensagem** | Painel de batalha "vivo" | Endpoint de edição (ex.: `/chat/updateMessage/{instancia}`). Se a sua versão não tiver, o jogo usa o modo **"apagar e reenviar"** ou manda o painel novo a cada rodada (configurável) |
| **Enquete** | Votos de party, encruzilhadas, júri | `sendPoll` + votos chegando em `MESSAGES_UPDATE` |
| Reações | ✅ ao receber ação, atalhos 👍 | `sendReaction` |
| Grupos | Metadados, participantes | Endpoints de grupo |

**Risco do Baileys (não oficial):** o número pode ser banido se parecer spam. Mitigações já no projeto: número
dedicado, limites de envio (doc 22.2), edição em vez de muitas mensagens, horário silencioso.

## 30.4 Rodando na Vercel: como resolver o que é "contínuo"

Funções serverless não ficam ligadas esperando. O jogo foi desenhado para isso:

| Necessidade | Solução |
|-------------|---------|
| Prazo de rodada (90–120 s) | O prazo fica gravado em `jogo.batalhas.prazo`. A rodada é resolvida **quando todos agem** (na hora) **ou** pelo `/api/tick` (o banco chama a cada minuto via `pg_cron`). Na prática, rodadas sem todos os votos fecham entre 90 s e ~150 s |
| Crises, regeneração, sussurros, estações | Tarefas em `jogo.agendamentos`, consumidas pelo tick com `FOR UPDATE SKIP LOCKED` |
| Vigor regenerando | Calculado **sob demanda** (`vigor` + horas desde `vigor_em`), sem timer |
| Duas mensagens ao mesmo tempo na mesma batalha | `jogo.travar_batalha()` (trava de transação por batalha) |
| Webhook reenviado | `jogo.mensagens_processadas` (cada mensagem é processada uma vez) |
| Resposta lenta da IA | O webhook responde 200 na hora e continua o processamento com `waitUntil` (Fluid compute) |
| Conexões com o banco | Pooler do Supabase em **modo transação** (porta 6543) — funções serverless abrem e fecham conexões o tempo todo |
| Imagens | Avatares e mapas já são gerados em **JavaScript puro** (sem navegador). As cartas HTML (hoje via Playwright/Chromium) serão portadas para `@vercel/og` (satori), que roda em função da Vercel |
| Arquivos gerados | Supabase Storage (bucket `cartas`), enviados por URL para a Evolution |

> Limites de duração de função e de Cron variam por plano da Vercel. O desenho acima **não depende** do Cron da
> Vercel (quem agenda é o `pg_cron` do Supabase) e cada chamada é curta (segundos).

**Alternativa sem Vercel:** se preferir tudo num lugar só, o mesmo código roda como um serviço Node no **mesmo
servidor da Evolution** (Docker), com o tick em memória. A escolha não muda nada no resto do projeto.

## 30.5 Variáveis de ambiente (Vercel)

| Variável | Para quê |
|----------|----------|
| `EVOLUTION_URL` | URL do seu servidor da Evolution |
| `EVOLUTION_API_KEY` | Chave da Evolution (guardada como segredo na Vercel) |
| `EVOLUTION_INSTANCIA` | `rpg-yotsuhoshi` |
| `WEBHOOK_SECRET` | Segredo que a Evolution manda no header do webhook |
| `DATABASE_URL` | Connection string do pooler do Supabase (modo transação) |
| `TICK_SECRET` | Segredo do `/api/tick` (o mesmo guardado no Vault do Supabase) |
| `ANTHROPIC_API_KEY` | IA narradora |
| `TELEFONE_SAL` | Sal para o hash dos números |
| `ADMINS` | Números que podem usar comandos `/admin` |

## 30.6 Banco de dados — situação da sua conta Supabase

Na sua conta existem 3 projetos, **todos pausados (inativos)**: *JullioDutra's Project* (us-east-1), *cadrius-backups*
(sa-east-1) e *trama-cp* (sa-east-1). Para o jogo, a recomendação é **um projeto novo e dedicado** chamado
`rpg-dark`, na região **sa-east-1 (São Paulo)**, mais perto dos jogadores; as funções da Vercel devem ficar na mesma região (`gru1`, São Paulo).

Passos depois de escolher o projeto:
1. Aplicar `db/migrations/0001_esquema_inicial.sql` (testado localmente com `bash db/testar-migracoes.sh`).
2. Ativar `pg_cron` e `pg_net`, guardar o `tick_secret` no Vault e rodar `db/supabase/agendar-tick.sql`.
3. Criar o bucket `cartas` no Storage.
4. Copiar a connection string do pooler para `DATABASE_URL` na Vercel.

## 30.7 Ordem de implantação

```
1. Supabase: projeto + migração + pg_cron            (banco pronto)
2. Vercel: projeto rpg-dark + variáveis + deploy     (webhook e tick no ar)
3. Evolution: instância rpg-yotsuhoshi + QR + webhook (bot conectado)
4. Grupo de teste: /ativar-mundo → "entrar no mundo" (primeiro jogador)
```
