import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { logger } from "../../config/logger.js";

const PLANS = [
  { id: "basic", name: "Basic", price: 0, priceDisplay: "Free", features: ["Up to 100 students", "5 active drives", "Email support", "Basic analytics"], maxStudents: 100, maxDrives: 5 },
  { id: "premium", name: "Premium", price: 4999, priceDisplay: "₹4,999/mo", features: ["Up to 1,000 students", "Unlimited drives", "Priority support", "Advanced analytics", "CSV export", "Bulk import"], maxStudents: 1000, maxDrives: -1 },
  { id: "enterprise", name: "Enterprise", price: 14999, priceDisplay: "₹14,999/mo", features: ["Unlimited students", "Unlimited drives", "Dedicated support", "Custom branding", "API access", "SSO integration", "Smart matching engine"], maxStudents: -1, maxDrives: -1 },
];

export async function billingRoutes(fastify: FastifyInstance) {
  // Get plans
  fastify.get("/plans", async (_req, reply) => {
    return reply.send({ plans: PLANS });
  });

  // Get current subscription
  fastify.get("/subscription", async (req, reply) => {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    if (!tenant) return reply.code(404).send({ message: "Tenant not found" });
    const plan = PLANS.find(p => p.id === tenant.tier) || PLANS[0];
    return reply.send({ plan, tenant: { id: tenant.id, name: tenant.name, tier: tenant.tier } });
  });

  // Create dummy checkout
  fastify.post("/checkout", async (req, reply) => {
    const { planId } = req.body as { planId: string };
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return reply.code(400).send({ message: "Invalid plan" });

    // Simulate payment gateway — generate a fake order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    logger.info(`💳 Checkout initiated: ${orderId} for plan ${plan.name} (₹${plan.price})`);

    return reply.send({
      orderId,
      plan,
      gateway: "dummy",
      message: "This is a simulated payment. In production, this would redirect to Razorpay/Stripe.",
      checkoutUrl: `/api/billing/pay/${orderId}`,
    });
  });

  // Simulate payment completion
  fastify.post("/pay/:orderId", async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const { planId, cardLast4 } = req.body as { planId: string; cardLast4?: string };
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return reply.code(400).send({ message: "Invalid plan" });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update tenant tier
    await prisma.tenant.update({ where: { id: req.tenantId }, data: { tier: planId } });
    logger.info(`💳 Payment success: ${orderId} → ${plan.name} for tenant ${req.tenantId}`);

    return reply.send({
      success: true,
      orderId,
      plan,
      receipt: {
        id: `rcpt_${Date.now()}`,
        amount: plan.price,
        currency: "INR",
        method: cardLast4 ? `Card ending ${cardLast4}` : "Simulated",
        date: new Date().toISOString(),
      },
      message: `Successfully upgraded to ${plan.name}!`,
    });
  });
}
