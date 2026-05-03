import { Settings2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/http";
import AdminPageShell from "../components/admin/AdminPageShell";
import FeedbackBanner from "../components/common/FeedbackBanner";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../lib/httpError";

const defaultNewAdmin = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "ADMIN",
  scope: "LOCAL"
};

const defaultSettings = {
  supportPhone: "",
  supportEmail: "",
  platformFeePercent: 0
};

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [newAdmin, setNewAdmin] = useState(defaultNewAdmin);

  const canManageSettings = user?.role === "SUPER_ADMIN";

  const loadSettings = async () => {
    const { data } = await api.get("/admin/settings");
    const nextSettings = data.settings || defaultSettings;
    setSettings(nextSettings);
    return nextSettings;
  };

  useEffect(() => {
    loadSettings()
      .catch((error) => {
        setSettings(defaultSettings);
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();

    if (!canManageSettings) {
      return;
    }

    setSaving(true);

    try {
      await api.patch("/admin/settings", settings);
      await loadSettings();
      setFeedback({
        type: "success",
        text: "Platform settings updated."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setSaving(false);
    }
  };

  const createAdmin = async (event) => {
    event.preventDefault();

    if (!canManageSettings) {
      return;
    }

    setCreating(true);

    try {
      await api.post("/admin/admins", newAdmin);
      setFeedback({
        type: "success",
        text: "Admin created successfully."
      });
      setNewAdmin(defaultNewAdmin);
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminPageShell
      title="Platform settings"
      description="Update support contacts, review platform fees, and manage higher-level admin access from one configuration area."
    >
      <FeedbackBanner feedback={feedback} />

      {!canManageSettings && (
        <div className="glass-card rounded-[28px] px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
          You can review platform settings here, but only super admins can save changes or
          create new admin accounts.
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300">
          Loading platform settings...
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <form className="glass-card rounded-[30px] p-6" onSubmit={saveSettings}>
              <div className="mb-5 flex items-center gap-3">
                <Settings2 className="text-coral" />
                <div>
                  <h2 className="font-display text-3xl font-bold">Service desk details</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Keep customer-facing support information and fee settings up to date.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  value={settings?.supportPhone || ""}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...(current || defaultSettings),
                      supportPhone: event.target.value
                    }))
                  }
                  placeholder="Support phone"
                  disabled={!canManageSettings}
                  className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5"
                />
                <input
                  value={settings?.supportEmail || ""}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...(current || defaultSettings),
                      supportEmail: event.target.value
                    }))
                  }
                  placeholder="Support email"
                  disabled={!canManageSettings}
                  className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5"
                />
                <input
                  type="number"
                  value={settings?.platformFeePercent || 0}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...(current || defaultSettings),
                      platformFeePercent: Number(event.target.value)
                    }))
                  }
                  placeholder="Platform fee %"
                  disabled={!canManageSettings}
                  className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5"
                />
              </div>

              {canManageSettings && (
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-5 h-12 w-full rounded-2xl bg-ink px-4 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
                >
                  {saving ? "Saving..." : "Save settings"}
                </button>
              )}
            </form>

            <section className="glass-card rounded-[30px] p-6">
              <div className="mb-5 flex items-center gap-3">
                <Shield className="text-coral" />
                <div>
                  <h2 className="font-display text-3xl font-bold">Current snapshot</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Reference the live values that power support and platform operations.
                  </p>
                </div>
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

                <div className="rounded-[24px] bg-slate-100/80 p-5 dark:bg-white/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Platform fee
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {settings?.platformFeePercent || 0}%
                  </p>
                </div>
              </div>
            </section>
          </div>

          {canManageSettings && (
            <section className="glass-card rounded-[30px] p-6">
              <div className="mb-5 flex items-center gap-3">
                <Shield className="text-coral" />
                <div>
                  <h2 className="font-display text-3xl font-bold">Create admin</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Add a new admin or super admin without returning to the overview page.
                  </p>
                </div>
              </div>

              <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={createAdmin}>
                <input
                  value={newAdmin.name}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Name"
                  required
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                />
                <input
                  value={newAdmin.email}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                  required
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                />
                <input
                  value={newAdmin.phone}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="Phone"
                  required
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                />
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Temporary password"
                  required
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                />
                <select
                  value={newAdmin.role}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, role: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <select
                  value={newAdmin.scope}
                  onChange={(event) =>
                    setNewAdmin((current) => ({ ...current, scope: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-ink/10 bg-white px-4 outline-none dark:border-white/10 dark:bg-white/5"
                >
                  <option value="LOCAL">Local Scope</option>
                  <option value="GLOBAL">Global Scope</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-12 rounded-2xl bg-ink px-4 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
                >
                  {creating ? "Creating..." : "Create admin"}
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </AdminPageShell>
  );
};

export default AdminSettingsPage;
