"""
LangGraph Workflow Orchestrator
Defines the full 9-agent DAG for the clinical note generation pipeline.

Graph topology:
  Audio Input
     ↓
  Transcription Agent
     ↓
  Clinical Extraction Agent
     ↓
  SOAP Generator (deterministic)
     ↓
  ┌──────────────┬─────────────────┐
  ICD Coding   Prescription    Patient Summary
                   ↓
             Drug Interaction
                   ↓
            Follow-Up Generator
                   ↓
               Analytics
"""

from langgraph.graph import StateGraph, END
from backend.state import ConsultationState
from backend.agents.transcription_agent import TranscriptionAgent
from backend.agents.extraction_agent import ClinicalExtractionAgent
from backend.agents.soap_agent import SOAPNoteAgent
from backend.agents.icd_agent import ICD11CodingAgent
from backend.agents.prescription_agent import PrescriptionAgent
from backend.agents.drug_interaction_agent import DrugInteractionAgent
from backend.agents.patient_summary_agent import PatientSummaryAgent
from backend.agents.followup_agent import FollowUpAgent
from backend.agents.analytics_agent import AnalyticsAgent

# Instantiate agents (singletons — model loaded once)
_transcription = TranscriptionAgent(model_size="base")
_extraction = ClinicalExtractionAgent()
_soap = SOAPNoteAgent()
_icd = ICD11CodingAgent()
_prescription = PrescriptionAgent()
_drug_interaction = DrugInteractionAgent()
_patient_summary = PatientSummaryAgent()
_followup = FollowUpAgent()
_analytics = AnalyticsAgent()


def build_workflow() -> StateGraph:
    """Construct and compile the LangGraph clinical workflow."""

    builder = StateGraph(ConsultationState)

    # Register all nodes
    builder.add_node("transcription", _transcription)
    builder.add_node("extraction", _extraction)
    builder.add_node("soap", _soap)
    builder.add_node("icd", _icd)
    builder.add_node("prescription", _prescription)
    builder.add_node("drug_interaction", _drug_interaction)
    builder.add_node("patient_summary", _patient_summary)
    builder.add_node("followup", _followup)
    builder.add_node("analytics", _analytics)

    # ── Sequential backbone ──────────────────────────────────────────────────
    builder.set_entry_point("transcription")
    builder.add_edge("transcription", "extraction")
    builder.add_edge("extraction", "soap")

    # ── Parallel branch after SOAP ───────────────────────────────────────────
    # LangGraph fan-out: soap → [icd, prescription, patient_summary]
    builder.add_edge("soap", "icd")
    builder.add_edge("soap", "prescription")
    builder.add_edge("soap", "patient_summary")

    # ── Prescription → Drug Interaction → Follow-up ──────────────────────────
    builder.add_edge("prescription", "drug_interaction")
    builder.add_edge("drug_interaction", "followup")

    # ── All parallel branches converge at analytics ──────────────────────────
    builder.add_edge("icd", "analytics")
    builder.add_edge("patient_summary", "analytics")
    builder.add_edge("followup", "analytics")

    builder.add_edge("analytics", END)

    return builder.compile()


# Compiled graph — import and call .invoke(state) to run
clinical_workflow = build_workflow()
