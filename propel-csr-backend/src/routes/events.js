import { Router } from "express";
import { prisma } from "../prismaClient.js";

const router = Router();

// GET /api/events — list, with optional ?status= & ?category=
router.get("/", async (req, res) => {
  const { status, category } = req.query;
  const events = await prisma.cSREvent.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category: { name: category } } : {}),
    },
    include: { category: true, coordinator: true, registrations: { include: { volunteer: { include: { employee: true } } } } },
    orderBy: { date: "asc" },
  });
  res.json(events);
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  const event = await prisma.cSREvent.findUnique({
    where: { id: req.params.id },
    include: { category: true, coordinator: true, registrations: { include: { volunteer: true } }, attendances: true },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

// POST /api/events — create a new event/proposal (BRD 6.3)
router.post("/", async (req, res) => {
  const { title, categoryId, location, date, time, objective, volunteersNeeded, expectedBeneficiaries, coordinatorId } = req.body;
  if (!title || !categoryId || !location || !date || !coordinatorId) {
    return res.status(400).json({ error: "title, categoryId, location, date and coordinatorId are required" });
  }
  const event = await prisma.cSREvent.create({
    data: {
      title, categoryId, location, date: new Date(date), time, objective,
      volunteersNeeded: volunteersNeeded || 0,
      expectedBeneficiaries: expectedBeneficiaries || 0,
      coordinatorId,
      status: "SUBMITTED_FOR_APPROVAL",
    },
  });
  res.status(201).json(event);
});

// PATCH /api/events/:id/status — move through workflow states (BRD 11)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const event = await prisma.cSREvent.update({ where: { id: req.params.id }, data: { status } });
  res.json(event);
});

// POST /api/events/:id/register — volunteer applies (BRD 6.4)
router.post("/:id/register", async (req, res) => {
  const { volunteerId } = req.body;
  const event = await prisma.cSREvent.findUnique({ where: { id: req.params.id }, include: { registrations: true } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const confirmedCount = event.registrations.filter((r) => r.status === "CONFIRMED").length;
  const status = confirmedCount >= event.volunteersNeeded ? "WAITLISTED" : "APPLIED";

  const registration = await prisma.eventVolunteerRegistration.create({
    data: { eventId: event.id, volunteerId, status },
  });
  res.status(201).json(registration);
});

// PATCH /api/events/:eventId/registrations/:regId — coordinator confirms/waitlists (BRD 6.5)
router.patch("/:eventId/registrations/:regId", async (req, res) => {
  const { status } = req.body; // CONFIRMED | WAITLISTED | REJECTED | ATTENDED | NO_SHOW
  const registration = await prisma.eventVolunteerRegistration.update({
    where: { id: req.params.regId },
    data: { status },
  });
  res.json(registration);
});

// POST /api/events/:id/attendance — mark attendance (BRD 6.5)
router.post("/:id/attendance", async (req, res) => {
  const { volunteerName, checkIn, checkOut, hours, remarks } = req.body;
  const attendance = await prisma.volunteerAttendance.create({
    data: { eventId: req.params.id, volunteerName, checkIn, checkOut, hours, remarks },
  });
  res.status(201).json(attendance);
});

// POST /api/events/:id/completion-report — closure (BRD 6.9)
router.post("/:id/completion-report", async (req, res) => {
  const { actualVolunteerCount, actualBeneficiaryCount, volunteerHours, outcome, challenges, lessonsLearned, budgetUtilized } = req.body;
  const report = await prisma.eventCompletionReport.create({
    data: {
      eventId: req.params.id,
      actualVolunteerCount, actualBeneficiaryCount, volunteerHours,
      outcome, challenges, lessonsLearned, budgetUtilized,
    },
  });
  await prisma.cSREvent.update({ where: { id: req.params.id }, data: { status: "CLOSURE_PENDING" } });
  res.status(201).json(report);
});

export default router;
