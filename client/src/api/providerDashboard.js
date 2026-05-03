import api from "./http";

export const getProviderDashboardStats = (providerId) =>
  api.get(`/provider/dashboard/${providerId}`);

export const acceptProviderBooking = (bookingId, note) =>
  api.put(`/bookings/${bookingId}/accept`, note ? { note } : {});

export const completeProviderBooking = (bookingId, note) =>
  api.put(`/bookings/${bookingId}/complete`, note ? { note } : {});

export const rejectProviderBooking = (bookingId, note) =>
  api.put(`/bookings/${bookingId}/reject`, note ? { note } : {});
