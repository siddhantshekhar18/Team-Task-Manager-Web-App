import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [seedInfo, setSeedInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onSeedDemo = async () => {
    setError("");
    setSeedInfo("");
    setSeeding(true);

    try {
      const response = await api.post("/dev/seed");
      const data = response.data;

      setSeedInfo(
        `Demo ready. Admin: ${data.credentials.admin.email} / ${data.credentials.admin.password}`
      );
      setForm({
        email: data.credentials.admin.email,
        password: data.credentials.admin.password
      });
    } catch (seedError) {
      setError(seedError.message || "Could not seed demo data");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Welcome Back</h1>
        <p>Sign in to manage projects and tasks.</p>
        {error && <div className="error-banner">{error}</div>}
        {seedInfo && <div className="panel">{seedInfo}</div>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={onChange} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
        <button type="button" onClick={onSeedDemo} disabled={seeding}>
          {seeding ? "Seeding demo..." : "Generate Demo Data"}
        </button>
        <p className="auth-footnote">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
