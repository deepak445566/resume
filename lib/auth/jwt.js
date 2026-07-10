// lib/auth/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signToken(payload) {
  try {
    console.log("Signing token with payload:", payload);
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log("Token signed successfully");
    return token;
  } catch (error) {
    console.error("Error signing token:", error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    console.log("Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified, decoded:", decoded);
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}