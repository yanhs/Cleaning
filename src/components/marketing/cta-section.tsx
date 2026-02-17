"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />

      <div className="container relative mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to transform your cleaning business?
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of cleaning companies using CleanSlate to automate operations and grow faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-teal-200 flex-1"
            />
            <Link href="/register">
              <Button size="lg" className="h-12 rounded-full bg-white text-teal-700 hover:bg-teal-50 px-8 w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
