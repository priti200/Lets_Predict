import React, { useState, useRef, useEffect } from 'react';
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

  const wrapperRef = useRef(null);
  const placeRef = useRef(null);
  const coordsRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(null);

  const handleVoiceInput = (setter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Sorry, your browser does not support speech recognition.');
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

  useEffect(() => {
    const measure = () => {
      const h1 = placeRef.current ? placeRef.current.scrollHeight : 0;
      const h2 = coordsRef.current ? coordsRef.current.scrollHeight : 0;
      // choose the visible panel height to avoid a fixed large gap
      const visible = inputMode === 'place' ? h1 : h2;
      const fallback = Math.max(h1, h2, 160);
      const heightToUse = visible || fallback;
      setPanelHeight(heightToUse);
    };
    // measure after render
    const t = setTimeout(measure, 30);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t); window.removeEventListener('resize', measure); };
  }, [inputMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMode === 'place') {
      onSubmit({ place, date, plans });
    } else {
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter valid latitude and longitude.');
        return;
      }
      onSubmit({ place: `coords:${latitude},${longitude}`, date, plans });
    }
  };

  return (
    <div className="panel-card mb-24">
      <form onSubmit={handleSubmit}>
        <div className="section-heading">
          <h2 className="section-title">📍 Input Mode</h2>
          <button
            type="button"
            className={`button-secondary ${inputMode === 'coords' ? 'active' : ''}`}
            onClick={() => setInputMode((prev) => (prev === 'place' ? 'coords' : 'place'))}
            aria-pressed={inputMode === 'coords'}
          >
            {inputMode === 'place' ? '🌐 Switch to Coordinates' : '📌 Switch to Place Name'}
            <span className="switch-icon">↺</span>
          </button>
        </div>

        <div className="input-panels-wrapper" ref={wrapperRef} style={{ height: panelHeight ? `${panelHeight}px` : 'auto' }}>
          <div ref={placeRef} className={`input-panel ${inputMode === 'place' ? 'visible' : ''}`} aria-hidden={inputMode !== 'place'}>
            <div className="mb-24">
              <label className="field-label">📍 Place</label>
              <div className="inline-input-row">
                <input
                  type="text"
                  placeholder="e.g., Yosemite National Park"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="field-input"
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput(setPlace)}
                  className="mic-button"
                  aria-label="Voice input for place"
                  title="Voice input for place"
                >
                  <MicIcon />
                </button>
              </div>
            </div>
          </div>

          <div ref={coordsRef} className={`input-panel ${inputMode === 'coords' ? 'visible' : ''}`} aria-hidden={inputMode !== 'coords'}>
            <div className="grid-2 mb-24">
              <div>
                <label className="field-label">Latitude</label>
                <input
                  type="number"
                  placeholder="e.g., 11.2588"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Longitude</label>
                <input
                  type="number"
                  placeholder="e.g., 75.7804"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <label className="field-label">📅 Date</label>
          <div className="inline-input-row">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., July 15-20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field-input"
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setDate)}
              className="mic-button"
              aria-label="Voice input for date"
              title="Voice input for date"
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <div className="mb-24">
          <label className="field-label">🎯 Plans</label>
          <div className="inline-input-row">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Hiking and camping"
              value={plans}
              onChange={(e) => setPlans(e.target.value)}
              className="field-input"
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setPlans)}
              className="mic-button"
              aria-label="Voice input for plans"
              title="Voice input for plans"
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <button type="submit" className="button-primary">🤖 Get AI Analysis</button>
      </form>
    </div>
  );
};

export default AIPrompt;