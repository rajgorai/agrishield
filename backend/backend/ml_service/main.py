from fastapi import FastAPI, UploadFile, File, Query
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

# ---- NEW IMPORTS ----
import torch
import timm
from safetensors.torch import load_file
from torchvision import transforms
from ultralytics import YOLO

app = FastAPI()

# ---------- REQUEST MODELS ----------
class AudioRequest(BaseModel):
    text: str
    language: str = "en"

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, 'models')

MODEL_R_PATH = os.path.join(MODELS_DIR, 'agrishield_model_old.h5')
CLASS_NAMES_R_PATH = os.path.join(MODELS_DIR, 'class_names_old.json')

MODEL_J_PATH = os.path.join(MODELS_DIR, 'agrishield_model_extended.keras')
CLASS_NAMES_J_PATH = os.path.join(MODELS_DIR, 'class_names.json')

S1_PATH = os.path.join(MODELS_DIR, 'jktk_x.pt')

S2_WEIGHTS = os.path.join(MODELS_DIR, 'model.safetensors')
S2_CONFIG = os.path.join(MODELS_DIR, 'config.json')

# ---------- LOAD R ----------
print("⏳ Loading Model R (Classic)...")
with open(CLASS_NAMES_R_PATH, 'r') as f:
    class_names_R_dict = json.load(f)
class_names_R = [class_names_R_dict[str(i)] for i in range(len(class_names_R_dict))]
model_R = tf.keras.models.load_model(MODEL_R_PATH)
print(f"✅ Model R loaded. Classes: {len(class_names_R)}")

# ---------- LOAD J ----------
print("⏳ Loading Model J (Jumbo)...")
with open(CLASS_NAMES_J_PATH, 'r') as f:
    class_names_J_dict = json.load(f)
class_names_J = [class_names_J_dict[str(i)] for i in range(len(class_names_J_dict))]
model_J = tf.keras.models.load_model(MODEL_J_PATH)
print(f"✅ Model J loaded. Classes: {len(class_names_J)}")

# ---------- LOAD S1 (KrishiBondhu YOLO) ----------
print("⏳ Loading Model S1 (KrishiBondhu YOLO)...")
model_S1 = YOLO(S1_PATH)
S1_CLASS_NAMES = model_S1.names  # dict {id: name}
print(f"✅ Model S1 loaded. Classes: {len(S1_CLASS_NAMES)}")

# ---------- LOAD S2 (AgroMind NFNet-F1) ----------
print("⏳ Loading Model S2 (AgroMind NFNet-F1)...")
with open(S2_CONFIG, 'r') as f:
    s2_config = json.load(f)
S2_CLASS_NAMES = s2_config["class_names"]
model_S2 = timm.create_model(
    s2_config["architecture"],
    pretrained=False,
    num_classes=s2_config["num_classes"]
)
state_dict = load_file(S2_WEIGHTS)
model_S2.load_state_dict(state_dict)
model_S2.eval()

S2_TRANSFORM = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])
print(f"✅ Model S2 loaded. Classes: {len(S2_CLASS_NAMES)}")

DEFAULT_MODEL = "J"
print(f"🎯 Default model (per request): {DEFAULT_MODEL}")


# ==========================================================
# LABEL NORMALIZATION  (S1 and S2 → DB label format)
# ==========================================================
def title_case(s):
    """'late blight' → 'Late_Blight' ; 'yellow_rust' → 'Yellow_Rust'"""
    # First replace spaces with underscore, then split on underscore to capitalize each part
    normalized = s.replace("-", "_").replace(" ", "_")
    parts = [p for p in normalized.split("_") if p]
    return "_".join(word.capitalize() for word in parts)


def normalize_s1(raw):
    """'potato late blight' → 'Potato___Late_blight'"""
    raw = raw.strip()
    parts = raw.split(" ", 1)
    if len(parts) == 2:
        crop = parts[0].capitalize()
        disease = title_case(parts[1])
        return f"{crop}___{disease}"
    return raw.capitalize()


def normalize_s2(raw):
    """'Potato__late_blight' → 'Potato___Late_blight'"""
    raw = raw.strip()
    if "__" in raw:
        crop, _, disease = raw.partition("__")
        crop_clean = crop.replace("_", " ")
        if crop_clean == "Pepper bell":
            crop_clean = "Pepper,_bell"
        elif crop_clean == "Gauva":
            crop_clean = "Guava"
        crop_clean = crop_clean.replace(" ", "_").capitalize()
        disease_clean = title_case(disease)
        return f"{crop_clean}___{disease_clean}"
    return raw


# ---------- S1 OVERRIDES ----------
# Keys must be LOWERCASE raw S1 labels.
S1_LABEL_MAP = {
    # Fix case-mismatched labels (DB uses lowercase for some)
    "apple black rot":              "Apple___Black_rot",
    "apple scab":                   "Apple___Apple_scab",
    "cherry powdery mildew":        "Cherry_(including_sour)___Powdery_mildew",
    "cherry leaf":                  "Cherry_(including_sour)___healthy",
    "grape black rot":              "Grape___Black_rot",
    "peach leaf curl":              "Peach___Bacterial_spot",
    "strawberry anthracnose":       "Strawberry___Leaf_scorch",
    "strawberry leaf scorch":       "Strawberry___Leaf_scorch",
    "pepper bell leaf spot":        "Pepper,_bell___Bacterial_spot",
    "pepper bell leaf":             "Pepper,_bell___healthy",
    "tomato mosaic virus":          "Tomato___Tomato_mosaic_virus",
    "tomato yellow leaf curl virus":"Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "tomato leaf mold":             "Tomato___Leaf_Mold",
    "tomato leaf":                  "Tomato___healthy",
    "potato leaf":                  "Potato___healthy",

    # Corn overrides stay as-is (already present)
    "corn rust":                  "Corn_(maize)___Common_rust",
    # Corn → Corn_(maize)
    "corn rust":                  "Corn_(maize)___Common_rust",
    "corn northern leaf blight":  "Corn_(maize)___Northern_Leaf_Blight",
    "corn gray leaf spot":        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "corn leaf":                  "Corn_(maize)___healthy",
    "corn brown spots":           "Corn_(maize)___Brown_Spots",
    "corn charcoal":              "Corn_(maize)___Charcoal",
    "corn chlorotic leaf spot":   "Corn_(maize)___Chlorotic_Leaf_Spot",
    "corn insects damages":       "Corn_(maize)___Insects_Damages",
    "corn mildew":                "Corn_(maize)___Mildew",
    "corn purple discoloration":  "Corn_(maize)___Purple_Discoloration",
    "corn smut":                  "Corn_(maize)___Healthy",
    "corn streak":                "Corn_(maize)___Streak",
    "corn stripe":                "Corn_(maize)___Stripe",
    "corn violet decoloration":   "Corn_(maize)___Violet_Decoloration",
    "corn yellow spots":          "Corn_(maize)___Yellow_Spots",
    "corn yellowing":             "Corn_(maize)___Yellowing",
    "corn leaf blight":           "Corn_(maize)___Leaf_Blight",
    "corn rust leaf":             "Corn_(maize)___Rust_Leaf",
}

# ---------- S2 OVERRIDES ----------
# Keys must be EXACT raw S2 labels.
S2_LABEL_MAP = {
    "Pepper_bell__bacterial_spot":                    "Pepper,_bell___Bacterial_spot",
    "Pepper_bell__healthy":                           "Pepper,_bell___healthy",
    "Gauva__diseased":                                "Guava___Diseased",
    "Gauva__healthy":                                 "Guava___Healthy",
    "Grape__leaf_blight_(isariopsis_leaf_spot)":      "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Tomato__spider_mites_(two_spotted_spider_mite)": "Tomato___Spider_mites Two-spotted_spider_mite",
    "Wheat__septoria":                                "Wheat___Septoria",
    "Strawberry___leaf_scorch":                       "Strawberry___Leaf_scorch",
    # Corn → Corn_(maize)
    "Corn__common_rust":          "Corn_(maize)___Common_rust",
    "Corn__gray_leaf_spot":       "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn__healthy":              "Corn_(maize)___healthy",
    "Corn__northern_leaf_blight": "Corn_(maize)___Northern_Leaf_Blight",
    "Apple__black_rot":              "Apple___Black_rot",
    "Apple__scab":                   "Apple___Apple_scab",
    "Cherry__powdery_mildew":        "Cherry_(including_sour)___Powdery_mildew",
    "Grape__black_rot":              "Grape___Black_rot",
    "Peach__bacterial_spot":         "Peach___Bacterial_spot",
    "Potato__early_blight":          "Potato___Early_blight",
    "Potato__late_blight":           "Potato___Late_blight",
    "Strawberry___leaf_scorch":      "Strawberry___Leaf_scorch",
    "Tomato__early_blight":          "Tomato___Early_blight",
    "Tomato__late_blight":           "Tomato___Late_blight",
    "Tomato__leaf_mold":             "Tomato___Leaf_Mold",
    "Tomato__mosaic_virus":          "Tomato___Tomato_mosaic_virus",
    "Tomato__septoria_leaf_spot":    "Tomato___Septoria_leaf_spot",
    "Tomato__yellow_leaf_curl_virus":"Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Wheat__yellow_rust":            "Wheat___Yellow_Rust",
    "Wheat__brown_rust":             "Wheat___Brown_Rust",
}


# ---------- ENDPOINTS ----------
@app.get("/")
def root():
    return {
        "message": "AgriShield ML Service is running!",
        "default_model": DEFAULT_MODEL,
        "available_models": {
            "R":  {"classes": len(class_names_R), "gradcam": True,  "type": "classification"},
            "J":  {"classes": len(class_names_J), "gradcam": False, "type": "classification"},
            "S1": {"classes": len(S1_CLASS_NAMES), "gradcam": False, "type": "detection"},
            "S2": {"classes": len(S2_CLASS_NAMES), "gradcam": False, "type": "classification"},
        }
    }


# ---------- INFERENCE HELPERS ----------
def predict_R(img_array):
    preds = model_R.predict(img_array)[0]
    top1 = int(np.argmax(preds))
    top3_idx = np.argsort(preds)[-3:][::-1]
    top3 = [{"label": class_names_R[i], "confidence": round(float(preds[i]), 4)} for i in top3_idx]
    return top3, top1


def predict_J(img_array):
    preds = model_J.predict(img_array)[0]
    top1 = int(np.argmax(preds))
    top3_idx = np.argsort(preds)[-3:][::-1]
    top3 = [{"label": class_names_J[i], "confidence": round(float(preds[i]), 4)} for i in top3_idx]
    return top3, top1


def predict_S1(image_bytes):
    """YOLO detection — return bounding boxes + mapped top detection labels."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model_S1(img, conf=0.05, imgsz=800, verbose=False)
    result = results[0]

    detections = []
    if result.boxes is not None and len(result.boxes) > 0:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            raw_label = S1_CLASS_NAMES[cls_id]
            mapped = S1_LABEL_MAP.get(raw_label.lower()) or normalize_s1(raw_label)
            detections.append({
                "label": mapped,
                "raw_label": raw_label,
                "confidence": round(float(box.conf[0]), 4),
                "bbox": [round(x, 1) for x in box.xyxy[0].tolist()],
            })

    if not detections:
        return [{"label": "Unknown", "confidence": 0.0, "bbox": []}], 0

    detections.sort(key=lambda x: x["confidence"], reverse=True)
    return detections[:3], 0


def predict_S2(image_bytes):
    """NFNet-F1 classification — returns mapped top-3 labels."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = S2_TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        logits = model_S2(tensor)
        probs = torch.softmax(logits, dim=1)[0]

    sorted_idx = torch.argsort(probs, descending=True)

    mapped_top3 = []
    for idx in sorted_idx[:15]:  # scan top 15, keep first 3 mapped
        i = int(idx)
        raw_label = S2_CLASS_NAMES[i]
        mapped = S2_LABEL_MAP.get(raw_label) or normalize_s2(raw_label)
        mapped_top3.append({
            "label": mapped,
            "raw_label": raw_label,
            "confidence": round(float(probs[i]), 4),
        })
        if len(mapped_top3) >= 3:
            break

    if not mapped_top3:
        return [{"label": "Unknown", "confidence": 0.0}], 0

    return mapped_top3, 0


# ---------- PREDICT ENDPOINT ----------
@app.post("/ml/predict")
async def predict(
    file: UploadFile = File(...),
    model: str = Query(DEFAULT_MODEL)
):
    try:
        model = model.upper()
        if model not in ["R", "J", "S1", "S2"]:
            return JSONResponse(status_code=400,
                                content={"error": "Invalid model. Use R, J, S1, or S2."})

        contents = await file.read()

        if model == "S1":
            top3, class_idx = predict_S1(contents)
        elif model == "S2":
            top3, class_idx = predict_S2(contents)
        else:
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            img = img.resize((224, 224))
            arr = np.array(img) / 255.0
            arr = np.expand_dims(arr, axis=0)
            if model == "R":
                top3, class_idx = predict_R(arr)
            else:
                top3, class_idx = predict_J(arr)

        return JSONResponse(content={
            "top_class": top3[0]["label"],
            "top_class_index": class_idx,
            "confidence": top3[0]["confidence"],
            "top3": top3,
            "model_used": model,
            "boxes": [b.get("bbox") for b in top3] if model == "S1" else [],
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# ---------- GRAD-CAM ----------
@app.post("/ml/gradcam")
async def gradcam(
    file: UploadFile = File(...),
    class_index: int = 0,
    model: str = Query("R")
):
    try:
        if model.upper() != "R":
            return JSONResponse(status_code=400,
                                content={"error": "Grad-CAM is only supported in R mode."})
        image_bytes = await file.read()
        b64_heatmap = generate_gradcam(model_R, image_bytes, class_index)
        return {"heatmap_base64": b64_heatmap, "model_used": "R"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ---------- AUDIO ----------
@app.post("/ml/audio")
async def generate_audio(request: AudioRequest):
    try:
        lang_map = {"en": "en", "bn": "bn", "hi": "hi"}
        lang = lang_map.get(request.language, "en")
        tts = gTTS(text=request.text, lang=lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return Response(content=buf.read(), media_type="audio/mpeg")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Audio generation failed: {str(e)}"})