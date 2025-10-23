import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ label, value, icon }) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.info}>
        <p className={styles.label}>{label}</p>
        <h2 className={styles.value}>{value}</h2>
      </div>
    </div>
  );
};

export default StatsCard;
