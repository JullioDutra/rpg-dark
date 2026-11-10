-- Combate solo e progressão: recuperação de vida/mana fora de combate e kit inicial de poções.
begin;
alter table jogo.jogadores add column recuperacao_em timestamptz not null default now();
-- Kit inicial: 3 poções para quem já existe (novos ganham na criação)
insert into jogo.inventario (jogador_id, item_id, tipo, qtd, dados)
select id, 'pocao', 'consumivel', 3, '{"nome":"Poção de cura"}'::jsonb from jogo.jogadores where estado = 'ativo'
on conflict (jogador_id, item_id) do nothing;
commit;
