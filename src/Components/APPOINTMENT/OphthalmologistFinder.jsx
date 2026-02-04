import React, { useState, useEffect } from 'react';
import './OphthalmologistFinder.css';

const OphthalmologistFinder = () => {
  const [ophthalmologists, setOphthalmologists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({
    lat: 13.0827, // Latitude for Chennai
    lng: 80.2707  // Longitude for Chennai
  });
  const [locationName, setLocationName] = useState('Chennai, Tamil Nadu');

  // Replace with your actual API key
  const API_KEY = 'AIzaSyCqvvrrhUSq5Hx3PLdCmIZhjzQ8V_ZKpXM';

  const getLocationName = async (lat, lng) => {
    try {
      console.log('Getting location name for:', lat, lng);
      const response = await fetch(
        `http://localhost:5000/api/geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log('First result:', result);
        
        // Extract city and state/country
        let city = '';
        let state = '';
        
        result.address_components.forEach(component => {
          console.log('Component:', component);
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        });
        
        console.log('Extracted city:', city, 'state:', state);
        
        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        } else {
          return result.formatted_address.split(',')[0];
        }
      }
      console.log('No results found, returning Unknown Location');
      return 'Unknown Location';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Unknown Location';
    }
  };

  const fetchNearbyOphthalmologists = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/nearby-ophthalmologist?lat=${location.lat}&lng=${location.lng}`
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch ophthalmologists');
      }
  
      const data = await response.json();
  
      if (data.status === 'OK') {
        setOphthalmologists(data.results);
      } else {
        throw new Error(data.error_message || 'No ophthalmologists found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  

  // Get user's current location
  const getUserLocation = () => {
    console.log('Getting user location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Position received:', position.coords);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          
          // Get location name
          console.log('Getting location name...');
          const name = await getLocationName(newLocation.lat, newLocation.lng);
          console.log('Location name received:', name);
          setLocationName(name);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Fallback to default location
          fetchNearbyOphthalmologists();
        }
      );
    } else {
      console.log('Geolocation not supported');
      fetchNearbyOphthalmologists(); // Use default location
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchNearbyOphthalmologists();
    }
  }, [location]);
 
  return (
    <div className="ophthalmologist-finder">
      <div className="hero-section">
        <h1>👁️ Find Ophthalmologists Near You</h1>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          Finding ophthalmologists near you...
        </div>
      )}

      {error && (
        <div className="error">
          Error: {error}
          <button className="retry-button" onClick={fetchNearbyOphthalmologists}>Retry</button>
        </div>
      )}

      <div className="ophthalmologist-list">
        {ophthalmologists.map((ophthalmologist) => (
          <div key={ophthalmologist.place_id} className="ophthalmologist-card">
            <h2>{ophthalmologist.name}</h2>

            <div className="info-row">
              <span className="rating">
                ⭐ {ophthalmologist.rating || 'No rating'} (
                {ophthalmologist.user_ratings_total || 0} reviews)
              </span>
              {ophthalmologist.opening_hours?.open_now !== undefined && (
                <span
                  className={`open-now ${
                    ophthalmologist.opening_hours.open_now ? 'open' : 'closed'
                  }`}
                >
                  {ophthalmologist.opening_hours.open_now ? 'Open Now' : 'Closed'}
                </span>
              )}
            </div>

            <p className="address">{ophthalmologist.vicinity}</p>

            {ophthalmologist.formatted_phone_number && (
              <a
                href={`tel:${ophthalmologist.formatted_phone_number}`}
                className="phone-call"
              >
                📞 Call Now: {ophthalmologist.formatted_phone_number}
              </a>
            )}

            {ophthalmologist.photos?.[0] && (
              <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ophthalmologist.photos[0].photo_reference}&key=${API_KEY}`}
                alt={ophthalmologist.name}
                className="place-image"
              />
            )}
            
            <button className="book-button">Book Appointment</button>
            
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${ophthalmologist.place_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-on-map"
            >
              🗺️ View on Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OphthalmologistFinder;
