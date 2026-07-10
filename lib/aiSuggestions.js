// Talks to the Gemini API to turn a compare-API result into written
// analysis (professional summary, strengths, weaknesses, career
// suggestions, resume improvements, interview readiness).
//
// Gemini is optional (per the project's tech stack notes): if
// GEMINI_API_KEY isn't set, or the request fails for any reason, this
// falls back to a rule-based summary built from the same matched/missing
// skill data so the report page never breaks or shows an empty section.

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt({ role, resumeText, matchedSkills, missingSkills, atsScore }) {
  return `You are an ATS resume reviewer. Analyze this resume for a "${role}" role.

ATS Score: ${atsScore}/100
Matched skills: ${matchedSkills.join(", ") || "none"}
Missing skills: ${missingSkills.join(", ") || "none"}

Resume text:
"""
${resumeText.slice(0, 6000)}
"""

Return JSON only — no markdown fences, no extra keys, no commentary — matching exactly this shape:
{
  "professionalSummary": "2-3 sentence summary of the candidate",
  "strengths": ["3 to 5 short strength statements"],
  "weaknesses": ["3 to 5 short weakness statements"],
  "missingSkillsNote": "1-2 sentences on how to address the missing skills",
  "careerSuggestions": ["2 to 4 short career suggestions"],
  "resumeImprovements": ["2 to 4 short, concrete resume rewrite tips"],
  "interviewReadiness": "1-2 sentences on interview readiness for this role",
  "learningRoadmap": ["3 to 5 ordered steps to close the missing-skill gaps, starting with the highest priority"],
  "projectIdeas": ["2 to 3 short project ideas that would demonstrate the missing skills"]
}`;
}

function buildFallback({ role, atsScore, matchedSkills, missingSkills }) {
  const topMatched = matchedSkills.slice(0, 5);
  const topMissing = missingSkills.slice(0, 5);

  return {
    professionalSummary: `This resume shows relevant experience for a ${role} role, matching ${matchedSkills.length} of the ${matchedSkills.length + missingSkills.length} skills typically expected.`,
    strengths: topMatched.length
      ? topMatched.map((skill) => `Demonstrated experience with ${skill}`)
      : ["No standout keyword matches were found for this role yet."],
    weaknesses: topMissing.length
      ? topMissing.map((skill) => `No clear mention of ${skill}`)
      : ["No notable gaps — every tracked skill for this role was found."],
    missingSkillsNote: topMissing.length
      ? `Consider adding measurable experience with: ${topMissing.join(", ")}.`
      : "No missing skills detected for this role.",
    careerSuggestions: [
      `Look for ${role} openings that value ${topMatched[0] || "your existing skills"}.`,
      "Tailor your resume's keywords to each specific job posting before applying.",
    ],
    resumeImprovements: [
      "Quantify achievements with metrics (%, time saved, users impacted).",
      "Mirror the exact keywords used in the job postings you're targeting.",
    ],
    interviewReadiness:
      atsScore >= 80
        ? "You're well positioned for this role — focus interview prep on your strongest projects."
        : "Brush up on the missing skills above before interviewing for this role.",
    learningRoadmap: topMissing.length
      ? topMissing.map(
          (skill, i) => `Step ${i + 1}: Build hands-on familiarity with ${skill} through a small project or guided course.`
        )
      : ["No gaps to plan for — keep your existing skills sharp with regular practice."],
    projectIdeas: topMissing.length
      ? [
          `A small end-to-end project that combines ${topMissing.slice(0, 2).join(" and ") || "your target skills"} to fill the biggest gaps.`,
          `A portfolio case study that pairs ${topMatched[0] || "an existing strength"} with ${topMissing[0] || "a new skill"} to show range.`,
        ]
      : [`A portfolio case study that showcases ${topMatched.slice(0, 2).join(" and ") || "your strongest skills"} for a ${role} audience.`],
  };
}

function parseGeminiResponse(data) {
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * @param {object} input
 * @param {string} input.role
 * @param {string} input.resumeText
 * @param {string[]} input.matchedSkills
 * @param {string[]} input.missingSkills
 * @param {number} input.atsScore
 * @returns {Promise<object>} the suggestions object, tagged with `source`
 *   ("gemini" or "fallback") so the UI can be honest about which it got.
 */
export default async function getAISuggestions(input) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { ...buildFallback(input), source: "fallback", reason: "no_api_key" };
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseGeminiResponse(data);
    return { ...parsed, source: "gemini" };
  } catch {
    return { ...buildFallback(input), source: "fallback", reason: "gemini_error" };
  }
}
