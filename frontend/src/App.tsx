import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/DashBoard';
import LocationPage from './pages/LocationPage';
import BillingPage from './pages/BillingPage';
import ProductsPage from './pages/ProductsPage';
import Login from './components/Login';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const { user, isLoading, isManager } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/billing" element={<BillingPage />} />
        {isManager && <Route path="/products" element={<ProductsPage />} />}
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
