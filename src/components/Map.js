import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Robust map component that falls back to an OpenStreetMap iframe when Mapbox token or react-map-gl
// usage would cause runtime errors in the environment. Keeps behavior simple and reliable.
const DEFAULT_COORDS = { lat: 11.2588, lon: 75.7804 }; // Calicut

const buildOsmIframeUrl = (lat, lon, zoom = 12) => {
  // Use OpenStreetMap's embed with a marker
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.03}%2C${lon + 0.05}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;
};

const MapComponent = ({ position: externalPosition }) => {
  const [coords, setCoords] = useState(DEFAULT_COORDS);

  useEffect(() => {
    if (externalPosition && externalPosition.length === 2) {
      setCoords({ lat: Number(externalPosition[0]), lon: Number(externalPosition[1]) });
      return;
    }

    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {
          // keep default coords
        },
        { enableHighAccuracy: true }
      );
    }
  }, [externalPosition]);

  const iframeUrl = buildOsmIframeUrl(coords.lat, coords.lon);

  return (
    <div className="map-embed-wrapper">
      <iframe
        title="Map"
        src={iframeUrl}
        className="map-embed-iframe"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default MapComponent;
