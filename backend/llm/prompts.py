"""
All LLM prompt templates for the clinical agents.
Kept SHORT and STRUCTURED — LLM only fills predefined schemas.
No open-ended generation to minimize hallucination and token usage.
"""

# ─── Clinical Extraction ─────────────────────────────────────────────────────
EXTRACTION_PROMPT = """You are a clinical information extractor.
Read the transcript below and fill the following JSON schema EXACTLY.
Return ONLY valid JSON. Do not add explanations.

Schema:
{schema}

Transcript:
{transcript}

Rules:
- If a field is not mentioned, use "" for strings and [] for arrays.
- "diagnosis" should be a single string (most likely diagnosis).
- "medications" should be generic drug names only.
- Do not invent information not present in the transcript.

Return JSON:"""

# ─── ICD-11 Coding ────────────────────────────────────────────────────────────
ICD_PROMPT = """Return the top 3 ICD-11 codes for this diagnosis as JSON.

Diagnosis: {diagnosis}

Return ONLY this JSON array, no text:
[
  {{"code": "ICD_CODE", "description": "Full title", "confidence": 0.95}},
  {{"code": "ICD_CODE", "description": "Full title", "confidence": 0.80}},
  {{"code": "ICD_CODE", "description": "Full title", "confidence": 0.65}}
]"""

# ─── Drug Interaction ────────────────────────────────────────────────────────
DRUG_INTERACTION_PROMPT = """List known drug-drug interactions for these medications.
Return ONLY JSON array. No text.

Drugs: {drugs}

Schema:
[
  {{
    "drug_pair": "DrugA + DrugB",
    "interaction_level": "MINOR|MODERATE|MAJOR",
    "description": "One sentence description."
  }}
]

If no interactions known, return [].
Return JSON:"""

# ─── Patient Summary ─────────────────────────────────────────────────────────
PATIENT_SUMMARY_PROMPT = """Write a 3-5 sentence plain-English health summary for a patient.
Use simple words. Grade 6 reading level. No medical jargon.

Diagnosis: {diagnosis}
Symptoms: {symptoms}
Medications: {medications}
Follow-up: {followup}

Write the summary now:"""
