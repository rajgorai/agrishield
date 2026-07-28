-- Insert sample diseases (runs on startup)
INSERT INTO diseases (id, model_class_label, crop_name, disease_name_en, disease_name_bn, disease_name_hi, severity, treatment_en, treatment_bn, treatment_hi)
VALUES
    (gen_random_uuid(), 'Tomato___Late_blight', 'Tomato', 'Late Blight', 'দেরী ব্লাইট', 'लेट ब्लाइट', 'HIGH',
     'Apply Mancozeb 75% WP at 2g/litre every 7 days. Remove infected leaves.',
     'ম্যাঙ্কোজেব ৭৫% ডব্লিউপি ২ গ্রাম/লিটার হারে প্রতি ৭ দিনে প্রয়োগ করুন। সংক্রমিত পাতা অপসারণ করুন।',
     'मैंकोजेब 75% WP 2 ग्राम/लीटर की दर से हर 7 दिन में लगाएं। संक्रमित पत्तियों को हटा दें।'),

    (gen_random_uuid(), 'Tomato___Early_blight', 'Tomato', 'Early Blight', 'আগাম ব্লাইট', 'अर्ली ब्लाइट', 'MEDIUM',
     'Apply Chlorothalonil 75% WP at 2g/litre. Rotate crops.',
     'ক্লোরোথালোনিল ৭৫% ডব্লিউপি ২ গ্রাম/লিটার হারে প্রয়োগ করুন। ফসলের আবর্তন করুন।',
     'क्लोरोथालोनिल 75% WP 2 ग्राम/लीटर की दर से लगाएं। फसल चक्र अपनाएं।'),

    (gen_random_uuid(), 'Potato___Late_blight', 'Potato', 'Late Blight', 'দেরী ব্লাইট', 'लेट ब्लाइट', 'HIGH',
     'Apply Metalaxyl + Mancozeb at 2.5g/litre at first sign.',
     'প্রথম লক্ষণে মেটালাক্সিল + ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার হারে প্রয়োগ করুন।',
     'पहले लक्षण पर मेटालैक्सिल + मैंकोजेब 2.5 ग्राम/लीटर की दर से लगाएं।');