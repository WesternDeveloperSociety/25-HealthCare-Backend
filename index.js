// Load env variables
import dotenv from "dotenv";
dotenv.config();

// Import dependencies
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// Initialize app + database
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// ------------------------------
// ROUTE 1: Health Check
// ------------------------------
app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

// ------------------------------
// ROUTE 2: Sync User (Clerk → Database)
// ------------------------------
app.post("/sync-user", async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;
    console.log("Syncing user:", { clerkId, email, name }); 
    if (!clerkId) {
      return res.status(400).json({ error: "Missing clerkId" });
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // If not found → create user
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          name,
        },
      });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Sync user error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------
// START SERVER
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
