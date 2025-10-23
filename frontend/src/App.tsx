import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/DashBoard';
import LocationPage from './pages/LocationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/location" element={<LocationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
