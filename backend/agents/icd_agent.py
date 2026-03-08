"""
ICD-11 Coding Agent — Step 4
Maps diagnosis from extracted entities to ICD-11 codes.
Uses a local fuzzy-match lookup against a bundled ICD-11 CSV dataset.
Falls back to Gemini with a short structured prompt if no match found.
"""

import json
import os
import csv
from difflib import get_close_matches
from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState
from backend.llm.gemini_client import get_gemini_response
from backend.llm.prompts import ICD_PROMPT

# Path to bundled ICD-11 mapping CSV
ICD_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "icd11_common.csv")


def load_icd_lookup() -> dict:
    """Load ICD-11 CSV into {description_lower: (code, title)} dict."""
    lookup = {}
    path = os.path.abspath(ICD_CSV_PATH)
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                code = row.get("code", "").strip()
                title = row.get("title", "").strip()
                if code and title:
                    lookup[title.lower()] = (code, title)
    return lookup


ICD_LOOKUP = {}  # Populated lazily on first use


class ICD11CodingAgent(BaseAgent):
    """Maps diagnosis to ICD-11 codes using local lookup + Gemini fallback."""

    def __init__(self):
        super().__init__("ICD11CodingAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        global ICD_LOOKUP
        if not ICD_LOOKUP:
            ICD_LOOKUP = load_icd_lookup()

        diagnosis = state.get("extracted_entities", {}).get("diagnosis", "")
        if not diagnosis:
            return {"icd_codes": []}

        codes = self._lookup_local(diagnosis)
        if not codes:
            codes = self._lookup_gemini(diagnosis)

        return {"icd_codes": codes}

    def _lookup_local(self, diagnosis: str) -> list:
        """Fuzzy match diagnosis against local ICD-11 titles."""
        keys = list(ICD_LOOKUP.keys())
        matches = get_close_matches(diagnosis.lower(), keys, n=3, cutoff=0.4)
        results = []
        for i, match in enumerate(matches):
            code, title = ICD_LOOKUP[match]
            results.append({
                "code": code,
                "description": title,
                "confidence": round(1.0 - i * 0.15, 2),
            })
        return results

    def _lookup_gemini(self, diagnosis: str) -> list:
        """Gemini fallback — short prompt requesting top 3 ICD-11 codes."""
        prompt = ICD_PROMPT.format(diagnosis=diagnosis)
        raw = get_gemini_response(prompt)
        try:
            cleaned = raw.strip().lstrip("```json").rstrip("```").strip()
            data = json.loads(cleaned)
            return data if isinstance(data, list) else []
        except Exception:
            self.logger.warning("Gemini ICD response parse failed.")
            return [{"code": "Unknown", "description": diagnosis, "confidence": 0.5}]
