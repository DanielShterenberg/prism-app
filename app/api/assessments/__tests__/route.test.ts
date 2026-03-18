/**
 * @jest-environment node
 *
 * Unit tests for GET /api/assessments and POST /api/assessments.
 *
 * Prisma is mocked so these tests run without a real database.
 * NextRequest / NextResponse are used directly from next/server — no mocking
 * needed because next/server exports work fine in Node environments.
 */

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    assessment: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Import route handlers AFTER mocks are set up
import { GET, POST } from "../route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(
  method: string,
  options: { auth?: string; body?: unknown } = {}
): NextRequest {
  const url = "http://localhost/api/assessments";
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options.auth !== undefined) {
    headers["authorization"] = options.auth;
  }
  const init: RequestInit = { method, headers };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(url, init);
}

const sampleRecord = {
  id: "uuid-1",
  userId: "tok1",
  data: { status: "in_progress" },
  status: "in_progress",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// GET /api/assessments
// ---------------------------------------------------------------------------
describe("GET /api/assessments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const req = makeRequest("GET");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ data: null, error: "Unauthorized" });
  });

  it("returns 401 when Authorization header is malformed", async () => {
    const req = makeRequest("GET", { auth: "NotBearer token" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is empty after Bearer", async () => {
    const req = makeRequest("GET", { auth: "Bearer " });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with data array on success", async () => {
    mockFindMany.mockResolvedValueOnce([sampleRecord]);
    const req = makeRequest("GET", { auth: "Bearer tok1" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("queries Prisma filtered by userId with updatedAt desc order", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const req = makeRequest("GET", { auth: "Bearer mytoken" });
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "mytoken" },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("returns 500 when Prisma throws", async () => {
    mockFindMany.mockRejectedValueOnce(new Error("db error"));
    const req = makeRequest("GET", { auth: "Bearer tok1" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ data: null, error: "Internal server error" });
  });
});

// ---------------------------------------------------------------------------
// POST /api/assessments
// ---------------------------------------------------------------------------
describe("POST /api/assessments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const req = makeRequest("POST", { body: {} });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost/api/assessments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer tok1",
      },
      body: "not-json{{{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON body");
  });

  it("returns 201 with created record on success", async () => {
    mockCreate.mockResolvedValueOnce(sampleRecord);
    const req = makeRequest("POST", {
      auth: "Bearer tok1",
      body: { status: "in_progress", identification: { patientName: "ילד בדיקה" } },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data.id).toBe("uuid-1");
  });

  it("creates record with correct userId from token", async () => {
    mockCreate.mockResolvedValueOnce(sampleRecord);
    const req = makeRequest("POST", {
      auth: "Bearer mytoken",
      body: { status: "in_progress" },
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "mytoken" }),
      })
    );
  });

  it("returns 500 when Prisma throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("db error"));
    const req = makeRequest("POST", { auth: "Bearer tok1", body: {} });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ data: null, error: "Internal server error" });
  });
});
