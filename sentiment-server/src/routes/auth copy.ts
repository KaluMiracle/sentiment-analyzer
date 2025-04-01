import { Router } from "express";
import { getAuthUrl, handleCallback } from "../controllers/auth";

const router = Router();

// Route to get the Facebook authentication URL
router.get("/", getAuthUrl);

// Route to handle the callback after authentication
router.post("/callback", handleCallback);

export default router;
