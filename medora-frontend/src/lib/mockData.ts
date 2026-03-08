/**
 * DEMO MOCK DATA
 * Pre-populated for presentation/demo purposes.
 * Represents a completed consultation for patient "Sarah Mitchell" with Hyperlipidemia.
 */

export const MOCK_JOB_ID = "demo-job-2026-03-08"

export const MOCK_SCAN_RESULT = {
    transcript: `Doctor: Good morning Sarah. How have you been feeling since our last visit?

Patient: Hi doctor. Honestly, not great. I've been having these headaches almost every day for the past three weeks. And I've been feeling really tired, more than usual.

Doctor: Any chest pain? Shortness of breath?

Patient: No chest pain. But I do get a little breathless when I climb the stairs now, which didn't happen before.

Doctor: Have you been monitoring your blood pressure at home?

Patient: Yes, it's been running higher than my usual — around 148 over 95 most mornings.

Doctor: That is elevated. Any dizziness or vision changes?

Patient: There was one episode last week where I felt lightheaded after standing up quickly, but it went away.

Doctor: I also see from your labs that your LDL cholesterol came in at 187, which is significantly elevated. Your triglycerides are also high at 240.

Patient: My mother had a heart attack at 62, so I'm really worried.

Doctor: That's important family history. I've also been more thirsty than usual lately and urinating more frequently.

Doctor: I want to order a fasting glucose test given those symptoms. We'll also do a full lipid panel recheck and kidney function. I'll be starting you on Atorvastatin 10mg once daily, and I want to adjust your Lisinopril up to 10mg. Continue the Metformin 500mg.`,

    extracted_entities: {
        patient_name: "Sarah Mitchell",
        age: "54",
        chief_complaint: "Persistent daily headaches, fatigue, elevated blood pressure",
        symptoms: [
            "Daily headaches for 3 weeks",
            "Fatigue",
            "Exertional dyspnea (stair climbing)",
            "BP: 148/95 mmHg at home",
            "Lightheadedness on standing",
            "Polydipsia (increased thirst)",
            "Polyuria (frequent urination)"
        ],
        duration: "3 weeks",
        medical_history: [
            "Hypertension (known)",
            "Hyperlipidemia (new finding)",
            "Pre-diabetes monitoring"
        ],
        diagnosis: "Essential Hypertension with Hyperlipidemia; possible early Diabetes Mellitus",
        medications: ["Atorvastatin", "Lisinopril", "Metformin"],
        dosage: ["10mg", "10mg", "500mg"],
        frequency: ["Once daily", "Once daily", "Twice daily with meals"],
        duration_of_medication: "30 days",
        followup_date: "2026-04-08",
        tests_recommended: [
            "Fasting blood glucose",
            "HbA1c",
            "Full lipid panel",
            "Serum creatinine / eGFR",
            "Urine microalbumin"
        ]
    },

    soap_note: {
        subjective: "54-year-old female presenting with 3-week history of daily headaches, fatigue, and new onset exertional dyspnea. Reports home BP readings of 148/95 mmHg. One episode of postural lightheadedness last week. Also reports polyuria and polydipsia for approximately 2 weeks. Family history significant for maternal MI at age 62.",
        objective: "BP: 148/95 mmHg (elevated). LDL: 187 mg/dL (high). Triglycerides: 240 mg/dL (high). Postural hypotension on exam. BMI: 28.4. Heart rate: 78 bpm, regular rhythm. Respiratory exam unremarkable at rest. Labs show fasting glucose pending.",
        assessment: "1. Essential hypertension — poorly controlled on current regimen.\n2. Hyperlipidemia — newly diagnosed, LDL significantly above target.\n3. Suspected early Type 2 Diabetes Mellitus — polyuria, polydipsia, elevated risk profile.\n4. Family history of premature cardiovascular disease — warrants aggressive risk reduction.",
        plan: "1. Uptitrate Lisinopril 5mg → 10mg daily.\n2. Initiate Atorvastatin 10mg once nightly.\n3. Continue Metformin 500mg twice daily with meals.\n4. Order: Fasting glucose, HbA1c, full lipid panel, renal function, urine microalbumin.\n5. Dietary counseling: low-sodium (<2g/day), low-saturated fat diet.\n6. 30-minute moderate exercise daily.\n7. Follow-up in 4 weeks or sooner if BP exceeds 160/100 or symptoms worsen."
    },

    icd_codes: [
        "I10 Essential (primary) hypertension",
        "E78.5 Hyperlipidemia, unspecified",
        "R35.0 Frequency of micturition",
        "R63.1 Polydipsia",
        "Z82.49 Family history of ischemic heart disease"
    ],

    prescription: [
        { medication: "Atorvastatin", dosage: "10mg", frequency: "Once daily at bedtime", duration: "30 days" },
        { medication: "Lisinopril", dosage: "10mg", frequency: "Once daily morning", duration: "30 days" },
        { medication: "Metformin", dosage: "500mg", frequency: "Twice daily with meals", duration: "30 days" },
        { medication: "Aspirin (low-dose)", dosage: "75mg", frequency: "Once daily", duration: "30 days" }
    ],

    drug_interactions: [
        {
            drug_pair: "Lisinopril + Metformin",
            interaction_level: "MINOR",
            description: "ACE inhibitors may increase insulin sensitivity; monitor for hypoglycemia. Generally well-tolerated combination."
        }
    ],

    patient_summary: "During your visit today, Dr. Jenkins reviewed your blood pressure readings, cholesterol levels, and some new symptoms you've been experiencing. Your blood pressure is a bit high (148/95), and your cholesterol is elevated — we're starting a new medication called Atorvastatin to help bring that down. We're also increasing your blood pressure medication (Lisinopril) to a slightly higher dose. Your symptoms of increased thirst and urination may indicate early diabetes, so we're ordering blood tests to check your blood sugar levels. Continue your Metformin as usual. Please follow a low-salt, low-fat diet and try to walk for 30 minutes every day. Come back in 4 weeks, or sooner if your blood pressure goes above 160/100 or you feel worse.",

    followups: [
        {
            message: "Return in 4 weeks for blood pressure and medication review",
            date: "2026-04-08",
            type: "Routine Follow-Up"
        },
        {
            message: "Fasting blood glucose and HbA1c results — call immediately if glucose > 200 mg/dL",
            date: "2026-03-15",
            type: "Lab Results"
        },
        {
            message: "Full lipid panel recheck after 6 weeks of statin therapy",
            date: "2026-04-22",
            type: "Lab Follow-Up"
        },
        {
            message: "Dietary counseling appointment recommended",
            date: "2026-03-20",
            type: "Referral"
        }
    ],

    analytics: {
        consultation_id: "demo-job-2026-03-08",
        diagnosis: "Essential Hypertension with Hyperlipidemia",
        medications: ["Atorvastatin", "Lisinopril", "Metformin", "Aspirin"],
        audio_duration_seconds: 187,
        estimated_doc_time_saved_minutes: 18
    },

    ai_disclaimer: "⚠️ AI Generated — Requires Doctor Review and Clinical Judgment"
}

export const MOCK_INTAKE = {
    name: "Sarah Mitchell",
    age: "54",
    gender: "Female",
    contact: "+1 555 847 2291",
    chiefComplaint: "Persistent daily headaches for 3 weeks, fatigue, and increasing breathlessness on exertion",
    diseases: ["Hypertension", "Diabetes Type 2"],
    surgeries: "Cholecystectomy (gallbladder removal) — 2014",
    familyHistory: "Mother: Heart attack at age 62. Father: Type 2 Diabetes, Hypertension.",
    currentMedications: "Lisinopril 5mg once daily, Metformin 500mg twice daily",
    drugAllergies: ["Penicillin"],
    foodAllergies: [] as string[],
    smoking: "Former smoker",
    alcohol: "Social drinking",
    exercise: "Occasionally",
    clinicName: "Medora Health Clinic",
    dateOfVisit: "2026-03-08"
}

export const MOCK_RED_FLAGS = [
    {
        symptom: "Polydipsia and Polyuria",
        possible_conditions: ["Diabetes Mellitus Type 2", "Diabetes Insipidus", "Hyperglycemia"],
        severity: "HIGH",
        suggested_action: "Immediate fasting blood glucose and HbA1c testing. Consider urgent diabetes screening."
    },
    {
        symptom: "Exertional Dyspnea with Elevated BP",
        possible_conditions: ["Hypertensive Heart Disease", "Early Heart Failure", "Pulmonary Hypertension"],
        severity: "HIGH",
        suggested_action: "ECG, chest X-ray, BNP levels. Cardiology referral if symptoms progress."
    },
    {
        symptom: "Postural Lightheadedness",
        possible_conditions: ["Orthostatic Hypotension", "Autonomic Neuropathy", "Volume Depletion"],
        severity: "MEDIUM",
        suggested_action: "Orthostatic BP measurement (lying/standing). Review current antihypertensive dosing."
    }
]

export const MOCK_INSURANCE_REPORT = {
    patient_name: "Sarah Mitchell",
    patient_age: "54",
    date_of_visit: "2026-03-08",
    clinic_name: "Medora Health Clinic",
    attending_physician: "Dr. Jenkins",
    chief_complaint: "Persistent daily headaches, fatigue, elevated blood pressure",
    diagnosis: "Essential Hypertension with Hyperlipidemia; possible early Diabetes Mellitus",
    symptoms: ["Daily headaches", "Fatigue", "Exertional dyspnea", "Lightheadedness", "Polydipsia", "Polyuria"],
    investigations_ordered: ["Fasting blood glucose", "HbA1c", "Full lipid panel", "Serum creatinine", "Urine microalbumin"],
    treatment_provided: "Uptitrated Lisinopril to 10mg. Initiated Atorvastatin 10mg. Continued Metformin 500mg. Dietary and lifestyle counseling.",
    prescribed_medications: ["Atorvastatin 10mg OD", "Lisinopril 10mg OD", "Metformin 500mg BD", "Aspirin 75mg OD"],
    icd_codes: ["I10", "E78.5", "R35.0", "R63.1", "Z82.49"],
    follow_up_plan: ["Return in 4 weeks", "Lab results review March 15", "Dietary counseling March 20"],
    ai_disclaimer: "⚠️ AI Generated — Requires Doctor Review",
    generated_at: "2026-03-08"
}

export const MOCK_BILLING = {
    em_code: {
        code: "99214",
        level: "Level 4",
        desc: "Established patient, moderate medical decision making"
    },
    icd10_codes: ["I10", "E78.5", "R35.0", "R63.1", "Z82.49"],
    justification: {
        consultation_minutes: 22,
        complexity: "moderate",
        symptoms_reviewed: 7,
        medications_managed: 4,
        diagnosis: "Essential Hypertension with Hyperlipidemia"
    }
}

export const MOCK_RX = [
    { drug: "Atorvastatin", dose: "10mg", frequency: "Once daily", duration: "30 days", instruction: "Take at bedtime" },
    { drug: "Lisinopril", dose: "10mg", frequency: "Once daily", duration: "30 days", instruction: "Take in the morning, monitor BP" },
    { drug: "Metformin", dose: "500mg", frequency: "Twice daily", duration: "30 days", instruction: "Take with meals" },
    { drug: "Aspirin", dose: "75mg", frequency: "Once daily", duration: "30 days", instruction: "Cardiovascular protection" },
]
