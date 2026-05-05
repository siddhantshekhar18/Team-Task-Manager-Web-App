import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberForm, setMemberForm] = useState({ projectId: "", memberEmail: "" });
  const [error, setError] = useState("");

  const loadProjects = async () => {
    const response = await api.get("/projects");
    setProjects(response.data.projects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onCreateProject = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      await loadProjects();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not create project");
    }
  };

  const onAddMember = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post(`/projects/${memberForm.projectId}/members`, {
        memberEmail: memberForm.memberEmail
      });
      setMemberForm({ projectId: "", memberEmail: "" });
      await loadProjects();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not add member");
    }
  };

  return (
    <section>
      <header className="section-header">
        <h2>Projects & Team</h2>
        <p>Create projects, add members, and manage ownership.</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="forms-grid">
        <form className="panel" onSubmit={onCreateProject}>
          <h3>New Project</h3>
          <label>
            Name
            <input
              value={projectForm.name}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>
          <button type="submit">Create Project</button>
        </form>

        {user.role === "admin" && (
          <form className="panel" onSubmit={onAddMember}>
            <h3>Add Member to Project</h3>
            <label>
              Project
              <select
                value={memberForm.projectId}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, projectId: event.target.value }))
                }
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
            <label>
              Member Email
              <input
                type="email"
                value={memberForm.memberEmail}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, memberEmail: event.target.value }))
                }
                required
              />
            </label>
            <button type="submit">Add Member</button>
          </form>
        )}
      </div>

      <div className="list-grid">
        {projects.map((project) => (
          <article key={project._id} className="panel project-card">
            <h3>{project.name}</h3>
            <p>{project.description || "No description"}</p>
            <div className="meta-row">
              <span>Owner: {project.owner?.name}</span>
              <span>Members: {project.members.length}</span>
            </div>
            <ul>
              {project.members.map((member) => (
                <li key={member._id}>
                  {member.name} ({member.role})
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPage;
