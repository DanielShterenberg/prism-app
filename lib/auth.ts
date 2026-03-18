/**
 * Auth helper for API routes.
 *
 * Verifies the Firebase ID token from the Authorization header and returns
 * the Firebase UID, or null if the token is missing or invalid.
 *
 * Expected format: `Authorization: Bearer <firebase-id-token>`
 */

import { NextRequest } from "next/server";
import { getAdminAuth } from "./firebase-admin";

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;

  const token = parts[1].trim();
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
