// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth/password";
import { signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  console.log("=== LOGIN API CALLED ===");
  
  let body;
  
  try {
    body = await request.json();
    console.log("Request body:", { email: body?.email, password: '***' });
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { email, password } = body || {};

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    console.log("Database connected");

    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await comparePassword(password, user.password);
    console.log("Password matches:", passwordMatches);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create token with user id
    const token = await signToken({ 
      id: user._id.toString(), 
      role: user.role || "user"
    });
    console.log("Token generated");

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    console.log("Cookie set");

    // Return user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      plan: user.plan || "Free",
      resumeAnalysisCount: user.resumeAnalysisCount || 0,
    };

    console.log("Login successful for:", user.email);
    console.log("User data sent:", userData);
    
    return NextResponse.json({ user: userData }, { status: 200 });
    
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}