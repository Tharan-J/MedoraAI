import { useState } from "react"
import { motion } from "framer-motion"
import { Receipt, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const API = "http://localhost:8000"

interface Props {
    jobId: string | null
}

export default function BillingTab({ jobId }: Props) {
    const [billing, setBilling] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [minutes, setMinutes] = useState(10)

    const generateBilling = async () => {
        if (!jobId) return
        setLoading(true)
        try {
            const res = await fetch(`${API}/billing_codes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId, consultation_minutes: minutes }),
            })
            const data = await res.json()
            setBilling(data)
        } catch {
            alert("Failed to generate billing codes. Ensure backend is running.")
        }
        setLoading(false)
    }

    const COMPLEXITY_COLORS: Record<string, string> = {
        low: "text-green-600 bg-green-50 border-green-200",
        moderate: "text-amber-600 bg-amber-50 border-amber-200",
        high: "text-red-600 bg-red-50 border-red-200",
    }

    return (
        <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div>
                <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Smart Billing & Coding</h2>
                <p className="text-[#64748B] font-sans">Auto-generate ICD-10, CPT, and E/M billing codes from the consultation.</p>
            </div>

            {/* Config card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Consultation Duration (minutes)</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min={5} max={60} step={5} value={minutes} onChange={e => setMinutes(+e.target.value)}
                                className="flex-1 h-2 accent-[#0F172A]" />
                            <span className="text-2xl font-serif text-[#0F172A] w-12 text-right">{minutes}</span>
                        </div>
                    </div>
                    <button onClick={generateBilling} disabled={loading || !jobId}
                        className="h-12 px-8 rounded-full bg-[#0F172A] text-white font-bold flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-all shadow-lg shrink-0">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
                        {loading ? "Generating..." : "Generate Billing Codes"}
                    </button>
                </div>
                {!jobId && <p className="text-sm text-amber-600 font-medium mt-4">⚠ Process a consultation first to generate billing codes.</p>}
            </div>

            {/* Results */}
            {billing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* E/M Level Card */}
                    <div className="bg-[#0F172A] text-white rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute right-8 top-8 opacity-10">
                            <Receipt className="w-32 h-32" />
                        </div>
                        <p className="text-xs text-[#00F5D4] font-bold uppercase tracking-widest mb-2">Primary CPT Code</p>
                        <div className="flex items-baseline gap-4 mb-4">
                            <span className="font-serif text-7xl">{billing.em_code.code}</span>
                            <span className="text-2xl text-gray-400">{billing.em_code.level}</span>
                        </div>
                        <p className="text-gray-300 font-medium">{billing.em_code.desc}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* ICD-10 Codes */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h4 className="font-bold text-xs text-[#64748B] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" /> ICD-10 Codes
                            </h4>
                            <div className="space-y-3">
                                {Array.isArray(billing.icd10_codes) && billing.icd10_codes.length > 0 ? (
                                    billing.icd10_codes.map((code: any, i: number) => {
                                        const codeStr = typeof code === "string" ? code : JSON.stringify(code)
                                        const [id, ...rest] = codeStr.split(" ")
                                        return (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                                                <span className="bg-[#0F172A] text-white px-2 py-1 rounded-lg text-xs font-mono font-bold">{id}</span>
                                                <span className="text-sm font-medium text-[#0F172A]">{rest.join(" ") || codeStr}</span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-[#64748B]">No ICD codes available from this consultation.</p>
                                )}
                            </div>
                        </div>

                        {/* Justification */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h4 className="font-bold text-xs text-[#64748B] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[#00F5D4]" /> Coding Justification
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-[#64748B]">Medical Complexity</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${COMPLEXITY_COLORS[billing.justification?.complexity] || ""}`}>
                                        {billing.justification?.complexity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-[#64748B]">Duration</span>
                                    <span className="text-sm font-bold text-[#0F172A]">{billing.justification?.consultation_minutes} min</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-[#64748B]">Symptoms Reviewed</span>
                                    <span className="text-sm font-bold text-[#0F172A]">{billing.justification?.symptoms_reviewed}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-[#64748B]">Medications Managed</span>
                                    <span className="text-sm font-bold text-[#0F172A]">{billing.justification?.medications_managed}</span>
                                </div>
                                {billing.justification?.diagnosis && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-[#64748B]">Primary Diagnosis</span>
                                        <span className="text-sm font-bold text-[#0F172A] text-right max-w-[55%]">{billing.justification.diagnosis}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
