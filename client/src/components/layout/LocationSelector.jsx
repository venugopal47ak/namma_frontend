import { Map, MapPin, Navigation, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "../../context/PreferencesContext";
import LocationMapModal from "./LocationMapModal";

const LocationSelector = ({ isMobile = false, onClose }) => {
  const {
    location,
    setLocation,
    locations,
    detectLocation,
    isDetecting
  } = usePreferences();
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const searchRef = useRef(null);

  const cities = useMemo(
    () => [...new Set(locations.map((item) => item.city))],
    [locations]
  );

  const filteredAreas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return locations.filter(l => l.city === location.city);
    return locations.filter(
      (l) =>
        l.area.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
    );
  }, [searchQuery, locations, location.city]);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleSelect = (loc) => {
    setLocation(loc);
    setShowSearch(false);
    setSearchQuery("");
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <LocationMapModal
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          onConfirm={handleSelect}
          initialLocation={location}
        />
        
        <div className="grid gap-2">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            District
          </label>
          <select
            value={location.city}
            onChange={(e) => {
              const firstArea = locations.find((l) => l.city === e.target.value);
              if (firstArea) setLocation(firstArea);
            }}
            className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/5"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid gap-2">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Area
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search your area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-ink/10 bg-white pl-12 pr-4 outline-none dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-2xl border border-ink/5 bg-slate-50/50 p-2 dark:border-white/5 dark:bg-white/5">
          {filteredAreas.map((loc) => (
            <button
              key={`${loc.city}-${loc.area}`}
              onClick={() => handleSelect(loc)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white dark:hover:bg-white/5 ${
                location.area === loc.area ? "font-bold text-coral" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <MapPin size={14} className={location.area === loc.area ? "text-coral" : "text-slate-400"} />
              {loc.area}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={detectLocation}
            disabled={isDetecting}
            className="flex items-center justify-center gap-2 rounded-2xl bg-coral/10 py-3 text-sm font-bold text-coral transition hover:bg-coral/20 disabled:opacity-50"
          >
            <Navigation size={16} className={isDetecting ? "animate-pulse" : ""} />
            {isDetecting ? "Detecting..." : "Detect"}
          </button>
          <button
            onClick={() => setMapOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <Map size={16} />
            Select on map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 rounded-full bg-slate-100/80 px-2 py-1.5 dark:bg-white/5">
      <LocationMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={handleSelect}
        initialLocation={location}
      />

      <select
        value={location.city}
        onChange={(e) => {
          const firstArea = locations.find((l) => l.city === e.target.value);
          if (firstArea) setLocation(firstArea);
        }}
        className="bg-transparent px-2 text-xs font-bold outline-none text-slate-700 dark:text-slate-200"
      >
        {cities.map((city) => (
          <option key={city} value={city} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
            {city}
          </option>
        ))}
      </select>

      <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-1" />

      <div className="relative">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-2 py-0.5 text-xs font-bold text-slate-700 transition hover:text-coral dark:text-slate-200"
        >
          <MapPin size={14} className="text-coral" />
          <span className="max-w-[120px] truncate">{isDetecting ? "Detecting..." : location.area}</span>
        </button>

        {showSearch && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-3xl bg-white p-4 shadow-halo ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-white/10">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-ink/5 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-coral/30 dark:bg-white/5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto pr-1">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    detectLocation();
                    setShowSearch(false);
                  }}
                  disabled={isDetecting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-coral/5 px-3 py-2.5 text-[10px] font-bold text-coral transition hover:bg-coral/10 disabled:opacity-50"
                >
                  <Navigation size={12} className={isDetecting ? "animate-pulse" : ""} />
                  {isDetecting ? "Wait..." : "Detect"}
                </button>
                <button
                  onClick={() => {
                    setMapOpen(true);
                    setShowSearch(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white"
                >
                  <Map size={12} />
                  Select on map
                </button>
              </div>

              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Popular areas in {location.city}
              </p>

              <div className="grid gap-1">
                {filteredAreas.map((loc) => (
                  <button
                    key={`${loc.city}-${loc.area}`}
                    onClick={() => handleSelect(loc)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                      location.area === loc.area ? "bg-slate-50 font-bold text-coral dark:bg-white/5" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <MapPin size={14} className={location.area === loc.area ? "text-coral" : "text-slate-400"} />
                    <div className="text-left">
                      <p className="font-bold">{loc.area}</p>
                      <p className="text-[10px] opacity-60">{loc.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showSearch && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default LocationSelector;
