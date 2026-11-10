-- Cenas narradas (ação livre com ">"): histórico curto por jogador para dar continuidade à IA.
-- A IA nunca lê cenas de outros jogadores; segredos do mundo continuam fora daqui.
begin;
create table jogo.cenas (
  id          bigint generated always as identity primary key,
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  papel       text not null check (papel in ('jogador', 'narrador')),
  texto       text not null,
  dados       jsonb not null default '{}',
  criado_em   timestamptz not null default now()
);
create index cenas_jogador_idx on jogo.cenas (jogador_id, criado_em);
alter table jogo.cenas enable row level security;
commit;
