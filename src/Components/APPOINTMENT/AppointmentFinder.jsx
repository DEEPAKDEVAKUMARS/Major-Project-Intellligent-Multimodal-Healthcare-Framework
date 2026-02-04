import React, { useState, useEffect } from 'react';
import './AppointmentFinder.css'; // Basic styling (create this file)

const AppointmentFinder = () => {
  const [psychiatrists, setPsychiatrists] = useState([]);
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

  const fetchNearbyPsychiatrists = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/nearby?lat=${location.lat}&lng=${location.lng}`
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch psychiatrists');
      }
  
      const data = await response.json();
  
      if (data.status === 'OK') {
        setPsychiatrists(data.results);
      } else {
        throw new Error(data.error_message || 'No psychiatrists found');
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          
          // Get location name
          const name = await getLocationName(newLocation.lat, newLocation.lng);
          setLocationName(name);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Fallback to default location
          fetchNearbyPsychiatrists();
        }
      );
    } else {
      fetchNearbyPsychiatrists(); // Use default location
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchNearbyPsychiatrists();
    }
  }, [location]);
 
  return (
    <div className="psychiatrist-finder">
      <div className="hero-section">
        <h1>🧠 Find Psychiatrists Near You</h1>
      </div>

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          Finding psychiatrists near you...
        </div>
      )}

      {error && (
        <div className="error">
          Error: {error}
          <button onClick={fetchNearbyPsychiatrists}>Retry</button>
        </div>
      )}

      <div className="psychiatrist-list">
        
        {psychiatrists.map((psychiatrist) => (
          <div key={psychiatrist.place_id} className="psychiatrist-card">
            <h2>{psychiatrist.name}</h2>

            <div className="info-row">
              <span className="rating">
                ⭐ {psychiatrist.rating || 'No rating'} (
                {psychiatrist.user_ratings_total || 0} reviews)
              </span>
              {psychiatrist.opening_hours?.open_now !== undefined && (
                <span
                  className={`open-now ${
                    psychiatrist.opening_hours.open_now ? 'open' : 'closed'
                  }`}
                >
                  {psychiatrist.opening_hours.open_now ? 'Open Now' : 'Closed'}
                </span>
              )}
            </div>

            <p className="address">{psychiatrist.vicinity}</p>

            {psychiatrist.formatted_phone_number && (
              <a
                href={`tel:${psychiatrist.formatted_phone_number}`}
                className="phone-call"
              >
                Call Now: {psychiatrist.formatted_phone_number}
              </a>
            )}

            {psychiatrist.photos?.[0] && (
              <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${psychiatrist.photos[0].photo_reference}&key=${API_KEY}`}
                alt={psychiatrist.name}
                className="place-image"
              />
            )}
            <button>Book Now</button>
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${psychiatrist.place_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-on-map"
            >
              View on Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentFinder;
