import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardList, Plus, Trash2, CheckSquare, Square } from "lucide-react"

const DISEASE_OPTIONS = ["Hypertension", "Diabetes Type 2", "Asthma", "GERD", "Hypothyroidism", "Arthritis", "Heart Disease", "COPD", "Depression", "None"]
const ALLERGY_OPTIONS = ["Penicillin", "Sulfa drugs", "NSAIDs", "Aspirin", "Latex", "None"]
const FOOD_ALLERGY_OPTIONS = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Soy", "None"]

export default function IntakeTab() {
    const [form, setForm] = useState({
        name: "", age: "", gender: "Male", contact: "",
        diseases: [] as string[], surgeries: "", familyHistory: "",
        currentMedications: "",
        drugAllergies: [] as string[], foodAllergies: [] as string[],
        smoking: "No", alcohol: "No", exercise: "Occasionally",
        chiefComplaint: ""
    })
    const [saved, setSaved] = useState(false)

    const toggle = (field: "diseases" | "drugAllergies" | "foodAllergies", val: string) => {
        setForm(f => ({
            ...f,
            [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
        }))
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const CheckItem = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
        <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${checked ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-[#64748B] border-gray-200 hover:border-[#0F172A]/30"}`}>
            {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {label}
        </button>
    )

    const Input = ({ label, value, onChange, placeholder = "", type = "text" }: any) => (
        <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] focus:ring-2 focus:ring-[#00F5D4]/10 transition-all font-medium text-[#0F172A]" />
        </div>
    )

    const Select = ({ label, value, onChange, options }: any) => (
        <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">{label}</label>
            <select value={value} onChange={onChange}
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all font-medium text-[#0F172A]">
                {options.map((o: string) => <option key={o}>{o}</option>)}
            </select>
        </div>
    )

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-[#00F5D4]" /> {title}
            </h3>
            {children}
        </div>
    )

    return (
        <motion.div key="intake" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-5xl text-[#0F172A] mb-2">Patient Intake</h2>
                    <p className="text-[#64748B] font-sans">Structured pre-consultation patient data capture template.</p>
                </div>
                <AnimatePresence>
                    {saved && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-full font-semibold text-sm">
                            ✓ Intake record saved
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Section title="Patient Details" icon={ClipboardList}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
                    <Input label="Age" value={form.age} onChange={(e: any) => setForm(f => ({ ...f, age: e.target.value }))} placeholder="45" type="number" />
                    <Select label="Gender" value={form.gender} onChange={(e: any) => setForm(f => ({ ...f, gender: e.target.value }))} options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
                    <Input label="Contact Number" value={form.contact} onChange={(e: any) => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="+1 555 000 0000" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Chief Complaint</label>
                    <textarea value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} rows={3}
                        placeholder="Describe the primary reason for today's visit..."
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all font-medium text-[#0F172A] resize-none" />
                </div>
            </Section>

            <Section title="Medical History" icon={Plus}>
                <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Existing Diagnoses</label>
                    <div className="flex flex-wrap gap-2">
                        {DISEASE_OPTIONS.map(d => <CheckItem key={d} label={d} checked={form.diseases.includes(d)} onClick={() => toggle("diseases", d)} />)}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Previous Surgeries</label>
                        <textarea value={form.surgeries} onChange={e => setForm(f => ({ ...f, surgeries: e.target.value }))} rows={2}
                            placeholder="e.g. Appendectomy 2019, Knee surgery 2021..."
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Family History</label>
                        <textarea value={form.familyHistory} onChange={e => setForm(f => ({ ...f, familyHistory: e.target.value }))} rows={2}
                            placeholder="e.g. Father: Hypertension, Mother: Diabetes..."
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Current Medications</label>
                    <textarea value={form.currentMedications} onChange={e => setForm(f => ({ ...f, currentMedications: e.target.value }))} rows={2}
                        placeholder="e.g. Metformin 500mg, Lisinopril 10mg..."
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F5D4] transition-all text-[#0F172A] resize-none" />
                </div>
            </Section>

            <Section title="Allergies" icon={Trash2}>
                <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Drug Allergies</label>
                    <div className="flex flex-wrap gap-2">{ALLERGY_OPTIONS.map(a => <CheckItem key={a} label={a} checked={form.drugAllergies.includes(a)} onClick={() => toggle("drugAllergies", a)} />)}</div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Food Allergies</label>
                    <div className="flex flex-wrap gap-2">{FOOD_ALLERGY_OPTIONS.map(a => <CheckItem key={a} label={a} checked={form.foodAllergies.includes(a)} onClick={() => toggle("foodAllergies", a)} />)}</div>
                </div>
            </Section>

            <Section title="Lifestyle" icon={Plus}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Select label="Smoking" value={form.smoking} onChange={(e: any) => setForm(f => ({ ...f, smoking: e.target.value }))} options={["No", "Former smoker", "Active smoker"]} />
                    <Select label="Alcohol" value={form.alcohol} onChange={(e: any) => setForm(f => ({ ...f, alcohol: e.target.value }))} options={["No", "Social drinking", "Regular use"]} />
                    <Select label="Exercise" value={form.exercise} onChange={(e: any) => setForm(f => ({ ...f, exercise: e.target.value }))} options={["Daily", "3-4x/week", "Occasionally", "Sedentary"]} />
                </div>
            </Section>

            <button onClick={handleSave} className="w-full h-14 rounded-2xl bg-[#0F172A] text-white font-bold text-lg hover:bg-gray-800 hover:shadow-xl transition-all shadow-lg">
                Save Patient Intake Record
            </button>
        </motion.div>
    )
}
