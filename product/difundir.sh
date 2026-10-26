#!/data/data/com.termux/files/usr/bin/bash
# Abre cada plataforma con el mensaje y el link ya escritos; solo tienes que tocar "Enviar".
# Requiere: pkg install -y jq termux-api  (y la app Termux:API)
# Uso: ./difundir.sh            -> menú
#      ./difundir.sh telegram   -> abre solo esa plataforma
LINK="https://swoosh784.gumroad.com/l/exgsmd"
MSGS=(
"¿Usas Termux y no sabes por dónde empezar? Armé un kit con 10 scripts en español (setup, respaldos, SSH, git, Python, limpieza). Descarga inmediata:"
"Respaldar tu Termux en una línea y entrar a tu Android por SSH: están en este kit de 10 scripts en español:"
"10 scripts comentados para automatizar tu Android desde la terminal. Pruébalo:"
)
MSG="${MSGS[$((RANDOM % ${#MSGS[@]}))]}"
enc() { printf %s "$1" | jq -sRr @uri; }
T=$(enc "$MSG"); U=$(enc "$LINK")
abrir() {
  case "$1" in
    telegram) termux-open-url "https://t.me/share/url?url=$U&text=$T" ;;
    whatsapp) termux-open-url "https://wa.me/?text=$(enc "$MSG $LINK")" ;;
    facebook) termux-open-url "https://www.facebook.com/sharer/sharer.php?u=$U" ;;
    x)        termux-open-url "https://twitter.com/intent/tweet?text=$T&url=$U" ;;
    reddit)   termux-open-url "https://www.reddit.com/submit?url=$U&title=$(enc "Kit de 10 scripts de Termux en español")" ;;
    *) echo "Plataformas: telegram whatsapp facebook x reddit"; return 1 ;;
  esac
}
if [ -n "$1" ]; then abrir "$1"; exit; fi
echo "Mensaje: $MSG"; echo "Link: $LINK"; echo
for p in telegram whatsapp facebook x reddit; do
  read -rp "¿Abrir $p? (s/N) " r
  [ "$r" = "s" ] && abrir "$p" && read -rp "Cuando envíes, pulsa Enter..." _
done
echo "Listo. Recuerda: 3 o 4 lugares, no 20, para evitar bloqueos."
