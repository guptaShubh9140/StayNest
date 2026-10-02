import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load this information. Please try again.",
  onRetry,
  retryLabel = "Try Again",
}) => {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle
          size={26}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900 sm:text-lg">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <RefreshCw
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />

          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorState;