---
title: 5 comandos que le faltan a tu Termux (y un instalador para tenerlos todos)
published: true
tags: termux, android, linux, spanish
---

Cuando instalas Termux, lo primero es pasar una hora configurándolo. Estas son las cinco cosas que más uso, con el código para que las copies gratis.

## 1. Compartir una carpeta por Wi-Fi con QR
```bash
ip=$(ip -4 addr show wlan0 | awk '/inet /{sub("/.*","",$2);print $2}')
qrencode -t ANSIUTF8 "http://$ip:8080" && python -m http.server 8080 --bind 0.0.0.0
```
Escaneas el QR con otro celular y descargas lo que haya en la carpeta.

## 2. Respaldo de tu $HOME a la tarjeta
```bash
termux-setup-storage
tar -czf /sdcard/termux-$(date +%F).tar.gz -C ~ --exclude=.cache --exclude=storage .
```

## 3. Liberar espacio
```bash
pkg clean -y; rm -rf ~/.cache $TMPDIR/*
```

## 4. Notas rápidas con fecha
```bash
echo "$(date '+%F %H:%M') mi nota" >> ~/.notas && cat -n ~/.notas
```

## 5. tmux con mouse
```bash
printf 'set -g mouse on\nset -g history-limit 20000\n' > ~/.tmux.conf
```

## ¿Quieres todo ya armado?
Junté estos scripts (y más) en un **instalador de un comando**, más un cheatsheet PDF de Termux + Git + Linux y 40 prompts para programar con IA, todo en español: **Termux Pack Completo, $100 MXN** → https://link.mercadopago.com.mx/sauljtm34norxtec

_Transparencia: el pack es un producto de pago mío; los 5 comandos de arriba son gratis y funcionan sin comprar nada._
