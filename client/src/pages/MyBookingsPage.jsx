import { MessageCircle, Phone, Star, Settings, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/http";
import { useAuth } from "../context/AuthContext";
import { loadRazorpayScript } from "../lib/razorpay";

import SectionHeader from "../components/common/SectionHeader";
import ReviewModal from "../components/common/ReviewModal";
import { createBookingShareLink, formatCurrency, formatDateTime } from "../lib/utils";

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [complaintBooking, setComplaintBooking] = useState(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);



  const loadBookings = async () => {
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data.bookings || []);
    } catch (error) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRaiseComplaint = async () => {
    if (!complaintReason.trim()) return;
    setSubmittingComplaint(true);
    try {
      await api.post(`/bookings/${complaintBooking._id}/complaint`, {
        reason: complaintReason
      });
      setComplaintBooking(null);
      setComplaintReason("");
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to raise complaint");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleResolveComplaint = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/resolve-complaint`);
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resolve complaint");
    }
  };

  const handlePayment = async (booking) => {

    setPaying(booking._id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      const { data } = await api.post(`/payments/orders/${booking._id}`);
      
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "NammaServe",
        description: `Payment for ${booking.service?.title}`,
        order_id: data.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        handler: async (response) => {
          await api.post("/payments/verify", {
            bookingId: booking._id,
            ...response
          });
          loadBookings();
        },
        theme: { color: "#f06543" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setPaying(null);
    }
  };

  const getStatusColor = (status) => {

    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200";
      case "ACCEPTED":
      case "CONFIRMED":
        return "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="section-shell py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-8 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow={user?.role === "PROVIDER" ? "Job List" : "My Bookings"}
          title={user?.role === "PROVIDER" ? "Manage your incoming service jobs" : "Track your service requests and stay updated"}
          description={user?.role === "PROVIDER" ? "View all assigned bookings, update statuses, and report issues if needed." : "View all your bookings, check status updates, and contact providers when needed."}
        />

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
        >
          <Settings size={18} />
          Profile Settings
        </Link>
      </div>


      <div className="grid gap-6">
        {bookings.map((booking) => (
          <article key={booking._id} className="glass-card rounded-[30px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-coral">
                  {booking.bookingCode}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {booking.service?.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {booking.provider?.user?.name} • {formatDateTime(booking.scheduledAt)}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-100/80 px-4 py-3 text-right dark:bg-white/10">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.replace("_", " ")}
                </span>
                <p className="mt-2 text-sm text-slate-500">
                  {formatCurrency(booking.pricing?.totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
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

                    {user?.role === "PROVIDER" && (
                      <div className="flex gap-2">
                        {!booking.complaint?.isRaised ? (
                          <button
                            onClick={() => setComplaintBooking(booking)}
                            className="flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <AlertCircle size={14} />
                            Report Issue
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                booking.complaint.status === "OPEN" 
                                  ? "bg-rose-100 text-rose-700" 
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                Complaint: {booking.complaint.status}
                              </span>
                              {booking.complaint.status === "OPEN" && (
                                <button
                                  onClick={() => handleResolveComplaint(booking._id)}
                                  className="text-xs font-bold text-emerald-600 hover:underline"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                            {booking.complaint.status === "RESOLVED" && booking.complaint.adminAction && (
                              <div className="rounded-xl bg-slate-100 p-3 text-[11px] dark:bg-white/5">
                                <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tighter">
                                  Resolution: {booking.complaint.adminAction}
                                </p>
                                {booking.complaint.adminNote && (
                                  <p className="mt-1 text-slate-500 italic">"{booking.complaint.adminNote}"</p>
                                )}
                              </div>
                            )}
                          </div>

                        )}
                      </div>
                    )}

                    {booking.bookingStatus === "COMPLETED" && 
                     booking.paymentStatus === "PENDING" && 
                     booking.paymentMethod === "RAZORPAY" && (
                      <button
                        onClick={() => handlePayment(booking)}
                        disabled={paying === booking._id}
                        className="flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-70"
                      >
                        {paying === booking._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CreditCard size={16} />
                        )}
                        Pay Now
                      </button>
                    )}

                    {["ACCEPTED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED"].includes(booking.bookingStatus) && !booking.isReviewed && (

                      <button
                        onClick={() => setReviewingBooking(booking)}
                        className="ml-auto flex items-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                      >
                        <Star size={16} fill="currentColor" />
                        Review service
                      </button>
                    )}

                    {booking.isReviewed && (
                      <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        <Star size={16} fill="currentColor" />
                        Reviewed
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {booking.notes && (
              <div className="mt-4 rounded-[20px] bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <strong>Notes:</strong> {booking.notes}
                </p>
              </div>
            )}
          </article>
        ))}

        {!bookings.length && (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            <p className="text-2xl font-bold mb-2">No bookings yet</p>
            <p>Browse services and book with local providers to get started.</p>
          </div>
        )}
      </div>

      {complaintBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setComplaintBooking(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-halo animate-in zoom-in-95 dark:bg-slate-900">
            <h3 className="font-display text-2xl font-bold">Report an Issue</h3>
            <p className="mt-2 text-sm text-slate-500">
              Please describe the issue you are facing with this booking (e.g., customer not paid, incorrect address, etc.)
            </p>
            
            <textarea
              className="mt-6 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              placeholder="Enter details here..."
              value={complaintReason}
              onChange={(e) => setComplaintReason(e.target.value)}
            />
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setComplaintBooking(null)}
                className="flex-1 rounded-2xl border border-slate-100 py-3 text-sm font-bold transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseComplaint}
                disabled={submittingComplaint || !complaintReason.trim()}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-rose-700 disabled:opacity-50"
              >
                {submittingComplaint ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewingBooking && (
        <ReviewModal
          isOpen={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          bookingId={reviewingBooking._id}
          providerId={reviewingBooking.provider?._id}
          onSuccess={loadBookings}
        />
      )}
    </div>
  );
};


export default MyBookingsPage;