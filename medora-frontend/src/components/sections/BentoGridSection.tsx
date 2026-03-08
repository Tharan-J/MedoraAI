import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

export default function BentoGridSection() {
    const [timer, setTimer] = useState(2.0)
    const [isHovered, setIsHovered] = useState(false)

    // Speed timer logic
    useEffect(() => {
        if (isHovered) {
            if (timer > 0.1) {
                const timeout = setTimeout(() => {
                    setTimer((prev) => parseFloat(Math.max(0.1, prev - 0.1).toFixed(1)))
                }, 30)
                return () => clearTimeout(timeout)
            }
        } else {
            setTimer(2.0)
        }
    }, [timer, isHovered])

    return (
        <section className="py-32 bg-[#FFFFFF]">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl font-normal text-[#0F172A] mb-4">Why Medora AI</h2>
                    <p className="text-lg text-[#64748B] max-w-2xl mx-auto font-sans">
                        Designed for clinical excellence. Engineered for speed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-5xl mx-auto">

                    {/* Card 1: Precision (Large left column) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-2 glass-card rounded-3xl overflow-hidden border border-gray-100 p-8 shadow-sm group relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00F5D4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <h3 className="font-serif text-3xl text-[#0F172A] mb-4">Unmatched Precision</h3>
                        <p className="text-[#64748B] mb-8 max-w-sm">
                            Our Clinical Extraction Agent understands complex medical terminology, accents, and context shifts flawlessly.
                        </p>

                        <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 h-64 relative overflow-hidden flex items-center justify-center">
                            <p className="text-[#0F172A] font-mono text-sm leading-relaxed max-w-lg transition-all duration-700 blur-[6px] opacity-70 group-hover:blur-none group-hover:opacity-100">
                                Patient is a 54-year-old male presenting with a 3-week history of progressively worsening dyspnea on exertion. He notes associated orthopnea, requiring two pillows at night, and paroxysmal nocturnal dyspnea. Has a history of type 2 diabetes and hypertension. Current medications include Lisinopril 20mg daily and Metformin 1000mg BID.
                            </p>

                            <div className="absolute inset-0 flex items-center justify-center bg-white/20 transition-all duration-700 group-hover:opacity-0 group-hover:scale-110 pointer-events-none">
                                <span className="bg-[#0F172A] text-white px-4 py-2 rounded-full font-medium shadow-lg z-10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse"></span>
                                    Hover to focus
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Speed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        className="glass-card rounded-3xl overflow-hidden border border-gray-100 p-8 shadow-sm flex flex-col justify-between group"
                    >
                        <div>
                            <h3 className="font-serif text-2xl text-[#0F172A] mb-2">Instant Generation</h3>
                            <p className="text-[#64748B] text-sm">Notes are finalized the moment you finish speaking.</p>
                        </div>

                        <div className="mt-8 flex flex-col items-center justify-center">
                            <div className="text-5xl font-mono text-[#0F172A] tracking-tighter tabular-nums mb-4 flex items-center justify-center h-16">
                                {timer.toFixed(1)}s
                            </div>
                            <div className="h-8 flex items-center justify-center">
                                {timer <= 0.1 ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center text-[#00F5D4] font-medium transition-all"
                                    >
                                        <CheckCircle2 className="w-6 h-6 mr-2 fill-[#00F5D4]/20" /> Processed
                                    </motion.div>
                                ) : (
                                    <div className="w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00F5D4] animate-[pulse_1s_infinite]"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="glass-card rounded-3xl overflow-hidden border border-gray-100 p-8 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="font-serif text-2xl text-[#0F172A] mb-2">Clinical-Grade Security</h3>
                            <p className="text-[#64748B] text-sm">End-to-end encryption. HIPAA compliant architecture.</p>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#00F5D4]/20 to-transparent opacity-50"></div>
                                <div className="w-8 h-8 rounded-full border-[3px] border-[#00F5D4] border-t-transparent animate-spin"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#00F5D4]/50 backdrop-blur-md"></div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
