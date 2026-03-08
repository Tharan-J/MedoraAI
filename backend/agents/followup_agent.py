"""
Follow-Up Reminder Agent — Step 8
Generates structured follow-up reminder messages.
Pure template fill — zero LLM tokens.
"""

from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState

REMINDER_TEMPLATE = (
    "Hello {patient_name},\n"
    "This is a reminder from the clinic. "
    "Please visit for your follow-up consultation on {date}. "
    "If you experience any worsening symptoms before then, please contact us immediately."
)


class FollowUpAgent(BaseAgent):
    """Generates follow-up reminder messages from extracted entities."""

    def __init__(self):
        super().__init__("FollowUpAgent")

    def run(self, state: ConsultationState) -> ConsultationState:
        e = state.get("extracted_entities", {})
        patient_name = state.get("patient_name", "Patient")
        followup_date = e.get("followup_date", "the scheduled date")
        tests = e.get("tests_recommended", [])

        followups = []

        # Appointment reminder
        if followup_date:
            followups.append({
                "type": "appointment",
                "date": followup_date,
                "message": REMINDER_TEMPLATE.format(
                    patient_name=patient_name,
                    date=followup_date,
                ),
            })

        # Test reminders
        for test in tests:
            followups.append({
                "type": "test",
                "date": followup_date,
                "message": (
                    f"Hello {patient_name}, please ensure you complete your "
                    f"'{test}' test before your follow-up on {followup_date}."
                ),
            })

        return {
            "followups": followups,
        }
