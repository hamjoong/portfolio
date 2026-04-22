import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface GrowthChartProps {
  data: { date: string; exp: number }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      label: '일일 경험치',
      data: data.map(d => d.exp),
      borderColor: '#2563eb',
      backgroundColor: '#dbeafe',
      tension: 0.3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
