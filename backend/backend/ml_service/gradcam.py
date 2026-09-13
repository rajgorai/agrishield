import numpy as np
import cv2
import io
import base64
from PIL import Image
import tensorflow as tf

def find_conv_layer(model):
    """
    Find the last conv layer.
    Priority: known MobileNetV2 layer name, then any Conv2D.
    """
    # Priority 1: MobileNetV2's standard last conv layer
    try:
        return model.get_layer('out_relu')
    except Exception:
        pass

    # Priority 2: Any Conv2D layer, taking the last one
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer

    # Priority 3: DepthwiseConv2D
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.DepthwiseConv2D):
            return layer

    # Priority 4: Any layer with 4D output
    for layer in reversed(model.layers):
        try:
            shape = layer.output.shape
            if len(shape) == 4:
                return layer
        except Exception:
            continue

    return None


def generate_gradcam(model, image_bytes, class_index, target_size=(224, 224)):
    """Generate Grad-CAM heatmap."""
    # 1. Preprocess image
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img)
    img_tensor = tf.convert_to_tensor(
        np.expand_dims(img_array, axis=0) / 255.0,
        dtype=tf.float32
    )

    # 2. Find the conv layer
    conv_layer = find_conv_layer(model)
    if conv_layer is None:
        raise ValueError("No suitable convolutional layer found in the model.")

    print(f"✅ Using layer for Grad-CAM: {conv_layer.name}")

    # 3. Build the gradient model
    # Using model.inputs → [conv_layer.output, model.output]
    try:
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[conv_layer.output, model.output]
        )
    except Exception as e:
        raise ValueError(f"Failed to build grad model: {e}")

    # 4. Compute gradients
    with tf.GradientTape() as tape:
        conv_output, predictions = grad_model(img_tensor)
        if class_index is None:
            class_index = tf.argmax(predictions[0]).numpy()
        loss = predictions[:, class_index]

    grads = tape.gradient(loss, conv_output)
    if grads is None:
        raise ValueError("Gradients are None. Grad-CAM cannot be computed.")

    # 5. Pool gradients over spatial dims to get per-channel weights
    weights = tf.reduce_mean(grads, axis=(1, 2))[0]

    # 6. Weighted sum of conv output channels
    cam = tf.reduce_sum(
        conv_output[0] * weights[tf.newaxis, tf.newaxis, :],
        axis=-1
    ).numpy()

    # 7. ReLU + Normalize
    cam = np.maximum(cam, 0)
    if np.max(cam) > 0:
        cam = (cam - np.min(cam)) / (np.max(cam) - np.min(cam) + 1e-8)

    # 8. Resize heatmap and overlay
    heatmap = cv2.resize(cam, img_array.shape[:2][::-1])
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)

    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    blended = cv2.addWeighted(img_bgr, 0.6, heatmap_colored, 0.4, 0)

    # 9. Encode as base64
    blended_pil = Image.fromarray(blended.astype(np.uint8))
    buffer = io.BytesIO()
    blended_pil.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')