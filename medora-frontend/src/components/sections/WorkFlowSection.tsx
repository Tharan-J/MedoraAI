import { motion } from "framer-motion"
import { Mic, Brain, FileText, Pill, ShieldCheck, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: Mic,
    title: "Audio Capture",
    desc: "Doctor uploads consultation audio in MP3, WAV, or M4A format.",
  },
  {
    icon: Brain,
    title: "AI Clinical Extraction",
    desc: "Gemini analyzes the transcript and extracts symptoms, diagnosis, and medications.",
  },
  {
    icon: FileText,
    title: "SOAP Note Generation",
    desc: "Structured clinical notes are automatically generated.",
  },
  {
    icon: Pill,
    title: "Prescription Builder",
    desc: "Medications are formatted into a structured prescription.",
  },
  {
    icon: ShieldCheck,
    title: "Drug Interaction Check",
    desc: "Prescriptions are verified using OpenFDA drug interaction data.",
  },
  {
    icon: BarChart3,
    title: "Clinical Analytics",
    desc: "Consultation insights are aggregated for clinic analytics.",
  },
]

export default function WorkflowSection() {
  return (
    <section className="py-32 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl text-[#0F172A] mb-6">
            How Medora AI Works
          </h2>

          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            A fully automated AI pipeline that converts doctor–patient conversations
            into structured medical documentation in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">

          {steps.map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="glass-card rounded-[2rem] p-8 border border-white shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-[#00F5D4]/10 flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-[#0F172A]" />
              </div>

              <h3 className="font-serif text-2xl mb-3 text-[#0F172A]">
                {step.title}
              </h3>

              <p className="text-[#64748B] text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}