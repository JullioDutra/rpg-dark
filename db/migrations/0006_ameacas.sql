-- Ameaças de vida compartilhada: Calamidades (o mundo inteiro ataca) e monstros postos numa cidade (só quem está lá ataca).
create table jogo.ameacas (
  id          bigint generated always as identity primary key,
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  tipo        text not null check (tipo in ('calamidade', 'monstro')),
  monstro     text not null,
  regiao      text,                                  -- null = o mundo inteiro (calamidade)
  nivel       integer not null,
  hp          integer not null,
  hp_max      integer not null,
  estado      text not null default 'ativa' check (estado in ('ativa', 'derrotada', 'foi_embora')),
  dados       jsonb not null default '{}',
  criada_em   timestamptz not null default now(),
  termina_em  timestamptz not null
);
create index ameacas_mundo_idx on jogo.ameacas (mundo_id, estado);
alter table jogo.ameacas enable row level security;

create table jogo.ameaca_golpes (
  ameaca_id   bigint not null references jogo.ameacas (id) on delete cascade,
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  dano        integer not null default 0,
  golpes      integer not null default 0,
  ultimo_em   timestamptz not null default now(),
  primary key (ameaca_id, jogador_id)
);
alter table jogo.ameaca_golpes enable row level security;
