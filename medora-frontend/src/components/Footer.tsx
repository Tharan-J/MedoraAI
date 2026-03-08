import { Link } from "react-router-dom"
import { Activity, Github, Twitter, Linkedin, HeartPulse } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-[#0F172A] text-white pt-24 pb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F5D4] to-transparent opacity-50"></div>
            
            {/* Ambient Background Blur */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00F5D4] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl flex justify-center items-center shadow-md relative overflow-hidden border border-white/20 group-hover:bg-[#00F5D4]/20 transition-all duration-300">
                                <Activity className="w-6 h-6 text-[#00F5D4]" />
                            </div>
                            <span className="font-serif text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Medora AI</span>
                        </Link>
                        <p className="text-gray-400 text-base font-sans leading-relaxed max-w-md">
                            The invisible intellect in modern clinical corridors. Translating human care into structured digital orchestration with zero friction and maximum fidelity.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"><Github className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] hover:bg-white/20 transition-all"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#0A66C2] hover:bg-white/20 transition-all"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[#00F5D4] font-semibold text-sm tracking-widest uppercase">Platform</h4>
                        <nav className="flex flex-col gap-4 text-gray-400 text-sm font-medium">
                            <Link to="/about" className="hover:text-white transition-colors flex items-center gap-2">Architecture</Link>
                            <Link to="/docs" className="hover:text-white transition-colors flex items-center gap-2">Documentation</Link>
                            <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">Live Demo</Link>
                            <Link to="/pricing" className="hover:text-white transition-colors flex items-center gap-2">Pricing</Link>
                        </nav>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[#00F5D4] font-semibold text-sm tracking-widest uppercase">Legal & Trust</h4>
                        <nav className="flex flex-col gap-4 text-gray-400 text-sm font-medium">
                            <Link to="/security" className="hover:text-white transition-colors">HIPAA Compliance</Link>
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Paradigm</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link to="/ethics" className="hover:text-white transition-colors">AI Ethics</Link>
                        </nav>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm font-medium">
                        © {new Date().getFullYear()} Medora AI. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        Built for <HeartPulse className="w-4 h-4 text-rose-500" /> Healthcare Hackathon
                    </p>
                </div>
            </div>
        </footer>
    )
}
