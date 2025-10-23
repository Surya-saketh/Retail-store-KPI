import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from './TopProductsBarChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsBarChart = () => {
  const data = {
    labels: ['iPhone 15', 'Samsung TV', 'Nike Shoes', 'Coffee Maker', 'Laptop'],
    datasets: [
      {
        label: 'Units Sold',
        data: [145, 89, 67, 54, 43],
        backgroundColor: [
          '#3b82f6',  // Blue
          '#10b981',  // Green
          '#f59e0b',  // Yellow
          '#ef4444',  // Red
          '#8b5cf6',  // Purple
        ],
        borderColor: [
          '#2563eb',
          '#059669',
          '#d97706',
          '#dc2626',
          '#7c3aed',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1f2e',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#2e3650',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} units sold`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#2e3650',
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12,
          },
          maxRotation: 45,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Top Products</h2>
      <div className={styles.chartWrapper}>
        <Bar data={data} options={options} />
      </div>
      
      <div className={styles.productList}>
        {data.labels.map((product, idx) => (
          <div key={product} className={styles.productItem}>
            <span 
              className={styles.productColor}
              style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}
            />
            <span className={styles.productName}>{product}</span>
            <span className={styles.productSales}>{data.datasets[0].data[idx]} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsBarChart;
