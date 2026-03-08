# 🏥 Ambient Clinical Note Generator

> **Healthcare Hackathon Project** — AI-powered system that converts doctor–patient consultation audio into structured clinical documentation automatically.

![AI Generated](https://img.shields.io/badge/AI-Powered-blue) ![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-violet) ![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-orange)

---

## ⚠️ Medical Disclaimer

**All AI-generated outputs require review by a licensed physician before clinical use.** This system is a prototype built for a healthcare hackathon and is not certified for production clinical environments.

---

## 🎯 What It Does

| Input | Output |
|---|---|
| Consultation audio file | ✅ Verbatim transcript |
| (MP3, WAV, M4A, OGG) | ✅ SOAP clinical note |
| | ✅ ICD-11 code suggestions |
| | ✅ Structured prescription |
| | ✅ Drug interaction warnings |
| | ✅ Patient-friendly summary |
| | ✅ Follow-up reminders |
| | ✅ Clinic analytics |

---

## 🏗️ Architecture

```
Audio Input
     ↓
[Agent 1] Transcription Agent  ← OpenAI Whisper ASR
     ↓
[Agent 2] Clinical Extraction Agent  ← Gemini 1.5 Flash (JSON schema)
     ↓
[Agent 3] SOAP Note Generator  ← Template fill (zero LLM tokens)
     ↓
     ├──[Agent 4] ICD-11 Coding Agent  ← Local CSV + Gemini fallback
     ├──[Agent 5] Prescription Agent   ← Pure transform (zero LLM)
     └──[Agent 7] Patient Summary Agent ← Gemini (entities only)
              ↓
     [Agent 6] Drug Interaction Agent  ← OpenFDA API + Gemini
              ↓
     [Agent 8] Follow-Up Agent         ← Template fill (zero LLM)
              ↓
     [Agent 9] Analytics Agent         ← SQLite aggregation
```

All agents share a single `ConsultationState` TypedDict object. Orchestration is handled by **LangGraph**.

---

## 📁 Project Structure

```
smartconvo/
├── backend/
│   ├── agents/
│   │   ├── base_agent.py          # Abstract base for all agents
│   │   ├── transcription_agent.py # Whisper ASR
│   │   ├── extraction_agent.py    # Gemini clinical entity extraction
│   │   ├── soap_agent.py          # SOAP note template filler
│   │   ├── icd_agent.py           # ICD-11 coding (local + Gemini)
│   │   ├── prescription_agent.py  # Prescription builder
│   │   ├── drug_interaction_agent.py # OpenFDA + Gemini
│   │   ├── patient_summary_agent.py  # Patient-friendly summary
│   │   ├── followup_agent.py      # Reminder generator
│   │   └── analytics_agent.py     # SQLite metrics
│   ├── llm/
│   │   ├── gemini_client.py       # Google Gemini API wrapper
│   │   └── prompts.py             # All LLM prompt templates
│   ├── data/
│   │   ├── icd11_common.csv       # Bundled ICD-11 lookup table
│   │   └── analytics.db           # SQLite analytics database (auto-created)
│   ├── state.py                   # ConsultationState TypedDict
│   ├── workflow.py                # LangGraph DAG definition
│   └── main.py                    # FastAPI application
├── frontend/                      # Next.js 15 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout + metadata
│   │   │   ├── page.tsx           # Main SPA page
│   │   │   └── globals.css        # Design system CSS
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Navigation
│   │   │   ├── HomePage.tsx       # Landing page
│   │   │   ├── AudioUpload.tsx    # File upload with drag-and-drop
│   │   │   ├── ProcessingStatus.tsx # Pipeline progress
│   │   │   ├── ResultsDashboard.tsx # All 7 output tabs
│   │   │   └── AnalyticsDashboard.tsx # Charts & metrics
│   │   ├── lib/
│   │   │   └── api.ts             # Axios API client
│   │   └── types/
│   │       └── api.ts             # TypeScript response types
│   └── .env.local                 # Frontend env vars
├── demo.py                        # CLI demo (real audio or mock)
├── run_server.py                  # Backend server entrypoint
├── requirements.txt               # Python dependencies
├── start_backend.ps1              # Windows: start backend
├── start_frontend.ps1             # Windows: start frontend
└── .env.example                   # Environment variable template
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (free tier available)

### 1. Clone & Setup

```powershell
cd d:\smartconvo
```

### 2. Configure Environment

```powershell
Copy-Item .env.example .env
# Edit .env and set your GEMINI_API_KEY
```

### 3. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

> **Note on Whisper:** First run downloads the Whisper `base` model (~140MB). Use `WHISPER_MODEL=tiny` in `.env` for fastest startup.

### 4. Start Backend

```powershell
.\start_backend.ps1
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 5. Start Frontend

```powershell
# In a second terminal
.\start_frontend.ps1
# App available at http://localhost:3000
```

---

## 🧪 CLI Demo (No Frontend Needed)

Test the full pipeline without any audio file using a built-in mock transcript:

```powershell
python demo.py --mock --patient "John Smith"
```

With a real audio file:

```powershell
python demo.py --audio path/to/consultation.mp3 --patient "Jane Doe"
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/upload_audio` | Upload audio file (`multipart/form-data`) |
| `POST` | `/generate_note?job_id=...` | Trigger workflow for uploaded file |
| `GET` | `/status/{job_id}` | Poll job status and result |
| `GET` | `/analytics` | Aggregate clinic analytics |

Full interactive docs: **http://localhost:8000/docs**

---

## 💡 Token Optimization Strategy

| Agent | LLM Calls | Tokens Sent |
|-------|-----------|-------------|
| Transcription | 0 | 0 (Whisper, local) |
| Clinical Extraction | **1** | Transcript (once only) |
| SOAP Note Generator | 0 | 0 (template fill) |
| ICD-11 Coding | 0–1 | Diagnosis string only |
| Prescription | 0 | 0 (transform) |
| Drug Interaction | 0–1 | Drug names only |
| Patient Summary | **1** | Entity fields only |
| Follow-Up | 0 | 0 (template fill) |
| Analytics | 0 | 0 (SQLite) |

**Total LLM calls per consultation: 2–4.** The full transcript is sent to the LLM exactly once.

---

## 🎨 Frontend Features

- 🌙 **Dark mode** premium design with glassmorphism cards
- 🎙️ **Drag-and-drop** audio upload with format validation
- ⚡ **Real-time polling** with animated pipeline progress
- 📋 **Tabbed results** view covering all 7 output types
- 📊 **Analytics charts** using Recharts with gradient bars
- 📱 **Responsive layout** with sidebar navigation

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Model name |
| `WHISPER_MODEL` | `base` | `tiny`/`base`/`small`/`medium` |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |

---

## 🛠️ Built With

| Component | Technology |
|-----------|-----------|
| LLM | Google Gemini 1.5 Flash |
| Agent Orchestration | LangGraph + LangChain |
| Speech-to-Text | OpenAI Whisper (local) |
| Drug Interactions | OpenFDA REST API |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 15 + TypeScript |
| Styling | Vanilla CSS + Recharts |
| Database | SQLite (analytics) |

---

*Built for the Healthcare Hackathon 2026 · All clinical outputs are AI-generated and require physician verification.*
