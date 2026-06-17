import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, HeatmapLayer } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './EcoGPS.css';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const center = {
  lat: 28.6139,
  lng: 77.2090
};

const darkMapStyle = [
  // ... existing map style elements ...
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

// CRITICAL: libraries array must be static outside the component
const libraries = ['visualization'];

function EcoGPS() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || '',
    libraries: libraries
  });

  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchMarkers = async () => {
      try {
        const snap = await getDocs(collection(db, 'mapMarkers'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMarkers(data.filter(m => m.type === 'user'));
      } catch (err) {
        console.error("Firebase fetch error", err);
      }
    };
    fetchMarkers();
  }, [isLoaded]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (errorMsg) {
    return <div style={{color: 'red', padding: '20px'}}>Fatal Error: {errorMsg}</div>;
  }

  try {
    return (
      <div className="ecogps-container">
        <header className="page-header">
          <div>
            <h2>Live Eco Map</h2>
            <p className="text-secondary">See real-time eco-actions and carbon hotspots around you.</p>
          </div>
        </header>
        
        <div className="map-wrapper glass-panel">
          {loadError ? (
            <div className="flex-center" style={{height: '100%', color: '#ef4444'}}>
              Error loading Google Maps. API Key might be invalid.
            </div>
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{ styles: darkMapStyle, disableDefaultUI: true }}
            >
              {(markers || []).map(marker => {
                const lat = Number(marker.lat);
                const lng = Number(marker.lng);
                if (isNaN(lat) || isNaN(lng)) return null;
                return (
                  <Marker 
                    key={marker.id || Math.random()} 
                    position={{lat, lng}}
                    label={{ text: marker.title || '', color: "white" }}
                    title={marker.action || ''}
                  />
                );
              })}
            </GoogleMap>
          ) : (
            <div className="flex-center" style={{height: '100%'}}>Loading Google Maps...</div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    return <div style={{color: 'red', padding: '20px'}}>Render Crash: {err.toString()}</div>;
  }
}

export default EcoGPS;
