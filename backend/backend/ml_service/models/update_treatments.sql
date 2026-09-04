-- ========================================
-- UPDATE TREATMENT TEXTS FOR ALL 88 DISEASES
-- ========================================

BEGIN;


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Apple scab on Apple. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Apple scab এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Apple scab के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Apple___Apple_scab';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Black rot on Apple. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Black rot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Black rot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Apple___Black_rot';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Apple___Cedar_apple_rust';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Apple___healthy';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Blueberry___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Powdery mildew on Cherry_(including_sour). Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Powdery mildew এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Powdery mildew के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Cherry_(including_sour)___Powdery_mildew';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Cherry_(including_sour)___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Cercospora leaf spot Gray leaf spot on Corn_(maize). Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Cercospora leaf spot Gray leaf spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Cercospora leaf spot Gray leaf spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Corn_(maize)___Common_rust_';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Northern Leaf Blight on Corn_(maize). Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Northern Leaf Blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Northern Leaf Blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Corn_(maize)___Northern_Leaf_Blight';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Corn_(maize)___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial Blight on Cotton. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial Blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial Blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Cotton___Bacterial_Blight';


UPDATE diseases 
SET treatment_en = 'Control whiteflies. Remove infected leaves. Apply appropriate pesticides for vector control.', 
    treatment_bn = 'সাদা মাছি নিয়ন্ত্রণ করুন। সংক্রমিত পাতা অপসারণ করুন। ভেক্টর নিয়ন্ত্রণের জন্য উপযুক্ত কীটনাশক প্রয়োগ করুন।', 
    treatment_hi = 'सफेद मक्खियों को नियंत्रित करें। संक्रमित पत्तियों को हटा दें। वेक्टर नियंत्रण के लिए उपयुक्त कीटनाशक लगाएं।'
WHERE model_class_label = 'Cotton___Curl_Virus';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Fusarium Wilt on Cotton. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Fusarium Wilt এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Fusarium Wilt के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Cotton___Fusarium_Wilt';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Cotton___Healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Black rot on Grape. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Black rot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Black rot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Grape___Black_rot';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Esca (Black Measles) on Grape. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Esca (Black Measles) এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Esca (Black Measles) के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Grape___Esca_(Black_Measles)';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Leaf blight (Isariopsis Leaf Spot) on Grape. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Leaf blight (Isariopsis Leaf Spot) এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Leaf blight (Isariopsis Leaf Spot) के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Grape___healthy';


UPDATE diseases 
SET treatment_en = 'Apply copper-based fungicides or carbendazim. Prune affected branches. Remove fallen leaves.', 
    treatment_bn = 'তামা-ভিত্তিক ছত্রাকনাশক বা কার্বেন্ডাজিম প্রয়োগ করুন। আক্রান্ত শাখা ছাঁটাই করুন। পড়ে যাওয়া পাতা অপসারণ করুন।', 
    treatment_hi = 'तांबा-आधारित कवकनाशी या कार्बेन्डाजिम लगाएं। प्रभावित शाखाओं को काट दें। गिरी हुई पत्तियों को हटा दें।'
WHERE model_class_label = 'Mango___Anthracnose';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial Canker on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial Canker এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial Canker के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Bacterial_Canker';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Cutting Weevil on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Cutting Weevil এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Cutting Weevil के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Cutting_Weevil';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Die Back on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Die Back এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Die Back के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Die_Back';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Gall Midge on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Gall Midge এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Gall Midge के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Gall_Midge';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Mango___Healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Powdery Mildew on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Powdery Mildew এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Powdery Mildew के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Powdery_Mildew';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Sooty Mould on Mango. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Sooty Mould এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Sooty Mould के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Mango___Sooty_Mould';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Haunglongbing (Citrus greening) on Orange. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Haunglongbing (Citrus greening) এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Haunglongbing (Citrus greening) के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Orange___Haunglongbing_(Citrus_greening)';


UPDATE diseases 
SET treatment_en = 'Apply copper-based fungicides or carbendazim. Prune affected branches. Remove fallen leaves.', 
    treatment_bn = 'তামা-ভিত্তিক ছত্রাকনাশক বা কার্বেন্ডাজিম প্রয়োগ করুন। আক্রান্ত শাখা ছাঁটাই করুন। পড়ে যাওয়া পাতা অপসারণ করুন।', 
    treatment_hi = 'तांबा-आधारित कवकनाशी या कार्बेन्डाजिम लगाएं। प्रभावित शाखाओं को काट दें। गिरी हुई पत्तियों को हटा दें।'
WHERE model_class_label = 'Papaya___Anthracnose';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial Spot on Papaya. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial Spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial Spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Papaya___Bacterial_Spot';


UPDATE diseases 
SET treatment_en = 'Control whiteflies. Remove infected leaves. Apply appropriate pesticides for vector control.', 
    treatment_bn = 'সাদা মাছি নিয়ন্ত্রণ করুন। সংক্রমিত পাতা অপসারণ করুন। ভেক্টর নিয়ন্ত্রণের জন্য উপযুক্ত কীটনাশক প্রয়োগ করুন।', 
    treatment_hi = 'सफेद मक्खियों को नियंत्रित करें। संक्रमित पत्तियों को हटा दें। वेक्टर नियंत्रण के लिए उपयुक्त कीटनाशक लगाएं।'
WHERE model_class_label = 'Papaya___Curl';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Papaya___Healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Mealybug on Papaya. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Mealybug এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Mealybug के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Papaya___Mealybug';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Mite Disease on Papaya. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Mite Disease এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Mite Disease के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Papaya___Mite_Disease';


UPDATE diseases 
SET treatment_en = 'Control aphids (vectors). Remove infected plants. Use virus-free seeds.', 
    treatment_bn = 'এফিড (বাহক) নিয়ন্ত্রণ করুন। সংক্রমিত গাছ অপসারণ করুন। ভাইরাসমুক্ত বীজ ব্যবহার করুন।', 
    treatment_hi = 'एफिड्स (वाहक) को नियंत्रित करें। संक्रमित पौधों को हटा दें। वायरस-मुक्त बीजों का उपयोग करें।'
WHERE model_class_label = 'Papaya___Mosaic';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Ringspot on Papaya. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Ringspot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Ringspot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Papaya___Ringspot';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial spot on Peach. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Peach___Bacterial_spot';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Peach___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial spot on Pepper,_bell. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Pepper,_bell___Bacterial_spot';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Pepper,_bell___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Early blight on Potato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Early blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Early blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Potato___Early_blight';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Late blight on Potato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Late blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Late blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Potato___Late_blight';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Potato___healthy';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Raspberry___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial Leaf Blight on Rice. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial Leaf Blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial Leaf Blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Rice___Bacterial_Leaf_Blight';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Brown Spot on Rice. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Brown Spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Brown Spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Rice___Brown_Spot';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Rice___Healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Leaf Blast on Rice. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Leaf Blast এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Leaf Blast के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Rice___Leaf_Blast';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Leaf Scald on Rice. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Leaf Scald এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Leaf Scald के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Rice___Leaf_Scald';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Sheath Blight on Rice. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Sheath Blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Sheath Blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Rice___Sheath_Blight';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Soybean___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Powdery mildew on Squash. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Powdery mildew এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Powdery mildew के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Squash___Powdery_mildew';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Leaf scorch on Strawberry. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Leaf scorch এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Leaf scorch के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Strawberry___Leaf_scorch';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Strawberry___healthy';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial Blight on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial Blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial Blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Bacterial_Blight';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Banded Chlorosis on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Banded Chlorosis এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Banded Chlorosis के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Banded_Chlorosis';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Sugarcane___Brown_Rust';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Brown Spot on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Brown Spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Brown Spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Brown_Spot';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Colletotrichosis on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Colletotrichosis এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Colletotrichosis के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Colletotrichosis';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Dried Leaves on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Dried Leaves এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Dried Leaves के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Dried_Leaves';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Grassy Shoot on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Grassy Shoot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Grassy Shoot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Grassy_Shoot';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Sugarcane___Healthy';


UPDATE diseases 
SET treatment_en = 'Control aphids (vectors). Remove infected plants. Use virus-free seeds.', 
    treatment_bn = 'এফিড (বাহক) নিয়ন্ত্রণ করুন। সংক্রমিত গাছ অপসারণ করুন। ভাইরাসমুক্ত বীজ ব্যবহার করুন।', 
    treatment_hi = 'एफिड्स (वाहक) को नियंत्रित करें। संक्रमित पौधों को हटा दें। वायरस-मुक्त बीजों का उपयोग करें।'
WHERE model_class_label = 'Sugarcane___Mosaic';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Pokkah Boeng on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Pokkah Boeng এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Pokkah Boeng के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Pokkah_Boeng';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Red Rot on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Red Rot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Red Rot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Red_Rot';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Sugarcane___Rust';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of SCMV on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'SCMV এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'SCMV के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___SCMV';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of SCYLV on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'SCYLV এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'SCYLV के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___SCYLV';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Sett Rot on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Sett Rot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Sett Rot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Sett_Rot';


UPDATE diseases 
SET treatment_en = 'Use disease-free seeds. Apply seed treatment with fungicide. Remove infected plants.', 
    treatment_bn = 'রোগমুক্ত বীজ ব্যবহার করুন। ছত্রাকনাশক দিয়ে বীজ শোধন করুন। সংক্রমিত গাছ অপসারণ করুন।', 
    treatment_hi = 'रोग-मुक्त बीजों का उपयोग करें। कवकनाशी से बीज उपचार करें। संक्रमित पौधों को हटा दें।'
WHERE model_class_label = 'Sugarcane___Smut';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Viral Disease on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Viral Disease এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Viral Disease के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Viral_Disease';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Yellow on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Yellow এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Yellow के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Yellow';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Yellow Leaf on Sugarcane. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Yellow Leaf এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Yellow Leaf के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Sugarcane___Yellow_Leaf';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Bacterial spot on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Bacterial spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Bacterial spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Bacterial_spot';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Early blight on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Early blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Early blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Early_blight';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Late blight on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Late blight এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Late blight के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Late_blight';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Leaf Mold on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Leaf Mold এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Leaf Mold के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Leaf_Mold';


UPDATE diseases 
SET treatment_en = 'Apply Chlorothalonil or Copper-based fungicides. Remove infected leaves. Avoid overhead watering.', 
    treatment_bn = 'ক্লোরোথালোনিল বা তামা-ভিত্তিক ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন। উপর থেকে জল দেওয়া এড়িয়ে চলুন।', 
    treatment_hi = 'क्लोरोथालोनिल या तांबा-आधारित कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें। ऊपर से पानी देने से बचें।'
WHERE model_class_label = 'Tomato___Septoria_leaf_spot';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Spider mites Two-spotted spider mite on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Spider mites Two-spotted spider mite এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Spider mites Two-spotted spider mite के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Spider_mites Two-spotted_spider_mite';


UPDATE diseases 
SET treatment_en = 'Consult local agricultural officer for treatment of Target Spot on Tomato. Practice crop rotation and good field hygiene.', 
    treatment_bn = 'Target Spot এর জন্য স্থানীয় কৃষি কর্মকর্তার সাথে পরামর্শ করুন। ফসলের আবর্তন এবং ভালো ক্ষেত্র পরিচর্যা অনুশীলন করুন।', 
    treatment_hi = 'Target Spot के लिए स्थानीय कृषि अधिकारी से परामर्श लें। फसल चक्र और अच्छी क्षेत्र स्वच्छता का अभ्यास करें।'
WHERE model_class_label = 'Tomato___Target_Spot';


UPDATE diseases 
SET treatment_en = 'Control whiteflies. Remove infected leaves. Apply appropriate pesticides for vector control.', 
    treatment_bn = 'সাদা মাছি নিয়ন্ত্রণ করুন। সংক্রমিত পাতা অপসারণ করুন। ভেক্টর নিয়ন্ত্রণের জন্য উপযুক্ত কীটনাশক প্রয়োগ করুন।', 
    treatment_hi = 'सफेद मक्खियों को नियंत्रित करें। संक्रमित पत्तियों को हटा दें। वेक्टर नियंत्रण के लिए उपयुक्त कीटनाशक लगाएं।'
WHERE model_class_label = 'Tomato___Tomato_Yellow_Leaf_Curl_Virus';


UPDATE diseases 
SET treatment_en = 'Control aphids (vectors). Remove infected plants. Use virus-free seeds.', 
    treatment_bn = 'এফিড (বাহক) নিয়ন্ত্রণ করুন। সংক্রমিত গাছ অপসারণ করুন। ভাইরাসমুক্ত বীজ ব্যবহার করুন।', 
    treatment_hi = 'एफिड्स (वाहक) को नियंत्रित करें। संक्रमित पौधों को हटा दें। वायरस-मुक्त बीजों का उपयोग करें।'
WHERE model_class_label = 'Tomato___Tomato_mosaic_virus';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Tomato___healthy';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Wheat___Brown_Rust';


UPDATE diseases 
SET treatment_en = 'The plant appears healthy. No treatment needed. Maintain good agricultural practices.', 
    treatment_bn = 'গাছটি সুস্থ দেখাচ্ছে। কোন চিকিৎসার প্রয়োজন নেই। ভালো কৃষি অনুশীলন বজায় রাখুন।', 
    treatment_hi = 'पौधा स्वस्थ दिख रहा है। किसी उपचार की आवश्यकता नहीं है। अच्छी कृषि पद्धतियों को बनाए रखें।'
WHERE model_class_label = 'Wheat___Healthy';


UPDATE diseases 
SET treatment_en = 'Use disease-free seeds. Apply seed treatment with fungicide. Remove infected plants.', 
    treatment_bn = 'রোগমুক্ত বীজ ব্যবহার করুন। ছত্রাকনাশক দিয়ে বীজ শোধন করুন। সংক্রমিত গাছ অপসারণ করুন।', 
    treatment_hi = 'रोग-मुक्त बीजों का उपयोग करें। कवकनाशी से बीज उपचार करें। संक्रमित पौधों को हटा दें।'
WHERE model_class_label = 'Wheat___Loose_Smut';


UPDATE diseases 
SET treatment_en = 'Apply Chlorothalonil or Copper-based fungicides. Remove infected leaves. Avoid overhead watering.', 
    treatment_bn = 'ক্লোরোথালোনিল বা তামা-ভিত্তিক ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন। উপর থেকে জল দেওয়া এড়িয়ে চলুন।', 
    treatment_hi = 'क्लोरोथालोनिल या तांबा-आधारित कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें। ऊपर से पानी देने से बचें।'
WHERE model_class_label = 'Wheat___Septoria';


UPDATE diseases 
SET treatment_en = 'Apply fungicides containing propiconazole or tebuconazole. Remove infected leaves.', 
    treatment_bn = 'প্রোপিকোনাজোল বা টেবুকোনাজোলযুক্ত ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।', 
    treatment_hi = 'प्रोपिकोनाजोल या टेबुकोनाजोल युक्त कवकनाशी लगाएं। संक्रमित पत्तियों को हटा दें।'
WHERE model_class_label = 'Wheat___Yellow_Rust';


COMMIT;
