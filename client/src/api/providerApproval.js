import api from "./http";

export const getAdminProviders = () => api.get("/admin/providers");

export const getAdminProviderDetails = (providerId) =>
  api.get(`/admin/provider/${providerId}`);

export const approveAdminProvider = (providerId) =>
  api.put(`/admin/provider/${providerId}/approve`);

export const removeAdminProviderApproval = (providerId) =>
  api.put(`/admin/provider/${providerId}/remove-approval`);

export const rejectAdminProvider = (providerId, rejectionReason) =>
  api.put(`/admin/provider/${providerId}/reject`, { rejectionReason });
