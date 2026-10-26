"""Campaña: publica variantes de anuncio en canales PROPIOS usando APIs oficiales.

Uso:  python campana/campana.py --dry-run     (muestra lo que publicaria)
      python campana/campana.py               (publica; max 1 post por canal cada INTERVALO_HORAS)
Cada canal se activa solo si estan sus credenciales en el entorno.
"""
import argparse
import json
import os
import time
import urllib.request

AQUI = os.path.dirname(__file__)
ESTADO = os.environ.get("CAMPANA_ESTADO", os.path.join(AQUI, "estado.json"))
INTERVALO = float(os.environ.get("INTERVALO_HORAS", "24")) * 3600
LINK = os.environ.get("LINK_COMPRA", "https://link.mercadopago.com.mx/sauljtm34norxtec")
AVISO = "(Producto de pago mío; los trucos gratis funcionan sin comprar.)"


def http(url, datos=None, headers=None, metodo="POST"):
    h = {"Content-Type": "application/json", **(headers or {})}
    req = urllib.request.Request(url, json.dumps(datos).encode() if datos is not None else None, h, method=metodo)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def pub_telegram(texto, titulo):
    t, c = os.environ.get("TG_BOT_TOKEN"), os.environ.get("TG_CHAT_ID")
    if not (t and c):
        return None
    return http(f"https://api.telegram.org/bot{t}/sendMessage", {"chat_id": c, "text": texto, "disable_web_page_preview": False})


def pub_devto(texto, titulo):
    k = os.environ.get("DEVTO_API_KEY")
    if not k:
        return None
    art = {"article": {"title": titulo, "body_markdown": texto, "published": True, "tags": ["termux", "android", "linux", "spanish"]}}
    return http("https://dev.to/api/articles", art, {"api-key": k})


def pub_bluesky(texto, titulo):
    h, p = os.environ.get("BSKY_HANDLE"), os.environ.get("BSKY_APP_PASSWORD")
    if not (h and p):
        return None
    s = http("https://bsky.social/xrpc/com.atproto.server.createSession", {"identifier": h, "password": p})
    rec = {"$type": "app.bsky.feed.post", "text": texto[:300], "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "langs": ["es"]}
    return http("https://bsky.social/xrpc/com.atproto.repo.createRecord",
                {"repo": s["did"], "collection": "app.bsky.feed.post", "record": rec},
                {"Authorization": f"Bearer {s['accessJwt']}"})


def pub_mastodon(texto, titulo):
    inst, tok = os.environ.get("MASTODON_INSTANCE"), os.environ.get("MASTODON_TOKEN")
    if not (inst and tok):
        return None
    return http(f"https://{inst}/api/v1/statuses", {"status": texto[:500], "language": "es"}, {"Authorization": f"Bearer {tok}"})


CANALES = {"telegram": pub_telegram, "devto": pub_devto, "bluesky": pub_bluesky, "mastodon": pub_mastodon}
LARGOS = {"bluesky", "mastodon"}  # canales de texto corto


def cargar():
    try:
        with open(ESTADO) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def elegir(variantes, estado, canal, ahora):
    """Variante siguiente del canal, o None si aun no toca publicar."""
    e = estado.get(canal, {"ultimo": 0, "i": 0})
    if ahora - e["ultimo"] < INTERVALO:
        return None
    return variantes[e["i"] % len(variantes)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    with open(os.path.join(AQUI, "variantes.json"), encoding="utf-8") as f:
        v = json.load(f)
    estado, ahora = cargar(), time.time()
    for canal, fn in CANALES.items():
        var = elegir(v[canal if canal in v else "corto"], estado, canal, ahora)
        if var is None:
            print(canal, ": aun no toca"); continue
        texto = var["texto"].replace("{LINK}", LINK).replace("{AVISO}", AVISO)
        if a.dry_run:
            print(f"--- {canal} ---\n{texto}\n"); continue
        try:
            r = fn(texto, var.get("titulo", "Termux Pack Completo"))
        except Exception as e:
            print(canal, "error:", e); continue
        if r is None:
            print(canal, ": sin credenciales, omitido"); continue
        e = estado.get(canal, {"i": 0})
        estado[canal] = {"ultimo": ahora, "i": e["i"] + 1}
        print(canal, ": publicado"); 
    if not a.dry_run:
        with open(ESTADO, "w") as f:
            json.dump(estado, f)


if __name__ == "__main__":
    main()
