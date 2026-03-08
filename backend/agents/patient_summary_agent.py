"""
Patient Summary Agent — Step 7
Generates a plain-language patient summary via Gemini.
Constraint: Grade 6 level, no jargon, 3-5 sentences max.
Short prompt — minimal token usage.
"""

from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState
from backend.llm.gemini_client import get_gemini_response
from backend.llm.prompts import PATIENT_SUMMARY_PROMPT


class PatientSummaryAgent(BaseAgent):
    """Generates a patient-friendly health summary using Gemini."""

    def __init__(self):
        super().__init__("PatientSummaryAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        e = state.get("extracted_entities", {})

        # We pass only extracted entities — NOT the full transcript
        # This avoids re-sending thousands of tokens
        prompt = PATIENT_SUMMARY_PROMPT.format(
            diagnosis=e.get("diagnosis", "your condition"),
            medications=", ".join(e.get("medications", [])) or "as prescribed",
            followup=e.get("followup_date", "as advised by your doctor"),
            symptoms=", ".join(e.get("symptoms", [])) or "reported symptoms",
        )

        summary = get_gemini_response(prompt).strip()

        return {
            "patient_summary": summary,
        }
