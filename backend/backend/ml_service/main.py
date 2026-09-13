from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
import io
from PIL import Image
import numpy as np
import tensorflow as tf
import json
import os
from gradcam import generate_gradcam
from gtts import gTTS
from pydantic import BaseModel

app = FastAPI()

# ---------- REQUEST MODELS ----------
class AudioRequest(BaseModel):
    text: str
    language: str = "en"

# ---------- LOAD BOTH MODELS AT STARTUP ----------
BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Model R (Classic – 38 classes, Grad-CAM supported)
MODEL_R_PATH = os.path.join(MODELS_DIR, 'agrishield_model_old.h5')
CLASS_NAMES_R_PATH = os.path.join(MODELS_DIR, 'class_names_old.json')

# Model J (Jumbo – 88 classes, Grad-CAM NOT supported)
MODEL_J_PATH = os.path.join(MODELS_DIR, 'agrishield_model_extended.keras')
CLASS_NAMES_J_PATH = os.path.join(MODELS_DIR, 'class_names.json')

# Load Model R
print(f"⏳ Loading Model R (Classic)...")
with open(CLASS_NAMES_R_PATH, 'r') as f:
    class_names_R_dict = json.load(f)
class_names_R = [class_names_R_dict[str(i)] for i in range(len(class_names_R_dict))]
model_R = tf.keras.models.load_model(MODEL_R_PATH)
print(f"✅ Model R loaded. Classes: {len(class_names_R)}")

# Load Model J
print(f"⏳ Loading Model J (Jumbo)...")
with open(CLASS_NAMES_J_PATH, 'r') as f:
    class_names_J_dict = json.load(f)
class_names_J = [class_names_J_dict[str(i)] for i in range(len(class_names_J_dict))]
model_J = tf.keras.models.load_model(MODEL_J_PATH)
print(f"✅ Model J loaded. Classes: {len(class_names_J)}")

# Current active model (default: J)
current_model = "J"
print(f"🎯 Default active model: {current_model}")

# ---------- ENDPOINTS ----------
@app.get("/")
def root():
    return {
        "message": "AgriShield ML Service is running!",
        "active_model": current_model,
        "available_models": {
            "R": {"classes": len(class_names_R), "gradcam": True, "description": "Classic – 38 classes, Grad-CAM supported"},
            "J": {"classes": len(class_names_J), "gradcam": False, "description": "Jumbo – 88 classes, Grad-CAM not supported"}
        }
    }

# ===== SWITCH MODEL ENDPOINT =====
@app.post("/ml/switch-model")
async def switch_model(model: str):
    global current_model
    model = model.upper()
    if model not in ["R", "J"]:
        return JSONResponse(status_code=400, content={"error": "Invalid model. Use 'R' or 'J'."})
    current_model = model
    print(f"🔄 Switched to model: {current_model}")
    return {"status": "switched", "active_model": current_model}

# ===== PREDICT ENDPOINT =====
@app.post("/ml/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Select active model
        if current_model == "R":
            model = model_R
            class_names = class_names_R
        else:
            model = model_J
            class_names = class_names_J

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]
        top1_index = int(np.argmax(predictions))
        top3_indices = np.argsort(predictions)[-3:][::-1]
        top3 = [
            {"label": class_names[idx], "confidence": round(float(predictions[idx]), 4)}
            for idx in top3_indices
        ]

        return JSONResponse(content={
            "top_class": top3[0]['label'],
            "top_class_index": top1_index,
            "confidence": top3[0]['confidence'],
            "top3": top3,
            "model_used": current_model
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ===== GRAD-CAM ENDPOINT (Only works when model = R) =====
@app.post("/ml/gradcam")
async def gradcam(file: UploadFile = File(...), class_index: int = 0):
    try:
        if current_model == "J":
            return JSONResponse(
                status_code=400,
                content={"error": "Grad-CAM is not supported in Jumbo (J) mode. Switch to Classic (R) mode to enable explainability."}
            )

        image_bytes = await file.read()
        b64_heatmap = generate_gradcam(model_R, image_bytes, class_index)
        return {"heatmap_base64": b64_heatmap, "model_used": "R"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ===== VOICE ADVISORY ENDPOINT =====
@app.post("/ml/audio")
async def generate_audio(request: AudioRequest):
    try:
        lang_map = {"en": "en", "bn": "bn", "hi": "hi"}
        lang = lang_map.get(request.language, "en")

        tts = gTTS(text=request.text, lang=lang, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        return Response(content=audio_buffer.read(), media_type="audio/mpeg")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Audio generation failed: {str(e)}"})