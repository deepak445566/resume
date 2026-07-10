// models/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  // User reference (optional for anonymous users)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Make optional for anonymous users
  },
  
  // Anonymous user identifier (for non-logged-in users)
  anonymousId: {
    type: String,
    required: false, // Make optional
  },
  
  // File information
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["pdf", "docx"],
    required: false,
  },
  
  // Resume content
  content: {
    type: String,
    required: true,
  },
  wordCount: {
    type: Number,
    required: false,
  },
  
  // ATS Analysis Results
  role: {
    type: String,
    required: false, // Make optional - will be filled after analysis
  },
  totalSkills: {
    type: Number,
    required: false, // Make optional
  },
  matchedSkills: {
    type: [String],
    required: false,
  },
  matchedCount: {
    type: Number,
    required: false, // Make optional
  },
  atsScore: {
    type: Number,
    required: false, // Make optional
    min: 0,
    max: 100,
  },
  
  // Analysis status
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "completed",
  },
  
  // Plan information
  plan: {
    type: String,
    enum: ["Free", "Basic", "Pro"],
    default: "Free",
  },
  
  // Timestamps
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
ReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);