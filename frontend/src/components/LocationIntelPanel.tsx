import React, { useEffect, useState } from 'react';

interface WeatherForecast {
  date: string;
  day: string;
  temp_min: number;
  temp_max: number;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: number;
  precipitation_chance: number;
}

interface LocationData {
  location: string;
  country: string;
  temperature: number;
  weather: string;
  description: string;
  humidity: number;
  wind_speed: number;
  forecast: WeatherForecast[];
  recommendedProducts: {
    immediate: string[];
    upcoming: string[];
    seasonal: string[];
  };
  insights: {
    weather_trend: string;
    business_impact: string;
    inventory_suggestions: string[];
  };
}

const LocationIntelPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<LocationData | null>(null);
  const [testingBackend, setTestingBackend] = useState(false);

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

            console.log('Making API call to:', `http://localhost:5000/api/location?lat=${latitude}&lon=${longitude}`);
            
            const response = await fetch(
              `http://localhost:5000/api/location?lat=${latitude}&lon=${longitude}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Server error response:', errorText);
              throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Location data received:', result);
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

  const testBackend = async () => {
    setTestingBackend(true);
    try {
      console.log('Testing backend connection...');
      const response = await fetch('http://localhost:5000/api/location?lat=40.7128&lon=-74.0060');
      console.log('Backend test response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Backend test data:', result);
        alert('✅ Backend is working! Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('Backend test error:', errorText);
        alert(`❌ Backend error: ${response.status} - ${errorText}`);
      }
    } catch (err: any) {
      console.error('Backend test failed:', err);
      alert(`❌ Backend connection failed: ${err.message}`);
    } finally {
      setTestingBackend(false);
    }
  };

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
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
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
            <button 
              onClick={testBackend}
              disabled={testingBackend}
              style={{
                padding: '8px 16px',
                backgroundColor: testingBackend ? '#6b7280' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: testingBackend ? 'not-allowed' : 'pointer'
              }}
            >
              {testingBackend ? 'Testing...' : 'Test Backend'}
            </button>
          </div>
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
      
      {/* Current Weather Section */}
      <div style={infoCardStyle}>
        <div style={labelStyle}>📍 Current Location</div>
        <div style={valueStyle}>{data.location}, {data.country}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={infoCardStyle}>
          <div style={labelStyle}>🌡️ Temperature</div>
          <div style={valueStyle}>{data.temperature}°C</div>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
            {data.description}
          </div>
        </div>
        
        <div style={infoCardStyle}>
          <div style={labelStyle}>🌤️ Conditions</div>
          <div style={valueStyle}>{data.weather}</div>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
            Humidity: {data.humidity}% | Wind: {data.wind_speed} km/h
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div style={infoCardStyle}>
        <div style={labelStyle}>📅 5-Day Forecast</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginTop: '12px' }}>
          {data.forecast.map((day, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#0a0f1f',
                padding: '8px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                {day.day.substring(0, 3)}
              </div>
              <div style={{ color: '#cbd5e1', marginBottom: '2px' }}>
                {day.temp_max}°/{day.temp_min}°
              </div>
              <div style={{ color: '#a0aec0', fontSize: '10px' }}>
                {day.condition}
              </div>
              {day.precipitation_chance > 0 && (
                <div style={{ color: '#60a5fa', fontSize: '10px', marginTop: '2px' }}>
                  {day.precipitation_chance}% 🌧️
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights */}
      <div style={infoCardStyle}>
        <div style={labelStyle}>📊 Business Insights</div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ 
            backgroundColor: '#0a0f1f', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            marginBottom: '8px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <strong style={{ color: '#60a5fa' }}>Weather Trend:</strong> {data.insights.weather_trend}
          </div>
          <div style={{ 
            backgroundColor: '#0a0f1f', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            marginBottom: '8px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <strong style={{ color: '#10b981' }}>Business Impact:</strong> {data.insights.business_impact}
          </div>
          <div style={{ 
            backgroundColor: '#0a0f1f', 
            padding: '8px 12px', 
            borderRadius: '6px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <strong style={{ color: '#f59e0b' }}>Inventory Suggestions:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {data.insights.inventory_suggestions.map((suggestion, index) => (
                <li key={index} style={{ marginBottom: '2px' }}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Product Recommendations */}
      <div style={infoCardStyle}>
        <div style={labelStyle}>🛍️ Recommended Products</div>
        
        {/* Immediate Recommendations */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
            🚨 Immediate (Today)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
            {data.recommendedProducts.immediate.map((product, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#0a0f1f',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#cbd5e1',
                  border: '1px solid #ef4444'
                }}
              >
                {product}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Recommendations */}
        {data.recommendedProducts.upcoming.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
              ⏰ Upcoming (Next Few Days)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
              {data.recommendedProducts.upcoming.map((product, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: '#0a0f1f',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#cbd5e1',
                    border: '1px solid #f59e0b'
                  }}
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Recommendations */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
            🌱 Seasonal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
            {data.recommendedProducts.seasonal.map((product, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#0a0f1f',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#cbd5e1',
                  border: '1px solid #10b981'
                }}
              >
                {product}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationIntelPanel;
