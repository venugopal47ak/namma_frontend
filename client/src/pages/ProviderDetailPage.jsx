import {
  Clock3,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
  Star,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/http";
import FallbackImage, {
  imageFallbacks
} from "../components/common/FallbackImage";
import SectionHeader from "../components/common/SectionHeader";
import { fallbackProviders, fallbackServices } from "../data/fallbackData";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { loadRazorpayScript } from "../lib/razorpay";

const ProviderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const fallbackProvider = fallbackProviders[0];
  const [provider, setProvider] = useState(fallbackProvider);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceId: "",
    scheduledAt: "",
    preferredSlot: "Morning",
    addressLine1: "",
    area: fallbackProvider.area,
    city: fallbackProvider.city,
    notes: "",
    paymentMethod: "CASH"
  });

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const [{ data: providerData }, { data: reviewData }] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/reviews/provider/${id}`)
        ]);

        setProvider(providerData.provider);
        setReviews(reviewData.reviews || []);
        setBookingForm((current) => ({
          ...current,
          area: providerData.provider.area || current.area,
          city: providerData.provider.city || current.city,
          serviceId:
            searchParams.get("service") ||
            providerData.provider.services?.[0]?._id ||
            providerData.provider.pricingCatalog?.[0]?.service ||
            ""
        }));
      } catch (loadError) {
        const fallback = fallbackProviders.find((item) => item._id === id) || fallbackProviders[0];
        setProvider(fallback);
        setBookingForm((current) => ({
          ...current,
          area: fallback.area || current.area,
          city: fallback.city || current.city,
          serviceId: fallbackServices[0]._id
        }));
      }
    };

    loadProvider();
  }, [id, searchParams]);

  const serviceOptions = useMemo(() => {
    if (provider?.services?.length) {
      return provider.services;
    }

    return fallbackServices.filter((service) =>
      provider.serviceCategories?.includes(service.category)
    );
  }, [provider]);

  const selectedService = serviceOptions.find(
    (service) => String(service._id) === String(bookingForm.serviceId)
  );

  const handleInputChange = (event) => {
    setBookingForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      navigate("/auth", { state: { from: `/providers/${id}` } });
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/bookings", {
        providerId: provider._id,
        serviceId: bookingForm.serviceId,
        scheduledAt: bookingForm.scheduledAt,
        preferredSlot: bookingForm.preferredSlot,
        notes: bookingForm.notes,
        paymentMethod: bookingForm.paymentMethod,
        address: {
          line1: bookingForm.addressLine1,
          area: bookingForm.area,
          city: bookingForm.city
        }
      });

      setSuccess("Booking request sent successfully! You can track status and pay once the job is completed.");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (bookingError) {
      setError(bookingError.response?.data?.message || bookingError.message);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-2 z-[50] flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-coral dark:bg-slate-800/80 dark:text-slate-300 sm:left-6 sm:top-0"
        title="Go back"
      >
        <X size={20} />
      </button>

      <section className="space-y-8">
        <div className="glass-card overflow-hidden rounded-[36px]">
          <div className="relative h-72">
            <FallbackImage
              src={provider.coverImage}
              fallbackSrc={imageFallbacks.banner}
              alt={provider.user?.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900">
              {provider.serviceCategories?.join(", ")}
            </div>

            <div className="absolute -bottom-12 left-8 z-10 h-24 w-24 rounded-full border-4 border-white bg-white shadow-soft dark:border-slate-950 dark:bg-slate-950 overflow-hidden">
              <FallbackImage
                src={provider.avatar}
                fallbackSrc={imageFallbacks.avatar}
                alt={provider.user?.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-5 p-6 pt-16">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold tracking-tight">
                  {provider.user?.name}
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  {provider.headline}
                </p>
              </div>
              <a
                href={provider.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white"
              >
                <MessageCircleMore size={18} />
                Chat with provider
              </a>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="pill">
                <Star size={15} className="text-amber-500" />
                {provider.ratingAvg} ({provider.reviewCount} reviews)
              </span>
              <span className="pill">
                <Clock3 size={15} className="text-teal" />
                {provider.responseTimeMinutes} mins response
              </span>
              <span className="pill">
                <MapPin size={15} className="text-coral" />
                {provider.area}, {provider.city}
              </span>
              <span className="pill">
                <ShieldCheck size={15} className="text-teal" />
                {provider.jobsCompleted} jobs completed
              </span>
            </div>

            <div className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10">
              <p className="font-semibold">About this provider</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {provider.bio || provider.headline}
              </p>
            </div>
          </div>
        </div>

        <section className="glass-card rounded-[36px] p-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Flexible service pricing"
            description="Users see a clear starting price and can still coordinate parts or on-site specifics directly with the technician."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {(provider.pricingCatalog || []).map((item, index) => {
              const serviceLabel =
                serviceOptions.find((service) => String(service._id) === String(item.service))
                  ?.title || selectedService?.title || `Service ${index + 1}`;
              return (
                <div
                  key={`${item.service || index}-${index}`}
                  className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10"
                >
                  <p className="font-semibold">{serviceLabel}</p>
                  <p className="mt-2 text-2xl font-bold text-coral">
                    {formatCurrency(item.basePrice)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.offerNote || "Final quote can be tuned after direct inspection."}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-card rounded-[36px] p-6">
          <SectionHeader
            eyebrow="Reviews"
            title="What customers say"
            description="Ratings and written feedback are shown here to help users book with confidence."
          />
          <div className="space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coral/15 font-semibold text-coral">
                      {review.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-semibold">{review.user?.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {review.rating}/5
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {review.comment}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] bg-slate-100/80 p-5 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                Reviews will appear here after completed bookings.
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="glass-card sticky top-28 h-fit rounded-[36px] p-6">
        <SectionHeader
          eyebrow="Book now"
          title="Reserve a slot"
          description="Choose your service, pick a time, and pay online or on service."
        />

        <form className="space-y-4" onSubmit={handleBooking}>
          <div>
            <label className="mb-2 block text-sm font-semibold">Service</label>
            <select
              name="serviceId"
              value={bookingForm.serviceId}
              onChange={handleInputChange}
              required
              className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
            >
              <option value="">Select a service</option>
              {serviceOptions.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Date & time</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={bookingForm.scheduledAt}
                onChange={handleInputChange}
                required
                className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Slot</label>
              <select
                name="preferredSlot"
                value={bookingForm.preferredSlot}
                onChange={handleInputChange}
                className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
              >
                {["Morning", "Afternoon", "Evening"].map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Address</label>
            <input
              name="addressLine1"
              value={bookingForm.addressLine1}
              onChange={handleInputChange}
              placeholder="Flat / street / landmark"
              required
              className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Area</label>
              <input
                name="area"
                value={bookingForm.area}
                onChange={handleInputChange}
                required
                className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">City</label>
              <input
                name="city"
                value={bookingForm.city}
                onChange={handleInputChange}
                required
                className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Notes</label>
            <textarea
              name="notes"
              value={bookingForm.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Issue details, preferred time, gate code..."
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Payment method</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "CASH", label: "Cash on service" },
                { value: "RAZORPAY", label: "Pay online" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setBookingForm((current) => ({
                      ...current,
                      paymentMethod: option.value
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                    bookingForm.paymentMethod === option.value
                      ? "border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-ink/10 dark:border-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10">
            <p className="text-sm uppercase tracking-wide text-slate-500">Estimated total</p>
            <p className="mt-2 font-display text-4xl font-bold text-coral">
              {formatCurrency((selectedService?.basePrice || provider.pricingCatalog?.[0]?.basePrice || 0) + 99)}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Includes a base visit fee. Final parts cost can be discussed directly.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-ink px-4 font-semibold text-white disabled:opacity-70 dark:bg-white dark:text-slate-900"
          >
            {submitting ? "Processing..." : "Book service"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProviderDetailPage;
