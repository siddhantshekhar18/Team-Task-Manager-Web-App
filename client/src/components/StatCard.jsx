const StatCard = ({ label, value, accent }) => {
  return (
    <article className="stat-card" style={{ borderColor: accent }}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
};

export default StatCard;
