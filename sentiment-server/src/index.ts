import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import webhookRoutes from "./routes/webhook";
import path from "path";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("content-type", "application/json");
  next();
});

// Use routes
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/webhook", webhookRoutes);

// Serve React client
const clientBuildPath = path.join(__dirname, "../../sentiment-client/build");
app.use(express.static(clientBuildPath));

// Catch-all route to serve React app for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
