import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

// GET /api/needs
router.get("/", async (req, res) => {
  const { status } = req.query;
  const needs = await prisma.communityNeed.findMany({
    where: status ? { status } : undefined,
    include: { category: true, attachments: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(needs);
});

// POST /api/needs — submit a community need (BRD 6.2)
router.post("/", async (req, res) => {
  const { title, description, categoryId, location, beneficiaryGroup, contactPerson, estBeneficiaries, estBudget, urgency, submittedBy } = req.body;
  if (!title || !description || !categoryId || !location || !submittedBy) {
    return res.status(400).json({ error: "title, description, categoryId, location and submittedBy are required" });
  }
  const need = await prisma.communityNeed.create({
    data: {
      title, description, categoryId, location, beneficiaryGroup, contactPerson,
      estBeneficiaries: estBeneficiaries || 0, estBudget: estBudget || 0,
      urgency: urgency || "MEDIUM", submittedBy,
    },
  });
  res.status(201).json(need);
});

// PATCH /api/needs/:id/status — CSR team review (BRD 6.2 status lifecycle)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const need = await prisma.communityNeed.update({ where: { id: req.params.id }, data: { status } });
  res.json(need);
});

export default router;
