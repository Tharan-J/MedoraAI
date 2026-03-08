"""
SOAP Note Generator Agent — Step 3
Template-fills a SOAP note from extracted entities.
No LLM call needed — deterministic template interpolation.
Zero additional tokens consumed.
"""

from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState


class SOAPNoteAgent(BaseAgent):
    """Generates SOAP note by filling a template from extracted_entities."""

    def __init__(self):
        super().__init__("SOAPNoteAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        e = state.get("extracted_entities", {})

        def join(lst, sep=", "):
            return sep.join(lst) if isinstance(lst, list) else str(lst)

        soap = {
            "subjective": (
                f"Chief Complaint: {e.get('chief_complaint', 'N/A')}\n"
                f"Symptoms: {join(e.get('symptoms', []))}\n"
                f"Duration: {e.get('duration', 'N/A')}\n"
                f"Medical History: {join(e.get('medical_history', []))}"
            ),
            "objective": (
                "Clinical observations recorded during consultation. "
                "Vital signs and physical examination findings as documented by attending physician."
            ),
            "assessment": (
                f"Likely Diagnosis: {e.get('diagnosis', 'N/A')}\n"
                f"Tests Recommended: {join(e.get('tests_recommended', []))}"
            ),
            "plan": (
                f"Medications: {join(e.get('medications', []))}\n"
                f"Dosage: {join(e.get('dosage', []))}\n"
                f"Frequency: {join(e.get('frequency', []))}\n"
                f"Duration of Medication: {e.get('duration_of_medication', 'N/A')}\n"
                f"Follow-up: {e.get('followup_date', 'N/A')}"
            ),
        }

        return {
            "soap_note": soap,
        }
