"use client";

import { motion } from "framer-motion";
import { Upload, Target, ScanSearch, Award } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your resume",
    description: "Drop in a PDF or DOCX file — we extract the text automatically.",
  },
  {
    icon: Target,
    title: "Select a job role",
    description: "Choose from Frontend, Backend, Full Stack, DevOps and more.",
  },
  {
    icon: ScanSearch,
    title: "We compare your skills",
    description: "Your resume is checked against the real skill set for that role.",
  },
  {
    icon: Award,
    title: "Get your score & plan",
    description: "See your ATS score, missing skills, and AI suggestions instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--violet-bright)]">
            The process
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            How ATS scoring works
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
            Four steps, under a minute, no sign-up required to see your score.
          </p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <span className="font-data flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0d0a1c] text-sm font-semibold text-[var(--violet-bright)]">
                  0{i + 1}
                </span>
                <step.icon className="h-5 w-5 text-[var(--text-muted)] lg:hidden" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--text)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
