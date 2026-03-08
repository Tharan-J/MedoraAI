import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { 
    Mic, FileText, ClipboardList, Database, Pill, 
    ShieldCheck, Users, Activity, ArrowRight, ActivitySquare,
    Zap, Code, Sparkles, AudioWaveform, Cpu, Terminal
} from "lucide-react"
import { Link } from "react-router-dom"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ImpactSection from "@/components/sections/ImpactSection"

const agents = [
    { id: "audio", name: "Whisper ASR", role: "Transcription", icon: Mic, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { id: "clinical", name: "Gemini 1.5 Pro", role: "Entity Extraction", icon: Code, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
    { id: "soap", name: "SOAP Engine", role: "Note Generation", icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { id: "icd", name: "ICD-11 Agent", role: "Medical Coding", icon: Database, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { id: "prescription", name: "Rx Builder", role: "Prescriptions", icon: Pill, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { id: "safety", name: "OpenFDA Check", role: "Drug Interactions", icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
    { id: "summary", name: "Patient Output", role: "Layman Summary", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-100" },
]

const howItWorksSteps = [
    {
        id: "step-1",
        label: "PHASE 1 — INGESTION & EXTRACTION",
        title: "Transcription & Flash Parsing",
        desc: "The Pipeline begins with Agent 1 (Whisper ASR) flawlessly dictating ambient audio. Agent 2 (Gemini 1.5 Flash) then parses this transcript specifically for clinical entities, utilizing rigorous JSON schema matching.",
        icon: Mic,
        cmd: "Running: Agents 1 & 2 - Extraction Pipeline",
        code: `{\n  "status": "Transcribed",\n  "entities": {\n    "symptoms": ["headache", "fever"],\n    "medications": ["Ibuprofen"]\n  }\n}`
    },
    {
        id: "step-2",
        label: "PHASE 2 — CORE GENERATION",
        title: "Zero-Token SOAP Notes",
        desc: "Agent 3 formats the extracted objects into a structured Subjective, Objective, Assessment, and Plan document instantly via pure programmatic template parsing—burning essentially zero LLM tokens for generation.",
        icon: FileText,
        cmd: "Running: Agent 3 - SOAP Engine",
        code: `{\n  "task": "SOAP Formatting (Zero Token)",\n  "subjective": "Patient complains of headache...",\n  "plan": "Rest and hydration."\n}`
    },
    {
        id: "step-3",
        label: "PHASE 3 — PARALLEL EXPERT CLUSTER",
        title: "Codes, Prescriptions & Summaries",
        desc: "Execution branches into parallel: Agent 4 maps ICD-11 codes via local CSV. Agent 5 structures the prescription. Agent 7 generates a friendly patient-facing summary simultaneously.",
        icon: Cpu,
        cmd: "Running: Agents 4, 5, 7 - Parallel Array",
        code: `[\n  {"agent": "ICD-11", "status": "R51 (Headache)"},\n  {"agent": "Prescription", "status": "Ibuprofen Constructed"},\n  {"agent": "Summary", "status": "Complete"}\n]`
    },
    {
        id: "step-4",
        label: "PHASE 4 — SAFETY & PERSISTENCE",
        title: "OpenFDA Checks & Analytics",
        desc: "Crucially, Agent 6 verifies all proposed medications against OpenFDA for adverse interactions. Agent 8 schedules follow-ups, and Agent 9 pushes aggregate metrics to standard SQLite.",
        icon: ShieldCheck,
        cmd: "Running: Agents 6, 8, 9 - Safety & Logging",
        code: `{\n  "fda_interaction_check": "Safe / No warnings",\n  "follow_up": "Generated Scheduled Loop",\n  "analytics": "Metrics Synced successfully"\n}`
    }
]

export default function LandingPage() {
    const [activeNode, setActiveNode] = useState(0)
    const [activeStep, setActiveStep] = useState(0)
    const [displayedCode, setDisplayedCode] = useState("")
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        const fullCode = howItWorksSteps[activeStep].code;
        let p = 0;
        setDisplayedCode("");
        const typeInterval = setInterval(() => {
            if (p < fullCode.length) {
                setDisplayedCode(() => fullCode.substring(0, p + 1));
                p++;
            } else {
                clearInterval(typeInterval);
            }
        }, 15);
        return () => clearInterval(typeInterval);
    }, [activeStep])

    useEffect(() => {
        if (isHovering) return;
        const autoPlayTimer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % howItWorksSteps.length);
        }, 5000);
        return () => clearInterval(autoPlayTimer);
    }, [isHovering]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNode((prev) => (prev + 1) % agents.length)
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-clip font-sans">
            {/* Ambient Background Glows */}
            <div className="ambient-glow bg-[#00F5D4] w-[600px] h-[600px] top-[-200px] left-[-200px] opacity-20"></div>
            <div className="ambient-glow bg-[#8B5CF6] w-[500px] h-[500px] bottom-[10%] right-[-100px] opacity-10"></div>

            <Navbar />

            <main className="relative z-10 pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* HERO SECTION */}
                <section className="relative w-full md:py-32 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
                    <motion.div
                        className="flex-1 text-left"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 mb-8 shadow-sm">
                            <Sparkles className="w-4 h-4 text-[#00F5D4]" />
                            <span className="text-sm font-semibold text-[#0F172A] tracking-wide">MedoraAI Healthcare Hackathon 2026</span>
                        </div>
                        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-6 leading-tight text-[#0F172A]">
                            Ambient Clinical <br className="hidden lg:block"/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#0F172A]">Note Generator</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mb-10 leading-relaxed font-sans font-medium">
                            Convert doctor-patient consultation audio into highly structured clinical documentation instantly. 
                            Powered by a multi-agent LangGraph architecture with Gemini 1.5 Flash.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <Link to="/dashboard" className="h-[60px] px-10 text-lg font-bold rounded-full w-full sm:w-auto bg-[#0F172A] text-white hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.5)]">
                                Try Live Demo
                                <ArrowRight className="w-5 h-5 text-[#00F5D4]" />
                            </Link>
                            <button 
                                onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
                                className="h-[60px] px-10 text-lg font-bold rounded-full w-full sm:w-auto bg-white text-[#0F172A] border-2 border-gray-200 hover:border-[#00F5D4]/50 hover:bg-[#00F5D4]/5 transition-all flex items-center justify-center shadow-sm">
                                View Architecture
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="flex-1 w-full relative h-[500px] hidden md:block"
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {/* Abstract 3D/Glass Hero Art */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00F5D4]/20 to-transparent rounded-[3rem] p-8 border border-white/40 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#0F172A] rounded-full blur-[80px] opacity-10"></div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm w-[80%] transform -rotate-2">
                                    <Mic className="w-6 h-6 text-[#0F172A]" />
                                    <div className="flex flex-col">
                                        <div className="h-2 w-24 bg-gray-200 rounded-full mb-2"></div>
                                        <div className="h-2 w-32 bg-[#00F5D4]/40 rounded-full"></div>
                                    </div>
                                    <AudioWaveform className="w-6 h-6 text-[#00F5D4] ml-auto animate-pulse" />
                                </div>
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm w-[75%] ml-auto transform rotate-1">
                                    <ActivitySquare className="w-6 h-6 text-[#00F5D4]" />
                                    <div className="flex flex-col w-full">
                                        <div className="h-2 w-20 bg-gray-200 rounded-full mb-2"></div>
                                        <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm w-[90%] transform -rotate-1 mt-4">
                                    <FileText className="w-6 h-6 text-[#0F172A]" />
                                    <div className="flex flex-col w-full">
                                        <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                                        <div className="h-2 w-[80%] bg-gray-200 rounded-full mb-2"></div>
                                        <div className="h-2 w-[60%] bg-[#00F5D4]/40 rounded-full"></div>
                                    </div>
                                    <ShieldCheck className="w-6 h-6 text-green-500 ml-auto" />
                                </div>
                            </div>
                            
                            <div className="relative z-10 bg-[#0F172A] p-6 rounded-3xl mt-12 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold text-[#00F5D4]">Orchestration</span>
                                    <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping"></span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"><Cpu className="w-5 h-5 text-white" /></div>
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"><Terminal className="w-5 h-5 text-white" /></div>
                                    <div className="h-10 w-10 rounded-xl bg-[#00F5D4]/20 flex items-center justify-center border border-[#00F5D4]/50"><Zap className="w-5 h-5 text-[#00F5D4]" /></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ARCHITECTURE SHOWCASE */}
                <section className="py-24 border-t border-gray-200" id="architecture">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-4xl md:text-5xl mb-4">9-Agent Orchestration Engine</h2>
                        <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-sans">
                            A highly optimized, parallel LangGraph network where each specialized AI agent handles one piece of the clinical puzzle.
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden bg-white/60">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-6 relative z-10">
                            {agents.map((agent, idx) => (
                                <motion.div 
                                    key={agent.id}
                                    className="flex flex-col items-center text-center"
                                    animate={{ 
                                        y: activeNode === idx ? -10 : 0,
                                        scale: activeNode === idx ? 1.05 : 1
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-500 bg-white
                                        ${activeNode === idx ? `border-[#0F172A] shadow-[0_0_20px_rgba(15,23,42,0.1)]` : `${agent.border} ${agent.bg} shadow-sm`}
                                    `}>
                                        <agent.icon className={`w-8 h-8 ${activeNode === idx ? "text-[#0F172A]" : agent.color}`} />
                                    </div>
                                    <h3 className={`font-medium mb-1 transition-colors ${activeNode === idx ? "text-[#0F172A]" : "text-[#334155]"}`}>
                                        {agent.name}
                                    </h3>
                                    <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">
                                        {agent.role}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS (Agents Terminal Showcase) - Auto Play Update */}
                <section 
                    className="relative w-full my-16 bg-white text-[#0F172A] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-[3rem] overflow-hidden py-20 px-4 md:px-0" 
                    id="how-it-works"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Light gradient blobs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F5D4]/10 blur-[120px] pointer-events-none rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-[#8B5CF6]/10 blur-[120px] pointer-events-none rounded-full"></div>

                    <div className="max-w-7xl mx-auto relative z-10 w-full md:px-16">
                        <div className="text-center mb-16 md:mb-20">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/20 mb-6">
                                    <Sparkles className="w-4 h-4 text-[#00F5D4]" />
                                    <span className="text-xs font-semibold text-[#00F5D4] uppercase tracking-widest">Agentic Workflow Architecture</span>
                                </div>
                                <h2 className="font-serif text-4xl md:text-6xl mb-4 tracking-tight text-[#0F172A] leading-tight">
                                    Not just a chatbot.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">A Team of Specialists.</span>
                                </h2>
                                <p className="text-[#64748B] text-base md:text-xl max-w-3xl mx-auto font-sans">
                                    Medora cascades input through an optimized 9-agent pipeline, meticulously segmenting the workload between deterministic code, APIs, and LLM inferences.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Left: Steps Flow */}
                                <div className="flex flex-col gap-4 relative">
                                    {/* Vertical connection line */}
                                    <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gray-200 z-0 hidden md:block"></div>

                                    {howItWorksSteps.map((step, idx) => {
                                        const isActive = activeStep === idx;
                                        return (
                                            <div 
                                                key={step.id} 
                                                onClick={() => setActiveStep(idx)}
                                                onMouseEnter={() => setActiveStep(idx)}
                                                className={`flex items-start gap-4 md:gap-6 relative z-10 cursor-pointer transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-40 hover:opacity-70 scale-[0.98]"}`}
                                            >
                                                <div className={`mt-2 flex-shrink-0 w-12 h-12 md:w-[4.5rem] md:h-[4.5rem] rounded-2xl flex items-center justify-center transition-all duration-300 hidden md:flex border-2 backdrop-blur-sm shadow-sm
                                                    ${isActive 
                                                        ? "bg-white border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.15)] text-[#8B5CF6]" 
                                                        : "bg-[#F8FAFC] border-gray-200 text-gray-400 group-hover:border-gray-300 group-hover:text-[#64748B]"
                                                    }`}
                                                >
                                                    <step.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                                                </div>

                                                <div className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 flex-1
                                                    ${isActive 
                                                        ? "bg-white border-[#00F5D4] shadow-xl" 
                                                        : "bg-[#F8FAFC] border-gray-200/80 hover:bg-white hover:border-gray-300 hover:shadow-sm"
                                                    }`}
                                                >
                                                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 block ${isActive ? "text-[#8B5CF6]" : "text-[#94A3B8]"}`}>
                                                        {step.label}
                                                    </span>
                                                    <h3 className={`text-xl md:text-2xl font-serif mb-2 ${isActive ? "text-[#0F172A]" : "text-[#475569]"}`}>
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-[#64748B] font-sans leading-snug md:leading-relaxed text-sm md:text-base hidden sm:block">
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Right: Light-Dark Hybrid Terminal Visualizer */}
                                <div className="bg-[#0F172A] border border-gray-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] overflow-hidden w-full font-mono text-sm">
                                    {/* Top Bar */}
                                    <div className="flex items-center px-4 py-3 bg-[#1E293B] border-b border-gray-800">
                                        <div className="flex gap-2 mr-4">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="text-gray-400 text-xs flex items-center justify-center flex-1 mr-12 font-semibold">
                                            <Terminal className="w-3 h-3 mr-2" />
                                            agent_output_stream.json
                                        </div>
                                    </div>

                                    {/* Terminal Content */}
                                    <div className="p-6 md:p-8 text-gray-300 whitespace-pre-wrap">
                                        <div className="inline-flex items-center rounded bg-[#1E293B] px-3 py-1 text-xs text-blue-300 border border-blue-900/50 mb-6 font-semibold shadow-sm">
                                            ⚙️ {howItWorksSteps[activeStep].cmd}
                                        </div>
                                        
                                        <div className="text-gray-400 mb-2 font-mono flex items-center gap-2 font-semibold">
                                            <span className="text-emerald-400 font-bold">$</span> 
                                            cat agent_output.json
                                        </div>
                                        <div className="text-cyan-300 overflow-x-auto custom-scrollbar font-mono leading-relaxed bg-[#020617] p-6 rounded-lg border border-gray-800 shadow-inner relative min-h-[16rem]">
                                            <span>{displayedCode}</span>
                                            <motion.span 
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                                className="inline-block w-2 bg-cyan-400 h-4 align-middle ml-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </section>

                {/* COMPREHENSIVE OUTPUTS GRID REMOVED PER REQUEST */}

                {/* TOKEN OPTIMIZATION STRATEGY */}
                <section className="py-24 border-t border-gray-200" id="optimization">
                    <div className="glass-card rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col md:flex-row gap-12 items-center bg-white/60">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-600">Extreme Token Efficiency</span>
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl mb-6">Optimized for Production</h2>
                            <p className="text-[#64748B] text-lg mb-6 leading-relaxed font-sans">
                                Our architecture isolates LLM calls to exactly where they are needed. By utilizing zero-LLM template agents and local APIs, we reduce total API calls per consultation to just <strong>2–4 queries</strong>.
                            </p>
                            <ul className="space-y-4 text-[#334155] font-sans">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center"><Activity className="w-3 h-3 text-[#00F5D4]" /></div>
                                    Full transcript sent exactly once
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center"><Activity className="w-3 h-3 text-[#00F5D4]" /></div>
                                    Local Whisper ASR ($0 cost)
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center"><Activity className="w-3 h-3 text-[#00F5D4]" /></div>
                                    Zero-token template fillers for SOAP
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full glass bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <table className="w-full text-left border-collapse font-sans">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-4 text-sm font-medium text-[#64748B]">Agent Function</th>
                                        <th className="py-4 text-sm font-medium text-[#64748B]">LLM Calls</th>
                                        <th className="py-4 text-sm font-medium text-[#64748B]">Tokens Sent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-[#0F172A]">Transcription</td>
                                        <td className="py-4 text-emerald-600 font-medium">0</td>
                                        <td className="py-4 text-[#64748B] text-sm">Whisper (local)</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-[#0F172A]">Clinical Extraction</td>
                                        <td className="py-4 text-amber-500 font-medium">1</td>
                                        <td className="py-4 text-[#64748B] text-sm">Full Transcript</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-[#0F172A]">SOAP Generator</td>
                                        <td className="py-4 text-emerald-600 font-medium">0</td>
                                        <td className="py-4 text-[#64748B] text-sm">Template Fill</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-[#0F172A]">ICD-11 Coding</td>
                                        <td className="py-4 text-emerald-600 font-medium">0-1</td>
                                        <td className="py-4 text-[#64748B] text-sm">Diagnosis Only</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-[#0F172A]">Drug Interactions</td>
                                        <td className="py-4 text-emerald-600 font-medium">0-1</td>
                                        <td className="py-4 text-[#64748B] text-sm">Drug Names Only</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
            
            <ImpactSection />
            <Footer />
        </div>
    )
}
