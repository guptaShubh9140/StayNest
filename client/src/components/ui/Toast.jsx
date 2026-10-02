import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    container: "border-green-200 bg-green-50",
    iconBox: "bg-green-100 text-green-700",
    title: "text-green-900",
    message: "text-green-700",
  },

  error: {
    icon: AlertCircle,
    container: "border-red-200 bg-red-50",
    iconBox: "bg-red-100 text-red-700",
    title: "text-red-900",
    message: "text-red-700",
  },

  warning: {
    icon: TriangleAlert,
    container: "border-yellow-200 bg-yellow-50",
    iconBox: "bg-yellow-100 text-yellow-700",
    title: "text-yellow-900",
    message: "text-yellow-700",
  },

  info: {
    icon: Info,
    container: "border-blue-200 bg-blue-50",
    iconBox: "bg-blue-100 text-blue-700",
    title: "text-blue-900",
    message: "text-blue-700",
  },
};

const ToastItem = ({ toast, onRemove }) => {
  const style =
    toastStyles[toast.type] || toastStyles.info;

  const Icon = style.icon;

  return (
    <div
      role="status"
      className={`
        pointer-events-auto flex w-full max-w-sm
        items-start gap-3 rounded-2xl border p-4
        shadow-lg backdrop-blur-sm
        ${style.container}
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center
          justify-center rounded-full
          ${style.iconBox}
        `}
      >
        <Icon
          size={18}
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-bold ${style.title}`}
        >
          {toast.title}
        </p>

        {toast.message && (
          <p
            className={`
              mt-1 text-sm leading-5
              ${style.message}
            `}
          >
            {toast.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
        className="
          flex h-7 w-7 shrink-0 items-center
          justify-center rounded-lg
          text-gray-400 transition
          hover:bg-black/5 hover:text-gray-700
          focus:outline-none
          focus:ring-2 focus:ring-gray-400
          focus:ring-offset-1
        "
      >
        <X
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    ({
      type = "info",
      title = "StayNest",
      message = "",
      duration = 4000,
    }) => {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,

      success: (
        title,
        message,
        options = {}
      ) =>
        showToast({
          type: "success",
          title,
          message,
          ...options,
        }),

      error: (
        title,
        message,
        options = {}
      ) =>
        showToast({
          type: "error",
          title,
          message,
          ...options,
        }),

      warning: (
        title,
        message,
        options = {}
      ) =>
        showToast({
          type: "warning",
          title,
          message,
          ...options,
        }),

      info: (
        title,
        message,
        options = {}
      ) =>
        showToast({
          type: "info",
          title,
          message,
          ...options,
        }),

      removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="
          pointer-events-none fixed right-4 top-20
          z-[200] flex w-[calc(100%-2rem)]
          max-w-sm flex-col gap-3
          sm:right-6 sm:top-24
        "
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
};