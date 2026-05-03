import { Mail, MapPin, Phone, Wallet, X } from "lucide-react";
import FallbackImage, {
  imageFallbacks
} from "../common/FallbackImage";
import ProviderStatusBadge from "./ProviderStatusBadge";
import { getProviderStatus, getProviderStatusMeta } from "../../lib/providerStatus";
import { formatCurrency } from "../../lib/utils";

const ProviderApprovalModal = ({
  provider,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onApprove,
  onRequestReject,
  onRemoveApproval
}) => {
  if (!provider && !isLoading) {
    return null;
  }

  const status = getProviderStatus(provider);
  const statusMeta = getProviderStatusMeta(status);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close provider modal"
          className="absolute right-4 top-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-xl backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
        >
          <X size={22} strokeWidth={2.5} />
        </button>
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="relative">
            <FallbackImage
              src={provider?.coverImage}
              fallbackSrc={imageFallbacks.banner}
              alt={provider?.user?.name || "Provider banner"}
              className="h-[200px] w-full object-cover"
            />

            <div className="absolute bottom-[-30px] left-6 h-[60px] w-[60px] sm:bottom-[-40px] sm:h-20 sm:w-20">
              <FallbackImage
                src={provider?.avatar || provider?.user?.avatar}
                fallbackSrc={imageFallbacks.avatar}
                alt={provider?.user?.name || "Provider profile"}
                className="h-full w-full rounded-full border-4 border-white bg-white object-cover shadow-[0_4px_10px_rgba(15,23,42,0.15)]"
              />
            </div>
          </div>

          <div className="px-5 pb-6 pt-10 sm:px-8 sm:pt-12">
            <div className="flex min-h-[60px] flex-col gap-4 sm:min-h-[80px] sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 pl-[84px] sm:pl-[104px]">
                <div className="pb-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                    Provider profile
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white">
                    {provider?.user?.name}
                  </h2>
                </div>
              </div>
              <ProviderStatusBadge status={status} className="self-start" />
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                {statusMeta.description}
              </p>
              {status === "approved" && provider?.approvedAt && (
                <p className="mt-1">
                  Approved on {new Date(provider.approvedAt).toLocaleString()}
                </p>
              )}
              {status === "rejected" && provider?.rejectedAt && (
                <p className="mt-1">
                  Rejected on {new Date(provider.rejectedAt).toLocaleString()}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-300">
                Loading provider details...
              </div>
            ) : (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="space-y-6">
                  <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Name
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {provider?.user?.name || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Service
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {provider?.serviceCategories?.join(", ") || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Bio
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {provider?.bio || "No bio provided."}
                    </p>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <Wallet size={18} className="text-emerald-600" />
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Starting Price
                        </p>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(provider?.startingPrice || 0)}
                      </p>
                    </div>

                    <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Experience
                      </p>
                      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        {provider?.experienceYears || 0} years
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Contact Info
                    </p>
                    <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="mt-0.5 text-sky-600" />
                        <div>
                          <p className="font-semibold">Email</p>
                          <p>{provider?.user?.email || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="mt-0.5 text-sky-600" />
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p>{provider?.user?.phone || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="mt-0.5 text-emerald-600" />
                        <div>
                          <p className="font-semibold">WhatsApp</p>
                          <p>{provider?.whatsappNumber || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 text-sky-600" />
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <p className="font-semibold">
                          {[provider?.area, provider?.city].filter(Boolean).join(", ") ||
                            "Location not provided"}
                        </p>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">
                          {provider?.addressText || "Address not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {!isLoading && status === "rejected" && (
              <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                <p className="font-semibold">Rejection reason</p>
                <p className="mt-1">{provider?.rejectionReason || "No reason recorded."}</p>
              </div>
            )}

            {!isLoading && (
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-white/10">
                {status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onRequestReject(provider)}
                      disabled={isSubmitting}
                      className="h-11 rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(provider._id)}
                      disabled={isSubmitting}
                      className="h-11 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {isSubmitting ? "Saving..." : "Approve"}
                    </button>
                  </>
                )}

                {status === "approved" && (
                  <button
                    type="button"
                    onClick={() => onRemoveApproval(provider._id)}
                    disabled={isSubmitting}
                    className="h-11 rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : "Remove Approval"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderApprovalModal;
