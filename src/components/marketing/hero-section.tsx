"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Clock, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm text-teal-300 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
              </span>
              AI-Powered Cleaning Automation
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Smart scheduling.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Zero hassle.
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              CleanSlate automates your cleaning business operations.
              Fill cancelled shifts instantly, track your team in real-time,
              and let AI handle the scheduling so you can focus on growing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-8 text-base h-12 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 border-slate-600 text-slate-200 hover:bg-white/10">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Right: Floating stat cards */}
          <div className="hidden lg:flex relative justify-center items-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute top-0 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20">
                  <Clock className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.5 min</p>
                  <p className="text-xs text-slate-400">Avg. replacement time</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute top-32 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">150+</p>
                  <p className="text-xs text-slate-400">Cleaners managed</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="absolute bottom-8 right-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">98.5%</p>
                  <p className="text-xs text-slate-400">Shift coverage rate</p>
                </div>
              </div>
            </motion.div>

            {/* Central decorative element */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-64 h-64 rounded-full border border-teal-500/20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 rounded-full border border-amber-500/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
