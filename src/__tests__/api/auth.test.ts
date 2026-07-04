import { describe, it, expect, vi, beforeEach } from "vitest";

// ──────────────────────────────────────────────
// Auth API Integration Tests
//
// These tests validate the auth route handlers:
// - Registration (POST /api/auth/register)
// - Password reset (POST /api/auth/reset-password)
// - Password reset confirm (PUT /api/auth/reset-password)
//
// Prisma-dependent tests are marked with .skip
// and will be enabled when Prisma mocking is set up.
// ──────────────────────────────────────────────

let requestCounter = 0;

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init: any = { status: 200 }) => {
      const status = init.status ?? 200;
      const headers = new Headers(init.headers ?? {});
      return { status, headers, json: async () => data, data, init };
    }),
  },
}));

// Mock prisma — will be populated when testing DB flows
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: any) =>
      fn({
        user: { update: vi.fn() },
        verificationToken: { delete: vi.fn() },
      }),
    ),
  },
}));

// Mock email service
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));

import { POST as registerPost } from "@/app/api/auth/register/route";
import {
  POST as resetPost,
  PUT as resetPut,
} from "@/app/api/auth/reset-password/route";

/**
 * Create a request with a unique IP to avoid rate-limiter cross-contamination.
 * The rate limiter uses a module-level Map keyed by IP, so each test needs
 * a distinct client address.
 */
function createRequest(
  method: string,
  body: any,
): Request {
  requestCounter++;
  return new Request("http://localhost:3000/api/auth", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `test-${requestCounter}.0.0.1`,
    },
    body: JSON.stringify(body),
  });
}

describe("Auth API — Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects registration with missing fields", async () => {
    const req = createRequest("POST", {});
    const res = await registerPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("rejects registration with invalid email", async () => {
    const req = createRequest("POST", {
      name: "Test User",
      email: "not-an-email",
      password: "Password123",
    });
    const res = await registerPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("rejects registration with short password", async () => {
    const req = createRequest("POST", {
      name: "Test User",
      email: "test@example.com",
      password: "Ab1",
    });
    const res = await registerPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("rejects registration with password missing uppercase", async () => {
    const req = createRequest("POST", {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    const res = await registerPost(req);
    expect(res.status).toBe(400);
  });

  it("rejects registration with password missing number", async () => {
    const req = createRequest("POST", {
      name: "Test User",
      email: "test@example.com",
      password: "Passwordabc",
    });
    const res = await registerPost(req);
    expect(res.status).toBe(400);
  });

  it.skip("registers a user successfully (needs Prisma mock)", async () => {
    // TODO: Set up Prisma mock to return null for findUnique
    // and return a user for create, then verify 201 response
  });

  it.skip("rejects duplicate email (needs Prisma mock)", async () => {
    // TODO: Mock prisma.user.findUnique to return an existing user
    // then verify 409 response
  });
});

describe("Auth API — Password Reset (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects reset with invalid email", async () => {
    const req = createRequest("POST", { email: "bad-email" });
    const res = await resetPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("returns success for valid email even if user doesn't exist (no enumeration)", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = createRequest("POST", { email: "nonexistent@example.com" });
    const res = await resetPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it.skip("returns success for existing email and sends reset email", async () => {
    // TODO: Mock prisma to return a user and verify email sending
  });

  it("rejects reset with empty body", async () => {
    const req = createRequest("POST", {});
    const res = await resetPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});

describe("Auth API — Password Reset Confirm (PUT)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects confirm with missing token", async () => {
    const req = createRequest("PUT", {
      email: "test@example.com",
      password: "NewPass123",
    });
    const res = await resetPut(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("rejects confirm with missing email", async () => {
    const req = createRequest("PUT", {
      token: "abc123",
      password: "NewPass123",
    });
    const res = await resetPut(req);
    expect(res.status).toBe(400);
  });

  it("rejects confirm with short password", async () => {
    const req = createRequest("PUT", {
      token: "abc123",
      email: "test@example.com",
      password: "Short1A",
    });
    const res = await resetPut(req);
    expect(res.status).toBe(400);
  });

  it.skip("rejects confirm with expired or invalid token", async () => {
    // TODO: Mock prisma.verificationToken.findFirst to return null
    // then verify 400 response
  });

  it.skip("accepts confirm with valid token and resets password", async () => {
    // TODO: Mock prisma.verificationToken.findFirst to return a valid token
    // and verify 200 response with success message
  });
});
