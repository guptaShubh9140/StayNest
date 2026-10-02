import {
  Check,
  Circle,
  RotateCcw,
  X,
} from "lucide-react";

const StatusBadge = ({
  status,
  label,
  size = "md",
}) => {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .trim();

  const styles = {
    pending: {
      className:
        "border-yellow-200 bg-yellow-50 text-yellow-700",
      icon: Circle,
      label: "Pending",
    },

    confirmed: {
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: Check,
      label: "Confirmed",
    },

    approved: {
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: Check,
      label: "Approved",
    },

    paid: {
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: Check,
      label: "Paid",
    },

    rejected: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: X,
      label: "Rejected",
    },

    cancelled: {
      className:
        "border-gray-200 bg-gray-100 text-gray-700",
      icon: RotateCcw,
      label: "Cancelled",
    },

    completed: {
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
      icon: Check,
      label: "Completed",
    },

    failed: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: X,
      label: "Failed",
    },

    active: {
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: Circle,
      label: "Active",
    },

    inactive: {
      className:
        "border-gray-200 bg-gray-100 text-gray-600",
      icon: Circle,
      label: "Inactive",
    },

    available: {
      className:
        "border-green-200 bg-green-50 text-green-700",
      icon: Circle,
      label: "Available",
    },

    full: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: Circle,
      label: "Full",
    },
  };

  const current = styles[normalizedStatus] || {
    className:
      "border-gray-200 bg-gray-100 text-gray-700",
    icon: Circle,
    label: label || status || "Unknown",
  };

  const Icon = current.icon;

  const sizes = {
    sm: {
      wrapper: "px-2 py-1 text-[11px]",
      icon: 11,
    },

    md: {
      wrapper: "px-2.5 py-1.5 text-xs",
      icon: 13,
    },

    lg: {
      wrapper: "px-3 py-1.5 text-sm",
      icon: 15,
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        font-semibold
        ${current.className}
        ${currentSize.wrapper}
      `}
    >
      <Icon
        size={currentSize.icon}
        strokeWidth={2.5}
        aria-hidden="true"
      />

      <span>
        {label || current.label}
      </span>
    </span>
  );
};

export default StatusBadge;