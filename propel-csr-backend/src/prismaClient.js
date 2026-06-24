import { PrismaClient } from "@prisma/client";

// Reuse a single client across the app (avoids exhausting DB connections in dev)
export const prisma = new PrismaClient();
