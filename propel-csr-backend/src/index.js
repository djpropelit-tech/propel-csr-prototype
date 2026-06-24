import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import eventsRouter from "./routes/events.js";
import volunteersRouter from "./routes/volunteers.js";
import needsRouter from "./routes/needs.js";
import budgetRouter from "./routes/budget.js";
import approvalsRouter from "./routes/approvals.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "propel-csr-backend" }));

// Mirrors the BRD's functional modules — Section 6
app.use("/api/events", eventsRouter);          // 6.3, 6.4, 6.5 — proposals, publishing, attendance
app.use("/api/volunteers", volunteersRouter);   // 6.1 — registration & profile
app.use("/api/needs", needsRouter);             // 6.2 — community need registration
app.use("/api/budget", budgetRouter);           // 6.7 — allocation & utilization
app.use("/api/approvals", approvalsRouter);     // 6.8 — approval workflow

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Propel CSR backend running on :${PORT}`));
