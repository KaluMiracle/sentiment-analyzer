import { Router } from "express";
import { getAllComments, getComments } from "../controllers/comments";

const router = Router();

router.get("/", getComments);
router.get("/all", getAllComments);

export default router;
