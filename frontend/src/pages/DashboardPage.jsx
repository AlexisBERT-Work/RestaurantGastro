import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Navbar from '../components/Navbar';
import { transactionService } from '../services/api';
import '../styles/DashboardPage.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

export default function DashboardPage({ token, onLogout }) {
  const [treasury, setTreasury] = useState(null);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [profitPerDish, setProfitPerDish] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      const [treasuryRes, historyRes, breakdownRes, profitRes] = await Promise.all([
        transactionService.getTreasury(token),
        transactionService.getTreasuryHistory(token),
        transactionService.getExpenseBreakdown(token),
        transactionService.getProfitPerDish(token)
      ]);
      setTreasury(treasuryRes.data.treasury);
      setHistory(historyRes.data.history || []);
      setBreakdown(breakdownRes.data.breakdown || []);
      setProfitPerDish(profitRes.data.profitPerDish || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalRevenue = history
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = history
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Line chart data
  const lineChartData = {
    labels: history.map((h, i) => {
      const date = new Date(h.date);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [{
      label: 'Tresorerie (G)',
      data: history.map(h => h.treasury),
      borderColor: '#d4a543',
      backgroundColor: 'rgba(212, 165, 67, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: '#d4a543',
      pointBorderColor: '#d4a543',
      borderWidth: 2
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#f0ece2', font: { family: 'Inter' } }
      },
      tooltip: {
        backgroundColor: 'rgba(39, 39, 45, 0.95)',
        titleColor: '#d4a543',
        bodyColor: '#f0ece2',
        borderColor: 'rgba(212, 165, 67, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `Tresorerie: ${ctx.parsed.y}G`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5a5a6a', maxTicksLimit: 15 },
        grid: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      y: {
        ticks: { color: '#5a5a6a', callback: (v) => `${v}G` },
        grid: { color: 'rgba(255, 255, 255, 0.04)' }
      }
    }
  };

  // Doughnut chart data
  const typeLabels = {
    'achat_ingredient': 'Achats ingredients',
    'penalite': 'Penalites'
  };
  const doughnutColors = ['#d4a543', '#f87171', '#60a5fa', '#fbbf24'];

  const doughnutChartData = {
    labels: breakdown.map(b => typeLabels[b._id] || b._id),
    datasets: [{
      data: breakdown.map(b => b.total),
      backgroundColor: breakdown.map((_, i) => doughnutColors[i % doughnutColors.length]),
      borderColor: 'rgba(39, 39, 45, 0.8)',
      borderWidth: 2
    }]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f0ece2',
          font: { family: 'Inter', size: 13 },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(39, 39, 45, 0.95)',
        titleColor: '#d4a543',
        bodyColor: '#f0ece2',
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}G`
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar token={token} onLogout={onLogout} />
        <div className="dashboard-content">
          <p className="loading-text">Chargement des donnees financieres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      <div className="dashboard-content">
        <h2 className="dashboard-title">Tableau de bord financier</h2>

        {/* Stats Grid */}
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
            <span className={`stat-value ${totalRevenue - totalExpenses >= 0 ? 'success' : 'danger'}`}>
              {totalRevenue - totalExpenses >= 0 ? '+' : ''}{totalRevenue - totalExpenses}G
            </span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="chart-section chart-line">
            <h3>Evolution de la tresorerie</h3>
            {history.length > 0 ? (
              <div className="chart-wrapper">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            ) : (
              <p className="no-data">Aucune transaction pour le moment</p>
            )}
          </div>

          <div className="chart-section chart-doughnut">
            <h3>Repartition des depenses</h3>
            {breakdown.length > 0 ? (
              <div className="chart-wrapper doughnut-wrapper">
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
            ) : (
              <p className="no-data">Aucune depense pour le moment</p>
            )}
          </div>
        </div>

        {/* Profit per Dish Table */}
        <div className="profit-section">
          <h3>Benefice net par plat</h3>
          {profitPerDish.length > 0 ? (
            <div className="table-wrapper">
              <table className="profit-table">
                <thead>
                  <tr>
                    <th>Plat</th>
                    <th>Fois vendu</th>
                    <th>Revenu total</th>
                    <th>Cout ingredients</th>
                    <th>Benefice / plat</th>
                    <th>Benefice total</th>
                  </tr>
                </thead>
                <tbody>
                  {profitPerDish.map((dish, idx) => (
                    <tr key={idx}>
                      <td className="dish-name">{dish.recipeName}</td>
                      <td>{dish.timesSold}</td>
                      <td className="revenue">{dish.totalRevenue}G</td>
                      <td className="cost">{dish.ingredientCostPerServe}G</td>
                      <td className={dish.netProfitPerServe >= 0 ? 'profit' : 'loss'}>
                        {dish.netProfitPerServe >= 0 ? '+' : ''}{dish.netProfitPerServe}G
                      </td>
                      <td className={dish.totalNetProfit >= 0 ? 'profit' : 'loss'}>
                        {dish.totalNetProfit >= 0 ? '+' : ''}{dish.totalNetProfit}G
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Aucun plat vendu pour le moment. Demarrez le service pour commencer a vendre !</p>
          )}
        </div>
      </div>
    </div>
  );
}
