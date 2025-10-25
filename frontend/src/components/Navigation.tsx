import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const { user, logout, isManager } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <h2>Retail KPI</h2>
        </div>

        <div className={styles.navLinks}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/location" 
            className={`${styles.navLink} ${isActive('/location') ? styles.active : ''}`}
          >
            Weather Intel
          </Link>
          
          <Link 
            to="/billing" 
            className={`${styles.navLink} ${isActive('/billing') ? styles.active : ''}`}
          >
            Billing
          </Link>
          
          {isManager && (
            <Link 
              to="/products" 
              className={`${styles.navLink} ${isActive('/products') ? styles.active : ''}`}
            >
              Products
            </Link>
          )}
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.username}>{user?.username}</span>
            <span className={`${styles.role} ${styles[user?.role || '']}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
