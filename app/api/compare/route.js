import compareWithAI from "@/lib/aiCompare";
import generateReport from "@/lib/generateReport";

export const runtime = "nodejs";

// Workflow: Receive resume text + freeform role -> AI works out what the
// role requires and compares it against the resume -> Generate Report ->
// Return JSON. Previously this read data/roles.json for a fixed skill
// list; now any role name typed by the user is analyzed directly.
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

  const { resumeText, role } = body || {};

  if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
    return Response.json(
      { error: "resumeText is required." },
      { status: 400 }
    );
  }

  if (!role || typeof role !== "string" || !role.trim()) {
    return Response.json({ error: "role is required." }, { status: 400 });
  }

  const trimmedRole = role.trim();

  if (trimmedRole.length < 2 || trimmedRole.length > 80) {
    return Response.json(
      { error: "role must be between 2 and 80 characters." },
      { status: 400 }
    );
  }

  const { totalSkills, matchedSkills, missingSkills, atsScore, source, reason } =
    await compareWithAI({ role: trimmedRole, resumeText });

  const report = generateReport({
    role: trimmedRole,
    atsScore,
    matched: matchedSkills,
    missing: missingSkills,
    totalSkills,
    source,
    reason,
  });

  return Response.json(report);
}
