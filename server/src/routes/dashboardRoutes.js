import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  asyncHandler(async (req, res) => {
    let projectFilter = {};

    if (req.user.role !== "admin") {
      projectFilter = { members: req.user._id };
    }

    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map((project) => project._id);

    const taskFilter = req.user.role === "admin" ? {} : { project: { $in: projectIds } };

    const tasks = await Task.find(taskFilter).select("status dueDate assignee");

    const now = new Date();
    const statusCounts = {
      todo: 0,
      "in-progress": 0,
      done: 0
    };

    let overdue = 0;
    let myOpenTasks = 0;

    tasks.forEach((task) => {
      statusCounts[task.status] += 1;

      if (task.dueDate < now && task.status !== "done") {
        overdue += 1;
      }

      if (task.assignee.toString() === req.user._id.toString() && task.status !== "done") {
        myOpenTasks += 1;
      }
    });

    res.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      statusCounts,
      overdue,
      myOpenTasks
    });
  })
);

export default router;
