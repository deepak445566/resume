// Compares a resume against a freeform job role using Gemini — replacing
// the old data/roles.json + hardcoded keyword-matching approach. The
// person can now type *any* role (e.g. "Cloud Security Engineer") and
// the AI works out what that role typically requires and checks the
// resume against it, instead of being limited to a fixed skill list.
//
// Gemini is optional (same as aiSuggestions.js): if GEMINI_API_KEY isn't
// set, or the request fails, this falls back to a generic keyword check
// against a broad, role-agnostic tech-skill vocabulary so the report
// page still returns *something* useful rather than breaking.

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt({ role, resumeText }) {
  return `You are an expert ATS (Applicant Tracking System) resume reviewer.

A candidate is applying for this role: "${role}".

Step 1: Work out the 10-18 most important skills, tools, and qualifications a resume for this role should typically show.
Step 2: Check the resume below and determine which of those skills are clearly present, and which are missing.
Step 3: Score the resume as (matched skills / total skills identified) * 100, rounded to the nearest whole number.

Resume text:
"""
${resumeText.slice(0, 8000)}
"""

Return JSON only — no markdown fences, no extra keys, no commentary — matching exactly this shape:
{
  "totalSkills": <total number of role-relevant skills you identified>,
  "matchedSkills": ["skills clearly present in the resume"],
  "missingSkills": ["skills expected for this role but not found in the resume"],
  "atsScore": <integer 0-100>
}`;
}

// Broad, role-agnostic vocabulary used ONLY when Gemini isn't available.
// Unlike the old data/roles.json, this isn't tied to a fixed list of
// selectable roles — it's just enough generic signal to produce a
// reasonable estimate for any role name typed in.
const FALLBACK_VOCABULARY = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "SQL",
  "HTML", "CSS", "React", "Next.js", "Angular", "Vue", "Node.js", "Express",
  "REST API", "GraphQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker",
  "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "Linux", "Agile",
  "Testing", "Communication", "Leadership", "Project Management",
  "Data Analysis", "Machine Learning", "TensorFlow", "PyTorch", "Excel",
  "Figma", "UI/UX Design",
];

function normalize(text) {
  return ` ${String(text || "").toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ")} `;
}

function buildFallback({ resumeText }) {
  const padded = normalize(resumeText);
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of FALLBACK_VOCABULARY) {
    if (padded.includes(normalize(skill))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const totalSkills = FALLBACK_VOCABULARY.length;
  const atsScore = Math.round((matchedSkills.length / totalSkills) * 100);

  return { totalSkills, matchedSkills, missingSkills, atsScore };
}

function parseGeminiResponse(data) {
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (
    typeof parsed.atsScore !== "number" ||
    !Array.isArray(parsed.matchedSkills) ||
    !Array.isArray(parsed.missingSkills)
  ) {
    throw new Error("Gemini response was missing required fields.");
  }

  return {
    totalSkills:
      typeof parsed.totalSkills === "number"
        ? parsed.totalSkills
        : parsed.matchedSkills.length + parsed.missingSkills.length,
    matchedSkills: parsed.matchedSkills,
    missingSkills: parsed.missingSkills,
    atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore))),
  };
}

/**
 * @param {object} input
 * @param {string} input.role - freeform role name typed by the user
 * @param {string} input.resumeText
 * @returns {Promise<object>} { totalSkills, matchedSkills, missingSkills, atsScore, source, reason? }
 */
export default async function compareWithAI({ role, resumeText }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { ...buildFallback({ resumeText }), source: "fallback", reason: "no_api_key" };
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt({ role, resumeText }) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseGeminiResponse(data);
    return { ...parsed, source: "gemini" };
  } catch {
    return { ...buildFallback({ resumeText }), source: "fallback", reason: "gemini_error" };
  }
}
