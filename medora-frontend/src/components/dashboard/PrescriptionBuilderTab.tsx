import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pill, Plus, Trash2, Search } from "lucide-react"

interface RxItem {
    drug: string
    dose: string
    frequency: string
    duration: string
    instruction: string
}

const TEMPLATES: { name: string; icon: string; rx: RxItem[] }[] = [
    {
        name: "Common Cold",
        icon: "🤧",
        rx: [
            { drug: "Paracetamol", dose: "500mg", frequency: "Every 6h after food", duration: "3 days", instruction: "Take if fever > 38°C" },
            { drug: "Cetirizine", dose: "10mg", frequency: "Once daily at night", duration: "5 days", instruction: "May cause drowsiness" },
            { drug: "Steam Inhalation", dose: "—", frequency: "Twice daily", duration: "3 days", instruction: "Add menthol drops if available" },
        ]
    },
    {
        name: "Hypertension",
        icon: "🫀",
        rx: [
            { drug: "Amlodipine", dose: "5mg", frequency: "Once daily morning", duration: "30 days", instruction: "Monitor BP regularly" },
            { drug: "Losartan", dose: "50mg", frequency: "Once daily", duration: "30 days", instruction: "Avoid potassium supplements" },
        ]
    },
    {
        name: "Type 2 Diabetes",
        icon: "🩸",
        rx: [
            { drug: "Metformin", dose: "500mg", frequency: "Twice daily with meals", duration: "30 days", instruction: "Monitor blood glucose before meals" },
            { drug: "Glimepiride", dose: "1mg", frequency: "Once daily before breakfast", duration: "30 days", instruction: "Carry glucose tablets" },
        ]
    },
    {
        name: "GERD / Acidity",
        icon: "🔥",
        rx: [
            { drug: "Omeprazole", dose: "20mg", frequency: "Once daily before breakfast", duration: "14 days", instruction: "Avoid spicy foods and lying down after eating" },
            { drug: "Antacid (Gelusil)", dose: "10ml", frequency: "After meals as needed", duration: "PRN", instruction: "Shake well before use" },
        ]
    },
]

const DRUG_SUGGESTIONS = ["Paracetamol", "Ibuprofen", "Amoxicillin", "Azithromycin", "Cetirizine", "Metformin", "Amlodipine", "Atorvastatin", "Omeprazole", "Aspirin", "Losartan", "Metoprolol"]
const FREQ_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Every 6h", "Every 8h", "Every 12h", "As needed (PRN)", "At bedtime"]
const DURATION_OPTIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "30 days", "PRN", "Ongoing"]

export default function PrescriptionBuilderTab() {
    const [items, setItems] = useState<RxItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)

    const addItem = (drug: string = "") => {
        setItems(prev => [...prev, { drug, dose: "", frequency: "Once daily", duration: "7 days", instruction: "" }])
        setSearchTerm("")
        setShowSuggestions(false)
    }

    const updateItem = (i: number, field: keyof RxItem, val: string) =>
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

    const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

    const loadTemplate = (tpl: typeof TEMPLATES[0]) => setItems([...tpl.rx])

    const filteredSuggestions = DRUG_SUGGESTIONS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <motion.div key="rxbuilder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Prescription Builder</h2>
                    <p className="text-[#64748B] font-sans">Rapidly assemble prescriptions with smart templates and dose helpers.</p>
                </div>
                <button onClick={() => window.print()} className="h-12 px-6 rounded-full border-2 border-[#0F172A] text-[#0F172A] font-bold hover:bg-[#0F172A] hover:text-white transition-all flex items-center gap-2">
                    <Pill className="w-4 h-4" /> Print Rx
                </button>
            </div>

            {/* Quick Templates */}
            <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Quick-Load Templates</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TEMPLATES.map(tpl => (
                        <button key={tpl.name} onClick={() => loadTemplate(tpl)}
                            className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-[#00F5D4] hover:shadow-md transition-all group">
                            <span className="text-3xl block mb-3">{tpl.icon}</span>
                            <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#0F172A]">{tpl.name}</p>
                            <p className="text-xs text-[#64748B] mt-1">{tpl.rx.length} medications</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Drug Search + Add */}
            <div className="relative">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true) }}
                            onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            placeholder="Search and add a drug..." className="w-full pl-10 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all" />
                    </div>
                    <button onClick={() => addItem()} className="h-12 px-5 rounded-xl bg-[#0F172A] text-white font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Manual Add
                    </button>
                </div>
                <AnimatePresence>
                    {showSuggestions && searchTerm.length > 0 && filteredSuggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute z-30 left-0 right-20 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                            {filteredSuggestions.map(d => (
                                <button key={d} onMouseDown={() => addItem(d)}
                                    className="w-full text-left px-5 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-3 border-b border-gray-50 last:border-0">
                                    <Pill className="w-4 h-4 text-[#00F5D4]" /> {d}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rx Items */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-3xl">
                    <Pill className="w-10 h-10 text-gray-300 mb-4" />
                    <p className="text-[#64748B] font-medium">Add drugs above or pick a quick template to begin.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Pill className="w-5 h-5 text-[#00F5D4]" />
                                    <input value={item.drug} onChange={e => updateItem(i, "drug", e.target.value)}
                                        placeholder="Drug name" className="font-bold text-[#0F172A] bg-transparent border-none outline-none text-base placeholder-gray-300" />
                                </div>
                                <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Dose</label>
                                    <input value={item.dose} onChange={e => updateItem(i, "dose", e.target.value)} placeholder="e.g. 500mg"
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Frequency</label>
                                    <select value={item.frequency} onChange={e => updateItem(i, "frequency", e.target.value)}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]">
                                        {FREQ_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Duration</label>
                                    <select value={item.duration} onChange={e => updateItem(i, "duration", e.target.value)}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]">
                                        {DURATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">Instructions</label>
                                    <input value={item.instruction} onChange={e => updateItem(i, "instruction", e.target.value)} placeholder="Take after food..."
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A]" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
