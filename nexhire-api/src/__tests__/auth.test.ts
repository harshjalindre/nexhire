import { describe, it, expect, beforeAll } from "vitest";
import { buildServer } from "../server.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
  await app.ready();
});

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@nexhire.com", password: "password123", collegeCode: "SYSTEM" } });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe("admin@nexhire.com");
      expect(body.user.role).toBe("super_admin");
    });

    it("should reject wrong password", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@nexhire.com", password: "wrongpass", collegeCode: "SYSTEM" } });
      expect(res.statusCode).toBe(401);
    });

    it("should reject invalid college code", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@nexhire.com", password: "password123", collegeCode: "INVALID" } });
      expect(res.statusCode).toBe(404);
    });

    it("should reject missing fields", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@nexhire.com" } });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should accept valid email for password reset", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email: "admin@nexhire.com", collegeCode: "SYSTEM" } });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("reset code");
    });

    it("should not reveal if email doesn't exist", async () => {
      const res = await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email: "nonexistent@test.com", collegeCode: "SYSTEM" } });
      expect(res.statusCode).toBe(200);
    });
  });
});

describe("Health API", () => {
  it("should return healthy status", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("ok");
  });
});
