import { apiFetch } from "./client.js";
import {
  mapEvent,
  mapNeed,
  mapEmployee,
  mapBudgetCategory,
  mapLeaderboardEntry,
  mapPendingApprovals,
  needStatusToApi,
  regStatusToApi,
} from "./mappers.js";

export async function fetchEvents() {
  const data = await apiFetch("/api/events");
  return data.map(mapEvent);
}

export async function fetchNeeds() {
  const data = await apiFetch("/api/needs");
  return data.map(mapNeed);
}

export async function fetchEmployees() {
  const data = await apiFetch("/api/volunteers");
  return data.map(mapEmployee);
}

export async function fetchRawCategories() {
  return apiFetch("/api/budget/categories");
}

export async function fetchBudgetCategories() {
  const data = await apiFetch("/api/budget/categories");
  return data.map(mapBudgetCategory);
}

export async function fetchApprovals() {
  const data = await apiFetch("/api/approvals/pending");
  return mapPendingApprovals(data);
}

export async function fetchLeaderboard() {
  const data = await apiFetch("/api/volunteers/leaderboard");
  return data.map(mapLeaderboardEntry);
}

export async function registerForEvent(eventId, volunteerId) {
  await apiFetch(`/api/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify({ volunteerId }),
  });
}

export async function updateRegistration(eventId, regId, status) {
  await apiFetch(`/api/events/${eventId}/registrations/${regId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: regStatusToApi(status) }),
  });
}

export async function createNeed(payload) {
  const data = await apiFetch("/api/needs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapNeed(data);
}

export async function updateNeedStatus(id, status) {
  const data = await apiFetch(`/api/needs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: needStatusToApi(status) }),
  });
  return mapNeed(data);
}

export async function createEvent(payload) {
  const data = await apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapEvent(data);
}

export async function createEmployee(payload) {
  const data = await apiFetch("/api/volunteers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapEmployee(data);
}

export async function updateBudgetRequestStatus(id, status) {
  await apiFetch(`/api/budget/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function recordApproval(payload) {
  await apiFetch("/api/approvals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
