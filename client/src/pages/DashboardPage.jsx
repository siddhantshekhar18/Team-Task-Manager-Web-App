import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/dashboard/summary");
        setSummary(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="page-loader">Loading dashboard...</div>;
  }

  return (
    <section>
      <header className="section-header">
        <h2>Dashboard Overview</h2>
        <p>Track workload, status, and overdue tasks instantly.</p>
      </header>
      <div className="stats-grid">
        <StatCard label="Projects" value={summary.totalProjects} accent="#ff8e3c" />
        <StatCard label="Total Tasks" value={summary.totalTasks} accent="#1c6dd0" />
        <StatCard label="Overdue" value={summary.overdue} accent="#c1121f" />
        <StatCard label="My Open Tasks" value={summary.myOpenTasks} accent="#2a9d8f" />
      </div>
      <div className="status-panels">
        <article>
          <h3>Todo</h3>
          <strong>{summary.statusCounts.todo}</strong>
        </article>
        <article>
          <h3>In Progress</h3>
          <strong>{summary.statusCounts["in-progress"]}</strong>
        </article>
        <article>
          <h3>Done</h3>
          <strong>{summary.statusCounts.done}</strong>
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;
