// lib/auth/getCurrentUser.js
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME);
    
    if (!token) {
      console.log("No token found in cookies");
      return null;
    }

    console.log("Token found, verifying...");
    
    // Verify token
    const decoded = await verifyToken(token.value);
    console.log("Decoded token:", decoded);
    
    if (!decoded || !decoded.id) {
      console.log("Invalid token - no id");
      return null;
    }

    await dbConnect();
    
    // Find user by id
    const user = await User.findById(decoded.id);
    console.log("User found in database:", user ? "Yes" : "No");
    
    if (!user) {
      return null;
    }
    
    // Return plain object with all needed fields
    return {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      resumeAnalysisCount: user.resumeAnalysisCount,
      password: user.password, // If needed
    };
    
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}