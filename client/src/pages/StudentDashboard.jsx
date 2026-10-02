import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";

import { getProperties } from "../lib/api";
import { useToast } from "../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const { error: showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const [bookingError, setBookingError] = useState("");
  const [propertyError, setPropertyError] = useState("");

  const [refreshingBookings, setRefreshingBookings] = useState(false);

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // USER
  // --------------------------------------------------

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchBookings();
    fetchProperties();
  }, [token]);

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshingBookings(true);
      } else {
        setLoadingBookings(true);
      }

      setBookingError("");

      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Dashboard bookings error:", error);

      setBookingError(error.message || "Unable to load your bookings.");

      showError(
        "Unable to load bookings",
        error.message || "Please try again.",
      );
    } finally {
      setLoadingBookings(false);
      setRefreshingBookings(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      setPropertyError("");

      const response = await getProperties({
        page: 1,
        limit: 3,
        sort: "newest",
      });

      setProperties(response.properties || []);
    } catch (error) {
      console.error("Dashboard properties error:", error);

      setPropertyError(error.message || "Unable to load properties.");
    } finally {
      setLoadingProperties(false);
    }
  };

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
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

  // --------------------------------------------------
  // BOOKING HELPERS
  // --------------------------------------------------

  const getBookingStatus = (booking) => {
    return String(
      booking?.status || booking?.bookingStatus || "pending",
    ).toLowerCase();
  };

  const getPaymentStatus = (booking) => {
    return String(booking?.paymentStatus || "pending").toLowerCase();
  };

  const getPropertyName = (booking) => {
    return (
      booking?.property?.name ||
      booking?.property?.title ||
      booking?.propertyName ||
      "Property"
    );
  };

  const getRoomType = (booking) => {
    return (
      booking?.room?.roomType ||
      booking?.roomType ||
      booking?.room?.type ||
      "Room"
    );
  };

  const getMonthlyRent = (booking) => {
    return (
      booking?.room?.monthlyRent || booking?.monthlyRent || booking?.rent || 0
    );
  };

  const getPropertyLocation = (booking) => {
    const address = booking?.property?.address;

    if (!address) {
      return "Location unavailable";
    }

    return (
      [address.area, address.city].filter(Boolean).join(", ") ||
      "Location unavailable"
    );
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        };

      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          className: "border-blue-200 bg-blue-50 text-blue-700",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: Clock3,
          className: "border-red-200 bg-red-50 text-red-700",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: Clock3,
          className: "border-gray-200 bg-gray-100 text-gray-600",
        };

      default:
        return {
          label: "Pending",
          icon: Clock3,
          className: "border-amber-200 bg-amber-50 text-amber-700",
        };
    }
  };

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      active: bookings.filter(
        (booking) => getBookingStatus(booking) === "confirmed",
      ).length,

      pending: bookings.filter(
        (booking) => getBookingStatus(booking) === "pending",
      ).length,

      completed: bookings.filter(
        (booking) => getBookingStatus(booking) === "completed",
      ).length,
    };
  }, [bookings]);

  // --------------------------------------------------
  // CURRENT BOOKING
  // --------------------------------------------------

  const currentBooking = useMemo(() => {
    return bookings.find(
      (booking) => getBookingStatus(booking) === "confirmed",
    );
  }, [bookings]);

  // --------------------------------------------------
  // RECENT BOOKINGS
  // --------------------------------------------------

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0),
      )
      .slice(0, 4);
  }, [bookings]);

  const firstName = user?.name?.split(" ")[0] || "there";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* HERO */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-purple-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Home size={14} />
                Student Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Good morning, {firstName}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Manage your stays, track bookings, monitor payments, and
                discover your next place to live.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {/* Primary CTA */}
              <Link
                to="/properties"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
              >
                <Search size={17} />

                <span>Find a PG</span>

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>

              {/* Secondary CTA */}
              <Link
                to="/bookings"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white/20"
              >
                <ClipboardList size={17} />

                <span>View bookings</span>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section
          aria-label="Booking statistics"
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Total Bookings"
            value={stats.total}
            icon={ClipboardList}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Active Stay"
            value={stats.active}
            icon={Home}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            iconClass="bg-purple-50 text-purple-600"
          />
        </section>

        {/* CURRENT STAY + QUICK ACTIONS */}

        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          {/* CURRENT STAY */}

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Current Stay
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your active accommodation
                </p>
              </div>

              {currentBooking && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Active
                </span>
              )}
            </div>

            {loadingBookings ? (
              <CurrentStaySkeleton />
            ) : currentBooking ? (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Home size={24} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-gray-950">
                        {getPropertyName(currentBooking)}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={14} />
                        {getPropertyLocation(currentBooking)}
                      </p>

                      <p className="mt-2 text-sm font-semibold capitalize text-gray-700">
                        {getRoomType(currentBooking)} Room
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/bookings"
                    className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    View Booking
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
                  <InfoItem
                    icon={CalendarDays}
                    label="Check-in"
                    value={formatDate(
                      currentBooking.checkInDate ||
                        currentBooking.startDate ||
                        currentBooking.moveInDate,
                    )}
                  />

                  <InfoItem
                    icon={WalletCards}
                    label="Monthly Rent"
                    value={formatCurrency(getMonthlyRent(currentBooking))}
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="Payment"
                    value={
                      getPaymentStatus(currentBooking) === "paid"
                        ? "Paid"
                        : "Pending"
                    }
                    valueClassName={
                      getPaymentStatus(currentBooking) === "paid"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Home size={28} />
                </div>

                <h3 className="mt-5 text-base font-bold text-gray-950">
                  No active stay
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  You don't have a confirmed stay yet. Explore available PGs and
                  find a place that suits you.
                </p>

                <Link
                  to="/properties"
                  className="group mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Explore Properties
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Quick Actions</h2>

              <p className="mt-1 text-sm text-gray-500">
                Common things you may want to do
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <QuickAction
                to="/properties"
                icon={Search}
                title="Find a PG"
                description="Explore available stays"
              />

              <QuickAction
                to="/bookings"
                icon={ClipboardList}
                title="My Bookings"
                description="Manage your bookings"
              />

              <QuickAction
                to="/profile"
                icon={UserRound}
                title="My Profile"
                description="Update your information"
              />
            </div>
          </div>
        </section>

        {/* RECENT BOOKINGS */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-gray-950">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest booking activity
              </p>
            </div>

            <Link
              to="/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {loadingBookings ? (
            <div className="space-y-3 p-5 sm:p-6">
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </div>
          ) : bookingError ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Clock3 size={22} />
              </div>

              <p className="mx-auto mt-4 max-w-md text-sm text-gray-500">
                {bookingError}
              </p>

              <button
                type="button"
                onClick={() => fetchBookings()}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <ClipboardList size={24} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-950">
                No bookings yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your bookings will appear here once you make one.
              </p>

              <Link
                to="/properties"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Find a property
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking) => {
                const status = getBookingStatus(booking);

                const paymentStatus = getPaymentStatus(booking);

                const statusConfig = getStatusConfig(status);

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={booking._id}
                    className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-gray-50 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Home size={19} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-gray-950">
                          {getPropertyName(booking)}
                        </h3>

                        <p className="mt-1 capitalize text-xs text-gray-500">
                          {getRoomType(booking)} Room
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />
                            {formatDate(
                              booking.createdAt || booking.created_at,
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {getPropertyLocation(booking)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig.className}`}
                      >
                        <StatusIcon size={13} />
                        {statusConfig.label}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <CreditCard size={13} />

                        {paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                      </span>

                      <Link
                        to="/bookings"
                        className="group/view ml-auto inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:ml-2"
                      >
                        View
                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover/view:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RECOMMENDED PROPERTIES */}

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles />

                <h2 className="text-xl font-bold tracking-tight text-gray-950">
                  Recommended Properties
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Discover available places to stay
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Explore all
              <ArrowRight size={15} />
            </Link>
          </div>

          {loadingProperties ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <PropertySkeleton />
              <PropertySkeleton />
              <PropertySkeleton />
            </div>
          ) : propertyError ? (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm text-gray-500">{propertyError}</p>

              <button
                type="button"
                onClick={fetchProperties}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <Home size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-950">
                No properties available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Check back later for new properties.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const firstRoom = property.rooms?.[0];

                const image = property.images?.[0] || null;

                const location = [
                  property.address?.area,
                  property.address?.city,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <Link
                    key={property._id}
                    to={`/properties/${property._id}`}
                    className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={property.name || "Property"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-300">
                          <Home size={34} />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

                      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
                        {property.propertyType || "Property"}
                      </span>

                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Verified
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="truncate text-base font-bold text-gray-950">
                        {property.name || property.title || "StayNest Property"}
                      </h3>

                      <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-gray-500">
                        <MapPin size={14} />
                        {location || "Location unavailable"}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>

                          <p className="mt-0.5 text-lg font-bold text-gray-950">
                            {formatCurrency(firstRoom?.monthlyRent)}

                            <span className="ml-1 text-xs font-medium text-gray-500">
                              / month
                            </span>
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                          View
                          <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

const StatCard = ({ label, value, icon: Icon, iconClass }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// QUICK ACTION
// --------------------------------------------------

const QuickAction = ({ to, icon: Icon, title, description }) => {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5 transition duration-200 hover:border-blue-100 hover:bg-blue-50/50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-950">{title}</p>

        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>

      <ArrowRight
        size={16}
        className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
      />
    </Link>
  );
};

// --------------------------------------------------
// INFO ITEM
// --------------------------------------------------

const InfoItem = ({ icon: Icon, label, value, valueClassName = "" }) => {
  return (
    <div className="rounded-xl bg-gray-50 p-3.5">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon size={14} />

        <p className="text-xs font-medium">{label}</p>
      </div>

      <p className={`mt-1.5 text-sm font-bold text-gray-900 ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};

// --------------------------------------------------
// CURRENT STAY SKELETON
// --------------------------------------------------

const CurrentStaySkeleton = () => {
  return (
    <div className="animate-pulse p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gray-200" />

        <div className="flex-1">
          <div className="h-5 w-52 max-w-full rounded bg-gray-200" />
          <div className="mt-3 h-4 w-64 max-w-full rounded bg-gray-100" />
          <div className="mt-3 h-4 w-28 rounded bg-gray-100" />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="h-16 rounded-xl bg-gray-100" />
        <div className="h-16 rounded-xl bg-gray-100" />
        <div className="h-16 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
};

// --------------------------------------------------
// BOOKING SKELETON
// --------------------------------------------------

const BookingSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex gap-4">
        <div className="h-11 w-11 rounded-xl bg-gray-200" />

        <div className="flex-1">
          <div className="h-4 w-48 max-w-full rounded bg-gray-200" />
          <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
          <div className="mt-3 h-3 w-40 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// PROPERTY SKELETON
// --------------------------------------------------

const PropertySkeleton = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="h-48 animate-pulse bg-gray-200" />

      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />

        <div className="mt-5 h-5 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
};

export default StudentDashboard;
