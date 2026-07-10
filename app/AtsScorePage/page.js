"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles, Users, Star, TrendingUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stats = [
  { icon: Users, value: "50K+", label: "Resumes Generated" },
  { icon: TrendingUp, value: "98%", label: "User Satisfaction" },
  { icon: Star, value: "30%", label: "More Interviews" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
];

export default function AtsScorePage() {
  return (
    <section className="relative overflow-hidden bg-grid min-h-screen flex items-center">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#7c5cff]/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#3b82f6]/15 blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[300px] w-[300px] rounded-full bg-[#7c5cff]/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left side - Image */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="relative order-2 lg:order-1"
          >
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[550px]">
                {/* Glow effect behind image */}
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-[#7c5cff]/20 to-[#3b82f6]/20 blur-2xl" />
                
                {/* Image container */}
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-sm">
                  <Image
                    src="/images/ats.png" // Replace with your actual image path
                    alt="AI Resume Writer interface showing ATS score analysis"
                    width={600}
                    height={550}
                    className="rounded-xl object-cover"
                    priority
                  />
                  
               
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <div className="order-1 lg:order-2">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--text-muted)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#7c5cff]" />
              AI-Powered Resume Builder
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl lg:text-5xl"
            >
              AI Resume Writer
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-3 text-lg text-[var(--text-muted)]"
            >
              Let AI create a professional resume for you in seconds.
            </motion.p>

            {/* Form Fields */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-8 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Full Stack Developer"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[#7c5cff]/50 focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                  Experience Level
                </label>
                <select className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[var(--text)] focus:border-[#7c5cff]/50 focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/20 transition-all appearance-none">
                  <option value="0-2">0-2 Years</option>
                  <option value="3-5" selected>3-5 Years</option>
                  <option value="5-8">5-8 Years</option>
                  <option value="8+">8+ Years</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-6 py-3.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(124,92,255,0.3)] transition-all hover:shadow-[0_0_40px_rgba(124,92,255,0.5)]"
              >
                Generate My Resume
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
              className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-center"
                >
                  <stat.icon className="mx-auto mb-1 h-5 w-5 text-[#7c5cff]" />
                  <div className="text-lg font-bold text-[var(--text)]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--text-faint)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}