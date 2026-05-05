import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  addProjectMemberSchema,
  createProjectSchema,
  updateProjectSchema
} from "../validators/projectSchemas.js";

const router = express.Router();

const ensureProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { error: { status: 404, message: "Project not found" } };
  }

  const isMember = project.members.some((memberId) => memberId.toString() === user._id.toString());
  const isOwner = project.owner.toString() === user._id.toString();

  if (user.role !== "admin" && !isMember && !isOwner) {
    return { error: { status: 403, message: "Forbidden" } };
  }

  return { project };
};

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const filter = req.user.role === "admin" ? {} : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json({ projects });
  })
);

router.post(
  "/",
  authenticate,
  validateRequest(createProjectSchema),
  asyncHandler(async (req, res) => {
    const { name, description, members = [] } = req.body;

    const memberIds =
      req.user.role === "admin"
        ? members.filter((id) => mongoose.isValidObjectId(id))
        : [];
    const uniqueMembers = [...new Set([req.user._id.toString(), ...memberIds])];

    const project = await Project.create({
      name,
      description: description || "",
      owner: req.user._id,
      members: uniqueMembers
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.status(201).json({ project: populatedProject });
  })
);

router.get(
  "/:projectId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const access = await ensureProjectAccess(projectId, req.user);

    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const project = await Project.findById(projectId)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json({ project });
  })
);

router.patch(
  "/:projectId",
  authenticate,
  requireRole("admin"),
  validateRequest(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.projectId, req.body, {
      returnDocument: "after",
      runValidators: true
    })
      .populate("owner", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  })
);

router.post(
  "/:projectId/members",
  authenticate,
  requireRole("admin"),
  validateRequest(addProjectMemberSchema),
  asyncHandler(async (req, res) => {
    const { memberEmail } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findOne({ email: memberEmail });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    const alreadyMember = project.members.some((memberId) => memberId.toString() === user._id.toString());

    if (!alreadyMember) {
      project.members.push(user._id);
      await project.save();
    }

    const updated = await Project.findById(project._id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json({ project: updated });
  })
);

export default router;
