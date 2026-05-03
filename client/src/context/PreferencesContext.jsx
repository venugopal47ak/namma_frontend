import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { locations, translations } from "../data/fallbackData";
import { haversineDistanceKm } from "../lib/utils";

const PreferencesContext = createContext(null);
const findKnownLocation = (candidate) =>
  locations.find(
    (item) => item.city === candidate?.city && item.area === candidate?.area
  );

const getInitialLocation = () => {
  const stored = localStorage.getItem("nammaserve_location");

  if (stored) {
    try {
      return findKnownLocation(JSON.parse(stored)) || locations[0];
    } catch (error) {
      return locations[0];
    }
  }

  return locations[0];
};

export const PreferencesProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("nammaserve_theme") || "light"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("nammaserve_language") || "EN"
  );
  const [location, setLocation] = useState(getInitialLocation);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("nammaserve_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("nammaserve_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("nammaserve_location", JSON.stringify(location));
  }, [location]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try reverse geocoding first to get a real area name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const detectedArea = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.village || "Unknown Area";
          const detectedCity = data.address.city || data.address.state_district || data.address.county || "Unknown City";

          // Find the nearest known location for filtering services
          let nearest = locations[0];
          let minDistance = Infinity;

          locations.forEach((loc) => {
            const distance = haversineDistanceKm(latitude, longitude, loc.lat, loc.lng);
            if (distance < minDistance) {
              minDistance = distance;
              nearest = loc;
            }
          });

          // Mix detected real-world name with nearest system location
          setLocation({
            ...nearest,
            area: detectedArea,
            city: detectedCity,
            lat: latitude,
            lng: longitude,
            isCustom: true
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          // Fallback to nearest system location
          let nearest = locations[0];
          let minDistance = Infinity;

          locations.forEach((loc) => {
            const distance = haversineDistanceKm(latitude, longitude, loc.lat, loc.lng);
            if (distance < minDistance) {
              minDistance = distance;
              nearest = loc;
            }
          });
          setLocation(nearest);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        console.error("Location detection error:", error);
        alert(`Location detection failed: ${error.message}. Please select your location manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const t = (key) => {
    const current = translations[language] || translations.EN;
    return key.split(".").reduce((value, segment) => value?.[segment], current) || key;
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      language,
      setLanguage,
      location,
      setLocation,
      locations,
      detectLocation,
      isDetecting,
      t
    }),
    [theme, language, location, isDetecting]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
