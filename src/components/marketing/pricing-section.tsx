"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Perfect for small cleaning teams",
    features: [
      "Up to 10 cleaners",
      "Scheduling & calendar",
      "Order management",
      "Email notifications",
      "Basic analytics",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: "For growing cleaning businesses",
    popular: true,
    features: [
      "Up to 50 cleaners",
      "AI auto-replacement",
      "SMS & email notifications",
      "Advanced analytics",
      "Map view & tracking",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 249,
    yearlyPrice: 199,
    description: "For large-scale operations",
    features: [
      "Unlimited cleaners",
      "AI auto-replacement",
      "All notification channels",
      "Custom analytics & reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free. Upgrade when you&apos;re ready.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm ${annual ? "font-semibold" : "text-muted-foreground"}`}>
              Annual <span className="text-teal-600 dark:text-teal-400 font-medium">(-20%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl border p-6 ${
                plan.popular
                  ? "border-teal-500 bg-card shadow-lg shadow-teal-500/10 scale-[1.02]"
                  : "bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <Link href="/register">
                <Button
                  className={`w-full rounded-full mb-6 ${
                    plan.popular
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
