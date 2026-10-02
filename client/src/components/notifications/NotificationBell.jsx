import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleCheck,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Info,
  Loader2,
  RotateCcw,
  UserRound,
  X,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getOwnerBookings } from "../../lib/api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const READ_NOTIFICATIONS_KEY = "staynest_read_notifications";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);

  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const role = user?.role;

  // --------------------------------------------------
  // Load read notification IDs
  // --------------------------------------------------

  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setReadNotifications(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load read notifications:", error);
      setReadNotifications([]);
    }
  }, []);

  // --------------------------------------------------
  // Fetch notifications
  // --------------------------------------------------

  const fetchNotifications = async () => {
    if (!token || !role) {
      return;
    }

    try {
      setLoading(true);

      let data;

      // Owner notifications
      if (role === "owner") {
        data = await getOwnerBookings(token);
      }

      // Student notifications
      if (role === "student") {
        const response = await fetch(
          `${API_URL}/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load notifications"
          );
        }
      }

      setBookings(data?.bookings || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial fetch + automatic refresh
  // --------------------------------------------------

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [role]);

  // --------------------------------------------------
  // Notification configuration
  // --------------------------------------------------

  const getNotificationMeta = (type) => {
    const meta = {
      pending: {
        icon: Clock3,
        iconClass: "bg-amber-50 text-amber-600",
        accent: "border-l-amber-400",
      },

      confirmed: {
        icon: CircleCheck,
        iconClass: "bg-emerald-50 text-emerald-600",
        accent: "border-l-emerald-500",
      },

      "payment-pending": {
        icon: CreditCard,
        iconClass: "bg-orange-50 text-orange-600",
        accent: "border-l-orange-400",
      },

      paid: {
        icon: CircleDollarSign,
        iconClass: "bg-emerald-50 text-emerald-600",
        accent: "border-l-emerald-500",
      },

      rejected: {
        icon: XCircle,
        iconClass: "bg-red-50 text-red-600",
        accent: "border-l-red-500",
      },

      cancelled: {
        icon: RotateCcw,
        iconClass: "bg-gray-100 text-gray-600",
        accent: "border-l-gray-400",
      },

      completed: {
        icon: CheckCheck,
        iconClass: "bg-blue-50 text-blue-600",
        accent: "border-l-blue-500",
      },
    };

    return (
      meta[type] || {
        icon: Info,
        iconClass: "bg-blue-50 text-blue-600",
        accent: "border-l-blue-500",
      }
    );
  };

  // --------------------------------------------------
  // Generate notifications
  // --------------------------------------------------

  const notifications = useMemo(() => {
    const items = [];

    if (!role) {
      return items;
    }

    bookings.forEach((booking) => {
      const status = String(booking?.status || "").toLowerCase();

      const paymentStatus = String(
        booking?.paymentStatus || ""
      ).toLowerCase();

      const bookingId = booking?._id || booking?.id;

      const date = booking?.updatedAt || booking?.createdAt;

      // ==============================================
      // OWNER NOTIFICATIONS
      // ==============================================

      if (role === "owner") {
        const studentName =
          booking?.student?.name || "A student";

        const propertyName =
          booking?.property?.name || "your property";

        // New booking request
        if (status === "pending") {
          items.push({
            id: `${bookingId}-pending`,
            type: "pending",
            title: "New booking request",
            message: `${studentName} submitted a booking request for ${propertyName}.`,
            date,
          });
        }

        // Booking confirmed
        if (status === "confirmed") {
          items.push({
            id: `${bookingId}-confirmed`,
            type: "confirmed",
            title: "Booking confirmed",
            message: `The booking for ${studentName} at ${propertyName} is confirmed.`,
            date,
          });
        }

        // Payment pending
        if (
          status === "confirmed" &&
          paymentStatus === "pending"
        ) {
          items.push({
            id: `${bookingId}-payment-pending`,
            type: "payment-pending",
            title: "Payment pending",
            message: `${studentName}'s booking is confirmed but payment is still pending.`,
            date,
          });
        }

        // Payment received
        if (paymentStatus === "paid") {
          items.push({
            id: `${bookingId}-paid`,
            type: "paid",
            title: "Payment received",
            message: `Payment for ${studentName}'s booking at ${propertyName} has been received.`,
            date,
          });
        }

        // Booking rejected
        if (status === "rejected") {
          items.push({
            id: `${bookingId}-rejected`,
            type: "rejected",
            title: "Booking rejected",
            message: `The booking request from ${studentName} was rejected.`,
            date,
          });
        }

        // Booking cancelled
        if (status === "cancelled") {
          items.push({
            id: `${bookingId}-cancelled`,
            type: "cancelled",
            title: "Booking cancelled",
            message: `${studentName}'s booking for ${propertyName} has been cancelled.`,
            date,
          });
        }

        // Booking completed
        if (status === "completed") {
          items.push({
            id: `${bookingId}-completed`,
            type: "completed",
            title: "Booking completed",
            message: `${studentName}'s booking at ${propertyName} has been completed.`,
            date,
          });
        }
      }

      // ==============================================
      // STUDENT NOTIFICATIONS
      // ==============================================

      if (role === "student") {
        const propertyName =
          booking?.property?.name || "your property";

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
            id: `${bookingId}-payment-pending`,
            type: "payment-pending",
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
            message: `Your stay at ${propertyName} has been completed.`,
            date,
          });
        }
      }
    });

    return items
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime()
      )
      .slice(0, 5);
  }, [bookings, role]);

  // --------------------------------------------------
  // Read status
  // --------------------------------------------------

  const isNotificationRead = (notificationId) => {
    return readNotifications.includes(notificationId);
  };

  // --------------------------------------------------
  // Mark one as read
  // --------------------------------------------------

  const markAsRead = (notificationId) => {
    if (readNotifications.includes(notificationId)) {
      return;
    }

    const updated = [
      ...readNotifications,
      notificationId,
    ];

    setReadNotifications(updated);

    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(updated)
    );
  };

  // --------------------------------------------------
  // Mark all as read
  // --------------------------------------------------

  const markAllAsRead = () => {
    const notificationIds = notifications.map(
      (notification) => notification.id
    );

    const updated = Array.from(
      new Set([
        ...readNotifications,
        ...notificationIds,
      ])
    );

    setReadNotifications(updated);

    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(updated)
    );
  };

  // --------------------------------------------------
  // Unread count
  // --------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) =>
      !isNotificationRead(notification.id)
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

    const diff = Date.now() - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return "Just now";
    }

    if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes}m ago`;
    }

    if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours}h ago`;
    }

    if (diff < 7 * day) {
      const days = Math.floor(diff / day);
      return `${days}d ago`;
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  // --------------------------------------------------
  // Close dropdown when clicking outside
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // Close with Escape
  // --------------------------------------------------

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // --------------------------------------------------
  // Hide for guests
  // --------------------------------------------------

  if (!token || !user) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* Notification button */}

      <button
        type="button"
        onClick={() => {
          setIsOpen((previous) => !previous);
          fetchNotifications();
        }}
        className={[
          "relative flex h-10 w-10 items-center justify-center",
          "rounded-xl border border-transparent",
          "text-gray-600 transition-all duration-200",
          "hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          isOpen
            ? "border-gray-200 bg-gray-50 text-gray-900"
            : "",
        ].join(" ")}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {unreadCount > 0 ? (
          <BellRing
            size={20}
            strokeWidth={1.9}
            className="text-blue-600"
            aria-hidden="true"
          />
        ) : (
          <Bell
            size={20}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}

        {/* Unread badge */}

        {unreadCount > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              flex h-5 min-w-5 items-center justify-center
              rounded-full bg-red-500 px-1
              text-[10px] font-bold text-white
              ring-2 ring-white
            "
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {isOpen && (
        <div
          className="
            absolute right-0 z-50 mt-3
            w-[calc(100vw-1.5rem)]
            max-w-[390px]
            overflow-hidden
            rounded-2xl
            border border-gray-200
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.16)]
            animate-[notificationDropIn_180ms_ease-out]
          "
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}

          <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bell
                    size={19}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Your latest booking updates
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="
                  mt-4 inline-flex items-center gap-1.5
                  text-xs font-semibold text-blue-600
                  transition hover:text-blue-800
                  focus:outline-none
                "
              >
                <CheckCheck
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Mark all as read
              </button>
            )}
          </div>

          {/* Loading */}

          {loading && (
            <div className="space-y-3 px-4 py-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse gap-3"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-2/5 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-2.5 w-1/4 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}

          {!loading && notifications.length === 0 && (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Bell
                  size={25}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <h4 className="mt-4 text-sm font-bold text-gray-900">
                No notifications
              </h4>

              <p className="mx-auto mt-1.5 max-w-[240px] text-xs leading-5 text-gray-500">
                You're all caught up. New booking
                updates will appear here.
              </p>
            </div>
          )}

          {/* Notification list */}

          {!loading && notifications.length > 0 && (
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.map((notification) => {
                const isRead = isNotificationRead(
                  notification.id
                );

                const meta = getNotificationMeta(
                  notification.type
                );

                const Icon = meta.icon;

                return (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                    className={[
                      "group relative w-full border-b border-gray-100",
                      "border-l-[3px] px-4 py-4 text-left",
                      "transition-all duration-150",
                      "hover:bg-gray-50",
                      meta.accent,
                      isRead
                        ? "bg-white"
                        : "bg-blue-50/40",
                    ].join(" ")}
                  >
                    <div className="flex gap-3">
                      {/* Notification icon */}

                      <div
                        className={[
                          "flex h-10 w-10 shrink-0",
                          "items-center justify-center",
                          "rounded-xl transition-transform",
                          "group-hover:scale-105",
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
                        <div className="flex items-start gap-2">
                          <p
                            className={[
                              "min-w-0 flex-1 text-sm leading-5",
                              isRead
                                ? "font-semibold text-gray-700"
                                : "font-bold text-gray-900",
                            ].join(" ")}
                          >
                            {notification.title}
                          </p>

                          {!isRead && (
                            <span
                              className="
                                mt-1.5 h-2 w-2 shrink-0
                                rounded-full bg-blue-600
                              "
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                          <CalendarDays
                            size={12}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <span>
                            {formatRelativeTime(
                              notification.date
                            )}
                          </span>

                          {!isRead && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-blue-600">
                                New
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}

          <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                flex w-full items-center justify-center gap-1.5
                rounded-xl px-3 py-2
                text-xs font-semibold text-gray-600
                transition
                hover:bg-white hover:text-gray-900
                focus:outline-none
              "
            >
              <X
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;