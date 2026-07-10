"use client";

import { motion } from "framer-motion";
import {
  Target,
  Layers,
  BrainCircuit,
  ScanSearch,
  ShieldCheck,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Instant ATS score",
    description:
      "See exactly how applicant tracking systems read your resume, scored out of 100 in seconds.",
  },
  {
    icon: ScanSearch,
    title: "Missing-skill detection",
    description:
      "We compare your resume against real role requirements and flag every keyword you're missing.",
  },
  {
    icon: BrainCircuit,
    title: "AI-written suggestions",
    description:
      "Get concrete rewrites for your summary, bullet points, and skills section — not generic tips.",
  },
  {
    icon: Layers,
    title: "PDF & DOCX support",
    description:
      "Upload whatever format your resume is already in. No conversion, no formatting headaches.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based comparison",
    description:
      "Match against Frontend, Backend, Full Stack, DevOps and more — each with its own skill baseline.",
  },
  {
    icon: Download,
    title: "Downloadable report",
    description:
      "Export your full score breakdown and action plan as a PDF you can revisit before every application.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--violet-bright)]">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Everything you need to beat the filters
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
            One upload gives you a full picture — score, gaps, and a plan to
            close them.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group glass-card rounded-2xl p-6 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff]/20 to-[#3b82f6]/20 transition-colors group-hover:from-[#7c5cff]/30 group-hover:to-[#3b82f6]/30">
                <feature.icon className="h-5 w-5 text-[var(--violet-bright)]" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
