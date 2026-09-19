from huggingface_hub import hf_hub_download
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

print("⏳ Downloading S1 (KrishiBondhu YOLO)...")
s1_path = hf_hub_download(
    repo_id="hodoly163/krishibondhu-jktk",
    filename="jktk_x.pt",
    local_dir=MODELS_DIR,
    local_dir_use_symlinks=False
)
print(f"✅ S1 saved to: {s1_path}")

print("⏳ Downloading S2 (AgroMind NFNet-F1)...")
s2_model = hf_hub_download(
    repo_id="Arko007/agromind-plant-disease-nfnet",
    filename="model.safetensors",
    local_dir=MODELS_DIR,
    local_dir_use_symlinks=False
)
s2_config = hf_hub_download(
    repo_id="Arko007/agromind-plant-disease-nfnet",
    filename="config.json",
    local_dir=MODELS_DIR,
    local_dir_use_symlinks=False
)
print(f"✅ S2 model saved to: {s2_model}")
print(f"✅ S2 config saved to: {s2_config}")

print("\n📋 Files now in models/:")
for f in os.listdir(MODELS_DIR):
    size = os.path.getsize(os.path.join(MODELS_DIR, f)) / (1024 * 1024)
    print(f"   {f} — {size:.1f} MB")