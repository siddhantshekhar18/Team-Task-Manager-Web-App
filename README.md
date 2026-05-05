# Team Task Manager Web App

A full-stack Team Task Manager built with React + Vite (frontend), Node.js + Express (backend), and MongoDB.

## Features

- Authentication: Signup/Login with JWT
- Role-based access control: Admin and Member
- Project and team management
- Task creation, assignment, and status tracking
- Dashboard insights: task statuses, overdue tasks, open assignments
- Validations using Zod
- Relational modeling via MongoDB references (User -> Project -> Task)

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Zod
- Database: MongoDB (NoSQL)

## Project Structure

- client: React + Vite app
- server: Express REST API

## Setup

1. Install dependencies:

```bash
cd server
npm install
cd ../client
npm install
```

2. Configure environment:

- Copy server/.env.example to server/.env
- Copy client/.env.example to client/.env

3. Start backend:

```bash
cd server
npm run dev
```

4. Start frontend:

```bash
cd client
npm run dev
```

## Default URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Routes

### Auth

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Users

- GET /api/users

### Projects

- GET /api/projects
- POST /api/projects
- GET /api/projects/:projectId
- PATCH /api/projects/:projectId (admin)
- POST /api/projects/:projectId/members (admin)

### Tasks

- GET /api/tasks
- POST /api/tasks
- PATCH /api/tasks/:taskId

### Dev

- POST /api/dev/seed (development only)

### Dashboard

- GET /api/dashboard/summary

## RBAC Rules

- Admin:
  - Create/update projects
  - Add members to projects
  - Create tasks and assign tasks
  - Update any task
- Member:
  - View projects they belong to
  - Create projects (self member by default)
  - View tasks in their projects
  - Create tasks in their projects (auto-assigned to self)
  - Update status of their own assigned tasks

## Notes

- Ensure MongoDB is running locally or set MONGO_URI to a remote cluster.
- For production, use a strong JWT secret and locked CORS origin.
- One-click demo setup: on Login page click Generate Demo Data.
- Demo credentials:
  - Admin: demo.admin@ttm.local / demo123
  - Member: demo.member@ttm.local / demo123
