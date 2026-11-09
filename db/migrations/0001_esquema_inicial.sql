-- Yotsuhoshi — esquema inicial do banco (Postgres 15+; produção: Neon pela integração da Vercel).
-- Postgres padrão, sem extensões. Tudo fica no schema "jogo"; só o servidor do jogo (Vercel) acessa,
-- pela DATABASE_URL pooled. RLS fica ligado em todas as tabelas como defesa extra.
-- Testado com: bash db/testar-migracoes.sh

create schema if not exists jogo;
revoke all on schema jogo from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then execute 'revoke all on schema jogo from anon, authenticated'; end if;
end $$;

-- ───────────────────────────── utilidades ─────────────────────────────
create or replace function jogo.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin new.atualizado_em := now(); return new; end $$;

-- ───────────────────────────── mundos e identidades ─────────────────────────────
create table jogo.mundos (
  id               bigint generated always as identity primary key,
  grupo_wa_id      text not null unique,                       -- JID do grupo (…@g.us)
  instancia        text not null default 'rpg-yotsuhoshi',     -- instância da Evolution API
  nome             text not null,
  status           text not null default 'ativo' check (status in ('ativo', 'pausado', 'encerrado')),
  ato              text not null default 'A1',
  relogio_eclipse  numeric(5, 2) not null default 0 check (relogio_eclipse between 0 and 100),
  final            text check (final in ('estelar', 'selo', 'eclipse')),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create table jogo.identidades (
  id              bigint generated always as identity primary key,
  telefone_hash   text not null unique,       -- sha256(número + sal) — para buscas sem expor o número
  wa_jid          text unique,                -- 55…@s.whatsapp.net
  wa_lid          text unique,                -- …@lid (grupos podem mandar só o LID)
  privado_ok      boolean not null default false,  -- já falou com o bot no privado
  criado_em       timestamptz not null default now()
);

-- ───────────────────────────── jogadores ─────────────────────────────
create table jogo.jogadores (
  id                  bigint generated always as identity primary key,
  mundo_id            bigint not null references jogo.mundos (id) on delete cascade,
  identidade_id       bigint not null references jogo.identidades (id) on delete restrict,
  estado              text not null default 'criando' check (estado in ('criando', 'ativo', 'congelado', 'morto', 'espectador')),
  etapa_criacao       text,
  nome                text not null,
  nome_normalizado    text not null,
  titulo              text,
  aldeia              text,
  casta               text check (casta in ('campones', 'plebeu', 'cavaleiro', 'realeza', 'indefinido', 'rei')),
  reino               text,
  classe              text,
  tipo_animal         text,
  atributo_magico     text,
  mana_unica          text,
  elegivel_pet        boolean not null default false,
  nivel               integer not null default 1 check (nivel between 1 and 100),
  xp                  bigint not null default 0 check (xp >= 0),
  rank                text not null default 'E' check (rank in ('E', 'D', 'C', 'B', 'A', 'S', 'SS')),
  hp                  integer not null default 100,
  hp_max              integer not null default 100,
  mp                  integer not null default 0,
  mp_max              integer not null default 0,
  vazio               integer not null default 0 check (vazio between 0 and 100),
  vigor               integer not null default 100 check (vigor between 0 and 100),
  vigor_em            timestamptz not null default now(),    -- regeneração calculada sob demanda
  atributos           jsonb not null default '{"FOR":0,"DEF":0,"MAG":0,"RES":0,"VEL":0,"SOR":0}',
  maestria            jsonb not null default '{}',
  pontos_livres       integer not null default 0 check (pontos_livres >= 0),
  merito              integer not null default 0,
  corrupcao           integer not null default 0 check (corrupcao between 0 and 100),
  corrupcao_max       integer not null default 0 check (corrupcao_max between 0 and 100),
  regiao_atual        text,
  marcas_morte        integer not null default 0 check (marcas_morte between 0 and 3),
  reencarnacoes       integer not null default 0 check (reencarnacoes between 0 and 2),
  amuleto_usado       boolean not null default false,
  habilidade_amuleto  jsonb,
  faccao              text check (faccao in ('guarda', 'sayo', 'kyokai', 'arautos')),
  avatar_dna          jsonb,
  efeitos             jsonb not null default '[]',            -- estados temporários (ocultar-aura, sangue-nas-maos…)
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  unique (mundo_id, identidade_id),
  unique (mundo_id, nome_normalizado)
);
create index jogadores_identidade_id_idx on jogo.jogadores (identidade_id);
create trigger jogadores_atualizado_em before update on jogo.jogadores for each row execute function jogo.tocar_atualizado_em();

-- Livro-razão de atributos: NADA muda sem fonte registrada (doc 01.5 / 22.9 / 29.1)
create table jogo.eventos_atributo (
  id           bigint generated always as identity primary key,
  jogador_id   bigint not null references jogo.jogadores (id) on delete cascade,
  atributo     text not null,
  delta        numeric not null,
  fonte        text not null check (fonte in ('sorteio_inicial', 'subida_de_nivel', 'pontos_livres', 'maestria', 'treino', 'feito',
                 'vitoria_superior', 'despertar', 'item', 'pet', 'nucleo', 'marco_historia', 'amuleto', 'pacto', 'admin')),
  detalhe      jsonb,
  criado_em    timestamptz not null default now()
);
create index eventos_atributo_jogador_id_idx on jogo.eventos_atributo (jogador_id, criado_em);

-- ───────────────────────────── itens, grimórios, técnicas, pets ─────────────────────────────
create table jogo.inventario (
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  item_id     text not null,
  tipo        text not null check (tipo in ('consumivel', 'material', 'equipamento', 'grimorio', 'historia', 'amuleto')),
  qtd         integer not null default 1 check (qtd > 0),
  equipado    boolean not null default false,
  dados       jsonb,
  primary key (jogador_id, item_id)
);

create table jogo.lendarios (
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  item_id     text not null check (item_id in ('shitencho-fogo', 'shitencho-agua', 'shitencho-terra', 'shitencho-vento',
                'shitencho-capa', 'excalibur', 'kokugai', 'tenmon')),
  jogador_id  bigint references jogo.jogadores (id) on delete set null,
  local       text not null,
  primary key (mundo_id, item_id)
);
create index lendarios_jogador_id_idx on jogo.lendarios (jogador_id);

create table jogo.grimorios_jogador (
  jogador_id    bigint not null references jogo.jogadores (id) on delete cascade,
  grimorio_id   text not null,
  usos          jsonb not null default '{}',
  dominado      boolean not null default false,
  equipado      boolean not null default false,
  primary key (jogador_id, grimorio_id)
);

create table jogo.tecnicas_jogador (
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  tecnica     text not null,
  grau        integer not null default 1 check (grau between 1 and 3),
  usos        integer not null default 0,
  ativa       boolean not null default true,
  primary key (jogador_id, tecnica)
);

create table jogo.pets (
  jogador_id      bigint primary key references jogo.jogadores (id) on delete cascade,
  pet_id          text not null,
  nome            text not null,
  estagio         integer not null default 1 check (estagio between 1 and 3),
  vinculo         integer not null default 0 check (vinculo between 0 and 100),
  vitorias        integer not null default 0,
  carinho_em      timestamptz,
  desmaiado_ate   timestamptz
);

-- ───────────────────────────── história ─────────────────────────────
create table jogo.nucleos (
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  nucleo      text not null check (nucleo in ('rubro', 'abissal', 'raiz', 'celeste')),
  estado      text not null default 'protegido' check (estado in ('protegido', 'confiado', 'arrancado', 'corrompido')),
  jogador_id  bigint references jogo.jogadores (id) on delete set null,
  primary key (mundo_id, nucleo)
);
create index nucleos_jogador_id_idx on jogo.nucleos (jogador_id);

create table jogo.marcos (
  id            bigint generated always as identity primary key,
  mundo_id      bigint not null references jogo.mundos (id) on delete cascade,
  marco_id      text not null,
  jogador_id    bigint references jogo.jogadores (id) on delete cascade,   -- null = marco do mundo
  status        text not null default 'ativo' check (status in ('ativo', 'concluido', 'falhou')),
  prazo         timestamptz,
  dados         jsonb,
  concluido_em  timestamptz,
  unique nulls not distinct (mundo_id, marco_id, jogador_id)
);
create index marcos_jogador_id_idx on jogo.marcos (jogador_id);

create table jogo.bandeiras (
  mundo_id   bigint not null references jogo.mundos (id) on delete cascade,
  bandeira   text not null,
  origem     text not null,                 -- encruzilhada (E01…) ou evento
  criado_em  timestamptz not null default now(),
  primary key (mundo_id, bandeira)
);

-- Segredos do mundo (portador do Ovo etc.). Nunca lidos pela IA de narração pública.
create table jogo.segredos (
  mundo_id  bigint not null references jogo.mundos (id) on delete cascade,
  chave     text not null,
  valor     jsonb not null,
  primary key (mundo_id, chave)
);

create table jogo.chaves_jogador (
  jogador_id     bigint not null references jogo.jogadores (id) on delete cascade,
  chave_id       text not null check (chave_id ~ '^K[0-9]{2}$'),
  obtida_em      timestamptz not null default now(),
  compartilhada  boolean not null default false,
  primary key (jogador_id, chave_id)
);

create table jogo.trajetoria (
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  contador    text not null,           -- poupou, finalizou, protegeu, flashbacks… ou marca:T01
  valor       integer not null default 0,
  primary key (jogador_id, contador)
);

create table jogo.memoria_narrativa (
  mundo_id       bigint primary key references jogo.mundos (id) on delete cascade,
  resumo         text not null default '',
  fatos          jsonb not null default '[]',
  atualizado_em  timestamptz not null default now()
);

-- ───────────────────────────── batalhas ─────────────────────────────
create table jogo.batalhas (
  id                  bigint generated always as identity primary key,
  mundo_id            bigint not null references jogo.mundos (id) on delete cascade,
  tipo                text not null check (tipo in ('solo', 'party', 'chefe', 'mortal', 'mundo', 'duelo', 'luta_real', 'horda', 'flashback')),
  canal_wa_id         text not null,          -- grupo ou chat privado onde está o painel
  mensagem_painel_id  text,                   -- id da mensagem editada a cada rodada
  rodada              integer not null default 0,
  status              text not null default 'aguardando' check (status in ('aguardando', 'resolvendo', 'veredito', 'encerrada')),
  prazo               timestamptz,            -- fim da janela de declaração (null = solo sem prazo)
  estado              jsonb not null,         -- inimigos, fileiras, postura, estados, fluxo…
  resultado           jsonb,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
create index batalhas_mundo_id_idx on jogo.batalhas (mundo_id);
create index batalhas_prazo_pendente_idx on jogo.batalhas (prazo) where status = 'aguardando' and prazo is not null;
create trigger batalhas_atualizado_em before update on jogo.batalhas for each row execute function jogo.tocar_atualizado_em();

create table jogo.participantes_batalha (
  batalha_id  bigint not null references jogo.batalhas (id) on delete cascade,
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  lado        text not null default 'a' check (lado in ('a', 'b')),
  fileira     text not null default 'frente' check (fileira in ('frente', 'retaguarda')),
  ausencias   integer not null default 0,
  primary key (batalha_id, jogador_id)
);
create index participantes_batalha_jogador_id_idx on jogo.participantes_batalha (jogador_id);

create table jogo.acoes_rodada (
  batalha_id   bigint not null references jogo.batalhas (id) on delete cascade,
  rodada       integer not null,
  jogador_id   bigint not null references jogo.jogadores (id) on delete cascade,
  acao         jsonb not null,               -- saída do interpretador (intenção + entidades + alegações)
  mensagem_id  text,
  criado_em    timestamptz not null default now(),
  primary key (batalha_id, rodada, jogador_id)  -- a última declaração substitui a anterior (upsert)
);
create index acoes_rodada_jogador_id_idx on jogo.acoes_rodada (jogador_id);

-- ───────────────────────────── social e conflitos ─────────────────────────────
create table jogo.acordos (
  id          bigint generated always as identity primary key,
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  autor_id    bigint not null references jogo.jogadores (id) on delete cascade,
  outro_id    bigint not null references jogo.jogadores (id) on delete cascade,
  texto       text not null,
  prazo       timestamptz,
  status      text not null default 'proposto' check (status in ('proposto', 'ativo', 'cumprido', 'quebrado', 'cancelado')),
  criado_em   timestamptz not null default now()
);
create index acordos_mundo_id_idx on jogo.acordos (mundo_id);
create index acordos_autor_id_idx on jogo.acordos (autor_id);
create index acordos_outro_id_idx on jogo.acordos (outro_id);

create table jogo.conflitos (
  id          bigint generated always as identity primary key,
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  tipo        text not null check (tipo in ('rivalidade', 'disputa', 'julgamento', 'luta_real', 'divida_de_vida', 'recompensa', 'ignorar')),
  a_id        bigint not null references jogo.jogadores (id) on delete cascade,
  b_id        bigint not null references jogo.jogadores (id) on delete cascade,
  status      text not null default 'aberto' check (status in ('proposto', 'aberto', 'resolvido', 'cancelado')),
  objeto      text,
  dados       jsonb not null default '{}',
  criado_em   timestamptz not null default now(),
  check (a_id <> b_id)
);
create index conflitos_mundo_id_idx on jogo.conflitos (mundo_id);
create index conflitos_a_id_idx on jogo.conflitos (a_id);
create index conflitos_b_id_idx on jogo.conflitos (b_id);

create table jogo.pactos (
  id          bigint generated always as identity primary key,
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  tipo        text not null,
  status      text not null default 'oferecido' check (status in ('oferecido', 'aceito', 'recusado', 'cumprido', 'expirado', 'revelado')),
  expira_em   timestamptz,
  criado_em   timestamptz not null default now()
);
create index pactos_jogador_id_idx on jogo.pactos (jogador_id);

-- Votos de enquetes (encruzilhadas, júri, escolhas de party)
create table jogo.votos (
  enquete_id  text not null,                -- id da mensagem de enquete no WhatsApp
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  opcao       text not null,
  criado_em   timestamptz not null default now(),
  primary key (enquete_id, jogador_id)
);
create index votos_jogador_id_idx on jogo.votos (jogador_id);

-- ───────────────────────────── infraestrutura ─────────────────────────────
-- Idempotência: a Evolution API pode reenviar webhooks; cada mensagem é processada uma única vez.
create table jogo.mensagens_processadas (
  wa_message_id  text primary key,
  recebida_em    timestamptz not null default now()
);
create index mensagens_processadas_recebida_em_idx on jogo.mensagens_processadas (recebida_em);

-- Fila de tarefas agendadas (fim de rodada, crises, sussurros). O relógio do VPS chama /api/tick na hora; o tick
-- consome as vencidas daqui (e qualquer mensagem recebida também confere as vencidas).
create table jogo.agendamentos (
  id            bigint generated always as identity primary key,
  mundo_id      bigint references jogo.mundos (id) on delete cascade,
  tipo          text not null,
  executar_em   timestamptz not null,
  dados         jsonb not null default '{}',
  status        text not null default 'pendente' check (status in ('pendente', 'processando', 'feito', 'erro')),
  tentativas    integer not null default 0,
  erro          text,
  criado_em     timestamptz not null default now()
);
create index agendamentos_mundo_id_idx on jogo.agendamentos (mundo_id);
create index agendamentos_pendentes_idx on jogo.agendamentos (executar_em) where status = 'pendente';

-- Pega até N tarefas vencidas sem bloquear outros workers (SKIP LOCKED)
create or replace function jogo.reivindicar_agendamentos(limite integer default 20)
returns setof jogo.agendamentos
language sql set search_path = '' as $$
  update jogo.agendamentos a
     set status = 'processando', tentativas = a.tentativas + 1
   where a.id in (
     select id from jogo.agendamentos
      where status = 'pendente' and executar_em <= now()
      order by executar_em
      limit limite
      for update skip locked)
  returning a.*;
$$;

-- Trava por batalha (dentro da transação): impede duas resoluções simultâneas da mesma rodada
create or replace function jogo.travar_batalha(batalha bigint) returns void
language sql set search_path = '' as $$ select pg_advisory_xact_lock(hashtextextended('batalha:' || batalha, 0)); $$;

create table jogo.log_mensagens (
  id          bigint generated always as identity primary key,
  mundo_id    bigint references jogo.mundos (id) on delete cascade,
  jogador_id  bigint references jogo.jogadores (id) on delete set null,
  direcao     text not null check (direcao in ('entrada', 'saida')),
  canal       text not null check (canal in ('grupo', 'privado')),
  texto       text,
  intencao    text,
  criado_em   timestamptz not null default now()
);
create index log_mensagens_mundo_id_criado_em_idx on jogo.log_mensagens (mundo_id, criado_em);
create index log_mensagens_jogador_id_idx on jogo.log_mensagens (jogador_id);

-- ───────────────────────────── segurança ─────────────────────────────
-- RLS ligado em todas as tabelas, sem políticas: só o servidor (role dona/postgres) acessa.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'jogo' loop
    execute format('alter table jogo.%I enable row level security', t.tablename);
  end loop;
end $$;
