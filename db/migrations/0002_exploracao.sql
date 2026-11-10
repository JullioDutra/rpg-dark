-- Exploração individual. O servidor trava a linha do jogador durante cada ação.
-- Prazos são absolutos: viagens e vigor sobrevivem a reinícios sem um cron.
begin;
alter table jogo.jogadores
  add column ryo bigint not null default 0 check (ryo >= 0),
  add column montaria_id text,
  add column exploracao_em timestamptz;

create table jogo.viagens (
  id bigint generated always as identity primary key,
  jogador_id bigint not null references jogo.jogadores (id) on delete cascade,
  origem text not null,
  destino text not null,
  partida_em timestamptz not null,
  chegada_em timestamptz not null,
  concluida_em timestamptz,
  evento jsonb,
  check (origem <> destino),
  check (chegada_em > partida_em)
);
create unique index viagens_em_curso_idx on jogo.viagens (jogador_id) where concluida_em is null;
create index viagens_jogador_idx on jogo.viagens (jogador_id, partida_em);
alter table jogo.viagens enable row level security;

create table jogo.descobertas (
  jogador_id bigint not null references jogo.jogadores (id) on delete cascade,
  tipo text not null check (tipo in ('regiao', 'subfase', 'local')),
  referencia text not null,
  dados jsonb not null default '{}',
  criada_em timestamptz not null default now(),
  primary key (jogador_id, tipo, referencia)
);
alter table jogo.descobertas enable row level security;

-- O resultado e a recompensa formam um registro único, inclusive após a escolha.
create table jogo.exploracoes (
  id bigint generated always as identity primary key,
  jogador_id bigint not null references jogo.jogadores (id) on delete cascade,
  mensagem_id text not null unique,
  regiao text not null,
  tipo text not null check (tipo in ('encontro', 'descoberta', 'achado', 'evento', 'fauna', 'nada')),
  dados jsonb not null,
  pendente boolean not null default false,
  criada_em timestamptz not null,
  resolvida_em timestamptz
);
create unique index exploracoes_pendentes_idx on jogo.exploracoes (jogador_id) where pendente;
create index exploracoes_jogador_idx on jogo.exploracoes (jogador_id, criada_em);
alter table jogo.exploracoes enable row level security;
commit;
