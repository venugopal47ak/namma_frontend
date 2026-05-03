import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../../api/http";

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/reviews", {
        booking: booking._id,
        provider: booking.provider?._id,
        service: booking.service?._id,
        rating,
        title,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-[32px] overflow-hidden shadow-halo animate-in fade-in zoom-in duration-300">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:scale-110 transition-transform"
          >
            <X size={20} />
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coral">
            Feedback
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">Review service</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Share your experience with {booking.provider?.user?.name} for the{" "}
            {booking.service?.title} service.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your experience"
                required
                className="w-full h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5 focus:border-coral/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or what could be improved?"
                rows={4}
                required
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5 focus:border-coral/30 transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-ink text-white font-bold transition shadow-soft hover:translate-y-[-2px] disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
