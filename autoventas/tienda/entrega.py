"""Servidor de webhook de Mercado Pago: al aprobarse un pago, envia el pack por correo.

Solo biblioteca estandar. Variables de entorno: ver ../.env.example
"""
import json
import os
import smtplib
import sqlite3
import ssl
import urllib.request
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

MP_TOKEN = os.environ.get("MP_ACCESS_TOKEN", "")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
MIN_AMOUNT = float(os.environ.get("MIN_AMOUNT_MXN", "100"))
PRODUCT = os.environ.get("PRODUCT_PATH", os.path.join(os.path.dirname(__file__), "..", "producto", "Termux-Pack-Completo.zip"))
DB = os.environ.get("DB_PATH", "ventas.db")

ASUNTO = "Tu Termux Pack Completo"
CUERPO = (
    "¡Gracias por tu compra!\n\n"
    "Adjunto va el Termux Pack Completo (.zip): instalador, cheatsheet PDF y 40 prompts PDF.\n"
    "En Termux: descomprime, entra a 1-Termux-Power-Pack y corre: bash install.sh\n\n"
    "Si algo falla, responde a este correo con el error.\n"
)


def db():
    con = sqlite3.connect(DB)
    con.execute("CREATE TABLE IF NOT EXISTS ventas (payment_id TEXT PRIMARY KEY, email TEXT, monto REAL, enviado INTEGER)")
    return con


def obtener_pago(payment_id):
    req = urllib.request.Request(
        f"https://api.mercadopago.com/v1/payments/{payment_id}",
        headers={"Authorization": f"Bearer {MP_TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)


def enviar_correo(destino):
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = ASUNTO, SMTP_USER, destino
    msg.set_content(CUERPO)
    with open(PRODUCT, "rb") as f:
        msg.add_attachment(f.read(), maintype="application", subtype="zip", filename=os.path.basename(PRODUCT))
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ssl.create_default_context()) as s:
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)


def procesar_pago(payment_id, obtener=obtener_pago, enviar=enviar_correo, con=None):
    """Devuelve un texto con el resultado. Idempotente por payment_id."""
    con = con or db()
    fila = con.execute("SELECT enviado FROM ventas WHERE payment_id=?", (payment_id,)).fetchone()
    if fila and fila[0]:
        return "ya entregado"
    pago = obtener(payment_id)
    if pago.get("status") != "approved":
        return f"no aprobado ({pago.get('status')})"
    monto = float(pago.get("transaction_amount") or 0)
    if monto < MIN_AMOUNT:
        return f"monto insuficiente ({monto})"
    email = (pago.get("payer") or {}).get("email")
    if not email:
        return "sin correo del comprador"
    con.execute("INSERT OR IGNORE INTO ventas VALUES (?,?,?,0)", (payment_id, email, monto))
    con.commit()
    enviar(email)
    con.execute("UPDATE ventas SET enviado=1 WHERE payment_id=?", (payment_id,))
    con.commit()
    return f"entregado a {email}"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")

    def do_POST(self):
        url = urlparse(self.path)
        q = parse_qs(url.query)
        largo = int(self.headers.get("Content-Length") or 0)
        try:
            cuerpo = json.loads(self.rfile.read(largo) or b"{}")
        except ValueError:
            cuerpo = {}
        tipo = q.get("type", [cuerpo.get("type", "")])[0] or q.get("topic", [""])[0]
        pid = q.get("data.id", [str((cuerpo.get("data") or {}).get("id", ""))])[0]
        self.send_response(200); self.end_headers()  # responder rapido; MP reintenta si no es 200
        if tipo == "payment" and pid:
            try:
                print("pago", pid, "->", procesar_pago(pid), flush=True)
            except Exception as e:  # no tumbar el servidor
                print("error con pago", pid, e, flush=True)


if __name__ == "__main__":
    assert MP_TOKEN and SMTP_USER and SMTP_PASS, "Faltan MP_ACCESS_TOKEN, SMTP_USER o SMTP_PASS"
    puerto = int(os.environ.get("PORT", "8000"))
    print("Escuchando webhooks en el puerto", puerto, flush=True)
    HTTPServer(("0.0.0.0", puerto), Handler).serve_forever()
