const normalizedBookingStatuses = new Set([
  "pending",
  "accepted",
  "completed",
  "rejected"
]);

const lifecycleToNormalized = {
  REQUESTED: "pending",
  ACCEPTED: "accepted",
  ON_THE_WAY: "accepted",
  IN_PROGRESS: "accepted",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELLED: "rejected"
};

export const getNormalizedBookingStatus = (booking = {}) => {
  if (normalizedBookingStatuses.has(booking?.status)) {
    return booking.status;
  }

  return lifecycleToNormalized[booking?.bookingStatus] || "pending";
};

export const formatBookingLifecycleStatus = (bookingStatus = "") =>
  String(bookingStatus || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
