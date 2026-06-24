import React, { useState, useMemo } from "react";
import {
  Home, CalendarDays, Award, User, Bell, ChevronLeft, MapPin, Clock,
  Users, IndianRupee, CheckCircle2, XCircle, PlusCircle, ClipboardList,
  PieChart as PieIcon, FileText, Download, Search, Filter, Sparkles,
  Camera, AlertTriangle, ShieldCheck, LogIn, ChevronRight, Star,
  TrendingUp, Building2, Leaf, UserPlus, Database, Pencil
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell, CartesianGrid
} from "recharts";

/* ---------------------------------------------------------------
   DESIGN TOKENS — Propel CSR App
   Primary green: #1B5E3A   Accent orange: #F2780C
   Bg: #F6F5F1   Surface: #FFFFFF   Ink: #1C2B22   Muted: #74807A
----------------------------------------------------------------*/
const COLORS = {
  primary: "#1B5E3A",
  primaryDark: "#123F27",
  primaryTint: "#E5F0E9",
  accent: "#F2780C",
  accentTint: "#FDE8D4",
  bg: "#F6F5F1",
  surface: "#FFFFFF",
  ink: "#1C2B22",
  muted: "#74807A",
  line: "#E6E4DC",
  danger: "#C2452D",
};

const CATS = [
  { name: "Education", color: "#1B5E3A" },
  { name: "Health & Hygiene", color: "#F2780C" },
  { name: "Environment", color: "#5B8C5A" },
  { name: "Sports Development", color: "#C2452D" },
  { name: "Skill Development", color: "#8A6D3B" },
  { name: "Community Development", color: "#3C6E91" },
];

const catColor = (name) => (CATS.find((c) => c.name === name) || CATS[0]).color;

/* ---------------------------------------------------------------
   MOCK DATA
----------------------------------------------------------------*/
const initialEvents = [
  {
    id: "EV-101",
    title: "Govt. School Library Setup — Sulur",
    category: "Education",
    date: "2026-07-04",
    time: "9:00 AM – 1:00 PM",
    location: "Govt. Higher Sec. School, Sulur",
    status: "Registration Open",
    volunteersNeeded: 15,
    confirmed: 9,
    beneficiaries: 220,
    budget: 85000,
    utilized: 0,
    coordinator: "Lakshmi Narayanan",
    objective:
      "Set up a functional library with 500 books, reading corner and shelving for students of Std 6–10.",
    applicants: [
      { name: "Vignesh S", dept: "Production", status: "Confirmed" },
      { name: "Priya M", dept: "Quality", status: "Confirmed" },
      { name: "Arun Kumar", dept: "SAP / IT", status: "Applied" },
      { name: "Divya R", dept: "Finance", status: "Waitlisted" },
    ],
  },
  {
    id: "EV-098",
    title: "Free Eye Screening Camp — Kangeyampalayam",
    category: "Health & Hygiene",
    date: "2026-06-28",
    time: "10:00 AM – 3:00 PM",
    location: "Community Hall, Kangeyampalayam",
    status: "Ongoing",
    volunteersNeeded: 12,
    confirmed: 12,
    beneficiaries: 310,
    budget: 120000,
    utilized: 64000,
    coordinator: "Suresh Babu R",
    objective:
      "Free eye screening, spectacles distribution and cataract referral for surrounding villages, in partnership with a panel hospital.",
    applicants: [
      { name: "Tharunya K", dept: "IT Helpdesk", status: "Attended" },
      { name: "Mani Kandan", dept: "Infrastructure", status: "Attended" },
    ],
  },
  {
    id: "EV-094",
    title: "Tree Plantation Drive — Trichy Road Corridor",
    category: "Environment",
    date: "2026-06-15",
    time: "7:00 AM – 10:00 AM",
    location: "Trichy Road Plant Premises",
    status: "Completed",
    volunteersNeeded: 25,
    confirmed: 25,
    beneficiaries: 0,
    budget: 45000,
    utilized: 41200,
    coordinator: "Om Prakash",
    objective:
      "Plant 500 native saplings along the plant boundary with a 1-year maintenance contract.",
    applicants: [],
  },
  {
    id: "EV-090",
    title: "Vocational Skills Workshop — Women Self-Help Groups",
    category: "Skill Development",
    date: "2026-06-08",
    time: "10:00 AM – 4:00 PM",
    location: "Panchayat Office, Sulur",
    status: "Closure Pending",
    volunteersNeeded: 8,
    confirmed: 8,
    beneficiaries: 60,
    budget: 65000,
    utilized: 58500,
    coordinator: "Balagurusamy R",
    objective:
      "3-day stitching & tailoring skill workshop for 60 women across 4 self-help groups, with machine donation.",
    applicants: [],
  },
  {
    id: "EV-085",
    title: "Annual Sports Meet for Govt. School Children",
    category: "Sports Development",
    date: "2026-05-20",
    time: "8:00 AM – 5:00 PM",
    location: "Propel Sports Ground",
    status: "Closed",
    volunteersNeeded: 20,
    confirmed: 20,
    beneficiaries: 480,
    budget: 95000,
    utilized: 91400,
    coordinator: "Satheshkumar",
    objective: "Inter-school sports day with track events, kits and refreshments for 480 students.",
    applicants: [],
  },
  {
    id: "EV-080",
    title: "Drinking Water Unit Installation — Rural School",
    category: "Community Development",
    date: "2026-07-18",
    time: "9:00 AM – 12:00 PM",
    location: "Panapalayam Govt. School",
    status: "Approved",
    volunteersNeeded: 10,
    confirmed: 0,
    beneficiaries: 150,
    budget: 110000,
    utilized: 0,
    coordinator: "Lakshmi Narayanan",
    objective: "RO water unit installation with 1-year AMC for a school with no safe drinking water.",
    applicants: [],
  },
];

const initialNeeds = [
  {
    id: "CN-22",
    title: "Damaged roof in Anganwadi centre, Veerapandi",
    category: "Community Development",
    location: "Veerapandi",
    beneficiaries: 45,
    urgency: "High",
    submittedBy: "Field visit — CSR Team",
    status: "Submitted",
  },
  {
    id: "CN-21",
    title: "Request for sports kits — Govt. Primary School",
    category: "Sports Development",
    location: "Sulur",
    beneficiaries: 90,
    urgency: "Medium",
    submittedBy: "Ganesan (Employee)",
    status: "Under Review",
  },
  {
    id: "CN-19",
    title: "Free medical camp request from local Panchayat",
    category: "Health & Hygiene",
    location: "Kangeyampalayam",
    beneficiaries: 300,
    urgency: "High",
    submittedBy: "Panchayat President Office",
    status: "Approved for Proposal",
  },
];

const initialApprovals = [
  { id: "AP-301", type: "CSR Proposal", title: "Drinking Water Unit Installation", amount: 110000, requestedBy: "Lakshmi Narayanan", status: "Pending" },
  { id: "AP-302", type: "Budget Allocation", title: "Eye Screening Camp — additional spectacles", amount: 18000, requestedBy: "Suresh Babu R", status: "Pending" },
  { id: "AP-303", type: "Event Closure", title: "Vocational Skills Workshop — closure & utilization", amount: 58500, requestedBy: "Balagurusamy R", status: "Pending" },
];

const initialEmployees = [
  { empId: "PI-01007", name: "Ganesan", mobile: "+91 98xxxxxx21", email: "ganesan@propelind.com", department: "IT", location: "Coimbatore", designation: "Head of IT (CIO)", manager: "Managing Director", isVolunteer: true },
  { empId: "PI-02114", name: "Tharunya K", mobile: "+91 98xxxxxx33", email: "tharunya.k@propelind.com", department: "IT Helpdesk", location: "Coimbatore", designation: "Helpdesk Executive", manager: "Ganesan", isVolunteer: true },
  { empId: "PI-02098", name: "Mani Kandan V", mobile: "+91 98xxxxxx44", email: "manikandan.v@propelind.com", department: "Infrastructure", location: "Coimbatore", designation: "Infra Lead", manager: "Ganesan", isVolunteer: true },
  { empId: "PI-01876", name: "Vignesh S", mobile: "+91 98xxxxxx55", email: "vignesh.s@propelind.com", department: "Production", location: "Sulur", designation: "Shift Engineer", manager: "Production Head", isVolunteer: true },
  { empId: "PI-01654", name: "Priya M", mobile: "+91 98xxxxxx66", email: "priya.m@propelind.com", department: "Quality", location: "Sulur", designation: "QA Engineer", manager: "Quality Head", isVolunteer: true },
  { empId: "PI-02201", name: "Arun Kumar", mobile: "+91 98xxxxxx77", email: "arun.kumar@propelind.com", department: "SAP / IT", location: "Coimbatore", designation: "SAP Consultant", manager: "Balagurusamy R", isVolunteer: false },
  { empId: "PI-01432", name: "Divya R", mobile: "+91 98xxxxxx88", email: "divya.r@propelind.com", department: "Finance", location: "Coimbatore", designation: "Finance Executive", manager: "Finance Head", isVolunteer: false },
  { empId: "PI-01290", name: "Suresh Babu R", mobile: "+91 98xxxxxx99", email: "sureshbabu.r@propelind.com", department: "Cybersecurity", location: "Coimbatore", designation: "Cybersecurity Lead", manager: "Ganesan", isVolunteer: false },
];

const budgetCategories = [
  { name: "Education", allocated: 1000000, utilized: 350000 },
  { name: "Health & Hygiene", allocated: 800000, utilized: 200000 },
  { name: "Environment", allocated: 500000, utilized: 125000 },
  { name: "Sports Development", allocated: 300000, utilized: 91400 },
  { name: "Skill Development", allocated: 400000, utilized: 58500 },
  { name: "Community Development", allocated: 350000, utilized: 0 },
];

const leaderboard = [
  { name: "Tharunya K", dept: "IT Helpdesk", hours: 38, events: 6 },
  { name: "Mani Kandan V", dept: "Infrastructure", hours: 34, events: 5 },
  { name: "Priya M", dept: "Quality", hours: 29, events: 5 },
  { name: "Vignesh S", dept: "Production", hours: 26, events: 4 },
  { name: "Ganesan", dept: "IT", hours: 22, events: 4 },
];

const initialNotifications = [
  { id: 1, text: "New event published: Govt. School Library Setup — Sulur", time: "2h ago", read: false },
  { id: 2, text: "Your registration for Eye Screening Camp is Confirmed", time: "1d ago", read: false },
  { id: 3, text: "Reminder: Tree Plantation Drive is tomorrow, 7:00 AM", time: "3d ago", read: true },
  { id: 4, text: "You earned the \"4 Events\" recognition badge", time: "5d ago", read: true },
];

const reports = [
  "CSR Activity Register",
  "Event-wise Volunteer Attendance",
  "Budget Allocation vs Utilization",
  "Volunteer Hours Report",
  "Beneficiary / Participant Report",
  "Annual CSR Summary",
];

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
----------------------------------------------------------------*/
function StatusPill({ status }) {
  const map = {
    "Registration Open": { bg: COLORS.primaryTint, fg: COLORS.primary },
    "Ongoing": { bg: COLORS.accentTint, fg: COLORS.accent },
    "Completed": { bg: "#EAF2EE", fg: "#3C6E91" },
    "Closure Pending": { bg: "#FBEAE5", fg: COLORS.danger },
    "Approved": { bg: COLORS.primaryTint, fg: COLORS.primary },
    "Closed": { bg: "#EEEEEC", fg: COLORS.muted },
    "Submitted": { bg: "#EEEEEC", fg: COLORS.muted },
    "Under Review": { bg: COLORS.accentTint, fg: COLORS.accent },
    "Approved for Proposal": { bg: COLORS.primaryTint, fg: COLORS.primary },
    "Pending": { bg: COLORS.accentTint, fg: COLORS.accent },
    "Confirmed": { bg: COLORS.primaryTint, fg: COLORS.primary },
    "Applied": { bg: "#EEEEEC", fg: COLORS.muted },
    "Waitlisted": { bg: COLORS.accentTint, fg: COLORS.accent },
    "Attended": { bg: COLORS.primaryTint, fg: COLORS.primary },
  };
  const s = map[status] || { bg: "#EEEEEC", fg: COLORS.muted };
  return (
    <span
      style={{ background: s.bg, color: s.fg }}
      className="text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
    >
      {status}
    </span>
  );
}

function CatTag({ name }) {
  return (
    <span
      style={{ background: catColor(name) + "1A", color: catColor(name) }}
      className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
    >
      {name}
    </span>
  );
}

function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}
      className={`rounded-2xl p-4 ${onClick ? "cursor-pointer active:scale-[0.99] transition" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <div className="px-5 pt-5 pb-3 flex items-start justify-between" style={{ background: COLORS.primary }}>
      <div className="flex items-start gap-2">
        {onBack && (
          <button onClick={onBack} className="text-white/90 mt-0.5">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <div className="text-white font-bold text-[17px] leading-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            {title}
          </div>
          {subtitle && <div className="text-white/70 text-[12px] mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

function PrimaryButton({ children, onClick, full, icon: Icon, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: disabled ? COLORS.line : COLORS.primary }}
      className={`text-white text-sm font-semibold rounded-xl py-2.5 px-4 flex items-center justify-center gap-1.5 active:scale-[0.98] transition ${full ? "w-full" : ""} ${disabled ? "text-[#999]" : ""}`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, full, icon: Icon, tone = "default" }) {
  const toneStyle = tone === "danger" ? { color: COLORS.danger, borderColor: "#F2D2C7" } : { color: COLORS.primary, borderColor: COLORS.primaryTint };
  return (
    <button
      onClick={onClick}
      style={{ ...toneStyle, background: COLORS.surface, borderWidth: 1.5 }}
      className={`text-sm font-semibold rounded-xl py-2.5 px-4 flex items-center justify-center gap-1.5 active:scale-[0.98] transition ${full ? "w-full" : ""}`}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

/* a quiet nod to the conveyor/production world: a thin moving belt stripe */
function BeltStripe() {
  return (
    <div className="h-[3px] w-full overflow-hidden" style={{ background: COLORS.primaryDark }}>
      <div
        className="h-full w-[200%]"
        style={{
          background: `repeating-linear-gradient(135deg, ${COLORS.accent} 0 14px, transparent 14px 28px)`,
          animation: "beltmove 2.4s linear infinite",
        }}
      />
      <style>{`@keyframes beltmove { from { transform: translateX(0); } to { transform: translateX(-28px); } }`}</style>
    </div>
  );
}

function RoleSwitcher({ role, setRole, roles, compact }) {
  return (
    <div
      className={`flex gap-1 p-1 rounded-full ${compact ? "mx-2 mt-1" : "mb-4"}`}
      style={{ background: "#EAE8E0" }}
    >
      {roles.map((r) => (
        <button
          key={r.key}
          onClick={() => setRole(r.key)}
          style={{
            background: role === r.key ? COLORS.primary : "transparent",
            color: role === r.key ? "white" : COLORS.ink,
          }}
          className={`font-semibold rounded-full transition flex-1 ${
            compact ? "text-[11px] px-2 py-1.5" : "text-[12px] px-4 py-1.5"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function BottomNav({ tabs, active, onChange }) {
  return (
    <div
      className="flex border-t pb-[env(safe-area-inset-bottom)]"
      style={{ borderColor: COLORS.line, background: COLORS.surface }}
    >
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5"
          >
            <t.icon size={19} color={isActive ? COLORS.primary : COLORS.muted} strokeWidth={isActive ? 2.4 : 2} />
            <span style={{ color: isActive ? COLORS.primary : COLORS.muted }} className="text-[10px] font-semibold">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------
   LOGIN
----------------------------------------------------------------*/
function LoginScreen({ onLogin }) {
  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.primary }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: COLORS.accent }}
        >
          <Leaf color="white" size={30} />
        </div>
        <div className="text-white font-bold text-2xl" style={{ fontFamily: "Sora, sans-serif" }}>
          Propel CSR
        </div>
        <div className="text-white/70 text-sm mt-1">Plan. Mobilize. Make an impact.</div>
      </div>
      <div className="bg-white rounded-t-[28px] px-6 py-8">
        <div className="text-[#1C2B22] font-bold text-lg mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
          Sign in
        </div>
        <div className="text-[#74807A] text-[13px] mb-5">Use your company email or mobile OTP</div>
        <div className="rounded-xl border px-3.5 py-3 mb-3 text-sm text-[#1C2B22]" style={{ borderColor: COLORS.line }}>
          ganesan@propelind.com
        </div>
        <div className="rounded-xl border px-3.5 py-3 mb-5 text-sm text-[#9aa39c]" style={{ borderColor: COLORS.line }}>
          •••••• (OTP)
        </div>
        <PrimaryButton full icon={LogIn} onClick={onLogin}>
          Continue
        </PrimaryButton>
        <div className="text-center text-[11px] text-[#9aa39c] mt-4">
          Prototype build · demo data only
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   VOLUNTEER PERSONA
----------------------------------------------------------------*/
function VolunteerApp({ events, setEvents, needs, setNeeds, notifications, setNotifications }) {
  const [tab, setTab] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const me = "Ganesan";
  const myRegs = events.filter((e) => e.applicants.some((a) => a.name === me));
  const totalHours = 22;
  const totalEvents = 4;
  const points = 480;
  const unread = notifications.filter((n) => !n.read).length;

  function register(eventId) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, applicants: [...e.applicants, { name: me, dept: "IT", status: "Applied" }], confirmed: e.confirmed }
          : e
      )
    );
  }
  function withdraw(eventId) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, applicants: e.applicants.filter((a) => a.name !== me) } : e
      )
    );
  }

  const filteredEvents = events.filter(
    (e) => catFilter === "All" || e.category === catFilter
  );

  function Header(title, sub) {
    return (
      <ScreenHeader
        title={title}
        subtitle={sub}
        right={
          <button onClick={() => setShowNotifs(true)} className="relative text-white/90">
            <Bell size={20} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center text-white"
                style={{ background: COLORS.accent }}
              >
                {unread}
              </span>
            )}
          </button>
        }
      />
    );
  }

  if (showNotifs) {
    return (
      <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
        <ScreenHeader title="Notifications" onBack={() => setShowNotifs(false)} />
        <BeltStripe />
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-60" : ""}>
              <div className="flex gap-2.5">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? COLORS.line : COLORS.accent }} />
                <div>
                  <div className="text-[13px] text-[#1C2B22] leading-snug">{n.text}</div>
                  <div className="text-[11px] text-[#9aa39c] mt-1">{n.time}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showNeedForm) {
    return <NeedForm onBack={() => setShowNeedForm(false)} onSubmit={(n) => { setNeeds((p) => [n, ...p]); setShowNeedForm(false); }} submittedBy={me} />;
  }

  if (selectedEvent) {
    const ev = events.find((e) => e.id === selectedEvent);
    const myStatus = ev.applicants.find((a) => a.name === me)?.status;
    const isFull = ev.applicants.length >= ev.volunteersNeeded && !myStatus;
    return (
      <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
        <ScreenHeader title={ev.title} subtitle={ev.id} onBack={() => setSelectedEvent(null)} />
        <BeltStripe />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex gap-2">
            <CatTag name={ev.category} />
            <StatusPill status={ev.status} />
          </div>
          <Card>
            <div className="space-y-2.5 text-[13px] text-[#1C2B22]">
              <div className="flex items-center gap-2"><CalendarDays size={15} color={COLORS.muted} /> {ev.date} · {ev.time}</div>
              <div className="flex items-center gap-2"><MapPin size={15} color={COLORS.muted} /> {ev.location}</div>
              <div className="flex items-center gap-2"><Users size={15} color={COLORS.muted} /> {ev.confirmed}/{ev.volunteersNeeded} volunteers confirmed</div>
              <div className="flex items-center gap-2"><Building2 size={15} color={COLORS.muted} /> Coordinator: {ev.coordinator}</div>
            </div>
          </Card>
          <Card>
            <div className="text-[12px] font-bold text-[#1C2B22] mb-1">Objective</div>
            <div className="text-[13px] text-[#586158] leading-relaxed">{ev.objective}</div>
          </Card>
          {myStatus && (
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: COLORS.primary }}>
              <CheckCircle2 size={16} /> Your status: {myStatus}
            </div>
          )}
        </div>
        <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
          {myStatus ? (
            <GhostButton full tone="danger" icon={XCircle} onClick={() => withdraw(ev.id)}>
              Withdraw registration
            </GhostButton>
          ) : (
            <PrimaryButton full icon={CheckCircle2} disabled={isFull} onClick={() => register(ev.id)}>
              {isFull ? "Registration full — join waitlist" : "Apply / Register"}
            </PrimaryButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      {tab === "home" && (
        <>
          {Header("Hi Ganesan 👋", "Head of IT · Coimbatore")}
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Hours", value: totalHours, icon: Clock },
                { label: "Events", value: totalEvents, icon: CalendarDays },
                { label: "Points", value: points, icon: Star },
              ].map((s) => (
                <Card key={s.label} className="text-center !p-3">
                  <s.icon size={16} color={COLORS.accent} className="mx-auto mb-1" />
                  <div className="font-bold text-[16px] text-[#1C2B22]">{s.value}</div>
                  <div className="text-[10px] text-[#74807A]">{s.label}</div>
                </Card>
              ))}
            </div>

            {myRegs[0] && (
              <Card onClick={() => setSelectedEvent(myRegs[0].id)}>
                <div className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.accent }}>
                  Your upcoming event
                </div>
                <div className="font-semibold text-[14px] text-[#1C2B22]">{myRegs[0].title}</div>
                <div className="text-[12px] text-[#74807A] mt-1">{myRegs[0].date} · {myRegs[0].location}</div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <GhostButton icon={CalendarDays} onClick={() => setTab("events")}>Browse events</GhostButton>
              <GhostButton icon={Sparkles} onClick={() => setShowNeedForm(true)}>Submit a need</GhostButton>
            </div>

            <div>
              <div className="font-bold text-[14px] text-[#1C2B22] mb-2">Open for registration</div>
              <div className="space-y-2.5">
                {events.filter((e) => e.status === "Registration Open").map((ev) => (
                  <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev.id)} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "events" && (
        <>
          {Header("CSR Events")}
          <BeltStripe />
          <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1">
            {["All", ...CATS.map((c) => c.name)].map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                style={{
                  background: catFilter === c ? COLORS.primary : COLORS.surface,
                  color: catFilter === c ? "white" : COLORS.ink,
                  borderColor: COLORS.line,
                }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev.id)} />
            ))}
          </div>
        </>
      )}

      {tab === "myevents" && (
        <>
          {Header("My Events")}
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {myRegs.length === 0 && (
              <div className="text-center text-[13px] text-[#9aa39c] mt-10">
                You haven't registered for any events yet.
              </div>
            )}
            {myRegs.map((ev) => {
              const st = ev.applicants.find((a) => a.name === me)?.status;
              return (
                <Card key={ev.id} onClick={() => setSelectedEvent(ev.id)}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CatTag name={ev.category} />
                      <div className="font-semibold text-[13px] text-[#1C2B22] mt-1.5">{ev.title}</div>
                      <div className="text-[11px] text-[#74807A] mt-1">{ev.date}</div>
                    </div>
                    <StatusPill status={st} />
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === "recognition" && (
        <>
          {Header("Recognition")}
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card className="text-center" style={{}}>
              <Award size={28} color={COLORS.accent} className="mx-auto mb-1" />
              <div className="font-bold text-[20px] text-[#1C2B22]">{points} pts</div>
              <div className="text-[11px] text-[#74807A]">CSR Champion progress: 480 / 600</div>
              <div className="h-2 rounded-full mt-2" style={{ background: COLORS.line }}>
                <div className="h-2 rounded-full" style={{ background: COLORS.accent, width: "80%" }} />
              </div>
            </Card>
            <div className="grid grid-cols-3 gap-2.5">
              {["4 Events", "20+ Hours", "Team Lead"].map((b) => (
                <Card key={b} className="text-center !p-3">
                  <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ background: COLORS.primaryTint }}>
                    <Award size={16} color={COLORS.primary} />
                  </div>
                  <div className="text-[10px] font-semibold text-[#1C2B22]">{b}</div>
                </Card>
              ))}
            </div>
            <div>
              <div className="font-bold text-[14px] text-[#1C2B22] mb-2">Top volunteers this quarter</div>
              <Card>
                {leaderboard.map((v, i) => (
                  <div key={v.name} className="flex items-center justify-between py-2" style={{ borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-semibold text-[#1C2B22]">{v.name}</div>
                        <div className="text-[10.5px] text-[#74807A]">{v.dept}</div>
                      </div>
                    </div>
                    <div className="text-[12px] font-bold" style={{ color: COLORS.accent }}>{v.hours}h</div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </>
      )}

      {tab === "profile" && (
        <>
          {Header("Profile")}
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <Card className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ background: COLORS.primary }}>G</div>
              <div>
                <div className="font-bold text-[14px] text-[#1C2B22]">Ganesan</div>
                <div className="text-[11.5px] text-[#74807A]">Head of IT (CIO) · Coimbatore</div>
              </div>
            </Card>
            {[
              ["Employee ID", "PI-01007"],
              ["Mobile", "+91 98xxxxxx21"],
              ["Email", "ganesan@propelind.com"],
              ["Reporting Manager", "Managing Director"],
              ["Preferred categories", "Education, Skill Development"],
              ["Availability", "Weekends"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[13px] py-1.5" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                <span className="text-[#74807A]">{k}</span>
                <span className="text-[#1C2B22] font-medium">{v}</span>
              </div>
            ))}
            <GhostButton full icon={Sparkles} onClick={() => setShowNeedForm(true)}>Submit a community need</GhostButton>
          </div>
        </>
      )}

      <BottomNav
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "home", label: "Home", icon: Home },
          { key: "events", label: "Events", icon: CalendarDays },
          { key: "myevents", label: "My Events", icon: ClipboardList },
          { key: "recognition", label: "Awards", icon: Award },
          { key: "profile", label: "Profile", icon: User },
        ]}
      />
    </div>
  );
}

function EventCard({ ev, onClick }) {
  return (
    <Card onClick={onClick}>
      <div className="flex justify-between items-start gap-2">
        <CatTag name={ev.category} />
        <StatusPill status={ev.status} />
      </div>
      <div className="font-semibold text-[13.5px] text-[#1C2B22] mt-2 leading-snug">{ev.title}</div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11.5px] text-[#74807A]">
        <span className="flex items-center gap-1"><CalendarDays size={12} /> {ev.date}</span>
        <span className="flex items-center gap-1"><MapPin size={12} /> {ev.location}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {ev.confirmed}/{ev.volunteersNeeded}</span>
      </div>
    </Card>
  );
}

function NeedForm({ onBack, onSubmit, submittedBy }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATS[0].name);
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center" style={{ background: COLORS.bg }}>
        <CheckCircle2 size={40} color={COLORS.primary} />
        <div className="font-bold text-[15px] text-[#1C2B22] mt-3">Need submitted</div>
        <div className="text-[12.5px] text-[#74807A] mt-1.5">
          The CSR team will review this and update its status. You'll be notified.
        </div>
        <PrimaryButton onClick={onBack} className="mt-5">Back to home</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      <ScreenHeader title="Submit a Community Need" onBack={onBack} />
      <BeltStripe />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Field label="Need title" value={title} onChange={setTitle} placeholder="e.g. Broken roof in Anganwadi centre" />
        <div>
          <FieldLabel>CSR category</FieldLabel>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-[13px]" style={{ borderColor: COLORS.line }}>
            {CATS.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
        <Field label="Location" value={location} onChange={setLocation} placeholder="Village / area" />
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Describe the need..." className="w-full rounded-xl border px-3 py-2.5 text-[13px]" style={{ borderColor: COLORS.line }} />
        </div>
        <Field label="Estimated beneficiaries" value={beneficiaries} onChange={setBeneficiaries} placeholder="e.g. 50" />
        <div>
          <FieldLabel>Urgency</FieldLabel>
          <div className="flex gap-2">
            {["Low", "Medium", "High"].map((u) => (
              <button key={u} onClick={() => setUrgency(u)} style={{ background: urgency === u ? COLORS.accent : COLORS.surface, color: urgency === u ? "white" : COLORS.ink, borderColor: COLORS.line }} className="flex-1 text-[12px] font-semibold py-2 rounded-xl border">
                {u}
              </button>
            ))}
          </div>
        </div>
        <GhostButton full icon={Camera}>Attach photos / documents</GhostButton>
      </div>
      <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
        <PrimaryButton
          full
          disabled={!title || !location}
          onClick={() =>
            onSubmit({
              id: "CN-" + Math.floor(Math.random() * 90 + 23),
              title, category, location, beneficiaries: beneficiaries || "—",
              urgency, submittedBy, status: "Submitted",
            })
          }
        >
          Submit need
        </PrimaryButton>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div className="text-[11.5px] font-semibold text-[#586158] mb-1">{children}</div>;
}
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border px-3 py-2.5 text-[13px]" style={{ borderColor: COLORS.line }} />
    </div>
  );
}

/* ---------------------------------------------------------------
   CSR TEAM / COORDINATOR PERSONA
----------------------------------------------------------------*/
function CsrTeamApp({ events, setEvents, needs, setNeeds, approvals, setApprovals, employees, setEmployees }) {
  const [tab, setTab] = useState("dashboard");
  const [openEvent, setOpenEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEmployeeMaster, setShowEmployeeMaster] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empSearch, setEmpSearch] = useState("");

  const pendingCount = approvals.filter((a) => a.status === "Pending").length;
  const totalAllocated = budgetCategories.reduce((s, c) => s + c.allocated, 0);
  const totalUtilized = budgetCategories.reduce((s, c) => s + c.utilized, 0);

  function setApplicantStatus(eventId, name, status) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, applicants: e.applicants.map((a) => (a.name === name ? { ...a, status } : a)), confirmed: status === "Confirmed" ? e.confirmed + 1 : e.confirmed }
          : e
      )
    );
  }
  function setNeedStatus(id, status) {
    setNeeds((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)));
  }

  if (showCreate) {
    return <CreateEventForm onBack={() => setShowCreate(false)} onCreate={(ev) => { setEvents((p) => [ev, ...p]); setShowCreate(false); }} />;
  }

  if (showAddEmployee) {
    return (
      <AddEmployeeForm
        onBack={() => setShowAddEmployee(false)}
        onSave={(emp) => { setEmployees((p) => [emp, ...p]); setShowAddEmployee(false); }}
      />
    );
  }

  if (showEmployeeMaster) {
    const filtered = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.empId.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.department.toLowerCase().includes(empSearch.toLowerCase())
    );
    return (
      <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
        <ScreenHeader
          title="Employee Master"
          subtitle={`${employees.length} enrolled · master data store`}
          onBack={() => setShowEmployeeMaster(false)}
          right={
            <button onClick={() => setShowAddEmployee(true)} className="text-white"><UserPlus size={20} /></button>
          }
        />
        <BeltStripe />
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: COLORS.line, background: COLORS.surface }}>
            <Search size={14} color={COLORS.muted} />
            <input
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              placeholder="Search by name, ID or department"
              className="w-full text-[12.5px] outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-3 space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center text-[12.5px] text-[#9aa39c] mt-8">No matching employees.</div>
          )}
          {filtered.map((e) => (
            <Card key={e.empId}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-[13px] text-[#1C2B22]">{e.name}</div>
                  <div className="text-[11px] text-[#74807A] mt-0.5">{e.empId} · {e.designation}</div>
                  <div className="text-[11px] text-[#74807A]">{e.department} · {e.location}</div>
                </div>
                {e.isVolunteer ? (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>Volunteer</span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "#EEEEEC", color: COLORS.muted }}>Not enrolled</span>
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
          <PrimaryButton full icon={UserPlus} onClick={() => setShowAddEmployee(true)}>
            Enroll new employee
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (openEvent) {
    const ev = events.find((e) => e.id === openEvent);
    return (
      <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
        <ScreenHeader title={ev.title} subtitle={`${ev.id} · ${ev.status}`} onBack={() => setOpenEvent(null)} />
        <BeltStripe />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <Card>
            <div className="grid grid-cols-2 gap-2 text-[12px] text-[#1C2B22]">
              <div><span className="text-[#74807A]">Budget</span><div className="font-bold">₹{ev.budget.toLocaleString("en-IN")}</div></div>
              <div><span className="text-[#74807A]">Utilized</span><div className="font-bold">₹{ev.utilized.toLocaleString("en-IN")}</div></div>
              <div><span className="text-[#74807A]">Beneficiaries</span><div className="font-bold">{ev.beneficiaries}</div></div>
              <div><span className="text-[#74807A]">Volunteers</span><div className="font-bold">{ev.confirmed}/{ev.volunteersNeeded}</div></div>
            </div>
          </Card>
          <div className="font-bold text-[13px] text-[#1C2B22]">Volunteer applications</div>
          {ev.applicants.length === 0 && <div className="text-[12.5px] text-[#9aa39c]">No applications yet.</div>}
          {ev.applicants.map((a) => (
            <Card key={a.name}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#1C2B22]">{a.name}</div>
                  <div className="text-[11px] text-[#74807A]">{a.dept}</div>
                </div>
                <StatusPill status={a.status} />
              </div>
              {a.status === "Applied" && (
                <div className="flex gap-2 mt-2.5">
                  <GhostButton onClick={() => setApplicantStatus(ev.id, a.name, "Confirmed")}>Confirm</GhostButton>
                  <GhostButton tone="danger" onClick={() => setApplicantStatus(ev.id, a.name, "Waitlisted")}>Waitlist</GhostButton>
                </div>
              )}
            </Card>
          ))}
          <GhostButton full icon={FileText}>Submit completion report</GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      {tab === "dashboard" && (
        <>
          <ScreenHeader title="CSR Team Dashboard" subtitle="Lakshmi Narayanan · CSR Admin" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Events ongoing" value={events.filter((e) => ["Ongoing", "Registration Open"].includes(e.status)).length} icon={CalendarDays} />
              <Stat label="Pending approvals" value={pendingCount} icon={AlertTriangle} accent />
              <Stat label="Budget utilized" value={`${Math.round((totalUtilized / totalAllocated) * 100)}%`} icon={IndianRupee} />
              <Stat label="Enrolled volunteers" value={employees.filter((e) => e.isVolunteer).length} icon={Users} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <GhostButton icon={Database} onClick={() => setShowEmployeeMaster(true)}>Employee master</GhostButton>
              <GhostButton icon={PlusCircle} onClick={() => setShowCreate(true)}>New event</GhostButton>
            </div>
            <div>
              <div className="font-bold text-[14px] text-[#1C2B22] mb-2">Needs review</div>
              {needs.slice(0, 2).map((n) => (
                <Card key={n.id} className="mb-2">
                  <div className="flex justify-between gap-2">
                    <div className="text-[12.5px] font-semibold text-[#1C2B22]">{n.title}</div>
                    <StatusPill status={n.status} />
                  </div>
                </Card>
              ))}
              <GhostButton full onClick={() => setTab("needs")}>View all needs</GhostButton>
            </div>
          </div>
        </>
      )}

      {tab === "events" && (
        <>
          <ScreenHeader title="Manage Events" right={
            <button onClick={() => setShowCreate(true)} className="text-white"><PlusCircle size={20} /></button>
          } />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {events.map((ev) => (
              <Card key={ev.id} onClick={() => setOpenEvent(ev.id)}>
                <div className="flex justify-between items-start gap-2">
                  <CatTag name={ev.category} />
                  <StatusPill status={ev.status} />
                </div>
                <div className="font-semibold text-[13.5px] text-[#1C2B22] mt-2">{ev.title}</div>
                <div className="text-[11px] text-[#74807A] mt-1">{ev.date} · {ev.applicants.length} applications</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "needs" && (
        <>
          <ScreenHeader title="Community Needs" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {needs.map((n) => (
              <Card key={n.id}>
                <div className="flex justify-between items-start gap-2">
                  <CatTag name={n.category} />
                  <StatusPill status={n.status} />
                </div>
                <div className="font-semibold text-[13px] text-[#1C2B22] mt-2">{n.title}</div>
                <div className="text-[11px] text-[#74807A] mt-1">{n.location} · {n.beneficiaries} beneficiaries · {n.urgency} urgency</div>
                <div className="text-[10.5px] text-[#9aa39c] mt-1">Submitted by {n.submittedBy}</div>
                {n.status === "Submitted" && (
                  <div className="flex gap-2 mt-2.5">
                    <GhostButton onClick={() => setNeedStatus(n.id, "Under Review")}>Mark under review</GhostButton>
                  </div>
                )}
                {n.status === "Under Review" && (
                  <div className="flex gap-2 mt-2.5">
                    <GhostButton onClick={() => setNeedStatus(n.id, "Approved for Proposal")}>Approve for proposal</GhostButton>
                    <GhostButton tone="danger" onClick={() => setNeedStatus(n.id, "Rejected")}>Reject</GhostButton>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "budget" && (
        <>
          <ScreenHeader title="Budget Tracker" subtitle="FY 2026-27" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {budgetCategories.map((c) => {
              const pct = Math.round((c.utilized / c.allocated) * 100);
              return (
                <Card key={c.name}>
                  <div className="flex justify-between items-center">
                    <div className="text-[13px] font-semibold text-[#1C2B22]">{c.name}</div>
                    <div className="text-[11px] font-bold" style={{ color: catColor(c.name) }}>{pct}%</div>
                  </div>
                  <div className="h-1.5 rounded-full mt-2 mb-1.5" style={{ background: COLORS.line }}>
                    <div className="h-1.5 rounded-full" style={{ background: catColor(c.name), width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#74807A]">
                    <span>Utilized ₹{(c.utilized / 1000).toFixed(0)}K</span>
                    <span>Allocated ₹{(c.allocated / 1000).toFixed(0)}K</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === "approvals" && (
        <>
          <ScreenHeader title="Approvals Queue" subtitle="Pending CSR team review" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {approvals.map((a) => (
              <Card key={a.id}>
                <div className="flex justify-between items-start gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.accent }}>{a.type}</div>
                  <StatusPill status={a.status} />
                </div>
                <div className="font-semibold text-[13px] text-[#1C2B22] mt-1.5">{a.title}</div>
                <div className="text-[11px] text-[#74807A] mt-1">₹{a.amount.toLocaleString("en-IN")} · Requested by {a.requestedBy}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      <BottomNav
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "dashboard", label: "Dashboard", icon: Home },
          { key: "events", label: "Events", icon: CalendarDays },
          { key: "needs", label: "Needs", icon: ClipboardList },
          { key: "budget", label: "Budget", icon: IndianRupee },
          { key: "approvals", label: "Approvals", icon: ShieldCheck },
        ]}
      />
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }) {
  return (
    <Card className="!p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[#74807A]">{label}</div>
        <Icon size={14} color={accent ? COLORS.accent : COLORS.primary} />
      </div>
      <div className="font-bold text-[19px] text-[#1C2B22] mt-1">{value}</div>
    </Card>
  );
}

function CreateEventForm({ onBack, onCreate }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATS[0].name);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("10");
  const [budget, setBudget] = useState("");
  const [objective, setObjective] = useState("");

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      <ScreenHeader title="New CSR Event / Proposal" onBack={onBack} />
      <BeltStripe />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Field label="Event title" value={title} onChange={setTitle} placeholder="e.g. Blood donation camp" />
        <div>
          <FieldLabel>CSR category</FieldLabel>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-[13px]" style={{ borderColor: COLORS.line }}>
            {CATS.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
        <Field label="Location" value={location} onChange={setLocation} placeholder="Venue / area" />
        <Field label="Planned date" value={date} onChange={setDate} placeholder="YYYY-MM-DD" />
        <Field label="Volunteers needed" value={volunteersNeeded} onChange={setVolunteersNeeded} placeholder="10" />
        <Field label="Estimated budget (₹)" value={budget} onChange={setBudget} placeholder="50000" />
        <div>
          <FieldLabel>Objective</FieldLabel>
          <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} className="w-full rounded-xl border px-3 py-2.5 text-[13px]" style={{ borderColor: COLORS.line }} />
        </div>
      </div>
      <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
        <PrimaryButton
          full
          disabled={!title || !location}
          onClick={() =>
            onCreate({
              id: "EV-" + Math.floor(Math.random() * 900 + 100),
              title, category, location, date: date || "TBD", time: "TBD",
              status: "Submitted for Approval",
              volunteersNeeded: Number(volunteersNeeded) || 10,
              confirmed: 0, beneficiaries: 0,
              budget: Number(budget) || 0, utilized: 0,
              coordinator: "Lakshmi Narayanan", objective: objective || "—",
              applicants: [],
            })
          }
        >
          Submit for approval
        </PrimaryButton>
      </div>
    </div>
  );
}

function AddEmployeeForm({ onBack, onSave }) {
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("Coimbatore");
  const [designation, setDesignation] = useState("");
  const [manager, setManager] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(true);

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      <ScreenHeader title="Enroll Employee" subtitle="Master data entry" onBack={onBack} />
      <BeltStripe />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Field label="Employee ID" value={empId} onChange={setEmpId} placeholder="e.g. PI-02345" />
        <Field label="Employee name" value={name} onChange={setName} placeholder="Full name" />
        <Field label="Mobile number" value={mobile} onChange={setMobile} placeholder="+91 ..." />
        <Field label="Email ID" value={email} onChange={setEmail} placeholder="name@propelind.com" />
        <Field label="Department" value={department} onChange={setDepartment} placeholder="e.g. Production, IT, Finance" />
        <Field label="Location" value={location} onChange={setLocation} placeholder="Coimbatore / Sulur / Unit" />
        <Field label="Designation" value={designation} onChange={setDesignation} placeholder="Job title" />
        <Field label="Reporting manager" value={manager} onChange={setManager} placeholder="Manager name" />
        <div>
          <FieldLabel>Enroll as CSR volunteer</FieldLabel>
          <div className="flex gap-2">
            {[{ v: true, l: "Yes" }, { v: false, l: "Not now" }].map((o) => (
              <button
                key={o.l}
                onClick={() => setIsVolunteer(o.v)}
                style={{
                  background: isVolunteer === o.v ? COLORS.primary : COLORS.surface,
                  color: isVolunteer === o.v ? "white" : COLORS.ink,
                  borderColor: COLORS.line,
                }}
                className="flex-1 text-[12px] font-semibold py-2 rounded-xl border"
              >
                {o.l}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-[#9aa39c] mt-1.5">
            This adds the employee to the master data store. They can still opt in/out of volunteering later from their profile.
          </div>
        </div>
      </div>
      <div className="p-4 border-t" style={{ borderColor: COLORS.line }}>
        <PrimaryButton
          full
          icon={CheckCircle2}
          disabled={!empId || !name || !department}
          onClick={() =>
            onSave({
              empId, name, mobile: mobile || "—", email: email || "—",
              department, location, designation: designation || "—",
              manager: manager || "—", isVolunteer,
            })
          }
        >
          Save to employee master
        </PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   MANAGEMENT PERSONA
----------------------------------------------------------------*/
function ManagementApp({ approvals, setApprovals, events }) {
  const [tab, setTab] = useState("dashboard");

  const totalAllocated = budgetCategories.reduce((s, c) => s + c.allocated, 0);
  const totalUtilized = budgetCategories.reduce((s, c) => s + c.utilized, 0);
  const pending = approvals.filter((a) => a.status === "Pending");

  const activityByCat = useMemo(() => {
    const m = {};
    events.forEach((e) => { m[e.category] = (m[e.category] || 0) + 1; });
    return CATS.map((c) => ({ name: c.name, value: m[c.name] || 0, color: c.color })).filter((d) => d.value > 0);
  }, [events]);

  function decide(id, status) {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <div className="h-full flex flex-col" style={{ background: COLORS.bg }}>
      {tab === "dashboard" && (
        <>
          <ScreenHeader title="Executive Dashboard" subtitle="CSR · FY 2026-27" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Total CSR budget" value={`₹${(totalAllocated / 100000).toFixed(1)}L`} icon={IndianRupee} />
              <Stat label="Utilized" value={`${Math.round((totalUtilized / totalAllocated) * 100)}%`} icon={TrendingUp} accent />
              <Stat label="Activities (FY)" value={events.length} icon={CalendarDays} />
              <Stat label="Pending approvals" value={pending.length} icon={AlertTriangle} accent />
            </div>

            <Card>
              <div className="font-bold text-[13px] text-[#1C2B22] mb-2">Budget: allocated vs utilized (₹L)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={budgetCategories.map((c) => ({ name: c.name.split(" ")[0], allocated: c.allocated / 100000, utilized: c.utilized / 100000 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="allocated" fill={COLORS.primaryTint} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilized" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <div className="font-bold text-[13px] text-[#1C2B22] mb-2">Activities by category</div>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={activityByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={34}>
                    {activityByCat.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {activityByCat.map((d) => (
                  <div key={d.name} className="flex items-center gap-1 text-[10px] text-[#74807A]">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "approvals" && (
        <>
          <ScreenHeader title="Pending Approvals" subtitle={`${pending.length} awaiting your decision`} />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {approvals.map((a) => (
              <Card key={a.id}>
                <div className="flex justify-between items-start gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.accent }}>{a.type}</div>
                  <StatusPill status={a.status} />
                </div>
                <div className="font-semibold text-[13px] text-[#1C2B22] mt-1.5">{a.title}</div>
                <div className="text-[11px] text-[#74807A] mt-1">₹{a.amount.toLocaleString("en-IN")} · Requested by {a.requestedBy}</div>
                {a.status === "Pending" && (
                  <div className="flex gap-2 mt-2.5">
                    <PrimaryButton onClick={() => decide(a.id, "Approved")} icon={CheckCircle2}>Approve</PrimaryButton>
                    <GhostButton tone="danger" onClick={() => decide(a.id, "Rejected")} icon={XCircle}>Reject</GhostButton>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "reports" && (
        <>
          <ScreenHeader title="Reports" subtitle="Export as Excel / PDF" />
          <BeltStripe />
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {reports.map((r) => (
              <Card key={r} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} color={COLORS.primary} />
                  <div className="text-[12.5px] font-semibold text-[#1C2B22]">{r}</div>
                </div>
                <Download size={16} color={COLORS.muted} />
              </Card>
            ))}
          </div>
        </>
      )}

      <BottomNav
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "dashboard", label: "Dashboard", icon: PieIcon },
          { key: "approvals", label: "Approvals", icon: ShieldCheck },
          { key: "reports", label: "Reports", icon: FileText },
        ]}
      />
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("volunteer");
  const [events, setEvents] = useState(initialEvents);
  const [needs, setNeeds] = useState(initialNeeds);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [employees, setEmployees] = useState(initialEmployees);
  const [notifications] = useState(initialNotifications);

  const roles = [
    { key: "volunteer", label: "Volunteer" },
    { key: "csrteam", label: "CSR Team" },
    { key: "management", label: "Management" },
  ];

  const screen = !loggedIn ? (
    <LoginScreen onLogin={() => setLoggedIn(true)} />
  ) : role === "volunteer" ? (
    <VolunteerApp events={events} setEvents={setEvents} needs={needs} setNeeds={setNeeds} notifications={notifications} setNotifications={() => {}} />
  ) : role === "csrteam" ? (
    <CsrTeamApp events={events} setEvents={setEvents} needs={needs} setNeeds={setNeeds} approvals={approvals} setApprovals={setApprovals} employees={employees} setEmployees={setEmployees} />
  ) : (
    <ManagementApp approvals={approvals} setApprovals={setApprovals} events={events} />
  );

  return (
    <div
      className="w-full h-dvh md:h-auto md:min-h-screen flex flex-col md:items-center md:py-6 md:px-3 overflow-hidden md:overflow-visible"
      style={{ background: COLORS.bg, fontFamily: "Inter, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div className="hidden md:block text-center mb-4">
        <div className="font-extrabold text-[15px] tracking-tight" style={{ color: COLORS.ink, fontFamily: "Sora, sans-serif" }}>
          Propel CSR App — Clickable Prototype
        </div>
        <div className="text-[11.5px] mt-0.5" style={{ color: COLORS.muted }}>
          Switch roles below to walk through each persona's experience
        </div>
      </div>

      <div className="hidden md:block">
        {loggedIn && <RoleSwitcher role={role} setRole={setRole} roles={roles} />}
      </div>

      {loggedIn && (
        <div
          className="md:hidden flex-shrink-0 z-20 pt-[env(safe-area-inset-top)]"
          style={{ background: COLORS.bg }}
        >
          <RoleSwitcher role={role} setRole={setRole} roles={roles} compact />
          <div className="text-center text-[10px] pb-1.5 px-3" style={{ color: COLORS.muted }}>
            Demo data · refreshes reset state
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex flex-col md:flex-none md:relative md:rounded-[34px] md:p-2.5 md:shadow-2xl md:w-[380px] md:bg-[#0E1410]">
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full z-10 bg-[#0E1410]" />
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:rounded-[26px] md:h-[760px] md:flex-none" style={{ background: COLORS.bg }}>
          {screen}
        </div>
      </div>

      <div className="hidden md:block text-[10.5px] mt-4 text-center max-w-xs" style={{ color: COLORS.muted }}>
        Phase 1 / MVP demo · data shown is illustrative, not live data
      </div>
    </div>
  );
}
