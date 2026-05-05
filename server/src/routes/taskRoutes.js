import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { authenticate } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema
} from "../validators/taskSchemas.js";

const router = express.Router();

const canAccessProject = (project, userId, role) => {
  if (role === "admin") return true;
  return project.members.some((memberId) => memberId.toString() === userId.toString());
};

router.get(
  "/",
  authenticate,
  validateRequest(taskQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { projectId, status, assignedToMe } = req.query;

    const query = {};
    let allowedProjectIds = null;

    if (req.user.role !== "admin") {
      const memberProjects = await Project.find({ members: req.user._id }).select("_id");
      allowedProjectIds = memberProjects.map((project) => project._id.toString());
      query.project = { $in: allowedProjectIds };
    }

    if (projectId) {
      if (req.user.role === "admin") {
        query.project = projectId;
      } else if (allowedProjectIds?.includes(projectId)) {
        query.project = projectId;
      } else {
        return res.json({ tasks: [] });
      }
    }

    if (status) {
      query.status = status;
    }

    if (assignedToMe === "true") {
      query.assignee = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  })
);

router.post(
  "/",
  authenticate,
  validateRequest(createTaskSchema),
  asyncHandler(async (req, res) => {
    const { title, description, projectId, assigneeId, status, priority, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!canAccessProject(project, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const resolvedAssigneeId = req.user.role === "admin" ? assigneeId : req.user._id.toString();

    if (!resolvedAssigneeId) {
      return res.status(400).json({ message: "Assignee is required" });
    }

    const isAssigneeInProject = project.members.some(
      (memberId) => memberId.toString() === resolvedAssigneeId.toString()
    );

    if (!isAssigneeInProject) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }

    const task = await Task.create({
      title,
      description: description || "",
      project: projectId,
      assignee: resolvedAssigneeId,
      createdBy: req.user._id,
      status: status || "todo",
      priority: priority || "medium",
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email");

    res.status(201).json({ task: populatedTask });
  })
);

router.patch(
  "/:taskId",
  authenticate,
  validateRequest(updateTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.taskId).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canAccessProject(task.project, req.user._id, req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData = { ...req.body };

    if (req.user.role !== "admin") {
      if (task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Members can update only their assigned tasks" });
      }

      const allowedKeys = ["status"];
      Object.keys(updateData).forEach((key) => {
        if (!allowedKeys.includes(key)) {
          delete updateData[key];
        }
      });
    }

    if (updateData.assigneeId) {
      const isAssigneeInProject = task.project.members.some(
        (memberId) => memberId.toString() === updateData.assigneeId.toString()
      );

      if (!isAssigneeInProject) {
        return res.status(400).json({ message: "Assignee must be a project member" });
      }

      updateData.assignee = updateData.assigneeId;
      delete updateData.assigneeId;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, updateData, {
      returnDocument: "after",
      runValidators: true
    })
      .populate("project", "name")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email");

    res.json({ task: updatedTask });
  })
);

export default router;
