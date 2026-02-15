export default function StatsGrid({ treasury, totalRevenue, totalExpenses, netProfit }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Tresorerie actuelle</span>
        <span className={`stat-value gold ${treasury < 50 ? 'danger' : ''}`}>{treasury}G</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total revenus</span>
        <span className="stat-value success">{totalRevenue}G</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total depenses</span>
        <span className="stat-value danger">{totalExpenses}G</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Benefice net</span>
        <span className={`stat-value ${netProfit >= 0 ? 'success' : 'danger'}`}>
          {netProfit >= 0 ? '+' : ''}{netProfit}G
        </span>
      </div>
    </div>
  );
}
