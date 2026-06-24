import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

// GET /api/volunteers — list employees + volunteer profile, search by ?q=
router.get("/", async (req, res) => {
  const { q } = req.query;
  const employees = await prisma.employee.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { empId: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { volunteerProfile: true },
    orderBy: { name: "asc" },
  });
  res.json(employees);
});

// POST /api/volunteers — enroll an employee into the master data store (BRD 6.1)
router.post("/", async (req, res) => {
  const { empId, name, mobile, email, department, location, designation, reportingManager, enrollAsVolunteer, preferredCategories, availability } = req.body;
  if (!empId || !name || !email || !department) {
    return res.status(400).json({ error: "empId, name, email and department are required" });
  }

  const employee = await prisma.employee.create({
    data: {
      empId, name, mobile: mobile || "", email, department,
      location: location || "Coimbatore", designation: designation || "",
      reportingManager,
      ...(enrollAsVolunteer
        ? {
            volunteerProfile: {
              create: {
                preferredCategories: preferredCategories || [],
                availability,
              },
            },
          }
        : {}),
    },
    include: { volunteerProfile: true },
  });
  res.status(201).json(employee);
});

// GET /api/volunteers/leaderboard — top volunteers by hours (BRD 6.10)
router.get("/leaderboard", async (req, res) => {
  const top = await prisma.volunteerProfile.findMany({
    orderBy: { totalHours: "desc" },
    take: 10,
    include: { employee: true },
  });
  res.json(top);
});

// PATCH /api/volunteers/:employeeId/opt-in — employee self-enrolls as a volunteer later
router.patch("/:employeeId/opt-in", async (req, res) => {
  const { preferredCategories, availability, skills, emergencyContact } = req.body;
  const profile = await prisma.volunteerProfile.upsert({
    where: { employeeId: req.params.employeeId },
    update: { preferredCategories, availability, skills, emergencyContact },
    create: { employeeId: req.params.employeeId, preferredCategories: preferredCategories || [], availability, skills, emergencyContact },
  });
  res.json(profile);
});

export default router;
