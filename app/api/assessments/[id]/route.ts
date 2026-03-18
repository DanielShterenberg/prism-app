/**
 * /api/assessments/:id
 *
 * GET    — fetch a single assessment
 * PUT    — full replace of an existing assessment
 * DELETE — remove an assessment
 *
 * All responses use the { data, error } envelope.
 * A valid Authorization: Bearer <token> header is required on every request.
 * Routes are scoped to the authenticated userId so one user cannot access
 * another user's records.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/assessments/:id
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return NextResponse.json(
        { data: null, error: "Not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== userId) {
      return NextResponse.json(
        { data: null, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: assessment, error: null });
  } catch (err) {
    console.error(`[GET /api/assessments/${id}]`, err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/assessments/:id
// ---------------------------------------------------------------------------
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

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
    // Verify ownership before updating
    const existing = await prisma.assessment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { data: null, error: "Not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { data: null, error: "Forbidden" },
        { status: 403 }
      );
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        data: body,
        status:
          (body as Record<string, unknown>).status?.toString() ??
          existing.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error(`[PUT /api/assessments/${id}]`, err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/assessments/:id
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    // Verify ownership before deleting
    const existing = await prisma.assessment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { data: null, error: "Not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { data: null, error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.assessment.delete({ where: { id } });

    return NextResponse.json({ data: { id }, error: null });
  } catch (err) {
    console.error(`[DELETE /api/assessments/${id}]`, err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
