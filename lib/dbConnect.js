// Cached MongoDB connection for use inside Route Handlers. Next.js
// reloads modules on every request in dev, so without caching on
// `global` we'd open a fresh connection per request and quickly hit
// MongoDB's connection limit — this pattern is the standard fix.

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

/**
 * @returns {Promise<import("mongoose")>} the connected mongoose instance
 * @throws if MONGODB_URI is not configured
 */
export default async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local to enable report history."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
