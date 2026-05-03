import { NavLink } from "react-router-dom";
import SectionHeader from "../common/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { adminNavigationItems } from "../../lib/adminNavigation";

const adminNavLinkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-ink text-white dark:bg-white dark:text-slate-900"
      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
  }`;

const AdminPageShell = ({ eyebrow, title, description, children }) => {
  const { user } = useAuth();

  return (
    <div className="section-shell space-y-8 py-10">
      <SectionHeader
        eyebrow={eyebrow || (user?.role === "SUPER_ADMIN" ? "Super admin" : "Admin")}
        title={title}
        description={description}
      />

      <div className="glass-card rounded-[28px] p-2 shadow-soft">
        <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={adminNavLinkClasses}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
};

export default AdminPageShell;
