import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import Navbar from '../components/Navbar';
import StatsGrid from '../components/StatsGrid';
import ProfitTable from '../components/ProfitTable';
import { transactionService } from '../services/api';
import {
  buildLineChartData, lineChartOptions,
  buildDoughnutChartData, doughnutChartOptions,
  computeFinancials
} from '../utils/chartConfig';
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
    (async () => {
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
        console.error('Echec du chargement des donnees du tableau de bord:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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

  const { totalRevenue, totalExpenses, netProfit } = computeFinancials(history);

  return (
    <div className="dashboard-container">
      <Navbar token={token} onLogout={onLogout} treasury={treasury} />

      <div className="dashboard-content">
        <h2 className="dashboard-title">Tableau de bord financier</h2>

        <StatsGrid
          treasury={treasury}
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
        />

        {/* Graphiques */}
        <div className="charts-row">
          <div className="chart-section chart-line">
            <h3>Evolution de la tresorerie</h3>
            {history.length > 0 ? (
              <div className="chart-wrapper">
                <Line data={buildLineChartData(history)} options={lineChartOptions} />
              </div>
            ) : (
              <p className="no-data">Aucune transaction pour le moment</p>
            )}
          </div>

          <div className="chart-section chart-doughnut">
            <h3>Repartition des depenses</h3>
            {breakdown.length > 0 ? (
              <div className="chart-wrapper doughnut-wrapper">
                <Doughnut data={buildDoughnutChartData(breakdown)} options={doughnutChartOptions} />
              </div>
            ) : (
              <p className="no-data">Aucune depense pour le moment</p>
            )}
          </div>
        </div>

        <ProfitTable profitPerDish={profitPerDish} />
      </div>
    </div>
  );
}
