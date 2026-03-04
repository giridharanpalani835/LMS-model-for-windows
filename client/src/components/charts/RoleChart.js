// components/charts/RoleChart.js — Doughnut showing user role distribution
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RoleChart = ({ students = 0, teachers = 0, admins = 0 }) => {
  const data = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [{
      data: [students, teachers, admins],
      backgroundColor: ['rgba(110,231,247,0.8)', 'rgba(167,139,250,0.8)', 'rgba(251,146,60,0.8)'],
      borderColor: ['#0f172a'],
      borderWidth: 3,
    }],
  };

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: { legend: { labels: { color: '#94a3b8' } } },
  };

  return <Doughnut data={data} options={options} />;
};

export default RoleChart;
