import { Ban, CheckCircle2, Shield, UsersRound, Wrench, Trash2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import api from "../api/http";
import AdminPageShell from "../components/admin/AdminPageShell";
import FeedbackBanner from "../components/common/FeedbackBanner";
import { extractErrorMessage } from "../lib/httpError";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users || []);
    return data.users || [];
  };

  useEffect(() => {
    loadUsers()
      .catch((error) => {
        setUsers([]);
        setFeedback({
          type: "error",
          text: extractErrorMessage(error)
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const userStats = useMemo(() => {
    const activeUsers = users.filter((entry) => entry.isActive).length;
    const adminUsers = users.filter(
      (entry) => entry.role === "ADMIN" || entry.role === "SUPER_ADMIN"
    ).length;

    return [
      {
        label: "Total users",
        value: users.length,
        icon: UsersRound
      },
      {
        label: "Active accounts",
        value: activeUsers,
        icon: CheckCircle2
      },
      {
        label: "Inactive accounts",
        value: users.length - activeUsers,
        icon: Ban
      },
      {
        label: "Admin accounts",
        value: adminUsers,
        icon: Shield
      }
    ];
  }, [users]);

  const providerAccounts = useMemo(
    () =>
      filteredUsers
        .filter((entry) => entry.role === "PROVIDER")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [filteredUsers]
  );

  const platformUsers = useMemo(
    () =>
      filteredUsers
        .filter((entry) => entry.role !== "PROVIDER")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [filteredUsers]
  );

  const groupedUsers = [
    {
      key: "providers",
      title: "Providers",
      description: "Provider accounts registered on the marketplace.",
      icon: Wrench,
      entries: providerAccounts
    },
    {
      key: "users",
      title: "Users",
      description: "Customers, admins, and the rest of the platform team.",
      icon: UsersRound,
      entries: platformUsers
    }
  ];

  const getRoleBadgeClassName = (role) => {
    if (role === "SUPER_ADMIN") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200";
    }

    if (role === "ADMIN") {
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200";
    }

    if (role === "PROVIDER") {
      return "bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-200";
    }

    return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
  };

  const toggleUser = async (targetUser) => {
    setActionUserId(targetUser._id);

    try {
      await api.patch(`/admin/users/${targetUser._id}`, {
        isActive: !targetUser.isActive
      });
      await loadUsers();
      setFeedback({
        type: "success",
        text: "User status updated."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setActionUserId("");
    }
  };

  const deleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${targetUser.name}? This action cannot be undone.`)) {
      return;
    }

    setActionUserId(targetUser._id);
    try {
      await api.delete(`/admin/users/${targetUser._id}`);
      await loadUsers();
      setFeedback({
        type: "success",
        text: "User account removed permanently."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: extractErrorMessage(error)
      });
    } finally {
      setActionUserId("");
    }
  };


  return (
    <AdminPageShell
      title="User management"
      description="Browse platform members, review account roles, and activate or deactivate access when needed."
    >
      <FeedbackBanner feedback={feedback} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {userStats.map((stat) => {
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
            <UsersRound className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border border-transparent bg-slate-100/80 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:border-coral/20 focus:bg-white dark:bg-white/10 dark:focus:bg-white/20"
          />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        {loading ? (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300 xl:col-span-2">
            Loading users...
          </div>
        ) : users.length ? (
          groupedUsers.map((group) => {
            const Icon = group.icon;

            return (
              <section key={group.key} className="glass-card rounded-[30px] p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/80 text-coral dark:bg-white/10">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-bold">{group.title}</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-slate-100/80 px-4 py-2 text-sm font-semibold dark:bg-white/10">
                    {group.entries.length} account{group.entries.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="space-y-4">
                  {group.entries.length ? (
                    group.entries.map((entry) => {
                      const isUpdating = actionUserId === entry._id;

                      return (
                        <article
                          key={entry._id}
                          className="rounded-[28px] bg-slate-100/80 p-5 dark:bg-white/10"
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-2xl font-bold truncate sm:whitespace-normal">{entry.name}</h3>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClassName(entry.role)}`}
                                >
                                  {entry.role}
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                  {entry.email}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {entry.phone || "Phone number not added"}
                              </p>
                            </div>

                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  entry.isActive
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
                                }`}
                              >
                                {entry.isActive ? "Active" : "Inactive"}
                              </span>
                              
                              {entry.email !== "mecchi216@gmail.com" ? (
                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                  <button
                                    type="button"
                                    onClick={() => toggleUser(entry)}
                                    disabled={isUpdating}
                                    className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-white/10"
                                  >
                                    {isUpdating && actionUserId === entry._id
                                      ? "Updating..."
                                      : entry.isActive
                                        ? "Deactivate account"
                                        : "Activate account"}
                                  </button>
                                  {!entry.isActive && (
                                    <button
                                      type="button"
                                      onClick={() => deleteUser(entry)}
                                      disabled={isUpdating}
                                      className="flex items-center gap-2 rounded-full border border-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/5"
                                    >
                                      <Trash2 size={14} />
                                      Remove permanently
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  System Protected
                                </p>
                              )}
                            </div>

                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-[28px] bg-slate-100/80 p-8 text-center text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      No {group.title.toLowerCase()} found yet.
                    </div>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="glass-card rounded-[30px] p-10 text-center text-slate-600 dark:text-slate-300 xl:col-span-2">
            No users found yet.
          </div>
        )}
      </section>
    </AdminPageShell>
  );
};

export default AdminUsersPage;
