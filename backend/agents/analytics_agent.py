"""
Analytics Agent — Step 9
Records consultation metrics to SQLite and generates aggregate analytics.
No LLM usage — pure data aggregation.
"""

import sqlite3
import os
import uuid
from datetime import datetime
from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "analytics.db")

# Average minutes a doctor would spend documenting without the system
DOC_TIME_BASELINE_MINUTES = 15.0


def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(os.path.abspath(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create analytics tables if they don't exist."""
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS consultations (
                id TEXT PRIMARY KEY,
                patient_name TEXT,
                diagnosis TEXT,
                medications TEXT,
                audio_duration_seconds REAL,
                doc_time_saved_minutes REAL,
                created_at TEXT
            )
        """)
        conn.commit()


class AnalyticsAgent(BaseAgent):
    """Records per-consultation metrics and provides aggregate analytics."""

    def __init__(self):
        super().__init__("AnalyticsAgent")
        init_db()

    def run(self, state: ConsultationState) -> ConsultationState:
        consultation_id = state.get("consultation_id") or str(uuid.uuid4())
        e = state.get("extracted_entities", {})
        patient_name = state.get("patient_name", "Unknown")
        diagnosis = e.get("diagnosis", "Unknown")
        medications = ", ".join(e.get("medications", []))
        audio_dur = state.get("audio_duration_seconds", 0.0)
        doc_saved = DOC_TIME_BASELINE_MINUTES  # Flat estimate per consultation

        # Store to DB
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO consultations
                (id, patient_name, diagnosis, medications, audio_duration_seconds,
                 doc_time_saved_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    consultation_id, patient_name, diagnosis, medications,
                    audio_dur, doc_saved, datetime.utcnow().isoformat()
                ),
            )
            conn.commit()

        analytics_summary = {
            "consultation_id": consultation_id,
            "diagnosis": diagnosis,
            "medications": e.get("medications", []),
            "audio_duration_seconds": audio_dur,
            "estimated_doc_time_saved_minutes": doc_saved,
        }

        return {
            "consultation_id": consultation_id,
            "analytics": analytics_summary,
            "ai_disclaimer": "⚠️ AI Generated — Requires Doctor Review",
        }

    @staticmethod
    def get_aggregate() -> dict:
        """Return aggregate analytics for the dashboard."""
        with get_db_connection() as conn:
            rows = conn.execute("SELECT * FROM consultations").fetchall()
            if not rows:
                return {
                    "total_consultations": 0,
                    "most_common_diagnosis": "N/A",
                    "most_prescribed_drugs": [],
                    "avg_audio_duration_seconds": 0.0,
                    "total_doc_time_saved_minutes": 0.0,
                }
            from collections import Counter

            diagnoses = [r["diagnosis"] for r in rows if r["diagnosis"]]
            all_meds = []
            for r in rows:
                if r["medications"]:
                    all_meds.extend([m.strip() for m in r["medications"].split(",")])

            diag_counter = Counter(diagnoses)
            med_counter = Counter(all_meds)
            avg_dur = sum(r["audio_duration_seconds"] or 0 for r in rows) / len(rows)
            total_saved = sum(r["doc_time_saved_minutes"] or 0 for r in rows)

            return {
                "total_consultations": len(rows),
                "most_common_diagnosis": diag_counter.most_common(1)[0][0] if diag_counter else "N/A",
                "most_prescribed_drugs": [d for d, _ in med_counter.most_common(5)],
                "avg_audio_duration_seconds": round(avg_dur, 1),
                "total_doc_time_saved_minutes": round(total_saved, 1),
            }
