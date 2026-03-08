import { motion } from "framer-motion"
import { Mic, Stethoscope, Zap } from "lucide-react"

const features = [
    {
        icon: Mic,
        title: "Ambient Clinical Documentation",
        description: "Medora listens to consultations and automatically generates structured SOAP clinical notes.",
    },
    {
        icon: Stethoscope,
        title: "AI-Powered Clinical Intelligence",
        description: "Extracts symptoms, diagnoses, prescriptions, and care plans using advanced medical AI.",
    },
    {
        icon: Zap,
        title: "Smart Workflow Automation",
        description: "Handles ICD coding, drug interaction checks, follow-up reminders, and patient summaries.",
    },
]

export default function ProductHighlightsSection() {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Core Capabilities</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Reimagine your clinical workflow with an AI assistant that understands medical context natively.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
