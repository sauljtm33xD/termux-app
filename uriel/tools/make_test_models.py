"""Genera modelos ONNX diminutos con la interfaz de MiniLM para probar OnnxEmbedder sin el modelo real.

tiny_bert.onnx:        input_ids, attention_mask, token_type_ids -> last_hidden_state [1, S, 8]
                       last_hidden_state[t] = table[input_ids[t]] + type_table[token_type_ids[t]]
                       table[v][d] = sin(0.37*v + 1.3*d),  type_table[k][d] = 0.01*(k+1)*(d+1)
tiny_nomask.onnx:      solo input_ids (debe rechazarse)
tiny_bad_output.onnx:  salida 2D (debe rechazarse)

Uso: python make_test_models.py <carpeta_destino>
"""
import sys
import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper

V, H = 64, 8
table = np.array([[np.sin(0.37 * v + 1.3 * d) for d in range(H)] for v in range(V)], dtype=np.float32)
type_table = np.array([[0.01 * (k + 1) * (d + 1) for d in range(H)] for k in range(2)], dtype=np.float32)


def ids_input(name):
    return helper.make_tensor_value_info(name, TensorProto.INT64, [1, "S"])


def save(graph, path):
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 8
    onnx.checker.check_model(model)
    onnx.save(model, path)


def main(out):
    tbl = numpy_helper.from_array(table, "table")
    ttbl = numpy_helper.from_array(type_table, "type_table")
    g = helper.make_graph(
        [helper.make_node("Gather", ["table", "input_ids"], ["tok"], axis=0),
         helper.make_node("Gather", ["type_table", "token_type_ids"], ["typ"], axis=0),
         helper.make_node("Add", ["tok", "typ"], ["last_hidden_state"])],
        "tiny_bert",
        [ids_input("input_ids"), ids_input("attention_mask"), ids_input("token_type_ids")],
        [helper.make_tensor_value_info("last_hidden_state", TensorProto.FLOAT, [1, "S", H])],
        [tbl, ttbl])
    save(g, f"{out}/tiny_bert.onnx")

    g = helper.make_graph(
        [helper.make_node("Gather", ["table", "input_ids"], ["last_hidden_state"], axis=0)],
        "tiny_nomask", [ids_input("input_ids")],
        [helper.make_tensor_value_info("last_hidden_state", TensorProto.FLOAT, [1, "S", H])], [tbl])
    save(g, f"{out}/tiny_nomask.onnx")

    g = helper.make_graph(
        [helper.make_node("Gather", ["table", "input_ids"], ["tok"], axis=0),
         helper.make_node("ReduceMean", ["tok"], ["pooled"], axes=[1], keepdims=0)],
        "tiny_bad_output", [ids_input("input_ids"), ids_input("attention_mask")],
        [helper.make_tensor_value_info("pooled", TensorProto.FLOAT, [1, H])], [tbl])
    save(g, f"{out}/tiny_bad_output.onnx")


if __name__ == "__main__":
    main(sys.argv[1])
