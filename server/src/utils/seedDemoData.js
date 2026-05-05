import bcrypt from "bcryptjs";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const DEMO_ADMIN_EMAIL = "demo.admin@ttm.local";
const DEMO_MEMBER_EMAIL = "demo.member@ttm.local";
const DEMO_PASSWORD = "demo123";

const seedDemoData = async () => {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  await User.updateOne(
    { email: DEMO_ADMIN_EMAIL },
    {
      $set: {
        name: "Demo Admin",
        email: DEMO_ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin"
      }
    },
    { upsert: true }
  );

  await User.updateOne(
    { email: DEMO_MEMBER_EMAIL },
    {
      $set: {
        name: "Demo Member",
        email: DEMO_MEMBER_EMAIL,
        password: hashedPassword,
        role: "member"
      }
    },
    { upsert: true }
  );

  const admin = await User.findOne({ email: DEMO_ADMIN_EMAIL });
  const member = await User.findOne({ email: DEMO_MEMBER_EMAIL });

  let project = await Project.findOne({ name: "Website Revamp" });

  if (!project) {
    project = await Project.create({
      name: "Website Revamp",
      description: "Public website redesign and launch readiness",
      owner: admin._id,
      members: [admin._id, member._id]
    });
  } else {
    project.owner = admin._id;
    project.members = [admin._id, member._id];
    project.description = "Public website redesign and launch readiness";
    await project.save();
  }

  await Task.deleteMany({ project: project._id });

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  await Task.insertMany([
    {
      title: "Design homepage hero",
      description: "Create responsive hero section and visual hierarchy",
      project: project._id,
      assignee: member._id,
      createdBy: admin._id,
      status: "in-progress",
      priority: "high",
      dueDate: new Date(now.getTime() + 2 * dayMs)
    },
    {
      title: "Prepare QA checklist",
      description: "Finalize smoke test and regression scenarios",
      project: project._id,
      assignee: admin._id,
      createdBy: admin._id,
      status: "todo",
      priority: "medium",
      dueDate: new Date(now.getTime() + 4 * dayMs)
    },
    {
      title: "Fix footer accessibility",
      description: "Address contrast and keyboard navigation issues",
      project: project._id,
      assignee: member._id,
      createdBy: admin._id,
      status: "todo",
      priority: "low",
      dueDate: new Date(now.getTime() + 1 * dayMs)
    }
  ]);

  return {
    credentials: {
      admin: { email: DEMO_ADMIN_EMAIL, password: DEMO_PASSWORD },
      member: { email: DEMO_MEMBER_EMAIL, password: DEMO_PASSWORD }
    },
    projectName: project.name
  };
};

export default seedDemoData;
