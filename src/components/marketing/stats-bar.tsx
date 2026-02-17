"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Orders Completed" },
  { value: "500+", label: "Active Cleaners" },
  { value: "99.2%", label: "On-Time Rate" },
  { value: "4.9", label: "Average Rating" },
];

export function StatsBar() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
