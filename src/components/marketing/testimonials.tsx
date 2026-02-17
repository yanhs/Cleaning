"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Owner, Sparkle Clean NYC",
    avatar: "SM",
    rating: 5,
    text: "CleanSlate cut our scheduling time by 80%. We used to spend hours on the phone finding replacements. Now it happens automatically.",
  },
  {
    name: "David Chen",
    role: "Operations Manager, PureHome Services",
    avatar: "DC",
    rating: 5,
    text: "The analytics dashboard alone is worth it. We finally have visibility into our cancellation patterns and can plan accordingly.",
  },
  {
    name: "Maria Rodriguez",
    role: "Founder, GreenClean Co",
    avatar: "MR",
    rating: 5,
    text: "Our cleaners love it too. They get clear schedules, fair work distribution, and instant notifications. Turnover dropped 40%.",
  },
];

export function TestimonialsSection() {
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
            Loved by Cleaning Companies
          </h2>
          <p className="text-lg text-muted-foreground">
            See why hundreds of cleaning businesses trust CleanSlate.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl border bg-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold dark:bg-teal-900/50 dark:text-teal-300">
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
