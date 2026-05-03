import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="section-shell py-20">
    <div className="glass-card rounded-[36px] p-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral">404</p>
      <h1 className="mt-4 font-display text-5xl font-bold">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
        The route you opened does not exist in this workspace. Head back to the home page
        to browse services or log in to your dashboard.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white dark:bg-white dark:text-slate-900"
      >
        Go home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
