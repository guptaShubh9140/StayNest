import { useEffect, useId } from "react";
import {
  AlertCircle,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";

const Modal = ({
  open,
  onClose,
  onConfirm,

  title,
  description,
  children,

  size = "md",

  confirmText = "Confirm",
  cancelText = "Cancel",

  showClose = true,
  showCancel = false,
  showConfirm = false,

  loading = false,

  variant = "default",
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        originalOverflow;
    };
  }, [open, onClose, loading]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const confirmStyles = {
    default:
      "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",

    danger:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500",

    success:
      "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",

    warning:
      "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
  };

  const iconStyles = {
    default: "bg-blue-50 text-blue-600",

    danger: "bg-red-50 text-red-600",

    success:
      "bg-emerald-50 text-emerald-600",

    warning:
      "bg-amber-50 text-amber-600",
  };

  const icons = {
    default: AlertCircle,
    danger: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
  };

  const ConfirmationIcon =
    icons[variant] || icons.default;

  const handleBackdropClick = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const handleConfirm = async () => {
    if (loading) return;

    await onConfirm?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        title ? titleId : undefined
      }
      aria-describedby={
        description
          ? descriptionId
          : undefined
      }
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={handleBackdropClick}
        disabled={loading}
        className="absolute inset-0 cursor-default bg-gray-950/50 backdrop-blur-sm disabled:cursor-default"
      />

      {/* Modal */}
      <div
        className={`
          relative
          z-10
          max-h-[90vh]
          w-full
          overflow-hidden
          ${sizes[size] || sizes.md}
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-2xl
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              {/* Confirmation icon */}
              {showConfirm && (
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    ${iconStyles[variant] || iconStyles.default}
                  `}
                  aria-hidden="true"
                >
                  <ConfirmationIcon
                    size={19}
                    strokeWidth={2}
                  />
                </div>
              )}

              <div className="min-w-0 pt-0.5">
                {title && (
                  <h2
                    id={titleId}
                    className="text-base font-bold text-gray-900 sm:text-lg"
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm leading-6 text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Close */}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close modal"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-150px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {(showCancel || showConfirm) && (
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition
                  hover:bg-gray-50
                  hover:text-gray-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-400
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:min-w-24
                "
              >
                {cancelText}
              </button>
            )}

            {showConfirm && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:min-w-28
                  ${confirmStyles[variant] || confirmStyles.default}
                `}
              >
                {loading && (
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white
                      border-t-transparent
                    "
                    aria-hidden="true"
                  />
                )}

                <span>
                  {loading
                    ? "Processing..."
                    : confirmText}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;