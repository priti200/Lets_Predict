import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, FlyToInterpolator } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API_KEY;

const MapComponent = ({ position: externalPosition }) => {
  const [viewport, setViewport] = useState({
    longitude: 75.7804, // Calicut
    latitude: 11.2588,
    zoom: 10,
    width: '100%',
    height: '100%'
  });

  useEffect(() => {
    const flyToPosition = (lat, lon) => {
        setViewport(v => ({
            ...v,
            longitude: lon,
            latitude: lat,
            zoom: 12,
            transitionDuration: 2000,
            transitionInterpolator: new FlyToInterpolator(),
        }));
    };

    if (externalPosition) {
        flyToPosition(externalPosition[0], externalPosition[1]);
    } else {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                flyToPosition(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                console.log("Geolocation failed, defaulting to Calicut.");
            },
            { enableHighAccuracy: true }
        );
    }
  }, [externalPosition]);

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={newViewport => setViewport(v => ({...v, ...newViewport}))}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      mapboxApiAccessToken={MAPBOX_TOKEN}
    >
        <Marker longitude={viewport.longitude} latitude={viewport.latitude} offsetLeft={-20} offsetTop={-10}>
            <div style={{color: 'red', fontSize: '24px'}}>📍</div>
        </Marker>
    </ReactMapGL>
  );
};

export default MapComponent;