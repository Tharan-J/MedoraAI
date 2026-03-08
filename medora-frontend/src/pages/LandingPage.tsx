import Navbar from "@/components/Navbar"
import HeroSection from "@/components/sections/HeroSection"
import BentoGridSection from "@/components/sections/BentoGridSection"
import SilentScribeSection from "@/components/sections/SilentScribeSection"
import AgentPipelineSection from "@/components/sections/AgentPipelineSection"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/Footer"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            <main>
                <HeroSection />
                <BentoGridSection />
                <SilentScribeSection />
                <AgentPipelineSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    )
}
