"""
Clinical Extraction Agent — Step 2
Extracts structured medical entities from transcript using Gemini.
Token-optimized: sends transcript once, extracts all entities in one call.
"""

import json
from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState
from backend.llm.gemini_client import get_gemini_response
from backend.llm.prompts import EXTRACTION_PROMPT

# Strict JSON schema — LLM only fills this template
ENTITY_SCHEMA = {
    "chief_complaint": "",
    "symptoms": [],
    "duration": "",
    "medical_history": [],
    "diagnosis": "",
    "medications": [],
    "dosage": [],
    "frequency": [],
    "duration_of_medication": "",
    "followup_date": "",
    "tests_recommended": [],
}


class ClinicalExtractionAgent(BaseAgent):
    """Extracts structured medical entities from transcript via Gemini LLM."""

    def __init__(self):
        super().__init__("ClinicalExtractionAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        transcript = state.get("transcript", "")
        if not transcript:
            raise ValueError("Transcript is empty — cannot extract entities.")

        prompt = EXTRACTION_PROMPT.format(
            schema=json.dumps(ENTITY_SCHEMA, indent=2),
            transcript=transcript,
        )

        raw = get_gemini_response(prompt)
        entities = self._parse_json(raw)

        return {
            "extracted_entities": entities,
        }

    def _parse_json(self, raw: str) -> dict:
        """Robustly parse JSON from LLM response, stripping markdown fences."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.startswith("```")]
            cleaned = "\n".join(lines).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            self.logger.warning("JSON parse failed, returning defaults.")
            return ENTITY_SCHEMA.copy()
