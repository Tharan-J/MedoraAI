import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Stethoscope } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignInPage() {
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Small delay to allow the "point of light" animation to trigger properly
        const timer = setTimeout(() => setIsLoaded(true), 200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

            {/* Ambient background motion: slow moving large radial gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [-20, 20, -20],
                    y: [-20, 20, -20]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-white rounded-full blur-[120px] -z-10 translate-x-[-30%] translate-y-[-30%]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [20, -20, 20],
                    y: [20, -20, 20]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-[#00F5D4]/10 rounded-full blur-[120px] -z-10 translate-x-[30%] translate-y-[30%]"
            />

            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        key="point-of-light"
                        initial={{ scale: 0, opacity: 1 }}
                        exit={{ scale: [1, 2, 0], opacity: [1, 1, 0], filter: "blur(0px)" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-4 h-4 rounded-full bg-white shadow-[0_0_50px_10px_#00F5D4] absolute z-20"
                    />
                )}

                {isLoaded && (
                    <motion.div
                        key="login-card"
                        initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)", y: 20 }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
                        className="w-full max-w-md z-30 relative"
                    >
                        <div className="flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                                    <Stethoscope className="w-6 h-6 text-[#00F5D4]" />
                                </div>
                                <span className="font-serif text-3xl tracking-tight text-[#0F172A]">Medora AI</span>
                            </Link>
                        </div>

                        <Card className="glass-card shadow-2xl shadow-slate-200/50 border-white">
                            <CardHeader className="space-y-2 pb-6 pt-10 px-8 text-center">
                                <CardTitle className="font-serif text-3xl font-normal tracking-tight text-[#0F172A]">Secure Entry</CardTitle>
                                <CardDescription className="text-base text-[#64748B] font-sans">
                                    End-to-end encrypted clinical workspace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            id="email"
                                            placeholder="Provider Email"
                                            type="email"
                                            className="h-12 text-base px-4 bg-white/50 border-gray-200 focus:bg-white focus:border-[#00F5D4] focus:ring-[#00F5D4]/20 transition-all font-sans"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-12 text-base px-4 bg-white/50 border-gray-200 focus:bg-white focus:border-[#00F5D4] focus:ring-[#00F5D4]/20 transition-all font-sans"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer text-[#64748B] font-medium font-sans">
                                        <input type="checkbox" className="rounded border-gray-300 text-[#0F172A] shadow-sm focus:border-[#0F172A] focus:ring-[#0F172A]/20 focus:ring-opacity-50" />
                                        Require Biometrics
                                    </label>
                                    <Link to="/forgot-password" className="text-[#0F172A] font-medium hover:underline font-sans">
                                        Reset Token
                                    </Link>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4 px-8 pb-10 pt-2">
                                <Link to="/dashboard" className="w-full">
                                    <Button className="w-full h-14 text-lg font-medium shadow-xl shadow-[#0F172A]/10 active:scale-[0.98] bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full transition-all">
                                        Authenticate
                                    </Button>
                                </Link>
                                <div className="text-center mt-2 w-full">
                                    <span className="text-xs text-[#64748B] flex items-center justify-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse"></span>
                                        Connection secured via Medora Intranet
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
