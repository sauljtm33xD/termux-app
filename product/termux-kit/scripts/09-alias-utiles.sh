#!/data/data/com.termux/files/usr/bin/bash
# Agrega alias cómodos a tu .bashrc.
cat >> ~/.bashrc <<'EOA'
alias ll='ls -lah --color=auto'
alias actualizar='pkg update -y && pkg upgrade -y'
alias ip='ip -4 addr show wlan0 | grep inet'
alias ..='cd ..'
alias gs='git status'
alias gl='git log --oneline --graph -15'
EOA
echo "Alias agregados. Ejecuta: source ~/.bashrc"
