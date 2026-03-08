import { motion } from "framer-motion"
import { Clock, CheckCircle2, TrendingUp } from "lucide-react"

const benefits = [
    {
        icon: Clock,
        title: "More Time for Patients",
        description: "Reduces documentation burden for doctors."
    },
    {
        icon: CheckCircle2,
        title: "Clinical Accuracy",
        description: "Structured medical notes reduce errors."
    },
    {
        icon: TrendingUp,
        title: "Smarter Clinics",
        description: "Analytics reveal treatment trends."
    }
]

export default function BenefitsSection() {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm"
                        >
                            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                                <benefit.icon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                            <p className="text-gray-600 text-lg">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
