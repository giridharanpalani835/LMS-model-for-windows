// components/charts/PerformanceChart.js — Bar chart for teacher/admin analytics
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PerformanceChart = ({ labels = [], scores = [], label = 'Avg Score' }) => {
  const data = {
    labels,
    datasets: [{
      label,
      data: scores,
      backgroundColor: labels.map((_, i) =>
        ['rgba(110,231,247,0.7)', 'rgba(167,139,250,0.7)', 'rgba(251,146,60,0.7)', 'rgba(74,222,128,0.7)'][i % 4]
      ),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' }, beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default PerformanceChart;
