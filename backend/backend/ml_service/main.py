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

# ---------- LOAD MODEL ----------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'agrishield_model.h5')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), 'models', 'class_names.json')

with open(CLASS_NAMES_PATH, 'r') as f:
    class_names_dict = json.load(f)
class_names = [class_names_dict[str(i)] for i in range(len(class_names_dict))]

model = tf.keras.models.load_model(MODEL_PATH)
print(f"✅ Model loaded successfully from {MODEL_PATH}")
print(f"✅ Number of classes: {len(class_names)}")

# ---------- ENDPOINTS ----------
@app.get("/")
def root():
    return {"message": "AgriShield ML Service is running with REAL AI!"}

@app.post("/ml/predict")
async def predict(file: UploadFile = File(...)):
    try:
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
            "top3": top3
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/ml/gradcam")
async def gradcam(file: UploadFile = File(...), class_index: int = 0):
    try:
        image_bytes = await file.read()
        b64_heatmap = generate_gradcam(model, image_bytes, class_index)
        return {"heatmap_base64": b64_heatmap}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ===== VOICE ADVISORY ENDPOINT (NEW) =====
@app.post("/ml/audio")
async def generate_audio(request: AudioRequest):
    try:
        lang_map = {
            "en": "en",
            "bn": "bn",
            "hi": "hi"
        }
        lang = lang_map.get(request.language, "en")

        tts = gTTS(text=request.text, lang=lang, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        return Response(
            content=audio_buffer.read(),
            media_type="audio/mpeg"
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Audio generation failed: {str(e)}"}
        )