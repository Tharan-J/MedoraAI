import { Link } from "react-router-dom"
import { Activity } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-16">
            <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8 relative">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-[#0F172A] p-2 rounded-xl flex justify-center items-center shadow-md relative overflow-hidden group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-[#00F5D4] opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                            <Activity className="w-5 h-5 text-[#00F5D4] relative z-10" />
                        </div>
                        <span className="font-serif text-2xl tracking-tight text-[#0F172A]">Medora AI</span>
                    </Link>
                    <p className="text-[#64748B] text-sm font-sans mt-2">
                        The invisible intellect in modern clinical corridors.
                    </p>
                </div>

                <nav className="flex flex-wrap items-center justify-center md:justify-end gap-10 text-sm font-medium text-[#64748B] font-sans">
                    <Link to="/about" className="hover:text-[#00F5D4] transition-colors">Philosophy</Link>
                    <Link to="/docs" className="hover:text-[#00F5D4] transition-colors">Documentation</Link>
                    <Link to="/security" className="hover:text-[#00F5D4] transition-colors">Trust & Security</Link>
                    <Link to="/privacy" className="hover:text-[#00F5D4] transition-colors">Privacy Paradigm</Link>
                </nav>
            </div>
        </footer>
    )
}
