const CATEGORY_TO_UI = {
  "Health and Hygiene": "Health & Hygiene",
  "Environment and Sustainability": "Environment",
  "Skill Development and Employment": "Skill Development",
};

const CATEGORY_TO_API = Object.fromEntries(
  Object.entries(CATEGORY_TO_UI).map(([api, ui]) => [ui, api])
);

export function categoryToUi(name) {
  return CATEGORY_TO_UI[name] || name;
}

export function categoryToApi(name) {
  return CATEGORY_TO_API[name] || name;
}

const EVENT_STATUS_TO_UI = {
  REGISTRATION_OPEN: "Registration Open",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CLOSURE_PENDING: "Closure Pending",
  APPROVED: "Approved",
  CLOSED: "Closed",
  SUBMITTED_FOR_APPROVAL: "Submitted for Approval",
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
};

const NEED_STATUS_TO_UI = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED_FOR_PROPOSAL: "Approved for Proposal",
  REJECTED: "Rejected",
  DRAFT: "Draft",
  CONVERTED_TO_PROPOSAL: "Converted to Proposal",
  CLOSED: "Closed",
};

const REG_STATUS_TO_UI = {
  APPLIED: "Applied",
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  ATTENDED: "Attended",
  WITHDRAWN: "Withdrawn",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
};

const UI_NEED_STATUS_TO_API = {
  "Under Review": "UNDER_REVIEW",
  "Approved for Proposal": "APPROVED_FOR_PROPOSAL",
  Rejected: "REJECTED",
};

const UI_REG_STATUS_TO_API = {
  Applied: "APPLIED",
  Confirmed: "CONFIRMED",
  Waitlisted: "WAITLISTED",
  Attended: "ATTENDED",
  Withdrawn: "WITHDRAWN",
};

export function mapEventStatus(status) {
  return EVENT_STATUS_TO_UI[status] || status;
}

export function mapNeedStatus(status) {
  return NEED_STATUS_TO_UI[status] || status;
}

export function mapRegStatus(status) {
  return REG_STATUS_TO_UI[status] || status;
}

export function needStatusToApi(status) {
  return UI_NEED_STATUS_TO_API[status] || status;
}

export function regStatusToApi(status) {
  return UI_REG_STATUS_TO_API[status] || status;
}

export function mapEvent(e) {
  const applicants = (e.registrations || []).map((r) => {
    const emp = r.volunteer?.employee;
    return {
      regId: r.id,
      volunteerId: r.volunteerId,
      name: emp?.name || "Unknown",
      dept: emp?.department || "",
      status: mapRegStatus(r.status),
    };
  });
  const confirmed = applicants.filter((a) =>
    ["Confirmed", "Attended"].includes(a.status)
  ).length;

  return {
    id: e.id,
    categoryId: e.categoryId,
    coordinatorId: e.coordinatorId,
    title: e.title,
    category: categoryToUi(e.category?.name || ""),
    date: e.date ? String(e.date).slice(0, 10) : "TBD",
    time: e.time || "TBD",
    location: e.location,
    status: mapEventStatus(e.status),
    volunteersNeeded: e.volunteersNeeded ?? 0,
    confirmed,
    beneficiaries: e.expectedBeneficiaries ?? e.actualBeneficiaries ?? 0,
    budget: 0,
    utilized: 0,
    coordinator: e.coordinator?.name || "",
    objective: e.objective || "",
    applicants,
  };
}

export function mapNeed(n) {
  return {
    id: n.id,
    categoryId: n.categoryId,
    title: n.title,
    category: categoryToUi(n.category?.name || ""),
    location: n.location,
    beneficiaries: n.estBeneficiaries ?? 0,
    urgency: n.urgency ? n.urgency[0] + n.urgency.slice(1).toLowerCase() : "Medium",
    submittedBy: n.submittedBy,
    status: mapNeedStatus(n.status),
  };
}

export function mapEmployee(e) {
  return {
    id: e.id,
    empId: e.empId,
    name: e.name,
    mobile: e.mobile,
    email: e.email,
    department: e.department,
    location: e.location,
    designation: e.designation,
    manager: e.reportingManager || "—",
    isVolunteer: Boolean(e.volunteerProfile),
    volunteerProfileId: e.volunteerProfile?.id,
  };
}

export function mapBudgetCategory(c) {
  return {
    id: c.id,
    name: categoryToUi(c.name),
    apiName: c.name,
    allocated: c.annualBudget ?? 0,
    utilized: c.budgetUtilized ?? 0,
  };
}

export function mapLeaderboardEntry(v) {
  return {
    name: v.employee?.name || "Unknown",
    dept: v.employee?.department || "",
    hours: Math.round(v.totalHours ?? 0),
    events: 0,
  };
}

export function mapPendingApprovals(pending) {
  const items = [];
  for (const n of pending.needs || []) {
    items.push({
      id: n.id,
      entityType: "CommunityNeed",
      type: "Community Need",
      title: n.title,
      amount: n.estBudget ?? 0,
      requestedBy: n.submittedBy,
      status: ["SUBMITTED", "UNDER_REVIEW"].includes(n.status) ? "Pending" : mapNeedStatus(n.status),
    });
  }
  for (const b of pending.budgetRequests || []) {
    items.push({
      id: b.id,
      entityType: "BudgetRequest",
      type: "Budget Allocation",
      title: b.justification || b.expenseHead || "Budget request",
      amount: b.requestedAmount ?? 0,
      requestedBy: b.requestedBy,
      status: ["SUBMITTED", "UNDER_REVIEW"].includes(b.status) ? "Pending" : b.status,
    });
  }
  for (const r of pending.completionReports || []) {
    items.push({
      id: r.id,
      entityType: "EventCompletionReport",
      type: "Event Closure",
      title: r.outcome || "Event completion report",
      amount: r.budgetUtilized ?? 0,
      requestedBy: "Coordinator",
      status: r.status === "Submitted" ? "Pending" : r.status,
    });
  }
  return items;
}

export function buildCategoryOptions(categories) {
  return categories.map((c, i) => ({
    id: c.id,
    name: categoryToUi(c.name),
    apiName: c.name,
    color: ["#1B5E3A", "#F2780C", "#5B8C5A", "#C2452D", "#8A6D3B", "#3C6E91"][i % 6],
  }));
}
