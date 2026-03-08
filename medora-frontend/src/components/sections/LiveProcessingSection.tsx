import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

const initialLogs = [
    "Audio received: consultation_023.wav",
    "Transcription Agent → transcript generated",
    "Clinical Extraction Agent → symptoms detected",
    "SOAP Generator Agent → note structured",
    "ICD Agent → codes suggested",
    "Prescription Agent → medications extracted",
    "Drug Interaction Agent → no critical interaction",
    "Patient Summary Agent → summary created",
    "Reminder Agent → follow-up scheduled"
]

export default function LiveProcessingSection() {
    const [logs, setLogs] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < initialLogs.length) {
            const timer = setTimeout(() => {
                setLogs(prev => [...prev, initialLogs[currentIndex]])
                setCurrentIndex(prev => prev + 1)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            const reset = setTimeout(() => {
                setLogs([])
                setCurrentIndex(0)
            }, 3000)
            return () => clearTimeout(reset)
        }
    }, [currentIndex, initialLogs])

    return (
        <section className="py-32 bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Medora AI Processing</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Watch how multiple agents collaborate in real-time.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl"
                >
                    <div className="rounded-xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
                        {/* Terminal Header */}
                        <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            <span className="ml-4 text-xs text-gray-400 font-mono">system-logs.sh</span>
                        </div>

                        {/* Terminal Content */}
                        <div className="p-6 font-mono text-sm leading-relaxed min-h-[350px]">
                            {logs.map((log, index) => (
                                <motion.div
                                    key={`${index}-${log}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="mb-2"
                                >
                                    <span className="text-green-400 mr-2">➜</span>
                                    <span className="text-gray-300">
                                        {log.split('→').map((part, i, arr) =>
                                            i === arr.length - 1 && arr.length > 1
                                                ? <React.Fragment key={i}> <span className="text-blue-400">→</span> <span className="text-gray-100">{part}</span></React.Fragment>
                                                : <span key={i} className="text-purple-300 font-semibold">{part}</span>
                                        )}
                                    </span>
                                </motion.div>
                            ))}
                            <motion.div
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-4 bg-gray-400 mt-2 block"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
