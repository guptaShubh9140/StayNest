import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  Mail,
  RefreshCw,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { getAdminBookings } from "../lib/api";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

const LoadingBlock = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
};

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

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AdminBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { error: showError } = useToast();

  // --------------------------------------------------
  // Fetch bookings
  // --------------------------------------------------

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getAdminBookings(token);

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Admin bookings error:", error);

      const errorMessage =
        error.message || "Failed to load bookings.";

      setError(errorMessage);

      showError("Unable to load bookings", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // --------------------------------------------------
  // Booking statistics
  // --------------------------------------------------

  const stats = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) => booking.status === "pending"
    ).length;

    const confirmed = bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;

    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;

    const cancelled = bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;

    const rejected = bookings.filter(
      (booking) => booking.status === "rejected"
    ).length;

    const paid = bookings.filter(
      (booking) => booking.paymentStatus === "paid"
    ).length;

    const paymentPending = bookings.filter(
      (booking) => booking.paymentStatus === "pending"
    ).length;

    const paymentFailed = bookings.filter(
      (booking) => booking.paymentStatus === "failed"
    ).length;

    const totalValue = bookings.reduce((sum, booking) => {
      const rent = Number(booking.monthlyRent || 0);
      const deposit = Number(
        booking.securityDeposit || 0
      );

      return sum + rent + deposit;
    }, 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      rejected,
      paid,
      paymentPending,
      paymentFailed,
      totalValue,
    };
  }, [bookings]);

  // --------------------------------------------------
  // Status helpers
  // --------------------------------------------------

  const getBookingStatusStyles = (status) => {
    switch (status) {
      case "confirmed":
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };

      case "completed":
        return {
          wrapper:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: CheckCircle2,
        };

      case "cancelled":
        return {
          wrapper:
            "border-gray-200 bg-gray-100 text-gray-700",
          icon: XCircle,
        };

      case "rejected":
        return {
          wrapper:
            "border-red-200 bg-red-50 text-red-700",
          icon: XCircle,
        };

      default:
        return {
          wrapper:
            "border-amber-200 bg-amber-50 text-amber-700",
          icon: Clock3,
        };
    }
  };

  const getPaymentStatusStyles = (status) => {
    switch (status) {
      case "paid":
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };

      case "failed":
        return {
          wrapper:
            "border-red-200 bg-red-50 text-red-700",
          icon: XCircle,
        };

      case "refunded":
        return {
          wrapper:
            "border-purple-200 bg-purple-50 text-purple-700",
          icon: CreditCard,
        };

      default:
        return {
          wrapper:
            "border-amber-200 bg-amber-50 text-amber-700",
          icon: Clock3,
        };
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <LoadingBlock className="h-48 rounded-3xl" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingBlock
                key={index}
                className="h-28 rounded-2xl"
              />
            ))}
          </div>

          <Card padding="none" className="mt-8 overflow-hidden">
            <div className="hidden border-b bg-gray-50 p-5 lg:grid lg:grid-cols-6 lg:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingBlock
                  key={index}
                  className="h-4"
                />
              ))}
            </div>

            <div className="space-y-5 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-4 lg:grid-cols-6"
                >
                  {Array.from({ length: 6 }).map(
                    (_, item) => (
                      <LoadingBlock
                        key={item}
                        className="h-12"
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            title="Unable to load bookings"
            description={error}
            onRetry={fetchBookings}
            retryLabel="Reload Bookings"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                <CalendarDays size={14} />
                Booking management
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Manage Bookings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor all StayNest bookings, booking statuses,
                payment states, and booking values from one
                centralized workspace.
              </p>
            </div>

            <Button
              variant="secondary"
              size="md"
              icon={ArrowLeft}
              onClick={() =>
                navigate("/admin/dashboard")
              }
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  All booking records
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays size={21} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.pending}
                </p>

                <p className="mt-1 text-xs text-amber-600">
                  Awaiting confirmation
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={21} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.confirmed}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Active confirmed bookings
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Paid
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.paid}
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Payment completed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CreditCard size={21} />
              </div>
            </div>
          </Card>
        </section>

        {/* Overview */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Completed
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <XCircle size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Cancelled / Rejected
                </p>

                <p className="text-lg font-bold text-gray-900">
                  {stats.cancelled + stats.rejected}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Displayed Booking Value
                </p>

                <p className="text-lg font-bold text-gray-900">
                  ₹{stats.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section header */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              All Bookings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review students, properties, dates, statuses,
              payments, and amounts.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchBookings}
          >
            Refresh
          </Button>
        </div>

        {/* Empty */}
        {bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={CalendarDays}
              title="No bookings found"
              description="There are currently no bookings in the StayNest system."
              action={
                <Button
                  variant="secondary"
                  icon={ArrowLeft}
                  onClick={() =>
                    navigate("/admin/dashboard")
                  }
                >
                  Back to Dashboard
                </Button>
              }
            />
          </div>
        ) : (
          <Card
            padding="none"
            className="mt-6 overflow-hidden"
          >
            {/* Desktop table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-gray-200 bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Property
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Dates
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const student = booking.student;
                    const property = booking.property;

                    const rent = Number(
                      booking.monthlyRent || 0
                    );

                    const deposit = Number(
                      booking.securityDeposit || 0
                    );

                    const totalAmount = rent + deposit;

                    const bookingStyles =
                      getBookingStatusStyles(
                        booking.status
                      );

                    const BookingStatusIcon =
                      bookingStyles.icon;

                    const paymentStyles =
                      getPaymentStatusStyles(
                        booking.paymentStatus
                      );

                    const PaymentStatusIcon =
                      paymentStyles.icon;

                    return (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Student */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                              {student?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {student?.name || "—"}
                              </p>

                              <div className="mt-1 flex max-w-[210px] items-center gap-1.5 text-xs text-gray-500">
                                <Mail
                                  size={13}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {student?.email || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Property */}
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Home size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate font-semibold text-gray-900">
                                {property?.name || "—"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                ID:{" "}
                                {booking._id?.slice(
                                  -8
                                ) || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-5">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={14}
                                className="text-blue-500"
                              />

                              <span className="text-gray-700">
                                {formatDate(
                                  booking.startDate
                                )}
                              </span>
                            </div>

                            <div className="pl-5 text-xs text-gray-500">
                              to{" "}
                              {formatDate(
                                booking.endDate
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Booking status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${bookingStyles.wrapper}`}
                          >
                            <BookingStatusIcon
                              size={13}
                            />

                            {formatStatus(
                              booking.status
                            )}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${paymentStyles.wrapper}`}
                          >
                            <PaymentStatusIcon
                              size={13}
                            />

                            {formatStatus(
                              booking.paymentStatus
                            )}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5 text-right">
                          <p className="font-bold text-gray-900">
                            ₹
                            {totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Rent ₹
                            {rent.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            Deposit ₹
                            {deposit.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tablet / mobile cards */}
            <div className="divide-y divide-gray-100 xl:hidden">
              {bookings.map((booking) => {
                const student = booking.student;
                const property = booking.property;

                const rent = Number(
                  booking.monthlyRent || 0
                );

                const deposit = Number(
                  booking.securityDeposit || 0
                );

                const totalAmount = rent + deposit;

                const bookingStyles =
                  getBookingStatusStyles(
                    booking.status
                  );

                const BookingStatusIcon =
                  bookingStyles.icon;

                const paymentStyles =
                  getPaymentStatusStyles(
                    booking.paymentStatus
                  );

                const PaymentStatusIcon =
                  paymentStyles.icon;

                return (
                  <div
                    key={booking._id}
                    className="p-5 sm:p-6"
                  >
                    {/* Top */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                        {student?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "S"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900">
                          {student?.name || "Unknown Student"}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={13} />

                          <span className="truncate">
                            {student?.email || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹
                          {totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="text-xs text-gray-500">
                          booking value
                        </p>
                      </div>
                    </div>

                    {/* Property */}
                    <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                          <Home size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {property?.name || "Unknown Property"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Booking ID:{" "}
                            {booking._id || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="text-xs text-gray-500">
                          Start Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatDate(
                            booking.startDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="text-xs text-gray-500">
                          End Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {formatDate(
                            booking.endDate
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Booking Status
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${bookingStyles.wrapper}`}
                        >
                          <BookingStatusIcon size={13} />

                          {formatStatus(
                            booking.status
                          )}
                        </span>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Payment
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${paymentStyles.wrapper}`}
                        >
                          <PaymentStatusIcon size={13} />

                          {formatStatus(
                            booking.paymentStatus
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Amount breakdown */}
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">
                          Rent
                        </p>

                        <p className="font-semibold text-gray-900">
                          ₹
                          {rent.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Deposit
                        </p>

                        <p className="font-semibold text-gray-900">
                          ₹
                          {deposit.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Total
                        </p>

                        <p className="font-bold text-gray-900">
                          ₹
                          {totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;