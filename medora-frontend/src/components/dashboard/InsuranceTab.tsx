import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Loader2, Download, Building2, User, Stethoscope } from "lucide-react"

const API = "http://localhost:8000"

interface Props {
    scanResult: any
    jobId: string | null
    providerName: string
}

export default function InsuranceTab({ scanResult, jobId, providerName }: Props) {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [patientAge, setPatientAge] = useState("")
    const [clinicName, setClinicName] = useState("Medora AI Clinic")
    const [dateOfVisit, setDateOfVisit] = useState(new Date().toISOString().split("T")[0])

    const generateReport = async () => {
        if (!jobId) return
        setLoading(true)
        try {
            const res = await fetch(`${API}/insurance_report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    job_id: jobId,
                    patient_name: scanResult?.extracted_entities?.patient_name || "Anonymous",
                    patient_age: patientAge,
                    date_of_visit: dateOfVisit,
                    clinic_name: clinicName,
                    doctor_name: providerName,
                }),
            })
            const data = await res.json()
            setReport(data.report)
        } catch {
            alert("Failed to generate report. Ensure backend is running.")
        }
        setLoading(false)
    }

    const printReport = () => {
        window.print()
    }

    const Row = ({ label, value }: { label: string; value: any }) => (
        <div className="py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest col-span-1 flex items-start pt-0.5">{label}</span>
            <span className="text-sm font-semibold text-[#0F172A] col-span-2">
                {Array.isArray(value) ? (value.length > 0 ? value.join(", ") : "—") : (value || "—")}
            </span>
        </div>
    )

    return (
        <motion.div key="insurance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Insurance Summary</h2>
                    <p className="text-[#64748B] font-sans">Auto-generate structured insurance-ready clinical documentation.</p>
                </div>
                {report && (
                    <button onClick={printReport} className="h-12 px-6 rounded-full bg-[#0F172A] text-white font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-lg">
                        <Download className="w-5 h-5" /> Print / Export
                    </button>
                )}
            </div>

            {/* Config Form */}
            {!report && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <h3 className="font-semibold text-[#0F172A] text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-[#00F5D4]" /> Report Configuration</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Patient Age</label>
                            <input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="e.g. 45"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Clinic Name</label>
                            <input value={clinicName} onChange={e => setClinicName(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Date of Visit</label>
                            <input type="date" value={dateOfVisit} onChange={e => setDateOfVisit(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all" />
                        </div>
                    </div>
                    <button onClick={generateReport} disabled={loading || !jobId}
                        className="h-12 px-8 rounded-full bg-[#0F172A] text-white font-bold flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all shadow-lg">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        {loading ? "Generating..." : "Generate Insurance Report"}
                    </button>
                    {!jobId && <p className="text-sm text-amber-600 font-medium mt-1">⚠ Process a consultation first to generate the report.</p>}
                </div>
            )}

            {/* Generated Report */}
            {report && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-[#0F172A] text-white px-8 py-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[#00F5D4] font-bold uppercase tracking-widest mb-1">Insurance Claim Documentation</p>
                            <h3 className="font-serif text-2xl">Clinical Visit Summary</h3>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400">
                            <div className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />{report.attending_physician}</div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="space-y-0">
                                <Row label="Patient Name" value={report.patient_name} />
                                <Row label="Patient Age" value={report.patient_age} />
                                <Row label="Date of Visit" value={report.date_of_visit} />
                                <Row label="Clinic" value={report.clinic_name} />
                                <Row label="Physician" value={report.attending_physician} />
                            </div>
                            <div className="space-y-0 md:pl-8 md:border-l border-gray-100">
                                <Row label="Chief Complaint" value={report.chief_complaint} />
                                <Row label="Diagnosis" value={report.diagnosis} />
                                <Row label="Symptoms" value={report.symptoms} />
                                <Row label="Tests Ordered" value={report.investigations_ordered} />
                                <Row label="ICD Codes" value={report.icd_codes} />
                            </div>
                        </div>
                        <div className="mt-4 space-y-0">
                            <Row label="Treatment Plan" value={report.treatment_provided} />
                            <Row label="Medications" value={Array.isArray(report.prescribed_medications) ? report.prescribed_medications.map((m: any) => typeof m === "string" ? m : m?.medication || JSON.stringify(m)).join(", ") : report.prescribed_medications} />
                            <Row label="Follow-Up" value={Array.isArray(report.follow_up_plan) ? report.follow_up_plan.map((f: any) => f?.message || JSON.stringify(f)).join("; ") : report.follow_up_plan} />
                        </div>
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                            <User className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">{report.ai_disclaimer}</p>
                        </div>
                    </div>
                    <div className="px-8 py-4 border-t border-gray-100 flex justify-end gap-4">
                        <button onClick={() => setReport(null)} className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium transition-colors">Regenerate</button>
                        <button onClick={printReport} className="text-sm font-bold text-white bg-[#0F172A] px-5 py-2 rounded-full hover:bg-gray-800 transition-colors">Print Report</button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
