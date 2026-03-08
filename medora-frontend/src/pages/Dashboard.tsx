import { useState, useRef } from "react"
import { uploadAudio, generateNote, pollStatus } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard, UploadCloud, FileText, Pill,
    Users, Activity, BarChart3, Bell, Settings, LogOut, Mic,
    ShieldCheck, Clock, FileAudio, StopCircle, Radio,
    AlertTriangle, HeartPulse, Calendar, Route,
    Stethoscope, ClipboardList, FlaskConical, Syringe, Thermometer,
    ChevronRight, Hash, CheckCircle2, XCircle
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar
} from "recharts"
import RedFlagsTab from "@/components/dashboard/RedFlagsTab"
import InsuranceTab from "@/components/dashboard/InsuranceTab"
import BillingTab from "@/components/dashboard/BillingTab"
import PatientJourneyTab from "@/components/dashboard/PatientJourneyTab"
import { MOCK_SCAN_RESULT, MOCK_JOB_ID } from "@/lib/mockData"

const sidebarItems = [
    { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { name: "Patient Journey", id: "journey", icon: Route },
    { name: "Upload Consultation", id: "upload", icon: UploadCloud },
    { name: "Clinical Notes", id: "notes", icon: FileText },
    { name: "Red Flag Monitor", id: "redflags", icon: AlertTriangle },
    { name: "Patient Summaries", id: "summaries", icon: Users },
    { name: "Follow-Ups", id: "followups", icon: Activity },
    { name: "Insurance Report", id: "insurance", icon: HeartPulse },
    { name: "Smart Billing", id: "billing", icon: Pill },
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
    const [hasData, setHasData] = useState(true)           // pre-loaded with demo data
    const [scanResult, setScanResult] = useState<any>(MOCK_SCAN_RESULT)  // demo
    const [jobId, setJobId] = useState<string | null>(MOCK_JOB_ID)       // demo
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // New Modals State
    const [showSettings, setShowSettings] = useState(false)
    const [providerName, setProviderName] = useState("Dr. Jenkins")
    const [uiTheme, setUiTheme] = useState("Pristine Light")
    const [agentMode, setAgentMode] = useState("Full 9-Agent Clinical Suite")

    const [tempProviderName, setTempProviderName] = useState(providerName)
    const [tempUiTheme, setTempUiTheme] = useState(uiTheme)
    const [tempAgentMode, setTempAgentMode] = useState(agentMode)

    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([
        { id: 1, text: `${providerName}, your SOAP configuration updated.`, time: "2m ago" },
        { id: 2, text: "Patient analytics report generated successfully.", time: "1h ago" },
        { id: 3, text: "New ICD-11 coding module synced.", time: "Yesterday" }
    ])

    const handleLogout = () => {
        // Simple Frontend Session Termination
        sessionStorage.clear()
        window.location.href = "/"
    }
    const processAudioFile = async (file: File) => {
        setIsProcessing(true)
        setHasData(false)
        setActiveTab("notes")

        try {
            const uploadRes = await uploadAudio(file)
            const newJobId = uploadRes.job_id
            setJobId(newJobId)

            await generateNote(newJobId)

            const interval = setInterval(async () => {
                const statusInfo = await pollStatus(newJobId)
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        await processAudioFile(file)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const audioFile = new File([audioBlob], "live-recording.webm", { type: 'audio/webm' })
                processAudioFile(audioFile)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setRecordingTime(0)

            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (error) {
            console.error("Error accessing microphone:", error)
            alert("Please allow microphone access to use this feature.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current)
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex min-h-screen h-screen bg-[#F8FAFC] overflow-hidden font-sans">

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
                    <button onClick={() => {
                        setTempProviderName(providerName)
                        setTempUiTheme(uiTheme)
                        setTempAgentMode(agentMode)
                        setShowSettings(true)
                    }} className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white/50 rounded-xl transition-colors">
                        <Settings className="w-5 h-5" /> Provider Settings
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

                {/* Header HUD */}
                <header className="h-24 px-10 flex justify-between items-center z-10 border-b border-gray-100 bg-white/40 backdrop-blur-md sticky top-0">
                    <h1 className="font-serif text-4xl text-[#0F172A]">
                        {sidebarItems.find(i => i.id === activeTab)?.name || "Command Center"}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-[#0F172A] hover:bg-white p-2 rounded-full transition-colors border border-transparent hover:border-gray-200">
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red]"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-[#F8FAFC]">
                                            <h3 className="font-semibold text-sm text-[#0F172A]">Notifications</h3>
                                            <button onClick={() => setNotifications([])} className="text-xs text-[#64748B] hover:text-[#00F5D4] transition-colors">Clear All</button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-[#64748B]">You're all caught up!</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <p className="text-sm text-[#0F172A]">{n.text}</p>
                                                        <span className="text-[10px] text-[#94A3B8] font-bold mt-1 block">{n.time}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-4 border border-gray-200 bg-white pl-2 pr-6 py-1.5 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex justify-center items-center shadow-inner font-semibold text-xs transition-colors">
                                {providerName ? providerName.replace(/[^a-zA-Z ]/g, "").split(" ").map(w => w[0]).join('').substring(0, 2).toUpperCase() : "DR"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[#0F172A]">{providerName}</span>
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

                <div className="flex-1 px-10 py-8 relative z-0">
                    <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
                    <div className="max-w-[1400px] mx-auto pb-16">
                        <AnimatePresence mode="wait">
                            {/* === UPLOAD CONSULTATION === */}
                            {activeTab === "upload" && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col items-center justify-center min-h-[70vh]"
                                >
                                    <div className="text-center mb-16">
                                        <div className="inline-flex items-center justify-center rounded-full bg-cyan-50 px-3 py-1 mb-6 border border-cyan-100 shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-[#00F5D4] mr-2 animate-pulse"></span>
                                            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">Audio Capture Active</span>
                                        </div>
                                        <h2 className="font-serif text-5xl md:text-6xl text-[#0F172A] mb-4">Upload Consultation</h2>
                                        <p className="text-[#64748B] text-lg font-sans max-w-lg mx-auto">
                                            Drop your audio explicitly in the ocean to begin Medora's neural processing.
                                        </p>
                                    </div>

                                    {/* Action Buttons Container */}
                                    <div className="flex flex-col md:flex-row items-center gap-12">
                                        
                                        {/* Sea Waves Ambient Button (Upload) */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative overflow-hidden w-64 h-64 md:w-72 md:h-72 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,245,212,0.4)] transition-all duration-500 flex flex-col items-center justify-center border-4 border-white cursor-pointer group hover:scale-[1.02] active:scale-95 ${isRecording ? 'bg-gray-100 grayscale opacity-60 pointer-events-none' : 'bg-gradient-to-b from-cyan-300 to-blue-500'}`}
                                        >
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-[40%] left-[-50%] w-[200%] h-[200%] bg-white/20 rounded-[45%]"
                                            />
                                            <motion.div 
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-[45%] left-[-50%] w-[200%] h-[200%] bg-white/30 rounded-[43%]"
                                            />
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-[52%] left-[-50%] w-[200%] h-[200%] bg-[#F8FAFC] rounded-[38%] group-hover:top-[48%] transition-all duration-700"
                                            />
                                            
                                            <div className="relative z-10 flex flex-col items-center pointer-events-none transition-transform duration-700 group-hover:-translate-y-2">
                                                <div className="w-16 h-16 bg-white shadow-xl shadow-cyan-500/20 rounded-full flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_#00F5D4] transition-all duration-500">
                                                    <UploadCloud className="w-7 h-7 text-cyan-500 group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <span className="text-[#0F172A] font-serif text-3xl mb-1 relative">
                                                    Upload File
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sea Waves Ambient Button (Record Live) */}
                                        <div 
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`relative overflow-hidden w-64 h-64 md:w-72 md:h-72 rounded-[3rem] cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all duration-500 flex flex-col items-center justify-center border-4 border-white ${isRecording ? 'shadow-[0_30px_60px_-15px_rgba(239,68,68,0.5)] bg-gradient-to-b from-red-400 to-rose-600' : 'shadow-[0_30px_60px_-15px_rgba(167,139,250,0.4)] bg-gradient-to-b from-purple-400 to-violet-600'}`}
                                        >
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: isRecording ? 5 : 15, repeat: Infinity, ease: "linear" }}
                                                className={`absolute top-[40%] left-[-50%] w-[200%] h-[200%] ${isRecording ? 'bg-white/30' : 'bg-white/20'} rounded-[45%]`}
                                            />
                                            <motion.div 
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: isRecording ? 6 : 18, repeat: Infinity, ease: "linear" }}
                                                className={`absolute top-[45%] left-[-50%] w-[200%] h-[200%] ${isRecording ? 'bg-white/40' : 'bg-white/30'} rounded-[43%]`}
                                            />
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: isRecording ? 7 : 20, repeat: Infinity, ease: "linear" }}
                                                className={`absolute top-[52%] left-[-50%] w-[200%] h-[200%] bg-[#F8FAFC] rounded-[38%] transition-all duration-700 ${isRecording ? 'top-[49%]' : 'group-hover:top-[48%]'}`}
                                            />
                                            
                                            <div className="relative z-10 flex flex-col items-center pointer-events-none transition-transform duration-700 group-hover:-translate-y-2">
                                                <div className={`w-16 h-16 ${isRecording ? 'bg-red-50' : 'bg-white'} shadow-xl ${isRecording ? 'shadow-red-500/20' : 'shadow-purple-500/20'} rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isRecording ? 'group-hover:shadow-[0_0_30px_#EF4444] scale-110' : 'group-hover:shadow-[0_0_30px_#A78BFA]'}`}>
                                                    {isRecording ? (
                                                        <StopCircle className="w-7 h-7 text-red-500 animate-pulse" />
                                                    ) : (
                                                        <Radio className="w-7 h-7 text-purple-500 group-hover:scale-110 transition-transform duration-500" />
                                                    )}
                                                </div>
                                                <span className={`font-serif text-3xl mb-1 relative transition-colors ${isRecording ? 'text-red-600' : 'text-[#0F172A]'}`}>
                                                    {isRecording ? formatTime(recordingTime) : "Record Live"}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                    <p className="mt-12 text-[#94A3B8] text-sm text-center font-sans font-medium bg-white/50 px-6 py-2 rounded-full shadow-sm border border-gray-100">MP3, M4A, WAV • Max 25MB • Secure Private Stream</p>
                                </motion.div>
                            )}

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
                                            Medora Pipeline Online ({agentMode})
                                        </div>
                                        <h2 className="font-serif text-5xl mb-4 leading-tight">Welcome, {providerName}.</h2>
                                        <p className="text-[#64748B] text-lg max-w-lg font-sans mb-10">
                                            All systems nominal. You have 14 active patient slots today. Ready to begin audio capture.
                                        </p>

                                        <button
                                            onClick={() => setActiveTab("upload")}
                                            className="h-14 px-8 rounded-full bg-white text-[#0F172A] font-semibold text-lg flex items-center hover:bg-[#00F5D4] hover:shadow-[0_0_30px_rgba(0,245,212,0.4)] transition-all"
                                        >
                                            <Mic className="w-5 h-5 mr-3" /> Proceed to Upload
                                        </button>
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
                                        <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

                                            {/* ── TOP ROW: Transcript + Diagnosis Banner ── */}
                                            <div className="grid lg:grid-cols-5 gap-6">
                                                {/* Transcript Panel */}
                                                <motion.div
                                                    whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                                    className="lg:col-span-2 bg-[#0F172A] rounded-[2rem] p-7 flex flex-col"
                                                >
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-xl bg-[#00F5D4]/20 flex items-center justify-center">
                                                                <FileAudio className="w-4 h-4 text-[#00F5D4]" />
                                                            </div>
                                                            <span className="font-bold text-white text-sm">Audio Transcript</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold bg-[#00F5D4]/20 text-[#00F5D4] px-2.5 py-1 rounded-full border border-[#00F5D4]/30 uppercase tracking-widest">Whisper</span>
                                                    </div>
                                                    <div className="flex-1 font-mono text-xs leading-relaxed text-gray-300 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                                                        {scanResult?.transcript
                                                            ? scanResult.transcript.split(/[.!?]+/).filter(Boolean).map((sent: string, i: number) => (
                                                                <p key={i} className="mb-2 text-gray-300 leading-relaxed">
                                                                    <span className="text-[#00F5D4] mr-1.5">›</span>{sent.trim()}.
                                                                </p>
                                                            ))
                                                            : <p className="text-gray-500 italic">No transcript available.</p>}
                                                    </div>
                                                </motion.div>

                                                {/* Diagnosis + Entities */}
                                                <motion.div
                                                    whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                                    className="lg:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7"
                                                >
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                                                                <Stethoscope className="w-4 h-4 text-violet-600" />
                                                            </div>
                                                            <span className="font-bold text-[#0F172A] text-sm">Clinical Impression</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold bg-[#1E293B] text-white px-2.5 py-1 rounded-full uppercase tracking-widest">Extraction Agent</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {([
                                                            { label: "Diagnosis", value: scanResult?.extracted_entities?.diagnosis, accent: "bg-violet-50 border-violet-100 text-violet-800" },
                                                            { label: "Chief Complaint", value: scanResult?.extracted_entities?.chief_complaint, accent: "bg-blue-50 border-blue-100 text-blue-800" },
                                                            { label: "Symptoms", value: Array.isArray(scanResult?.extracted_entities?.symptoms) ? scanResult.extracted_entities.symptoms.join(" · ") : scanResult?.extracted_entities?.symptoms, accent: "bg-amber-50 border-amber-100 text-amber-800" },
                                                            { label: "Tests Recommended", value: Array.isArray(scanResult?.extracted_entities?.tests_recommended) ? scanResult.extracted_entities.tests_recommended.join(", ") : scanResult?.extracted_entities?.tests_recommended, accent: "bg-teal-50 border-teal-100 text-teal-800" },
                                                        ] as { label: string; value: any; accent: string }[]).map(({ label, value, accent }) => (
                                                            <div key={label} className={`rounded-xl border p-4 ${accent}`}>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                                                                <p className="text-sm font-semibold leading-snug">{value || "—"}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* ── SOAP NOTE: 4 Color-coded Cards ── */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <ClipboardList className="w-5 h-5 text-[#0F172A]" />
                                                    <h4 className="font-bold text-[#0F172A] text-sm uppercase tracking-widest">SOAP Note</h4>
                                                    <div className="flex-1 h-px bg-gray-100" />
                                                    <span className="text-[10px] font-bold bg-[#1E293B] text-white px-2.5 py-1 rounded-full uppercase tracking-widest">Clinical Extraction Agent</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    {([
                                                        {
                                                            key: "subjective",
                                                            label: "Subjective",
                                                            desc: "Patient-reported symptoms",
                                                            icon: Mic,
                                                            bg: "bg-blue-50",
                                                            border: "border-blue-200",
                                                            iconBg: "bg-blue-100",
                                                            iconColor: "text-blue-700",
                                                            tagColor: "bg-blue-100 text-blue-700",
                                                        },
                                                        {
                                                            key: "objective",
                                                            label: "Objective",
                                                            desc: "Clinical observations & vitals",
                                                            icon: FlaskConical,
                                                            bg: "bg-emerald-50",
                                                            border: "border-emerald-200",
                                                            iconBg: "bg-emerald-100",
                                                            iconColor: "text-emerald-700",
                                                            tagColor: "bg-emerald-100 text-emerald-700",
                                                        },
                                                        {
                                                            key: "assessment",
                                                            label: "Assessment",
                                                            desc: "Diagnosis & clinical judgement",
                                                            icon: Stethoscope,
                                                            bg: "bg-violet-50",
                                                            border: "border-violet-200",
                                                            iconBg: "bg-violet-100",
                                                            iconColor: "text-violet-700",
                                                            tagColor: "bg-violet-100 text-violet-700",
                                                        },
                                                        {
                                                            key: "plan",
                                                            label: "Plan",
                                                            desc: "Treatment & follow-up actions",
                                                            icon: ClipboardList,
                                                            bg: "bg-orange-50",
                                                            border: "border-orange-200",
                                                            iconBg: "bg-orange-100",
                                                            iconColor: "text-orange-700",
                                                            tagColor: "bg-orange-100 text-orange-700",
                                                        },
                                                    ] as { key: string; label: string; desc: string; icon: any; bg: string; border: string; iconBg: string; iconColor: string; tagColor: string }[]).map(({ key, label, desc, icon: Icon, bg, border, iconBg, iconColor, tagColor }, i) => {
                                                        const rawVal = scanResult?.soap_note?.[key] ?? scanResult?.soap_note?.[key.charAt(0).toUpperCase() + key.slice(1)];
                                                        const val = typeof rawVal === 'string' ? rawVal : (rawVal ? JSON.stringify(rawVal) : null);
                                                        return (
                                                            <motion.div
                                                                key={key}
                                                                initial={{ opacity: 0, y: 12 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.08 }}
                                                                whileHover={{ y: -3, boxShadow: "0 16px 32px rgba(0,0,0,0.06)" }}
                                                                className={`rounded-2xl border p-6 ${bg} ${border}`}
                                                            >
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                                                        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                                                                    </div>
                                                                    <div>
                                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${tagColor}`}>{label}</span>
                                                                        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                                                    {val || <span className="text-gray-400 italic">Not generated</span>}
                                                                </p>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* ── BOTTOM ROW: Prescription + ICD + Drug Interactions ── */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                                {/* Prescription Cards */}
                                                <motion.div
                                                    whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                                    className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7"
                                                >
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
                                                                <Pill className="w-4 h-4 text-cyan-600" />
                                                            </div>
                                                            <span className="font-bold text-[#0F172A] text-sm">Prescription Plan</span>
                                                        </div>
                                                        <motion.div
                                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                                                Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-[#00F5D4]/15 text-[#0F172A]"
                                                            }`}
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            {Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0 ? "⚠ Flag" : "Safe"}
                                                        </motion.div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {Array.isArray(scanResult?.prescription) && scanResult.prescription.length > 0 ? (
                                                            scanResult.prescription.map((rx: any, idx: number) => {
                                                                const name = typeof rx === 'string' ? rx : (rx?.medication || rx?.drug_name || "Unknown")
                                                                const dose = typeof rx !== 'string' ? rx?.dosage : null
                                                                const freq = typeof rx !== 'string' ? rx?.frequency : null
                                                                const dur  = typeof rx !== 'string' ? rx?.duration : null
                                                                return (
                                                                    <motion.div key={idx}
                                                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.07 }}
                                                                        className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] border border-gray-100 rounded-xl"
                                                                    >
                                                                        <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                            <Pill className="w-3.5 h-3.5 text-cyan-700" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-bold text-[#0F172A] text-sm truncate">{name}</p>
                                                                            {(dose || freq || dur) && (
                                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                    {dose && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{dose}</span>}
                                                                                    {freq && <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{freq}</span>}
                                                                                    {dur  && <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{dur}</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )
                                                            })
                                                        ) : (
                                                            <div className="flex items-center gap-2 py-6 justify-center text-[#94A3B8] text-sm">
                                                                <Pill className="w-4 h-4" /> No prescriptions
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>

                                                {/* ICD Codes */}
                                                <motion.div
                                                    whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                                    className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7"
                                                >
                                                    <div className="flex items-center gap-2 mb-5">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                            <Hash className="w-4 h-4 text-indigo-600" />
                                                        </div>
                                                        <span className="font-bold text-[#0F172A] text-sm">ICD-11 Codes</span>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {Array.isArray(scanResult?.icd_codes) && scanResult.icd_codes.length > 0 ? (
                                                            scanResult.icd_codes.map((code: any, idx: number) => {
                                                                const str = typeof code === 'string' ? code : JSON.stringify(code)
                                                                const [id, ...rest] = str.split(' ')
                                                                return (
                                                                    <motion.div key={idx}
                                                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.07 }}
                                                                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors group"
                                                                    >
                                                                        <span className="shrink-0 bg-[#0F172A] group-hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors">{id || "–"}</span>
                                                                        <span className="text-xs font-semibold text-[#0F172A] leading-tight">{rest.join(' ') || str}</span>
                                                                        <ChevronRight className="w-3 h-3 text-gray-300 ml-auto shrink-0" />
                                                                    </motion.div>
                                                                )
                                                            })
                                                        ) : (
                                                            <div className="flex items-center gap-2 py-6 justify-center text-[#94A3B8] text-sm">
                                                                <Hash className="w-4 h-4" /> No codes identified
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>

                                                {/* Drug Interactions */}
                                                <motion.div
                                                    whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                                                    className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7"
                                                >
                                                    <div className="flex items-center gap-2 mb-5">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                            Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0
                                                                ? "bg-red-50"
                                                                : "bg-green-50"
                                                        }`}>
                                                            <AlertTriangle className={`w-4 h-4 ${
                                                                Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0
                                                                    ? "text-red-600"
                                                                    : "text-green-600"
                                                            }`} />
                                                        </div>
                                                        <span className="font-bold text-[#0F172A] text-sm">Drug Interactions</span>
                                                    </div>
                                                    {Array.isArray(scanResult?.drug_interactions) && scanResult.drug_interactions.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {scanResult.drug_interactions.map((w: any, idx: number) => (
                                                                <motion.div key={idx}
                                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                                    transition={{ delay: idx * 0.08 }}
                                                                    className="p-3.5 bg-red-50 border border-red-200 rounded-xl"
                                                                >
                                                                    <p className="text-xs font-bold text-red-800">{w.drug_pair || w}</p>
                                                                    {w.description && <p className="text-[11px] text-red-600 mt-1 leading-snug">{w.description}</p>}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-green-700">No interactions detected</p>
                                                            <p className="text-xs text-green-500 mt-1">All medications are safe together</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </div>

                                        </motion.div>
                                    ) : (
                                        <div className="flex justify-center py-32">
                                            <button onClick={() => setActiveTab("upload")} className="bg-[#0F172A] text-white px-8 h-14 rounded-full font-bold shadow-xl hover:bg-[#1E293B] transition-colors">Proceed to Upload</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* === RED FLAG MONITOR === */}
                            {activeTab === "redflags" && <RedFlagsTab scanResult={scanResult} />}

                            {/* === PATIENT SUMMARIES === */}
                            {activeTab === "summaries" && (
                                <motion.div key="summaries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Patient Summaries</h2>
                                    <p className="text-[#64748B] font-sans mb-8">Plain-language after-visit summaries auto-generated for patients.</p>
                                    {scanResult?.patient_summary ? (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-8">
                                                <p className="text-xs text-[#00F5D4] font-bold uppercase tracking-widest mb-3">Clinical Report</p>
                                                <h3 className="font-serif text-2xl mb-4">For: {scanResult.extracted_entities?.patient_name || "Patient"}</h3>
                                                <p className="text-gray-300 leading-relaxed">{scanResult.patient_summary}</p>
                                            </div>
                                            <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
                                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-3">🌿 Patient-Friendly Version</p>
                                                <h3 className="font-bold text-xl text-green-900 mb-4">What happened at your visit today</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-bold text-green-800 text-sm mb-1">What you have:</p>
                                                        <p className="text-green-700">{scanResult.extracted_entities?.diagnosis || "See your doctor's notes"}</p>
                                                    </div>
                                                    {Array.isArray(scanResult.prescription) && scanResult.prescription.length > 0 && (
                                                        <div>
                                                            <p className="font-bold text-green-800 text-sm mb-2">What to do:</p>
                                                            <ul className="space-y-1">
                                                                {scanResult.prescription.map((rx: any, i: number) => (
                                                                    <li key={i} className="flex items-start gap-2 text-green-700">
                                                                        <span className="text-green-400 mt-1">•</span>
                                                                        <span>Take {typeof rx === "string" ? rx : `${rx?.medication} ${rx?.dosage || ""} ${rx?.frequency || ""}`.trim()}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                                        <p className="font-bold text-amber-800 text-sm mb-1">⚠ When to call your doctor:</p>
                                                        <p className="text-amber-700 text-sm">Call if symptoms worsen, you develop new symptoms, or you have concerns about your medications.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 justify-end">
                                                <button onClick={() => window.print()} className="h-11 px-6 rounded-full border-2 border-[#0F172A] text-[#0F172A] font-bold hover:bg-[#0F172A] hover:text-white transition-all text-sm">Print Summary</button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-3xl">
                                            <Users className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-[#64748B] font-medium">Process a consultation to generate the patient summary.</p>
                                            <button onClick={() => setActiveTab("upload")} className="mt-6 bg-[#0F172A] text-white px-6 h-11 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">Go to Upload</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* === FOLLOW-UPS === */}
                            {activeTab === "followups" && (
                                <motion.div key="followups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Follow-Up Reminders</h2>
                                    <p className="text-[#64748B] font-sans mb-8">AI-generated follow-up action items from the latest consultation.</p>
                                    {Array.isArray(scanResult?.followups) && scanResult.followups.length > 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            {scanResult.followups.map((fu: any, i: number) => (
                                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                                    className="flex items-start gap-6 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                                                    <div className="w-12 h-12 rounded-xl bg-[#00F5D4]/10 flex items-center justify-center shrink-0 border border-[#00F5D4]/20">
                                                        <Calendar className="w-6 h-6 text-[#0F172A]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-[#0F172A] text-base">{typeof fu === "string" ? fu : fu?.message}</p>
                                                        {fu?.date && <p className="text-sm text-[#64748B] mt-1">📅 {fu.date}</p>}
                                                        {fu?.type && <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] uppercase tracking-widest">{fu.type}</span>}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-3xl">
                                            <Activity className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-[#64748B] font-medium">No follow-ups generated yet. Process a consultation first.</p>
                                            <button onClick={() => setActiveTab("upload")} className="mt-6 bg-[#0F172A] text-white px-6 h-11 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">Go to Upload</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* === INSURANCE REPORT === */}
                            {activeTab === "insurance" && <InsuranceTab scanResult={scanResult} jobId={jobId} providerName={providerName} />}

                            {/* === SMART BILLING === */}
                            {activeTab === "billing" && <BillingTab jobId={jobId} />}

                            {/* === PATIENT JOURNEY WIZARD === */}
                            {activeTab === "journey" && <PatientJourneyTab providerName={providerName} />}

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

            {/* Global Modals */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50"
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-[#F8FAFC]">
                                <h2 className="font-serif text-2xl text-[#0F172A]">Provider Settings</h2>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Display Name</label>
                                    <input type="text" value={tempProviderName} onChange={(e) => setTempProviderName(e.target.value)} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] focus:ring-2 focus:ring-[#00F5D4]/20 transition-all font-medium text-[#0F172A]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Global UI Theme</label>
                                    <select value={tempUiTheme} onChange={(e) => setTempUiTheme(e.target.value)} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] focus:ring-2 focus:ring-[#00F5D4]/20 transition-all font-medium text-[#0F172A]">
                                        <option value="Pristine Light">Pristine Light (Active)</option>
                                        <option value="Midnight Slate">Midnight Slate</option>
                                        <option value="High Contrast Dark">High Contrast Dark</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Agent Mode</label>
                                    <select value={tempAgentMode} onChange={(e) => setTempAgentMode(e.target.value)} className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0F172A] transition-all font-medium text-[#0F172A]">
                                        <option value="Full 9-Agent Clinical Suite">Full 9-Agent Clinical Suite</option>
                                        <option value="Transcription Only (Whisper)">Transcription Only (Whisper)</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 text-sm font-bold text-[#64748B] hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                    <button onClick={() => {
                                        setProviderName(tempProviderName)
                                        setUiTheme(tempUiTheme)
                                        setAgentMode(tempAgentMode)
                                        setShowSettings(false)
                                    }} className="px-5 py-2.5 text-sm font-bold bg-[#0F172A] text-white hover:bg-gray-800 rounded-xl transition-colors shadow-lg">Save Preferences</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    )
}
