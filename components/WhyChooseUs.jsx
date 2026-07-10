"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Zap, Users } from "lucide-react";

const reasons = [
  {
    icon: TrendingUp,
    stat: "3x",
    title: "More interview callbacks",
    description:
      "Resumes optimized with our scorer see significantly higher response rates from recruiters.",
  },
  {
    icon: Zap,
    stat: "<60s",
    title: "From upload to results",
    description:
      "No waiting rooms. Your score, skill gaps, and suggestions load in under a minute.",
  },
  {
    icon: ShieldCheck,
    stat: "100%",
    title: "Private by default",
    description:
      "Your resume is analyzed for scoring only and never shared with employers or third parties.",
  },
  {
    icon: Users,
    stat: "50K+",
    title: "Job seekers helped",
    description:
      "From new graduates to senior engineers, across every major tech role and stack.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative border-t border-white/5 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#3b82f6]/10 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--violet-bright)]">
            Why ResumePro
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Built for people actually applying to jobs
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl p-6"
            >
              <reason.icon className="h-5 w-5 text-[var(--score)]" />
              <p className="font-data mt-4 text-3xl font-semibold text-gradient">
                {reason.stat}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-[var(--text)]">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
