// Assembles the plain JSON report object returned by app/api/compare/route.js.
// atsScore/matched/missing/totalSkills now come from lib/aiCompare.js
// (Gemini, or its fallback) rather than a fixed data/roles.json list, so
// this stays a thin, source-agnostic assembler.

/**
 * @param {object} input
 * @param {string} input.role - the role name the user typed
 * @param {number} input.atsScore - 0-100 score from the comparison
 * @param {string[]} input.matched - matched skill names
 * @param {string[]} input.missing - missing skill names
 * @param {number} input.totalSkills - total skills identified for the role
 * @param {"gemini"|"fallback"} [input.source] - where the comparison came from
 * @param {string} [input.reason] - why the fallback was used, if applicable
 * @returns {object} the report to return from the compare API
 */
export default function generateReport({
  role,
  atsScore,
  matched,
  missing,
  totalSkills,
  source,
  reason,
}) {
  return {
    role,
    atsScore,
    matchedSkills: matched,
    missingSkills: missing,
    matchedCount: matched.length,
    totalSkills,
    source,
    reason,
    generatedAt: new Date().toISOString(),
  };
}
