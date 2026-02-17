"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  RefreshCw,
  MapPin,
  BarChart3,
  Bell,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    description: "AI-powered scheduling that considers distance, skills, availability, and client preferences to make the perfect match.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Replacement",
    description: "When a cleaner cancels, our engine instantly finds the best replacement. Clients never notice the change.",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "See your entire team on a real-time map. Know who's available, who's on a job, and where everyone is.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Revenue trends, cancellation rates, top performers, and more. Data-driven decisions at your fingertips.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "SMS, email, and in-app alerts keep everyone in the loop. Automated reminders reduce no-shows by 85%.",
  },
  {
    icon: Shield,
    title: "Quality Control",
    description: "Before/after photos, client ratings, and performance tracking ensure consistently excellent service.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Run Your Cleaning Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From scheduling to analytics, CleanSlate handles the operations so you can focus on growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
