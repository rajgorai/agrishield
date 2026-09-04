import json
import os

# Load the class names
with open('class_names.json', 'r') as f:
    class_names_dict = json.load(f)

# Treatment dictionary (English, Bengali, Hindi)
# Key: disease name (to match against class label)
# Value: tuple (treatment_en, treatment_bn, treatment_hi)
treatments = {
    "Healthy": (
        "The plant appears healthy. No treatment needed. Maintain good agricultural practices.",
        "গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।",
        "पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।"
    ),
    "Late_blight": (
        "Apply Mancozeb 75% WP at 2g/litre every 7 days. Remove infected leaves. Use Metalaxyl if severe.",
        "ম্যাঙ্কোজেব ৭৫% ডব্লিউপি ২ গ্রাম/লিটার হারে প্রতি ৭ দিনে প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন। মারাত্মক হলে মেটালাক্সিল ব্যবহার করুন।",
        "मैंकोजेब 75% WP 2 ग्राम/लीटर की दर से हर 7 दिन में लगाएं। संक्रमित पत्तियों को हटा दें। गंभीर होने पर मेटालैक्सिल का उपयोग करें।"
    ),
    "Early_blight": (
        "Apply Chlorothalonil 75% WP at 2g/litre. Rotate crops. Remove infected debris.",
        "ক্লোরোথালোনিল ৭৫% ডব্লিউপি ২ গ্রাম/লিটার হারে প্রয়োগ করুন। ফসলের আবর্তন করুন। সংক্রমিত ধ্বংসাবশেষ অপসারণ করুন।",
        "क्लोरोथालोनिल 75% WP 2 ग्राम/लीटर की दर से लगाएं। फसल चक्र अपनाएं। संक्रमित मलबे को हटा दें।"
    ),
    "Bacterial_spot": (
        "Apply copper-based bactericides. Avoid overhead watering. Remove infected leaves.",
        "তামা-ভিত্তিক ব্যাকটেরিয়ানাশক প্রয়োগ করুন। উপর থেকে জল দেওয়া এড়িয়ে চলুন। সংক্রমিত পাতা অপসারণ করুন।",
        "तांबा-आधारित जीवाणुनाशक लगाएं। ऊपर से पानी देने से बचें। संक्रमित पत्तियों को हटा दें।"
    ),
    "Powdery_mildew": (
        "Apply Sulfur or Potassium bicarbonate. Improve air circulation. Remove infected leaves.",
        "সালফার বা পটাসিয়াম বাইকার্বোনেট প্রয়োগ করুন। বায়ু চলাচল উন্নত করুন। সংক্রমিত পাতা অপসারণ করুন।",
        "सल्फर या पोटेशियम बाइकार्बोनेट लगाएं। हवा की आवाजाही में सुधार करें। संक्रमित पत्तियों को हटा दें।"
    ),
    "Rust": (
        "Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.",
        "প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।",
        "प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।"
    ),
    "Anthracnose": (
        "Apply copper-based fungicides or carbendazim. Prune affected branches. Remove fallen leaves.",
        "তামা-ভিত্তিক ছত্রাকনাশক বা কার্বেন্ডাজিম প্রয়োগ করুন। আক্রান্ত শাখা ছাঁটাই করুন। পড়ে যাওয়া পাতা অপসারণ করুন।",
        "तांबा-आधारित कवकनाशी या कार्बेन्डाजिम लगाएं। प्रभावित शाखाओं को काट दें। गिरी हुई पत्तियों को हटा दें।"
    ),
    "Bacterial_Blight": (
        "Apply copper-based bactericides. Avoid overhead irrigation. Remove infected plants.",
        "তামা-ভিত্তিক ব্যাকটেরিয়ানাশক প্রয়োগ করুন। উপর থেকে সেচ এড়িয়ে চলুন। সংক্রমিত গাছ অপসারণ করুন।",
        "तांबा-आधारित जीवाणुनाशक लगाएं। ऊपर से सिंचाई से बचें। संक्रमित पौधों को हटा दें।"
    ),
    "Leaf_Blast": (
        "Apply Tricyclazole or Isoprothiolane. Use resistant varieties. Avoid excess nitrogen.",
        "ট্রাইসাইক্লাজল বা আইসোপ্রোথিওলেন প্রয়োগ করুন। প্রতিরোধী জাত ব্যবহার করুন। অতিরিক্ত নাইট্রোজেন এড়িয়ে চলুন।",
        "ट्राइसाइक्लाजोल या आइसोप्रोथियोलेन लगाएं। प्रतिरोधी किस्मों का उपयोग करें। अतिरिक्त नाइट्रोजन से बचें।"
    ),
    "Sheath_Blight": (
        "Apply Validamycin or Carbendazim. Maintain proper spacing. Avoid water logging.",
        "ভ্যালিডামাইসিন বা কার্বেন্ডাজিম প্রয়োগ করুন। সঠিক ব্যবধান বজায় রাখুন। জলাবদ্ধতা এড়িয়ে চলুন।",
        "वैलिडामाइसिन या कार्बेन्डाजिम लगाएं। उचित दूरी बनाए रखें। जलभराव से बचें।"
    ),
    "Brown_Spot": (
        "Apply Mancozeb or Carbendazim. Use balanced fertilization.",
        "ম্যাঙ্কোজেব বা কার্বেন্ডাজিম প্রয়োগ করুন। সুষম সার প্রয়োগ করুন।",
        "मैंकोजेब या कार्बेन्डाजिम लगाएं। संतुलित उर्वरक का उपयोग करें।"
    ),
    "Mosaic": (
        "Control aphids (vectors). Remove infected plants. Use virus-free seeds.",
        "এফিড (বাহক) নিয়ন্ত্রণ করুন। সংক্রমিত গাছ অপসারণ করুন। ভাইরাসমুক্ত বীজ ব্যবহার করুন।",
        "एफिड्स (वाहक) को नियंत्रित करें। संक्रमित पौधों को हटा दें। वायरस-मुक्त बीजों का उपयोग करें।"
    ),
    "Curl": (
        "Control whiteflies. Remove infected leaves. Apply appropriate pesticides for vector control.",
        "সাদা মাছি নিয়ন্ত্রণ করুন। সংক্রমিত পাতা অপসারণ করুন। ভেক্টর নিয়ন্ত্রণের জন্য উপযুক্ত কীটনাশক প্রয়োগ করুন।",
        "सफेद मक्खियों को नियंत्रित करें। संक्रमित पत्तियों को हटा दें। वेक्टर नियंत्रण के लिए उपयुक्त कीटनाशक लगाएं।"
    ),
    "Red_Rot": (
        "Remove infected canes. Apply Trichoderma or Carbendazim. Use disease-free setts.",
        "সংক্রমিত কান্ড অপসারণ করুন। ট্রাইকোডার্মা বা কার্বেন্ডাজিম প্রয়োগ করুন। রোগমুক্ত সেট ব্যবহার করুন।",
        "संक्रमित डंठल हटा दें। ट्राइकोडर्मा या कार्बेन्डाजिम लगाएं। रोग-मुक्त सेट्स का उपयोग करें।"
    ),
    "Smut": (
        "Use disease-free seeds. Apply seed treatment with fungicide. Remove infected plants.",
        "রোগমুক্ত বীজ ব্যবহার করুন। ছত্রাকনাশক দিয়ে বীজ শোধন করুন। সংক্রমিত গাছ অপসারণ করুন।",
        "रोग-मुक्त बीजों का उपयोग करें। कवकनाशी से बीज उपचार करें। संक्रमित पौधों को हटा दें।"
    ),
    "Fusarium_Wilt": (
        "Apply Trichoderma or Carbendazim. Improve soil drainage. Use resistant varieties.",
        "ট্রাইকোডার্মা বা কার্বেন্ডাজিম প্রয়োগ করুন। মাটির নিষ্কাশন উন্নত করুন। প্রতিরোধী জাত ব্যবহার করুন।",
        "ट्राइकोडर्मा या कार्बेन्डाजिम लगाएं। मिट्टी की जल निकासी में सुधार करें। प्रतिरोधी किस्मों का उपयोग करें।"
    ),
    "Cutting_Weevil": (
        "Apply appropriate insecticides. Remove and destroy infected parts.",
        "উপযুক্ত কীটনাশক প্রয়োগ করুন। সংক্রমিত অংশ অপসারণ করুন এবং ধ্বংস করুন।",
        "उपयुक्त कीटनाशक लगाएं। संक्रमित भागों को हटा दें और नष्ट कर दें।"
    ),
    "Die_Back": (
        "Prune infected branches. Apply copper fungicide. Avoid water stress.",
        "সংক্রমিত শাখা ছাঁটাই করুন। তামা ছত্রাকনাশক প্রয়োগ করুন। পানি চাপ এড়িয়ে চলুন।",
        "संक्रमित शाखाओं को काट दें। कॉपर कवकनाशी लगाएं। पानी के तनाव से बचें।"
    ),
    "Gall_Midge": (
        "Apply systemic insecticides. Remove infected twigs. Use pheromone traps.",
        "সিস্টেমিক কীটনাশক প্রয়োগ করুন। সংক্রমিত ডাল অপসারণ করুন। ফেরোমন ফাঁদ ব্যবহার করুন।",
        "प्रणालीगत कीटनाशक लगाएं। संक्रमित टहनियों को हटा दें। फेरोमोन जाल का उपयोग करें।"
    ),
    "Sooty_Mould": (
        "Control insect pests (scale, aphids) that secrete honeydew. Apply insecticides.",
        "মধু নিঃসরণকারী পোকামাকড় (স্কেল, এফিড) নিয়ন্ত্রণ করুন। কীটনাশক প্রয়োগ করুন।",
        "हनीड्यू स्रावित करने वाले कीटों (स्केल, एफिड्स) को नियंत्रित करें। कीटनाशक लगाएं।"
    ),
    "Banded_Chlorosis": (
        "Apply balanced nutrition (micronutrients). Improve soil health.",
        "সুষম পুষ্টি (মাইক্রোনিউট্রিয়েন্ট) প্রয়োগ করুন। মাটির স্বাস্থ্যের উন্নতি করুন।",
        "संतुलित पोषण (सूक्ष्म पोषक तत्व) लगाएं। मिट्टी के स्वास्थ्य में सुधार करें।"
    ),
    "Pokkah_Boeng": (
        "Apply Carbendazim or Mancozeb. Remove infected leaves. Improve ventilation.",
        "কার্বেন্ডাজিম বা ম্যাঙ্কোজেব প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন। বায়ুচলাচল উন্নত করুন।",
        "कार्बेन्डाजिम या मैंकोजेब लगाएं। संक्रमित पत्तियों को हटा दें। वेंटिलेशन में सुधार करें।"
    ),
    "Grassy_Shoot": (
        "Remove infected plants. Control leafhoppers. Use healthy setts.",
        "সংক্রমিত গাছ অপসারণ করুন। লিফহপার নিয়ন্ত্রণ করুন। সুস্থ সেট ব্যবহার করুন।",
        "संक्रमित पौधों को हटा दें। लीफहॉपर्स को नियंत्रित करें। स्वस्थ सेट्स का उपयोग करें।"
    ),
    "Sett_Rot": (
        "Use disease-free setts. Apply Trichoderma. Avoid over-irrigation.",
        "রোগমুক্ত সেট ব্যবহার করুন। ট্রাইকোডার্মা প্রয়োগ করুন। অতিরিক্ত সেচ এড়িয়ে চলুন।",
        "रोग-मुक्त सेट्स का उपयोग करें। ट्राइकोडर्मा लगाएं। अत्यधिक सिंचाई से बचें।"
    ),
    "Viral_Disease": (
        "Control vector insects (aphids, whiteflies). Remove infected plants. Use resistant varieties.",
        "ভেক্টর পোকামাকড় (এফিড, সাদা মাছি) নিয়ন্ত্রণ করুন। সংক্রমিত গাছ অপসারণ করুন। প্রতিরোধী জাত ব্যবহার করুন।",
        "वेक्टर कीड़े (एफिड्स, सफेद मक्खियाँ) को नियंत्रित करें। संक्रमित पौधों को हटा दें। प्रतिरोधी किस्मों का उपयोग करें।"
    ),
    "Loose_Smut": (
        "Use certified disease-free seeds. Apply seed treatment with fungicide.",
        "প্রত্যয়িত রোগমুক্ত বীজ ব্যবহার করুন। ছত্রাকনাশক দিয়ে বীজ শোধন করুন।",
        "प्रमाणित रोग-मुक्त बीजों का उपयोग करें। कवकनाशी से बीज उपचार करें।"
    ),
    "Septoria": (
        "Apply Chlorothalonil or Copper-based fungicides. Remove infected leaves. Avoid overhead watering.",
        "ক্লোরোথালোনিল বা তামা-ভিত্তিক ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন। উপর থেকে জল দেওয়া এড়িয়ে চলুন।",
        "क्लोरोथालोनिल या तांबा-आधारित कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें। ऊपर से पानी देने से बचें।"
    ),
    "Yellow_Rust": (
        "Apply fungicides containing propiconazole or tebuconazole. Use resistant varieties.",
        "প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। প্রতিরোধী জাত ব্যবহার করুন।",
        "प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। प्रतिरोधी किस्मों का उपयोग करें।"
    ),
    "Brown_Rust": (
        "Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.",
        "প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।",
        "प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।"
    ),
}

def get_treatment(class_name):
    # Extract disease name (remove crop prefix and underscores)
    parts = class_name.split("___")
    if len(parts) == 2:
        crop = parts[0]
        disease = parts[1].replace("_", " ")
    else:
        crop = "Unknown"
        disease = class_name

    # Check if disease matches any key (case-insensitive)
    for key, value in treatments.items():
        if key.lower() in disease.lower():
            return value

    # Fallback generic treatment
    return (
        f"Consult local agricultural officer for treatment of {disease} on {crop}. Practice crop rotation and good field hygiene.",
        f"{disease} এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।",
        f"{disease} के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।"
    )

# Generate SQL
sql_statements = []
for idx, class_name in class_names_dict.items():
    en, bn, hi = get_treatment(class_name)
    sql = f"""
UPDATE diseases 
SET treatment_en = '{en}', 
    treatment_bn = '{bn}', 
    treatment_hi = '{hi}'
WHERE model_class_label = '{class_name}';
"""
    sql_statements.append(sql)

# Write to file
with open('update_treatments.sql', 'w', encoding='utf-8') as f:
    f.write("-- ========================================\n")
    f.write("-- UPDATE TREATMENT TEXTS FOR ALL 88 DISEASES\n")
    f.write("-- ========================================\n\n")
    f.write("BEGIN;\n\n")
    for sql in sql_statements:
        f.write(sql)
        f.write("\n")
    f.write("\nCOMMIT;\n")

print(f"✅ SQL file generated successfully: update_treatments.sql")
print(f"Total classes processed: {len(class_names_dict)}")