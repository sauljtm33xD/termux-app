// Prueba OnnxEmbedder con los modelos diminutos de testdata/ (ver uriel/tools/make_test_models.py).
// El resultado esperado se calcula aquí de forma independiente a partir de la fórmula de los pesos.
#include "onnx_embedder.hpp"

#include <atomic>
#include <cstdio>
#include <thread>

static int failures = 0;
#define CHECK(c) do { if (!(c)) { std::printf("FAIL %s:%d %s\n", __FILE__, __LINE__, #c); failures++; } } while (0)

using uriel::OnnxEmbedder;
using uriel::Tokenizer;

constexpr int kH = 8, kCls = 0, kSep = 63;  // vocabulario de 64 ids (0..63)

// Tokenizer de prueba: <cls> + un id por byte + <sep>, con relleno opcional (máscara 0).
class StubTokenizer : public Tokenizer {
public:
    explicit StubTokenizer(size_t pad = 0) : pad_(pad) {}
    std::string name() const override { return "stub"; }
    Encoding encode(std::string_view text, size_t max_tokens) const override {
        Encoding e;
        if (text == "<vacio>") return e;  // simula un tokenizer que no produce nada
        e.input_ids.push_back(kCls);
        for (unsigned char c : text) {
            if (e.input_ids.size() + 1 >= max_tokens) break;
            e.input_ids.push_back(1 + c % 62);
        }
        e.input_ids.push_back(kSep);
        e.attention_mask.assign(e.input_ids.size(), 1);
        for (size_t i = 0; i < pad_; i++) { e.input_ids.push_back(5); e.attention_mask.push_back(0); }
        return e;
    }
private:
    size_t pad_;
};

static std::vector<float> expected(std::string_view text, size_t max_tokens) {
    StubTokenizer tok;
    auto enc = tok.encode(text, max_tokens);
    std::vector<double> acc(kH, 0.0);
    for (int64_t id : enc.input_ids)
        for (int d = 0; d < kH; d++) acc[d] += std::sin(0.37 * id + 1.3 * d) + 0.01 * 1 * (d + 1);
    double norm = 0;
    for (auto& a : acc) { a /= enc.input_ids.size(); norm += a * a; }
    std::vector<float> out(kH);
    for (int d = 0; d < kH; d++) out[d] = static_cast<float>(acc[d] / std::sqrt(norm));
    return out;
}

static float max_diff(const std::vector<float>& a, const std::vector<float>& b) {
    float m = 0;
    for (size_t i = 0; i < a.size(); i++) m = std::max(m, std::fabs(a[i] - b[i]));
    return m;
}

int main(int argc, char** argv) {
    std::string data = argc > 1 ? argv[1] : "testdata";
    std::string work = argc > 2 ? argv[2] : ".";
    std::string err;

    // 1. Carga y forma.
    auto emb = OnnxEmbedder::create(data + "/tiny_bert.onnx", std::make_shared<StubTokenizer>(), "tiny-bert", 16, &err);
    CHECK(emb != nullptr);
    if (!emb) { std::printf("no se pudo cargar: %s\n", err.c_str()); return 1; }
    CHECK(emb->dim() == kH);
    CHECK(emb->name() == "onnx:tiny-bert|stub");
    std::printf("[1] modelo cargado: dim=%zu, nombre=%s\n", emb->dim(), emb->name().c_str());

    // 2. Coincide con el cálculo independiente (mean pooling + norma L2), incluido el truncado.
    {
        float worst = 0;
        for (const char* t : {"hola", "La memoria vectorial de Saul", "a", "texto bastante largo que se trunca a 16 tokens"}) {
            std::vector<float> got(kH);
            emb->embed(t, got.data());
            float d = max_diff(got, expected(t, 16));
            worst = std::max(worst, d);
            double n = 0; for (float x : got) n += double(x) * x;
            CHECK(std::fabs(n - 1.0) < 1e-5);
        }
        CHECK(worst < 1e-5f);
        std::printf("[2] coincide con el cálculo independiente: diferencia máxima %.2e\n", worst);
    }

    // 3. Los tokens de relleno (máscara 0) no cambian el resultado.
    {
        auto padded = OnnxEmbedder::create(data + "/tiny_bert.onnx", std::make_shared<StubTokenizer>(5), "tiny-bert", 16, &err);
        CHECK(padded != nullptr);
        std::vector<float> a(kH), b(kH);
        emb->embed("relleno", a.data());
        padded->embed("relleno", b.data());
        CHECK(max_diff(a, b) < 1e-6f);
        std::printf("[3] relleno ignorado: diferencia %.2e\n", max_diff(a, b));
    }

    // 4. Errores: se rechazan con mensaje, sin abortar.
    {
        std::printf("[4] errores:\n");
        auto check_fail = [&](std::unique_ptr<OnnxEmbedder> e, const char* what) {
            CHECK(e == nullptr);
            std::printf("    %-28s -> %s\n", what, err.c_str());
        };
        check_fail(OnnxEmbedder::create(data + "/no_existe.onnx", std::make_shared<StubTokenizer>(), "x", 16, &err), "archivo inexistente");
        check_fail(OnnxEmbedder::create(data + "/tiny_nomask.onnx", std::make_shared<StubTokenizer>(), "x", 16, &err), "sin attention_mask");
        check_fail(OnnxEmbedder::create(data + "/tiny_bad_output.onnx", std::make_shared<StubTokenizer>(), "x", 16, &err), "salida 2D");
        check_fail(OnnxEmbedder::create(data + "/tiny_bert.onnx", nullptr, "x", 16, &err), "tokenizer nulo");
        std::vector<float> z(kH, 1.0f);
        emb->embed("<vacio>", z.data());
        bool zero = true; for (float x : z) zero &= x == 0.0f;
        CHECK(zero);
        std::printf("    %-28s -> vector cero\n", "tokenizer sin tokens");
    }

    // 5. Integración con VectorMemory, incluido que no se mezclen archivos de otro embedder.
    {
        std::shared_ptr<const uriel::Embedder> shared = std::move(emb);
        uriel::VectorMemory mem(shared);
        mem.add("hola mundo");
        mem.add("zzzz");
        auto hits = mem.search("hola mundo", 1);
        CHECK(!hits.empty() && hits[0].id == 1 && hits[0].score > 0.9999f);
        std::string path = work + "/onnx_mem.urvm";
        CHECK(mem.save(path, &err));
        uriel::VectorMemory again(shared);
        CHECK(again.load(path, &err) && again.size() == 2);
        uriel::VectorMemory lexical(std::make_shared<uriel::HashingEmbedder>(kH < 64 ? 64 : kH));
        CHECK(!lexical.load(path, &err));
        std::printf("[5] VectorMemory: búsqueda OK, guardar/cargar OK; con otro embedder -> %s\n", err.c_str());
        unlink(path.c_str());

        // 6. Concurrencia: 8 hilos calculando a la vez dan resultados idénticos.
        std::vector<float> ref(kH);
        shared->embed("concurrencia", ref.data());
        std::atomic<int> bad{0};
        std::vector<std::thread> ts;
        for (int t = 0; t < 8; t++) ts.emplace_back([&] {
            std::vector<float> v(kH);
            for (int i = 0; i < 200; i++) { shared->embed("concurrencia", v.data()); if (v != ref) bad++; }
        });
        for (auto& t : ts) t.join();
        CHECK(bad == 0);
        std::printf("[6] concurrencia: 8 hilos x 200 llamadas, resultados distintos: %d\n", bad.load());
    }

    std::printf(failures ? "TESTS FALLIDOS: %d\n" : "TODOS LOS TESTS OK\n", failures);
    return failures != 0;
}
