// app/api/upload/route.js
import { NextResponse } from 'next/server';
import getCurrentUser from "@/lib/auth/getCurrentUser";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Report from "@/models/Report";
import extractResume from "@/lib/extractResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

// Helper: Check if file is accepted
function isAcceptedFile(file) {
  const nameLower = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    nameLower.endsWith(ext)
  );
  return ACCEPTED_TYPES.includes(file.type) || hasValidExtension;
}

// Helper: Check if user can analyze
function canAnalyze(user) {
  if (!user) return false;
  if (user.plan && user.plan !== "Free") {
    return true;
  }
  return (user.resumeAnalysisCount || 0) < 3;
}

// Helper: Get remaining analyses
function getRemainingAnalyses(user) {
  if (!user) return 0;
  if (user.plan && user.plan !== "Free") {
    return Infinity;
  }
  return Math.max(0, 3 - (user.resumeAnalysisCount || 0));
}

export async function POST(request) {
  console.log("=== UPLOAD API CALLED ===");

  // 1. Get authenticated user
  let user;
  try {
    user = await getCurrentUser();
    console.log("User authenticated:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to analyze resumes." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 401 }
    );
  }

  // 2. Check if user can analyze (plan limits)
  if (!canAnalyze(user)) {
    return NextResponse.json(
      { 
        error: "You have reached your free limit of 3 analyses.",
        remaining: 0,
        plan: user.plan || "Free",
        needsUpgrade: true,
        message: "Please upgrade to continue analyzing resumes."
      },
      { status: 403 }
    );
  }

  // 3. Parse form data
  let formData;
  try {
    formData = await request.formData();
    console.log("Form data received");
  } catch (error) {
    console.error("Form data parse error:", error);
    return NextResponse.json(
      { error: "Request must be sent as multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("resume");

  // 4. Validate file exists
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No resume file was provided." },
      { status: 400 }
    );
  }

  // 5. Validate file type
  if (!isAcceptedFile(file)) {
    return NextResponse.json(
      { error: "Only PDF and DOCX files are supported." },
      { status: 400 }
    );
  }

  // 6. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  console.log(`File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

  // 7. Extract text from resume
  let extractedData;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { text, wordCount } = await extractResume(buffer, file.name, file.type);
    
    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from the file.");
    }

    extractedData = { text, wordCount };
    console.log(`Text extracted: ${wordCount} words`);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract text from this file." },
      { status: 422 }
    );
  }

  // 8. Save to database
  try {
    await dbConnect();
    console.log("Database connected");

    // Increment analysis count for free users
    let updatedUser = user;
    if (user.plan === "Free") {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $inc: { resumeAnalysisCount: 1 } },
        { new: true }
      );
      console.log(`Analysis count updated to: ${updatedUser.resumeAnalysisCount}`);
    }

    // Create report with all required fields
    const reportData = {
      userId: user._id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type.includes("pdf") ? "pdf" : "docx",
      content: extractedData.text,
      wordCount: extractedData.wordCount,
      status: "completed",
      plan: user.plan || "Free",
      analyzedAt: new Date(),
      // Optional fields with default values
      role: "Not Analyzed Yet",
      totalSkills: 0,
      matchedCount: 0,
      atsScore: 0,
      matchedSkills: [],
    };

    const report = await Report.create(reportData);
    console.log(`Report saved: ${report._id}`);

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: "Resume uploaded and analyzed successfully!",
      data: {
        fileName: file.name,
        fileSize: file.size,
        wordCount: extractedData.wordCount,
        reportId: report._id.toString(),
        text: extractedData.text.substring(0, 500) + "...", // Truncate for response
      },
      user: {
        plan: updatedUser.plan,
        resumeAnalysisCount: updatedUser.resumeAnalysisCount,
        remaining: getRemainingAnalyses(updatedUser),
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Database error:", error);
    
    // Check for validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(", ")}` },
        { status: 400 }
      );
    }

    // Check for duplicate key
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A report with this data already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save report. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's remaining analyses
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const remaining = getRemainingAnalyses(user);
    const canAnalyzeResume = canAnalyze(user);

    return NextResponse.json({
      plan: user.plan || "Free",
      used: user.resumeAnalysisCount || 0,
      remaining: remaining === Infinity ? "Unlimited" : remaining,
      canAnalyze: canAnalyzeResume,
      isFree: user.plan === "Free",
      limit: user.plan === "Free" ? 3 : "Unlimited",
    });
  } catch (error) {
    console.error("Error checking limit:", error);
    return NextResponse.json(
      { error: "Failed to check analysis limit" },
      { status: 500 }
    );
  }
}