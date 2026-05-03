import { X } from "lucide-react";
import { useEffect, useState } from "react";

const RejectProviderModal = ({
  isOpen,
  provider,
  isSubmitting = false,
  onClose,
  onSubmit
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason(provider?.rejectionReason || "");
    }
  }, [isOpen, provider]);

  if (!isOpen || !provider) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-[28px] bg-white p-8 shadow-2xl dark:bg-slate-900"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={20} />
        </button>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">
            Reject provider
          </p>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {provider.user?.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Add a clear reason so the provider team knows exactly what needs to be fixed.
          </p>
        </div>

        <label className="mt-6 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Reason for rejection
        </label>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows="5"
          required
          placeholder="Missing profile details, invalid service information, unclear pricing..."
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-white/10 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Reject provider"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RejectProviderModal;
