import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Filter,
  MessageSquare,
  Search,
  Star,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/http";
import AdminPageShell from "../components/admin/AdminPageShell";
import FeedbackBanner from "../components/common/FeedbackBanner";
import { extractErrorMessage } from "../lib/httpError";
import { formatDateTime } from "../lib/utils";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sentiment: "",
    providerId: "",
    search: "",
    page: 1
  });
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadData = async () => {
    setLoading(true);

    try {
      const [reviewsRes, statsRes, providersRes] = await Promise.all([
        api.get("/admin/reviews", { params: filters }),
        api.get("/admin/reviews/stats"),
        api.get("/admin/providers")
      ]);

      setReviews(reviewsRes.data.reviews || []);
      setPagination({
        pages: reviewsRes.data.pages || 1,
        total: reviewsRes.data.total || 0
      });
      setStats(statsRes.data || null);
      setProviders(providersRes.data.providers || []);
    } catch (error) {
      setReviews([]);
      setStats(null);
      setProviders([]);
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await api.delete(`/admin/reviews/${id}`);
      setFeedback({
        type: "success",
        text: "Review deleted."
      });
      loadData();
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            Positive
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <AlertCircle size={12} />
            Negative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-400">
            Neutral
          </span>
        );
    }
  };

  return (
    <AdminPageShell
      eyebrow="Operations"
      title="Review management"
      description="Monitor service quality, analyze customer sentiment, and moderate feedback across the platform."
    >
      <FeedbackBanner feedback={feedback} />

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-[28px] p-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
              <MessageSquare size={20} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{stats.totalReviews}</p>
            <p className="text-sm font-semibold text-slate-500">Total reviews</p>
          </div>
          <div className="glass-card rounded-[28px] p-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.positive}
            </p>
            <p className="text-sm font-semibold text-slate-500">Positive sentiment</p>
          </div>
          <div className="glass-card rounded-[28px] p-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertCircle size={20} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-rose-600 dark:text-rose-400">
              {stats.negative}
            </p>
            <p className="text-sm font-semibold text-slate-500">Negative sentiment</p>
          </div>
          <div className="glass-card rounded-[28px] p-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
              <BarChart3 size={20} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{stats.neutral}</p>
            <p className="text-sm font-semibold text-slate-500">Neutral sentiment</p>
          </div>
        </div>
      )}

      <div className="glass-card flex flex-wrap items-center gap-4 rounded-[28px] p-4 shadow-soft lg:flex-nowrap">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-white/5">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filters.sentiment}
            onChange={(event) =>
              setFilters({ ...filters, sentiment: event.target.value, page: 1 })
            }
            className="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 dark:text-white"
          >
            <option value="">All sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="flex flex-[2] items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-white/5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by content or names..."
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value, page: 1 })
            }
            className="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-[1.5] items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-white/5">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filters.providerId}
            onChange={(event) =>
              setFilters({ ...filters, providerId: event.target.value, page: 1 })
            }
            className="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 dark:text-white"
          >
            <option value="">All providers</option>
            {providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                {provider.user?.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setFilters({ sentiment: "", providerId: "", search: "", page: 1 })}
          className="h-12 whitespace-nowrap rounded-2xl border border-ink/10 px-6 text-sm font-bold dark:border-white/10"
        >
          Reset filters
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Analyzing feedback...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review._id}
              className="glass-card overflow-hidden rounded-[32px] p-0 shadow-soft transition-transform hover:scale-[1.005]"
            >
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={
                              index < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-800"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-400">{review.rating}/5</span>
                    </div>
                    {getSentimentBadge(review.sentiment)}
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold">{review.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    "{review.comment}"
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-6 dark:border-white/5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Customer
                      </p>
                      <p className="text-sm font-bold">{review.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Provider
                      </p>
                      <p className="text-sm font-bold">{review.provider?.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Date
                      </p>
                      <p className="text-sm font-bold">{formatDateTime(review.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col border-l border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5 md:w-20 md:items-center md:justify-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(review._id)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    title="Delete review"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[32px] border-2 border-dashed border-slate-100 py-20 text-center dark:border-white/5">
            <MessageSquare size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-lg font-bold text-slate-400">
              No reviews found with these filters
            </p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-10">
          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setFilters({ ...filters, page: index + 1 })}
              className={`h-12 w-12 rounded-2xl font-bold transition ${
                filters.page === index + 1
                  ? "bg-ink text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminReviewsPage;
