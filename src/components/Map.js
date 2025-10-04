import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API_KEY;

const MapComponent = ({ position: externalPosition }) => {
  const [viewState, setViewState] = useState({
    longitude: 75.7804, // Calicut
    latitude: 11.2588,
    zoom: 10
  });
  const mapRef = useRef();

  useEffect(() => {
    const handleMove = () => {
        if (mapRef.current) {
            const { lng, lat } = mapRef.current.getMap().getCenter();
            setViewState(prevState => ({...prevState, longitude: lng, latitude: lat }));
        }
    };

    if (mapRef.current) {
        mapRef.current.on('move', handleMove);
    }

    if (externalPosition) {
        mapRef.current?.flyTo({ center: [externalPosition[1], externalPosition[0]], duration: 2000, zoom: 12 });
    } else {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
                setViewState(prevState => ({...prevState, ...newPos, zoom: 12}));
                mapRef.current?.flyTo({ center: [newPos.longitude, newPos.latitude], duration: 2000 });
            },
            () => {
                console.log("Geolocation failed, defaulting to Calicut.");
            },
            { enableHighAccuracy: true }
        );
    }

    return () => {
        if (mapRef.current) {
            mapRef.current.off('move', handleMove);
        }
    };
  }, [externalPosition]);

  return (
    <ReactMapGL
      {...viewState}
      ref={mapRef}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
        <Marker longitude={viewState.longitude} latitude={viewState.latitude} color="red" />
    </ReactMapGL>
  );
};

export default MapComponent;
