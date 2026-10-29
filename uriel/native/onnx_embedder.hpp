// OnnxEmbedder: embeddings semánticos con un modelo tipo BERT/MiniLM en ONNX Runtime.
//
//   texto -> Tokenizer -> input_ids/attention_mask -> modelo ONNX -> last_hidden_state
//         -> promedio de los tokens reales (mean pooling con máscara) -> norma L2 = 1
//
// Es el pipeline de sentence-transformers para modelos como
// paraphrase-multilingual-MiniLM-L12-v2 (384 dimensiones, multilingüe).
//
// - Implementa uriel::Embedder: se conecta a VectorMemory sin cambiar nada más.
// - El tokenizer es una interfaz aparte: cada modelo trae el suyo y debe coincidir exactamente
//   con el de entrenamiento, o los vectores no significan nada.
// - Session::Run de ONNX Runtime admite llamadas concurrentes, así que embed() también.
// - Requiere ONNX Runtime (Linux: biblioteca del paquete onnxruntime; Android: AAR
//   com.microsoft.onnxruntime:onnxruntime-android). Se compila con -DURIEL_WITH_ONNX=ON.
#pragma once

#include "vector_memory.hpp"

#include <onnxruntime_cxx_api.h>

#include <array>
#include <cmath>
#include <memory>
#include <string>
#include <vector>

namespace uriel {

class Tokenizer {
public:
    struct Encoding {
        std::vector<int64_t> input_ids;
        std::vector<int64_t> attention_mask;  // 1 = token real, 0 = relleno
    };
    virtual ~Tokenizer() = default;
    virtual std::string name() const = 0;
    // Debe incluir los tokens especiales del modelo (p. ej. <s> ... </s>) y truncar a max_tokens.
    virtual Encoding encode(std::string_view text, size_t max_tokens) const = 0;
};

class OnnxEmbedder final : public Embedder {
public:
    // Devuelve nullptr y llena `error` si el modelo no se puede cargar o no tiene la forma esperada.
    static std::unique_ptr<OnnxEmbedder> create(const std::string& model_path, std::shared_ptr<const Tokenizer> tokenizer,
                                                const std::string& model_name, size_t max_tokens = 128,
                                                std::string* error = nullptr) {
        auto fail = [&](const std::string& e) -> std::unique_ptr<OnnxEmbedder> {
            if (error) *error = e;
            return nullptr;
        };
        if (!tokenizer) return fail("tokenizer nulo");
        try {
            std::unique_ptr<OnnxEmbedder> e(new OnnxEmbedder(std::move(tokenizer), model_name, max_tokens));
            Ort::SessionOptions opts;
            opts.SetIntraOpNumThreads(1);  // un hilo por llamada; el paralelismo lo dan los llamadores
            opts.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);
            e->session_ = std::make_unique<Ort::Session>(env(), model_path.c_str(), opts);

            Ort::AllocatorWithDefaultOptions alloc;
            for (size_t i = 0; i < e->session_->GetInputCount(); i++) {
                std::string n = e->session_->GetInputNameAllocated(i, alloc).get();
                if (n == "input_ids") e->has_ids_ = true;
                else if (n == "attention_mask") e->has_mask_ = true;
                else if (n == "token_type_ids") e->has_types_ = true;
                else return fail("entrada desconocida en el modelo: " + n);
            }
            if (!e->has_ids_ || !e->has_mask_) return fail("el modelo debe tener entradas input_ids y attention_mask");

            if (e->session_->GetOutputCount() < 1) return fail("el modelo no tiene salidas");
            e->output_name_ = e->session_->GetOutputNameAllocated(0, alloc).get();
            auto shape = e->session_->GetOutputTypeInfo(0).GetTensorTypeAndShapeInfo().GetShape();
            if (shape.size() != 3 || shape[2] <= 0)
                return fail("la salida 0 debe ser [lote, tokens, dimensión] con dimensión fija");
            e->dim_ = static_cast<size_t>(shape[2]);
            return e;
        } catch (const Ort::Exception& ex) {
            return fail(std::string("ONNX Runtime: ") + ex.what());
        }
    }

    std::string name() const override { return "onnx:" + model_name_ + "|" + tokenizer_->name(); }
    size_t dim() const override { return dim_; }

    void embed(std::string_view text, float* out) const override {
        std::fill(out, out + dim_, 0.0f);
        Tokenizer::Encoding enc = tokenizer_->encode(text, max_tokens_);
        size_t n = enc.input_ids.size();
        if (n == 0 || enc.attention_mask.size() != n) return;

        std::vector<int64_t> types(n, 0);
        std::array<int64_t, 2> in_shape{1, static_cast<int64_t>(n)};
        Ort::MemoryInfo mem = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);

        std::vector<const char*> names;
        std::vector<Ort::Value> values;
        names.push_back("input_ids");
        values.push_back(Ort::Value::CreateTensor<int64_t>(mem, enc.input_ids.data(), n, in_shape.data(), 2));
        names.push_back("attention_mask");
        values.push_back(Ort::Value::CreateTensor<int64_t>(mem, enc.attention_mask.data(), n, in_shape.data(), 2));
        if (has_types_) {
            names.push_back("token_type_ids");
            values.push_back(Ort::Value::CreateTensor<int64_t>(mem, types.data(), n, in_shape.data(), 2));
        }
        const char* out_name = output_name_.c_str();

        std::vector<Ort::Value> result;
        try {
            result = session_->Run(Ort::RunOptions{nullptr}, names.data(), values.data(), values.size(), &out_name, 1);
        } catch (const Ort::Exception&) {
            return;  // vector cero: VectorMemory lo trata como "sin contenido"
        }
        auto info = result[0].GetTensorTypeAndShapeInfo();
        auto shape = info.GetShape();
        if (shape.size() != 3 || shape[0] != 1 || static_cast<size_t>(shape[1]) != n || static_cast<size_t>(shape[2]) != dim_) return;
        const float* h = result[0].GetTensorData<float>();

        // Mean pooling: promedio de los vectores de los tokens con máscara 1.
        double count = 0;
        std::vector<double> acc(dim_, 0.0);
        for (size_t t = 0; t < n; t++) {
            if (!enc.attention_mask[t]) continue;
            count++;
            for (size_t d = 0; d < dim_; d++) acc[d] += h[t * dim_ + d];
        }
        if (count == 0) return;
        double norm = 0;
        for (size_t d = 0; d < dim_; d++) { acc[d] /= count; norm += acc[d] * acc[d]; }
        if (norm <= 0 || !std::isfinite(norm)) return;
        double inv = 1.0 / std::sqrt(norm);
        for (size_t d = 0; d < dim_; d++) out[d] = static_cast<float>(acc[d] * inv);
    }

private:
    OnnxEmbedder(std::shared_ptr<const Tokenizer> tok, std::string model_name, size_t max_tokens)
        : tokenizer_(std::move(tok)), model_name_(std::move(model_name)), max_tokens_(max_tokens) {}

    static Ort::Env& env() {
        static Ort::Env e(ORT_LOGGING_LEVEL_WARNING, "uriel");
        return e;
    }

    std::shared_ptr<const Tokenizer> tokenizer_;
    std::string model_name_;
    size_t max_tokens_;
    std::unique_ptr<Ort::Session> session_;
    std::string output_name_;
    size_t dim_ = 0;
    bool has_ids_ = false, has_mask_ = false, has_types_ = false;
};

}  // namespace uriel
