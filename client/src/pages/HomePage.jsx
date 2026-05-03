import {
  ArrowRight,
  MapPin,
  MoveRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/http";
import { ServiceCard } from "../components/common/Cards";
import SectionHeader from "../components/common/SectionHeader";
import {
  fallbackServices,
  heroSlides,
  offerBanners,
  trustStats
} from "../data/fallbackData";
import { usePreferences } from "../context/PreferencesContext";
import { formatCurrency } from "../lib/utils";

const categoryIcons = {
  Electrician: Zap,
  Plumber: ShieldCheck,
  Mechanic: Sparkles,
  "AC Repair": Star,
  "Appliance Repair": Users,
  Cleaning: ShieldCheck
};

const HomePage = () => {
  const navigate = useNavigate();
  const { location, t } = usePreferences();
  const [activeSlide, setActiveSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [featuredServices, setFeaturedServices] = useState(fallbackServices.slice(0, 4));

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      4800
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get("/services/featured");

        setFeaturedServices(
          data.services?.length
            ? data.services
            : fallbackServices.slice(0, 4)
        );
      } catch (error) {
        setFeaturedServices(fallbackServices.slice(0, 4));
      }
    };

    loadData();
  }, [location]);

  const categories = useMemo(
    () =>
      fallbackServices.map((service) => ({
        name: service.category,
        price: service.basePrice
      })),
    []
  );

  const handleSearch = () => {
    navigate(`/services?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="space-y-16 pt-8">
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="pill">
              <MapPin size={15} className="text-coral" />
              Serving {location.area}, {location.city}
            </span>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {heroSlides[activeSlide].description}
              </p>
            </div>
            <div className="glass-card rounded-[28px] p-3 shadow-halo">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("home.searchPlaceholder")}
                    className="h-14 w-full rounded-2xl border border-transparent bg-slate-100/80 pl-12 pr-4 text-sm outline-none placeholder:text-slate-400 dark:bg-white/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="h-14 rounded-2xl bg-ink px-6 font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Find
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Electrician", "AC Repair", "Plumber", "Mechanic"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => navigate(`/services?search=${encodeURIComponent(item)}`)}
                    className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-soft dark:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="pill">
                <ShieldCheck size={16} className="text-teal" />
                Verified services
              </span>
              <span className="pill">
                <Sparkles size={16} className="text-amber-500" />
                Flexible pricing
              </span>
              <span className="pill">
                <Users size={16} className="text-coral" />
                Instant confirmation
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[36px] shadow-halo">
              <img
                src={heroSlides[activeSlide].image}
                alt={heroSlides[activeSlide].title}
                className="h-[520px] w-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${heroSlides[activeSlide].accent}`}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="glass-card rounded-[28px] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral">
                    {heroSlides[activeSlide].eyebrow}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Fast service
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold">15 min</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Starting price
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold">
                        {formatCurrency(249)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Fast match
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold">Instant results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition ${
                    index === activeSlide ? "w-14 bg-ink dark:bg-white" : "w-8 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="Explore"
          title={t("home.categoriesTitle")}
          description="Urban Company polish, but with direct local availability and transparent starter prices."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || Sparkles;
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => navigate(`/services?search=${encodeURIComponent(category.name)}`)}
                className="glass-card group flex items-center gap-4 rounded-[26px] p-4 text-left transition hover:-translate-y-1"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-coral/15 to-teal/15 text-coral">
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl font-bold">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    from {formatCurrency(category.price)}
                  </p>
                </div>
                <MoveRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="glass-card rounded-[32px] p-8">
          <SectionHeader
            eyebrow="Trust"
            title={t("home.trustTitle")}
            description="The experience is premium, but the network is neighborhood-first and built for fast coordination."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[26px] bg-gradient-to-br from-white to-slate-100 p-6 dark:from-white/10 dark:to-white/5"
              >
                <p className="font-display text-4xl font-bold">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="Hot right now"
          title={t("home.featuredTitle")}
          description="Most booked essentials with transparent starting prices and an easy path to the right service."
          action={
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold dark:border-white/10"
            >
              See all
              <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onAction={() => navigate(`/providers/service/${encodeURIComponent(service.category)}`)}
            />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeader
          eyebrow="Offers"
          title="Promotions that actually help you book faster"
          description="Sliding launch offers, cash-on-service convenience, and fast confirmation."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {offerBanners.map((offer) => (
            <article
              key={offer.title}
              className={`overflow-hidden rounded-[30px] bg-gradient-to-br ${offer.color} p-6 text-slate-900 shadow-soft`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Launch offer</p>
              <h3 className="mt-3 font-display text-3xl font-bold">{offer.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6">{offer.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
