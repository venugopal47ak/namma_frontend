const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-coral">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
    </div>
    {action}
  </div>
);

export default SectionHeader;

