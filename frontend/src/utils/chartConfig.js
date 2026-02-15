// Configurations et helpers pour les graphiques du Dashboard

const CHART_COLORS = {
  gold: '#d4a543',
  goldAlpha: 'rgba(212, 165, 67, 0.1)',
  text: '#f0ece2',
  textMuted: '#5a5a6a',
  gridLine: 'rgba(255, 255, 255, 0.04)',
  tooltipBg: 'rgba(39, 39, 45, 0.95)',
  tooltipBorder: 'rgba(212, 165, 67, 0.3)',
  border: 'rgba(39, 39, 45, 0.8)',
  doughnut: ['#d4a543', '#f87171', '#60a5fa', '#fbbf24']
};

const TYPE_LABELS = {
  achat_ingredient: 'Achats ingredients',
  penalite: 'Penalites'
};

export function buildLineChartData(history) {
  return {
    labels: history.map((h) => {
      const d = new Date(h.date);
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [{
      label: 'Tresorerie (G)',
      data: history.map(h => h.treasury),
      borderColor: CHART_COLORS.gold,
      backgroundColor: CHART_COLORS.goldAlpha,
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: CHART_COLORS.gold,
      pointBorderColor: CHART_COLORS.gold,
      borderWidth: 2
    }]
  };
}

export const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: CHART_COLORS.text, font: { family: 'Inter' } }
    },
    tooltip: {
      backgroundColor: CHART_COLORS.tooltipBg,
      titleColor: CHART_COLORS.gold,
      bodyColor: CHART_COLORS.text,
      borderColor: CHART_COLORS.tooltipBorder,
      borderWidth: 1,
      callbacks: {
        label: (ctx) => `Tresorerie: ${ctx.parsed.y}G`
      }
    }
  },
  scales: {
    x: {
      ticks: { color: CHART_COLORS.textMuted, maxTicksLimit: 15 },
      grid: { color: CHART_COLORS.gridLine }
    },
    y: {
      ticks: { color: CHART_COLORS.textMuted, callback: (v) => `${v}G` },
      grid: { color: CHART_COLORS.gridLine }
    }
  }
};

export function buildDoughnutChartData(breakdown) {
  return {
    labels: breakdown.map(b => TYPE_LABELS[b._id] || b._id),
    datasets: [{
      data: breakdown.map(b => b.total),
      backgroundColor: breakdown.map((_, i) => CHART_COLORS.doughnut[i % CHART_COLORS.doughnut.length]),
      borderColor: CHART_COLORS.border,
      borderWidth: 2
    }]
  };
}

export const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: CHART_COLORS.text,
        font: { family: 'Inter', size: 13 },
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: CHART_COLORS.tooltipBg,
      titleColor: CHART_COLORS.gold,
      bodyColor: CHART_COLORS.text,
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed}G`
      }
    }
  }
};

export function computeFinancials(history) {
  const totalRevenue = history
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = history
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
}
