// Builds the downloadable PDF for the report page. Runs entirely in the
// browser (jsPDF has no server dependency), so this is called directly
// from a click handler in components/DownloadButton.jsx — no API route
// needed for this phase.
//
// Input shape mirrors what app/report/page.js already has in state:
//   report   -> the object returned by app/api/compare/route.js
//   fileName -> original resume file name (may be null)
//   aiData   -> the object returned by app/api/ai/route.js (may be null
//               if AI insights haven't loaded yet — every AI section is
//               skipped gracefully in that case)

import { jsPDF } from "jspdf";

const COLORS = {
  violet: [124, 92, 255],
  ink: [26, 22, 38],
  muted: [96, 92, 112],
  faint: [150, 146, 166],
  border: [228, 225, 238],
  good: [34, 153, 84],
  warn: [201, 138, 16],
  bad: [211, 62, 78],
  white: [255, 255, 255],
};

const PAGE_WIDTH = 210; // A4, mm
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function scoreColor(score) {
  if (score >= 80) return COLORS.good;
  if (score >= 55) return COLORS.warn;
  return COLORS.bad;
}

function scoreVerdict(score) {
  if (score >= 80) return "Strong match";
  if (score >= 55) return "Good match";
  return "Needs work";
}

/**
 * Small stateful cursor + helpers so section-writing code below can stay
 * readable instead of threading a `y` value through every call.
 */
function createWriter(doc) {
  let y = MARGIN;

  function ensureSpace(height) {
    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function moveTo(next) {
    y = next;
  }

  function space(amount) {
    y += amount;
  }

  function sectionTitle(title) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(title, MARGIN, y);
    y += 2.5;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 7;
  }

  function paragraph(text, { size = 10, color = COLORS.muted, lineHeight = 5 } = {}) {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    ensureSpace(lines.length * lineHeight + 2);
    doc.text(lines, MARGIN, y);
    y += lines.length * lineHeight + 3;
  }

  function bulletList(items, { ordered = false } = {}) {
    if (!items?.length) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    items.forEach((item, i) => {
      const marker = ordered ? `${i + 1}.` : "\u2022";
      const markerWidth = ordered ? 7 : 5;
      const lines = doc.splitTextToSize(String(item), CONTENT_WIDTH - markerWidth);
      ensureSpace(lines.length * 5 + 1.5);
      doc.setTextColor(...COLORS.violet);
      doc.text(marker, MARGIN, y);
      doc.setTextColor(...COLORS.muted);
      doc.text(lines, MARGIN + markerWidth, y);
      y += lines.length * 5 + 1.5;
    });
    y += 2;
  }

  function skillChips(skills, { tone = COLORS.violet } = {}) {
    if (!skills?.length) {
      paragraph("None found.", { size: 9.5 });
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    let x = MARGIN;
    const rowHeight = 8;
    ensureSpace(rowHeight);
    skills.forEach((skill) => {
      const label = String(skill);
      const w = doc.getTextWidth(label) + 8;
      if (x + w > PAGE_WIDTH - MARGIN) {
        x = MARGIN;
        y += rowHeight;
        ensureSpace(rowHeight);
      }
      doc.setDrawColor(...tone);
      doc.roundedRect(x, y - 5, w, 6.5, 2, 2, "S");
      doc.setTextColor(...tone);
      doc.text(label, x + 4, y - 0.7);
      x += w + 3;
    });
    y += rowHeight;
  }

  return { ensureSpace, moveTo, space, sectionTitle, paragraph, bulletList, skillChips, get y() { return y; } };
}

function drawHeader(doc) {
  // Simple vector wordmark badge — no raster logo asset exists yet, so
  // this mirrors the Sparkles-in-a-gradient-square mark used in Navbar.jsx.
  doc.setFillColor(...COLORS.violet);
  doc.roundedRect(MARGIN, 14, 9, 9, 2.2, 2.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("R", MARGIN + 4.5, 20.2, { align: "center" });

  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ResumePro", MARGIN + 13, 20.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.faint);
  doc.text("AI ATS Resume Analyzer", PAGE_WIDTH - MARGIN, 20.5, { align: "right" });

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 27, PAGE_WIDTH - MARGIN, 27);
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.faint);
    doc.text("Generated by ResumePro", MARGIN, PAGE_HEIGHT - 10);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, {
      align: "right",
    });
  }
}

/**
 * @param {object} input
 * @param {object} input.report - result of /api/compare (role, atsScore, matchedSkills, missingSkills, matchedCount, totalSkills, generatedAt)
 * @param {string|null} input.fileName - original resume file name
 * @param {object|null} input.aiData - result of /api/ai, or null if not yet loaded
 * @returns {void} triggers a browser download of the generated PDF
 */
export default function downloadReportPDF({ report, fileName, aiData }) {
  if (!report) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = createWriter(doc);

  drawHeader(doc);
  w.moveTo(38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.ink);
  doc.text("ATS Resume Report", MARGIN, w.y);
  w.space(8);

  const generatedDate = report.generatedAt
    ? new Date(report.generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Resume: ${fileName || "Untitled resume"}`, MARGIN, w.y);
  w.space(5);
  doc.text(`Role: ${report.role}    |    Generated: ${generatedDate}`, MARGIN, w.y);
  w.space(10);

  // --- ATS Score summary ---
  w.sectionTitle("ATS Score");
  const tone = scoreColor(report.atsScore);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...tone);
  doc.text(`${report.atsScore}`, MARGIN, w.y + 8);
  doc.setFontSize(12);
  doc.text("/100", MARGIN + doc.getTextWidth(`${report.atsScore}`) + 2, w.y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(scoreVerdict(report.atsScore), MARGIN + 45, w.y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `${report.matchedCount} of ${report.totalSkills} required skills found`,
    MARGIN + 45,
    w.y + 9.5
  );
  w.space(20);

  if (report.source === "fallback") {
    w.paragraph(
      "Note: this score is a generic estimate (no GEMINI_API_KEY configured), not a role-specific AI analysis.",
      { size: 8.5, color: COLORS.faint }
    );
  }

  // --- Matched / missing skills ---
  w.sectionTitle(`Matched skills (${report.matchedSkills?.length || 0})`);
  w.skillChips(report.matchedSkills, { tone: COLORS.good });
  w.space(4);

  w.sectionTitle(`Missing skills (${report.missingSkills?.length || 0})`);
  w.skillChips(report.missingSkills, { tone: COLORS.bad });
  w.space(4);

  // --- AI insights (only if loaded) ---
  if (aiData) {
    w.sectionTitle("AI-powered insights");
    if (aiData.professionalSummary) {
      w.paragraph(aiData.professionalSummary, { color: COLORS.ink, size: 10.5 });
    }
    if (aiData.strengths?.length) {
      w.paragraph("Strengths", { color: COLORS.ink, size: 10 });
      w.bulletList(aiData.strengths);
    }
    if (aiData.weaknesses?.length) {
      w.paragraph("Areas to improve", { color: COLORS.ink, size: 10 });
      w.bulletList(aiData.weaknesses);
    }
    if (aiData.careerSuggestions?.length) {
      w.paragraph("Career suggestions", { color: COLORS.ink, size: 10 });
      w.bulletList(aiData.careerSuggestions);
    }
    if (aiData.resumeImprovements?.length) {
      w.paragraph("Resume improvements", { color: COLORS.ink, size: 10 });
      w.bulletList(aiData.resumeImprovements);
    }
    if (aiData.interviewReadiness) {
      w.paragraph("Interview readiness", { color: COLORS.ink, size: 10 });
      w.paragraph(aiData.interviewReadiness);
    }

    if (aiData.projectIdeas?.length) {
      w.sectionTitle("Project ideas");
      w.bulletList(aiData.projectIdeas);
    }

    if (aiData.learningRoadmap?.length) {
      w.sectionTitle("Learning roadmap");
      w.bulletList(aiData.learningRoadmap, { ordered: true });
    }

    if (aiData.source === "fallback") {
      w.paragraph(
        "Note: AI insights above are a rule-based estimate (no GEMINI_API_KEY configured).",
        { size: 8.5, color: COLORS.faint }
      );
    }
  }

  drawFooter(doc);

  const safeRole = (report.role || "role").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`resume-analyzer-report-${safeRole}.pdf`);
}
