#!/data/data/com.termux/files/usr/bin/bash
# Avisa con notificación cuando la batería baja de un umbral. Requiere Termux:API.
# Uso: ./10-recordatorio-bateria.sh [umbral=20]
U="${1:-20}"
while true; do
  P=$(termux-battery-status | jq -r .percentage)
  S=$(termux-battery-status | jq -r .status)
  if [ "$P" -le "$U" ] && [ "$S" != "CHARGING" ]; then
    termux-notification --title "Batería baja" --content "Nivel: ${P}%"
    sleep 600
  fi
  sleep 120
done
