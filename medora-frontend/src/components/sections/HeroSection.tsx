import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, FileText, ClipboardList, Activity, Pill, ShieldCheck, Users, Database } from "lucide-react"
import { useEffect, useState } from "react"

const agents = [
    { id: "audio", name: "Audio Input", icon: Mic },
    { id: "transcription", name: "Transcription Agent", icon: FileText },
    { id: "clinical", name: "Clinical Extraction", icon: ClipboardList },
    { id: "soap", name: "SOAP Generator", icon: Activity },
    { id: "icd", name: "ICD Coding Agent", icon: Database },
    { id: "prescription", name: "Prescription Agent", icon: Pill },
    { id: "safety", name: "Drug Safety Agent", icon: ShieldCheck },
    { id: "summary", name: "Patient Summary", icon: Users },
]

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % agents.length)
        }, 800) // 800ms per node
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] pt-32 pb-32">
            {/* Background soft gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F5D4]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F172A]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container relative mx-auto px-6 text-center max-w-5xl z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#0F172A] border border-gray-200 shadow-sm mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#00F5D4] mr-2 animate-pulse"></span>
                        Medora AI Intelligence Pipeline
                    </span>
                    <h1 className="font-serif text-6xl md:text-8xl font-normal tracking-tight text-[#0F172A] mb-8 leading-[1.1]">
                        The surgical precision of AI,<br className="hidden md:block" /> invisible in your clinic.
                    </h1>
                    <p className="text-xl text-[#64748B] mb-12 max-w-3xl mx-auto leading-relaxed font-sans">
                        Medora AI silently listens to doctor–patient conversations and instantly structures clinical documentation. Less typing, more patient care.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-[#0F172A] text-white hover:bg-[#0F172A]/90 transition-transform active:scale-95 shadow-lg shadow-slate-900/20">
                            Launch Medora
                            <ArrowRight className="ml-2 w-5 h-5 text-[#00F5D4]" />
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-white border-gray-200 text-[#0F172A] hover:bg-gray-50 transition-transform active:scale-95 shadow-sm">
                            View Clinic Demo
                        </Button>
                    </div>
                </motion.div>

                {/* The Kinetic Heartbeat Pipeline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-24 relative mx-auto max-w-full"
                >
                    <div className="glass-card rounded-3xl p-8 relative overflow-hidden flex flex-wrap justify-center items-center">
                        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 relative z-10">
                            {agents.map((agent, index) => {
                                const isActive = index === activeIndex
                                const isPast = index < activeIndex

                                return (
                                    <div key={agent.id} className="flex items-center">
                                        <div
                                            className={`relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl border transition-all duration-500 ${isActive
                                                    ? "bg-white border-[#00F5D4] shadow-[0_0_30px_rgba(0,245,212,0.3)] scale-110 z-10"
                                                    : isPast
                                                        ? "bg-white/80 border-[#00F5D4]/30 text-[#0F172A]"
                                                        : "bg-white/40 border-white/40 text-[#64748B]"
                                                }`}
                                        >
                                            <agent.icon className={`w-8 h-8 mb-2 transition-colors duration-500 ${isActive ? "text-[#00F5D4]" : isPast ? "text-[#0F172A]" : "text-[#64748B]/50"}`} />
                                            <span className={`text-[10px] md:text-xs text-center px-2 font-medium transition-colors duration-500 ${isActive ? "text-[#0F172A]" : isPast ? "text-[#0F172A]/80" : "text-[#64748B]/60"}`}>
                                                {agent.name}
                                            </span>

                                            {/* Ping effect on active */}
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-2xl border-2 border-[#00F5D4]"
                                                    initial={{ opacity: 1, scale: 1 }}
                                                    animate={{ opacity: 0, scale: 1.3 }}
                                                    transition={{ duration: 0.8 }}
                                                />
                                            )}
                                        </div>

                                        {index < agents.length - 1 && (
                                            <div className="w-4 md:w-8 h-[2px] bg-gray-200 relative overflow-hidden hidden lg:block">
                                                <div className={`absolute top-0 left-0 h-full bg-[#00F5D4] transition-all duration-500 ${isPast ? "w-full" : "w-0"}`}></div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
