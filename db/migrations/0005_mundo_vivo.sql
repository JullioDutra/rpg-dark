-- Mundo vivo: local atual, progresso da história (bandeiras, capítulos, passos, pistas), derrota única de vilões,
-- amizade com NPCs (e mortes), equipamento inicial.
begin;
alter table jogo.jogadores add column local_atual text;

-- Progresso por jogador em chave/valor: "b:<bandeira>", "c:<capítulo>" (concluído), "p:<capítulo>" (passo atual),
-- "juramento:<vilão>", "titulo:<...>".
create table jogo.progresso (
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  chave       text not null,
  valor       jsonb not null default 'true',
  criado_em   timestamptz not null default now(),
  primary key (jogador_id, chave)
);
alter table jogo.progresso enable row level security;

-- Cada vilão só cai de verdade UMA vez por mundo (primeiro = true). Para os outros jogadores, o Vazio devolve um Eco.
create table jogo.derrotas_vilao (
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  vilao_id    text not null,
  jogador_id  bigint not null references jogo.jogadores (id) on delete cascade,
  primeiro    boolean not null default false,
  criado_em   timestamptz not null default now(),
  primary key (mundo_id, vilao_id, jogador_id)
);
create unique index derrotas_vilao_primeiro_idx on jogo.derrotas_vilao (mundo_id, vilao_id) where primeiro;
create index derrotas_vilao_jogador_idx on jogo.derrotas_vilao (jogador_id);
alter table jogo.derrotas_vilao enable row level security;

create table jogo.relacoes (
  jogador_id       bigint not null references jogo.jogadores (id) on delete cascade,
  npc              text not null,                 -- "R-HOM-3:tomoe"
  amizade          integer not null default 0 check (amizade >= 0),
  ultima_conversa  timestamptz,
  conversas        integer not null default 0,
  primary key (jogador_id, npc)
);
alter table jogo.relacoes enable row level security;

-- NPCs mortos no mundo (vale para todos os jogadores daquele mundo)
create table jogo.npcs_mortos (
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  npc         text not null,
  vilao_id    text not null,
  jogador_id  bigint references jogo.jogadores (id) on delete set null,   -- de quem ele era amigo
  vingado     boolean not null default false,
  criado_em   timestamptz not null default now(),
  primary key (mundo_id, npc)
);
create index npcs_mortos_jogador_idx on jogo.npcs_mortos (jogador_id);
alter table jogo.npcs_mortos enable row level security;

-- Feitos do mundo (primeiros a derrotar, descobertas, capítulos): histórico para o comando "feitos"
create table jogo.feitos (
  id          bigint generated always as identity primary key,
  mundo_id    bigint not null references jogo.mundos (id) on delete cascade,
  jogador_id  bigint references jogo.jogadores (id) on delete set null,
  tipo        text not null,
  texto       text not null,
  criado_em   timestamptz not null default now()
);
create index feitos_mundo_idx on jogo.feitos (mundo_id, criado_em);
create index feitos_jogador_idx on jogo.feitos (jogador_id);
alter table jogo.feitos enable row level security;

-- Equipamento inicial para quem já existe (arma e armadura de aprendiz da classe)
insert into jogo.inventario (jogador_id, item_id, tipo, qtd, equipado, dados)
select j.id, x.item, 'equipamento', 1, true, '{}'::jsonb
from jogo.jogadores j
cross join lateral (values
  ('arma-' || case j.classe when 'Mago' then 'cajado' when 'Bruxo' then 'cajado' when 'Cavaleiro' then 'espada' when 'Paladino' then 'maca'
     when 'Anti-magia' then 'manopla' when 'Espadachim' then 'katana' when 'Meio-humano' then 'garras' when 'Força da Natureza' then 'bastao'
     when 'Demônio' then 'foice' else 'espada' end || '-1'),
  ('arm-' || case when j.classe in ('Mago', 'Bruxo', 'Força da Natureza') then 'manto' when j.classe in ('Cavaleiro', 'Paladino') then 'pesada' else 'leve' end || '-1')
) as x(item)
where j.estado <> 'criando' and j.classe is not null
on conflict (jogador_id, item_id) do nothing;
commit;
