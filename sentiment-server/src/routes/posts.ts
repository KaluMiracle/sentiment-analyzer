import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getPosts } from "../controllers/posts";

const router = Router();

router.get("/", getPosts);

export default router;
