import {
  MapPin,
  Menu,
  MoonStar,
  SunMedium,
  X
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePreferences } from "../../context/PreferencesContext";
import FallbackImage, { imageFallbacks } from "../common/FallbackImage";
import LocationSelector from "./LocationSelector";


const navLinkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-ink text-white dark:bg-white dark:text-slate-900"
      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
  }`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { location, theme, setTheme, t } = usePreferences();

  return (
    <header className="section-shell sticky top-0 z-40 pt-4">
      <div className="glass-card rounded-[28px] px-4 py-3 shadow-halo">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-ember font-display text-lg font-bold text-white shadow-soft">
                N
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-lg font-bold tracking-tight">
                  NammaServe
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hyperlocal service booking
                </p>
              </div>
            </Link>

            <div className="hidden lg:block">
              <LocationSelector />
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {(!user || user?.role === "USER") && (
              <>
                <NavLink to="/services" className={navLinkClasses}>
                  {t("nav.services")}
                </NavLink>
                <NavLink to="/my-bookings" className={navLinkClasses}>
                  {t("nav.bookings")}
                </NavLink>
              </>
            )}

            {user?.role === "PROVIDER" && (
              <>
                <NavLink to="/provider/dashboard" className={navLinkClasses}>
                  Provider Dashboard
                </NavLink>
                <NavLink to="/my-bookings" className={navLinkClasses}>
                  Booking List
                </NavLink>

                <NavLink to="/provider/dashboard#reviews" className={navLinkClasses}>
                  My Reviews
                </NavLink>
              </>
            )}
            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <NavLink to="/admin" className={navLinkClasses}>
                {t("nav.admin")}
              </NavLink>
            )}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
            >
              {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>

            {isAuthenticated && !loading ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full bg-slate-100 p-1.5 pr-4 transition hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm dark:border-slate-800">
                    <FallbackImage
                      src={user?.avatar}
                      fallbackSrc={imageFallbacks.avatar}
                      alt={user?.name}
                      className="h-full w-full object-cover"
                    />
                    {user?.hasUnreadAction && (
                      <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-600 dark:border-slate-800" />
                    )}
                  </div>

                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {user?.name || "My Account"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="invisible absolute right-0 top-full mt-2 w-56 origin-top-right rounded-[24px] bg-white p-2 shadow-halo ring-1 ring-black/5 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-slate-900 dark:ring-white/10">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signed in as</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to={
                        user?.role === "PROVIDER"
                          ? "/provider/dashboard"
                          : user?.role === "USER"
                            ? "/my-bookings"
                            : "/admin"
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-coral dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-coral dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Profile Settings
                    </Link>
                  </div>

                  <div className="mt-1 border-t border-slate-100 pt-1 dark:border-white/5">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>


          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">
               <MapPin size={12} className="text-coral" />
               <span className="max-w-[80px] truncate">{location.area}</span>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-4 grid gap-5 border-t border-ink/10 pt-5 dark:border-white/10 lg:hidden">
            <div>
              <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Service location
              </p>
              <LocationSelector isMobile={true} onClose={() => setMenuOpen(false)} />
            </div>

            <div className="grid gap-2">
              <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Menu
              </p>
              {(!user || user?.role === "USER") && (
                <>
                  <NavLink to="/services" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                    {t("nav.services")}
                  </NavLink>
                  <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                    {t("nav.bookings")}
                  </NavLink>
                </>
              )}

              {user?.role === "PROVIDER" && (
                <>
                  <NavLink to="/provider/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                    Provider Dashboard
                  </NavLink>
                  <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                    Booking List
                  </NavLink>

                  <NavLink to="/provider/dashboard#reviews" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                    My Reviews
                  </NavLink>
                </>
              )}
              {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={navLinkClasses}>
                  {t("nav.admin")}
                </NavLink>
              )}
            </div>

            <div className="grid gap-2 border-t border-ink/5 pt-5 dark:border-white/5">
              {isAuthenticated && !loading && (
                <div className="mb-4 flex items-center gap-3 px-1">
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-slate-800">
                    <FallbackImage
                      src={user?.avatar}
                      fallbackSrc={imageFallbacks.avatar}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Welcome back,</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="pill justify-center h-12 rounded-2xl"
              >
                {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
                {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              </button>
              
              {isAuthenticated && !loading ? (
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(
                        user?.role === "PROVIDER"
                          ? "/provider/dashboard"
                          : user?.role === "USER"
                            ? "/my-bookings"
                            : "/admin"
                      );
                    }}
                    className="h-12 rounded-2xl bg-ink font-bold text-white dark:bg-white dark:text-slate-900"
                  >
                    Open dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="h-12 rounded-2xl border border-ink/10 font-bold dark:border-white/10"
                  >
                    My Profile Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="h-12 rounded-2xl border border-ink/10 font-bold text-rose-600 dark:border-white/10 dark:text-rose-400"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="h-12 flex items-center justify-center rounded-2xl bg-ink font-bold text-white dark:bg-white dark:text-slate-900"
                >
                  {t("nav.login")}
                </Link>
              )}
            </div>

          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

