import os, sys, sqlite3, time, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tienda"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "campana"))
import entrega, campana

def con():
    c = sqlite3.connect(":memory:")
    c.execute("CREATE TABLE ventas (payment_id TEXT PRIMARY KEY, email TEXT, monto REAL, enviado INTEGER)")
    return c

class Tienda(unittest.TestCase):
    def test_aprobado_envia_una_sola_vez(self):
        enviados, c = [], con()
        pago = lambda i: {"status": "approved", "transaction_amount": 100, "payer": {"email": "a@b.c"}}
        self.assertEqual(entrega.procesar_pago("1", pago, enviados.append, c), "entregado a a@b.c")
        self.assertEqual(entrega.procesar_pago("1", pago, enviados.append, c), "ya entregado")
        self.assertEqual(enviados, ["a@b.c"])
    def test_no_aprobado_o_monto_bajo_no_envia(self):
        enviados, c = [], con()
        entrega.procesar_pago("2", lambda i: {"status": "pending"}, enviados.append, c)
        entrega.procesar_pago("3", lambda i: {"status": "approved", "transaction_amount": 5, "payer": {"email": "x@y.z"}}, enviados.append, c)
        self.assertEqual(enviados, [])
    def test_fallo_de_envio_permite_reintento(self):
        c = con()
        pago = lambda i: {"status": "approved", "transaction_amount": 100, "payer": {"email": "a@b.c"}}
        def falla(_): raise RuntimeError("smtp")
        with self.assertRaises(RuntimeError): entrega.procesar_pago("4", pago, falla, c)
        self.assertEqual(entrega.procesar_pago("4", pago, lambda _: None, c), "entregado a a@b.c")
    def test_zip_existe(self):
        self.assertTrue(os.path.exists(entrega.PRODUCT))

class Campana(unittest.TestCase):
    def test_respeta_intervalo_y_rota(self):
        v = [{"texto": "a"}, {"texto": "b"}]
        ahora = time.time()
        self.assertEqual(campana.elegir(v, {}, "x", ahora)["texto"], "a")
        self.assertIsNone(campana.elegir(v, {"x": {"ultimo": ahora - 60, "i": 1}}, "x", ahora))
        self.assertEqual(campana.elegir(v, {"x": {"ultimo": 0, "i": 1}}, "x", ahora)["texto"], "b")

if __name__ == "__main__":
    unittest.main()
