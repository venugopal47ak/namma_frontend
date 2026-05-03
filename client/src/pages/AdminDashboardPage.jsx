import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  Settings2,
  Shield,
  UsersRound,
  Wrench,
  AlertCircle
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/http";
import { getAdminProviders } from "../api/providerApproval";
import AdminPageShell from "../components/admin/AdminPageShell";
import ProviderStatusBadge from "../components/admin/ProviderStatusBadge";
import { getProviderStatus } from "../lib/providerStatus";
import { formatCurrency, formatDateTime } from "../lib/utils";

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const [dashboardResponse, providersResponse, bookingsResponse, settingsResponse] =
          await Promise.all([
            api.get("/admin/dashboard"),
            getAdminProviders(),
            api.get("/admin/bookings"),
            api.get("/admin/settings")
          ]);

        if (!isActive) {
          return;
        }

        setDashboard(dashboardResponse.data);
        setProviders(providersResponse.data.providers || []);
        setBookings(bookingsResponse.data.bookings || []);
        setSettings(settingsResponse.data.settings || null);
      } catch {
        if (!isActive) {
          return;
        }

        setDashboard(null);
        setProviders([]);
        setBookings([]);
        setSettings(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const paidBookingsCount = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === "PAID").length,
    [bookings]
  );

  const overviewCards = useMemo(() => {
    if (!dashboard?.metrics) {
      return [];
    }

    return [
      {
        label: "Users",
        value: dashboard.metrics.users,
        icon: UsersRound,
        to: "/admin/users",
        helper: "Open page"
      },
      {
        label: "Providers",
        value: dashboard.metrics.providers,
        icon: Wrench,
        to: "/admin/providers",
        helper: "Review queue"
      },
      {
        label: "Bookings",
        value: dashboard.metrics.bookings,
        icon: BarChart3,
        to: "/admin/bookings",
        helper: "Open page"
      },
      {
        label: "Reviews",
        value: dashboard.metrics.reviews,
        icon: MessageSquare,
        to: "/admin/reviews",
        helper: "Open page"
      },
      {
        label: "Revenue",
        value: formatCurrency(dashboard.metrics.revenue),
        icon: Shield,
        helper: `${paidBookingsCount} paid booking${paidBookingsCount === 1 ? "" : "s"}`
      },
      {
        label: "Complaints",
        value: dashboard.metrics.complaints || 0,
        icon: AlertCircle,
        to: "/admin/complaints",
        helper: "Manage issues"
      }
    ];

  }, [dashboard, paidBookingsCount]);

  const pendingProviders = useMemo(
    () => providers.filter((provider) => getProviderStatus(provider) === "pending").slice(0, 4),
    [providers]
  );

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);

  return (
    <AdminPageShell
      title="Platform control center"
      description="Use the overview as your launch point, then open dedicated pages for providers, users, bookings, reviews, and settings."
    >
      {loading && !dashboard ? (
        <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
          Loading admin overview...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {overviewCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <Icon className="text-coral" />
                  <p className="mt-4 font-display text-3xl font-bold">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.label}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.helper}
                  </p>
                </>
              );

              return card.to ? (
                <Link
                  key={card.label}
                  to={card.to}
                  className="glass-card rounded-[28px] p-5 transition-transform hover:scale-[1.01]"
                >
                  {content}
                </Link>
              ) : (
                <div key={card.label} className="glass-card rounded-[28px] p-5">
                  {content}
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="glass-card rounded-[30px] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Wrench className="text-coral" />
                  <div>
                    <h2 className="font-display text-3xl font-bold">Provider queue</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Jump into the full approvals page when you are ready to review details.
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/providers"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold dark:border-white/10"
                >
                  Manage providers
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-3">
                {pendingProviders.length ? (
                  pendingProviders.map((provider) => (
                    <div
                      key={provider._id}
                      className="rounded-[24px] bg-slate-100/80 p-4 dark:bg-white/10"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{provider.user?.name}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {(provider.serviceCategories || []).join(", ") || "No service added"} |{" "}
                            {[provider.area, provider.city].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <ProviderStatusBadge status="pending" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-slate-100/80 p-6 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    No providers are waiting for approval right now.
                  </div>
                )}
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Settings2 className="text-coral" />
                  <div>
                    <h2 className="font-display text-3xl font-bold">Platform snapshot</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Keep an eye on support channels and fee settings before opening the
                      full config screen.
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/settings"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold dark:border-white/10"
                >
                  Open settings
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Support phone
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {settings?.supportPhone || "Not set"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Support email
                  </p>
                  <p className="mt-3 break-all text-xl font-bold text-slate-900 dark:text-white">
                    {settings?.supportEmail || "Not set"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Platform fee
                    </p>
                    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                      {settings?.platformFeePercent || 0}%
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Paid bookings
                    </p>
                    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                      {paidBookingsCount}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="glass-card rounded-[30px] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-coral" />
                <div>
                  <h2 className="font-display text-3xl font-bold">Latest bookings</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Recent jobs stay visible here so you can jump into the full bookings page
                    only when you need deeper detail.
                  </p>
                </div>
              </div>

              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold dark:border-white/10"
              >
                Open bookings
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentBookings.length ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="rounded-[24px] bg-slate-100/80 p-4 dark:bg-white/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {booking.service?.title || "Service booking"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {booking.user?.name || "Customer"} with{" "}
                          {booking.provider?.user?.name || "Provider"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(booking.scheduledAt)}
                        </p>
                      </div>

                      <div className="rounded-[20px] bg-white/80 px-3 py-2 text-right dark:bg-slate-950/40">
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-coral">
                          {booking.bookingStatus}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {formatCurrency(booking.pricing?.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-slate-100/80 p-6 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  No bookings available yet.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AdminPageShell>
  );
};

export default AdminDashboardPage;
