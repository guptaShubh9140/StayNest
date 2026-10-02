import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  icon: Icon,
  iconPosition = "left",
  ...props
}) => {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",

    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-blue-500",

    outline:
      "border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 focus:ring-blue-500",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",

    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",

    dark:
      "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 shadow-sm",
  };

  const sizes = {
    sm: "min-h-9 px-3 py-2 text-xs rounded-lg",
    md: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
    lg: "min-h-12 px-5 py-3 text-sm rounded-xl",
    xl: "min-h-13 px-6 py-3.5 text-base rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        font-semibold
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={16}
            className="animate-spin"
            aria-hidden="true"
          />

          <span>Please wait...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon
              size={17}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}

          <span>{children}</span>

          {Icon && iconPosition === "right" && (
            <Icon
              size={17}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </button>
  );
};

export default Button;