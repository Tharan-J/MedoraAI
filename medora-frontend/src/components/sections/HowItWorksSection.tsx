import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const steps = [
    "Consultation Audio Input",
    "Whisper Speech Recognition",
    "Clinical Understanding Agent",
    "SOAP Note Generator",
    "ICD Coding Agent",
    "Prescription Extraction Agent",
    "Drug Interaction Checker",
    "Patient Summary Generator",
    "Follow-Up Scheduler"
]

export default function HowItWorksSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">A continuous intelligence pipeline processing clinical data in real-time.</p>
                </div>

                <div className="relative">
                    <div className="flex flex-wrap justify-center gap-4 relative z-10">
                        {steps.map((step, index) => (
                            <div key={step} className="flex items-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                    className="bg-white border border-gray-200 px-6 py-4 rounded-xl shadow-sm text-sm font-medium text-gray-800 flex items-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors"></div>
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold relative z-10">
                                        {index + 1}
                                    </span>
                                    <span className="relative z-10">{step}</span>
                                </motion.div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex items-center px-2 text-gray-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
