const Input = ({
  label,
  error,
  hint,
  required = false,
  className = "",
  id,
  ...props
}) => {
  const inputId =
    id ||
    `input-${label
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "field"}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          {label}

          {required && (
            <span
              className="ml-1 text-red-500"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : hint
              ? `${inputId}-hint`
              : undefined
        }
        className={`
          min-h-11
          w-full
          rounded-xl
          border
          bg-white
          px-4
          py-2.5
          text-sm
          text-slate-900
          shadow-sm
          outline-none
          transition-all
          duration-200
          placeholder:text-gray-400
          focus:ring-4
          disabled:cursor-not-allowed
          disabled:bg-gray-50
          disabled:text-gray-500
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          className="mt-1.5 text-xs text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;