import { ShieldAlert } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
}) {
  return (
    <div className="bg-brand-error/5 border border-brand-error/20 rounded-lg p-6 text-center max-w-md mx-auto my-6 flex flex-col items-center">
      <div className="p-2.5 bg-brand-error/10 text-brand-error rounded-full mb-3">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-sm font-bold text-brand-error mb-1">
        {title}
      </h3>
      <p className="text-xs text-brand-subtext mb-4 max-w-xs leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-tertiary text-xs border-brand-error text-brand-error hover:bg-brand-error/5 py-1.5 px-4 rounded-md font-bold"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
