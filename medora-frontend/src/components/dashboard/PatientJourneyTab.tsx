import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Mic, Radio, StopCircle, UploadCloud, FileText, AlertTriangle,
    HeartPulse, Pill, CheckCircle2, ChevronRight, ChevronLeft, Loader2,
    CheckSquare, Square, ShieldCheck, TriangleAlert, Download
} from "lucide-react"
import { uploadAudio, generateNote, pollStatus } from "@/lib/api"
import { MOCK_SCAN_RESULT, MOCK_JOB_ID, MOCK_INTAKE, MOCK_RED_FLAGS, MOCK_INSURANCE_REPORT, MOCK_RX } from "@/lib/mockData"

const API = "http://localhost:8000"

// ── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
    { id: 0, title: "Patient Intake", icon: User, desc: "Personal & medical history" },
    { id: 1, title: "Consultation", icon: Mic, desc: "Upload or record audio" },
    { id: 2, title: "AI Review", icon: FileText, desc: "Clinical notes & red flags" },
    { id: 3, title: "Insurance", icon: HeartPulse, desc: "AI-generated insurance report" },
    { id: 4, title: "Prescription", icon: Pill, desc: "Final Rx builder" },
]

// ── Data Presets ─────────────────────────────────────────────────────────────
const DISEASE_OPTIONS = ["Hypertension", "Diabetes Type 2", "Asthma", "GERD", "Hypothyroidism", "Arthritis", "Heart Disease", "COPD", "Depression"]
const DRUG_ALLERGY_OPTIONS = ["Penicillin", "Sulfa drugs", "NSAIDs", "Aspirin", "Latex"]
const FOOD_ALLERGY_OPTIONS = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Soy"]
const FREQ_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Every 6h", "Every 8h", "Every 12h", "As needed (PRN)", "At bedtime"]
const DURATION_OPTIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "30 days", "PRN", "Ongoing"]

const RX_TEMPLATES: Record<string, Array<{ drug: string; dose: string; frequency: string; duration: string; instruction: string }>> = {
    "Common Cold": [
        { drug: "Paracetamol", dose: "500mg", frequency: "Every 6h", duration: "3 days", instruction: "Take after food" },
        { drug: "Cetirizine", dose: "10mg", frequency: "At bedtime", duration: "5 days", instruction: "May cause drowsiness" },
    ],
    "Hypertension": [
        { drug: "Amlodipine", dose: "5mg", frequency: "Once daily", duration: "30 days", instruction: "Morning, monitor BP" },
    ],
    "Diabetes": [
        { drug: "Metformin", dose: "500mg", frequency: "Twice daily", duration: "30 days", instruction: "With meals" },
    ],
    "GERD": [
        { drug: "Omeprazole", dose: "20mg", frequency: "Once daily", duration: "14 days", instruction: "Before breakfast" },
    ],
}

// ── Sub-components ───────────────────────────────────────────────────────────
const CheckChip = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${checked ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-[#64748B] border-gray-200 hover:border-gray-400"}`}>
        {checked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        {label}
    </button>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">{label}</label>
        {children}
    </div>
)

const TextInput = ({ value, onChange, placeholder = "", type = "text" }: any) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] focus:ring-2 focus:ring-[#00F5D4]/10 transition-all text-[#0F172A] font-medium" />
)

const SelectInput = ({ value, onChange, options }: any) => (
    <select value={value} onChange={onChange}
        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] font-medium">
        {options.map((o: string) => <option key={o}>{o}</option>)}
    </select>
)

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
    providerName: string
}

export default function PatientJourneyTab({ providerName }: Props) {
    const [step, setStep] = useState(2)  // Start at AI Review for demo impact

    // Step 1: Intake — pre-filled with demo patient
    const [intake, setIntake] = useState(MOCK_INTAKE)

    // Step 2: Audio / Transcription — pre-loaded with demo result
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [jobId, setJobId] = useState<string | null>(MOCK_JOB_ID)       // demo
    const [scanResult, setScanResult] = useState<any>(MOCK_SCAN_RESULT)  // demo
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Step 3: AI Review — pre-loaded with demo red flags
    const [redFlags, setRedFlags] = useState<any[]>(MOCK_RED_FLAGS)
    const [rfLoading, setRfLoading] = useState(false)
    const [rfRan, setRfRan] = useState(true)  // already scanned in demo

    // Step 4: Insurance — pre-loaded with demo report
    const [insuranceReport, setInsuranceReport] = useState<any>(MOCK_INSURANCE_REPORT)
    const [insLoading, setInsLoading] = useState(false)

    // Step 5: Prescription — pre-loaded with demo Rx
    const [rxItems, setRxItems] = useState(MOCK_RX as Array<{ drug: string; dose: string; frequency: string; duration: string; instruction: string }>)

    // ── Audio Logic ──────────────────────────────────────────────────────────
    const processAudioFile = async (file: File) => {
        setIsProcessing(true)
        setScanResult(null)
        try {
            const uploadRes = await uploadAudio(file, intake.name || "Anonymous")
            const newJobId = uploadRes.job_id
            setJobId(newJobId)
            await generateNote(newJobId)
            const interval = setInterval(async () => {
                const statusInfo = await pollStatus(newJobId)
                if (statusInfo.status === "completed") {
                    clearInterval(interval)
                    setScanResult(statusInfo.result)
                    setIsProcessing(false)
                    // Auto-populate Rx from prescription
                    if (Array.isArray(statusInfo.result?.prescription)) {
                        const autoRx = statusInfo.result.prescription.map((rx: any) =>
                            typeof rx === "string"
                                ? { drug: rx, dose: "", frequency: "Once daily", duration: "7 days", instruction: "" }
                                : { drug: rx?.medication || rx?.drug_name || "", dose: rx?.dosage || "", frequency: rx?.frequency || "Once daily", duration: rx?.duration || "7 days", instruction: "" }
                        )
                        setRxItems(autoRx)
                    }
                } else if (statusInfo.status === "failed") {
                    clearInterval(interval)
                    setIsProcessing(false)
                }
            }, 2500)
        } catch {
            setIsProcessing(false)
        }
    }

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []
        mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            processAudioFile(new File([blob], "live.webm", { type: "audio/webm" }))
            stream.getTracks().forEach(t => t.stop())
        }
        mediaRecorderRef.current.start()
        setIsRecording(true)
        setRecordingTime(0)
        timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setIsRecording(false)
        clearInterval(timerRef.current)
    }

    const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

    // ── Red Flag Detection ───────────────────────────────────────────────────
    const runRedFlags = async () => {
        if (!scanResult?.transcript) return
        setRfLoading(true)
        try {
            const res = await fetch(`${API}/detect_redflags`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript: scanResult.transcript })
            })
            const data = await res.json()
            setRedFlags(data.red_flags || [])
            setRfRan(true)
        } catch { /* ignore */ }
        setRfLoading(false)
    }

    // ── Insurance Report ─────────────────────────────────────────────────────
    const generateInsurance = async () => {
        if (!jobId) return
        setInsLoading(true)
        try {
            const res = await fetch(`${API}/insurance_report`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    job_id: jobId,
                    patient_name: intake.name || "Anonymous",
                    patient_age: intake.age,
                    date_of_visit: intake.dateOfVisit,
                    clinic_name: intake.clinicName,
                    doctor_name: providerName
                })
            })
            const data = await res.json()
            setInsuranceReport(data.report)
        } catch { /* ignore */ }
        setInsLoading(false)
    }

    // ── Rx Helpers ───────────────────────────────────────────────────────────
    const addRxItem = () => setRxItems(p => [...p, { drug: "", dose: "", frequency: "Once daily", duration: "7 days", instruction: "" }])
    const updateRx = (i: number, field: string, val: string) => setRxItems(p => p.map((rx, idx) => idx === i ? { ...rx, [field]: val } : rx))
    const removeRx = (i: number) => setRxItems(p => p.filter((_, idx) => idx !== i))

    // ── Intake toggle helper ─────────────────────────────────────────────────
    const toggleArr = (field: "diseases" | "drugAllergies" | "foodAllergies", val: string) =>
        setIntake(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }))

    const canProceed = () => {
        if (step === 0) return intake.name.trim().length > 0
        if (step === 1) return !!scanResult
        return true
    }

    // ── Step Progress Bar ────────────────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Progress Header */}
            <div>
                <h2 className="font-serif text-4xl text-[#0F172A] mb-6">Patient Journey</h2>
                <div className="flex items-center gap-0">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center flex-1 last:flex-none">
                            <button onClick={() => { if (i <= step || (i === step + 1 && canProceed())) setStep(i) }}
                                className={`flex flex-col items-center gap-1 w-full transition-all`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${i < step ? "bg-[#00F5D4] border-[#00F5D4] text-[#0F172A]" : i === step ? "bg-[#0F172A] border-[#0F172A] text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                                    {i < step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-bold hidden md:block ${i === step ? "text-[#0F172A]" : i < step ? "text-[#00F5D4]" : "text-gray-400"}`}>{s.title}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-[#00F5D4]" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                    {/* ─── STEP 0: PATIENT INTAKE ─────────────────────────────────────── */}
                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                                <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><User className="w-5 h-5 text-[#00F5D4]" /> Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Patient Full Name *">
                                        <TextInput value={intake.name} onChange={(e: any) => setIntake(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
                                    </Field>
                                    <Field label="Age"><TextInput type="number" value={intake.age} onChange={(e: any) => setIntake(f => ({ ...f, age: e.target.value }))} placeholder="42" /></Field>
                                    <Field label="Gender"><SelectInput value={intake.gender} onChange={(e: any) => setIntake(f => ({ ...f, gender: e.target.value }))} options={["Male", "Female", "Non-binary", "Prefer not to say"]} /></Field>
                                    <Field label="Contact"><TextInput value={intake.contact} onChange={(e: any) => setIntake(f => ({ ...f, contact: e.target.value }))} placeholder="+1 555 0000" /></Field>
                                    <Field label="Date of Visit"><TextInput type="date" value={intake.dateOfVisit} onChange={(e: any) => setIntake(f => ({ ...f, dateOfVisit: e.target.value }))} /></Field>
                                    <Field label="Clinic Name"><TextInput value={intake.clinicName} onChange={(e: any) => setIntake(f => ({ ...f, clinicName: e.target.value }))} /></Field>
                                </div>
                                <Field label="Chief Complaint">
                                    <textarea value={intake.chiefComplaint} onChange={e => setIntake(f => ({ ...f, chiefComplaint: e.target.value }))} rows={2}
                                        placeholder="Primary reason for today's visit..."
                                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                                </Field>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                                <h3 className="font-bold text-[#0F172A]">Medical History</h3>
                                <Field label="Existing Diagnoses">
                                    <div className="flex flex-wrap gap-2 mt-1">{DISEASE_OPTIONS.map(d => <CheckChip key={d} label={d} checked={intake.diseases.includes(d)} onClick={() => toggleArr("diseases", d)} />)}</div>
                                </Field>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Previous Surgeries">
                                        <textarea value={intake.surgeries} onChange={e => setIntake(f => ({ ...f, surgeries: e.target.value }))} rows={2} placeholder="e.g. Appendectomy 2018..." className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                                    </Field>
                                    <Field label="Family History">
                                        <textarea value={intake.familyHistory} onChange={e => setIntake(f => ({ ...f, familyHistory: e.target.value }))} rows={2} placeholder="e.g. Father: Hypertension..." className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                                    </Field>
                                </div>
                                <Field label="Current Medications">
                                    <TextInput value={intake.currentMedications} onChange={(e: any) => setIntake(f => ({ ...f, currentMedications: e.target.value }))} placeholder="Metformin 500mg, Lisinopril 10mg..." />
                                </Field>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                                <h3 className="font-bold text-[#0F172A]">Allergies & Lifestyle</h3>
                                <Field label="Drug Allergies">
                                    <div className="flex flex-wrap gap-2 mt-1">{DRUG_ALLERGY_OPTIONS.map(a => <CheckChip key={a} label={a} checked={intake.drugAllergies.includes(a)} onClick={() => toggleArr("drugAllergies", a)} />)}</div>
                                </Field>
                                <Field label="Food Allergies">
                                    <div className="flex flex-wrap gap-2 mt-1">{FOOD_ALLERGY_OPTIONS.map(a => <CheckChip key={a} label={a} checked={intake.foodAllergies.includes(a)} onClick={() => toggleArr("foodAllergies", a)} />)}</div>
                                </Field>
                                <div className="grid grid-cols-3 gap-5">
                                    <Field label="Smoking"><SelectInput value={intake.smoking} onChange={(e: any) => setIntake(f => ({ ...f, smoking: e.target.value }))} options={["No", "Former smoker", "Active smoker"]} /></Field>
                                    <Field label="Alcohol"><SelectInput value={intake.alcohol} onChange={(e: any) => setIntake(f => ({ ...f, alcohol: e.target.value }))} options={["No", "Social", "Regular"]} /></Field>
                                    <Field label="Exercise"><SelectInput value={intake.exercise} onChange={(e: any) => setIntake(f => ({ ...f, exercise: e.target.value }))} options={["Daily", "3-4x/week", "Occasionally", "Sedentary"]} /></Field>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 1: CONSULTATION AUDIO ─────────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={e => { if (e.target.files?.[0]) processAudioFile(e.target.files[0]) }} />
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-[#00F5D4]/20 flex items-center justify-center">
                                        <span className="text-[#0F172A] font-bold text-sm">1</span>
                                    </div>
                                    <h3 className="font-bold text-[#0F172A]">Patient: <span className="text-[#00F5D4]">{intake.name || "Anonymous"}</span></h3>
                                </div>
                                <p className="text-sm text-[#64748B] mb-8">Upload or record the consultation audio. AI will auto-fill clinical notes, diagnosis, and prescriptions.</p>
                                {isProcessing ? (
                                    <div className="flex flex-col items-center py-16">
                                        <Loader2 className="w-12 h-12 text-[#00F5D4] animate-spin mb-4" />
                                        <p className="font-serif text-2xl text-[#0F172A] mb-2">AI Processing Consultation</p>
                                        <p className="text-sm text-[#64748B]">Running 9-agent clinical pipeline... this may take a moment.</p>
                                        <div className="mt-6 flex gap-2 text-xs text-[#64748B]">
                                            {["Transcribing", "Extracting", "SOAP", "ICD-11", "Prescriptions", "Interactions", "Summary"].map((s, i) => (
                                                <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F1F5F9] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]"></span>{s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : scanResult ? (
                                    <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                                        <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-green-800">Consultation Processed Successfully</p>
                                            <p className="text-sm text-green-600 mt-0.5">AI has generated SOAP notes, diagnosis, ICD codes, prescriptions and more. Continue to review.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                                        <div onClick={() => fileInputRef.current?.click()}
                                            className="relative overflow-hidden w-56 h-56 rounded-[2.5rem] bg-gradient-to-b from-cyan-300 to-blue-500 shadow-[0_20px_40px_-10px_rgba(0,245,212,0.4)] border-4 border-white cursor-pointer hover:scale-[1.03] active:scale-95 transition-all flex flex-col items-center justify-center group">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} className="absolute top-[40%] left-[-50%] w-[200%] h-[200%] bg-white/20 rounded-[45%]" />
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-[0_0_20px_#00F5D4] transition-shadow">
                                                    <UploadCloud className="w-7 h-7 text-cyan-500" />
                                                </div>
                                                <span className="font-serif text-2xl text-[#0F172A]">Upload File</span>
                                            </div>
                                        </div>
                                        <div className="text-[#64748B] font-bold text-sm">OR</div>
                                        <div onClick={isRecording ? stopRecording : startRecording}
                                            className={`relative overflow-hidden w-56 h-56 rounded-[2.5rem] border-4 border-white cursor-pointer hover:scale-[1.03] active:scale-95 transition-all flex flex-col items-center justify-center group shadow-[0_20px_40px_-10px_rgba(167,139,250,0.4)] ${isRecording ? "bg-gradient-to-b from-red-400 to-rose-600" : "bg-gradient-to-b from-purple-400 to-violet-600"}`}>
                                            <motion.div animate={{ rotate: -360 }} transition={{ duration: isRecording ? 5 : 16, repeat: Infinity, ease: "linear" }} className="absolute top-[42%] left-[-50%] w-[200%] h-[200%] bg-white/25 rounded-[43%]" />
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-lg ${isRecording ? "bg-red-50" : "bg-white"}`}>
                                                    {isRecording ? <StopCircle className="w-7 h-7 text-red-500 animate-pulse" /> : <Radio className="w-7 h-7 text-purple-500" />}
                                                </div>
                                                <span className={`font-serif text-2xl ${isRecording ? "text-white" : "text-[#0F172A]"}`}>
                                                    {isRecording ? fmtTime(recordingTime) : "Record Live"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 2: AI CLINICAL REVIEW ─────────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* SOAP Note */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><FileText className="w-5 h-5 text-[#00F5D4]" /> AI-Generated SOAP Note</h3>
                                    <span className="text-xs font-bold bg-[#0F172A] text-white px-3 py-1 rounded-full">Clinical Extraction Agent</span>
                                </div>
                                {scanResult?.soap_note ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {Object.entries(scanResult.soap_note).map(([k, v]) => (
                                            <div key={k} className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100">
                                                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">{k}</p>
                                                <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">{String(v)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-[#64748B]">No SOAP note generated. Process audio in Step 2.</p>}
                            </div>

                            {/* Diagnosis + ICD codes */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#00F5D4]" /> Diagnosis & ICD Codes</h3>
                                    {scanResult?.extracted_entities?.diagnosis && (
                                        <p className="font-semibold text-[#0F172A] mb-4">{scanResult.extracted_entities.diagnosis}</p>
                                    )}
                                    <div className="space-y-2">
                                        {Array.isArray(scanResult?.icd_codes) && scanResult.icd_codes.length > 0 ? (
                                            scanResult.icd_codes.map((code: any, i: number) => {
                                                const s = typeof code === "string" ? code : JSON.stringify(code)
                                                const [id, ...rest] = s.split(" ")
                                                return (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                                                        <span className="bg-[#0F172A] text-white px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0">{id}</span>
                                                        <span className="text-sm text-[#0F172A]">{rest.join(" ") || s}</span>
                                                    </div>
                                                )
                                            })
                                        ) : <p className="text-sm text-[#64748B]">No ICD codes detected.</p>}
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <h3 className="font-bold text-[#0F172A] mb-4">Drug Interactions</h3>
                                    {Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0 ? (
                                        scanResult.drug_interactions.map((w: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-red-800">{w.drug_pair || w}</p>
                                                    {w.description && <p className="text-xs text-red-600 mt-0.5">{w.description}</p>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <p className="text-sm text-green-700 font-medium">No drug interactions detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Red Flag Monitor */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Red Flag Monitor</h3>
                                    <button onClick={runRedFlags} disabled={rfLoading || !scanResult?.transcript}
                                        className="h-9 px-5 rounded-full bg-red-600 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-40 hover:bg-red-700 transition-all">
                                        {rfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                        {rfLoading ? "Scanning..." : rfRan ? "Re-scan" : "Scan for Red Flags"}
                                    </button>
                                </div>
                                {rfRan && (
                                    redFlags.length === 0 ? (
                                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            <p className="font-medium text-green-800">No clinical red flags detected in this consultation.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {redFlags.map((rf: any, i: number) => (
                                                <div key={i} className="p-4 border border-red-200 bg-red-50 rounded-2xl">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-bold text-[#0F172A]">⚠ {rf.symptom}</span>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${rf.severity === "HIGH" ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"}`}>{rf.severity}</span>
                                                    </div>
                                                    <p className="text-sm text-[#64748B]">Possible: {rf.possible_conditions?.join(", ")}</p>
                                                    <p className="text-sm text-[#0F172A] mt-1 font-medium">→ {rf.suggested_action}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}
                                {!rfRan && <p className="text-sm text-[#64748B]">Click to scan the transcript for potential clinical red flags using AI.</p>}
                            </div>

                            {/* Patient Summary */}
                            {scanResult?.patient_summary && (
                                <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">🌿 Patient-Friendly Summary</p>
                                    <p className="text-green-800 leading-relaxed">{scanResult.patient_summary}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 3: INSURANCE ──────────────────────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-[#0F172A] flex items-center gap-2 mb-1"><HeartPulse className="w-5 h-5 text-[#00F5D4]" /> Insurance Report</h3>
                                        <p className="text-sm text-[#64748B]">AI pre-fills the insurance document from the consultation. Review and confirm each field.</p>
                                    </div>
                                    <button onClick={generateInsurance} disabled={insLoading || !jobId}
                                        className="h-10 px-6 rounded-full bg-[#0F172A] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-all shrink-0">
                                        {insLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TriangleAlert className="w-4 h-4" />}
                                        {insLoading ? "Generating..." : insuranceReport ? "Regenerate" : "Generate AI Report"}
                                    </button>
                                </div>
                                {!jobId && <p className="text-amber-600 text-sm font-medium p-3 bg-amber-50 rounded-xl">⚠ Process consultation audio in Step 2 to enable insurance report generation.</p>}
                            </div>

                            {insuranceReport && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="bg-[#0F172A] text-white px-8 py-6">
                                        <p className="text-xs text-[#00F5D4] font-bold uppercase tracking-widest mb-1">Insurance Claim Documentation — AI Pre-Filled</p>
                                        <h3 className="font-serif text-2xl">Clinical Visit Summary</h3>
                                    </div>
                                    <div className="p-8 grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                        <div className="space-y-4 md:pr-8">
                                            {[
                                                ["Patient Name", insuranceReport.patient_name],
                                                ["Age", insuranceReport.patient_age],
                                                ["Date of Visit", insuranceReport.date_of_visit],
                                                ["Clinic", insuranceReport.clinic_name],
                                                ["Physician", insuranceReport.attending_physician],
                                                ["Chief Complaint", insuranceReport.chief_complaint],
                                            ].map(([label, val]) => (
                                                <div key={label} className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">{label}</span>
                                                    <span className="text-sm font-semibold text-[#0F172A]">{val || "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-4 md:pl-8 pt-4 md:pt-0">
                                            {[
                                                ["Diagnosis", insuranceReport.diagnosis],
                                                ["Symptoms", Array.isArray(insuranceReport.symptoms) ? insuranceReport.symptoms.join(", ") : insuranceReport.symptoms],
                                                ["Tests Ordered", Array.isArray(insuranceReport.investigations_ordered) ? insuranceReport.investigations_ordered.join(", ") : "—"],
                                                ["ICD Codes", Array.isArray(insuranceReport.icd_codes) ? insuranceReport.icd_codes.join(", ") : insuranceReport.icd_codes],
                                                ["Treatment Plan", insuranceReport.treatment_provided],
                                            ].map(([label, val]) => (
                                                <div key={label} className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">{label}</span>
                                                    <span className="text-sm font-semibold text-[#0F172A]">{val || "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-8 py-4 bg-amber-50 border-t border-amber-100">
                                        <p className="text-xs text-amber-700 font-medium">⚠ {insuranceReport.ai_disclaimer}</p>
                                    </div>
                                    <div className="px-8 py-4 border-t border-gray-100 flex justify-end">
                                        <button onClick={() => window.print()} className="h-10 px-6 rounded-full bg-[#0F172A] text-white text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
                                            <Download className="w-4 h-4" /> Print Insurance Report
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 4: PRESCRIPTION BUILDER ───────────────────────────────── */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><Pill className="w-5 h-5 text-[#00F5D4]" /> Prescription Builder</h3>
                                    <button onClick={() => window.print()} className="h-10 px-5 rounded-full border-2 border-[#0F172A] text-[#0F172A] text-sm font-bold flex items-center gap-2 hover:bg-[#0F172A] hover:text-white transition-all">
                                        <Download className="w-4 h-4" /> Print Rx
                                    </button>
                                </div>
                                {scanResult?.prescription && rxItems.length > 0 && (
                                    <div className="flex items-center gap-2 mb-4 p-3 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 text-[#0F172A]" />
                                        <p className="text-sm font-medium text-[#0F172A]">AI pre-filled {rxItems.length} medication(s) from the consultation — review and adjust below.</p>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Quick-Load Templates</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(RX_TEMPLATES).map(([name, rx]) => (
                                            <button key={name} onClick={() => setRxItems([...rx])}
                                                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium hover:border-[#00F5D4] hover:bg-[#00F5D4]/5 transition-all">
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {rxItems.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                                        <Pill className="w-10 h-10 text-gray-300 mb-3" />
                                        <p className="text-[#64748B]">No medications yet — add or load a template.</p>
                                    </div>
                                ) : (
                                    rxItems.map((rx, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-gray-100">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Pill className="w-4 h-4 text-[#00F5D4] shrink-0" />
                                                    <input value={rx.drug} onChange={e => updateRx(i, "drug", e.target.value)} placeholder="Drug name"
                                                        className="font-bold text-[#0F172A] bg-transparent border-none outline-none text-sm flex-1" />
                                                </div>
                                                <button onClick={() => removeRx(i)} className="text-gray-300 hover:text-red-500 transition-colors ml-4">✕</button>
                                            </div>
                                            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[["Dose", "dose", "500mg"], ["Instructions", "instruction", "After food"]].map(([label, field, ph]) => (
                                                    <div key={field}>
                                                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">{label}</label>
                                                        <input value={(rx as any)[field]} onChange={e => updateRx(i, field, e.target.value)} placeholder={ph}
                                                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]" />
                                                    </div>
                                                ))}
                                                <div>
                                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Frequency</label>
                                                    <select value={rx.frequency} onChange={e => updateRx(i, "frequency", e.target.value)}
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]">
                                                        {FREQ_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Duration</label>
                                                    <select value={rx.duration} onChange={e => updateRx(i, "duration", e.target.value)}
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]">
                                                        {DURATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <button onClick={addRxItem} className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-[#64748B] hover:border-[#00F5D4] hover:text-[#0F172A] transition-all flex items-center justify-center gap-2">
                                    + Add Medication
                                </button>
                            </div>

                            {/* Final Summary Card */}
                            {rxItems.length > 0 && (
                                <div className="bg-[#0F172A] text-white rounded-3xl p-8">
                                    <p className="text-xs text-[#00F5D4] font-bold uppercase tracking-widest mb-4">Prescription Summary — {intake.name || "Patient"}</p>
                                    <div className="space-y-3 font-mono text-sm">
                                        {rxItems.map((rx, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="text-[#00F5D4] font-bold">{i + 1}.</span>
                                                <p><span className="font-bold">{rx.drug}</span> {rx.dose} — {rx.frequency} for {rx.duration}
                                                    {rx.instruction && <span className="text-gray-400"> · {rx.instruction}</span>}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-6">⚠ AI-assisted — Doctor review and sign-off required before dispensing.</p>
                                </div>
                            )}
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    className="h-12 px-6 rounded-full border-2 border-gray-200 text-[#64748B] font-bold flex items-center gap-2 disabled:opacity-30 hover:border-[#0F172A] hover:text-[#0F172A] transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-sm text-[#64748B] font-medium">Step {step + 1} of {STEPS.length}</span>
                {step < STEPS.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                        className="h-12 px-8 rounded-full bg-[#0F172A] text-white font-bold flex items-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-all shadow-lg">
                        {step === 0 ? "Start Consultation" : "Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={() => window.print()} className="h-12 px-8 rounded-full bg-[#00F5D4] text-[#0F172A] font-bold flex items-center gap-2 hover:bg-teal-300 transition-all shadow-lg">
                        <Download className="w-4 h-4" /> Finalize & Export
                    </button>
                )}
            </div>
        </motion.div>
    )
}
