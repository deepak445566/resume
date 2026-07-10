// app/api/register/route.js
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  console.log("=== REGISTER API CALLED ===");
  
  let body;
  
  try {
    body = await request.json();
    console.log("Request body:", body);
  } catch (error) {
    console.error("JSON parse error:", error);
    return new Response(
      JSON.stringify({ error: "Request body must be valid JSON." }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const { name, email, password } = body || {};

  // Simple validation
  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({ error: "All fields are required: name, email, password" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (name.length < 2) {
    return new Response(
      JSON.stringify({ error: "Name must be at least 2 characters" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (!email.includes("@") || !email.includes(".")) {
    return new Response(
      JSON.stringify({ error: "Please enter a valid email address" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (password.length < 8) {
    return new Response(
      JSON.stringify({ error: "Password must be at least 8 characters" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    await dbConnect();
    console.log("Database connected");

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists." }),
        { 
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    console.log("Password hashed");

    // Create user
    const user = await User.create({
      name,
      email,
      password: passwordHash,
    });
    console.log("User created:", user._id);

    // Generate token
    const token = await signToken({ 
      id: user._id.toString(), 
      role: user.role 
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
    const responseData = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan || "Free",
        resumeAnalysisCount: user.resumeAnalysisCount || 0,
      },
    };

    console.log("Registration successful for:", user.email);
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
    
  } catch (err) {
    if (err?.code === 11000) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists." }),
        { 
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    console.error("Registration error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create account." }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}