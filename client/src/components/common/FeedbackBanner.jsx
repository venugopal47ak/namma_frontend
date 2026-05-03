const toneClasses = {
  error: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200"
};

const FeedbackBanner = ({ feedback, className = "" }) => {
  if (!feedback?.text) {
    return null;
  }

  const toneClass = toneClasses[feedback.type] || toneClasses.info;

  return (
    <div className={`rounded-[24px] px-4 py-3 text-sm ${toneClass} ${className}`.trim()}>
      {feedback.text}
    </div>
  );
};

export default FeedbackBanner;
