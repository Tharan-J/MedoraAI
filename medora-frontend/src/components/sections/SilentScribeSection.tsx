import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function SilentScribeSection() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    // Left side opacity
    const leftOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0])
    const leftX = useTransform(scrollYProgress, [0.2, 0.5], [0, -50])
    const leftBlur = useTransform(scrollYProgress, [0.2, 0.5], [0, 10])

    // Right side opacity
    const rightOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1])
    const rightX = useTransform(scrollYProgress, [0.4, 0.7], [50, 0])

    // Center morphing container width
    const morphBackground = useTransform(scrollYProgress, [0.2, 0.7], ["#F1F5F9", "#0F172A"])
    const morphColor = useTransform(scrollYProgress, [0.2, 0.7], ["#64748B", "#FFFFFF"])

    return (
        <section ref={containerRef} className="py-48 bg-[#FFFFFF] relative overflow-hidden min-h-[150vh]">
            <div className="sticky top-1/4 container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-5xl md:text-6xl text-[#0F172A] mb-4">The Silent Scribe</h2>
                    <p className="text-xl text-[#64748B] max-w-2xl mx-auto font-sans">
                        From chaotic clinical conversations to perfectly structured data in seconds.
                    </p>
                </div>

                <div className="relative h-[400px] w-full max-w-5xl mx-auto flex items-center justify-center">

                    {/* Morphing background pill */}
                    <motion.div
                        style={{ backgroundColor: morphBackground }}
                        className="absolute inset-x-8 inset-y-0 rounded-[40px] shadow-sm flex items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            style={{ opacity: rightOpacity }}
                            className="absolute right-0 w-1/2 h-full bg-[#0F172A] flex flex-col justify-center px-12"
                        >
                            <h4 className="font-serif text-3xl text-white mb-6">Structured Intelligence</h4>
                        </motion.div>
                    </motion.div>

                    <div className="relative w-full h-full flex items-center px-12 md:px-20 z-10">
                        {/* Left: Messy Notes */}
                        <motion.div
                            style={{ opacity: leftOpacity, x: leftX, filter: `blur(${leftBlur}px)` }}
                            className="w-1/2 pr-8"
                        >
                            <div className="font-serif italic text-2xl md:text-3xl text-[#64748B] leading-relaxed transform -rotate-2">
                                "uh yeah, so the patient came in... saying their chest hurts for like 3 days... worse after eating something spicy. No radiation to the arm, breathing is fine though. Giving them a script for pantoprazole 40 miligrams..."
                            </div>
                        </motion.div>

                        {/* Middle Divider */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-2/3 bg-gray-300">
                            <motion.div
                                style={{ backgroundColor: morphColor }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                            />
                        </div>

                        {/* Right: Structured Notes */}
                        <motion.div
                            style={{ opacity: rightOpacity, x: rightX }}
                            className="w-1/2 pl-8 space-y-4"
                        >
                            <div className="bg-[#1E293B] p-4 rounded-xl shadow-lg border border-[#334155]">
                                <h5 className="text-[10px] font-bold text-[#00F5D4] tracking-widest uppercase mb-2">Subjective</h5>
                                <p className="text-[#F8FAFC] text-sm font-sans">Patient reports sharp chest pain persisting x 3 days, aggravating postprandially. Denies shortness of breath or radiating pain.</p>
                            </div>

                            <div className="bg-[#1E293B] p-4 rounded-xl shadow-lg border border-[#334155]">
                                <h5 className="text-[10px] font-bold text-[#00F5D4] tracking-widest uppercase mb-2">Plan</h5>
                                <p className="text-[#F8FAFC] text-sm font-sans flex items-center gap-2">
                                    <Pill className="w-4 h-4 text-[#00F5D4]" /> Pantoprazole 40mg PO daily
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Pill(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
        </svg>
    )
}
