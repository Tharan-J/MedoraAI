# 🏥 MedoraAI — Ambient Clinical Intelligence Platform

> **AI-powered system that converts doctor–patient consultation audio into a complete, structured clinical record — automatically.**

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_Pipeline-8B5CF6)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-EA4335?logo=google&logoColor=white)
![Whisper](https://img.shields.io/badge/Faster--Whisper-ASR-00A67E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

---

## ⚠️ Medical Disclaimer

**All AI-generated outputs require review by a licensed physician before clinical use.**  
MedoraAI is built as a productivity tool for healthcare professionals and is not certified as a medical device or diagnostic system.

---

## 🎯 What MedoraAI Does

Upload or record a doctor–patient consultation and MedoraAI's 9-agent pipeline automatically produces:

| Input | Outputs |
|-------|---------|
| Audio file (MP3, WAV, M4A, OGG, FLAC, WebM) | ✅ Verbatim transcript |
| Live microphone recording | ✅ SOAP clinical note (Subjective · Objective · Assessment · Plan) |
| | ✅ Structured clinical entity extraction |
| | ✅ ICD-11 diagnosis codes |
| | ✅ Prescription plan with drug interactions |
| | ✅ Patient-friendly visit summary |
| | ✅ Follow-up reminders |
| | ✅ Insurance-ready report |
| | ✅ CPT / E&M smart billing codes |
| | ✅ Clinic-wide analytics |

---

## 🏗️ System Architecture

```
Audio / Microphone Input
          ↓
  ┌──────────────────┐
  │ Agent 1          │  faster-whisper (local CPU)
  │ Transcription    │  → verbatim transcript
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ Agent 2          │  Gemini 1.5 Flash — ONE LLM call
  │ Clinical         │  → chief_complaint, symptoms, diagnosis,
  │ Extraction       │     medications, tests, follow-up date …
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ Agent 3          │  Zero LLM tokens — pure template fill
  │ SOAP Generator   │  → Subjective / Objective / Assessment / Plan
  └────────┬─────────┘
           ↓ (parallel fan-out via LangGraph)
  ┌────────┼─────────────────┐
  ↓        ↓                 ↓
ICD-11   Prescription   Patient Summary
Coding   Builder        Agent (Gemini)
  ↓        ↓
         Drug Interaction
         Agent (OpenFDA + Gemini)
              ↓
         Follow-Up Agent
              ↓
         Analytics Agent (SQLite)
```

All agents share a single **`ConsultationState`** TypedDict. Orchestration is handled by **LangGraph** — the parallel branches (ICD, Prescription, Patient Summary) run concurrently for speed.

**Total Gemini API calls per consultation: 2–4**  
The full transcript is sent to the LLM exactly once.

---

## ✨ Features

### 🩺 9-Agent Clinical Pipeline

| # | Agent | Technology | LLM Calls |
|---|-------|--------------|-----------|
| 1 | **Transcription** | `faster-whisper` (local CPU, CTranslate2) | 0 |
| 2 | **Clinical Extraction** | Gemini 1.5 Flash — strict JSON schema | **1** |
| 3 | **SOAP Note Generator** | Template fill — zero LLM tokens | 0 |
| 4 | **ICD-11 Coder** | Local CSV lookup + Gemini fallback | 0–1 |
| 5 | **Prescription Builder** | Pure entity transform | 0 |
| 6 | **Drug Interaction Checker** | OpenFDA REST API + Gemini | 0–1 |
| 7 | **Patient Summary** | Gemini (entity fields only, not full transcript) | **1** |
| 8 | **Follow-Up Generator** | Template fill — zero LLM tokens | 0 |
| 9 | **Analytics Aggregator** | SQLite in-memory | 0 |

### 🖥️ Full-Feature Clinical Dashboard

- **Patient Journey Wizard** — 5-step guided flow (Intake → Consultation → AI Review → Insurance → Prescription)
- **Upload Consultation** — File upload (MP3/WAV/M4A/OGG/FLAC/WebM) or live microphone recording
- **Clinical Notes** — Structured SOAP cards, transcript viewer, entity tiles, prescription pills, ICD chips
- **Red Flag Monitor** — AI scans transcript for clinically concerning symptom combinations
- **Patient Summaries** — Plain-language after-visit summary for the patient
- **Follow-Up Reminders** — AI-generated action items with dates and types
- **Insurance Report** — Pre-filled insurance-ready documentation
- **Smart Billing** — CPT/E&M code suggestions based on medical complexity
- **Analytics** — Consultation duration trends and diagnosis frequency charts

### 🎨 UI / UX

- Premium dark-slate + teal `#00F5D4` design language
- Glassmorphism sidebar with spring-animated active state
- Framer Motion page transitions and micro-animations
- Color-coded SOAP note cards (Blue / Emerald / Violet / Orange)
- Interactive Recharts graphs with pulsing live dots
- Fully scrollable layout with sticky header
- Notifications panel, Provider Settings modal
- Live recording with real-time timer display

---

## 📁 Project Structure

```
MedoraAI/
├── backend/
│   ├── agents/
│   │   ├── base_agent.py             # Abstract base class for all agents
│   │   ├── transcription_agent.py    # faster-whisper ASR (CPU, int8)
│   │   ├── extraction_agent.py       # Gemini clinical entity extraction
│   │   ├── soap_agent.py             # SOAP note template filler
│   │   ├── icd_agent.py              # ICD-11 coding (CSV + Gemini fallback)
│   │   ├── prescription_agent.py     # Prescription builder (zero-LLM)
│   │   ├── drug_interaction_agent.py # OpenFDA API + Gemini verification
│   │   ├── patient_summary_agent.py  # Patient-friendly summary (Gemini)
│   │   ├── followup_agent.py         # Follow-up reminder generator
│   │   └── analytics_agent.py       # SQLite metrics aggregation
│   ├── llm/
│   │   ├── gemini_client.py          # google-genai SDK wrapper
│   │   └── prompts.py                # All LLM prompt templates
│   ├── data/
│   │   ├── icd11_common.csv          # Bundled ICD-11 lookup table
│   │   └── analytics.db              # SQLite analytics DB (auto-created)
│   ├── state.py                      # ConsultationState TypedDict
│   ├── workflow.py                   # LangGraph DAG definition
│   └── main.py                       # FastAPI application & REST endpoints
│
├── medora-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── PatientJourneyTab.tsx   # 5-step guided wizard
│   │   │   │   ├── IntakeTab.tsx           # Patient intake form
│   │   │   │   ├── RedFlagsTab.tsx         # Red flag monitor
│   │   │   │   ├── InsuranceTab.tsx        # Insurance report generator
│   │   │   │   ├── BillingTab.tsx          # Smart billing codes
│   │   │   │   └── PrescriptionBuilderTab.tsx
│   │   │   ├── sections/                   # Landing page sections
│   │   │   └── ui/                         # Reusable UI primitives
│   │   ├── lib/
│   │   │   ├── api.ts                      # Fetch API client
│   │   │   └── mockData.ts                 # Demo data for UI preview
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx               # Main clinical dashboard
│   │   │   ├── LandingPage.tsx             # Marketing / product page
│   │   │   └── SignInPage.tsx              # Authentication page
│   │   ├── index.css                       # Design system & Tailwind theme
│   │   └── main.tsx                        # React entry point
│   ├── package.json
│   └── vite.config.ts
│
├── uploads/                          # Uploaded audio files (auto-created)
├── run_server.py                     # Backend server entrypoint
├── requirements.txt                  # Python dependencies
└── .env                              # Environment variables
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** — [Get one free at Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Tharan-J/MedoraAI.git
cd MedoraAI
```

### 2. Configure Environment

Edit the `.env` file in the project root:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
WHISPER_MODEL=base
HOST=0.0.0.0
PORT=8000
```

> 💡 Use `WHISPER_MODEL=tiny` for the fastest startup (~75MB model download on first run).

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

> **First run note:** `faster-whisper` downloads the selected model on first audio upload (~140MB for `base`). This is cached for subsequent runs.

### 4. Start the Backend

```bash
python run_server.py
```

- API available at: **http://localhost:8000**
- Interactive Swagger docs: **http://localhost:8000/docs**

### 5. Start the Frontend

```bash
cd medora-frontend
npm install       # first time only
npm run dev
```

- App available at: **http://localhost:5173** (or next available port)

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — confirms server is running |
| `POST` | `/upload_audio` | Upload audio file (`multipart/form-data`: `file`, `patient_name`) |
| `POST` | `/generate_note?job_id=...` | Trigger the 9-agent pipeline for an uploaded file |
| `GET` | `/status/{job_id}` | Poll job status (`uploaded` → `processing` → `completed` / `failed`) |
| `GET` | `/analytics` | Aggregate clinic analytics across all processed consultations |
| `POST` | `/detect_redflags` | Scan a transcript for clinical red flags via Gemini |
| `POST` | `/insurance_report` | Generate insurance documentation for a completed job |
| `POST` | `/billing_codes` | Suggest CPT/E&M billing codes based on complexity |

### Example: Upload & Process

```bash
# 1. Upload audio
curl -X POST http://localhost:8000/upload_audio \
  -F "file=@consultation.mp3" \
  -F "patient_name=John Smith"
# → { "job_id": "abc-123", "status": "uploaded" }

# 2. Trigger pipeline
curl -X POST "http://localhost:8000/generate_note?job_id=abc-123"

# 3. Poll until completed
curl http://localhost:8000/status/abc-123
# → { "status": "completed", "result": { ... } }
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | REST API framework | ≥0.111 |
| **Uvicorn** | ASGI server with hot-reload | ≥0.30 |
| **LangGraph** | Multi-agent DAG orchestration | ≥0.1.14 |
| **LangChain** | Agent base utilities | ≥0.2.6 |
| **google-genai** | Gemini 1.5 Flash LLM API | ≥1.0.0 |
| **faster-whisper** | Local speech-to-text (CTranslate2) | ≥1.1.0 |
| **Pydantic** | Data validation & serialization | ≥2.7 |
| **python-dotenv** | Environment variable loading | ≥1.0 |
| **requests** | OpenFDA HTTP calls | ≥2.32 |
| **SQLite** | Analytics persistence (stdlib) | built-in |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 19 |
| **Vite** | Build tool & dev server | 7 |
| **TypeScript** | Type safety | ~5.9 |
| **Tailwind CSS v4** | Utility-first styling | 4.x |
| **Framer Motion** | Animations & transitions | 12 |
| **Recharts** | Analytics charts | 3 |
| **Lucide React** | Icon library | 0.577 |
| **React Router DOM** | Client-side routing | 7 |
| **react-dom** | React rendering | 19 |

---

## ⚙️ Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |
| `WHISPER_MODEL` | `base` | Whisper model size: `tiny` · `base` · `small` · `medium` · `large` |
| `HOST` | `0.0.0.0` | Backend server bind address |
| `PORT` | `8000` | Backend server port |

---

## 💡 Token Optimization

MedoraAI is designed to minimise API costs while maximising output quality:

| Agent | LLM Strategy | Tokens Used |
|-------|-------------|-------------|
| Transcription | Local Whisper (zero API) | **0** |
| Clinical Extraction | Single Gemini call with strict JSON schema | Full transcript (once) |
| SOAP Note | Pure template fill from extracted entities | **0** |
| ICD-11 Coding | Local CSV lookup first, Gemini fallback only if no match | Diagnosis string only |
| Prescription | Direct entity transform from extraction output | **0** |
| Drug Interaction | OpenFDA API first (free), Gemini only if needed | Drug names only |
| Patient Summary | Gemini on entity fields (not transcript) | Entity JSON only |
| Follow-Up | Template fill from entities | **0** |
| Analytics | SQLite aggregation | **0** |

**Result: 2–4 LLM calls total per consultation. The full transcript is sent to Gemini exactly once.**

---

## 🗂️ Dashboard Tabs

| Tab | What It Shows |
|-----|--------------|
| **Dashboard** | Welcome screen, KPI metrics (time saved, consultations processed, action items) |
| **Patient Journey** | 5-step wizard: Intake form → Audio upload → AI Review → Insurance → Prescription |
| **Upload Consultation** | File picker or live microphone recording with real-time timer |
| **Clinical Notes** | SOAP cards, transcript, clinical impression tiles, prescription pills, ICD chips, drug interactions |
| **Red Flag Monitor** | AI scans for concerning symptom patterns with severity ratings |
| **Patient Summaries** | Patient-friendly plain-language visit report |
| **Follow-Ups** | Action items with type badges and suggested dates |
| **Insurance Report** | Pre-filled insurance documentation ready to print |
| **Smart Billing** | CPT/E&M code suggestions with complexity justification |
| **Analytics** | Consultation duration line chart, diagnosis frequency bar chart |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source. See [LICENSE](LICENSE) for details.

---

*Built by the MedoraAI team · All clinical outputs are AI-generated and require physician verification before use.*
