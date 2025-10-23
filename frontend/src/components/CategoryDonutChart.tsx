import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import styles from './CategoryDonutChart.module.css';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDonutChart = () => {
  const data = {
    labels: ['Electronics', 'Clothing', 'Groceries', 'Home & Garden', 'Toys'],
    datasets: [
      {
        label: 'Category Sales',
        data: [300, 50, 100, 40, 120],
        backgroundColor: [
          '#22c55e',  // Green
          '#3b82f6',  // Blue
          '#ef4444',  // Red
          '#f97316',  // Orange
          '#10e3ffff',  // Grey
        ],
        borderWidth: 2,
        borderColor: '#1e293b', // Dark background color to blend border
        hoverOffset: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Makes it a donut with a thicker ring
    plugins: {
      legend: {
        display: false, // We'll create custom legend below
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1e293b',
        titleColor: '#e0e7ff',
        bodyColor: '#cbd5e1',
        borderColor: '#4f46e5',
        borderWidth: 1,
        cornerRadius: 6,
      },
    },
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Category Sales</h2>
      <div className={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
      </div>

      <ul className={styles.legend}>
        {data.labels.map((label, idx) => (
          <li key={label} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryDonutChart;
