import { describe, it, expect, beforeAll } from "vitest";
import { buildServer } from "../server.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let token: string;
let collegeToken: string;

beforeAll(async () => {
  app = await buildServer();
  await app.ready();

  // Login as super admin
  const adminRes = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@nexhire.com", password: "password123", collegeCode: "SYSTEM" } });
  token = JSON.parse(adminRes.payload).token;

  // Login as college admin
  const collegeRes = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "admin@mitpune.edu", password: "password123", collegeCode: "MIT2024" } });
  collegeToken = JSON.parse(collegeRes.payload).token;
});

describe("Tenants API", () => {
  it("should list tenants (super admin)", async () => {
    const res = await app.inject({ method: "GET", url: "/api/tenants", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.total).toBeGreaterThan(0);
  });

  it("should reject tenants list for non-admin", async () => {
    const studentRes = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: "rahul@mitpune.edu", password: "password123", collegeCode: "MIT2024" } });
    const studentToken = JSON.parse(studentRes.payload).token;
    const res = await app.inject({ method: "GET", url: "/api/tenants", headers: { authorization: `Bearer ${studentToken}` } });
    expect(res.statusCode).toBe(403);
  });
});

describe("Drives API", () => {
  it("should list drives", async () => {
    const res = await app.inject({ method: "GET", url: "/api/drives", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should search drives by title", async () => {
    const res = await app.inject({ method: "GET", url: "/api/drives?search=SDE", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.some((d: { title: string }) => d.title.includes("SDE"))).toBe(true);
  });

  it("should filter drives by status", async () => {
    const res = await app.inject({ method: "GET", url: "/api/drives?status=active", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    body.data.forEach((d: { status: string }) => expect(d.status).toBe("active"));
  });

  it("should reject unauthenticated access", async () => {
    const res = await app.inject({ method: "GET", url: "/api/drives" });
    expect(res.statusCode).toBe(401);
  });
});

describe("Companies API", () => {
  it("should list companies", async () => {
    const res = await app.inject({ method: "GET", url: "/api/companies", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("should search companies", async () => {
    const res = await app.inject({ method: "GET", url: "/api/companies?search=Google", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.some((c: { name: string }) => c.name.includes("Google"))).toBe(true);
  });
});

describe("Students API", () => {
  it("should list students", async () => {
    const res = await app.inject({ method: "GET", url: "/api/students", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("should support pagination", async () => {
    const res = await app.inject({ method: "GET", url: "/api/students?page=1&limit=2", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.length).toBeLessThanOrEqual(2);
    expect(body.page).toBe(1);
  });
});

describe("Analytics API", () => {
  it("should return college dashboard analytics", async () => {
    const res = await app.inject({ method: "GET", url: "/api/analytics/dashboard", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.stats).toBeDefined();
    expect(body.stats.totalStudents).toBeGreaterThanOrEqual(0);
    expect(body.recentDrives).toBeDefined();
    expect(body.topCompanies).toBeDefined();
  });

  it("should return admin analytics for super admin", async () => {
    const res = await app.inject({ method: "GET", url: "/api/analytics/admin", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.stats.totalTenants).toBeGreaterThan(0);
  });
});

describe("Billing API", () => {
  it("should return plans", async () => {
    const res = await app.inject({ method: "GET", url: "/api/billing/plans", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.plans.length).toBe(3);
  });

  it("should return current subscription", async () => {
    const res = await app.inject({ method: "GET", url: "/api/billing/subscription", headers: { authorization: `Bearer ${collegeToken}` } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.plan).toBeDefined();
    expect(body.tenant).toBeDefined();
  });
});
