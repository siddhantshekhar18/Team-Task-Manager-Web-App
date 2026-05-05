import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const TasksPage = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", projectId: "", assignedToMe: "false" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    dueDate: ""
  });

  const loadBaseData = async () => {
    const requests = [api.get("/projects")];

    if (user.role === "admin") {
      requests.push(api.get("/users"));
    }

    const [projectsResponse, usersResponse] = await Promise.all(requests);
    setProjects(projectsResponse.data.projects);
    setUsers(usersResponse?.data?.users || []);
  };

  const loadTasks = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const response = await api.get("/tasks", { params });
    setTasks(response.data.tasks);
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const onCreateTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        assigneeId: user.role === "admin" ? form.assigneeId : currentUserId
      };

      await api.post("/tasks", payload);
      setForm({
        title: "",
        description: "",
        projectId: "",
        assigneeId: "",
        status: "todo",
        priority: "medium",
        dueDate: ""
      });
      await loadTasks();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not create task");
    }
  };

  const onStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await loadTasks();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not update status");
    }
  };

  return (
    <section>
      <header className="section-header">
        <h2>Tasks</h2>
        <p>Create tasks, assign owners, and monitor progress.</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {projects.length === 0 && (
        <div className="panel">
          <p>
            No projects found. Create a project first from <Link to="/projects">Projects</Link> to enable
            task creation.
          </p>
        </div>
      )}

      <div className="filters panel">
        <h3>Filters</h3>
        <div className="filter-row">
          <select
            value={filters.projectId}
            onChange={(event) => setFilters((prev) => ({ ...prev, projectId: event.target.value }))}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={filters.assignedToMe === "true"}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, assignedToMe: event.target.checked ? "true" : "false" }))
              }
            />
            Assigned to me
          </label>
        </div>
      </div>

      <form className="panel" onSubmit={onCreateTask}>
        <h3>Create Task</h3>
        <div className="forms-grid compact">
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Project
            <select
              value={form.projectId}
              onChange={(event) => setForm((prev) => ({ ...prev, projectId: event.target.value }))}
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          {user.role === "admin" ? (
            <label>
              Assignee
              <select
                value={form.assigneeId}
                onChange={(event) => setForm((prev) => ({ ...prev, assigneeId: event.target.value }))}
                required
              >
                <option value="">Select assignee</option>
                {users.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Assignee
              <input value="Self" readOnly />
            </label>
          )}

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              required
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
        <button type="submit">Create Task</button>
      </form>

      <div className="list-grid">
        {tasks.map((task) => (
          <article className="panel task-card" key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description || "No description"}</p>
            <div className="meta-row">
              <span>Project: {task.project?.name}</span>
              <span>Assignee: {task.assignee?.name}</span>
            </div>
            <div className="meta-row">
              <span>Priority: {task.priority}</span>
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <label>
              Status
              <select
                value={task.status}
                onChange={(event) => onStatusChange(task._id, event.target.value)}
                disabled={
                  user.role !== "admin" &&
                  task.assignee?._id !== currentUserId
                }
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TasksPage;
