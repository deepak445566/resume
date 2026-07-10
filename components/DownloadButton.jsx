"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import Loading from "@/components/Loading";

/**
 * Triggers the client-side PDF build in lib/downloadReport.js. jsPDF is
 * dynamically imported so it's never bundled into the initial report-page
 * load — only pulled in once someone actually clicks download.
 *
 * Props:
 *  - report: the /api/compare result (required to generate anything)
 *  - fileName: original resume file name
 *  - aiData: the /api/ai result, or null if AI insights haven't loaded yet
 *    (the PDF still generates fine without it, just skips that section)
 */
export default function DownloadButton({ report, fileName, aiData }) {
  const [status, setStatus] = useState("idle"); // idle -> working -> done | error

  async function handleDownload() {
    if (!report || status === "working") return;
    setStatus("working");
    try {
      const { default: downloadReportPDF } = await import("@/lib/downloadReport");
      downloadReportPDF({ report, fileName, aiData });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!report || status === "working"}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--violet-bright)]/40 hover:text-[var(--violet-bright)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === "working" && <Loading inline label="" size={14} />}
      {status === "done" && <Check className="h-3.5 w-3.5 text-[var(--score)]" />}
      {status !== "working" && status !== "done" && <Download className="h-3.5 w-3.5" />}
      {status === "error" ? "Couldn't generate PDF" : status === "done" ? "Downloaded" : "Download report"}
    </button>
  );
}
