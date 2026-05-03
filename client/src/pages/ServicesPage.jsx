import { Search, SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/http";
import { ServiceCard } from "../components/common/Cards";
import SectionHeader from "../components/common/SectionHeader";
import { fallbackServices } from "../data/fallbackData";
import { usePreferences } from "../context/PreferencesContext";

const ServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const { location } = usePreferences();
  const [search, setSearch] = useState(initialSearch);
  const [services, setServices] = useState(fallbackServices);
  const [activeCategory, setActiveCategory] = useState(initialSearch);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await api.get("/services", {
          params: deferredSearch ? { search: deferredSearch } : {}
        });
        setServices(data.services || []);
      } catch (error) {
        setServices([]);
      }
    };

    loadServices();
  }, [deferredSearch]);

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services.length ? services : fallbackServices;
    const query = search.toLowerCase();
    return services.filter(
      (service) =>
        service.title?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query)
    );
  }, [services, search]);

  useEffect(() => {
    setSearchParams(search ? { search } : {}, { replace: true });
  }, [search, setSearchParams]);

  const categories = useMemo(
    () => [...new Set(fallbackServices.map((service) => service.category))],
    []
  );

  return (
    <div className="section-shell space-y-12 pt-10">
      <section className="glass-card rounded-[36px] p-6 sm:p-8">
        <SectionHeader
          eyebrow="Browse"
          title="Find the right service for your need"
          description="Search by need, filter by category, and choose the best match quickly."
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search electrician, plumber, washing machine..."
              className="h-14 w-full rounded-2xl border border-transparent bg-slate-100/80 pl-12 pr-4 text-sm outline-none dark:bg-white/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill">
              <SlidersHorizontal size={16} />
              {location.area}, {location.city}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              !activeCategory
                ? "bg-ink text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 dark:bg-white/10"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setSearch(category);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === category
                  ? "bg-ink text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Catalog"
          title="Service categories"
          description="Polished booking cards for the essentials people search most, with cleaner pricing than traditional marketplaces."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.length ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onAction={() =>
                  navigate(`/providers/service/${encodeURIComponent(service.category)}`)
                }
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-lg font-bold text-slate-400">
                No services found matching "{search}"
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default ServicesPage;
