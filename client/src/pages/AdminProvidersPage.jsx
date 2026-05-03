import { CheckCircle2, Clock3, Wrench, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  approveAdminProvider,
  getAdminProviderDetails,
  getAdminProviders,
  removeAdminProviderApproval,
  rejectAdminProvider
} from "../api/providerApproval";
import AdminPageShell from "../components/admin/AdminPageShell";
import ProviderApprovalModal from "../components/admin/ProviderApprovalModal";
import ProviderStatusBadge from "../components/admin/ProviderStatusBadge";
import RejectProviderModal from "../components/admin/RejectProviderModal";
import FeedbackBanner from "../components/common/FeedbackBanner";
import { extractErrorMessage } from "../lib/httpError";
import { getProviderStatus } from "../lib/providerStatus";

const providerStatusOrder = {
  pending: 0,
  approved: 1,
  rejected: 2
};

const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerModalLoading, setProviderModalLoading] = useState(false);
  const [providerSubmitting, setProviderSubmitting] = useState(false);
  const [providerActionTargetId, setProviderActionTargetId] = useState("");
  const [rejectingProvider, setRejectingProvider] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const providerRequestRef = useRef(0);

  const loadProviders = async () => {
    const { data } = await getAdminProviders();
    setProviders(data.providers || []);
    return data.providers || [];
  };

  const loadProviderDetails = async (providerId, requestId = providerRequestRef.current) => {
    const { data } = await getAdminProviderDetails(providerId);

    if (requestId !== providerRequestRef.current) {
      return null;
    }

    setSelectedProvider(data.provider);
    return data.provider;
  };

  const refreshProviderState = async (providerId) => {
    const tasks = [loadProviders()];

    if (providerId && selectedProvider?._id === providerId) {
      tasks.push(loadProviderDetails(providerId));
    }

    await Promise.all(tasks);
  };

  useEffect(() => {
    loadProviders()
      .catch((error) => {
        setProviders([]);
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const query = searchQuery.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.user?.name?.toLowerCase().includes(query) ||
        (provider.serviceCategories || []).some((cat) => cat.toLowerCase().includes(query)) ||
        provider.area?.toLowerCase().includes(query) ||
        provider.city?.toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  const providerStats = useMemo(() => {
    const counts = providers.reduce(
      (summary, provider) => {
        const status = getProviderStatus(provider);
        summary[status] += 1;
        return summary;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    );

    return [
      {
        label: "All providers",
        value: providers.length,
        icon: Wrench
      },
      {
        label: "Pending approval",
        value: counts.pending,
        icon: Clock3
      },
      {
        label: "Approved",
        value: counts.approved,
        icon: CheckCircle2
      },
      {
        label: "Rejected",
        value: counts.rejected,
        icon: XCircle
      }
    ];
  }, [providers]);

  const sortedProviders = useMemo(
    () =>
      [...filteredProviders].sort((left, right) => {
        const leftStatus = getProviderStatus(left);
        const rightStatus = getProviderStatus(right);

        return providerStatusOrder[leftStatus] - providerStatusOrder[rightStatus];
      }),
    [filteredProviders]
  );

  const openProviderModal = async (providerId) => {
    const requestId = providerRequestRef.current + 1;
    providerRequestRef.current = requestId;
    setProviderModalLoading(true);

    const cachedProvider = providers.find((entry) => entry._id === providerId);
    setSelectedProvider(cachedProvider || null);

    try {
      await loadProviderDetails(providerId, requestId);
    } catch (error) {
      if (requestId === providerRequestRef.current) {
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
        setSelectedProvider(null);
      }
    } finally {
      if (requestId === providerRequestRef.current) {
        setProviderModalLoading(false);
      }
    }
  };

  const closeProviderModal = () => {
    if (providerSubmitting) {
      return;
    }

    providerRequestRef.current += 1;
    setProviderModalLoading(false);
    setSelectedProvider(null);
  };

  const handleApproveProvider = async (providerId) => {
    setProviderSubmitting(true);
    setProviderActionTargetId(providerId);

    try {
      await approveAdminProvider(providerId);
      await refreshProviderState(providerId);
      setFeedback({
        type: "success",
        text: "Provider approved successfully."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setProviderSubmitting(false);
      setProviderActionTargetId("");
    }
  };

  const handleRejectProvider = async (reason) => {
    if (!rejectingProvider?._id) {
      return;
    }

    setProviderSubmitting(true);
    setProviderActionTargetId(rejectingProvider._id);

    try {
      await rejectAdminProvider(rejectingProvider._id, reason);
      await refreshProviderState(rejectingProvider._id);
      setFeedback({
        type: "success",
        text: "Provider rejected and the reason was saved."
      });
      setRejectingProvider(null);
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setProviderSubmitting(false);
      setProviderActionTargetId("");
    }
  };

  const handleRemoveApproval = async (providerId) => {
    setProviderSubmitting(true);
    setProviderActionTargetId(providerId);

    try {
      await removeAdminProviderApproval(providerId);
      await refreshProviderState(providerId);
      setFeedback({
        type: "success",
        text: "Provider approval removed successfully."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setProviderSubmitting(false);
      setProviderActionTargetId("");
    }
  };

  return (
    <AdminPageShell
      title="Provider approvals"
      description="Review pending profiles, inspect provider details, and manage who stays live on the marketplace."
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {providerStats.map((stat) => {
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
            <Wrench className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search providers by name, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border border-transparent bg-slate-100/80 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:border-coral/20 focus:bg-white dark:bg-white/10 dark:focus:bg-white/20"
          />
        </div>
      </div>

      <section className="space-y-4">
        {loading ? (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            Loading provider queue...
          </div>
        ) : sortedProviders.length ? (
          sortedProviders.map((provider) => {
            const status = getProviderStatus(provider);
            const isBusy = providerSubmitting && providerActionTargetId === provider._id;
            const providerSummary =
              provider.bio || provider.headline || "No provider summary added yet.";

            return (
              <article key={provider._id} className="glass-card rounded-[30px] p-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="min-w-0 lg:pr-4">
                    <button
                      type="button"
                      onClick={() => openProviderModal(provider._id)}
                      className="text-left font-display text-2xl font-bold text-slate-900 transition-colors hover:text-coral dark:text-white"
                    >
                      {provider.user?.name}
                    </button>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {(provider.serviceCategories || []).join(", ") || "No service added"} |{" "}
                      {[provider.area, provider.city].filter(Boolean).join(", ")}
                    </p>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {providerSummary}
                    </p>

                    {status === "rejected" && (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                        <span className="font-semibold">Rejection reason:</span>{" "}
                        {provider.rejectionReason || "No reason recorded."}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <ProviderStatusBadge
                      status={status}
                      className="min-w-[112px] justify-center"
                    />
                    <button
                      type="button"
                      onClick={() => openProviderModal(provider._id)}
                      className="inline-flex min-w-[152px] items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                    >
                      View profile
                    </button>
                    {status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveProvider(provider._id)}
                          disabled={isBusy}
                          className="min-w-[132px] whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {isBusy ? "Saving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingProvider(provider)}
                          disabled={isBusy}
                          className="min-w-[132px] whitespace-nowrap rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {status === "approved" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveApproval(provider._id)}
                        disabled={isBusy}
                        className="min-w-[180px] whitespace-nowrap rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {isBusy ? "Saving..." : "Remove approval"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
            No providers are available right now.
          </div>
        )}
      </section>

      <ProviderApprovalModal
        provider={selectedProvider}
        isLoading={providerModalLoading}
        isSubmitting={providerSubmitting}
        onClose={closeProviderModal}
        onApprove={handleApproveProvider}
        onRequestReject={(provider) => setRejectingProvider(provider)}
        onRemoveApproval={handleRemoveApproval}
      />

      <RejectProviderModal
        isOpen={Boolean(rejectingProvider)}
        provider={rejectingProvider}
        isSubmitting={providerSubmitting}
        onClose={() => setRejectingProvider(null)}
        onSubmit={handleRejectProvider}
      />
    </AdminPageShell>
  );
};

export default AdminProvidersPage;
