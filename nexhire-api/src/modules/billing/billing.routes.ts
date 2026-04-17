import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { logger } from "../../config/logger.js";
import { sendEmail } from "../../config/email.js";
import { trackUsage } from "../../middleware/planGate.js";

const PLANS = [
  { id: "basic", name: "Basic", price: 0, priceDisplay: "Free", features: ["Up to 100 students", "5 active drives", "Email support", "Basic analytics"], maxStudents: 100, maxDrives: 5 },
  { id: "premium", name: "Premium", price: 4999, priceDisplay: "₹4,999/mo", features: ["Up to 1,000 students", "Unlimited drives", "Priority support", "Advanced analytics", "CSV export", "Bulk import"], maxStudents: 1000, maxDrives: -1 },
  { id: "enterprise", name: "Enterprise", price: 14999, priceDisplay: "₹14,999/mo", features: ["Unlimited students", "Unlimited drives", "Dedicated support", "Custom branding", "API access", "SSO integration", "Smart matching engine"], maxStudents: -1, maxDrives: -1 },
];

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.get("/plans", async (_req, reply) => reply.send({ plans: PLANS }));

  fastify.get("/subscription", async (req, reply) => {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    if (!tenant) return reply.code(404).send({ message: "Tenant not found" });
    const plan = PLANS.find(p => p.id === tenant.tier) || PLANS[0];
    const subscription = await prisma.subscription.findUnique({ where: { tenantId: req.tenantId } });
    const invoices = subscription ? await prisma.invoice.findMany({ where: { subscriptionId: subscription.id }, orderBy: { createdAt: "desc" }, take: 10 }) : [];
    const month = new Date().toISOString().slice(0, 7);
    const usage = await prisma.usageLog.findMany({ where: { tenantId: req.tenantId, month } });
    return reply.send({ plan, tenant: { id: tenant.id, name: tenant.name, tier: tenant.tier }, subscription, invoices, usage });
  });

  fastify.post("/checkout", async (req, reply) => {
    const { planId } = req.body as { planId: string };
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return reply.code(400).send({ message: "Invalid plan" });
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    logger.info(`💳 Checkout initiated: ${orderId} for plan ${plan.name} (₹${plan.price})`);
    return reply.send({ orderId, plan, gateway: "dummy", message: "Simulated payment. In production → Razorpay/Stripe.", checkoutUrl: `/api/billing/pay/${orderId}` });
  });

  fastify.post("/pay/:orderId", async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const { planId, cardLast4 } = req.body as { planId: string; cardLast4?: string };
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return reply.code(400).send({ message: "Invalid plan" });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await prisma.tenant.update({ where: { id: req.tenantId }, data: { tier: planId } });

    // Create/update subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const subscription = await prisma.subscription.upsert({
      where: { tenantId: req.tenantId },
      update: { planId, status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd },
      create: { tenantId: req.tenantId, planId, status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd },
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await prisma.invoice.create({
      data: { subscriptionId: subscription.id, amount: plan.price, status: "paid", paidAt: now, invoiceNumber },
    });

    // Track usage
    await trackUsage(req.tenantId, "payments");

    // Send invoice email
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId }, include: { users: { where: { role: "college_admin" }, take: 1 } } });
    if (tenant?.users[0]) {
      sendEmail(tenant.users[0].email, `Invoice ${invoiceNumber} — NexHire`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#6366f1">Payment Receipt</h2>
          <p>Hi ${tenant.users[0].name},</p>
          <p>Your payment has been processed successfully.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:4px 0"><strong>Invoice:</strong> ${invoiceNumber}</p>
            <p style="margin:4px 0"><strong>Plan:</strong> ${plan.name}</p>
            <p style="margin:4px 0"><strong>Amount:</strong> ₹${plan.price.toLocaleString()}</p>
            <p style="margin:4px 0"><strong>Date:</strong> ${now.toLocaleDateString("en-IN")}</p>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
          <p style="color:#9ca3af;font-size:12px">NexHire — Campus Placement Platform</p>
        </div>`).catch(() => {});
    }

    logger.info(`💳 Payment success: ${orderId} → ${plan.name} for tenant ${req.tenantId}`);
    return reply.send({ success: true, orderId, plan, invoice, receipt: { id: invoice.id, amount: plan.price, currency: "INR", method: cardLast4 ? `Card ending ${cardLast4}` : "Simulated", date: now.toISOString() }, message: `Successfully upgraded to ${plan.name}!` });
  });

  // Invoice history
  fastify.get("/invoices", async (req, reply) => {
    const subscription = await prisma.subscription.findUnique({ where: { tenantId: req.tenantId } });
    if (!subscription) return reply.send({ invoices: [] });
    const invoices = await prisma.invoice.findMany({ where: { subscriptionId: subscription.id }, orderBy: { createdAt: "desc" } });
    return reply.send({ invoices });
  });

  // Usage stats
  fastify.get("/usage", async (req, reply) => {
    const month = new Date().toISOString().slice(0, 7);
    const [usage, studentCount, driveCount] = await Promise.all([
      prisma.usageLog.findMany({ where: { tenantId: req.tenantId, month } }),
      prisma.student.count({ where: { tenantId: req.tenantId } }),
      prisma.drive.count({ where: { tenantId: req.tenantId, status: "active" } }),
    ]);
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    const plan = PLANS.find(p => p.id === tenant?.tier) || PLANS[0];
    return reply.send({ usage, currentUsage: { students: studentCount, activeDrives: driveCount }, limits: { maxStudents: plan.maxStudents, maxDrives: plan.maxDrives }, plan: plan.id });
  });
}
