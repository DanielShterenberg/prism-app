/**
 * @jest-environment node
 *
 * Unit tests for GET/PUT/DELETE /api/assessments/:id.
 *
 * Prisma is mocked so these tests run without a real database.
 */

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    assessment: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

// Import route handlers AFTER mocks are set up
import { GET, PUT, DELETE } from "../route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ASSESSMENT_ID = "uuid-abc";
const USER_TOKEN = "tok1";

function makeRequest(
  method: string,
  options: { auth?: string; body?: unknown } = {}
): NextRequest {
  const url = `http://localhost/api/assessments/${ASSESSMENT_ID}`;
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

// RouteContext params must be a Promise per Next.js 15+ App Router types
function makeContext(id = ASSESSMENT_ID): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

const sampleRecord = {
  id: ASSESSMENT_ID,
  userId: USER_TOKEN,
  data: { status: "in_progress" },
  status: "in_progress",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// GET /api/assessments/:id
// ---------------------------------------------------------------------------
describe("GET /api/assessments/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(makeRequest("GET"), makeContext());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ data: null, error: "Unauthorized" });
  });

  it("returns 404 when assessment does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await GET(makeRequest("GET", { auth: `Bearer ${USER_TOKEN}` }), makeContext());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  it("returns 403 when assessment belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...sampleRecord, userId: "other-user" });
    const res = await GET(makeRequest("GET", { auth: `Bearer ${USER_TOKEN}` }), makeContext());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("returns 200 with assessment data on success", async () => {
    mockFindUnique.mockResolvedValueOnce(sampleRecord);
    const res = await GET(makeRequest("GET", { auth: `Bearer ${USER_TOKEN}` }), makeContext());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data.id).toBe(ASSESSMENT_ID);
  });

  it("returns 500 when Prisma throws", async () => {
    mockFindUnique.mockRejectedValueOnce(new Error("db error"));
    const res = await GET(makeRequest("GET", { auth: `Bearer ${USER_TOKEN}` }), makeContext());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ data: null, error: "Internal server error" });
  });
});

// ---------------------------------------------------------------------------
// PUT /api/assessments/:id
// ---------------------------------------------------------------------------
describe("PUT /api/assessments/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const res = await PUT(makeRequest("PUT", { body: {} }), makeContext());
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest(
      `http://localhost/api/assessments/${ASSESSMENT_ID}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${USER_TOKEN}`,
        },
        body: "not-json{{{",
      }
    );
    const res = await PUT(req, makeContext());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON body");
  });

  it("returns 404 when assessment does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await PUT(
      makeRequest("PUT", { auth: `Bearer ${USER_TOKEN}`, body: {} }),
      makeContext()
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when assessment belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...sampleRecord, userId: "other-user" });
    const res = await PUT(
      makeRequest("PUT", { auth: `Bearer ${USER_TOKEN}`, body: {} }),
      makeContext()
    );
    expect(res.status).toBe(403);
  });

  it("returns 200 with updated record on success", async () => {
    const updatedRecord = { ...sampleRecord, status: "completed" };
    mockFindUnique.mockResolvedValueOnce(sampleRecord);
    mockUpdate.mockResolvedValueOnce(updatedRecord);
    const res = await PUT(
      makeRequest("PUT", {
        auth: `Bearer ${USER_TOKEN}`,
        body: { status: "completed" },
      }),
      makeContext()
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data.status).toBe("completed");
  });

  it("returns 500 when Prisma throws on update", async () => {
    mockFindUnique.mockResolvedValueOnce(sampleRecord);
    mockUpdate.mockRejectedValueOnce(new Error("db error"));
    const res = await PUT(
      makeRequest("PUT", { auth: `Bearer ${USER_TOKEN}`, body: {} }),
      makeContext()
    );
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/assessments/:id
// ---------------------------------------------------------------------------
describe("DELETE /api/assessments/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const res = await DELETE(makeRequest("DELETE"), makeContext());
    expect(res.status).toBe(401);
  });

  it("returns 404 when assessment does not exist", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await DELETE(
      makeRequest("DELETE", { auth: `Bearer ${USER_TOKEN}` }),
      makeContext()
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when assessment belongs to another user", async () => {
    mockFindUnique.mockResolvedValueOnce({ ...sampleRecord, userId: "other-user" });
    const res = await DELETE(
      makeRequest("DELETE", { auth: `Bearer ${USER_TOKEN}` }),
      makeContext()
    );
    expect(res.status).toBe(403);
  });

  it("returns 200 with deleted id on success", async () => {
    mockFindUnique.mockResolvedValueOnce(sampleRecord);
    mockDelete.mockResolvedValueOnce(sampleRecord);
    const res = await DELETE(
      makeRequest("DELETE", { auth: `Bearer ${USER_TOKEN}` }),
      makeContext()
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data).toEqual({ id: ASSESSMENT_ID });
  });

  it("returns 500 when Prisma throws on delete", async () => {
    mockFindUnique.mockResolvedValueOnce(sampleRecord);
    mockDelete.mockRejectedValueOnce(new Error("db error"));
    const res = await DELETE(
      makeRequest("DELETE", { auth: `Bearer ${USER_TOKEN}` }),
      makeContext()
    );
    expect(res.status).toBe(500);
  });
});
