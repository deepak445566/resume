"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, Trash2, X, Check } from "lucide-react";
import ATSScore from "@/components/ATSScore";
import SkillsTable from "@/components/SkillsTable";
import MissingSkills from "@/components/MissingSkills";
import Suggestions from "@/components/Suggestions";
import DownloadButton from "@/components/DownloadButton";

function scoreTone(score) {
  if (score >= 80) return "text-[var(--score)]";
  if (score >= 55) return "text-[#f5b944]";
  return "text-[#f45c6a]";
}

/**
 * One row in the Phase 14 dashboard history list.
 *
 * Props:
 *  - item: a serialized report from GET /api/history (id, fileName, role,
 *    atsScore, matchedSkills, missingSkills, matchedCount, totalSkills,
 *    aiInsights, createdAt)
 *  - onDeleted(id): called once the delete request succeeds, so the
 *    parent can remove it from the list
 */
export default function HistoryCard({ item, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Reshape into the same object shape /api/compare returns, so the
  // existing ATSScore/SkillsTable/DownloadButton components — and
  // downloadReportPDF, which reads `generatedAt` — all work unchanged.
  const reportForDisplay = {
    role: item.role,
    atsScore: item.atsScore,
    matchedSkills: item.matchedSkills,
    missingSkills: item.missingSkills,
    matchedCount: item.matchedCount,
    totalSkills: item.totalSkills,
    generatedAt: item.createdAt,
    source: item.compareSource,
  };

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/history/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete this report.");
      }
      onDeleted(item.id);
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col items-start gap-3 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text)]">
              {item.fileName || "Untitled resume"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {item.role}
              {date && <span className="text-[var(--text-faint)]"> · {date}</span>}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
          <span className={`font-data text-sm font-semibold ${scoreTone(item.atsScore)}`}>
            {item.atsScore}
            <span className="text-xs text-[var(--text-faint)]">/100</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--text-faint)] transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="space-y-5 p-5">
              <div className="flex items-center justify-end gap-3">
                <DownloadButton
                  report={reportForDisplay}
                  fileName={item.fileName}
                  aiData={item.aiInsights}
                />

                {!confirming && (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[#f45c6a]/40 hover:text-[#f45c6a]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}

                {confirming && (
                  <div className="flex items-center gap-2 rounded-full border border-[#f45c6a]/30 bg-[#f45c6a]/10 px-2 py-1">
                    <span className="pl-1.5 text-xs text-[#f45c6a]">Delete this report?</span>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDelete}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f45c6a] text-white disabled:opacity-60"
                      aria-label="Confirm delete"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => setConfirming(false)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[var(--text-muted)] disabled:opacity-60"
                      aria-label="Cancel delete"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {deleteError && (
                <p className="text-right text-xs text-[#f45c6a]">{deleteError}</p>
              )}

              <ATSScore
                role={reportForDisplay.role}
                score={reportForDisplay.atsScore}
                matchedCount={reportForDisplay.matchedCount}
                totalSkills={reportForDisplay.totalSkills}
                source={reportForDisplay.source}
              />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <SkillsTable skills={item.matchedSkills} />
                <MissingSkills skills={item.missingSkills} />
              </div>

              {item.aiInsights ? (
                <Suggestions status="done" data={item.aiInsights} />
              ) : (
                <div className="glass-card rounded-2xl p-6 text-center text-sm text-[var(--text-muted)]">
                  No AI insights were saved with this report.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
