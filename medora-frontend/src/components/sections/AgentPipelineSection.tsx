import { motion } from "framer-motion"
import { useState } from "react"
import {
    FileAudio, FileText, ClipboardList, Database, AlertCircle, Users, Activity, BarChart3
} from "lucide-react"

const agents = [
    { id: 0, icon: FileAudio, name: "Transcription Agent", description: "Converts audio consultation to structured text sequences." },
    { id: 1, icon: FileText, name: "Clinical Extraction Agent", description: "Identifies symptoms, diagnosis, medications, and timeframe." },
    { id: 2, icon: ClipboardList, name: "SOAP Generator Agent", description: "Builds rigorous, formatted clinical documentation." },
    { id: 3, icon: Database, name: "ICD Coding Agent", description: "Maps semantic diagnoses to accurate ICD-11 codes." },
    { id: 4, icon: AlertCircle, name: "Drug Interaction Agent", description: "Checks prescriptions against OpenFDA databases." },
    { id: 5, icon: Users, name: "Patient Summary Agent", description: "Generates accessible, patient-friendly explanations." },
    { id: 6, icon: Activity, name: "Reminder Agent", description: "Initiates actionable follow-up reminders." },
    { id: 7, icon: BarChart3, name: "Analytics Agent", description: "Compiles deep clinic utilization insights." },
]

export default function AgentPipelineSection() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)

    return (
        <section className="py-32 bg-[#F8FAFC]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-24">
                    <h2 className="font-serif text-5xl md:text-6xl text-[#0F172A] mb-4">The Synaptic Architecture</h2>
                    <p className="text-[#64748B] text-xl max-w-3xl mx-auto font-sans">
                        A parallel network of specialized AI agents working to decode complex clinical encounters.
                    </p>
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.name}
                            onMouseEnter={() => setHoveredCard(agent.id)}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: agent.id * 0.1,
                                scale: { duration: 0.3 }
                            }}
                            animate={{
                                scale: hoveredCard === agent.id ? 1.05 : 1,
                                filter: hoveredCard !== null && hoveredCard !== agent.id ? "blur(4px)" : "blur(0px)",
                                opacity: hoveredCard !== null && hoveredCard !== agent.id ? 0.6 : 1,
                            }}
                            className="glass-card rounded-3xl p-8 shadow-sm flex flex-col items-start min-h-[220px] transition-all duration-300 border border-white"
                        >
                            <div className="w-14 h-14 rounded-[1.2rem] bg-[#0F172A] flex items-center justify-center mb-6 relative overflow-hidden group-hover:shadow-[0_0_20px_#00F5D4]">
                                <div className="absolute inset-0 bg-[#00F5D4] opacity-0 group-hover:opacity-20 transition-opacity blur-md"></div>
                                <agent.icon className="w-6 h-6 text-[#00F5D4] relative z-10" />
                            </div>
                            <h3 className="text-[#0F172A] font-serif text-2xl mb-3 leading-tight">{agent.name}</h3>
                            <p className="text-sm text-[#64748B] leading-relaxed font-sans">{agent.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
