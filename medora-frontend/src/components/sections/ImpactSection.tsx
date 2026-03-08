import { motion } from "framer-motion"
import { Clock, TrendingUp, Cpu, HeartPulse } from "lucide-react"

const impacts = [
    {
        icon: Clock,
        metric: "2.5+",
        unit: "Hours Saved",
        title: "Daily Documentation Reclaimed",
        description: "Regain critical administrative hours daily with zero-click ambient listening."
    },
    {
        icon: TrendingUp,
        metric: "98.7%",
        unit: "Extraction Accuracy",
        title: "Rigorous Clinical Precision",
        description: "Gemini 1.5 strictly mapped to JSON schemas ensures nothing is missed."
    },
    {
        icon: Cpu,
        metric: "Zero",
        unit: "Tokens Wasted",
        title: "Cost-Effective Orchestration",
        description: "Our proprietary format-filling algorithms completely bypass expensive LLM token burns."
    },
    {
        icon: HeartPulse,
        metric: "10x",
        unit: "Patient Focus",
        title: "Restoring the Human Element",
        description: "Make eye contact. Listen. Medora handles the rest behind the scenes."
    }
]

export default function ImpactSection() {
    return (
        <section className="py-24 bg-[#0F172A] relative overflow-hidden" id="impact">
            {/* Ambient Background Blur */}
            <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-[#00F5D4] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
                    >
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Provider ROI & Impact</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight"
                    >
                        Amplifying the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-blue-400">Healer's Bandwidth</span>.
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-400 max-w-3xl mx-auto font-sans"
                    >
                        By offloading 100% of clerical and rote tasks to an optimized cluster of AI agents, we let providers focus entirely on what actually matters: patient outcomes.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {impacts.map((impact, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative h-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-[#00F5D4]/30 transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <impact.icon className="w-6 h-6 text-[#00F5D4]" />
                                    </div>
                                    <div className="mb-6 flex flex-col">
                                        <span className="font-serif text-6xl text-white tracking-tight mb-2 group-hover:text-[#00F5D4] transition-colors">{impact.metric}</span>
                                        <span className="text-sm font-bold uppercase tracking-widest text-[#00F5D4]">{impact.unit}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white mb-3">{impact.title}</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">{impact.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
