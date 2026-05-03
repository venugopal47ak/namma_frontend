import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AppShell from "../components/layout/AppShell";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminComplaintsPage from "../pages/AdminComplaintsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminProvidersPage from "../pages/AdminProvidersPage";
import AdminReviewsPage from "../pages/AdminReviewsPage";
import AdminSettingsPage from "../pages/AdminSettingsPage";
import AdminUsersPage from "../pages/AdminUsersPage";

import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import MyBookingsPage from "../pages/MyBookingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";
import ProviderDashboardPage from "../pages/ProviderDashboardPage";
import ProviderDetailPage from "../pages/ProviderDetailPage";
import ServiceProvidersPage from "../pages/ServiceProvidersPage";
import ServicesPage from "../pages/ServicesPage";
import UserDashboardPage from "../pages/UserDashboardPage";


import { useAuth } from "../context/AuthContext";

const HomeRedirect = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === "PROVIDER") {
    return <Navigate to="/provider/dashboard" replace />;
  }
  return children;
};

const ProviderRedirect = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "PROVIDER") {
    return <Navigate to="/provider/dashboard" replace />;
  }
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "PROVIDER") {
    return <Navigate to="/provider/dashboard" replace />;
  }
  return <Navigate to="/my-bookings" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<HomeRedirect><HomePage /></HomeRedirect>} />
      <Route path="/services" element={<ProviderRedirect><ServicesPage /></ProviderRedirect>} />
      <Route path="/services/:serviceName" element={<ProviderRedirect><ServiceProvidersPage /></ProviderRedirect>} />
      <Route path="/providers/service/:service" element={<ProviderRedirect><ServiceProvidersPage /></ProviderRedirect>} />
      <Route path="/providers/:id" element={<ProviderRedirect><ProviderDetailPage /></ProviderRedirect>} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["USER", "PROVIDER"]}>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute roles={["USER", "PROVIDER"]}>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["USER", "PROVIDER"]}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="providers" element={<AdminProvidersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />

    </Route>
  </Routes>
);

export default AppRoutes;
