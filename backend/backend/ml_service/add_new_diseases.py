"""
Generates SQL to add all missing S1 + S2 disease labels to the diseases table.
Run: python add_new_diseases.py
Output: add_new_diseases.sql
"""
import json
import os

# ==========================================================
# TREATMENT TEMPLATES  (EN, BN, HI)
# ==========================================================
T = {
    "fungal_spot": (
        "Spray Mancozeb 75% WP @ 2.5g/L or Chlorothalonil 75% WP @ 2g/L every 10-14 days. Remove and destroy infected leaves.",
        "প্রতি ১০-১৪ দিনে ম্যাঙ্কোজেব ৭৫% ডব্লিউপি ২.৫ গ্রাম/লিটার বা ক্লোরোথালোনিল ৭৫% ডব্লিউপি ২ গ্রাম/লিটার স্প্রে করুন। আক্রান্ত পাতা সরিয়ে ধ্বংস করুন।",
        "हर 10-14 दिन में मैंकोजेब 75% WP 2.5 ग्राम/लीटर या क्लोरोथालोनिल 75% WP 2 ग्राम/लीटर स्प्रे करें। संक्रमित पत्तियों को हटाकर नष्ट करें।"
    ),
    "rust": (
        "Spray Propiconazole 25% EC @ 1ml/L or Mancozeb @ 2.5g/L every 15 days. Remove infected leaves.",
        "প্রতি ১৫ দিনে প্রোপিকোনাজল ২৫% ইসি ১ মিলি/লিটার বা ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে করুন। আক্রান্ত পাতা সরান।",
        "हर 15 दिन में प्रोपिकोनाजोल 25% EC 1 मिली/लीटर या मैंकोजेब 2.5 ग्राम/लीटर स्प्रे करें। संक्रमित पत्तियां हटाएं।"
    ),
    "downy_mildew": (
        "Spray Metalaxyl+Mancozeb @ 2.5g/L or Cymoxanil+Mancozeb @ 3g/L every 7-10 days. Improve air circulation.",
        "প্রতি ৭-১০ দিনে মেটালাক্সিল+ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার বা সাইমোক্সানিল+ম্যাঙ্কোজেব ৩ গ্রাম/লিটার স্প্রে করুন। বায়ু চলাচল উন্নত করুন।",
        "हर 7-10 दिन में मेटालैक्सिल+मैंकोजेब 2.5 ग्राम/लीटर या साइमोक्सानिल+मैंकोजेब 3 ग्राम/लीटर स्प्रे करें। हवा का संचार सुधारें।"
    ),
    "powdery_mildew": (
        "Spray Wettable Sulphur @ 2g/L or Dinocap @ 1ml/L every 10-14 days. Prune for air flow.",
        "প্রতি ১০-১৪ দিনে ভেজা সালফার ২ গ্রাম/লিটার বা ডাইনোক্যাপ ১ মিলি/লিটার স্প্রে করুন। বায়ু চলাচলের জন্য ছাঁটাই করুন।",
        "हर 10-14 दिन में गीला सल्फर 2 ग्राम/लीटर या डाइनोकैप 1 मिली/लीटर स्प्रे करें। हवा के लिए छंटाई करें।"
    ),
    "bacterial": (
        "Spray Copper oxychloride 50% WP @ 3g/L + Streptocycline @ 0.5g/L every 10 days. Avoid overhead watering.",
        "প্রতি ১০ দিনে কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি ৩ গ্রাম/লিটার + স্ট্রেপ্টোসাইক্লিন ০.৫ গ্রাম/লিটার স্প্রে করুন। উপর থেকে জল দেওয়া এড়িয়ে চলুন।",
        "हर 10 दिन में कॉपर ऑक्सीक्लोराइड 50% WP 3 ग्राम/लीटर + स्ट्रेप्टोसाइक्लिन 0.5 ग्राम/लीटर स्प्रे करें। ऊपर से पानी देने से बचें।"
    ),
    "virus": (
        "No cure. Uproot and destroy infected plants immediately. Control vectors (whitefly/aphids) with Imidacloprid @ 0.3ml/L.",
        "কোন প্রতিকার নেই। আক্রান্ত গাছ অবিলম্বে উপড়ে ফেলে ধ্বংস করুন। ইমিডাক্লোপ্রিড ০.৩ মিলি/লিটার দিয়ে বাহক নিয়ন্ত্রণ করুন।",
        "कोई इलाज नहीं। संक्रमित पौधों को तुरंत उखाड़कर नष्ट करें। इमिडाक्लोप्रिड 0.3 मिली/लीटर से वाहक नियंत्रित करें।"
    ),
    "pest": (
        "Spray Imidacloprid 17.8% SL @ 0.3ml/L or Quinalphos 25% EC @ 2ml/L. Use sticky traps.",
        "ইমিডাক্লোপ্রিড ১৭.৮% এসএল ০.৩ মিলি/লিটার বা কুইনালফস ২৫% ইসি ২ মিলি/লিটার স্প্রে করুন। আঠালো ফাঁদ ব্যবহার করুন।",
        "इमिडाक्लोप्रिड 17.8% SL 0.3 मिली/लीटर या क्विनालफॉस 25% EC 2 मिली/लीटर स्प्रे करें। चिपचिपे जाल का प्रयोग करें।"
    ),
    "blight": (
        "Spray Mancozeb 75% WP @ 2.5g/L or Metalaxyl+Mancozeb @ 2.5g/L every 7-10 days. Remove infected leaves.",
        "প্রতি ৭-১০ দিনে ম্যাঙ্কোজেব ৭৫% ডব্লিউপি ২.৫ গ্রাম/লিটার বা মেটালাক্সিল+ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে করুন। আক্রান্ত পাতা সরান।",
        "हर 7-10 दिन में मैंकोजेब 75% WP 2.5 ग्राम/लीटर या मेटालैक्सिल+मैंकोजेब 2.5 ग्राम/लीटर स्प्रे करें। संक्रमित पत्तियां हटाएं।"
    ),
    "anthracnose": (
        "Spray Carbendazim 50% WP @ 1g/L or Mancozeb @ 2g/L every 10-14 days. Prune affected parts.",
        "প্রতি ১০-১৪ দিনে কার্বেন্ডাজিম ৫০% ডব্লিউপি ১ গ্রাম/লিটার বা ম্যাঙ্কোজেব ২ গ্রাম/লিটার স্প্রে করুন। আক্রান্ত অংশ ছাঁটাই করুন।",
        "हर 10-14 दिन में कार्बेन्डाजिम 50% WP 1 ग्राम/लीटर या मैंकोजेब 2 ग्राम/लीटर स्प्रे करें। प्रभावित हिस्सों की छंटाई करें।"
    ),
    "healthy": (
        "The plant appears healthy. Continue good agricultural practices.",
        "গাছটি সুস্থ দেখাচ্ছে। ভালো কৃষি অনুশীলন চালিয়ে যান।",
        "पौधा स्वस्थ दिख रहा है। अच्छी कृषि पद्धतियां जारी रखें।"
    ),
    "unknown": (
        "Disease detected. Consult your local agricultural officer for specific treatment and apply a broad-spectrum fungicide.",
        "রোগ সনাক্ত হয়েছে। নির্দিষ্ট চিকিৎসার জন্য স্থানীয় কৃষি অফিসারের পরামর্শ নিন এবং ব্রড-স্পেকট্রাম ছত্রাকনাশক প্রয়োগ করুন।",
        "रोग का पता चला। विशिष्ट उपचार के लिए स्थानीय कृषि अधिकारी से परामर्श करें और ब्रॉड-स्पेक्ट्रम कवकनाशी लगाएं।"
    ),
}

# ==========================================================
# DISEASE LIST
# Format: (db_label, crop_en, name_en, name_bn, name_hi, severity, template_key)
# ==========================================================
D = [
    # ---------- TEA ----------
    ("Tea___Algal_Leaf",        "Tea", "Algal Leaf Spot",  "শৈবাল পাতার দাগ",     "शैवाल पत्ती धब्बा",       "MEDIUM", "fungal_spot"),
    ("Tea___Anthracnose",       "Tea", "Anthracnose",      "অ্যানথ্রাকনোজ",        "एंथ्रेक्नोज",              "HIGH",   "anthracnose"),
    ("Tea___Bird_Eye_Spot",     "Tea", "Bird Eye Spot",    "বার্ড আই স্পট",         "बर्ड आई स्पॉट",           "MEDIUM", "fungal_spot"),
    ("Tea___Brown_Blight",      "Tea", "Brown Blight",     "বাদামী ঝলসানো",        "भूरा झुलसा",              "HIGH",   "blight"),
    ("Tea___Red_Leaf_Spot",     "Tea", "Red Leaf Spot",    "লাল পাতার দাগ",        "लाल पत्ती धब्बा",         "MEDIUM", "fungal_spot"),
    ("Tea___Healthy",           "Tea", "Healthy",          "সুস্থ",                  "स्वस्थ",                  "LOW",    "healthy"),

    # ---------- COFFEE ----------
    ("Coffee___Cercospora_Leaf_Spot", "Coffee", "Cercospora Leaf Spot", "সারকোস্পোরা পাতার দাগ", "सर्कोस्पोरा पत्ती धब्बा", "MEDIUM", "fungal_spot"),
    ("Coffee___Red_Spider_Mite",      "Coffee", "Red Spider Mite",      "লাল মাকড়সা মাইট",       "लाल मकड़ी माइट",           "MEDIUM", "pest"),
    ("Coffee___Rust",                 "Coffee", "Rust",                 "মরিচা রোগ",             "रतुआ रोग",                "HIGH",   "rust"),
    ("Coffee___Leaf_Rust",            "Coffee", "Leaf Rust",            "পাতার মরিচা",           "पत्ती रतुआ",              "HIGH",   "rust"),
    ("Coffee___Healthy",              "Coffee", "Healthy",              "সুস্থ",                  "स्वस्थ",                  "LOW",    "healthy"),

    # ---------- CASSAVA ----------
    ("Cassava___Bacterial_Blight",     "Cassava", "Bacterial Blight",      "ব্যাকটেরিয়াল ঝলসানো", "जीवाणु झुलसा",           "HIGH",   "bacterial"),
    ("Cassava___Brown_Streak_Disease", "Cassava", "Brown Streak Disease",  "বাদামী স্ট্রিক রোগ",  "भूरा स्ट्रीक रोग",       "HIGH",   "virus"),
    ("Cassava___Green_Mottle",         "Cassava", "Green Mottle",          "সবুজ মটল",             "हरा मॉटल",                "MEDIUM", "virus"),
    ("Cassava___Mosaic_Disease",       "Cassava", "Mosaic Disease",        "মোজাইক রোগ",          "मोज़ेक रोग",              "HIGH",   "virus"),
    ("Cassava___Healthy",              "Cassava", "Healthy",               "সুস্থ",                  "स्वस्थ",                  "LOW",    "healthy"),

    # ---------- SOYBEAN ----------
    ("Soybean___Bacterial_Blight",    "Soybean", "Bacterial Blight",     "ব্যাকটেরিয়াল ঝলসানো", "जीवाणु झुलसा",           "HIGH",   "bacterial"),
    ("Soybean___Caterpillar",         "Soybean", "Caterpillar",          "ক্যাটারপিলার",          "इल्ली",                   "MEDIUM", "pest"),
    ("Soybean___Diabrotica_Speciosa", "Soybean", "Diabrotica Speciosa",  "ডায়াব্রোটিকা",         "डायब्रोटिका",            "MEDIUM", "pest"),
    ("Soybean___Downy_Mildew",        "Soybean", "Downy Mildew",         "ডাউনি মিলডিউ",         "डाउनी मिल्ड्यू",          "MEDIUM", "downy_mildew"),
    ("Soybean___Mosaic_Virus",        "Soybean", "Mosaic Virus",         "মোজাইক ভাইরাস",        "मोज़ेक वायरस",            "HIGH",   "virus"),
    ("Soybean___Powdery_Mildew",      "Soybean", "Powdery Mildew",       "পাউডারি মিলডিউ",      "चूर्णिल आसिता",          "MEDIUM", "powdery_mildew"),
    ("Soybean___Rust",                "Soybean", "Rust",                 "মরিচা রোগ",            "रतुआ रोग",                "HIGH",   "rust"),
    ("Soybean___Southern_Blight",     "Soybean", "Southern Blight",      "দক্ষিণী ঝলসানো",       "दक्षिणी झुलसा",           "HIGH",   "blight"),

    # ---------- CUCUMBER ----------
    ("Cucumber___Angular_Leaf_Spot", "Cucumber", "Angular Leaf Spot", "কোণাকার পাতার দাগ", "कोणीय पत्ती धब्बा",  "MEDIUM", "bacterial"),
    ("Cucumber___Bacterial_Wilt",    "Cucumber", "Bacterial Wilt",    "ব্যাকটেরিয়াল উইল্ট",  "जीवाणु विल्ट",        "HIGH",   "bacterial"),
    ("Cucumber___Powdery_Mildew",    "Cucumber", "Powdery Mildew",    "পাউডারি মিলডিউ",     "चूर्णिल आसिता",      "MEDIUM", "powdery_mildew"),
    ("Cucumber___Healthy",           "Cucumber", "Healthy",           "সুস্থ",              "स्वस्थ",              "LOW",    "healthy"),
    ("Cucumber___Diseased",          "Cucumber", "Diseased",          "রোগাক্রান্ত",          "रोगग्रस्त",           "MEDIUM", "unknown"),

    # ---------- CHILI ----------
    ("Chili___Leaf_Curl",   "Chili", "Leaf Curl",   "পাতা কোঁকড়ানো",  "पत्ती मरोड़",      "HIGH",   "virus"),
    ("Chili___Leaf_Spot",   "Chili", "Leaf Spot",   "পাতার দাগ",     "पत्ती धब्बा",     "MEDIUM", "fungal_spot"),
    ("Chili___Whitefly",    "Chili", "Whitefly",    "সাদা মাছি",      "सफेद मक्खी",       "MEDIUM", "pest"),
    ("Chili___Yellowish",   "Chili", "Yellowish",   "হলুদাভ",         "पीलापन",          "MEDIUM", "virus"),
    ("Chili___Healthy",     "Chili", "Healthy",     "সুস্থ",          "स्वस्थ",          "LOW",    "healthy"),

    # ---------- FRUIT TREES (S2) ----------
    ("Mango___Diseased",        "Mango",       "Diseased",       "রোগাক্রান্ত",  "रोगग्रस्त",  "MEDIUM", "unknown"),
    ("Mango___Healthy",         "Mango",       "Healthy",        "সুস্থ",        "स्वस्थ",      "LOW",    "healthy"),
    ("Guava___Diseased",        "Guava",       "Diseased",       "রোগাক্রান্ত",  "रोगग्रस्त",  "MEDIUM", "unknown"),
    ("Guava___Healthy",         "Guava",       "Healthy",        "সুস্থ",        "स्वस्थ",      "LOW",    "healthy"),
    ("Jamun___Diseased",        "Jamun",       "Diseased",       "রোগাক্রান্ত",  "रोगग्रस्त",  "MEDIUM", "unknown"),
    ("Jamun___Healthy",         "Jamun",       "Healthy",        "সুস্থ",        "स्वस्थ",      "LOW",    "healthy"),
    ("Lemon___Diseased",        "Lemon",       "Diseased",       "রোগাক্রান্ত",  "रोगग्रस्त",  "MEDIUM", "unknown"),
    ("Lemon___Healthy",         "Lemon",       "Healthy",        "সুস্থ",        "स्वस्थ",      "LOW",    "healthy"),
    ("Pomegranate___Diseased",  "Pomegranate", "Diseased",       "রোগাক্রান্ত",  "रोगग्रस्त",  "MEDIUM", "unknown"),
    ("Pomegranate___Healthy",   "Pomegranate", "Healthy",        "সুস্থ",        "स्वस्थ",      "LOW",    "healthy"),

    # ---------- BANANA ----------
    ("Banana___Panama_Disease", "Banana", "Panama Disease", "পানামা রোগ", "पनामा रोग", "HIGH",   "unknown"),
    ("Banana___Healthy",        "Banana", "Healthy",        "সুস্থ",       "स्वस्थ",     "LOW",    "healthy"),

    # ---------- GARLIC ----------
    ("Garlic___Leaf_Blight", "Garlic", "Leaf Blight", "পাতার ঝলসানো", "पत्ती झुलसा",  "HIGH",   "blight"),
    ("Garlic___Rust",        "Garlic", "Rust",        "মরিচা রোগ",    "रतुआ रोग",     "HIGH",   "rust"),
    ("Garlic___Healthy",     "Garlic", "Healthy",     "সুস্থ",        "स्वस्थ",       "LOW",    "healthy"),

    # ---------- GINGER ----------
    ("Ginger___Sheath_Blight", "Ginger", "Sheath Blight", "খোলস ঝলসানো", "म्यान झुलसा", "HIGH",   "blight"),
    ("Ginger___Leaf_Spot",     "Ginger", "Leaf Spot",     "পাতার দাগ",   "पत्ती धब्बा",  "MEDIUM", "fungal_spot"),
    ("Ginger___Healthy",       "Ginger", "Healthy",       "সুস্থ",       "स्वस्थ",       "LOW",    "healthy"),

    # ---------- BEAN ----------
    ("Bean___Rust",         "Bean", "Rust",         "মরিচা রোগ",         "रतुआ रोग",           "HIGH",   "rust"),
    ("Bean___Halo_Blight",  "Bean", "Halo Blight",  "হ্যালো ঝলসানো",    "हेलो झुलसा",          "HIGH",   "bacterial"),
    ("Bean___Mosaic_Virus", "Bean", "Mosaic Virus", "মোজাইক ভাইরাস",    "मोज़ेक वायरस",        "HIGH",   "virus"),
    ("Bean___Healthy",      "Bean", "Healthy",      "সুস্থ",             "स्वस्थ",              "LOW",    "healthy"),

    # ---------- CORN (extras) ----------
    ("Corn_(maize)___Brown_Spots",           "Corn", "Brown Spots",           "বাদামী দাগ",         "भूरे धब्बे",           "MEDIUM", "fungal_spot"),
    ("Corn_(maize)___Charcoal",              "Corn", "Charcoal Rot",          "কাঠকয়লা পচা",       "चारकोल सड़न",          "HIGH",   "unknown"),
    ("Corn_(maize)___Chlorotic_Leaf_Spot",   "Corn", "Chlorotic Leaf Spot",   "ক্লোরোটিক দাগ",     "क्लोरोटिक धब्बा",      "MEDIUM", "fungal_spot"),
    ("Corn_(maize)___Insects_Damages",       "Corn", "Insect Damage",         "পোকার ক্ষতি",        "कीट क्षति",            "MEDIUM", "pest"),
    ("Corn_(maize)___Mildew",                "Corn", "Mildew",                "মিলডিউ",             "मिल्ड्यू",              "MEDIUM", "downy_mildew"),
    ("Corn_(maize)___Purple_Discoloration",  "Corn", "Purple Discoloration",  "বেগুনি বিবর্ণতা",     "बैंगनी विरंगता",       "LOW",    "unknown"),
    ("Corn_(maize)___Streak",                "Corn", "Streak",                "স্ট্রিক",             "स्ट्रीक",              "HIGH",   "virus"),
    ("Corn_(maize)___Stripe",                "Corn", "Stripe",                "স্ট্রাইপ",            "स्ट्राइप",             "MEDIUM", "virus"),
    ("Corn_(maize)___Violet_Decoloration",   "Corn", "Violet Decoloration",   "বেগুনি বিবর্ণ",       "बैंगनी विरंग",         "LOW",    "unknown"),
    ("Corn_(maize)___Yellow_Spots",          "Corn", "Yellow Spots",          "হলুদ দাগ",            "पीले धब्बे",           "MEDIUM", "fungal_spot"),
    ("Corn_(maize)___Yellowing",             "Corn", "Yellowing",             "হলুদ হয়ে যাওয়া",      "पीलापन",              "LOW",    "unknown"),
    ("Corn_(maize)___Leaf_Blight",           "Corn", "Leaf Blight",           "পাতার ঝলসানো",       "पत्ती झुलसा",          "HIGH",   "blight"),
    ("Corn_(maize)___Rust_Leaf",             "Corn", "Rust Leaf",             "পাতার মরিচা",         "पत्ती रतुआ",           "HIGH",   "rust"),

    # ---------- LETTUCE ----------
    ("Lettuce___Mosaic_Virus", "Lettuce", "Mosaic Virus", "মোজাইক ভাইরাস", "मोज़ेक वायरस",     "HIGH",   "virus"),
    ("Lettuce___Downy_Mildew", "Lettuce", "Downy Mildew", "ডাউনি মিলডিউ",  "डाउनी मिल्ड्यू",    "MEDIUM", "downy_mildew"),
    ("Lettuce___Healthy",      "Lettuce", "Healthy",      "সুস্থ",           "स्वस्थ",            "LOW",    "healthy"),

    # ---------- CELERY ----------
    ("Celery___Anthracnose",  "Celery", "Anthracnose",  "অ্যানথ্রাকনোজ", "एंथ्रेक्नोज",     "HIGH",   "anthracnose"),
    ("Celery___Early_Blight", "Celery", "Early Blight", "আগাম ঝলসানো",  "अगेती झुलसा",    "MEDIUM", "blight"),
    ("Celery___Healthy",      "Celery", "Healthy",      "সুস্থ",          "स्वस्थ",          "LOW",    "healthy"),

    # ---------- PLUM ----------
    ("Plum___Pocket_Disease", "Plum", "Pocket Disease", "পকেট রোগ",  "पॉकेट रोग",  "HIGH", "unknown"),
    ("Plum___Healthy",        "Plum", "Healthy",        "সুস্থ",      "स्वस्थ",      "LOW",  "healthy"),

    # ---------- MAPLE ----------
    ("Maple___Tar_Spot", "Maple", "Tar Spot", "টার স্পট", "टार स्पॉट", "MEDIUM", "fungal_spot"),
    ("Maple___Healthy",  "Maple", "Healthy",  "সুস্থ",    "स्वस्थ",     "LOW",    "healthy"),

    # ---------- TOBACCO ----------
    ("Tobacco___Mosaic_Virus", "Tobacco", "Mosaic Virus", "মোজাইক ভাইরাস", "मोज़ेक वायरस", "HIGH", "virus"),
    ("Tobacco___Healthy",      "Tobacco", "Healthy",      "সুস্থ",          "स्वस्थ",        "LOW",  "healthy"),

    # ---------- CABBAGE ----------
    ("Cabbage___Alternaria_Leaf_Spot", "Cabbage", "Alternaria Leaf Spot", "অল্টারন্যারিয়া দাগ", "अल्टरनेरिया धब्बा", "MEDIUM", "fungal_spot"),
    ("Cabbage___Healthy",              "Cabbage", "Healthy",              "সুস্থ",                "स्वस्थ",             "LOW",    "healthy"),

    # ---------- CAULIFLOWER ----------
    ("Cauliflower___Alternaria_Leaf_Spot", "Cauliflower", "Alternaria Leaf Spot", "অল্টারন্যারিয়া দাগ", "अल्टरनेरिया धब्बा", "MEDIUM", "fungal_spot"),
    ("Cauliflower___Healthy",              "Cauliflower", "Healthy",              "সুস্থ",                "स्वस्थ",             "LOW",    "healthy"),

    # ---------- EGGPLANT ----------
    ("Eggplant___Cercospora_Leaf_Spot", "Eggplant", "Cercospora Leaf Spot", "সারকোস্পোরা দাগ", "सर्कोस्पोरा धब्बा", "MEDIUM", "fungal_spot"),
    ("Eggplant___Healthy",              "Eggplant", "Healthy",              "সুস্থ",            "स्वस्थ",             "LOW",    "healthy"),

    # ---------- BASIL ----------
    ("Basil___Downy_Mildew", "Basil", "Downy Mildew", "ডাউনি মিলডিউ", "डाउनी मिल्ड्यू", "HIGH", "downy_mildew"),
    ("Basil___Healthy",      "Basil", "Healthy",      "সুস্থ",          "स्वस्थ",          "LOW",  "healthy"),

    # ---------- BROCCOLI ----------
    ("Broccoli___Downy_Mildew", "Broccoli", "Downy Mildew", "ডাউনি মিলডিউ", "डाउनी मिल्ड्यू", "MEDIUM", "downy_mildew"),
    ("Broccoli___Healthy",      "Broccoli", "Healthy",      "সুস্থ",          "स्वस्थ",          "LOW",    "healthy"),

    # ---------- OTHER SINGLE ----------
    ("Cherry_(including_sour)___Leaf_Spot", "Cherry",     "Leaf Spot",                 "পাতার দাগ",              "पत्ती धब्बा",           "MEDIUM", "fungal_spot"),
    ("Zucchini___Yellow_Mosaic_Virus",      "Zucchini",   "Yellow Mosaic Virus",       "হলুদ মোজাইক ভাইরাস",    "पीला मोज़ेक वायरस",     "HIGH",   "virus"),
    ("Citrus___Canker",                     "Citrus",     "Citrus Canker",             "সাইট্রাস ক্যানকার",     "साइट्रस कैंकर",         "HIGH",   "bacterial"),
    ("Carrot___Cavity_Spot",                "Carrot",     "Cavity Spot",               "ক্যাভিটি স্পট",          "कैविटी स्पॉट",          "MEDIUM", "fungal_spot"),
    ("Grape___Downy_Mildew",                "Grape",      "Downy Mildew",              "ডাউনি মিলডিউ",          "डाउनी मिल्ड्यू",        "HIGH",   "downy_mildew"),
    ("Blueberry___Rust",                    "Blueberry",  "Rust",                      "মরিচা রোগ",              "रतुआ रोग",              "MEDIUM", "rust"),
    ("Peach___Leaf_Curl",                   "Peach",      "Leaf Curl",                 "পাতা কোঁকড়ানো",        "पत्ती मरोड़",           "HIGH",   "fungal_spot"),
    ("Sugarcane___Bacterial_Blight",        "Sugarcane",  "Bacterial Blight",          "ব্যাকটেরিয়াল ঝলসানো", "जीवाणु झुलसा",          "HIGH",   "bacterial"),
    ("Sugarcane___Red_Stripe",              "Sugarcane",  "Red Stripe",                "লাল স্ট্রাইপ",           "लाल स्ट्राइप",          "MEDIUM", "fungal_spot"),
    ("Wheat___Septoria",                    "Wheat",      "Septoria",                  "সেপ্টোরিয়া",            "सेप्टोरिया",           "MEDIUM", "fungal_spot"),
    ("Tomato___Brown_Spots",                "Tomato",     "Brown Spots",               "বাদামী দাগ",             "भूरे धब्बे",            "MEDIUM", "fungal_spot"),
    ("Tomato___Bacterial_Wilt",             "Tomato",     "Bacterial Wilt",            "ব্যাকটেরিয়াল উইল্ট",     "जीवाणु विल्ट",          "HIGH",   "bacterial"),
    ("Tomato___Blight_Leaf",                "Tomato",     "Blight Leaf",               "ঝলসানো পাতা",          "झुलसी पत्ती",           "HIGH",   "blight"),
]

# ==========================================================
# GENERATE SQL
# ==========================================================
def esc(s):
    return s.replace("'", "''")

lines = ["BEGIN;", ""]
for (label, crop, en, bn, hi, sev, tkey) in D:
    t_en, t_bn, t_hi = T[tkey]
    lines.append(
        "INSERT INTO diseases (id, model_class_label, crop_name, disease_name_en, "
        "disease_name_bn, disease_name_hi, severity, treatment_en, treatment_bn, treatment_hi) "
        f"VALUES (gen_random_uuid(), '{esc(label)}', '{esc(crop)}', '{esc(en)}', "
        f"'{esc(bn)}', '{esc(hi)}', '{sev}', '{esc(t_en)}', '{esc(t_bn)}', '{esc(t_hi)}') "
        f"ON CONFLICT (model_class_label) DO NOTHING;"
    )
lines.append("")
lines.append("COMMIT;")

with open("add_new_diseases.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"✅ SQL generated: add_new_diseases.sql")
print(f"   Total diseases: {len(D)}")