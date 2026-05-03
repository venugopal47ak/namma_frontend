import { BarChart3, CheckCircle2, Clock3, IndianRupee } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/http";
import AdminPageShell from "../components/admin/AdminPageShell";
import FeedbackBanner from "../components/common/FeedbackBanner";
import { extractErrorMessage } from "../lib/httpError";
import { formatCurrency, formatDateTime } from "../lib/utils";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadBookings = async () => {
    const { data } = await api.get("/admin/bookings");
    setBookings(data.bookings || []);
    return data.bookings || [];
  };

  useEffect(() => {
    loadBookings()
      .catch((error) => {
        setBookings([]);
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const query = searchQuery.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.service?.title?.toLowerCase().includes(query) ||
        booking.user?.name?.toLowerCase().includes(query) ||
        booking.provider?.user?.name?.toLowerCase().includes(query) ||
        booking.bookingCode?.toLowerCase().includes(query)
    );
  }, [bookings, searchQuery]);

  const bookingStats = useMemo(() => {
    const completedBookings = bookings.filter(
      (booking) => String(booking.bookingStatus || "").toLowerCase() === "completed"
    ).length;
    const activeBookings = bookings.length - completedBookings;
    const paidRevenue = bookings.reduce(
      (sum, booking) =>
        booking.paymentStatus === "PAID" ? sum + (booking.pricing?.totalAmount || 0) : sum,
      0
    );

    return [
      {
        label: "Total bookings",
        value: bookings.length,
        icon: BarChart3
      },
      {
        label: "Active bookings",
        value: activeBookings,
        icon: Clock3
      },
      {
        label: "Completed jobs",
        value: completedBookings,
        icon: CheckCircle2
      },
      {
        label: "Paid revenue",
        value: formatCurrency(paidRevenue),
        icon: IndianRupee
      }
    ];
  }, [bookings]);

  return (
    <AdminPageShell
      title="Booking operations"
      description="Track every customer order with service details, participants, schedule timing, and payment status."
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bookingStats.map((stat) => {
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

      <div className="glass-card rounded-[28px] p-4 shadow-soft">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search bookings by code, service, customer, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border border-transparent bg-slate-100/80 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-coral/20 focus:bg-white dark:bg-white/10 dark:text-white dark:focus:bg-white/20"
          />
        </div>
      </div>

      <section className="space-y-4">
        {loading ? (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            Loading bookings...
          </div>
        ) : filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <article key={booking._id} className="glass-card rounded-[30px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-coral">
                    {booking.bookingCode || "Booking"}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">
                    {booking.service?.title || "Service booking"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {booking.user?.name || "Customer"} with{" "}
                    {booking.provider?.user?.name || "Provider"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Scheduled for {formatDateTime(booking.scheduledAt)}
                  </p>
                </div>

                <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 dark:bg-white/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-coral">
                    {booking.bookingStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Payment: {booking.paymentStatus}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(booking.pricing?.totalAmount)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            No bookings found.
          </div>
        )}
      </section>
    </AdminPageShell>
  );
};

export default AdminBookingsPage;
