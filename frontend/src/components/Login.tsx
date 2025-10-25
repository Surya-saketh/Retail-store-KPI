import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'manager') => {
    if (role === 'manager') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier1');
      setPassword('cashier123');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Retail KPI Login</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <p>Demo Accounts:</p>
          <div className={styles.demoButtons}>
            <button 
              type="button"
              onClick={() => handleDemoLogin('manager')}
              className={`${styles.demoButton} ${styles.manager}`}
              disabled={isLoading}
            >
              Manager Demo
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('user')}
              className={`${styles.demoButton} ${styles.user}`}
              disabled={isLoading}
            >
              Cashier Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
