/**
 * /api/assessments
 *
 * GET  — list all assessments for the authenticated user
 * POST — create a new assessment
 *
 * All responses use the { data, error } envelope.
 * A valid Authorization: Bearer <token> header is required on every request.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// ---------------------------------------------------------------------------
// GET /api/assessments
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: assessments, error: null });
  } catch (err) {
    console.error("[GET /api/assessments]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/assessments
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { data: null, error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  try {
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        data: body,
        status:
          (body as Record<string, unknown>).status?.toString() ?? "in_progress",
      },
    });

    return NextResponse.json({ data: assessment, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/assessments]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
