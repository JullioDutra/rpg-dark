#!/bin/sh
# Backup diário do banco às 04:17 (UTC do container). Mantém os últimos $MANTER_DIAS dias em ./backups.
# Copie os arquivos de ./backups para fora do VPS de vez em quando (outro servidor, Google Drive, etc.).
while true; do
  if [ "$(date +%H%M)" = "0417" ]; then
    pg_dump -h postgres -U rpg -d rpg -Fc -f "/backups/rpg-$(date +%F).dump" && echo "backup ok $(date +%F)"
    # apaga só arquivos rpg-*.dump mais antigos que MANTER_DIAS, dentro de /backups
    find /backups -maxdepth 1 -type f -name 'rpg-*.dump' -mtime +"${MANTER_DIAS:-14}" -exec rm -f {} \;
    sleep 60
  fi
  sleep 30
done
