// app/api/history/route.js
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import Report from "@/models/Report";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Save a report
export async function POST(request) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to save reports." },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const {
      role,
      atsScore,
      matchedSkills,
      missingSkills,
      matchedCount,
      totalSkills,
      fileName,
      fileSize,
      wordCount,
      aiInsights,
      compareSource,
      content,
    } = body || {};

    // Validation
    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "role is required." },
        { status: 400 }
      );
    }

    if (typeof atsScore !== "number") {
      return NextResponse.json(
        { error: "atsScore must be a number." },
        { status: 400 }
      );
    }

    if (!Array.isArray(matchedSkills) || !Array.isArray(missingSkills)) {
      return NextResponse.json(
        { error: "matchedSkills and missingSkills must be arrays." },
        { status: 400 }
      );
    }

    if (typeof matchedCount !== "number" || typeof totalSkills !== "number") {
      return NextResponse.json(
        { error: "matchedCount and totalSkills must be numbers." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create report with user ID
    const saved = await Report.create({
      userId: user._id,
      fileName: fileName || "Unknown file",
      fileSize: fileSize || 0,
      wordCount: wordCount || 0,
      content: content || "",
      role,
      atsScore,
      matchedSkills,
      missingSkills,
      matchedCount,
      totalSkills,
      aiInsights: aiInsights || null,
      compareSource: compareSource || null,
      plan: user.plan || "Free",
      status: "completed",
      analyzedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: saved._id.toString(),
      savedAt: saved.createdAt,
    });

  } catch (error) {
    console.error("Error saving report:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(", ")}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save report history." },
      { status: 500 }
    );
  }
}

// GET - List user's reports
export async function GET() {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to view history." },
        { status: 401 }
      );
    }

    await dbConnect();

    const reports = await Report.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const serialized = reports.map((r) => ({
      id: r._id.toString(),
      fileName: r.fileName,
      fileSize: r.fileSize,
      wordCount: r.wordCount,
      role: r.role,
      atsScore: r.atsScore,
      matchedSkills: r.matchedSkills || [],
      missingSkills: r.missingSkills || [],
      matchedCount: r.matchedCount || 0,
      totalSkills: r.totalSkills || 0,
      aiInsights: r.aiInsights,
      compareSource: r.compareSource,
      plan: r.plan,
      status: r.status || "completed",
      createdAt: r.createdAt,
      analyzedAt: r.analyzedAt,
    }));

    return NextResponse.json({ 
      reports: serialized,
      count: serialized.length 
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load report history." },
      { status: 500 }
    );
  }
}