import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export default function CTASection() {
    return (
        <section className="py-48 relative overflow-hidden bg-white">
            {/* Surgical Mint soft glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[#00F5D4]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

            <div className="container relative mx-auto px-6 z-10 text-center max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#0F172A] rounded-[3rem] p-16 md:p-24 shadow-2xl relative overflow-hidden flex flex-col items-center border border-gray-800"
                >
                    {/* subtle pattern inside CTA */}
                    <div className="absolute inset-0 bg-[#00F5D4] opacity-5 mix-blend-overlay"></div>

                    <div className="mx-auto w-16 h-16 rounded-full bg-[#00F5D4]/10 flex items-center justify-center mb-8 relative z-10">
                        <div className="absolute inset-0 rounded-full border border-[#00F5D4]/30 animate-ping"></div>
                        <Sparkles className="w-8 h-8 text-[#00F5D4]" />
                    </div>
                    <h2 className="font-serif text-5xl md:text-7xl font-normal text-white mb-6 relative z-10">
                        Automate the Clinic,<br />Elevate the Care.
                    </h2>
                    <p className="text-xl text-[#CBD5E1] mb-12 max-w-2xl mx-auto font-sans relative z-10">
                        Medora AI requires zero changes to your existing clinical workflow. Just speak with your patient, and let intelligence handle the rest.
                    </p>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-[0_0_20px_#00F5D4] bg-[#00F5D4] text-[#0F172A] hover:bg-[#00F5D4]/90 active:scale-95 transition-all outline-none">
                            Deploy Intelligence
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 active:scale-95 transition-all">
                            Read Documentation <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
