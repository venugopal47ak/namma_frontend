import { Calendar, Clock, Edit3, MessageCircle, Phone, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/http";
import SectionHeader from "../components/common/SectionHeader";
import ReviewModal from "../components/common/ReviewModal";
import { createBookingShareLink, formatCurrency, formatDateTime } from "../lib/utils";

const UserDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [editForm, setEditForm] = useState({ scheduledAt: "", notes: "" });


  const loadBookings = async () => {
    const { data } = await api.get("/bookings/mine");
    setBookings(data.bookings || []);
  };

  useEffect(() => {
    loadBookings().catch(() => setBookings([]));
  }, []);

  const handleReviewSuccess = () => {
    setFeedback("Review submitted successfully.");
    loadBookings();
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setFeedback("Booking cancelled successfully.");
      loadBookings();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelLoading(null);
    }
  };

  const handleUpdateBooking = async (event) => {
    event.preventDefault();
    try {
      await api.patch(`/bookings/${editingBooking._id}`, editForm);
      setFeedback("Booking updated successfully.");
      setEditingBooking(null);
      loadBookings();
    } catch (error) {
      setFeedback(error.response?.data?.message || "Failed to update booking.");
    }
  };


  return (
    <div className="section-shell space-y-8 py-10">
      <SectionHeader
        eyebrow="Dashboard"
        title="Track bookings, share updates, and rate completed work"
        description="Users can see status changes, open a quick WhatsApp share, and review technicians once the job is completed."
      />

      {feedback && (
        <div className="rounded-[24px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
          {feedback}
        </div>
      )}

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <article key={booking._id} className="glass-card rounded-[30px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-coral">
                  {booking.bookingCode}
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  {booking.service?.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Scheduled for {formatDateTime(booking.scheduledAt)} with{" "}
                  {booking.provider?.user?.name}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 text-right dark:bg-white/10">
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-2 text-lg font-bold">{booking.bookingStatus}</p>
                <p className="text-sm text-slate-500">{formatCurrency(booking.pricing?.totalAmount)}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              {(() => {
                const rawPhone = booking.provider?.user?.phone || "";
                const cleanPhone = rawPhone.replace(/\D/g, "");
                const hasPhone = cleanPhone.length > 0;
                
                const whatsappUrl = hasPhone 
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hello regarding my booking ID ${booking.bookingCode}`
                    )}`
                  : "#";
                
                const phoneUrl = hasPhone ? `tel:${cleanPhone}` : "#";

                return (
                  <>
                    <a
                      href={whatsappUrl}
                      target={hasPhone ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label="Chat on WhatsApp"
                      title={hasPhone ? "Chat on WhatsApp" : "Contact not available"}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 ${
                        hasPhone ? "bg-[#25D366]" : "cursor-not-allowed bg-slate-300 opacity-60"
                      }`}
                      onClick={(e) => !hasPhone && e.preventDefault()}
                    >
                      <MessageCircle size={22} fill="currentColor" />
                    </a>
                    
                    <a
                      href={phoneUrl}
                      aria-label="Call provider"
                      title={hasPhone ? "Call provider" : "Contact not available"}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-110 ${
                        hasPhone ? "bg-[#3b82f6]" : "cursor-not-allowed bg-slate-300 opacity-60"
                      }`}
                      onClick={(e) => !hasPhone && e.preventDefault()}
                    >
                      <Phone size={22} fill="currentColor" />
                    </a>
                  </>
                );
              })()}

              {booking.bookingStatus === "REQUESTED" && (
                <button
                  onClick={() => {
                    setEditingBooking(booking);
                    setEditForm({
                      scheduledAt: booking.scheduledAt.substring(0, 16),
                      notes: booking.notes || ""
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
              {["REQUESTED", "CONFIRMED"].includes(booking.bookingStatus) && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  disabled={cancelLoading === booking._id}
                  className="inline-flex items-center gap-2 rounded-full border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/10 dark:hover:bg-red-500/5"
                >
                  <Trash2 size={16} />
                  {cancelLoading === booking._id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>


            <div className="mt-6 rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10">
              <p className="font-semibold">Status timeline</p>
              <div className="mt-4 grid gap-3">
                {(booking.timeline || []).map((entry, index) => (
                  <div
                    key={`${entry.status}-${index}`}
                    className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-coral" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {entry.status}
                      </p>
                      <p>{entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {["ACCEPTED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED"].includes(booking.bookingStatus) && !booking.isReviewed && (
              <div className="mt-6 rounded-[28px] border border-dashed border-ink/10 p-5 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Rate this service</p>
                  <button
                    onClick={() => setReviewingBooking(booking)}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                  >
                    <Star size={16} fill="currentColor" />
                    Leave a Review
                  </button>
                </div>
              </div>
            )}

            {booking.isReviewed && (
              <div className="mt-6 rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-500">
                  <Star size={16} fill="currentColor" className="text-amber-500" />
                  You have reviewed this service
                </p>
              </div>
            )}
          </article>
        ))}

        {!bookings.length && (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            No bookings yet. Browse services and book a local pro to see tracking here.
          </div>
        )}
      </div>

      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[36px] bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold">Edit booking</h3>
                <p className="text-sm text-slate-500">Update your service schedule</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="rounded-full bg-slate-100 p-2 dark:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">New date & time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="datetime-local"
                    value={editForm.scheduledAt}
                    onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                    required
                    className="h-14 w-full rounded-2xl border border-ink/10 bg-slate-50 pl-12 pr-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Additional notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-ink/10 bg-slate-50 p-4 outline-none transition focus:border-coral dark:border-white/10 dark:bg-white/5"
                  placeholder="Any specific instructions..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="h-14 flex-1 rounded-2xl border border-ink/10 font-semibold dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-14 flex-[2] rounded-2xl bg-ink font-bold text-white dark:bg-white dark:text-slate-900"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>

  );
};

export default UserDashboardPage;
