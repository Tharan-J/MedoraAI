"""
FastAPI Application Entry Point
Exposes REST endpoints for audio upload, note generation, and analytics.
"""

import os
import json
import uuid
import shutil
import logging
import threading
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.workflow import clinical_workflow
from backend.agents.analytics_agent import AnalyticsAgent
from backend.llm.gemini_client import get_gemini_response

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("api")

# ── Directories ───────────────────────────────────────────────────────────────
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

JOBS_FILE = UPLOAD_DIR / "jobs.json"
_jobs_lock = threading.Lock()


def _load_jobs() -> dict:
    """Load persisted job store from disk (survives process restarts)."""
    if JOBS_FILE.exists():
        try:
            with open(JOBS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_jobs(jobs: dict) -> None:
    """Atomically persist job store to disk."""
    tmp = JOBS_FILE.with_suffix(".tmp")
    try:
        with open(tmp, "w") as f:
            json.dump(jobs, f)
        tmp.replace(JOBS_FILE)
    except Exception as e:
        logger.error(f"Failed to persist jobs: {e}")


def _set_job(job_id: str, data: dict) -> None:
    """Update a job record in memory and persist to disk."""
    with _jobs_lock:
        _jobs[job_id] = data
        _save_jobs(_jobs)


# ── In-memory + disk-backed job store ────────────────────────────────────────
_jobs: dict[str, dict] = _load_jobs()
logger.info(f"Loaded {len(_jobs)} existing jobs from disk.")


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ambient Clinical Note Generator API",
    description="Agentic AI system that converts consultation audio into structured clinical documentation.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ───────────────────────────────────────────────────
class RedFlagRequest(BaseModel):
    transcript: str

class InsuranceReportRequest(BaseModel):
    job_id: str
    patient_name: Optional[str] = "Anonymous"
    patient_age: Optional[str] = ""
    date_of_visit: Optional[str] = ""
    clinic_name: Optional[str] = "Medora AI Clinic"
    doctor_name: Optional[str] = "Dr. Jenkins"

class BillingCodeRequest(BaseModel):
    job_id: str
    consultation_minutes: Optional[int] = 10


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "Ambient Clinical Note Generator v2"}


@app.post("/upload_audio")
async def upload_audio(
    file: UploadFile = File(...),
    patient_name: str = Form(default="Anonymous"),
    background_tasks: BackgroundTasks = None,
):
    """
    Upload a consultation audio file.
    Returns a job_id that can be used to track processing progress.
    Supported formats: .mp3, .wav, .m4a, .ogg, .flac, .webm
    """
    ALLOWED = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format '{suffix}'. Allowed: {ALLOWED}",
        )

    job_id = str(uuid.uuid4())
    dest_path = UPLOAD_DIR / f"{job_id}{suffix}"

    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    logger.info(f"Audio uploaded: {dest_path} | job={job_id}")

    _set_job(job_id, {
        "status": "uploaded",
        "patient_name": patient_name,
        "audio_path": str(dest_path),
        "result": None,
        "error": None,
    })

    return {"job_id": job_id, "status": "uploaded", "filename": file.filename}


@app.post("/generate_note")
async def generate_note(
    job_id: str,
    background_tasks: BackgroundTasks,
):
    """
    Trigger the clinical note generation workflow for a previously uploaded audio file.
    Processing runs in the background. Poll /status/{job_id} for results.
    """
    job = _jobs.get(job_id)
    if not job:
        # Try reloading from disk in case of cold start
        persisted = _load_jobs()
        job = persisted.get(job_id)
        if job:
            with _jobs_lock:
                _jobs[job_id] = job
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] == "processing":
        return {"job_id": job_id, "status": "already_processing"}

    job["status"] = "processing"
    _set_job(job_id, job)
    background_tasks.add_task(_run_workflow, job_id, job)

    return {"job_id": job_id, "status": "processing"}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    """Poll the status and result of a processing job."""
    # Check in-memory first, then reload from disk (handles cold restarts)
    job = _jobs.get(job_id)
    if not job:
        persisted = _load_jobs()
        job = persisted.get(job_id)
        if job:
            with _jobs_lock:
                _jobs[job_id] = job  # warm the in-memory cache
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return {
        "job_id": job_id,
        "status": job["status"],
        "result": job.get("result"),
        "error": job.get("error"),
    }


@app.get("/analytics")
async def get_analytics():
    """Return aggregate analytics across all processed consultations."""
    return AnalyticsAgent.get_aggregate()


@app.post("/detect_redflags")
async def detect_redflags(req: RedFlagRequest):
    """
    Analyze a transcript for medical red flags using Gemini.
    Returns a list of potential red flags with symptoms, possible conditions, and suggested actions.
    """
    if not req.transcript or len(req.transcript.strip()) < 20:
        return {"red_flags": []}

    RF_SCHEMA = [
        {
            "symptom": "example symptom",
            "possible_conditions": ["Condition A", "Condition B"],
            "severity": "HIGH | MEDIUM | LOW",
            "suggested_action": "Suggested test or referral"
        }
    ]

    prompt = f"""You are a clinical AI assistant trained for medical red flag detection.

Analyze the following doctor-patient consultation transcript and identify any medical red flags.
A red flag is a symptom or combination of symptoms that may indicate a serious underlying condition.

Return ONLY a valid JSON array matching this schema:
{json.dumps(RF_SCHEMA, indent=2)}

Rules:
- Only include HIGH or MEDIUM confidence red flags
- Be clinically conservative — only flag genuinely concerning symptoms
- Maximum 5 red flags
- If none found, return an empty array: []

Transcript:
{req.transcript}

Return only the JSON array, no explanation:"""

    try:
        raw = get_gemini_response(prompt)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.startswith("```")]
            cleaned = "\n".join(lines).strip()
        red_flags = json.loads(cleaned)
        if not isinstance(red_flags, list):
            red_flags = []
    except Exception as e:
        logger.error(f"Red flag detection failed: {e}")
        red_flags = []

    return {"red_flags": red_flags}


@app.post("/insurance_report")
async def insurance_report(req: InsuranceReportRequest):
    """Generate a preformatted insurance-ready document from a completed job."""
    job = _jobs.get(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{req.job_id}' not found.")
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job is not yet completed.")

    result = job.get("result", {})
    entities = result.get("extracted_entities", {})
    soap = result.get("soap_note", {})
    icd = result.get("icd_codes", [])
    prescription = result.get("prescription", [])
    followups = result.get("followups", [])

    report = {
        "patient_name": req.patient_name,
        "patient_age": req.patient_age,
        "date_of_visit": req.date_of_visit,
        "clinic_name": req.clinic_name,
        "attending_physician": req.doctor_name,
        "chief_complaint": entities.get("chief_complaint", "N/A"),
        "diagnosis": entities.get("diagnosis", "N/A"),
        "symptoms": entities.get("symptoms", []),
        "investigations_ordered": entities.get("tests_recommended", []),
        "treatment_provided": soap.get("plan", "See SOAP note for details"),
        "prescribed_medications": prescription,
        "icd_codes": icd,
        "follow_up_plan": followups,
        "ai_disclaimer": result.get("ai_disclaimer", "AI Generated — Requires Doctor Review"),
        "generated_at": "2026-03-08",
    }

    return {"report": report}


@app.post("/billing_codes")
async def billing_codes(req: BillingCodeRequest):
    """Generate suggested CPT and ICD billing codes based on job result."""
    job = _jobs.get(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{req.job_id}' not found.")
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job is not yet completed.")

    result = job.get("result", {})
    entities = result.get("extracted_entities", {})
    icd_codes = result.get("icd_codes", [])
    diagnosis = entities.get("diagnosis", "")
    medications = entities.get("medications", [])
    symptoms = entities.get("symptoms", [])
    minutes = req.consultation_minutes

    complexity = "low"
    if len(symptoms) > 3 or len(medications) > 2:
        complexity = "moderate"
    if len(symptoms) > 6 or len(medications) > 4:
        complexity = "high"

    em_map = {
        "low": {"code": "99213", "level": "Level 3", "desc": "Established patient, low medical decision making"},
        "moderate": {"code": "99214", "level": "Level 4", "desc": "Established patient, moderate medical decision making"},
        "high": {"code": "99215", "level": "Level 5", "desc": "Established patient, high medical decision making"},
    }

    em = em_map[complexity]

    return {
        "em_code": em,
        "icd10_codes": icd_codes,
        "justification": {
            "consultation_minutes": minutes,
            "complexity": complexity,
            "symptoms_reviewed": len(symptoms),
            "medications_managed": len(medications),
            "diagnosis": diagnosis,
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# Background Task
# ─────────────────────────────────────────────────────────────────────────────

def _run_workflow(job_id: str, job: dict):
    """Execute the LangGraph workflow synchronously in a background thread."""
    try:
        initial_state = {
            "audio_path": job["audio_path"],
            "patient_name": job["patient_name"],
            "consultation_id": job_id,
            "errors": [],
        }
        logger.info(f"Starting workflow for job={job_id}")
        final_state = clinical_workflow.invoke(initial_state)

        result = {
            "transcript": final_state.get("transcript", ""),
            "extracted_entities": final_state.get("extracted_entities", {}),
            "soap_note": final_state.get("soap_note", {}),
            "icd_codes": final_state.get("icd_codes", []),
            "prescription": final_state.get("prescription", []),
            "drug_interactions": final_state.get("drug_interactions", []),
            "patient_summary": final_state.get("patient_summary", ""),
            "followups": final_state.get("followups", []),
            "analytics": final_state.get("analytics", {}),
            "ai_disclaimer": final_state.get(
                "ai_disclaimer", "⚠️ AI Generated — Requires Doctor Review"
            ),
        }

        job["status"] = "completed"
        job["result"] = result
        _set_job(job_id, job)
        logger.info(f"Workflow complete for job={job_id}")

    except Exception as e:
        logger.error(f"Workflow failed for job={job_id}: {e}", exc_info=True)
        job["status"] = "failed"
        job["error"] = str(e)
        _set_job(job_id, job)
