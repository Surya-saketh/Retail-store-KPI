import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocationIntelPanel from '../components/LocationIntelPanel';

const LocationPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{ 
          marginBottom: '20px', 
          padding: '12px 20px', 
          cursor: 'pointer',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
      >
        ← Back to Dashboard
      </button>

      <LocationIntelPanel />
    </div>
  );
};

export default LocationPage;
