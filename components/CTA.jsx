"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative border-t border-white/5 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1130] to-[#0d0a1c] px-8 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7c5cff]/30 blur-[100px]" />
          </div>

          <h2 className="relative text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            Know your score before you hit apply
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
            It&apos;s free to check your first resume. No credit card, no
            account required to see your ATS score.
          </p>
          <Link
            href="/upload"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-7 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-transform hover:scale-[1.02]"
          >
            Analyze my resume free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
