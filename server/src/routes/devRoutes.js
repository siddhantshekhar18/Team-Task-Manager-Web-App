import express from "express";
import env from "../config/env.js";
import asyncHandler from "../utils/asyncHandler.js";
import seedDemoData from "../utils/seedDemoData.js";

const router = express.Router();

router.post(
  "/seed",
  asyncHandler(async (req, res) => {
    if (env.nodeEnv === "production") {
      return res.status(403).json({ message: "Demo seed route is disabled in production" });
    }

    const seeded = await seedDemoData();

    res.json({
      message: "Demo data seeded successfully",
      ...seeded
    });
  })
);

export default router;
