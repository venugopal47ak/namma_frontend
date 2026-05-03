import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AppShell = () => (
  <div className="relative overflow-hidden">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />
    <Navbar />
    <main className="pb-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppShell;

