import { AlertCircle, CheckCircle, Info, Loader2, ShieldAlert, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/http";
import AdminPageShell from "../components/admin/AdminPageShell";
import { formatDateTime } from "../lib/utils";

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [actionNote, setActionNote] = useState("");

  const loadComplaints = async () => {
    try {
      const { data } = await api.get("/admin/complaints");
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleAction = async (complaint, type) => {
    const note = prompt(`Enter a note for this ${type.toLowerCase()}:`) || "";
    setProcessing(`${complaint._id}-${type}`);
    try {
      await api.post("/admin/users/action", {
        userId: complaint.user?._id,
        bookingId: complaint._id,
        type,
        note
      });
      loadComplaints();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to issue ${type}`);
    } finally {
      setProcessing(null);
    }
  };

  const resolveDirectly = async (bookingId) => {
    setProcessing(`${bookingId}-resolve`);
    try {
      await api.patch(`/bookings/${bookingId}/resolve-complaint`);
      loadComplaints();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resolve complaint");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminPageShell
      title="User Complaints"
      description="Review issues reported by providers and take disciplinary actions if necessary."
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass-card rounded-[30px] p-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
            <CheckCircle size={32} />
          </div>
          <h3 className="mt-6 text-xl font-bold">No Pending Complaints</h3>
          <p className="mt-2 text-slate-500">All provider reports have been addressed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {complaints.map((item) => (
            <article key={item._id} className="glass-card overflow-hidden rounded-[32px]">
              <div className="flex flex-col lg:flex-row">
                {/* Left: Booking & Provider Info */}
                <div className="flex-1 p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-coral">
                      {item.bookingCode}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      item.complaint.status === "OPEN" 
                        ? "bg-rose-100 text-rose-700" 
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {item.complaint.status}
                    </span>
                  </div>
                  
                  <h3 className="mt-4 font-display text-2xl font-bold">{item.service?.title}</h3>
                  
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Reason</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {item.complaint.reason}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500 uppercase font-bold">
                          Raised {formatDateTime(item.complaint.raisedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported User</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{item.user?.name}</p>
                        <p className="mt-1 flex items-center gap-2 text-[10px] font-bold">
                          <span className="text-rose-500">{item.user?.strikes} Strikes</span>
                          <span className="text-amber-500">{item.user?.warnings} Warnings</span>
                          {!item.user?.isActive && (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-white uppercase tracking-tighter">Banned</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">From Provider</p>
                    <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {item.provider?.user?.name}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full bg-slate-50/50 p-8 lg:w-80 dark:bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
                    <ShieldAlert size={14} />
                    Take Action
                  </h4>
                  
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => handleAction(item, "WARNING")}
                      disabled={processing || item.complaint.status === "RESOLVED"}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {processing === `${item._id}-WARNING` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue Warning"}
                    </button>
                    <button
                      onClick={() => handleAction(item, "STRIKE")}
                      disabled={processing || item.complaint.status === "RESOLVED"}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {processing === `${item._id}-STRIKE` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue Strike"}
                    </button>
                    <button
                      onClick={() => resolveDirectly(item._id)}
                      disabled={processing || item.complaint.status === "RESOLVED"}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      {processing === `${item._id}-resolve` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Resolved"}
                    </button>
                  </div>

                  <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-white/10">
                    <div className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      <p>
                        Issuing a **Strike** will deactivate the user if they reach 3 total strikes. Warnings are for minor infractions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminComplaintsPage;
