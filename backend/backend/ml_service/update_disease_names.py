import json

# Proper disease names in Bengali and Hindi
# Format: "class_label": (disease_name_bn, disease_name_hi)
NAMES = {
    "Potato___Late_blight": ("নাবি ধ্বসা রোগ", "पछेती झुलसा"),
    "Potato___Early_blight": ("আগাম ধ্বসা রোগ", "अगेती झुलसा"),
    "Potato___healthy": ("সুস্থ", "स्वस्थ"),
    "Tomato___Late_blight": ("নাবি ধ্বসা রোগ", "पछेती झुलसा"),
    "Tomato___Early_blight": ("আগাম ধ্বসা রোগ", "अगेती झुलसा"),
    "Tomato___Bacterial_spot": ("ব্যাকটেরিয়াল দাগ", "जीवाणु धब्बा"),
    "Tomato___Septoria_leaf_spot": ("সেপ্টোরিয়া পাতার দাগ", "सेप्टोरिया पत्ती धब्बा"),
    "Tomato___Leaf_Mold": ("পাতার ছত্রাক", "पत्ती फफूंद"),
    "Tomato___Target_Spot": ("টার্গেট স্পট", "टारगेट स्पॉट"),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("হলুদ পাতা কোঁকড়ানো ভাইরাস", "पीला पत्ती मरोड़ वायरस"),
    "Tomato___Tomato_mosaic_virus": ("মোজাইক ভাইরাস", "मोज़ेक वायरस"),
    "Tomato___Spider_mites Two-spotted_spider_mite": ("মাকড়সা মাইট", "मकड़ी माइट"),
    "Tomato___healthy": ("সুস্থ", "स्वस्थ"),
    "Rice___Brown_Spot": ("বাদামী দাগ রোগ", "भूरा धब्बा रोग"),
    "Rice___Leaf_Blast": ("পাতার ব্লাস্ট রোগ", "पत्ती ब्लास्ट रोग"),
    "Rice___Bacterial_Leaf_Blight": ("ব্যাকটেরিয়াল পাতা ঝলসানো", "जीवाणु पत्ती झुलसा"),
    "Rice___Leaf_Scald": ("পাতার স্ক্যাল্ড", "पत्ती स्कैल्ड"),
    "Rice___Sheath_Blight": ("খোলস ঝলসানো রোগ", "म्यान झुलसा रोग"),
    "Rice___Healthy": ("সুস্থ", "स्वस्थ"),
    "Wheat___Brown_Rust": ("বাদামী মরিচা রোগ", "भूरा रतुआ"),
    "Wheat___Yellow_Rust": ("হলুদ মরিচা রোগ", "पीला रतुआ"),
    "Wheat___Loose_Smut": ("লুজ স্মাট", "लूज़ स्मट"),
    "Wheat___Healthy": ("সুস্থ", "स्वस्थ"),
    "Cotton___Bacterial_Blight": ("ব্যাকটেরিয়াল ঝলসানো", "जीवाणु झुलसा"),
    "Cotton___Curl_Virus": ("কার্ল ভাইরাস", "कर्ल वायरस"),
    "Cotton___Fusarium_Wilt": ("ফুসারিয়াম উইল্ট", "फ्यूजेरियम विल्ट"),
    "Cotton___Healthy": ("সুস্থ", "स्वस्थ"),
    "Mango___Anthracnose": ("অ্যানথ্রাকনোজ", "एंथ्रेक्नोज"),
    "Mango___Powdery_Mildew": ("পাউডারি মিলডিউ", "चूर्णिल आसिता"),
    "Mango___Bacterial_Canker": ("ব্যাকটেরিয়াল ক্যানকার", "जीवाणु कैंकर"),
    "Mango___Gall_Midge": ("গল মিজ", "गॉल मिज"),
    "Mango___Cutting_Weevil": ("কাটিং উইভিল", "कटिंग वीविल"),
    "Mango___Die_Back": ("ডাই ব্যাক", "डाई बैक"),
    "Mango___Sooty_Mould": ("সুটি মোল্ড", "काली फफूंद"),
    "Mango___Healthy": ("সুস্থ", "स्वस्थ"),
    "Sugarcane___Red_Rot": ("লাল পচা রোগ", "लाल सड़न"),
    "Sugarcane___Smut": ("স্মাট রোগ", "स्मट रोग"),
    "Sugarcane___Mosaic": ("মোজাইক রোগ", "मोज़ेक रोग"),
    "Sugarcane___Rust": ("মরিচা রোগ", "रतुआ रोग"),
    "Sugarcane___Brown_Rust": ("বাদামী মরিচা", "भूरा रतुआ"),
    "Sugarcane___Brown_Spot": ("বাদামী দাগ", "भूरा धब्बा"),
    "Sugarcane___Yellow_Leaf": ("হলুদ পাতা রোগ", "पीला पत्ती रोग"),
    "Sugarcane___Yellow": ("হলুদ রোগ", "पीला रोग"),
    "Sugarcane___Banded_Chlorosis": ("ব্যান্ডেড ক্লোরোসিস", "बैंडेड क्लोरोसिस"),
    "Sugarcane___Pokkah_Boeng": ("পোক্কাহ বোয়েং", "पोक्का बोएंग"),
    "Sugarcane___Grassy_Shoot": ("ঘাসের মতো অঙ্কুর", "घास जैसा अंकुर"),
    "Sugarcane___Sett_Rot": ("সেট পচা রোগ", "सेट सड़न"),
    "Sugarcane___Viral_Disease": ("ভাইরাল রোগ", "वायरल रोग"),
    "Sugarcane___SCMV": ("আখ মোজাইক ভাইরাস", "गन्ना मोज़ेक वायरस"),
    "Sugarcane___SCYLV": ("আখ হলুদ পাতা ভাইরাস", "गन्ना पीला पत्ती वायरस"),
    "Sugarcane___Colletotrichosis": ("কোলেটোট্রিকোসিস", "कोलेटोट्रिकोसिस"),
    "Sugarcane___Dried_Leaves": ("শুকনো পাতা", "सूखी पत्तियां"),
    "Sugarcane___Healthy": ("সুস্থ", "स्वस्थ"),
    "Papaya___Anthracnose": ("অ্যানথ্রাকনোজ", "एंथ्रेक्नोज"),
    "Papaya___Bacterial_Spot": ("ব্যাকটেরিয়াল দাগ", "जीवाणु धब्बा"),
    "Papaya___Curl": ("কার্ল রোগ", "कर्ल रोग"),
    "Papaya___Mealybug": ("মিলিবাগ", "मिलीबग"),
    "Papaya___Mite_Disease": ("মাইট রোগ", "माइट रोग"),
    "Papaya___Mosaic": ("মোজাইক রোগ", "मोज़ेक रोग"),
    "Papaya___Ringspot": ("রিংস্পট রোগ", "रिंगस्पॉट रोग"),
    "Papaya___Healthy": ("সুস্থ", "स्वस्थ"),
    "Apple___Apple_scab": ("আপেল স্ক্যাব", "सेब का पपड़ी रोग"),
    "Apple___Black_rot": ("কালো পচা", "काला सड़न"),
    "Apple___Cedar_apple_rust": ("সিডার আপেল মরিচা", "सीडर एप्पल रतुआ"),
    "Apple___healthy": ("সুস্থ", "स्वस्थ"),
    "Blueberry___healthy": ("সুস্থ", "स्वस्थ"),
    "Cherry_(including_sour)___Powdery_mildew": ("পাউডারি মিলডিউ", "चूर्णिल आसिता"),
    "Cherry_(including_sour)___healthy": ("সুস্থ", "स्वस्थ"),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("গ্রে লিফ স্পট", "ग्रे लीफ स्पॉट"),
    "Corn_(maize)___Common_rust": ("সাধারণ মরিচা", "सामान्य रतुआ"),
    "Corn_(maize)___Northern_Leaf_Blight": ("উত্তরাঞ্চলীয় পাতা ঝলসানো", "उत्तरी पत्ती झुलसा"),
    "Corn_(maize)___healthy": ("সুস্থ", "स्वस्थ"),
    "Grape___Black_rot": ("কালো পচা", "काला सड़न"),
    "Grape___Esca_(Black_Measles)": ("এস্কা (কালো হাম)", "एस्का (काला खसरा)"),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("পাতার ঝলসানো", "पत्ती झुलसा"),
    "Grape___healthy": ("সুস্থ", "स्वस्थ"),
    "Orange___Haunglongbing_(Citrus_greening)": ("সাইট্রাস গ্রিনিং", "साइट्रस ग्रीनिंग"),
    "Peach___Bacterial_spot": ("ব্যাকটেরিয়াল দাগ", "जीवाणु धब्बा"),
    "Peach___healthy": ("সুস্থ", "स्वस्थ"),
    "Pepper,_bell___Bacterial_spot": ("ব্যাকটেরিয়াল দাগ", "जीवाणु धब्बा"),
    "Pepper,_bell___healthy": ("সুস্থ", "स्वस्थ"),
    "Raspberry___healthy": ("সুস্থ", "स्वस्थ"),
    "Soybean___healthy": ("সুস্থ", "स्वस्थ"),
    "Squash___Powdery_mildew": ("পাউডারি মিলডিউ", "चूर्णिल आसिता"),
    "Strawberry___Leaf_scorch": ("পাতা পোড়া রোগ", "पत्ती झुलसा"),
    "Strawberry___healthy": ("সুস্থ", "स्वस्थ"),
}

with open('models/class_names.json', 'r', encoding='utf-8') as f:
    class_names_dict = json.load(f)

sql_lines = ["BEGIN;", ""]
missing = []

for idx, class_name in class_names_dict.items():
    if class_name in NAMES:
        bn, hi = NAMES[class_name]
        bn_escaped = bn.replace("'", "''")
        hi_escaped = hi.replace("'", "''")
        sql_lines.append(
            f"UPDATE diseases SET disease_name_bn = '{bn_escaped}', "
            f"disease_name_hi = '{hi_escaped}' "
            f"WHERE model_class_label = '{class_name}';"
        )
    else:
        missing.append(class_name)

sql_lines.append("")
sql_lines.append("COMMIT;")

with open('update_disease_names.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"✅ SQL generated: update_disease_names.sql")
print(f"   Total class names: {len(class_names_dict)}")
print(f"   Diseases updated: {len(NAMES)}")
if missing:
    print(f"   Missing translations: {len(missing)}")