# 30 — Infraestrutura: WhatsApp (Evolution API), Vercel, Neon e IA

## 30.1 Decisões

> Duas configurações possíveis, com o mesmo código: **Neon + Vercel** (abaixo) ou **tudo no VPS** (seção 30.7).

| Peça | Escolha | Onde roda |
|------|---------|-----------|
| WhatsApp | **Evolution API** — nova instância `rpg-yotsuhoshi` no **seu servidor atual** (o bot do outro número continua igual) | Seu VPS |
| Servidor do jogo | Funções Node da **Vercel** (webhook + tick) | Vercel (região `gru1`, São Paulo) |
| Banco | **Neon Postgres** pela integração da Vercel (Marketplace) | Neon (região São Paulo) |
| Relógio de prazos | **`relogio/`** — serviço minúsculo sem dependências | Seu VPS, ao lado da Evolution |
| Imagens geradas (cartas, mapas) | **Vercel Blob** | Vercel |
| IA narradora | **Sabiá (Maritaca) ou Claude (Anthropic)** — trocável por variável de ambiente, com um como reserva do outro | APIs externas |

## 30.2 Arquitetura

```
             WhatsApp (grupo + privados)
                       ▲   │
                       │   ▼
   ┌───────────── SEU VPS ──────────────────────────┐
   │ EVOLUTION API                                   │
   │   instância do bot antigo  → webhook dele        │
   │   instância rpg-yotsuhoshi ─────────────────────┼──┐ POST /api/webhook/evolution
   │ RELÓGIO (relogio/servidor.mjs, Docker)          │  │
   │   guarda prazos e chama /api/tick na hora certa ─┼──┤ POST /api/tick
   └──────────────────▲──────────────────────────────┘  │
                      │ REST: sendText, sendMedia,       ▼
                      │ sendPoll, updateMessage   ┌──────────────────────────────────┐
                      └───────────────────────────│ VERCEL — servidor do jogo         │
                                                  │  webhook → interpreta → regras →  │
   ┌───────────────────────┐   SQL (driver Neon)  │  IA → responde                    │
   │ NEON Postgres          │◀────────────────────│  agenda prazos no relógio         │
   │  schema "jogo"         │                     └───────┬──────────────────────────┘
   └───────────────────────┘                             │ HTTPS
                                       ┌─────────────────┴─────────────────┐
                                       │ Maritaca (Sabiá)  │  Anthropic (Claude) │
                                       └───────────────────┴─────────────────────┘
```

## 30.3 Evolution API

**Ter outro bot em outro número não atrapalha** e **não é preciso subir outro serviço da Evolution**: ela roda
várias instâncias (uma por número), cada uma com sua sessão.

1. Criar a instância `rpg-yotsuhoshi` (integração **WHATSAPP-BAILEYS**) e ler o QR com o **número dedicado ao RPG**.
2. Webhook **da instância** (não o global) → `https://rpg-dark.vercel.app/api/webhook/evolution`, eventos:
   `MESSAGES_UPSERT`, `MESSAGES_UPDATE` (votos de enquete), `GROUP_PARTICIPANTS_UPDATE`, `CONNECTION_UPDATE`.
   Se o servidor usar webhook global, o jogo filtra pelo campo `instance`.
3. Recursos que o jogo usa (conferir na versão instalada): `sendText` com menções, `sendMedia`, `sendPoll`,
   `sendReaction` e edição de mensagem (ex.: `/chat/updateMessage/{instancia}`). Sem edição, o painel de batalha
   passa a ser reenviado a cada rodada (configurável).

## 30.4 Banco: Neon (pela Vercel)

**Como criar:** no painel da Vercel → *Storage* → *Create Database* → **Neon** → região **São Paulo** → conectar ao
projeto do jogo. A integração cria a variável `DATABASE_URL` no projeto (ou pela CLI: `vercel integration add neon`).

**Esquema:** `db/migrations/0001_esquema_inicial.sql` é Postgres padrão (sem nada específico de Supabase) e foi
testado num Postgres real (`bash db/testar-migracoes.sh`). Basta rodá-lo uma vez no SQL Editor do Neon.

**Conexão a partir da Vercel:** driver `@neondatabase/serverless` com a URL **pooled** (`-pooler` no host). Transações
curtas: a trava por batalha (`jogo.travar_batalha`) e a fila (`SKIP LOCKED`) funcionam normalmente.

### Por que um relógio no VPS (e não um tick a cada minuto)

No plano gratuito do Neon o banco **dorme após 5 min** sem uso e há uma **cota mensal de horas de computação**
(~100 CU-horas por projeto; ~400 h numa máquina de 0,25 CU). Um tick a cada minuto manteria o banco acordado o mês todo
(~730 h) e **estouraria a cota**, suspendendo o banco até o mês seguinte. A solução:

| Necessidade | Como resolve |
|-------------|--------------|
| Fim de rodada (90–120 s) | Ao abrir uma rodada, o jogo agenda no relógio: `POST /agendar {id:"rodada:42", quando, url:"/api/tick"}`. Se todos agirem antes, o jogo cancela. **Nenhum prazo = nenhuma chamada = banco dormindo** |
| Crises, sussurros, estações, eventos semanais | Também agendados no relógio (o mesmo `id` substitui o anterior) |
| Vigor | Calculado sob demanda (sem timer) |
| Bot reiniciou / relógio reiniciou | O relógio grava a agenda em arquivo; o jogo também grava prazos em `jogo.batalhas.prazo` e `jogo.agendamentos`, e confere vencidos a cada mensagem recebida |

O relógio (`relogio/servidor.mjs`) não tem dependências e tem teste (`node scripts/testar-relogio.mjs`). Para subir:

```bash
docker build -t rpg-relogio relogio/
```

```bash
docker run -d --name rpg-relogio --restart unless-stopped -p 8787:8787 -v rpg-relogio:/dados -e RELOGIO_SEGREDO=<segredo> -e RELOGIO_URLS=https://rpg-dark.vercel.app/ rpg-relogio
```

## 30.5 IA: Sabiá ou Claude?

**Não precisa ser o Claude.** O jogo só pede à IA uma coisa: um JSON no formato do narrador (`src/ia/esquemas.mjs`),
e o motor valida tudo antes de aplicar. A camada `src/ia/provedores.mjs` funciona com os dois:

| | **Sabiá (Maritaca)** | **Claude (Anthropic)** |
|--|----------------------|------------------------|
| Português do Brasil | Treinado com foco em PT-BR | Muito bom |
| Formato da resposta | Esquema vai no prompt + validação + **1 correção automática** (não há saída estruturada documentada) | **Saída estruturada garantida** pelo modelo (`output_config.format`) |
| Contexto grande e repetido (Bíblia do Mundo) | Cobrado a cada chamada | **Prompt caching** reduz custo e latência do trecho repetido |
| Recusas | — | Tratadas; o jogo usa **fallback do servidor** (`fallbacks: "default"`) para outro modelo quando um recusa |
| Preço (página da Maritaca) | Sabiá-4: R$ 5 / R$ 20 por 1M tokens · Sabiazinho-4: R$ 1 / R$ 4 | Claude Opus 5.5: US$ 4 / US$ 20 por 1M tokens (modelo padrão do código) |
| Uso no jogo | Narração e diálogos (volume alto, custo baixo) | Opcional: Juiz de Táticas, finais e cenas grandes, ou reserva |

**Recomendação:** começar com **Sabiá como principal e Claude como reserva** (`comReserva`), ou só Sabiá. Lembrando
que ~85% das mensagens nem chegam na IA (doc 24) — a conta de IA fica pequena.

Testes da camada de IA (sem gastar crédito): `node scripts/testar-ia.mjs` — 11 testes (JSON com crases, correção
automática, recusa, provedor reserva, eventos proibidos descartados, IA fora do ar não trava o jogo).

> O nome exato do modelo da Maritaca (ex.: `sabiazinho-4`) vai na variável `MARITACA_MODELO` — confirme o
> identificador na plataforma da Maritaca ao criar a chave.

## 30.6 Variáveis de ambiente (Vercel)

| Variável | Para quê |
|----------|----------|
| `DATABASE_URL` | Criada pela integração Neon (usar a URL pooled) |
| `BLOB_READ_WRITE_TOKEN` | Criada ao conectar um Vercel Blob (cartas e mapas) |
| `EVOLUTION_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCIA` | Envio de mensagens pela Evolution |
| `WEBHOOK_SECRET` | Confere que o webhook veio da sua Evolution |
| `RELOGIO_URL`, `RELOGIO_SEGREDO` | Agendar prazos no relógio do VPS (o mesmo segredo do container) |
| `IA_PROVEDOR` | `maritaca` ou `anthropic` |
| `MARITACA_API_KEY`, `MARITACA_MODELO` | Sabiá |
| `ANTHROPIC_API_KEY` | Claude (principal ou reserva) |
| `TELEFONE_SAL`, `ADMINS` | Hash dos números e números de admin |

Chaves e segredos ficam como **variáveis secretas na Vercel**, nunca no código nem no chat.

## 30.7 Alternativa: banco no seu VPS (e o jogo junto)

Usar um Postgres no VPS **funciona e é a opção mais barata e simples**, com uma condição: **o servidor do jogo vai
para o VPS também.** Banco no VPS com o jogo na Vercel é a pior das combinações.

| | Neon + Vercel | **Tudo no VPS** (Evolution + Postgres + jogo + relógio) | Postgres no VPS + jogo na Vercel ❌ |
|--|--|--|--|
| Custo | Grátis até a cota; depois pago | **Zero extra** (o VPS já existe) | Zero extra |
| Cota / banco dormindo | Sim (por isso o relógio) | **Não existe** | Não existe |
| Segurança do banco | Gerenciada pelo Neon | **Banco fechado**: só os containers o enxergam, nenhuma porta aberta para a internet | Postgres **exposto na internet** (a Vercel não tem IP fixo no plano comum para liberar no firewall) |
| Velocidade | Vercel e Neon em São Paulo | **Mais rápido**: jogo, banco e Evolution na mesma máquina | Cada consulta atravessa a internet |
| Backups | Automáticos (Neon) | **Sua responsabilidade**: o compose já faz backup diário (`deploy/backup.sh`); copie para fora do VPS de vez em quando | Sua responsabilidade |
| Se o VPS cair | O jogo fica sem WhatsApp do mesmo jeito (a Evolution está lá) | Tudo cai junto, mas já cairia (Evolution) | Igual |
| Manutenção | Quase nenhuma | Atualizar containers, olhar disco | A pior das duas |
| Recursos do VPS | — | Postgres ~150–300 MB de RAM, limitado a 512 MB no compose | — |

**Com tudo no VPS:** o relógio continua útil (prazos exatos), mas sem a pressa de economizar cota. O jogo vira um
serviço Node comum (`jogo` no `deploy/docker-compose.yml`, próxima etapa), a Evolution manda o webhook para
`http://jogo:3000` pela rede interna, e a Vercel deixa de ser necessária. **O código é o mesmo nas duas opções:**
só muda a `DATABASE_URL`.

### Subir no VPS

```bash
cd deploy && cp .env.exemplo .env
```

Edite o `.env` (senhas longas) e suba:

```bash
docker compose up -d
```

- O esquema do banco é aplicado **automaticamente na primeira subida** (pasta `db/migrations` montada no Postgres).
- O Postgres fica em `127.0.0.1:5433` só para você administrar por túnel SSH; não abra essa porta no firewall.
- Backups diários em `deploy/backups/` (mantém 14 dias).
- Se a sua Evolution já tem um Postgres próprio, **não reutilize**: o container separado isola os dados do jogo.

## 30.8 Ordem de implantação

```
1. Vercel: criar o projeto rpg-dark ligado ao GitHub (região gru1)
2. Vercel → Storage: criar Neon (São Paulo) e Blob, conectar ao projeto
3. Neon SQL Editor: rodar db/migrations/0001_esquema_inicial.sql
4. VPS: subir o relógio (Docker) e criar a instância rpg-yotsuhoshi na Evolution
5. Vercel: variáveis de ambiente + deploy
6. Grupo de teste: /ativar-mundo → "entrar no mundo"
```
