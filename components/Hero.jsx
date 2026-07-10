"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import ProgressCircle from "./ProgressCircle";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid ">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#7c5cff]/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#3b82f6]/15 blur-[110px]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24  lg:grid-cols-2 lg:px-8 ">
        {/* Left side - Content */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--text-muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--score)]" />
            AI-powered ATS resume analysis
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl"
          >
            Build a resume that
            <br />
            <span className="text-gradient">gets you hired.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-muted)]"
          >
            Upload your resume, pick a job role, and get an instant ATS
            score, missing-skill breakdown, and AI-written suggestions —
            before a recruiter ever sees it.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/upload"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-6 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-transform hover:scale-[1.02]"
            >
              Create my resume
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:bg-white/5"
            >
              View templates
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex items-center gap-3 text-sm text-[var(--text-faint)]"
          >
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-[#07050d] bg-gradient-to-br from-[#7c5cff]/70 to-[#3b82f6]/70"
                />
              ))}
            </div>
            Trusted by 50,000+ job seekers
          </motion.div>
        </div>

        {/* Right side - Image */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[600px]">
          
            
            {/* Image container */}
            <div className="relative rounded-2xl  bg-white/[0.03] p-2 backdrop-blur-sm">
              <Image
                src="/images/hero.png" // Replace with your actual image path
                alt="Resume builder preview showing ATS score and suggestions"
                width={600}
                height={500}
                className="rounded-xl object-cover"
                priority
              />
              
          
              
              {/* Floating badge - Suggestions */}
            
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}