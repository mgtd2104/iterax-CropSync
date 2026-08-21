import { useState, useEffect, useCallback } from "react";

// Major Indian cities with their state/district mapping for fallback
const INDIAN_CITIES = [
  { lat: 28.7041, lon: 77.1025, state: "Delhi", district: "New Delhi" },
  { lat: 19.0760, lon: 72.8777, state: "Maharashtra", district: "Mumbai" },
  { lat: 12.9716, lon: 77.5946, state: "Karnataka", district: "Bangalore" },
  { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu", district: "Chennai" },
  { lat: 22.5726, lon: 88.3639, state: "West Bengal", district: "Kolkata" },
  { lat: 17.3850, lon: 78.4867, state: "Telangana", district: "Hyderabad" },
  { lat: 23.0225, lon: 72.5714, state: "Gujarat", district: "Ahmedabad" },
  { lat: 26.9124, lon: 75.7873, state: "Rajasthan", district: "Jaipur" },
  { lat: 30.7333, lon: 76.7794, state: "Punjab", district: "Ludhiana" },
  { lat: 31.6340, lon: 74.8723, state: "Punjab", district: "Amritsar" },
  { lat: 21.1458, lon: 79.0882, state: "Maharashtra", district: "Nagpur" },
  { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh", district: "Lucknow" },
  { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh", district: "Varanasi" },
  { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh", district: "Bhopal" },
  { lat: 22.3072, lon: 73.1812, state: "Gujarat", district: "Surat" },
  { lat: 21.1702, lon: 72.8311, state: "Gujarat", district: "Rajkot" },
  { lat: 26.2006, lon: 92.9376, state: "Assam", district: "Guwahati" },
  { lat: 25.5941, lon: 85.1376, state: "Bihar", district: "Patna" },
  { lat: 23.6102, lon: 85.2799, state: "Jharkhand", district: "Ranchi" },
  { lat: 19.2183, lon: 72.9781, state: "Maharashtra", district: "Thane" },
  { lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh", district: "Visakhapatnam" },
  { lat: 15.2993, lon: 74.1240, state: "Goa", district: "Panaji" },
  { lat: 10.8505, lon: 76.2711, state: "Kerala", district: "Kochi" },
  { lat: 8.5241, lon: 76.9366, state: "Kerala", district: "Thiruvananthapuram" },
  { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu", district: "Madurai" },
  { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu", district: "Coimbatore" },
  { lat: 18.5204, lon: 73.8567, state: "Maharashtra", district: "Pune" },
];

// Find closest Indian city
const findClosestCity = (lat, lon) => {
  let closest = null;
  let minDist = Infinity;
  for (const city of INDIAN_CITIES) {
    const dLat = lat - city.lat;
    const dLon = lon - city.lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDist) {
      minDist = dist;
      closest = city;
    }
  }
  return closest;
};

// Reverse geocode using Nominatim (OpenStreetMap)
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await response.json();
    const addr = data.address || {};
    return {
      state: addr.state || addr.province || addr.region || '',
      district: addr.city_district || addr.district || addr.county || addr.city || addr.town || addr.village || addr.suburb || ''
    };
  } catch (e) {
    return null;
  }
};

export function useGeolocation() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const errMsg = "Geolocation is not supported by your browser.";
      console.error("[Geolocation] " + errMsg);
      setError(errMsg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log("[Geolocation] Success:", coords);
        setLocation(coords);
        
        // Try reverse geocoding first
        const geoResult = await reverseGeocode(coords.latitude, coords.longitude);
        console.log("[Geolocation] Reverse geocode result:", geoResult);
        
        if (geoResult && (geoResult.state || geoResult.district)) {
          setLocation(prev => ({ ...prev, ...geoResult }));
        } else {
          // Fallback to closest Indian city
          const city = findClosestCity(coords.latitude, coords.longitude);
          console.log("[Geolocation] Fallback city:", city);
          if (city) {
            setLocation(prev => ({ ...prev, state: city.state, district: city.district }));
          }
        }
        
        setLoading(false);
      },
      (err) => {
        const errMsg = err.code === err.PERMISSION_DENIED 
          ? "Location permission denied. Please enable in browser settings."
          : err.code === err.POSITION_UNAVAILABLE
          ? "Position unavailable."
          : err.code === err.TIMEOUT
          ? "Location request timed out."
          : "Unable to retrieve location. Please select manually.";
        console.error("[Geolocation] Error:", err.code, err.message);
        setError(errMsg);
        setLoading(false);
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, []);

  // Auto-detect on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { location, loading, error, detectLocation };
}
