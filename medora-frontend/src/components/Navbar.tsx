import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"

export default function Navbar() {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/20 glass transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-[#0F172A] p-2 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#00F5D4] opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
                        <Activity className="w-5 h-5 text-[#00F5D4] relative z-10" />
                    </div>
                    <span className="font-serif text-2xl tracking-tight text-[#0F172A]">Medora AI</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/signin">
                        <Button variant="ghost" className="hidden sm:inline-flex text-[#0F172A] hover:bg-white/50 text-base font-medium">Sign In</Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-6 text-base font-medium shadow-lg shadow-[#0F172A]/10 active:scale-95 transition-all">
                            Initialize Medora
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
