// User account for the authenticated SaaS flow (Task 1).
//
// Note: report history today is still keyed by anonymousId (see
// models/Report.js / lib/anonymousId.js) from the earlier anonymous-first
// build of this project. Wiring Report -> userId is a follow-up task once
// this auth system is in place; it isn't touched here.

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["Free", "Basic", "Pro"],
      default: "Free",
    },
    resumeAnalysisCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);