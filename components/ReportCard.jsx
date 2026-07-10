"use client";

import Link from "next/link";
import { FileText, RotateCcw } from "lucide-react";
import ATSScore from "@/components/ATSScore";
import SkillsTable from "@/components/SkillsTable";
import MissingSkills from "@/components/MissingSkills";
import Suggestions from "@/components/Suggestions";
import DownloadButton from "@/components/DownloadButton";

/**
 * Composes the full report body: file/role context row, the ATS score
 * card, matched/missing skill grids, and the AI-insights placeholder.
 * This is the single component app/report/page.js renders once a
 * report has been fetched from /api/compare.
 */
export default function ReportCard({ report, fileName, aiState }) {
  const generatedDate = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-muted)]">
          <FileText className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
          <span className="truncate">{fileName || "Your resume"}</span>
          {generatedDate && (
            <>
              <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--text-faint)]" />
              <span className="shrink-0 font-data text-xs text-[var(--text-faint)]">
                {generatedDate}
              </span>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <DownloadButton report={report} fileName={fileName} aiData={aiState?.data} />
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--violet-bright)] transition-colors hover:text-[var(--text)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Analyze another resume
          </Link>
        </div>
      </div>

      <ATSScore
        role={report.role}
        score={report.atsScore}
        matchedCount={report.matchedCount}
        totalSkills={report.totalSkills}
        source={report.source}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkillsTable skills={report.matchedSkills} />
        <MissingSkills skills={report.missingSkills} />
      </div>

      <Suggestions
        status={aiState?.status}
        data={aiState?.data}
        error={aiState?.error}
      />
    </div>
  );
}
