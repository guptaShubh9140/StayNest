import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import OwnerBookingNotifications from "../components/notifications/OwnerBookingNotifications";
import Modal from "../components/ui/Modal";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";

import {
  getOwnerBookings,
  confirmBooking,
  rejectBooking,
  completeBooking,
} from "../lib/api";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = JSON.parse(storedUser || "null");
  } catch {
    user = null;
  }

  const {
    success: showSuccess,
    error: showError,
  } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Complete modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  // ========================================
  // FETCH BOOKINGS
  // ========================================

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const data = await getOwnerBookings(token);

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Owner dashboard error:", err);

      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ========================================
  // BOOKING COUNTS
  // ========================================

  const bookingStats = useMemo(() => {
    const stats = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      rejected: 0,
      completed: 0,
    };

    bookings.forEach((booking) => {
      const status = String(booking.status || "").toLowerCase();

      if (status === "pending") stats.pending += 1;
      if (status === "confirmed") stats.confirmed += 1;
      if (status === "rejected") stats.rejected += 1;
      if (status === "completed") stats.completed += 1;
    });

    return stats;
  }, [bookings]);

  // ========================================
  // CONFIRM BOOKING
  // ========================================

  const handleConfirm = async (bookingId) => {
    try {
      await confirmBooking(bookingId, token);

      showSuccess(
        "Booking confirmed",
        "The booking has been confirmed successfully."
      );

      await fetchBookings();
    } catch (err) {
      console.error("Confirm booking error:", err);

      showError(
        "Unable to confirm booking",
        err.message || "Failed to confirm booking"
      );
    }
  };

  // ========================================
  // REJECT BOOKING
  // ========================================

  const handleReject = (bookingId) => {
    setBookingToReject(bookingId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (rejectLoading) return;

    setRejectModalOpen(false);
    setBookingToReject(null);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!bookingToReject || rejectLoading) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      showError(
        "Rejection reason required",
        "Please provide a reason before rejecting the booking."
      );
      return;
    }

    try {
      setRejectLoading(true);

      await rejectBooking(
        bookingToReject,
        reason,
        token
      );

      setRejectModalOpen(false);
      setBookingToReject(null);
      setRejectionReason("");

      showSuccess(
        "Booking rejected",
        "The booking has been rejected successfully."
      );

      await fetchBookings();
    } catch (err) {
      console.error("Reject booking error:", err);

      showError(
        "Unable to reject booking",
        err.message || "Failed to reject booking"
      );
    } finally {
      setRejectLoading(false);
    }
  };

  // ========================================
  // COMPLETE BOOKING
  // ========================================

  const handleComplete = (bookingId) => {
    setBookingToComplete(bookingId);
    setCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    if (completeLoading) return;

    setCompleteModalOpen(false);
    setBookingToComplete(null);
  };

  const confirmComplete = async () => {
    if (!bookingToComplete || completeLoading) return;

    try {
      setCompleteLoading(true);

      await completeBooking(
        bookingToComplete,
        token
      );

      setCompleteModalOpen(false);
      setBookingToComplete(null);

      showSuccess(
        "Booking completed",
        "The booking has been marked as completed successfully."
      );

      await fetchBookings();
    } catch (err) {
      console.error("Complete booking error:", err);

      showError(
        "Unable to complete booking",
        err.message || "Failed to complete booking"
      );
    } finally {
      setCompleteLoading(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const getBookingData = (booking) => {
    const room =
      booking.room ||
      booking.roomDetails ||
      null;

    const status = String(
      booking.status || ""
    ).toLowerCase();

    const paymentStatus = String(
      booking.paymentStatus || "pending"
    ).toLowerCase();

    const roomType =
      room?.roomType ||
      booking.roomType ||
      "Room";

    const monthlyRent = Number(
      room?.monthlyRent ||
        booking.monthlyRent ||
        booking.rent ||
        0
    );

    const securityDeposit = Number(
      room?.securityDeposit ||
        booking.securityDeposit ||
        0
    );

    const startDate =
      booking.startDate ||
      booking.moveInDate;

    const endDate =
      booking.endDate ||
      booking.moveOutDate;

    return {
      roomType,
      status,
      paymentStatus,
      monthlyRent,
      securityDeposit,
      startDate,
      endDate,
    };
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="animate-pulse">
            <div className="h-56 rounded-3xl bg-gray-200" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="mt-8 h-64 rounded-2xl bg-white shadow-sm" />

            <div className="mt-8 h-96 rounded-2xl bg-white shadow-sm" />
          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <XCircle size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBookings}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const firstName =
    user?.name?.split(" ")?.[0] ||
    "Owner";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ========================================
            HERO
        ======================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-5 py-8 text-white shadow-xl sm:px-8 sm:py-10 lg:px-10 lg:py-12">

          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0 max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                <Building2 size={14} />
                Owner Dashboard
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome, {firstName}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                Manage your properties, review booking requests,
                and keep track of your tenants from one place.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/owner/properties/new"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
                >
                  <Plus size={17} />
                  <span>Add Property</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/owner/properties"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <Building2 size={17} />
                  My Properties
                </Link>

              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md">
                <Building2
                  size={58}
                  strokeWidth={1.5}
                  className="text-white"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================
            STATS
        ======================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Total Bookings"
            value={bookingStats.total}
            description="All booking requests"
            icon={ClipboardList}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Pending Requests"
            value={bookingStats.pending}
            description={
              bookingStats.pending > 0
                ? "Requires your attention"
                : "No pending requests"
            }
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Confirmed"
            value={bookingStats.confirmed}
            description="Active bookings"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Completed"
            value={bookingStats.completed}
            description="Completed stays"
            icon={ShieldCheck}
            iconClass="bg-purple-50 text-purple-600"
          />

        </section>

        {/* ========================================
            QUICK ACTIONS
        ======================================== */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access your most important owner tools.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              icon={Plus}
              title="Add Property"
              description="List a new PG, hostel or co-living property."
              iconClass="bg-blue-50 text-blue-600"
              onClick={() =>
                navigate("/owner/properties/new")
              }
            />

            <QuickAction
              icon={Home}
              title="My Properties"
              description="View, edit and manage your properties."
              iconClass="bg-emerald-50 text-emerald-600"
              onClick={() =>
                navigate("/owner/properties")
              }
            />

            <QuickAction
              icon={ClipboardList}
              title="Booking Requests"
              description="Review and manage student requests."
              iconClass="bg-purple-50 text-purple-600"
              badge={
                bookingStats.pending > 0
                  ? bookingStats.pending
                  : null
              }
              onClick={() =>
                scrollToSection("booking-requests")
              }
            />

            <QuickAction
              icon={Bell}
              title="Notifications"
              description="Check booking and payment updates."
              iconClass="bg-orange-50 text-orange-600"
              onClick={() =>
                scrollToSection("owner-notifications")
              }
            />

          </div>
        </section>

        {/* ========================================
            NOTIFICATIONS
        ======================================== */}

        <section
          id="owner-notifications"
          className="mt-8 scroll-mt-6"
        >
          <OwnerBookingNotifications />
        </section>

        {/* ========================================
            BOOKING REQUESTS
        ======================================== */}

        <section
          id="booking-requests"
          className="mt-8 scroll-mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
        >

          {/* Header */}

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Booking Requests
                  </h2>

                  {bookingStats.pending > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      {bookingStats.pending}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Review and manage booking requests from students.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBookings}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw size={15} />
                Refresh
              </button>

            </div>
          </div>

          {/* Empty */}

          {bookings.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <ClipboardList size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No booking requests
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                You don't have any booking requests yet.
                New requests from students will appear here.
              </p>

              <Link
                to="/owner/properties"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <Building2 size={16} />
                View My Properties
              </Link>

            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {bookings.map((booking) => {

                const {
                  roomType,
                  status,
                  paymentStatus,
                  monthlyRent,
                  securityDeposit,
                  startDate,
                  endDate,
                } = getBookingData(booking);

                return (
                  <article
                    key={booking._id}
                    className="p-5 transition-colors hover:bg-gray-50/70 sm:p-6 lg:p-7"
                  >

                    {/* Student + status */}

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex min-w-0 gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <UserRound size={20} />
                        </div>

                        <div className="min-w-0">

                          <h3 className="break-words text-base font-bold text-gray-900 sm:text-lg">
                            {booking.student?.name ||
                              "Unknown student"}
                          </h3>

                          <p className="mt-0.5 break-all text-sm text-gray-500">
                            {booking.student?.email ||
                              "No email available"}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                            <Building2
                              size={15}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="break-words">
                              {booking.property?.name ||
                                "Unknown property"}
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <StatusBadge status={status} />

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            paymentStatus === "paid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <WalletCards size={13} />

                          {paymentStatus === "paid"
                            ? "Paid"
                            : "Payment Pending"}
                        </span>

                      </div>

                    </div>

                    {/* Booking details */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <DetailBox
                        icon={Home}
                        label="Room"
                        value={roomType}
                      />

                      <DetailBox
                        icon={CalendarDays}
                        label="Move In"
                        value={formatDate(startDate)}
                      />

                      <DetailBox
                        icon={CalendarDays}
                        label="Move Out"
                        value={formatDate(endDate)}
                      />

                      <DetailBox
                        icon={WalletCards}
                        label="Monthly Rent"
                        value={formatCurrency(monthlyRent)}
                      />

                    </div>

                    {/* Financial summary */}

                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                            Booking Amount
                          </p>

                          <p className="mt-1 text-sm text-blue-900">
                            Monthly rent + security deposit
                          </p>
                        </div>

                        <div className="sm:text-right">

                          <p className="text-lg font-bold text-blue-950">
                            {formatCurrency(
                              monthlyRent +
                                securityDeposit
                            )}
                          </p>

                          <p className="text-xs text-blue-700">
                            Deposit:{" "}
                            {formatCurrency(
                              securityDeposit
                            )}
                          </p>

                        </div>

                      </div>
                    </div>

                    {/* Rejection reason */}

                    {status === "rejected" &&
                      booking.rejectionReason && (
                        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-sm leading-6 text-red-800">
                            {booking.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Footer */}

                    <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0 text-xs text-gray-400">
                        Booking ID:{" "}
                        <span className="break-all font-mono text-gray-500">
                          {booking._id}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        {/* Pending */}

                        {status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleConfirm(
                                  booking._id
                                )
                              }
                              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                            >
                              <Check size={16} />
                              Confirm Booking
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleReject(
                                  booking._id
                                )
                              }
                              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </>
                        )}

                        {/* Confirmed */}

                        {status === "confirmed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleComplete(
                                booking._id
                              )
                            }
                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                          >
                            <CheckCircle2 size={16} />
                            Mark Completed
                          </button>
                        )}

                        {/* Completed */}

                        {status === "completed" && (
                          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 size={16} />
                            Booking Completed
                          </span>
                        )}

                        {/* Rejected */}

                        {status === "rejected" && (
                          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                            <XCircle size={16} />
                            Booking Rejected
                          </span>
                        )}

                        {/* Cancelled */}

                        {status === "cancelled" && (
                          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600">
                            <X size={16} />
                            Booking Cancelled
                          </span>
                        )}

                      </div>
                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        <div className="h-6 sm:h-10" />
      </main>

      {/* ========================================
          REJECT MODAL
      ======================================== */}

      <Modal
        open={rejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        title="Reject Booking"
        description="Please provide a reason for rejecting this booking request."
        confirmText="Reject Booking"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="danger"
        loading={rejectLoading}
      >
        <div>
          <label
            htmlFor="rejection-reason"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Rejection Reason
          </label>

          <textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(event.target.value)
            }
            placeholder="Enter the reason for rejecting this booking..."
            rows={4}
            disabled={rejectLoading}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
          />

          <p className="mt-2 text-xs text-gray-500">
            This reason will be visible to the student.
          </p>
        </div>
      </Modal>

      {/* ========================================
          COMPLETE MODAL
      ======================================== */}

      <Modal
        open={completeModalOpen}
        onClose={closeCompleteModal}
        onConfirm={confirmComplete}
        title="Complete Booking"
        description="Are you sure you want to mark this booking as completed? This indicates that the student's stay has been completed."
        confirmText="Mark Completed"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="success"
        loading={completeLoading}
      />
    </div>
  );
};

/* ========================================
   STAT CARD
======================================== */

const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={22} strokeWidth={1.9} />
        </div>

      </div>
    </div>
  );
};

/* ========================================
   QUICK ACTION
======================================== */

const QuickAction = ({
  icon: Icon,
  title,
  description,
  iconClass,
  badge,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-w-0 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <ArrowRight
          size={17}
          className="mt-1 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-500"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-base font-bold text-gray-900">
          {title}
        </h3>

        {badge !== null &&
          badge !== undefined && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              {badge}
            </span>
          )}
      </div>

      <p className="mt-1 text-sm leading-5 text-gray-500">
        {description}
      </p>
    </button>
  );
};

/* ========================================
   DETAIL BOX
======================================== */

const DetailBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon size={15} />
        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-bold capitalize text-gray-900">
        {value}
      </p>
    </div>
  );
};

export default OwnerDashboard;