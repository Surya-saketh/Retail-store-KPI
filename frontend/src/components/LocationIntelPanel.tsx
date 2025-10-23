import React, { useEffect, useState } from 'react';

interface LocationData {
  location: string;
  temperature: number;
  weather: string;
  recommendedProducts: string[];
}

const LocationIntelPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<LocationData | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log('Got coordinates:', latitude, longitude);

            const response = await fetch(
              `http://localhost:5000/api/location?lat=${latitude}&lon=${longitude}`
            );

            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Location data:', result);
            setData(result);
          } catch (err: any) {
            console.error('Location fetch error:', err);
            setError(err.message || 'Failed to fetch location data');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Permission denied to access location. Please allow location access and try again.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    };

    getLocation();
  }, []);

  const containerStyle = {
    backgroundColor: '#13192d',
    borderRadius: '10px',
    padding: '24px',
    color: 'white',
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: '600px',
    margin: '0 auto'
  };

  const loadingStyle = {
    textAlign: 'center' as const,
    fontSize: '18px',
    color: '#cbd5e1',
    padding: '40px'
  };

  const errorStyle = {
    textAlign: 'center' as const,
    fontSize: '16px',
    color: '#ef4444',
    padding: '20px',
    backgroundColor: '#1a1f2e',
    borderRadius: '8px',
    border: '1px solid #ef4444'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#ffffff'
  };

  const infoCardStyle = {
    backgroundColor: '#1a1f2e',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #2e3650'
  };

  const labelStyle = {
    fontSize: '14px',
    color: '#a0aec0',
    marginBottom: '4px'
  };

  const valueStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div>🌍 Getting your location...</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>Please allow location access when prompted</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <div>❌ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>No location data available</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📍 Location Intelligence</h2>
      
      <div style={infoCardStyle}>
        <div style={labelStyle}>Location</div>
        <div style={valueStyle}>{data.location}</div>
      </div>

      <div style={infoCardStyle}>
        <div style={labelStyle}>Temperature</div>
        <div style={valueStyle}>{Math.round(data.temperature)}°C</div>
      </div>

      <div style={infoCardStyle}>
        <div style={labelStyle}>Weather</div>
        <div style={valueStyle}>{data.weather}</div>
      </div>

      <div style={infoCardStyle}>
        <div style={labelStyle}>Recommended Products</div>
        <div style={{ marginTop: '8px' }}>
          {data.recommendedProducts.map((product, index) => (
            <div 
              key={product} 
              style={{
                backgroundColor: '#0a0f1f',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '6px',
                fontSize: '14px',
                color: '#cbd5e1'
              }}
            >
              {index + 1}. {product}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationIntelPanel;
