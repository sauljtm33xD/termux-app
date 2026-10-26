# Autoventas

Tienda automática (entrega por correo al pagar) + campaña (publica en canales propios con APIs oficiales).

## Cómo funciona
1. `tienda/entrega.py` recibe el webhook de Mercado Pago, consulta el pago con tu token, y si está **aprobado** y ≥ `MIN_AMOUNT_MXN`, envía el .zip al correo del comprador. Idempotente (no manda dos veces).
2. `campana/campana.py` publica rotando variantes, máx. 1 por canal cada `INTERVALO_HORAS`, con aviso de que es producto de pago. Solo activa los canales con credenciales.

## Puesta en marcha (una vez)
1. Mercado Pago → Tus integraciones → crea aplicación → copia el **Access Token** de producción; en Webhooks apunta a `https://TU-APP/` con el evento **Pagos**.
2. Gmail → Seguridad → Contraseñas de aplicación → crea una.
3. Despliega `autoventas/` como servicio web (Render/Railway con el Dockerfile) con las variables de `.env.example`.
4. Campaña: programa `python campana/campana.py` cada hora (cron job de Render/Railway/GitHub Actions). Cada canal se crea una vez a mano (captcha) y solo pasas su token.

## Pruebas
`python3 -m unittest tests/test_autoventas.py` · `python3 campana/campana.py --dry-run`

## Límites
Sin audiencia en los canales, la campaña genera pocas visitas. No hace spam, mensajes directos no solicitados ni evita captchas.
