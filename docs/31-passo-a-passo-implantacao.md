# 31 — Passo a passo da implantação (Vercel + Neon + Evolution)

Configuração escolhida: **jogo na Vercel**, **banco Neon** (pela Vercel), **Evolution no seu servidor atual** (nova
instância) e **relógio** no mesmo servidor. Marque cada item ao concluir.

> Enquanto você faz os passos 1–5, eu escrevo o servidor do bot (webhook, entrada no mundo, criação de personagem,
> primeira batalha). O passo 6 (deploy) só faz sentido depois disso.

---

## 1. Números e chaves (antes de tudo)

- [ ] **Um número de WhatsApp só para o RPG** (chip novo ou número virtual). Nunca o mesmo do outro bot.
- [ ] De preferência, use esse número no celular por alguns dias como uma pessoa comum antes de conectar (ajuda a
      evitar banimento de número novo).
- [ ] Criar a chave da **Maritaca** (plataforma da Maritaca) e anotar o **nome exato do modelo** (ex.: `sabiazinho-4`).
- [ ] (Opcional) Criar a chave da **Anthropic** para o Claude como reserva.
- [ ] Gerar 4 segredos longos e aleatórios (um para cada: `WEBHOOK_SECRET`, `RELOGIO_SEGREDO`, `TELEFONE_SAL`, `ADMIN`):

```bash
openssl rand -hex 32
```

Guarde as chaves num gerenciador de senhas. **Não mande chaves pelo chat.**

## 2. Vercel: projeto ✅ (já criado)

- [x] Projeto **`rpg-dark`** no time *julliodutras-projects*, ligado ao GitHub (`JullioDutra/rpg-dark`).
      Cada push na branch `claude/relaxed-hamilton-0nxloi` (a branch de produção) faz deploy sozinho.
- [x] Funções em **São Paulo (`gru1`)**, Node 22. Endereço: **https://rpg-dark.vercel.app**
- [x] Só a pasta `public/` é servida como site: docs e dados (spoilers) dão 404. Teste: `https://rpg-dark.vercel.app/api/saude`
      mostra quais variáveis já estão configuradas (sem mostrar valores).
- [x] Variáveis já criadas: `EVOLUTION_INSTANCIA=rpg-yotsuhoshi`, `IA_PROVEDOR=maritaca`.

## 3. Vercel: banco Neon e Blob ✅

- [x] **Blob** `rpg-dark-cartas` (São Paulo) conectado ao projeto.
- [x] **Neon** criado pela Vercel e conectado (`DATABASE_URL`).
- [x] **Esquema do banco**: não precisa rodar nada no SQL Editor. O servidor aplica `db/migrations/*.sql` sozinho na
      primeira chamada (e registra em `jogo.migracoes`). Abrir `https://rpg-dark.vercel.app/api/saude` já faz isso e
      mostra `banco.ok: true`.
- [x] Variáveis já criadas: `MARITACA_API_KEY` (sensível), `MARITACA_MODELO=sabia-4`, `IA_PROVEDOR`, `EVOLUTION_INSTANCIA`,
      `TELEFONE_SAL` (sensível, **nunca troque** depois que houver jogadores), `WEBHOOK_SECRET` e `RELOGIO_SEGREDO`
      (visíveis no painel: *Settings → Environment Variables* → clique no olho para copiar).

## 4. Servidor da Evolution: checagens para NÃO afetar o outro bot

Criar uma instância nova **não reinicia** a Evolution e **não mexe** nas outras instâncias. Os riscos reais são poucos
e todos checáveis antes:

| Checagem | Por quê | Como |
|----------|---------|------|
| **Webhook global desligado** (ou o outro bot filtrando por instância) | Se o servidor usa webhook **global**, as mensagens do número do RPG também iriam para o outro bot, que poderia **responder no grupo do RPG** | Veja no `.env`/variáveis da Evolution: `WEBHOOK_GLOBAL_ENABLED`. Se for `true`, ou o outro bot passa a ignorar eventos cuja `instance` não é a dele, ou você troca para webhook **por instância** |
| **Integrações globais** (Typebot, Chatwoot, OpenAI, Dify…) | Algumas integrações podem ser ligadas para todas as instâncias | Confirme que estão configuradas **só na instância do outro bot** |
| **O outro bot não usa "todas as instâncias"** | Se o código dele lista instâncias (`fetchInstances`) e pega "a primeira", pode passar a pegar a errada | Confira se ele usa o **nome fixo** da instância dele |
| **Não atualizar nem reiniciar a Evolution agora** | Atualizar a versão pode mudar o comportamento do bot antigo | Só crie a instância; atualização é outra tarefa |
| **Recursos do servidor** | Cada instância conectada usa um pouco de RAM | Veja se sobra pelo menos ~300 MB de RAM livre |
| **Backup antes** | Precaução | Exporte as configurações da instância antiga / snapshot do servidor, se o provedor oferecer |

Depois das checagens:

- [ ] Criar a instância **`rpg-yotsuhoshi`** (integração `WHATSAPP-BAILEYS`) no painel/API da Evolution.
- [ ] Conectar lendo o QR code **com o número do RPG**.
- [ ] **Ainda não** configurar o webhook (a URL do jogo só existe depois do deploy, passo 6).
- [ ] Teste rápido: mande uma mensagem para o número do RPG e confirme que **o outro bot não respondeu**.
- [ ] Anote: URL do servidor da Evolution, a **API key** e o nome da instância.

## 5. Relógio no mesmo servidor

```bash
git clone https://github.com/JullioDutra/rpg-dark.git && cd rpg-dark
```

```bash
docker build -t rpg-relogio relogio/
```

```bash
docker run -d --name rpg-relogio --restart unless-stopped -p 8787:8787 -v rpg-relogio:/dados -e RELOGIO_SEGREDO=<copie o RELOGIO_SEGREDO do painel da Vercel> -e RELOGIO_URLS=https://rpg-dark.vercel.app/ rpg-relogio
```

- [ ] Testar: `curl http://localhost:8787/saude` deve responder `{"ok":true,...}`.
- [ ] Expor a porta 8787 para a internet **só com HTTPS** (ex.: mesmo proxy reverso/domínio que a Evolution usa,
      num subdomínio como `relogio.seudominio.com`). O relógio recusa qualquer chamada sem o segredo.
- [ ] A porta 8787 **não conflita** com a Evolution (que normalmente usa 8080); se já estiver em uso, troque o `-p`.

## 6. Variáveis e deploy (depois que o servidor do bot estiver pronto)

- [ ] Vercel → *Settings → Environment Variables* — **faltam só** `EVOLUTION_URL`, `EVOLUTION_API_KEY`, `RELOGIO_URL` e `ADMINS`
      (depois de salvar, faça *Redeploy*):

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | (criada pelo Neon) |
| `BLOB_READ_WRITE_TOKEN` | ✅ criada pelo Blob |
| `EVOLUTION_URL` | URL do seu servidor da Evolution |
| `EVOLUTION_API_KEY` | API key da Evolution |
| `EVOLUTION_INSTANCIA` | `rpg-yotsuhoshi` ✅ já criada |
| `WEBHOOK_SECRET` | segredo 1 |
| `RELOGIO_URL` | `https://relogio.seudominio.com` |
| `RELOGIO_SEGREDO` | segredo 2 (o mesmo do container) |
| `TELEFONE_SAL` | segredo 3 |
| `IA_PROVEDOR` | `maritaca` ✅ já criada |
| `MARITACA_API_KEY`, `MARITACA_MODELO` | chave e modelo da Maritaca |
| `ANTHROPIC_API_KEY` | (opcional, reserva) |
| `ADMINS` | seu número com DDI e DDD, ex. `5511999999999` (vários: separados por vírgula). Sem ele, quem for admin do grupo do WhatsApp pode usar `/ativar-mundo` |

- [ ] Deploy (push na branch principal ou *Redeploy* no painel).
- [ ] Na Evolution, configurar o webhook **da instância `rpg-yotsuhoshi`** para
      `https://rpg-dark.vercel.app/api/webhook/evolution`, com o header `x-webhook-secret: <WEBHOOK_SECRET>`
      (se a sua versão da Evolution não aceitar headers no webhook, use `…/api/webhook/evolution?segredo=<WEBHOOK_SECRET>`), eventos
      `MESSAGES_UPSERT`, `MESSAGES_UPDATE`, `GROUP_PARTICIPANTS_UPDATE`, `CONNECTION_UPDATE`.

## 7. Primeiro teste

- [ ] Criar um grupo de teste com você + o número do RPG (+ 1 amigo, se quiser).
- [ ] No grupo: `/ativar-mundo Teste`.
- [ ] Mandar **"oi"** para o número do RPG no privado (libera o chat privado).
- [ ] No grupo: `entrar no mundo` → seguir a criação no privado → a carta deve aparecer no grupo.
- [ ] Confirmar mais uma vez que **o outro bot não reagiu** a nada.
