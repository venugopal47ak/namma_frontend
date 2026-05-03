export const providerStatusMeta = {
  pending: {
    label: "Pending",
    emoji: "\uD83D\uDFE1",
    badgeClassName:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
    description: "Waiting for admin review."
  },
  approved: {
    label: "Approved",
    emoji: "\uD83D\uDFE2",
    badgeClassName:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    description: "Approved and visible to customers."
  },
  rejected: {
    label: "Rejected",
    emoji: "\uD83D\uDD34",
    badgeClassName:
      "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    description: "Rejected until issues are addressed."
  }
};

export const getProviderStatus = (providerOrStatus) => {
  if (typeof providerOrStatus === "string" && providerStatusMeta[providerOrStatus]) {
    return providerOrStatus;
  }

  if (providerStatusMeta[providerOrStatus?.status]) {
    return providerOrStatus.status;
  }

  if (providerOrStatus?.approved) {
    return "approved";
  }

  if (providerOrStatus?.rejectionReason) {
    return "rejected";
  }

  return "pending";
};

export const getProviderStatusMeta = (providerOrStatus) =>
  providerStatusMeta[getProviderStatus(providerOrStatus)];
