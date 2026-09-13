import tensorflow as tf
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_R_PATH = os.path.join(BASE_DIR, 'models', 'agrishield_model_old.h5')

print(f"Loading model R from: {MODEL_R_PATH}\n")
model = tf.keras.models.load_model(MODEL_R_PATH)

print(f"Total top-level layers: {len(model.layers)}\n")
print("=" * 60)
print("TOP-LEVEL LAYERS:")
print("=" * 60)

for i, layer in enumerate(model.layers):
    try:
        shape = layer.output_shape
    except Exception:
        shape = "unknown"
    has_sub = hasattr(layer, 'layers')
    num_sub = len(layer.layers) if has_sub else 0
    print(f"{i:3d} | {layer.name:40s} | shape={str(shape):25s} | sub_layers={num_sub}")

print("\n" + "=" * 60)
print("CHECKING FOR NESTED MODEL:")
print("=" * 60)

for layer in model.layers:
    if hasattr(layer, 'layers') and len(layer.layers) > 0:
        print(f"\n📦 Nested model found: {layer.name}")
        print(f"   Number of sub-layers: {len(layer.layers)}")
        print(f"   Input shape: {layer.input_shape if hasattr(layer, 'input_shape') else '?'}")
        print(f"   Output shape: {layer.output_shape if hasattr(layer, 'output_shape') else '?'}")

        # Show last 5 sub-layers
        print(f"   Last 5 sub-layers:")
        for sub in layer.layers[-5:]:
            try:
                sub_shape = sub.output_shape
            except Exception:
                sub_shape = "unknown"
            print(f"      - {sub.name} | {sub_shape}")