import express from "express";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json({ users });
  })
);

export default router;
