"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does auto-replacement work?",
    answer: "When a cleaner cancels or becomes unavailable, CleanSlate's AI engine automatically scores all available cleaners based on proximity, skills, rating, and availability. The best match is notified via SMS and can accept with one tap. The entire process typically takes under 3 minutes.",
  },
  {
    question: "Can I import my existing cleaner database?",
    answer: "Yes! You can import cleaners via CSV upload or add them manually. We also support integration with popular scheduling platforms to sync your existing data.",
  },
  {
    question: "Is there a limit on the number of orders?",
    answer: "No. All plans include unlimited orders. The plan tiers are based on the number of active cleaners you manage.",
  },
  {
    question: "How do notifications work?",
    answer: "CleanSlate sends notifications through multiple channels: in-app, SMS, and email. You can configure which events trigger notifications and which channels to use for each type of alert.",
  },
  {
    question: "Can my clients book directly?",
    answer: "Our Professional and Enterprise plans include a client booking portal that you can embed on your website. Clients can view availability and book cleaning services directly.",
  },
  {
    question: "What happens if no replacement is found?",
    answer: "If the auto-assignment engine can't find a suitable replacement within the configured timeout, you'll receive an urgent notification so you can handle it manually. You always remain in control.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption, and all data is stored in SOC 2 compliant data centers. We never share your data with third parties.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about CleanSlate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base hover:text-teal-600 dark:hover:text-teal-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
