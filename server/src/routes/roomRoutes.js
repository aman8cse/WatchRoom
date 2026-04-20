import express from "express";
import { createRoom, getRoom, checkRoom } from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createRoom);
router.get("/:code", protect, getRoom);
router.get("/:code/exists", protect, checkRoom);

export default router;