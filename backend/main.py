"""
FastAPI Application Entry Point
Exposes REST endpoints for audio upload, note generation, and analytics.
"""

import os
import uuid
import shutil
import logging
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.workflow import clinical_workflow
from backend.agents.analytics_agent import AnalyticsAgent

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("api")

# ── Directories ───────────────────────────────────────────────────────────────
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ambient Clinical Note Generator API",
    description="Agentic AI system that converts consultation audio into structured clinical documentation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── In-memory job store (use Redis/DB in production) ──────────────────────────
_jobs: dict[str, dict] = {}


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "Ambient Clinical Note Generator"}


@app.post("/upload_audio")
async def upload_audio(
    file: UploadFile = File(...),
    patient_name: str = Form(default="Anonymous"),
    background_tasks: BackgroundTasks = None,
):
    """
    Upload a consultation audio file.
    Returns a job_id that can be used to track processing progress.
    Supported formats: .mp3, .wav, .m4a, .ogg, .flac
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

    # Store initial job record
    _jobs[job_id] = {
        "status": "uploaded",
        "patient_name": patient_name,
        "audio_path": str(dest_path),
        "result": None,
        "error": None,
    }

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
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] == "processing":
        return {"job_id": job_id, "status": "already_processing"}

    job["status"] = "processing"
    background_tasks.add_task(_run_workflow, job_id, job)

    return {"job_id": job_id, "status": "processing"}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    """Poll the status and result of a processing job."""
    job = _jobs.get(job_id)
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
        job["status"] = "completed"
        job["result"] = {
            "transcript": final_state.get("transcript", ""),
            "extracted_entities": final_state.get("extracted_entities", {}),
            "soap_note": final_state.get("soap_note", {}),
            "icd_codes": final_state.get("icd_codes", []),
            "prescription": final_state.get("prescription", []),
            "drug_interactions": final_state.get("drug_interactions", []),
            "patient_summary": final_state.get("patient_summary", ""),
            "followups": final_state.get("followups", []),
            "analytics": final_state.get("analytics", {}),
            "ai_disclaimer": final_state.get("ai_disclaimer", "⚠️ AI Generated — Requires Doctor Review"),
        }
        logger.info(f"Workflow complete for job={job_id}")
    except Exception as e:
        logger.error(f"Workflow failed for job={job_id}: {e}", exc_info=True)
        job["status"] = "failed"
        job["error"] = str(e)
