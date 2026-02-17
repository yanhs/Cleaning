"use client";

import { motion } from "framer-motion";
import { UserPlus, CalendarCheck, Zap } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Add Your Team",
    description: "Import your cleaners with their skills, availability, and service areas. CleanSlate remembers every preference.",
  },
  {
    icon: CalendarCheck,
    title: "Orders Flow In",
    description: "Create bookings manually or let clients book online. Each order is automatically matched with the best available cleaner.",
  },
  {
    icon: Zap,
    title: "AI Handles the Rest",
    description: "Cancellations? Reschedules? CleanSlate finds replacements in minutes, not hours. Your team stays covered 24/7.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get up and running in minutes. No complex setup required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent dark:via-teal-700" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mb-6 relative z-10">
                <step.icon className="h-7 w-7" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-teal-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-20">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
