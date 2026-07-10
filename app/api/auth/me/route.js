// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import getCurrentUser from "@/lib/auth/getCurrentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    console.log("Auth me route - Raw user object:", JSON.stringify(user, null, 2));
    
    if (!user) {
      console.log("No user found");
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // Check if user has _id or id
    const userId = user._id?.toString() || user.id?.toString();
    
    if (!userId) {
      console.error("User object has no id:", user);
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    const responseData = {
      user: {
        id: userId,
        name: user.name || "User",
        email: user.email || "",
        role: user.role || "user",
        plan: user.plan || "Free",
        resumeAnalysisCount: user.resumeAnalysisCount || 0,
      }
    };
    
    console.log("Sending user data:", responseData);
    
    return NextResponse.json(responseData, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { user: null, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}