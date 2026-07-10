"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, UploadCloud } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ReportCard from "@/components/ReportCard";

// Handoff key written by app/upload/page.js right before it navigates
// here. sessionStorage (not localStorage) so it clears when the tab
// closes — there's no persistence layer yet (that's Phase 13/MongoDB).
const STORAGE_KEY = "resume-analyzer:pending-report";

// Fire-and-forget save to /api/history (Phase 13). Failures are swallowed
// here on purpose — history is a nice-to-have, not something that should
// surface an error banner over a report the person can already see.
function saveReportHistory({ report, fileName, aiInsights }) {
  fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: report.role,
      atsScore: report.atsScore,
      matchedSkills: report.matchedSkills,
      missingSkills: report.missingSkills,
      matchedCount: report.matchedCount,
      totalSkills: report.totalSkills,
      fileName: fileName || null,
      aiInsights: aiInsights || null,
      compareSource: report.source || null,
    }),
  }).catch(() => {});
}

// loading -> empty | error | done
export default function ReportPage() {
  const [state, setState] = useState({
    status: "loading",
    report: null,
    fileName: null,
    error: null,
  });
  const [aiState, setAiState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let pending = null;
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        pending = raw ? JSON.parse(raw) : null;
      } catch {
        pending = null;
      }

      if (!pending || !pending.resumeText || !pending.role) {
        if (!cancelled) {
          setState({ status: "empty", report: null, fileName: null, error: null });
        }
        return;
      }

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: pending.resumeText,
            role: pending.role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong generating your report.");
        }

        if (!cancelled) {
          setState({
            status: "done",
            report: data,
            fileName: pending.fileName || null,
            error: null,
          });
        }

        // Kick off AI insights once the compare report is in — this is a
        // separate, slower call (Gemini or its rule-based fallback), so
        // it's rendered as its own loading state within ReportCard.
        setAiState({ status: "loading", data: null, error: null });
        try {
          const aiResponse = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: pending.role,
              resumeText: pending.resumeText,
              matchedSkills: data.matchedSkills,
              missingSkills: data.missingSkills,
              atsScore: data.atsScore,
            }),
          });
          const aiData = await aiResponse.json();
          if (!aiResponse.ok) {
            throw new Error(aiData.error || "Failed to generate AI insights.");
          }
          if (!cancelled) {
            setAiState({ status: "done", data: aiData, error: null });
          }
          saveReportHistory({ report: data, fileName: pending.fileName, aiInsights: aiData });
        } catch (aiErr) {
          if (!cancelled) {
            setAiState({ status: "error", data: null, error: aiErr.message });
          }
          saveReportHistory({ report: data, fileName: pending.fileName, aiInsights: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: "error", report: null, fileName: null, error: err.message });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="relative flex-1 bg-grid">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c5cff]/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--violet-bright)]">
              Step 3 of 3
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
              Your ATS report
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
              Here&apos;s how your resume stacks up against the role you
              selected.
            </p>
          </div>

          <div className="mt-10">
            {state.status === "loading" && (
              <div className="glass-card rounded-2xl">
                <Loading label="Comparing your resume against the role..." />
              </div>
            )}

            {state.status === "empty" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card flex flex-col items-center gap-4 rounded-2xl p-10 text-center"
              >
                <UploadCloud className="h-8 w-8 text-[var(--text-faint)]" />
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    No report yet
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Upload a resume and pick a role first — we&apos;ll bring
                    you back here with your results.
                  </p>
                </div>
                <Link
                  href="/upload"
                  className="rounded-full bg-gradient-to-r from-[#7c5cff] to-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-transform hover:scale-[1.01]"
                >
                  Go to upload
                </Link>
              </motion.div>
            )}

            {state.status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card flex items-center gap-3 rounded-2xl border-[#f45c6a]/30 p-5 text-sm text-[#f45c6a]"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {state.error}
              </motion.div>
            )}

            {state.status === "done" && state.report && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReportCard
                  report={state.report}
                  fileName={state.fileName}
                  aiState={aiState}
                />
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
