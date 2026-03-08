"""
Drug Interaction Agent — Step 6
Queries OpenFDA API for known drug interactions.
Falls back to Gemini for multi-drug interaction analysis when needed.
"""

import requests
import json
from itertools import combinations
from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState
from backend.llm.gemini_client import get_gemini_response
from backend.llm.prompts import DRUG_INTERACTION_PROMPT

OPENFDA_BASE = "https://api.fda.gov/drug/event.json"
OPENFDA_LABEL = "https://api.fda.gov/drug/label.json"


class DrugInteractionAgent(BaseAgent):
    """Checks drug interactions via OpenFDA API with Gemini fallback."""

    def __init__(self):
        super().__init__("DrugInteractionAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        prescriptions = state.get("prescription", [])
        drug_names = [p["drug_name"] for p in prescriptions if p.get("drug_name")]

        if not drug_names:
            return {"drug_interactions": []}

        interactions = []

        # Check each drug against OpenFDA label warnings
        for drug in drug_names:
            fda_warnings = self._query_openfda(drug)
            if fda_warnings:
                interactions.append({
                    "drug_pair": drug,
                    "interaction_level": "MODERATE",
                    "description": fda_warnings,
                })

        # Use Gemini for cross-drug pair interactions if multiple drugs
        if len(drug_names) > 1:
            gemini_interactions = self._check_gemini(drug_names)
            interactions.extend(gemini_interactions)

        return {"drug_interactions": interactions}

    def _query_openfda(self, drug_name: str) -> str:
        """Query OpenFDA drug label API for warnings about this drug."""
        try:
            params = {
                "search": f'openfda.brand_name:"{drug_name}"',
                "limit": 1,
            }
            resp = requests.get(OPENFDA_LABEL, params=params, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    warnings = results[0].get("warnings", [])
                    if warnings:
                        return warnings[0][:300]  # Cap length
            return ""
        except Exception as e:
            self.logger.warning(f"OpenFDA query failed for {drug_name}: {e}")
            return ""

    def _check_gemini(self, drug_names: list) -> list:
        """Use Gemini to identify known interactions between the drug list."""
        prompt = DRUG_INTERACTION_PROMPT.format(drugs=", ".join(drug_names))
        raw = get_gemini_response(prompt)
        try:
            cleaned = raw.strip().lstrip("```json").rstrip("```").strip()
            data = json.loads(cleaned)
            return data if isinstance(data, list) else []
        except Exception:
            self.logger.warning("Gemini drug interaction parse failed.")
            return []
