import { LoaderCircle, ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/http";
import { ProviderCard } from "../components/common/Cards";
import SectionHeader from "../components/common/SectionHeader";

const ServiceProvidersPage = () => {
  const { service, serviceName } = useParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const decodedServiceName = decodeURIComponent(service || serviceName || "").trim();

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          `/providers/by-service/${encodeURIComponent(decodedServiceName)}`
        );

        if (!isMounted) return;

        setProviders(data.providers || []);
      } catch (fetchError) {
        if (!isMounted) return;
        setError(
          fetchError.response?.data?.message || fetchError.message ||
            "Unable to load providers for this service."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!decodedServiceName) {
      setLoading(false);
      setProviders([]);
      return;
    }

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [decodedServiceName]);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const query = searchQuery.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.user?.name?.toLowerCase().includes(query) ||
        provider.bio?.toLowerCase().includes(query) ||
        provider.headline?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query) ||
        provider.area?.toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  return (
    <div className="section-shell space-y-10 pt-10">
      <section className="glass-card rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader
            eyebrow="Service"
            title={`Providers for ${decodedServiceName}`}
            description="Browse local providers offering this service, with direct contact and WhatsApp chat options."
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provider name or location..."
                className="h-12 w-full rounded-full border border-transparent bg-slate-100/80 pl-11 pr-4 text-sm outline-none transition-all focus:border-coral/20 focus:bg-white dark:bg-white/10 dark:focus:bg-white/20 sm:w-64"
              />
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold dark:border-white/10"
            >
              <ArrowLeft size={16} />
              Back to services
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="glass-card rounded-[36px] p-12 text-center">
            <LoaderCircle className="mx-auto mb-4 animate-spin text-ink" size={32} />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading providers...
            </p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-[36px] p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredProviders.length ? (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>
          </>
        ) : (
          <div className="glass-card rounded-[36px] p-12 text-center">
            <p className="text-lg font-semibold">
              {searchQuery
                ? "No providers match your search."
                : "No providers available for this service yet."}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {searchQuery
                ? "Try a different search term."
                : "Try another service or check back later."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceProvidersPage;
