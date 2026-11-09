#!/bin/bash
# Sobe um Postgres temporário, aplica as migrações e roda verificações básicas.
# Uso: bash db/testar-migracoes.sh
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
TMP=$(mktemp -d)
chown -R postgres "$TMP" 2>/dev/null || true
run() { if [ "$(id -u)" = 0 ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
run "$PGBIN/initdb -D $TMP/data -A trust -U postgres >/dev/null"
run "$PGBIN/pg_ctl -D $TMP/data -o '-k $TMP -p 54329 -c listen_addresses=' -l $TMP/log start >/dev/null"
trap 'run "$PGBIN/pg_ctl -D $TMP/data stop -m immediate >/dev/null"; rm -rf "$TMP"' EXIT
P="psql -h $TMP -p 54329 -U postgres -v ON_ERROR_STOP=1 -q"
for f in db/migrations/*.sql; do echo "▶ $f"; $P -f "$f"; done
$P <<'SQL'
-- smoke test: fluxo mínimo
insert into jogo.mundos (grupo_wa_id, nome) values ('123@g.us', 'Grupo Teste');
insert into jogo.identidades (telefone_hash, wa_jid) values ('abc', '5511999999999@s.whatsapp.net');
insert into jogo.jogadores (mundo_id, identidade_id, nome, nome_normalizado) values (1, 1, 'Kaito', 'kaito');
do $$ begin
  begin insert into jogo.jogadores (mundo_id, identidade_id, nome, nome_normalizado) values (1, 1, 'Outro', 'outro');
        raise exception 'deveria falhar: 2 personagens do mesmo número no mesmo mundo';
  exception when unique_violation then null; end;
  begin insert into jogo.eventos_atributo (jogador_id, atributo, delta, fonte) values (1, 'FOR', 1000, 'pedido_do_jogador');
        raise exception 'deveria falhar: fonte de atributo inválida';
  exception when check_violation then null; end;
end $$;
insert into jogo.marcos (mundo_id, marco_id) values (1, 'A1-M5');
do $$ begin
  begin insert into jogo.marcos (mundo_id, marco_id) values (1, 'A1-M5'); raise exception 'deveria falhar: marco de mundo duplicado';
  exception when unique_violation then null; end;
end $$;
insert into jogo.agendamentos (mundo_id, tipo, executar_em) values (1, 'fim_rodada', now() - interval '1 second'), (1, 'crise', now() + interval '1 hour');
select count(*) = 1 as reivindicou_so_o_vencido from jogo.reivindicar_agendamentos(10);
begin; select jogo.travar_batalha(42); commit;
select count(*) as tabelas_sem_rls from pg_tables where schemaname = 'jogo' and not rowsecurity;
SQL
echo "✔ migrações aplicadas e verificadas"
