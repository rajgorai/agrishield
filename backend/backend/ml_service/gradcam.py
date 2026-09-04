import numpy as np
import cv2
import io
import base64
from PIL import Image
import tensorflow as tf

def generate_gradcam(model, image_bytes, class_index, target_size=(224, 224)):
    """
    Generate Grad-CAM heatmap using direct GradientTape (works with any Keras model).
    """
    # 1. Load and preprocess image
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img)
    img_tensor = tf.convert_to_tensor(np.expand_dims(img_array, axis=0) / 255.0, dtype=tf.float32)

    # 2. Find the last convolutional layer
    conv_layer = None
    for layer in reversed(model.layers):
        if hasattr(layer, 'output_shape') and len(layer.output_shape) == 4:
            if 'conv' in layer.name.lower():
                conv_layer = layer
                break

    if conv_layer is None:
        raise ValueError("No convolutional layer found in the model.")

    conv_layer_name = conv_layer.name
    print(f"✅ Using conv layer: {conv_layer_name} for Grad-CAM")

    # 3. Get the model's input tensor (handle single or multiple inputs)
    model_input = model.inputs[0] if isinstance(model.inputs, list) else model.input

    # 4. Build a custom forward function to get conv output and final predictions
    # We'll use a tape that watches the conv output
    with tf.GradientTape(persistent=True) as tape:
        # Forward pass through the entire model
        predictions = model(img_tensor, training=False)
        
        # To get the conv layer output, we need to access it via the layer's output
        # We can't directly tape the conv output unless we recompute it.
        # Better: create a sub-model that outputs both conv and predictions using the functional API.
        conv_output_tensor = conv_layer.output
        grad_model = tf.keras.models.Model(
            inputs=model_input,
            outputs=[conv_output_tensor, predictions]
        )
        conv_output, preds = grad_model(img_tensor)
        
        if class_index is None:
            class_index = tf.argmax(preds[0]).numpy()
        loss = preds[:, class_index]

    # Compute gradients of the loss with respect to the conv output
    grads = tape.gradient(loss, conv_output)
    weights = tf.reduce_mean(grads, axis=(1, 2))  # shape: [batch, channels]
    weights = weights[0]  # [channels]

    # 5. Generate heatmap
    cam = tf.reduce_sum(tf.multiply(conv_output, weights[tf.newaxis, tf.newaxis, tf.newaxis, :]), axis=-1)
    cam = cam[0].numpy()  # shape: [h, w]

    # 6. ReLU + Normalize
    cam = np.maximum(cam, 0)
    if np.max(cam) > 0:
        cam = (cam - np.min(cam)) / (np.max(cam) - np.min(cam) + 1e-8)

    # 7. Resize and blend with original image
    heatmap = cv2.resize(cam, img_array.shape[:2][::-1])
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)

    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    blended = cv2.addWeighted(img_bgr, 0.6, heatmap_colored, 0.4, 0)

    # 8. Convert to base64
    blended_pil = Image.fromarray(blended.astype(np.uint8))
    buffer = io.BytesIO()
    blended_pil.save(buffer, format='PNG')
    buffer.seek(0)
    b64_string = base64.b64encode(buffer.read()).decode('utf-8')

    return b64_string