export PATH="$HOME/bin:$PATH"
alias ll='ls -lah --color=auto'
alias ..='cd ..'
alias update='pkg update -y && pkg upgrade -y'
alias myip='tp-ip'
alias gs='git status -sb'
alias gl='git log --oneline --graph --decorate -15'
PS1='\[\e[1;32m\]\u\[\e[0m\]@\[\e[1;36m\]termux\[\e[0m\] \[\e[1;33m\]\w\[\e[0m\]\n❯ '
