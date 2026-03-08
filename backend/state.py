"""
Shared state object for the LangGraph clinical workflow.
All agents read from and write to this state.
"""

from typing import TypedDict, Optional


class ConsultationState(TypedDict, total=False):
    # Input
    audio_path: str
    patient_name: str
    consultation_id: str

    # Step 1: Transcription
    transcript: str
    audio_duration_seconds: float

    # Step 2: Clinical Extraction
    extracted_entities: dict
    # Schema:
    # {
    #   "chief_complaint": str,
    #   "symptoms": list[str],
    #   "duration": str,
    #   "medical_history": list[str],
    #   "diagnosis": str,
    #   "medications": list[str],
    #   "dosage": list[str],
    #   "frequency": list[str],
    #   "duration_of_medication": str,
    #   "followup_date": str,
    #   "tests_recommended": list[str]
    # }

    # Step 3: SOAP Note
    soap_note: dict
    # Schema:
    # {
    #   "subjective": str,
    #   "objective": str,
    #   "assessment": str,
    #   "plan": str
    # }

    # Step 4: ICD-11 Codes
    icd_codes: list
    # Schema: [{"code": str, "description": str, "confidence": float}]

    # Step 5: Prescription
    prescription: list
    # Schema: [{"drug_name": str, "dosage": str, "frequency": str, "duration": str}]

    # Step 6: Drug Interactions
    drug_interactions: list
    # Schema: [{"drug_pair": str, "interaction_level": str, "description": str}]

    # Step 7: Patient Summary
    patient_summary: str

    # Step 8: Follow-up Reminders
    followups: list
    # Schema: [{"message": str, "date": str, "type": str}]

    # Step 9: Analytics
    analytics: dict
    # Schema: {
    #   "consultation_id": str,
    #   "diagnosis": str,
    #   "medications": list,
    #   "audio_duration_seconds": float,
    #   "estimated_doc_time_saved_minutes": float
    # }

    # Metadata
    errors: list  # Accumulated errors from each agent
    ai_disclaimer: str  # Standard disclaimer added to all outputs
