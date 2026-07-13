type ErrorCardProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorCard = ({ message, onRetry }: ErrorCardProps) => (
  <div className="card-surface border-rose-500/30 p-5">
    <p className="text-sm font-semibold text-rose-300">Something went wrong</p>
    <p className="mt-2 text-sm text-slate-300">{message}</p>
    {onRetry ? (
      <button
        type="button"
        className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        onClick={onRetry}
      >
        Retry
      </button>
    ) : null}
  </div>
);

