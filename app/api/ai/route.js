import getAISuggestions from "@/lib/aiSuggestions";

export const runtime = "nodejs";

// Input: resume text + the compare API's own output (role, matched/missing
// skills, ATS score). Output: written analysis from Gemini, or a
// rule-based fallback if GEMINI_API_KEY isn't configured / the call fails.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { role, resumeText, matchedSkills, missingSkills, atsScore } = body || {};

  if (!role || typeof role !== "string") {
    return Response.json({ error: "role is required." }, { status: 400 });
  }
  if (!resumeText || typeof resumeText !== "string") {
    return Response.json({ error: "resumeText is required." }, { status: 400 });
  }
  if (!Array.isArray(matchedSkills) || !Array.isArray(missingSkills)) {
    return Response.json(
      { error: "matchedSkills and missingSkills must be arrays." },
      { status: 400 }
    );
  }
  if (typeof atsScore !== "number") {
    return Response.json({ error: "atsScore must be a number." }, { status: 400 });
  }

  const suggestions = await getAISuggestions({
    role,
    resumeText,
    matchedSkills,
    missingSkills,
    atsScore,
  });

  return Response.json(suggestions);
}
