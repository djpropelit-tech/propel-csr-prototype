import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Education", annualBudget: 1_000_000, budgetUtilized: 350_000 },
  { name: "Health and Hygiene", annualBudget: 800_000, budgetUtilized: 200_000 },
  { name: "Environment and Sustainability", annualBudget: 500_000, budgetUtilized: 125_000 },
  { name: "Sports Development", annualBudget: 300_000, budgetUtilized: 91_400 },
  { name: "Skill Development and Employment", annualBudget: 400_000, budgetUtilized: 58_500 },
  { name: "Community Development", annualBudget: 350_000, budgetUtilized: 0 },
  { name: "Disaster Relief / Emergency Support", annualBudget: 0, budgetUtilized: 0 },
  { name: "Women Empowerment", annualBudget: 0, budgetUtilized: 0 },
  { name: "Child Welfare", annualBudget: 0, budgetUtilized: 0 },
  { name: "Rural Development", annualBudget: 0, budgetUtilized: 0 },
  { name: "Infrastructure Support", annualBudget: 0, budgetUtilized: 0 },
  { name: "Other", annualBudget: 0, budgetUtilized: 0 },
];

const employees = [
  { empId: "PI-01007", name: "Ganesan", mobile: "+91 98xxxxxx21", email: "ganesan@propelind.com", department: "IT", location: "Coimbatore", designation: "Head of IT (CIO)", reportingManager: "Managing Director", role: "MANAGEMENT" },
  { empId: "PI-02114", name: "Tharunya K", mobile: "+91 98xxxxxx33", email: "tharunya.k@propelind.com", department: "IT Helpdesk", location: "Coimbatore", designation: "Helpdesk Executive", reportingManager: "Ganesan", role: "VOLUNTEER" },
  { empId: "PI-02098", name: "Mani Kandan V", mobile: "+91 98xxxxxx44", email: "manikandan.v@propelind.com", department: "Infrastructure", location: "Coimbatore", designation: "Infra Lead", reportingManager: "Ganesan", role: "VOLUNTEER" },
  { empId: "PI-01876", name: "Vignesh S", mobile: "+91 98xxxxxx55", email: "vignesh.s@propelind.com", department: "Production", location: "Sulur", designation: "Shift Engineer", reportingManager: "Production Head", role: "VOLUNTEER" },
  { empId: "PI-01654", name: "Priya M", mobile: "+91 98xxxxxx66", email: "priya.m@propelind.com", department: "Quality", location: "Sulur", designation: "QA Engineer", reportingManager: "Quality Head", role: "VOLUNTEER" },
  { empId: "PI-01290", name: "Suresh Babu R", mobile: "+91 98xxxxxx99", email: "sureshbabu.r@propelind.com", department: "Cybersecurity", location: "Coimbatore", designation: "Cybersecurity Lead", reportingManager: "Ganesan", role: "COORDINATOR" },
  { empId: "PI-00871", name: "Lakshmi Narayanan", mobile: "+91 98xxxxxx10", email: "lakshmi.n@propelind.com", department: "CSR", location: "Coimbatore", designation: "CSR Admin", reportingManager: "Managing Director", role: "CSR_ADMIN" },
];

const volunteerProfiles = [
  { empId: "PI-01007", preferredCategories: ["Education", "Skill Development and Employment"], availability: "Weekends" },
  { empId: "PI-02114", preferredCategories: ["Health and Hygiene"], availability: "Weekends" },
  { empId: "PI-02098", preferredCategories: ["Environment and Sustainability"], availability: "Weekdays after 5pm" },
];

async function main() {
  for (const cat of categories) {
    await prisma.cSRCategory.upsert({
      where: { name: cat.name },
      update: { annualBudget: cat.annualBudget, budgetUtilized: cat.budgetUtilized },
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} CSR categories.`);

  const employeeByEmpId = {};
  for (const emp of employees) {
    const record = await prisma.employee.upsert({
      where: { empId: emp.empId },
      update: emp,
      create: emp,
    });
    employeeByEmpId[emp.empId] = record;
  }
  console.log(`Seeded ${employees.length} employees.`);

  for (const profile of volunteerProfiles) {
    const employee = employeeByEmpId[profile.empId];
    await prisma.volunteerProfile.upsert({
      where: { employeeId: employee.id },
      update: {
        preferredCategories: profile.preferredCategories,
        availability: profile.availability,
      },
      create: {
        employeeId: employee.id,
        preferredCategories: profile.preferredCategories,
        availability: profile.availability,
      },
    });
  }
  console.log(`Seeded ${volunteerProfiles.length} volunteer profiles.`);

  const communityDev = await prisma.cSRCategory.findUnique({ where: { name: "Community Development" } });
  const existingNeed = await prisma.communityNeed.findFirst({
    where: { title: "Damaged roof in Anganwadi centre, Veerapandi" },
  });
  if (!existingNeed) {
    await prisma.communityNeed.create({
      data: {
        title: "Damaged roof in Anganwadi centre, Veerapandi",
        description: "Roof has visible structural damage following recent rains, posing a safety risk to children.",
        categoryId: communityDev.id,
        location: "Veerapandi",
        estBeneficiaries: 45,
        urgency: "HIGH",
        submittedBy: "Field visit — CSR Team",
        status: "SUBMITTED",
      },
    });
    console.log("Seeded sample community need.");
  }

  const education = await prisma.cSRCategory.findUnique({ where: { name: "Education" } });
  const coordinator = employeeByEmpId["PI-00871"];
  const existingEvent = await prisma.cSREvent.findFirst({
    where: { title: "Govt. School Library Setup — Sulur" },
  });
  if (!existingEvent) {
    await prisma.cSREvent.create({
      data: {
        title: "Govt. School Library Setup — Sulur",
        categoryId: education.id,
        objective: "Set up a functional library with 500 books, reading corner and shelving for students of Std 6–10.",
        location: "Govt. Higher Sec. School, Sulur",
        date: new Date("2026-07-04"),
        time: "9:00 AM – 1:00 PM",
        status: "REGISTRATION_OPEN",
        volunteersNeeded: 15,
        expectedBeneficiaries: 220,
        coordinatorId: coordinator.id,
      },
    });
    console.log("Seeded sample CSR event.");
  }

  const eventCount = await prisma.cSREvent.count();
  console.log(`Database ready — ${eventCount} event(s) available at GET /api/events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
