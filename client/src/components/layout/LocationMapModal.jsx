import { useEffect, useState, useCallback, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, MapPin, Navigation, Loader2, Check, Crosshair } from "lucide-react";
import { haversineDistanceKm } from "../../lib/utils";
import { locations } from "../../data/fallbackData";

// Fix for leaflet marker icons
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const LocationMapModal = ({ isOpen, onClose, onConfirm, initialLocation }) => {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const [position, setPosition] = useState([12.9692, 79.1452]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();
      if (data && data.address) {
        const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.village || "Unknown Area";
        const city = data.address.city || data.address.state_district || data.address.county || "Unknown City";
        setAddress(`${area}, ${city}`);
      } else {
        setAddress("Location selected");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setAddress("Unknown Location");
    } finally {
      setLoading(false);
    }
  };

  const updateMarker = (lat, lng) => {
    if (markerInstance.current) {
      markerInstance.current.setLatLng([lat, lng]);
    } else if (mapInstance.current) {
      markerInstance.current = L.marker([lat, lng]).addTo(mapInstance.current);
    }
    setPosition([lat, lng]);
  };

  // Initialize Map
  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapInstance.current) {
      const initialPos = initialLocation?.lat && initialLocation?.lng 
        ? [initialLocation.lat, initialLocation.lng] 
        : [12.9692, 79.1452];

      mapInstance.current = L.map(mapContainerRef.current, {
        center: initialPos,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker(initialPos).addTo(mapInstance.current);
      
      mapInstance.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        fetchAddress(lat, lng);
      });

      setPosition(initialPos);
      fetchAddress(initialPos[0], initialPos[1]);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [isOpen]);

  // Handle Search
  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery) {
      searchTimeout.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    updateMarker(lat, lon);
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lon], 15, { animate: true });
    }
    setAddress(result.display_name.split(",").slice(0, 2).join(", "));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleDetect = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          updateMarker(latitude, longitude);
          if (mapInstance.current) {
            mapInstance.current.setView([latitude, longitude], 15, { animate: true });
          }
          fetchAddress(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    }
  };

  const handleConfirm = () => {
    const lat = position[0];
    const lng = position[1];
    
    let nearest = locations[0];
    let minDistance = Infinity;
    locations.forEach((loc) => {
      const distance = haversineDistanceKm(lat, lng, loc.lat, loc.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = loc;
      }
    });

    const parts = address.split(", ");
    const area = parts[0] || "Custom Location";
    const city = parts[1] || nearest.city;

    onConfirm({
      ...nearest,
      area: area,
      city: city,
      lat,
      lng,
      isCustom: true,
      displayAddress: address
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-[650px] sm:rounded-[40px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/5 p-5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10 text-coral">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Select location</h2>
              <p className="text-xs text-slate-500">Pick your exact service area</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 transition hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute left-1/2 top-24 z-[9999] w-[calc(100%-40px)] -translate-x-1/2 max-w-md">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-coral transition-colors">
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </div>
            <input
              type="text"
              placeholder="Search area or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border-none bg-white/95 pl-12 pr-4 text-sm font-medium shadow-xl backdrop-blur-md outline-none ring-2 ring-transparent focus:ring-coral/20 dark:bg-slate-800/95 dark:text-white"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-800 ring-1 ring-black/5">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full items-start gap-3 rounded-xl p-3 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2 text-slate-600 dark:text-slate-300">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Body */}
        <div className="relative flex-1 bg-slate-100 dark:bg-slate-800">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Center crosshair for better precision if needed, but we use a movable marker */}
          </div>

          <button
            onClick={handleDetect}
            className="absolute bottom-6 right-6 z-[1000] flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-coral shadow-xl transition hover:scale-105 active:scale-95 dark:bg-slate-800"
            title="Detect my location"
          >
            <Navigation size={22} className={loading && !address ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/5 text-coral">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected Area</p>
                <p className="truncate font-bold text-slate-900 dark:text-white">
                  {loading && !address ? "Fetching location..." : address || "Pick a point on map"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !address}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-slate-900 sm:flex-none"
              >
                <Check size={18} />
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapModal;
