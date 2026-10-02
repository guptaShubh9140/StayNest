import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import PayNowButton from "../components/payment/PayNowButton";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Bookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { success: showSuccess, error: showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // --------------------------------------------------
  // FETCH BOOKINGS
  // --------------------------------------------------

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bookings");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(err.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --------------------------------------------------
  // BOOKING CREATED MESSAGE
  // --------------------------------------------------

  useEffect(() => {
    if (location.state?.bookingCreated) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );
    }
  }, [location.state]);

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------

  const getBookingStatus = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    switch (normalizedStatus) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: RotateCcw,
          className:
            "border-gray-200 bg-gray-100 text-gray-600",
        };

      case "completed":
        return {
          label: "Completed",
          icon: Check,
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Info,
          className:
            "border-gray-200 bg-gray-100 text-gray-600",
        };
    }
  };

  const getPaymentStatus = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    switch (normalizedStatus) {
      case "paid":
        return {
          label: "Paid",
          icon: CheckCircle2,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        };

      case "pending":
        return {
          label: "Payment Pending",
          icon: CreditCard,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };

      case "failed":
        return {
          label: "Payment Failed",
          icon: AlertCircle,
          className:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "refunded":
        return {
          label: "Refunded",
          icon: RotateCcw,
          className:
            "border-purple-200 bg-purple-50 text-purple-700",
        };

      default:
        return {
          label: status || "Not Paid",
          icon: CreditCard,
          className:
            "border-gray-200 bg-gray-100 text-gray-600",
        };
    }
  };

  // --------------------------------------------------
  // BOOKING DATA HELPERS
  // --------------------------------------------------

  const getPropertyName = (booking) => {
    return (
      booking?.property?.name ||
      booking?.propertyName ||
      "Property"
    );
  };

  const getRoomType = (booking) => {
    return (
      booking?.room?.roomType ||
      booking?.roomType ||
      "Room"
    );
  };

  const getMonthlyRent = (booking) => {
    return (
      booking?.room?.monthlyRent ||
      booking?.monthlyRent ||
      booking?.rent ||
      0
    );
  };

  const getSecurityDeposit = (booking) => {
    return (
      booking?.room?.securityDeposit ||
      booking?.securityDeposit ||
      0
    );
  };

  const getPropertyLocation = (booking) => {
    const address = booking?.property?.address;

    if (!address) {
      return null;
    }

    return [address.area, address.city]
      .filter(Boolean)
      .join(", ");
  };

  // --------------------------------------------------
  // BOOKING COUNTS
  // --------------------------------------------------

  const bookingStats = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) =>
        String(booking.status).toLowerCase() === "pending",
    ).length;

    const confirmed = bookings.filter(
      (booking) =>
        String(booking.status).toLowerCase() === "confirmed",
    ).length;

    const paid = bookings.filter(
      (booking) =>
        String(booking.paymentStatus).toLowerCase() === "paid",
    ).length;

    const completed = bookings.filter(
      (booking) =>
        String(booking.status).toLowerCase() === "completed",
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        String(booking.status).toLowerCase() === "cancelled",
    ).length;

    return {
      total,
      pending,
      confirmed,
      paid,
      completed,
      cancelled,
    };
  }, [bookings]);

  // --------------------------------------------------
  // FILTERED BOOKINGS
  // --------------------------------------------------

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) =>
        String(booking.status).toLowerCase() === activeTab,
    );
  }, [bookings, activeTab]);

  // --------------------------------------------------
  // STUDENT NOTIFICATIONS
  // --------------------------------------------------

  const studentNotifications = useMemo(() => {
    const notifications = [];

    bookings.forEach((booking) => {
      const bookingStatus = String(
        booking?.status || "",
      ).toLowerCase();

      const paymentStatus = String(
        booking?.paymentStatus || "",
      ).toLowerCase();

      const propertyName =
        booking?.property?.name ||
        booking?.propertyName ||
        "Your property";

      const bookingId = booking?._id || booking?.id;

      const date = booking?.updatedAt || booking?.createdAt;

      if (bookingStatus === "pending") {
        notifications.push({
          id: `${bookingId}-pending`,
          type: "booking",
          icon: Clock3,
          title: "Booking awaiting confirmation",
          message: `${propertyName} has not been confirmed by the owner yet.`,
          className:
            "border-amber-200 bg-amber-50 text-amber-800",
          date,
        });
      }

      if (bookingStatus === "confirmed") {
        notifications.push({
          id: `${bookingId}-confirmed`,
          type: "booking",
          icon: CheckCircle2,
          title: "Booking confirmed",
          message: `${propertyName} has been confirmed by the owner.`,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-800",
          date,
        });
      }

      if (
        bookingStatus === "confirmed" &&
        paymentStatus === "pending"
      ) {
        notifications.push({
          id: `${bookingId}-payment`,
          type: "payment",
          icon: CreditCard,
          title: "Payment is pending",
          message:
            "Your booking is confirmed. Complete the payment to secure your reservation.",
          className:
            "border-blue-200 bg-blue-50 text-blue-800",
          date,
        });
      }

      if (paymentStatus === "paid") {
        notifications.push({
          id: `${bookingId}-paid`,
          type: "payment",
          icon: CheckCircle2,
          title: "Payment successful",
          message: `Payment for ${propertyName} has been recorded successfully.`,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-800",
          date,
        });
      }

      if (paymentStatus === "failed") {
        notifications.push({
          id: `${bookingId}-payment-failed`,
          type: "payment",
          icon: AlertCircle,
          title: "Payment failed",
          message:
            "Your payment was not completed. You can try the payment again.",
          className:
            "border-red-200 bg-red-50 text-red-800",
          date,
        });
      }

      if (bookingStatus === "rejected") {
        notifications.push({
          id: `${bookingId}-rejected`,
          type: "booking",
          icon: XCircle,
          title: "Booking request rejected",
          message: booking?.rejectionReason
            ? `Reason: ${booking.rejectionReason}`
            : `${propertyName} rejected your booking request.`,
          className:
            "border-red-200 bg-red-50 text-red-800",
          date,
        });
      }

      if (bookingStatus === "cancelled") {
        notifications.push({
          id: `${bookingId}-cancelled`,
          type: "booking",
          icon: RotateCcw,
          title: "Booking cancelled",
          message: `Your booking for ${propertyName} has been cancelled.`,
          className:
            "border-gray-200 bg-gray-50 text-gray-700",
          date,
        });
      }

      if (bookingStatus === "completed") {
        notifications.push({
          id: `${bookingId}-completed`,
          type: "booking",
          icon: CheckCircle2,
          title: "Booking completed",
          message: `Your stay at ${propertyName} has been marked as completed.`,
          className:
            "border-blue-200 bg-blue-50 text-blue-800",
          date,
        });
      }
    });

    return notifications
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime(),
      )
      .slice(0, 3);
  }, [bookings]);

  // --------------------------------------------------
  // BOOKING TIMELINE
  // --------------------------------------------------

  const getBookingTimeline = (booking) => {
    const bookingStatus = String(
      booking?.status || "",
    ).toLowerCase();

    const paymentStatus = String(
      booking?.paymentStatus || "",
    ).toLowerCase();

    if (bookingStatus === "rejected") {
      return [
        {
          label: "Booking Requested",
          icon: Check,
          state: "completed",
        },
        {
          label: "Booking Rejected",
          icon: X,
          state: "rejected",
        },
      ];
    }

    if (bookingStatus === "cancelled") {
      return [
        {
          label: "Booking Requested",
          icon: Check,
          state: "completed",
        },
        {
          label: "Booking Cancelled",
          icon: RotateCcw,
          state: "cancelled",
        },
      ];
    }

    return [
      {
        label: "Booking Requested",
        icon: Check,
        state: "completed",
      },
      {
        label: "Owner Confirmation",
        icon: bookingStatus === "pending" ? Clock3 : Check,
        state:
          bookingStatus === "pending"
            ? "current"
            : "completed",
      },
      {
        label: "Payment",
        icon: paymentStatus === "paid" ? Check : CreditCard,
        state:
          paymentStatus === "paid"
            ? "completed"
            : bookingStatus === "confirmed"
              ? "current"
              : "upcoming",
      },
      {
        label: "Booking Completed",
        icon:
          bookingStatus === "completed"
            ? Check
            : CalendarDays,
        state:
          bookingStatus === "completed"
            ? "completed"
            : "upcoming",
      },
    ];
  };

  // --------------------------------------------------
  // CANCEL BOOKING
  // --------------------------------------------------

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    if (cancelLoading) return;

    setCancelModalOpen(false);
    setSelectedBookingId(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId || cancelLoading) {
      return;
    }

    try {
      setCancelLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/bookings/${selectedBookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel booking",
        );
      }

      setCancelModalOpen(false);
      setSelectedBookingId(null);

      showSuccess(
        "Booking cancelled",
        "Your booking has been cancelled successfully.",
      );

      await fetchBookings(true);
    } catch (err) {
      console.error("Cancel booking error:", err);

      showError(
        "Cancellation failed",
        err.message || "Failed to cancel booking.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-64 rounded-xl bg-gray-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="mt-5 h-8 w-14 rounded bg-gray-200" />
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-5">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-80 rounded-3xl border border-gray-200 bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && bookings.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-950 sm:text-2xl">
              Unable to load bookings
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchBookings()}
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // TABS
  // --------------------------------------------------

  const tabs = [
    {
      id: "all",
      label: "All",
      count: bookingStats.total,
    },
    {
      id: "pending",
      label: "Pending",
      count: bookingStats.pending,
    },
    {
      id: "confirmed",
      label: "Confirmed",
      count: bookingStats.confirmed,
    },
    {
      id: "completed",
      label: "Completed",
      count: bookingStats.completed,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: bookingStats.cancelled,
    },
  ];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          {/* HEADER */}

          <section className="mb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Sparkles
                    size={13}
                    strokeWidth={2}
                  />
                  Student Dashboard
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  My Bookings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                  Track your reservations, booking requests,
                  payments, and stay progress in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchBookings(true)}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </section>

          {/* BOOKING CREATED */}

          {location.state?.bookingCreated && (
            <div className="mb-7 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
              <div className="flex gap-3 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Booking request submitted
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    Your request has been sent to the property
                    owner for confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STATS */}

          <section
            aria-label="Booking statistics"
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                label: "Total Bookings",
                value: bookingStats.total,
                icon: CalendarDays,
                iconClass:
                  "bg-blue-50 text-blue-600",
              },
              {
                label: "Pending",
                value: bookingStats.pending,
                icon: Clock3,
                iconClass:
                  "bg-amber-50 text-amber-600",
              },
              {
                label: "Confirmed",
                value: bookingStats.confirmed,
                icon: CheckCircle2,
                iconClass:
                  "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Payments Completed",
                value: bookingStats.paid,
                icon: CreditCard,
                iconClass:
                  "bg-purple-50 text-purple-600",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* QUICK INFO */}

          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-950">
                    StayNest booking flow
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Request a property, wait for owner
                    confirmation, complete payment, and track
                    your stay from this page.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Search size={17} />
              Find another stay
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {/* NOTIFICATIONS */}

          {studentNotifications.length > 0 && (
            <section className="mb-8">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-950">
                    Recent Updates
                  </h2>

                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                    {studentNotifications.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Important updates about your bookings and
                  payments.
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {studentNotifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-2xl border p-4 ${notification.className}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 opacity-80">
                            {notification.message}
                          </p>

                          {notification.date && (
                            <p className="mt-2 text-[11px] opacity-60">
                              {formatDate(notification.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* INLINE ERROR */}

          {error && bookings.length > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Couldn't refresh your bookings
                </p>

                <p className="mt-1 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* FILTER TABS */}

          {bookings.length > 0 && (
            <section className="mb-6">
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                <div className="flex min-w-max gap-1">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setActiveTab(tab.id)
                        }
                        className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-gray-950 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                        }`}
                      >
                        {tab.label}

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* EMPTY STATE */}

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Home size={28} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-950">
                No bookings yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                You haven't submitted any booking requests.
                Explore available PGs, hostels, and co-living
                spaces to find your next stay.
              </p>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="group mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Search size={17} />
                Find a Property
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <Search size={24} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-gray-900">
                No {activeTab} bookings
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                There are no bookings in this category yet.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all bookings
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredBookings.map((booking) => {
                const bookingStatus = getBookingStatus(
                  booking.status,
                );

                const paymentStatus = getPaymentStatus(
                  booking.paymentStatus,
                );

                const BookingStatusIcon =
                  bookingStatus.icon;

                const PaymentStatusIcon =
                  paymentStatus.icon;

                const monthlyRent =
                  getMonthlyRent(booking);

                const securityDeposit =
                  getSecurityDeposit(booking);

                /*
                 * Informational amount only.
                 * Razorpay amount is controlled by the backend
                 * through PayNowButton.
                 */
                const initialAmount =
                  Number(monthlyRent || 0) +
                  Number(securityDeposit || 0);

                const normalizedBookingStatus =
                  String(
                    booking.status || "",
                  ).toLowerCase();

                const normalizedPaymentStatus =
                  String(
                    booking.paymentStatus || "",
                  ).toLowerCase();

                const canPay =
                  normalizedBookingStatus ===
                    "confirmed" &&
                  normalizedPaymentStatus === "pending";

                const canCancel = [
                  "pending",
                  "confirmed",
                ].includes(normalizedBookingStatus);

                const propertyLocation =
                  getPropertyLocation(booking);

                return (
                  <article
                    key={booking._id}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* CARD HEADER */}

                    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <Home size={21} />
                            </div>

                            <div className="min-w-0">
                              <h2 className="truncate text-lg font-bold text-gray-950 sm:text-xl">
                                {getPropertyName(
                                  booking,
                                )}
                              </h2>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                <span className="capitalize">
                                  {getRoomType(booking)} Room
                                </span>

                                {propertyLocation && (
                                  <>
                                    <span className="hidden text-gray-300 sm:inline">
                                      •
                                    </span>

                                    <span className="inline-flex items-center gap-1">
                                      <MapPin size={13} />
                                      {propertyLocation}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${bookingStatus.className}`}
                          >
                            <BookingStatusIcon
                              size={14}
                            />
                            {bookingStatus.label}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${paymentStatus.className}`}
                          >
                            <PaymentStatusIcon
                              size={14}
                            />
                            {paymentStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY */}

                    <div className="p-5 sm:p-6">
                      {/* DATE / PRICE GRID */}

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <CalendarDays size={14} />

                            <p className="text-[11px] font-semibold uppercase tracking-wider">
                              Move-in
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-bold text-gray-900">
                            {formatDate(
                              booking.startDate,
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <CalendarDays size={14} />

                            <p className="text-[11px] font-semibold uppercase tracking-wider">
                              Move-out
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-bold text-gray-900">
                            {formatDate(
                              booking.endDate,
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <IndianRupee size={14} />

                            <p className="text-[11px] font-semibold uppercase tracking-wider">
                              Monthly Rent
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-bold text-gray-900">
                            {formatCurrency(
                              monthlyRent,
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <ShieldCheck size={14} />

                            <p className="text-[11px] font-semibold uppercase tracking-wider">
                              Deposit
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-bold text-gray-900">
                            {formatCurrency(
                              securityDeposit,
                            )}
                          </p>
                        </div>
                      </div>

                      {/* PAYMENT SUMMARY */}

                      <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <CreditCard
                                  size={15}
                                  className="text-blue-600"
                                />

                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                  Initial Amount
                                </p>
                              </div>

                              <p className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                                {formatCurrency(
                                  initialAmount,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Monthly rent + security
                                deposit
                              </p>
                            </div>

                            {canPay && (
                              <div className="w-full sm:w-60">
                                <PayNowButton
                                  bookingId={
                                    booking._id
                                  }
                                  token={localStorage.getItem(
                                    "token",
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* REJECTION */}

                      {normalizedBookingStatus ===
                        "rejected" &&
                        booking.rejectionReason && (
                          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                <XCircle size={18} />
                              </div>

                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                                  Rejection Reason
                                </p>

                                <p className="mt-2 text-sm leading-6 text-red-700">
                                  {
                                    booking.rejectionReason
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* STATUS MESSAGE */}

                      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        {normalizedBookingStatus ===
                          "pending" && (
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                              <Clock3 size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Waiting for owner
                                confirmation
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                The property owner
                                needs to review your
                                booking request.
                              </p>
                            </div>
                          </div>
                        )}

                        {normalizedBookingStatus ===
                          "confirmed" && (
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                              <CheckCircle2
                                size={18}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Booking confirmed
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                Your booking has been
                                confirmed. Complete
                                the payment to secure
                                your reservation.
                              </p>
                            </div>
                          </div>
                        )}

                        {normalizedBookingStatus ===
                          "rejected" && (
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                              <XCircle size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Booking request
                                rejected
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                You can browse other
                                available properties
                                and submit a new
                                booking request.
                              </p>
                            </div>
                          </div>
                        )}

                        {normalizedBookingStatus ===
                          "cancelled" && (
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600">
                              <RotateCcw size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Booking cancelled
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                This booking is no
                                longer active.
                              </p>
                            </div>
                          </div>
                        )}

                        {normalizedBookingStatus ===
                          "completed" && (
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                              <CheckCircle2
                                size={18}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Booking completed
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                This booking has been
                                completed.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* TIMELINE */}

                      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                        <div className="mb-6">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <ArrowRight size={15} />
                            </div>

                            <h3 className="text-sm font-bold text-gray-950">
                              Booking Progress
                            </h3>
                          </div>

                          <p className="mt-2 text-xs text-gray-500">
                            Track the current stage of your
                            reservation.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-4">
                          {getBookingTimeline(
                            booking,
                          ).map(
                            (
                              step,
                              index,
                              steps,
                            ) => {
                              const Icon =
                                step.icon;

                              const isLast =
                                index ===
                                steps.length - 1;

                              const iconClass =
                                step.state ===
                                "completed"
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                  : step.state ===
                                      "current"
                                    ? "border-blue-200 bg-blue-100 text-blue-700 ring-4 ring-blue-50"
                                    : step.state ===
                                        "rejected"
                                      ? "border-red-200 bg-red-100 text-red-700"
                                      : step.state ===
                                          "cancelled"
                                        ? "border-gray-200 bg-gray-100 text-gray-600"
                                        : "border-gray-200 bg-white text-gray-400";

                              const textClass =
                                step.state ===
                                "completed"
                                  ? "text-gray-900"
                                  : step.state ===
                                      "current"
                                    ? "text-blue-700"
                                    : step.state ===
                                        "rejected"
                                      ? "text-red-700"
                                      : step.state ===
                                          "cancelled"
                                        ? "text-gray-700"
                                        : "text-gray-400";

                              return (
                                <div
                                  key={
                                    step.label
                                  }
                                  className="relative"
                                >
                                  <div className="flex items-start gap-3 sm:block">
                                    <div
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${iconClass}`}
                                    >
                                      <Icon
                                        size={16}
                                      />
                                    </div>

                                    <div className="pt-1 sm:mt-3 sm:pt-0">
                                      <p
                                        className={`text-sm font-semibold ${textClass}`}
                                      >
                                        {
                                          step.label
                                        }
                                      </p>

                                      {step.state ===
                                        "current" && (
                                        <p className="mt-1 text-[11px] font-semibold text-blue-600">
                                          Current stage
                                        </p>
                                      )}

                                      {step.state ===
                                        "completed" && (
                                        <p className="mt-1 text-[11px] text-gray-400">
                                          Completed
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {!isLast && (
                                    <div className="absolute left-9 right-[-16px] top-4 hidden h-px bg-gray-200 sm:block" />
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <CalendarDays size={14} />

                          {booking.createdAt
                            ? `Requested on ${formatDate(
                                booking.createdAt,
                              )}`
                            : "Booking request"}
                        </div>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() =>
                              openCancelModal(
                                booking._id,
                              )
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <Ban size={15} />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* CANCEL MODAL */}

      <Modal
        open={cancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelBooking}
        title="Cancel this booking?"
        description="Are you sure you want to cancel this booking? This action may not be reversible."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        showCancel
        showConfirm
        loading={cancelLoading}
        variant="danger"
        size="sm"
      />
    </>
  );
};

export default Bookings;