// app/api/history/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import Report from "@/models/Report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Get a single report
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID." },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to view this report." },
        { status: 401 }
      );
    }

    await dbConnect();

    const report = await Report.findOne({ 
      _id: id, 
      userId: user._id 
    }).lean();

    if (!report) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: report._id.toString(),
      fileName: report.fileName,
      fileSize: report.fileSize,
      wordCount: report.wordCount,
      content: report.content,
      role: report.role,
      atsScore: report.atsScore,
      matchedSkills: report.matchedSkills || [],
      missingSkills: report.missingSkills || [],
      matchedCount: report.matchedCount || 0,
      totalSkills: report.totalSkills || 0,
      aiInsights: report.aiInsights,
      compareSource: report.compareSource,
      plan: report.plan,
      status: report.status,
      createdAt: report.createdAt,
      analyzedAt: report.analyzedAt,
    });

  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load report." },
      { status: 500 }
    );
  }
}

// DELETE - Delete a report
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "A valid report id is required." },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to delete reports." },
        { status: 401 }
      );
    }

    await dbConnect();

    const deleted = await Report.findOneAndDelete({ 
      _id: id, 
      userId: user._id 
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Report not found or you don't have permission to delete it." },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Report deleted successfully",
      id: id 
    });

  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete report." },
      { status: 500 }
    );
  }
}

// PATCH - Update a report (for adding AI insights, etc.)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID." },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Please login to update reports." },
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

    await dbConnect();

    // Find and update
    const updated = await Report.findOneAndUpdate(
      { _id: id, userId: user._id },
      { 
        $set: {
          ...body,
          updatedAt: new Date(),
        }
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
      report: {
        id: updated._id.toString(),
        ...updated,
      }
    });

  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update report." },
      { status: 500 }
    );
  }
}