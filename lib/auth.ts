/**
 * Auth helper for API routes.
 *
 * v1 stub: validates that an Authorization header is present and non-empty.
 * Returns the userId extracted from the token, or null if the header is
 * missing/malformed.
 *
 * In a future iteration this will be replaced with a real JWT / Clerk
 * verification call.  All API route handlers call this and return 401 if
 * null is returned — so swapping the implementation here is all that is
 * needed to add real auth.
 */

import { NextRequest } from "next/server";

/**
 * Extracts and validates the Authorization header from a request.
 *
 * Expected format: `Authorization: Bearer <token>`
 *
 * Returns the token string to use as the userId stub in v1, or null when the
 * header is absent or malformed.
 */
export function getUserId(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;

  const token = parts[1].trim();
  if (!token) return null;

  // v1 stub — accept any non-empty token; use the token value as the userId
  // so that records created by different tokens stay isolated.
  return token;
}
