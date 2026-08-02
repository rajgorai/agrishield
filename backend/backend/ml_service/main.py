from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import io
from PIL import Image
import numpy as np
import tensorflow as tf
import json
import os

app = FastAPI()

# Load the model and class names when the server starts
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'agrishield_model.h5')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), 'models', 'class_names.json')

# Load class names
with open(CLASS_NAMES_PATH, 'r') as f:
    class_names_dict = json.load(f)  # Format: {"0": "Tomato___Late_blight", ...}
class_names = [class_names_dict[str(i)] for i in range(len(class_names_dict))]

# Load the trained model
model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Model loaded successfully from {MODEL_PATH}")
print(f"✅ Number of classes: {len(class_names)}")

@app.get("/")
def root():
    return {"message": "AgriShield ML Service is running with REAL AI!"}

@app.post("/ml/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # 1. Read and preprocess the image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img = img.resize((224, 224))  # MobileNetV2 expects 224x224
        
        # Convert to numpy array and normalize
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

        # 2. Run prediction
        predictions = model.predict(img_array)[0]  # Shape: (38,)
        
        # 3. Get top 3 predictions
        top3_indices = np.argsort(predictions)[-3:][::-1]  # Descending order
        top3 = [
            {"label": class_names[idx], "confidence": round(float(predictions[idx]), 4)}
            for idx in top3_indices
        ]
        
        # 4. Prepare response
        response = {
            "top_class": top3[0]['label'],
            "confidence": top3[0]['confidence'],
            "top3": top3
        }
        return JSONResponse(content=response)
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})