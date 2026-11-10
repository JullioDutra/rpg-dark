#!/usr/bin/env bash
# Instância do RPG na Evolution que JÁ roda na VPS (~/evolution). Não reinicia a Evolution e não mexe em outras instâncias.
# Uso na VPS:
#   bash rpg-evolution.sh criar     → cria a instância rpg-yotsuhoshi (depois leia o QR no /manager com o número do RPG)
#   bash rpg-evolution.sh webhook   → liga o webhook SÓ desta instância (pede o WEBHOOK_SECRET sem mostrar na tela)
#   bash rpg-evolution.sh conferir  → mostra o estado da conexão e o webhook configurado (sem segredos)
set -euo pipefail
INSTANCIA="rpg-yotsuhoshi"
APP="${APP_URL:-https://rpg-dark.vercel.app}"
EVO="${EVO_URL:-http://localhost:8080}"
ENV_FILE="${ENV_FILE:-$HOME/evolution/.env}"
KEY=$(grep -E '^AUTHENTICATION_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"'"'"' \r')
[ -n "$KEY" ] || { echo "AUTHENTICATION_API_KEY não encontrada em $ENV_FILE"; exit 1; }

case "${1:-}" in
  criar)
    curl -fsS -X POST "$EVO/instance/create" -H "apikey: $KEY" -H "Content-Type: application/json" \
      -d "{\"instanceName\":\"$INSTANCIA\",\"integration\":\"WHATSAPP-BAILEYS\",\"qrcode\":true}" >/dev/null
    echo ">> Instância $INSTANCIA criada. Agora abra $EVO/manager (ou http://IP-DA-VPS:8080/manager), entre na instância"
    echo "   e leia o QR code com o WhatsApp do NÚMERO DO RPG (nunca o do outro bot)." ;;
  webhook)
    read -rsp "Cole o WEBHOOK_SECRET (Vercel → Settings → Environment Variables) e tecle Enter: " SEGREDO; echo
    [ -n "$SEGREDO" ] || { echo "Segredo vazio."; exit 1; }
    curl -fsS -X POST "$EVO/webhook/set/$INSTANCIA" -H "apikey: $KEY" -H "Content-Type: application/json" \
      -d "{\"webhook\":{\"enabled\":true,\"url\":\"$APP/api/webhook/evolution?segredo=$SEGREDO\",\"byEvents\":false,\"base64\":false,\"events\":[\"MESSAGES_UPSERT\"]}}" >/dev/null
    echo ">> Webhook ligado só na instância $INSTANCIA." ;;
  conferir)
    echo -n "Conexão: "; curl -fsS "$EVO/instance/connectionState/$INSTANCIA" -H "apikey: $KEY"; echo
    echo -n "Webhook: "; curl -fsS "$EVO/webhook/find/$INSTANCIA" -H "apikey: $KEY" | sed -E 's/segredo=[^"&]*/segredo=***/'; echo ;;
  *) echo "Uso: bash $0 criar|webhook|conferir"; exit 1 ;;
esac
