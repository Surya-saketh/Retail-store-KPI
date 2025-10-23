import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashBoard.module.css';
import StatsCard from '../components/StatsCard';
import SalesTrendChart from '../components/SalesTrendChart';
import TopProductsBarChart from '../components/TopProductsBarChart';

const Dashboard = () => {
  const navigate = useNavigate();  // <-- initialize navigate

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>📊 KP Retail Store Dashboard</h1>
        <div className={styles.navButtons}>
          <button onClick={() => navigate('/location')}>
            📍 Location Intelligence
          </button>
          <button className={styles.timeToggle}>24H</button>
        </div>
      </header>

      <section className={styles.stats}>
        <StatsCard label="Total Sales" value="₹1,172,029" icon="💰" />
        <StatsCard label="Transactions" value="4251" icon="📄" />
        <StatsCard label="Avg Transaction" value="₹276" icon="📊" />
        <StatsCard label="Conversion Rate" value="24.5%" icon="📈" />
        <StatsCard label="Inventory Turnover" value="2.1" icon="📦" />
        <StatsCard label="GMRI" value="9.1" icon="🪙" />
      </section>

      <section className={styles.chartSection}>
        <div className={styles.salesTrend}>
          <h2>📈 Daily Sales Trend</h2>
          <SalesTrendChart />
        </div>

        <div className={styles.salesByCategory}>
          <h2>🏆 Top Products</h2>
          <TopProductsBarChart />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
