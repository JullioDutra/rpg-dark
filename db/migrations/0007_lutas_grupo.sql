-- Luta em conjunto contra um vilão de covil (médio escalão para cima): cada jogador tem a própria batalha,
-- mas o vilão é um só. Esta linha é a fonte da verdade do estado do vilão (vida, guarda, fase…).
create table jogo.lutas_grupo (
  chave      text primary key,                       -- <mundo>:<vilão>:<líder do grupo de viagem>
  mundo_id   bigint not null references jogo.mundos (id) on delete cascade,
  vilao      text not null,
  inimigo    jsonb not null,                         -- parte compartilhada do inimigo
  hp_base    integer not null,                       -- vida do vilão para um jogador só
  membros    jsonb not null default '[]',            -- ids de quem entrou
  estado     text not null default 'ativa' check (estado in ('ativa', 'vencida', 'encerrada')),
  criada_em  timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
create index lutas_grupo_mundo_idx on jogo.lutas_grupo (mundo_id, estado);
alter table jogo.lutas_grupo enable row level security;
