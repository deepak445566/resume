// Issues/reads a random, non-identifying id stored in a cookie so a
// browser can retrieve its own report history without an account. Used
// by app/api/history/route.js. Must be called from a Route Handler
// (needs access to the request/response cookie jar).

import { cookies } from "next/headers";

const COOKIE_NAME = "resume-analyzer-anon-id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * @returns {Promise<string>} the anonymous id for this browser, creating
 *   and persisting one via cookie if it doesn't exist yet.
 */
export default async function getAnonymousId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return id;
}
