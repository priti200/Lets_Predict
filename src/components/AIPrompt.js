import React, { useState, useCallback } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// A simple microphone icon component
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
  </svg>
);


const AIPrompt = ({ onSubmit }) => {
  const [inputMode, setInputMode] = useState('place'); // 'place' or 'coords'
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState(37.7577);
  const [longitude, setLongitude] = useState(-122.4376);
  const [date, setDate] = useState('');
  const [plans, setPlans] = useState('');
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  const handleVoiceInput = (setter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMode === 'place') {
      onSubmit({ place, date, plans });
    } else {
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        alert("Please enter valid latitude and longitude.");
        return;
      }
      onSubmit({
        place: `coords:${latitude},${longitude}`, // special format
        date,
        plans
      });
    }
  };

  const onMarkerDragEnd = useCallback(event => {
    const { lng, lat } = event.lngLat;
    setLongitude(lng);
    setLatitude(lat);
    reverseGeocode(lng, lat);
  }, []);

  const geocode = async () => {
    const token = process.env.REACT_APP_MAPBOX_API_KEY;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${token}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.features.length > 0) {
        const { center } = data.features[0];
        setLongitude(center[0]);
        setLatitude(center[1]);
        setViewport(prev => ({ ...prev, longitude: center[0], latitude: center[1] }));
      }
    } catch (error) {
      console.error("Error geocoding:", error);
    }
  };

  const reverseGeocode = async (lng, lat) => {
    const token = process.env.REACT_APP_MAPBOX_API_KEY;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.features.length > 0) {
        setPlace(data.features[0].place_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  };

  const inputFocusStyle = {
    border: '2px solid #667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  };

  const micButtonStyle = {
    padding: '0.75rem',
    background: '#f7fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
  };

  const toggleButtonStyle = {
    padding: '0.5rem 1rem',
    background: '#f7fafc',
    color: '#4a5568',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.85rem',
    fontWeight: '600',
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem',
      margin: '1rem 0'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            color: '#2d3748',
            margin: 0
          }}>
            📍 Input Mode
          </h2>
          <button
            type="button"
            style={toggleButtonStyle}
            onClick={() => setInputMode(prev => prev === 'place' ? 'coords' : 'place')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#edf2f7';
              e.currentTarget.style.borderColor = '#cbd5e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f7fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {inputMode === 'place' ? '🌐 Switch to Coordinates' : '📌 Switch to Place Name'}
          </button>
        </div>

        {inputMode === 'place' ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '0.95rem'
            }}>
              Place
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="e.g., Yosemite National Park"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button type="button" onClick={geocode} style={micButtonStyle}>Search</button>
              <button
                type="button"
                onClick={() => handleVoiceInput(setPlace)}
                style={micButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = '#edf2f7';
                  e.target.style.borderColor = '#cbd5e0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f7fafc';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                <MicIcon />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1.5rem' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '0.95rem'
              }}>
                Latitude
              </label>
              <input
                type="number"
                placeholder="e.g., 11.2588"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '0.95rem'
              }}>
                Longitude
              </label>
              <input
                type="number"
                placeholder="e.g., 75.7804"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div style={{height: '400px', marginBottom: '1.5rem'}}>
          <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          >
            <Marker longitude={longitude} latitude={latitude} anchor="bottom" draggable onDragEnd={onMarkerDragEnd} />
          </Map>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#4a5568',
            fontSize: '0.95rem'
          }}>
            📅 Date
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="e.g., July 15-20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setDate)}
              style={micButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = '#edf2f7';
                e.target.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f7fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#4a5568',
            fontSize: '0.95rem'
          }}>
            🎯 Plans
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="e.g., Hiking and camping"
              value={plans}
              onChange={(e) => setPlans(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => {
                e.target.style.border = '2px solid #e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setPlans)}
              style={micButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = '#edf2f7';
                e.target.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f7fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          🤖 Get AI Analysis
        </button>
      </form>
    </div>
  );
};

export default AIPrompt;
