import {
  ArrowRight,
  Clock3,
  MessageCircleMore,
  MoveRight,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import FallbackImage, { imageFallbacks } from "./FallbackImage";
import { formatCurrency } from "../../lib/utils";

export const ServiceCard = ({ service, actionLabel = "View service", onAction }) => {
  const serviceImage =
    service.image ||
    service.coverImage ||
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="glass-card group overflow-hidden rounded-[28px]">
      <div className="relative h-48 overflow-hidden">
        <FallbackImage
          src={serviceImage}
          fallbackSrc={imageFallbacks.service}
          alt={service.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
          {service.category}
        </span>
        <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white">
          from {formatCurrency(service.basePrice)}
        </span>
      </div>
    </div>
    <div className="space-y-4 p-5">
      <div>
        <h3 className="font-display text-xl font-bold">{service.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {service.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(service.tags || []).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:translate-x-0.5 dark:bg-white dark:text-slate-900"
      >
        {actionLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  </article>
  );
};

export const ProviderCard = ({ provider, compact = false }) => {
  const phoneNumber = provider.whatsappNumber || provider.alternatePhone || provider.user?.phone;

  return (
    <article className="glass-card overflow-hidden rounded-[28px]">
      <div className={`${compact ? "grid md:grid-cols-[220px_1fr]" : ""}`}>
        <div className={`${compact ? "h-full" : "h-56"} relative`}>
          <FallbackImage
            src={provider.coverImage}
            fallbackSrc={imageFallbacks.banner}
            alt={provider.user?.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              {provider.serviceCategories?.[0]}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                provider.availableNow
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-900/70 text-white"
              }`}
            >
              {provider.availableNow ? "Available now" : "Busy"}
            </span>
          </div>

          <div className="absolute -bottom-10 left-6 z-10 h-20 w-20 rounded-full border-4 border-white bg-white shadow-soft dark:border-slate-900 dark:bg-slate-900 overflow-hidden">
            <FallbackImage
              src={provider.avatar}
              fallbackSrc={imageFallbacks.avatar}
              alt={provider.user?.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-4 p-5 pt-12">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-bold">{provider.user?.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {provider.area}, {provider.city}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                starts from
              </p>
              <p className="text-lg font-bold text-coral">
                {formatCurrency(provider.pricingCatalog?.[0]?.basePrice || 0)}
              </p>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {provider.headline}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
              <Star size={15} className="text-amber-500" />
              {provider.ratingAvg} ({provider.reviewCount})
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
              <Clock3 size={15} className="text-teal" />
              {provider.responseTimeMinutes} mins
            </span>
            {provider.distanceKm != null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                {provider.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                Call now
              </a>
            )}
            <a
              href={provider.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <MessageCircleMore size={16} />
              Chat on WhatsApp
            </a>
            <Link
              to={`/providers/${provider._id}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold dark:border-white/15"
            >
              View profile
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
