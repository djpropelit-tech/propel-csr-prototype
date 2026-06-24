import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

// GET /api/approvals/pending — combined queue across need/proposal/budget/closure
// In a full build this would union several tables; kept simple here as a starter.
router.get("/pending", async (req, res) => {
  const [needs, budgetRequests, completionReports] = await Promise.all([
    prisma.communityNeed.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.budgetRequest.findMany({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.eventCompletionReport.findMany({ where: { status: "Submitted" } }),
  ]);
  res.json({ needs, budgetRequests, completionReports });
});

// POST /api/approvals — record an approval decision + audit trail entry (BRD 6.8)
// Every action retains: approver, timestamp, previous/new status, comments — mandatory for auditability.
router.post("/", async (req, res) => {
  const { entityType, entityId, approverId, action, previousStatus, newStatus, comments } = req.body;
  if (!entityType || !entityId || !approverId || !action) {
    return res.status(400).json({ error: "entityType, entityId, approverId and action are required" });
  }
  const record = await prisma.approvalHistory.create({
    data: { entityType, entityId, approverId, action, previousStatus, newStatus, comments },
  });
  res.status(201).json(record);
});

// GET /api/approvals/history/:entityType/:entityId — full audit trail for one item
router.get("/history/:entityType/:entityId", async (req, res) => {
  const history = await prisma.approvalHistory.findMany({
    where: { entityType: req.params.entityType, entityId: req.params.entityId },
    include: { approver: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(history);
});

export default router;
