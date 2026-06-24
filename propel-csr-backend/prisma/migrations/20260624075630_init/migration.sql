-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VOLUNTEER', 'COORDINATOR', 'CSR_ADMIN', 'MANAGEMENT', 'FINANCE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'SUBMITTED_FOR_APPROVAL', 'UNDER_REVIEW', 'BUDGET_PENDING', 'APPROVED', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CLOSURE_PENDING', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('APPLIED', 'WAITLISTED', 'CONFIRMED', 'WITHDRAWN', 'ATTENDED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'UTILIZATION_SUBMITTED', 'FINANCE_VERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NeedStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED_FOR_PROPOSAL', 'REJECTED', 'CONVERTED_TO_PROPOSAL', 'CLOSED');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "reportingManager" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProfile" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "preferredCategories" TEXT[],
    "availability" TEXT,
    "emergencyContact" TEXT,
    "skills" TEXT,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recognitionPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "annualBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetUtilized" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CSRCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityNeed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "beneficiaryGroup" TEXT,
    "contactPerson" TEXT,
    "estBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "estBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM',
    "submittedBy" TEXT NOT NULL,
    "status" "NeedStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRProposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "needId" TEXT,
    "categoryId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "proposedSolution" TEXT,
    "eventType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3),
    "expectedVolunteers" INTEGER NOT NULL DEFAULT 0,
    "expectedBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "estimatedBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coordinatorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CSRProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSREvent" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "objective" TEXT,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "volunteersNeeded" INTEGER NOT NULL DEFAULT 0,
    "expectedBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "actualBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "coordinatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CSREvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVolunteerRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "role" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVolunteerRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAttendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "volunteerName" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Present',
    "remarks" TEXT,

    CONSTRAINT "VolunteerAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetRequest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "categoryId" TEXT NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "expenseHead" TEXT,
    "justification" TEXT,
    "requestedBy" TEXT NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetUtilization" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "amountSpent" DOUBLE PRECISION NOT NULL,
    "expenseLineItem" TEXT,
    "expenseDate" TIMESTAMP(3),
    "vendorName" TEXT,
    "invoiceNumber" TEXT,
    "paymentStatus" TEXT DEFAULT 'Pending',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetUtilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCompletionReport" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "actualVolunteerCount" INTEGER NOT NULL DEFAULT 0,
    "actualBeneficiaryCount" INTEGER NOT NULL DEFAULT 0,
    "volunteerHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outcome" TEXT,
    "challenges" TEXT,
    "lessonsLearned" TEXT,
    "budgetUtilized" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventCompletionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecognitionAward" (
    "id" TEXT NOT NULL,
    "volunteerName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criteria" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecognitionAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalHistory" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "needId" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_empId_key" ON "Employee"("empId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_employeeId_key" ON "VolunteerProfile"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "CSRCategory_name_key" ON "CSRCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CSRProposal_needId_key" ON "CSRProposal"("needId");

-- CreateIndex
CREATE UNIQUE INDEX "CSREvent_proposalId_key" ON "CSREvent"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "EventVolunteerRegistration_eventId_volunteerId_key" ON "EventVolunteerRegistration"("eventId", "volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCompletionReport_eventId_key" ON "EventCompletionReport"("eventId");

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNeed" ADD CONSTRAINT "CommunityNeed_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CSRCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProposal" ADD CONSTRAINT "CSRProposal_needId_fkey" FOREIGN KEY ("needId") REFERENCES "CommunityNeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProposal" ADD CONSTRAINT "CSRProposal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CSRCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSREvent" ADD CONSTRAINT "CSREvent_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "CSRProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSREvent" ADD CONSTRAINT "CSREvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CSRCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSREvent" ADD CONSTRAINT "CSREvent_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteerRegistration" ADD CONSTRAINT "EventVolunteerRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CSREvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteerRegistration" ADD CONSTRAINT "EventVolunteerRegistration_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "VolunteerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAttendance" ADD CONSTRAINT "VolunteerAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CSREvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRequest" ADD CONSTRAINT "BudgetRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CSREvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRequest" ADD CONSTRAINT "BudgetRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CSRCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetUtilization" ADD CONSTRAINT "BudgetUtilization_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BudgetRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCompletionReport" ADD CONSTRAINT "EventCompletionReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CSREvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_needId_fkey" FOREIGN KEY ("needId") REFERENCES "CommunityNeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CSREvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
