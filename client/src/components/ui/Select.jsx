import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  options = [],
  error,
  hint,
  required = false,
  placeholder = "Select an option",
  className = "",
  id,
  ...props
}) => {
  const selectId =
    id ||
    `select-${
      label
        ?.toLowerCase()
        .replace(/\s+/g, "-") || "field"
    }`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
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

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : hint
                ? `${selectId}-hint`
                : undefined
          }
          className={`
            min-h-11
            w-full
            appearance-none
            rounded-xl
            border
            bg-white
            px-4
            py-2.5
            pr-11
            text-sm
            text-slate-900
            shadow-sm
            outline-none
            transition-all
            duration-200
            disabled:cursor-not-allowed
            disabled:bg-gray-50
            disabled:text-gray-500
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            }
            ${className}
          `}
          {...props}
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => {
            const value =
              typeof option === "object"
                ? option.value
                : option;

            const optionLabel =
              typeof option === "object"
                ? option.label
                : option;

            return (
              <option
                key={value}
                value={value}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${selectId}-hint`}
          className="mt-1.5 text-xs text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Select;