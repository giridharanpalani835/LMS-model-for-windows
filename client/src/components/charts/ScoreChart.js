// components/charts/ScoreChart.js — Line chart of score history
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ScoreChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Score',
        data: data.map((d) => d.score),
        borderColor: '#6ee7f7',
        backgroundColor: 'rgba(110,231,247,0.12)',
        pointBackgroundColor: '#6ee7f7',
        pointRadius: 5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' }, beginAtZero: true },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ScoreChart;
