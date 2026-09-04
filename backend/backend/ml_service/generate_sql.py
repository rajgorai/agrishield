import json

# Load the 88-class names
with open('models/class_names.json', 'r') as f:
    class_names_dict = json.load(f)

# The original 38 PlantVillage classes we want to skip
plantvillage = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___healthy", "Strawberry___Leaf_scorch",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___healthy", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus"
]

print("-- ========================================")
print("-- INSERT 50 NEW DISEASES (Rice, Wheat, Cotton, Mango, Sugarcane, Papaya)")
print("-- ========================================")

for idx, class_name in class_names_dict.items():
    # Skip if it's one of the old PlantVillage classes
    if class_name in plantvillage:
        continue
    
    parts = class_name.split("___")
    if len(parts) == 2:
        crop = parts[0]
        disease_label = parts[1].replace("_", " ")
    else:
        crop = "Unknown"
        disease_label = class_name

    print(f"""
INSERT INTO diseases (id, model_class_label, crop_name, disease_name_en, disease_name_bn, disease_name_hi, severity, treatment_en, treatment_bn, treatment_hi)
VALUES (
    gen_random_uuid(),
    '{class_name}',
    '{crop}',
    '{disease_label}',
    'TODO: Bengali translation for {disease_label}',
    'TODO: Hindi translation for {disease_label}',
    'MEDIUM',
    'TODO: Treatment for {disease_label} on {crop}.',
    'TODO: Bengali treatment for {disease_label} on {crop}.',
    'TODO: Hindi treatment for {disease_label} on {crop}.'
) ON CONFLICT (model_class_label) DO NOTHING;
""")