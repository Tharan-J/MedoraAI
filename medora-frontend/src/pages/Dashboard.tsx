import { useState, useRef } from "react"
import { uploadAudio, generateNote, pollStatus } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard, UploadCloud, FileText, Pill,
    Users, Activity, BarChart3, Bell, Settings, LogOut, Mic,
    ShieldCheck, Clock, FileAudio
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar
} from "recharts"

const sidebarItems = [
    { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { name: "Upload Consultation", id: "upload", icon: UploadCloud },
    { name: "Clinical Notes", id: "notes", icon: FileText },
    { name: "Prescriptions", id: "prescriptions", icon: Pill },
    { name: "Patient Summaries", id: "summaries", icon: Users },
    { name: "Follow-Ups", id: "followups", icon: Activity },
    { name: "Analytics", id: "analytics", icon: BarChart3 },
]

const consultationData = [
    { name: "Mon", duration: 15 },
    { name: "Tue", duration: 12 },
    { name: "Wed", duration: 18 },
    { name: "Thu", duration: 14 },
    { name: "Fri", duration: 10 },
    { name: "Sat", duration: 5 },
]



// Custom dot for Recharts
const PulsingDot = (props: any) => {
    const { cx, cy } = props
    if (!cx || !cy) return null

    return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx={6} cy={6} r={4} fill="#00F5D4" />
            <circle cx={6} cy={6} r={4} stroke="#00F5D4" strokeWidth={2}>
                <animate attributeName="r" values="4; 12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isProcessing, setIsProcessing] = useState(false)
    const [hasData, setHasData] = useState(false) // Initially false
    const [scanResult, setScanResult] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsProcessing(true)
        setHasData(false)
        setActiveTab("notes")

        try {
            const uploadRes = await uploadAudio(file)
            const jobId = uploadRes.job_id

            await generateNote(jobId)

            const interval = setInterval(async () => {
                const statusInfo = await pollStatus(jobId)
                if (statusInfo.status === "completed") {
                    clearInterval(interval)
                    setScanResult(statusInfo.result)
                    setHasData(true)
                    setIsProcessing(false)
                } else if (statusInfo.status === "failed") {
                    clearInterval(interval)
                    console.error("Processing failed:", statusInfo.error)
                    setIsProcessing(false)
                }
            }, 2500)
        } catch (error) {
            console.error("Error starting AI scan:", error)
            setIsProcessing(false)
        }
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

            {/* Sidebar: HUD Navigation */}
            <aside className="w-72 glass border-r border-white/50 flex flex-col h-full shrink-0 z-40 relative">
                <div className="p-8 pb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F172A] flex justify-center items-center shadow-lg relative">
                        <div className="absolute inset-0 rounded-full bg-[#00F5D4] animate-pulse opacity-40 blur-md"></div>
                        <Activity className="w-4 h-4 text-[#00F5D4]" />
                    </div>
                    <span className="font-serif text-2xl tracking-tight text-[#0F172A]">Medora AI</span>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2 relative">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full relative flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-sm outline-none`}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 transition-colors ${activeTab === item.id ? "text-[#0F172A]" : "text-[#64748B]"}`} />
                            <span className={`relative z-10 transition-colors ${activeTab === item.id ? "text-[#0F172A] font-semibold" : "text-[#64748B]"}`}>{item.name}</span>

                            {activeTab === item.id && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#00F5D4] z-10 shadow-[0_0_8px_#00F5D4]"></div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-6 border-t border-white/50 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white/50 rounded-xl transition-colors">
                        <Settings className="w-5 h-5" /> Provider Settings
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

                {/* Header HUD */}
                <header className="h-24 px-10 flex justify-between items-center z-10 border-b border-gray-100 bg-white/40 backdrop-blur-md sticky top-0">
                    <h1 className="font-serif text-4xl text-[#0F172A]">
                        {sidebarItems.find(i => i.id === activeTab)?.name || "Command Center"}
                    </h1>
                    <div className="flex items-center gap-6">
                        <button className="relative text-[#0F172A] hover:bg-white p-2 rounded-full transition-colors border border-transparent hover:border-gray-200">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red]"></span>
                        </button>
                        <div className="flex items-center gap-4 border border-gray-200 bg-white pl-2 pr-6 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex justify-center items-center shadow-inner font-semibold text-xs">
                                DR
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[#0F172A]">Dr. Jenkins</span>
                                <span className="text-[10px] text-[#00F5D4] uppercase tracking-wider font-bold">Active</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Global Neural Scan Line Overlay */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ top: "-10%", opacity: 0 }}
                            animate={{ top: "110%", opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                            className="absolute left-0 right-0 h-1 bg-[#00F5D4] z-50 pointer-events-none shadow-[0_0_30px_5px_#00F5D4]"
                        >
                            <div className="absolute inset-x-0 bottom-full h-32 bg-gradient-to-t from-[#00F5D4]/20 to-transparent"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto px-10 py-8 relative z-0 hide-scrollbar scroll-smooth">
                    <div className="max-w-[1400px] mx-auto pb-32">
                        <AnimatePresence mode="wait">
                            {/* === DASHBOARD === */}
                            {activeTab === "dashboard" && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-8"
                                >
                                    {/* Command Center Splash */}
                                    <motion.div
                                        whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.05)" }}
                                        className="bg-[#0F172A] text-white rounded-[2rem] p-10 relative overflow-hidden flex flex-col items-start shadow-xl border border-gray-800"
                                    >
                                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mb-32 -mr-32">
                                            <Activity className="w-[600px] h-[600px] text-[#00F5D4]" strokeWidth={0.5} />
                                        </div>
                                        <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20 mb-8">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] mr-2"></span>
                                            Medora Pipeline Online
                                        </div>
                                        <h2 className="font-serif text-5xl mb-4 leading-tight">Welcome, Dr. Jenkins.</h2>
                                        <p className="text-[#64748B] text-lg max-w-lg font-sans mb-10">
                                            All systems nominal. You have 14 active patient slots today. Ready to begin audio capture.
                                        </p>

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-14 px-8 rounded-full bg-white text-[#0F172A] font-semibold text-lg flex items-center hover:bg-[#00F5D4] hover:shadow-[0_0_30px_rgba(0,245,212,0.4)] transition-all"
                                        >
                                            <Mic className="w-5 h-5 mr-3" /> Upload Consultation Audio
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
                                    </motion.div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[{ title: "Documentation Time Saved", val: "2h 15m", icon: Clock }, { title: "Processed Consultations", val: "8", icon: FileAudio }, { title: "Action Items Generated", val: "24", icon: ShieldCheck }].map((metric, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)" }}
                                                className="glass-card rounded-[2rem] p-8 border border-white shadow-sm flex items-start gap-5"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 flex items-center justify-center shrink-0 border border-[#00F5D4]/20">
                                                    <metric.icon className="w-7 h-7 text-[#0F172A]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#64748B] tracking-wide uppercase">{metric.title}</p>
                                                    <h4 className="text-4xl font-serif text-[#0F172A] mt-2">{metric.val}</h4>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* === CLINICAL NOTES & SCANNING === */}
                            {activeTab === "notes" && (
                                <motion.div
                                    key="notes"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center justify-center py-32 h-[600px] border border-dashed border-gray-300 rounded-[2rem] bg-white/30 backdrop-blur-sm">
                                            <h3 className="font-serif text-3xl text-[#0F172A] mb-4">Neural Processing Active</h3>
                                            <p className="font-mono text-[#64748B] text-sm typing-indicator before:content-[''] before:w-1 before:h-4 before:bg-[#00F5D4] before:inline-block before:mr-2 before:animate-pulse">
                                                Extracting clinical intelligence from audio stream...
                                            </p>
                                        </div>
                                    ) : hasData ? (
                                        <motion.div className="grid lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                                            {/* Context Card */}
                                            <motion.div
                                                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                                className="lg:col-span-1 glass-card rounded-[2rem] border-white shadow-sm p-8"
                                            >
                                                <h4 className="font-serif text-2xl text-[#0F172A] mb-6 flex items-center justify-between">
                                                    Transcript
                                                    <span className="text-[10px] font-sans font-bold bg-[#00F5D4]/20 text-[#0F172A] px-3 py-1 rounded-full border border-[#00F5D4]/40 uppercase tracking-widest">Whisper Agent</span>
                                                </h4>
                                                <div className="space-y-4 font-mono text-sm leading-relaxed text-[#0F172A]/80 max-h-96 overflow-y-auto pr-2">
                                                    <p>{scanResult?.transcript || "No transcript generated."}</p>
                                                </div>
                                            </motion.div>

                                            {/* Outputs */}
                                            <div className="lg:col-span-2 space-y-8 flex flex-col">
                                                {/* SOAP Note generation animation */}
                                                <motion.div
                                                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                                    className="glass-card rounded-[2rem] border-white shadow-sm p-8 flex-1"
                                                >
                                                    <h4 className="font-serif text-2xl text-[#0F172A] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                                        Structured Artifact
                                                        <span className="text-[10px] font-sans font-bold bg-[#1E293B] text-white px-3 py-1 rounded-full border border-[#334155] uppercase tracking-widest">Clinical Extraction Agent</span>
                                                    </h4>
                                                    <div className="font-sans text-lg text-[#0F172A] leading-relaxed max-w-2xl whitespace-pre-wrap">
                                                        {(
                                                            scanResult?.soap_note
                                                                ? (typeof scanResult.soap_note === 'string'
                                                                    ? scanResult.soap_note
                                                                    : Object.entries(scanResult.soap_note).map(([k, v]) => `${k.toUpperCase()}:\n${v}`).join('\n\n'))
                                                                : "Generating structural artifact..."
                                                        ).split(" ").map((word: string, i: number) => (
                                                            <span
                                                                key={i}
                                                                className="typewriter-word"
                                                                style={{ animationDelay: `${i * 0.05}s` }}
                                                            >
                                                                {word}&nbsp;
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Prescription Verification */}
                                                    <motion.div
                                                        whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                                        className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#0F172A]"></div>
                                                        <h5 className="font-bold text-[#64748B] text-xs tracking-widest uppercase mb-6 flex justify-between items-center">
                                                            Prescription Plan

                                                            {/* Snap Rotation Animation for Shield */}
                                                            <motion.div
                                                                initial={{ rotate: -180, scale: 0 }}
                                                                animate={{ rotate: 0, scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1 }}
                                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${Array.isArray(scanResult?.drug_interactions) && scanResult?.drug_interactions?.length > 0
                                                                    ? "text-red-600 bg-red-100"
                                                                    : "text-[#00F5D4] bg-[#00F5D4]/10"
                                                                    }`}
                                                            >
                                                                <ShieldCheck className="w-4 h-4" />
                                                                <span className="font-semibold text-xs text-[#0F172A]">
                                                                    {Array.isArray(scanResult?.drug_interactions) && scanResult?.drug_interactions?.length > 0 ? "WARNING" : "VERIFIED SAFE"}
                                                                </span>
                                                            </motion.div>
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {Array.isArray(scanResult?.prescription) && scanResult.prescription.length > 0 ? (
                                                                scanResult.prescription.map((rx: any, idx: number) => (
                                                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-[#F8FAFC]">
                                                                        <p className="font-bold text-[#0F172A] text-lg">
                                                                            {typeof rx === 'string' ? rx : (rx?.medication || "Unknown Prescription")}
                                                                        </p>
                                                                        {typeof rx !== 'string' && (rx?.dosage || rx?.frequency) && (
                                                                            <p className="text-sm text-[#64748B] mt-1">
                                                                                {[rx?.dosage, rx?.frequency, rx?.duration ? `x ${rx.duration}` : null].filter(Boolean).join(' ')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : typeof scanResult?.prescription === 'string' ? (
                                                                <div className="p-4 border border-gray-200 rounded-xl bg-[#F8FAFC]">
                                                                    <p className="font-bold text-[#0F172A] text-lg">{scanResult.prescription}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 border border-gray-200 rounded-xl bg-[#F8FAFC]">
                                                                    <p className="font-bold text-[#0F172A] text-lg">No Prescriptions</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                                        className="glass-card rounded-[2rem] border-white shadow-sm p-8"
                                                    >
                                                        <h5 className="font-bold text-[#64748B] text-xs tracking-widest uppercase mb-6">ICD-11 Assignments</h5>
                                                        <div className="space-y-3">
                                                            {Array.isArray(scanResult?.icd_codes) && scanResult.icd_codes.length > 0 ? (
                                                                scanResult.icd_codes.map((code: string, idx: number) => {
                                                                    const [id, ...rest] = typeof code === 'string' ? code.split(' ') : ["-", JSON.stringify(code)]
                                                                    return (
                                                                        <div key={idx} className="flex items-start gap-4 p-3 hover:bg-white rounded-xl transition-colors">
                                                                            <span className="bg-[#0F172A] text-white px-2 py-0.5 rounded text-xs font-mono shrink-0">{id || "-"}</span>
                                                                            <span className="text-sm font-semibold text-[#0F172A]">{rest.join(' ') || code}</span>
                                                                        </div>
                                                                    )
                                                                })
                                                            ) : typeof scanResult?.icd_codes === 'string' ? (
                                                                <div className="p-3 bg-[#F8FAFC] rounded-xl text-sm font-semibold text-[#0F172A]">
                                                                    {scanResult.icd_codes}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-[#64748B]">No ICD codes identified.</div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex justify-center py-32">
                                            <button onClick={() => fileInputRef.current?.click()} className="bg-[#0F172A] text-white px-8 h-14 rounded-full font-bold shadow-xl">Begin Scanning Sequence</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* === ANALYTICS PANE === */}
                            {activeTab === "analytics" && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    <h2 className="font-serif text-5xl text-[#0F172A] mb-8">Clinical Telemetry</h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <motion.div
                                            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                            className="glass-card rounded-[2rem] border-white shadow-sm p-8"
                                        >
                                            <div className="mb-6">
                                                <h4 className="font-serif text-2xl text-[#0F172A]">Duration Efficacy</h4>
                                                <p className="text-[#64748B] font-sans text-sm mt-1">Average minutes spent per patient</p>
                                            </div>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={consultationData} margin={{ top: 10, bottom: 0, left: -20, right: 10 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                                        <Tooltip cursor={{ stroke: '#CBD5E1' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                                        <Line type="monotone" dataKey="duration" stroke="#0F172A" strokeWidth={3} dot={<PulsingDot />} activeDot={{ r: 8, fill: "#0F172A", strokeWidth: 0 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                                        >
                                            <div className="mb-6">
                                                <h4 className="font-serif text-2xl text-[#0F172A]">Encounter Frequency</h4>
                                                <p className="text-[#64748B] font-sans text-sm mt-1">Prevalent diagnoses this month</p>
                                            </div>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[
                                                        { name: 'GERD', val: 86 },
                                                        { name: 'Hypertension', val: 120 },
                                                        { name: 'Diabetes', val: 98 },
                                                    ]} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontWeight: 'bold' }} />
                                                        <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                                        <Bar dataKey="val" fill="#00F5D4" radius={[0, 8, 8, 0]} barSize={24} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}
