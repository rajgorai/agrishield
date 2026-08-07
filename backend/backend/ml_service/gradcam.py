import numpy as np
import cv2
import io
import base64
from PIL import Image
import tensorflow as tf

def generate_gradcam(model, image_bytes, class_index, target_size=(224, 224)):
    """
    Generate Grad-CAM heatmap using TensorFlow GradientTape.
    Fixed for MobileNetV2 with out_relu layer.
    """
    # Load and preprocess image
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img)
    img_tensor = tf.convert_to_tensor(np.expand_dims(img_array, axis=0) / 255.0, dtype=tf.float32)

    # MobileNetV2 last convolutional layer is typically 'out_relu'
    # Let's try to find it by name
    layer_name = None
    for layer in model.layers:
        if layer.name == 'out_relu':
            layer_name = layer.name
            break

    # If out_relu not found, find the last layer with 4D output
    if layer_name is None:
        for layer in reversed(model.layers):
            if hasattr(layer, 'output_shape') and len(layer.output_shape) == 4:
                if 'conv' in layer.name.lower() or 'depthwise' in layer.name.lower():
                    layer_name = layer.name
                    break

    # Fallback: just use the last layer that has 4D output
    if layer_name is None:
        for layer in reversed(model.layers):
            if hasattr(layer, 'output_shape') and len(layer.output_shape) == 4:
                layer_name = layer.name
                break

    if layer_name is None:
        raise ValueError("Could not find a suitable 4D convolutional layer")

    print(f"✅ Using layer: {layer_name}")

    # Get the layer output
    conv_layer = model.get_layer(layer_name)

    # Create a model that outputs both the conv layer and the final predictions
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[conv_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_output, predictions = grad_model(img_tensor)
        if class_index is None:
            class_index = tf.argmax(predictions[0]).numpy()
        loss = predictions[:, class_index]

    # Compute gradients
    grads = tape.gradient(loss, conv_output)

    # Average gradients over spatial dimensions
    weights = tf.reduce_mean(grads, axis=(1, 2))  # [batch, channels]
    weights = weights[0]  # [channels]

    # Weight the conv output and sum over channels
    weights_expanded = tf.reshape(weights, [1, 1, 1, -1])
    cam = tf.reduce_sum(tf.multiply(conv_output, weights_expanded), axis=-1)  # [1, h, w]
    cam = cam[0].numpy()

    # ReLU
    cam = np.maximum(cam, 0)
    if np.max(cam) > 0:
        cam = (cam - np.min(cam)) / (np.max(cam) - np.min(cam) + 1e-8)

    # Resize and apply color map
    heatmap = cv2.resize(cam, img_array.shape[:2][::-1])
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)

    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    blended = cv2.addWeighted(img_bgr, 0.6, heatmap_colored, 0.4, 0)

    # Convert to base64
    blended_pil = Image.fromarray(blended.astype(np.uint8))
    buffer = io.BytesIO()
    blended_pil.save(buffer, format='PNG')
    buffer.seek(0)
    b64_string = base64.b64encode(buffer.read()).decode('utf-8')

    return b64_string