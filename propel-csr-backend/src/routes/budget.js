import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

// GET /api/budget/categories — allocation vs utilization (BRD Section 5)
router.get("/categories", async (req, res) => {
  const categories = await prisma.cSRCategory.findMany();
  res.json(
    categories.map((c) => ({
      ...c,
      balance: c.annualBudget - c.budgetUtilized,
      utilizationPct: c.annualBudget ? Math.round((c.budgetUtilized / c.annualBudget) * 100) : 0,
    }))
  );
});

// POST /api/budget/requests — event coordinator requests budget (BRD 6.7)
router.post("/requests", async (req, res) => {
  const { eventId, categoryId, requestedAmount, expenseHead, justification, requestedBy } = req.body;
  if (!categoryId || !requestedAmount || !requestedBy) {
    return res.status(400).json({ error: "categoryId, requestedAmount and requestedBy are required" });
  }
  const request = await prisma.budgetRequest.create({
    data: { eventId, categoryId, requestedAmount, expenseHead, justification, requestedBy },
  });
  res.status(201).json(request);
});

// PATCH /api/budget/requests/:id/status — CSR team / management approval
router.patch("/requests/:id/status", async (req, res) => {
  const { status } = req.body; // SUBMITTED | UNDER_REVIEW | APPROVED | PARTIALLY_APPROVED | REJECTED
  const request = await prisma.budgetRequest.update({ where: { id: req.params.id }, data: { status } });
  res.json(request);
});

// POST /api/budget/requests/:id/utilization — record actual spend (BRD 6.7)
// Server-side rule: utilization cannot exceed the approved request amount.
router.post("/requests/:id/utilization", async (req, res) => {
  const { amountSpent, expenseLineItem, expenseDate, vendorName, invoiceNumber, remarks } = req.body;

  const request = await prisma.budgetRequest.findUnique({
    where: { id: req.params.id },
    include: { utilizations: true },
  });
  if (!request) return res.status(404).json({ error: "Budget request not found" });
  if (request.status !== "APPROVED" && request.status !== "PARTIALLY_APPROVED") {
    return res.status(400).json({ error: "Utilization can only be recorded against an approved budget request" });
  }

  const alreadySpent = request.utilizations.reduce((s, u) => s + u.amountSpent, 0);
  if (alreadySpent + amountSpent > request.requestedAmount) {
    return res.status(400).json({ error: "Utilization exceeds approved budget. Submit an additional budget request first." });
  }

  const utilization = await prisma.budgetUtilization.create({
    data: { requestId: request.id, amountSpent, expenseLineItem, expenseDate, vendorName, invoiceNumber, remarks },
  });

  // Reflect the spend on the parent category's running total.
  await prisma.cSRCategory.update({
    where: { id: request.categoryId },
    data: { budgetUtilized: { increment: amountSpent } },
  });

  res.status(201).json(utilization);
});

export default router;
