import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Activity, CheckCircle2, Loader2, TriangleAlert } from "lucide-react"

const API = "http://localhost:8000"

const SEVERITY_STYLES: Record<string, string> = {
    HIGH: "border-red-200 bg-red-50",
    MEDIUM: "border-amber-200 bg-amber-50",
    LOW: "border-blue-200 bg-blue-50",
}

const SEVERITY_BADGE: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-blue-100 text-blue-700",
}

interface RedFlag {
    symptom: string
    possible_conditions: string[]
    severity: string
    suggested_action: string
}

interface Props {
    scanResult: any
}

export default function RedFlagsTab({ scanResult }: Props) {
    const [redFlags, setRedFlags] = useState<RedFlag[]>([])
    const [loading, setLoading] = useState(false)
    const [ran, setRan] = useState(false)

    const runDetection = async () => {
        const transcript = scanResult?.transcript
        if (!transcript) return
        setLoading(true)
        setRan(false)
        try {
            const res = await fetch(`${API}/detect_redflags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript }),
            })
            const data = await res.json()
            setRedFlags(data.red_flags || [])
            setRan(true)
        } catch (e) {
            console.error("Red flag detection failed", e)
        }
        setLoading(false)
    }

    // Also show drug interactions from existing scan as red flags
    const drugWarnings = Array.isArray(scanResult?.drug_interactions) ? scanResult.drug_interactions : []

    return (
        <motion.div key="redflags" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Red Flag Monitor</h2>
                    <p className="text-[#64748B] font-sans">Passive AI surveillance for clinically significant symptom patterns.</p>
                </div>
                <button
                    onClick={runDetection}
                    disabled={loading || !scanResult?.transcript}
                    className="h-13 px-8 py-3 rounded-full bg-red-600 text-white font-bold flex items-center gap-3 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
                    {loading ? "Scanning Transcript..." : "Run AI Red Flag Scan"}
                </button>
            </div>

            {!scanResult?.transcript && (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-3xl bg-white/30">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-[#64748B] font-medium">Upload and process a consultation first to enable red flag detection.</p>
                </div>
            )}

            {/* Drug Interaction Warnings from existing pipeline */}
            {drugWarnings.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-sm text-red-600 uppercase tracking-widest flex items-center gap-2">
                        <TriangleAlert className="w-4 h-4" /> Drug Interaction Warnings ({drugWarnings.length})
                    </h3>
                    {drugWarnings.map((w: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-5 border border-red-200 bg-red-50 rounded-2xl p-6">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-red-700 text-sm uppercase tracking-widest">Drug Interaction</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800">{w.interaction_level || "WARNING"}</span>
                                </div>
                                <p className="font-semibold text-[#0F172A]">{w.drug_pair || w}</p>
                                {w.description && <p className="text-sm text-[#64748B] mt-1">{w.description}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* AI-Detected Red Flags */}
            <AnimatePresence>
                {ran && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h3 className="font-bold text-sm text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#00F5D4]" /> AI Clinical Red Flags Detected ({redFlags.length})
                        </h3>
                        {redFlags.length === 0 ? (
                            <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                                <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-green-800">No Clinical Red Flags Detected</p>
                                    <p className="text-sm text-green-600 mt-0.5">The AI found no high-confidence symptom red flags in this consultation.</p>
                                </div>
                            </div>
                        ) : (
                            redFlags.map((rf, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className={`border rounded-2xl p-6 ${SEVERITY_STYLES[rf.severity] || "border-gray-200 bg-white"}`}>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                            <span className="font-bold text-lg text-[#0F172A]">Symptom: {rf.symptom}</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${SEVERITY_BADGE[rf.severity] || "bg-gray-100 text-gray-700"}`}>
                                            {rf.severity}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Possible Conditions</p>
                                            <ul className="space-y-1">
                                                {rf.possible_conditions.map((c, ci) => (
                                                    <li key={ci} className="text-sm font-medium text-[#0F172A] flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>{c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-white/70 rounded-xl p-4 border border-white">
                                            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Suggested Action</p>
                                            <p className="text-sm text-[#0F172A] font-medium">{rf.suggested_action}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
