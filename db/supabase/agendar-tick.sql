-- Executar UMA vez no Supabase (SQL Editor), depois da migração 0001.
-- Agenda o "tick" do jogo: a cada minuto o banco chama a Vercel para resolver rodadas vencidas, crises e regenerações.
-- Requer as extensões pg_cron e pg_net (Dashboard → Database → Extensions).
-- Troque <URL_DO_JOGO> pela URL da Vercel e guarde o segredo no Vault (nunca em texto no SQL).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1) Segredo compartilhado entre o banco e a Vercel (o mesmo valor vai na env TICK_SECRET da Vercel)
-- select vault.create_secret('<UM_SEGREDO_LONGO_ALEATORIO>', 'tick_secret');

-- 2) Agenda: todo minuto
select cron.schedule(
  'yotsuhoshi-tick',
  '* * * * *',
  $$
  select net.http_post(
    url := '<URL_DO_JOGO>/api/tick',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-tick-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'tick_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
  $$
);

-- Limpeza diária: mensagens processadas com mais de 7 dias (idempotência só precisa de janela curta)
select cron.schedule('yotsuhoshi-limpeza', '17 4 * * *',
  $$ delete from jogo.mensagens_processadas where recebida_em < now() - interval '7 days' $$);
