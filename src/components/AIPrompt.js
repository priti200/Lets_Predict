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

  return (
    <div className="card mb-3">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 mb-0">📍 Input Mode</h2>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setInputMode(prev => prev === 'place' ? 'coords' : 'place')}
          >
            {inputMode === 'place' ? '🌐 Switch to Coordinates' : '📌 Switch to Place Name'}
          </button>
        </div>

        {inputMode === 'place' ? (
          <div className="mb-3">
            <label className="form-label">Place</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Yosemite National Park"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <button type="button" onClick={geocode} className="btn btn-outline-secondary">Search</button>
              <button
                type="button"
                onClick={() => handleVoiceInput(setPlace)}
                className="btn btn-outline-secondary"
              >
                <MicIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 11.2588"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g., 75.7804"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{height: '400px'}} className="mb-3">
          <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          >
            <Marker longitude={longitude} latitude={latitude} anchor="bottom" draggable onDragEnd={onMarkerDragEnd} />
          </Map>
        </div>

        <div className="mb-3">
          <label className="form-label">📅 Date</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., July 15-20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setDate)}
              className="btn btn-outline-secondary"
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">🎯 Plans</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Hiking and camping"
              value={plans}
              onChange={(e) => setPlans(e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleVoiceInput(setPlans)}
              className="btn btn-outline-secondary"
            >
              <MicIcon />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
        >
          🤖 Get AI Analysis
        </button>
      </form>
    </div>
  );
};

export default AIPrompt;