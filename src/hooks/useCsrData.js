import { useState, useCallback } from "react";
import * as api from "../api/csrApi.js";
import { buildCategoryOptions } from "../api/mappers.js";

const CURRENT_USER_EMAIL = "ganesan@propelind.com";

const initialNotifications = [
  { id: 1, text: "New event published: Govt. School Library Setup — Sulur", time: "2h ago", read: false },
  { id: 2, text: "Your registration for Eye Screening Camp is Confirmed", time: "1d ago", read: false },
  { id: 3, text: "Reminder: Tree Plantation Drive is tomorrow, 7:00 AM", time: "3d ago", read: true },
  { id: 4, text: "You earned the \"4 Events\" recognition badge", time: "5d ago", read: true },
];

export function useCsrData() {
  const [events, setEvents] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications] = useState(initialNotifications);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ev, nd, em, ap, bg, lb, rawCats] = await Promise.all([
        api.fetchEvents(),
        api.fetchNeeds(),
        api.fetchEmployees(),
        api.fetchApprovals(),
        api.fetchBudgetCategories(),
        api.fetchLeaderboard(),
        api.fetchRawCategories(),
      ]);
      setEvents(ev);
      setNeeds(nd);
      setEmployees(em);
      setApprovals(ap);
      setBudgetCategories(bg);
      setLeaderboard(lb);
      setCategoryOptions(buildCategoryOptions(rawCats));
      const me = em.find((e) => e.email === CURRENT_USER_EMAIL) || em[0] || null;
      setCurrentUser(me);
    } catch (err) {
      setError(err.message || "Failed to load data from API");
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadEvents = useCallback(async () => {
    setEvents(await api.fetchEvents());
  }, []);

  const reloadNeeds = useCallback(async () => {
    setNeeds(await api.fetchNeeds());
  }, []);

  const reloadEmployees = useCallback(async () => {
    setEmployees(await api.fetchEmployees());
  }, []);

  const reloadApprovals = useCallback(async () => {
    setApprovals(await api.fetchApprovals());
  }, []);

  const handleRegister = useCallback(async (eventId) => {
    if (!currentUser?.volunteerProfileId) throw new Error("Current user is not enrolled as a volunteer");
    await api.registerForEvent(eventId, currentUser.volunteerProfileId);
    await reloadEvents();
  }, [currentUser, reloadEvents]);

  const handleWithdraw = useCallback(async (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    const me = ev?.applicants.find((a) => a.name === currentUser?.name);
    if (!me?.regId) throw new Error("Registration not found");
    await api.updateRegistration(eventId, me.regId, "Withdrawn");
    await reloadEvents();
  }, [events, currentUser, reloadEvents]);

  const handleSubmitNeed = useCallback(async (form, categories) => {
    const cat = categories.find((c) => c.name === form.category);
    if (!cat) throw new Error("Invalid category");
    await api.createNeed({
      title: form.title,
      description: form.description || form.title,
      categoryId: cat.id,
      location: form.location,
      estBeneficiaries: Number(form.beneficiaries) || 0,
      urgency: (form.urgency || "Medium").toUpperCase(),
      submittedBy: form.submittedBy,
    });
    await reloadNeeds();
  }, [reloadNeeds]);

  const handleNeedStatus = useCallback(async (id, status) => {
    await api.updateNeedStatus(id, status);
    await reloadNeeds();
    await reloadApprovals();
  }, [reloadNeeds, reloadApprovals]);

  const handleApplicantStatus = useCallback(async (eventId, regId, status) => {
    await api.updateRegistration(eventId, regId, status);
    await reloadEvents();
  }, [reloadEvents]);

  const handleCreateEvent = useCallback(async (form, categories, coordinatorId) => {
    const cat = categories.find((c) => c.name === form.category);
    if (!cat || !coordinatorId) throw new Error("Missing category or coordinator");
    await api.createEvent({
      title: form.title,
      categoryId: cat.id,
      location: form.location,
      date: form.date || new Date().toISOString().slice(0, 10),
      time: form.time || "TBD",
      objective: form.objective || "—",
      volunteersNeeded: Number(form.volunteersNeeded) || 10,
      expectedBeneficiaries: 0,
      coordinatorId,
    });
    await reloadEvents();
    await reloadApprovals();
  }, [reloadEvents, reloadApprovals]);

  const handleAddEmployee = useCallback(async (form) => {
    await api.createEmployee({
      empId: form.empId,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      department: form.department,
      location: form.location,
      designation: form.designation,
      reportingManager: form.manager,
      enrollAsVolunteer: form.isVolunteer,
    });
    await reloadEmployees();
  }, [reloadEmployees]);

  const handleApprovalDecision = useCallback(async (item, decision, approverId) => {
    const action = decision === "Approved" ? "Approve" : "Reject";
    await api.recordApproval({
      entityType: item.entityType,
      entityId: item.id,
      approverId,
      action,
      previousStatus: "Pending",
      newStatus: decision,
      comments: "",
    });
    if (item.entityType === "CommunityNeed") {
      await api.updateNeedStatus(item.id, decision === "Approved" ? "Approved for Proposal" : "Rejected");
    } else if (item.entityType === "BudgetRequest") {
      await api.updateBudgetRequestStatus(item.id, decision === "Approved" ? "APPROVED" : "REJECTED");
    }
    await reloadApprovals();
    await reloadNeeds();
    await reloadEvents();
  }, [reloadApprovals, reloadNeeds, reloadEvents]);

  return {
    events,
    needs,
    approvals,
    employees,
    budgetCategories,
    leaderboard,
    categoryOptions,
    currentUser,
    notifications,
    loading,
    error,
    loadAll,
    handleRegister,
    handleWithdraw,
    handleSubmitNeed,
    handleNeedStatus,
    handleApplicantStatus,
    handleCreateEvent,
    handleAddEmployee,
    handleApprovalDecision,
  };
}
