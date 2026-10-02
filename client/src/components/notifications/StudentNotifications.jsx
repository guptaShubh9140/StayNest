import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const StudentNotifications = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch bookings
  // --------------------------------------------------

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/bookings/my-bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load notifications"
        );
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(
        "Student notifications error:",
        error
      );

      setError(
        error.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --------------------------------------------------
  // Notification metadata
  // --------------------------------------------------

  const getNotificationMeta = (type) => {
    const metadata = {
      pending: {
        icon: Clock3,
        iconClass:
          "bg-amber-50 text-amber-600",
        containerClass:
          "border-amber-100 bg-amber-50/50",
        badgeClass:
          "bg-amber-100 text-amber-700",
      },

      confirmed: {
        icon: CheckCircle2,
        iconClass:
          "bg-emerald-50 text-emerald-600",
        containerClass:
          "border-emerald-100 bg-emerald-50/40",
        badgeClass:
          "bg-emerald-100 text-emerald-700",
      },

      payment: {
        icon: CreditCard,
        iconClass:
          "bg-blue-50 text-blue-600",
        containerClass:
          "border-blue-100 bg-blue-50/40",
        badgeClass:
          "bg-blue-100 text-blue-700",
      },

      paid: {
        icon: CircleDollarSign,
        iconClass:
          "bg-emerald-50 text-emerald-600",
        containerClass:
          "border-emerald-100 bg-emerald-50/40",
        badgeClass:
          "bg-emerald-100 text-emerald-700",
      },

      rejected: {
        icon: XCircle,
        iconClass:
          "bg-red-50 text-red-600",
        containerClass:
          "border-red-100 bg-red-50/40",
        badgeClass:
          "bg-red-100 text-red-700",
      },

      cancelled: {
        icon: RotateCcw,
        iconClass:
          "bg-gray-100 text-gray-600",
        containerClass:
          "border-gray-200 bg-gray-50",
        badgeClass:
          "bg-gray-100 text-gray-700",
      },

      completed: {
        icon: CheckCircle2,
        iconClass:
          "bg-indigo-50 text-indigo-600",
        containerClass:
          "border-indigo-100 bg-indigo-50/40",
        badgeClass:
          "bg-indigo-100 text-indigo-700",
      },
    };

    return metadata[type] || metadata.pending;
  };

  // --------------------------------------------------
  // Generate notifications
  // --------------------------------------------------

  const notifications = useMemo(() => {
    const items = [];

    bookings.forEach((booking) => {
      const status = String(
        booking?.status || ""
      ).toLowerCase();

      const paymentStatus = String(
        booking?.paymentStatus || ""
      ).toLowerCase();

      const propertyName =
        booking?.property?.name ||
        "your property";

      const bookingId =
        booking?._id || booking?.id;

      const date =
        booking?.updatedAt ||
        booking?.createdAt;

      // Booking pending
      if (status === "pending") {
        items.push({
          id: `${bookingId}-pending`,
          type: "pending",
          title: "Booking pending",
          message: `Your booking request for ${propertyName} is waiting for owner confirmation.`,
          date,
        });
      }

      // Booking confirmed
      if (status === "confirmed") {
        items.push({
          id: `${bookingId}-confirmed`,
          type: "confirmed",
          title: "Booking confirmed",
          message: `Your booking for ${propertyName} has been confirmed.`,
          date,
        });
      }

      // Payment pending
      if (
        status === "confirmed" &&
        paymentStatus === "pending"
      ) {
        items.push({
          id: `${bookingId}-payment`,
          type: "payment",
          title: "Payment pending",
          message:
            "Your booking is confirmed. Complete the payment to continue.",
          date,
        });
      }

      // Payment successful
      if (paymentStatus === "paid") {
        items.push({
          id: `${bookingId}-paid`,
          type: "paid",
          title: "Payment successful",
          message: `Payment for your booking at ${propertyName} has been received.`,
          date,
        });
      }

      // Booking rejected
      if (status === "rejected") {
        items.push({
          id: `${bookingId}-rejected`,
          type: "rejected",
          title: "Booking rejected",
          message: `Your booking request for ${propertyName} was rejected.`,
          date,
        });
      }

      // Booking cancelled
      if (status === "cancelled") {
        items.push({
          id: `${bookingId}-cancelled`,
          type: "cancelled",
          title: "Booking cancelled",
          message: `Your booking for ${propertyName} has been cancelled.`,
          date,
        });
      }

      // Booking completed
      if (status === "completed") {
        items.push({
          id: `${bookingId}-completed`,
          type: "completed",
          title: "Booking completed",
          message: `Your stay at ${propertyName} has been marked as completed.`,
          date,
        });
      }
    });

    return items
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const pendingCount = bookings.filter(
    (booking) =>
      String(
        booking?.status || ""
      ).toLowerCase() === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) =>
      String(
        booking?.status || ""
      ).toLowerCase() === "confirmed"
  ).length;

  const paidCount = bookings.filter(
    (booking) =>
      String(
        booking?.paymentStatus || ""
      ).toLowerCase() === "paid"
  ).length;

  // --------------------------------------------------
  // Relative time
  // --------------------------------------------------

  const formatRelativeTime = (date) => {
    if (!date) {
      return "";
    }

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return "";
    }

    const difference = Date.now() - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (difference < minute) {
      return "Just now";
    }

    if (difference < hour) {
      return `${Math.floor(
        difference / minute
      )}m ago`;
    }

    if (difference < day) {
      return `${Math.floor(
        difference / hour
      )}h ago`;
    }

    if (difference < 7 * day) {
      return `${Math.floor(
        difference / day
      )}d ago`;
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse gap-3 rounded-xl border border-gray-100 p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-2.5 w-20 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (error) {
    return (
      <section className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Bell
                size={20}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Updates about your bookings and payments.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-5">
            <p className="text-sm font-semibold text-red-800">
              Unable to load notifications
            </p>

            <p className="mt-1.5 text-xs leading-5 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBookings}
              className="
                mt-4 inline-flex min-h-10 items-center
                justify-center gap-2 rounded-xl
                bg-red-600 px-4 py-2.5
                text-xs font-semibold text-white
                transition hover:bg-red-700
                focus:outline-none focus:ring-2
                focus:ring-red-500 focus:ring-offset-2
              "
            >
              <RefreshCw
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell
                size={20}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Updates about your bookings and payments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            className="
              inline-flex min-h-10 items-center
              justify-center gap-2 self-start
              rounded-xl border border-gray-200
              bg-white px-3.5 py-2
              text-xs font-semibold text-gray-700
              transition-all
              hover:border-blue-200 hover:bg-blue-50
              hover:text-blue-700
              focus:outline-none focus:ring-2
              focus:ring-blue-500/30
              sm:self-auto
            "
          >
            <RefreshCw
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-3 border-b border-gray-100">
        <div className="border-r border-gray-100 px-3 py-4 text-center sm:px-5">
          <p className="text-lg font-bold text-gray-900">
            {bookings.length}
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
            Bookings
          </p>
        </div>

        <div className="border-r border-gray-100 px-3 py-4 text-center sm:px-5">
          <p className="text-lg font-bold text-amber-600">
            {pendingCount}
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
            Pending
          </p>
        </div>

        <div className="px-3 py-4 text-center sm:px-5">
          <p className="text-lg font-bold text-emerald-600">
            {paidCount}
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
            Paid
          </p>
        </div>
      </div>

      {/* Notification list */}

      <div className="p-4 sm:p-5">
        {notifications.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
              <Bell
                size={25}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p className="mt-4 text-sm font-bold text-gray-900">
              No notifications
            </p>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-gray-500">
              Booking updates and payment activity
              will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const meta = getNotificationMeta(
                notification.type
              );

              const Icon = meta.icon;

              return (
                <article
                  key={notification.id}
                  className={[
                    "group rounded-2xl border p-4",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-sm",
                    meta.containerClass,
                  ].join(" ")}
                >
                  <div className="flex gap-3">
                    {/* Icon */}

                    <div
                      className={[
                        "flex h-10 w-10 shrink-0",
                        "items-center justify-center",
                        "rounded-xl",
                        meta.iconClass,
                      ].join(" ")}
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            {notification.title}
                          </h3>

                          {notification.type ===
                            "payment" && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}
                            >
                              Action needed
                            </span>
                          )}

                          {notification.type ===
                            "confirmed" && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}
                            >
                              Confirmed
                            </span>
                          )}
                        </div>

                        {notification.date && (
                          <span className="shrink-0 text-[11px] font-medium text-gray-400">
                            {formatRelativeTime(
                              notification.date
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs leading-5 text-gray-600 sm:text-sm">
                        {notification.message}
                      </p>

                      {notification.date && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                          <CalendarDays
                            size={12}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <span>
                            {new Date(
                              notification.date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentNotifications;