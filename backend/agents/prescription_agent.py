"""
Prescription Extraction Agent — Step 5
Converts extracted medication info into structured prescription objects.
Pure template transform — zero LLM tokens.
"""

from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState


class PrescriptionAgent(BaseAgent):
    """Builds structured prescription list from extracted entities."""

    def __init__(self):
        super().__init__("PrescriptionAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        e = state.get("extracted_entities", {})

        medications = e.get("medications", [])
        dosages = e.get("dosage", [])
        frequencies = e.get("frequency", [])
        duration = e.get("duration_of_medication", "As prescribed")

        # Zip medication fields together, padding with defaults
        prescriptions = []
        for i, drug in enumerate(medications):
            prescriptions.append({
                "drug_name": drug.strip(),
                "dosage": dosages[i] if i < len(dosages) else "As prescribed",
                "frequency": frequencies[i] if i < len(frequencies) else "As directed",
                "duration": duration,
            })

        return {
            "prescription": prescriptions,
        }
