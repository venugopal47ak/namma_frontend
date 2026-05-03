import { getProviderStatusMeta } from "../../lib/providerStatus";

const ProviderStatusBadge = ({ provider, status, className = "" }) => {
  const meta = getProviderStatusMeta(status || provider);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClassName} ${className}`.trim()}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
};

export default ProviderStatusBadge;
