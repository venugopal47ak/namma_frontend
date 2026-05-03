import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  Layers3,
  TimerReset,
  Wallet,
  Settings,
  ShieldAlert
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/http";

import {
  acceptProviderBooking,
  completeProviderBooking,
  getProviderDashboardStats,
  rejectProviderBooking
} from "../api/providerDashboard";
import ProviderStatusBadge from "../components/admin/ProviderStatusBadge";
import SectionHeader from "../components/common/SectionHeader";
import {
  formatBookingLifecycleStatus,
  getNormalizedBookingStatus
} from "../lib/bookingStatus";
import { getProviderStatus } from "../lib/providerStatus";
import { formatCurrency, formatDateTime } from "../lib/utils";

const initialStats = {
  pendingCount: 0,
  acceptedCount: 0,
  completedCount: 0,
  totalRevenue: 0,
  avgResponseTime: 0,
  todaysEarnings: 0
};

const extractErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

const ProviderDashboardPage = () => {
  const [provider, setProvider] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(initialStats);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [actionBookingId, setActionBookingId] = useState("");

  const loadProvider = async () => {
    const { data } = await api.get("/providers/me");
    setProvider(data.provider);
    return data.provider;
  };

  const loadDashboardSnapshot = async (providerId) => {
    const [{ data: statsData }, { data: bookingData }] = await Promise.all([
      getProviderDashboardStats(providerId),
      api.get("/bookings/mine")
    ]);

    setDashboardStats((current) => ({
      ...current,
      ...statsData
    }));
    setBookings(bookingData.bookings || []);
  };

  const loadReviews = async () => {
    try {
      const { data } = await api.get("/providers/reviews");
      setReviews(data.reviews || []);
    } catch (error) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const verifyReview = async (reviewId) => {
    try {
      await api.put(`/providers/reviews/${reviewId}/verify`);
      await loadReviews();
      setFeedback({
        type: "success",
        text: "Review marked as verified."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    }
  };

  useEffect(() => {
    let isActive = true;

    const initializeDashboard = async () => {
      setDashboardLoading(true);

      try {
        const providerData = await loadProvider();

        if (!isActive || !providerData?._id) {
          return;
        }

        await Promise.all([loadDashboardSnapshot(providerData._id), loadReviews()]);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setProvider(null);
        setBookings([]);
        setDashboardStats(initialStats);
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
      } finally {
        if (isActive) {
          setDashboardLoading(false);
        }
      }
    };

    initializeDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!provider?._id) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadDashboardSnapshot(provider._id).catch(() => {
        // Silent background refresh failure; the next manual action or poll can recover.
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [provider?._id]);

  const providerStatus = getProviderStatus(provider);

  const stats = useMemo(
    () => [
      {
        label: "Pending requests",
        value: dashboardLoading ? "..." : dashboardStats.pendingCount,
        icon: Layers3
      },
      {
        label: "Accepted jobs",
        value: dashboardLoading ? "..." : dashboardStats.acceptedCount,
        icon: CheckCircle2
      },
      {
        label: "Jobs completed",
        value: dashboardLoading ? "..." : dashboardStats.completedCount,
        icon: Clock3
      },
      {
        label: "Revenue tracked",
        value: dashboardLoading ? "..." : formatCurrency(dashboardStats.totalRevenue),
        icon: IndianRupee
      },
      {
        label: "Today's earnings",
        value: dashboardLoading ? "..." : formatCurrency(dashboardStats.todaysEarnings),
        icon: Wallet
      },
      {
        label: "Avg response",
        value: dashboardLoading ? "..." : `${dashboardStats.avgResponseTime} mins`,
        icon: TimerReset
      }
    ],
    [dashboardLoading, dashboardStats]
  );

  const refreshAfterAction = async () => {
    if (!provider?._id) {
      return;
    }

    await Promise.all([loadDashboardSnapshot(provider._id), loadReviews()]);
  };

  const handleBookingAction = async (booking, action) => {
    const actionMap = {
      accept: {
        run: acceptProviderBooking,
        successMessage: "Booking accepted. Dashboard stats refreshed."
      },
      complete: {
        run: completeProviderBooking,
        successMessage: "Booking completed. Dashboard stats refreshed."
      },
      reject: {
        run: rejectProviderBooking,
        successMessage: "Booking rejected. Dashboard stats refreshed."
      }
    };

    const selectedAction = actionMap[action];

    if (!selectedAction) {
      return;
    }

    setActionBookingId(booking._id);

    try {
      await selectedAction.run(booking._id);
      await refreshAfterAction();
      setFeedback({
        type: "success",
        text: selectedAction.successMessage
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setActionBookingId("");
    }
  };

  const getStatusActions = (booking) => {
    const normalizedStatus = getNormalizedBookingStatus(booking);

    if (normalizedStatus === "pending") {
      return [
        {
          label: "Accept",
          tone: "bg-emerald-600 text-white",
          action: "accept"
        },
        {
          label: "Reject",
          tone: "bg-rose-600 text-white",
          action: "reject"
        }
      ];
    }

    if (normalizedStatus === "accepted") {
      return [
        {
          label: "Complete",
          tone: "bg-sky-600 text-white",
          action: "complete"
        }
      ];
    }

    return [];
  };

  return (
    <div className="section-shell space-y-8 py-10">
      <SectionHeader
        eyebrow="Provider desk"
        title="Manage incoming jobs and keep customers updated"
        description="Live dashboard metrics refresh automatically and update immediately after each booking action."
      />

      {feedback.text && (
        <div
          className={`rounded-[24px] px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-[28px] p-5">
              <Icon className="text-coral" />
              <p className="mt-4 font-display text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {provider && (
        <section className="glass-card rounded-[30px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-coral">Profile status</p>
              <h2 className="mt-2 font-display text-3xl font-bold">{provider.user?.name}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ProviderStatusBadge status={providerStatus} />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {[provider.area, provider.city].filter(Boolean).join(", ")}
                </p>
              </div>
              {providerStatus === "rejected" && provider.rejectionReason && (
                <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                  Rejection reason: {provider.rejectionReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 dark:bg-white/10">
                <p className="text-sm font-semibold">Pricing starts at</p>
                <p className="mt-2 text-2xl font-bold text-coral">
                  {formatCurrency(provider.pricingCatalog?.[0]?.basePrice || 0)}
                </p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <Settings size={16} />
                Edit Profile
              </Link>
            </div>

          </div>
        </section>
      )}

      <section className="grid gap-6">
        {dashboardLoading && !bookings.length ? (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            Loading live dashboard data...
          </div>
        ) : bookings.length ? (
          bookings.map((booking) => {
            const statusActions = getStatusActions(booking);
            const isSubmitting = actionBookingId === booking._id;

            return (
              <article key={booking._id} className="glass-card rounded-[30px] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-coral">
                      {booking.bookingCode}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold">
                      {booking.service?.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span>{booking.user?.name} | {formatDateTime(booking.scheduledAt)}</span>
                      {(booking.user?.strikes > 0 || booking.user?.warnings > 0) && (
                        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                          <ShieldAlert size={10} />
                          Reputation: {booking.user?.strikes}S / {booking.user?.warnings}W
                        </span>
                      )}
                    </p>

                  </div>
                  <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 dark:bg-white/10">
                    <p className="text-sm font-semibold">
                      {formatBookingLifecycleStatus(booking.bookingStatus)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(booking.pricing?.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {statusActions.map((entry) => (
                    <button
                      key={entry.action}
                      type="button"
                      onClick={() => handleBookingAction(booking, entry.action)}
                      disabled={isSubmitting}
                      className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${entry.tone}`}
                    >
                      {isSubmitting ? "Updating..." : entry.label}
                    </button>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            Once customers book you, the requests will appear here for quick status updates.
          </div>
        )}
      </section>

      <section id="reviews" className="glass-card rounded-[30px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-coral">Provider reviews</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Customer feedback</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Review sentiment and verification status for your completed jobs.
            </p>
          </div>
          <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 text-sm font-semibold dark:bg-white/10">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loadingReviews ? (
            <div className="text-center text-slate-500">Loading reviews...</div>
          ) : reviews.length ? (
            reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{review.user?.name || "Customer"}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {review.service?.title || "Service feedback"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        review.sentiment === "positive"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                          : review.sentiment === "negative"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
                            : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {review.sentiment}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        review.verifiedByProvider
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200"
                      }`}
                    >
                      {review.verifiedByProvider ? "Verified" : "Not verified"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  {review.comment || "No review comment provided."}
                </div>

                {!review.verifiedByProvider && (
                  <button
                    type="button"
                    onClick={() => verifyReview(review._id)}
                    className="mt-4 inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    Mark verified
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-[28px] bg-slate-50 p-10 text-center text-slate-600 dark:bg-white/5 dark:text-slate-300">
              No reviews yet. Once customers complete jobs and leave feedback, reviews will
              appear here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProviderDashboardPage;
