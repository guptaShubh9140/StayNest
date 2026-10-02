import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

import { getAdminStats } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const LoadingBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
  />
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { error: showError } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getAdminStats(token);

      setStats(data.stats);
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      const errorMessage =
        error.message ||
        "Failed to load dashboard.";

      setError(errorMessage);

      showError(
        "Unable to load dashboard",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const users = stats?.users || {};
  const properties = stats?.properties || {};
  const bookings = stats?.bookings || {};

  const propertyApprovalRate = useMemo(() => {
    const total = Number(properties.total || 0);
    const approved = Number(
      properties.approved || 0
    );

    if (!total) return 0;

    return Math.round((approved / total) * 100);
  }, [properties]);

  const bookingConfirmationRate = useMemo(() => {
    const total = Number(bookings.total || 0);
    const confirmed = Number(
      bookings.confirmed || 0
    );

    if (!total) return 0;

    return Math.round((confirmed / total) * 100);
  }, [bookings]);

  const pendingPercentage = useMemo(() => {
    const total = Number(bookings.total || 0);
    const pending = Number(
      bookings.pending || 0
    );

    if (!total) return 0;

    return Math.round((pending / total) * 100);
  }, [bookings]);

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <LoadingBlock className="h-4 w-28" />
            <LoadingBlock className="mt-5 h-9 w-64" />
            <LoadingBlock className="mt-3 h-5 w-full max-w-xl" />
          </div>
        </div>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <LoadingBlock className="h-11 w-11" />
                  <LoadingBlock className="mt-5 h-8 w-20" />
                  <LoadingBlock className="mt-2 h-4 w-28" />
                </div>
              )
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <LoadingBlock className="h-6 w-52" />
              <LoadingBlock className="mt-2 h-4 w-80" />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map(
                  (_, index) => (
                    <LoadingBlock
                      key={index}
                      className="h-28 w-full"
                    />
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <LoadingBlock className="h-6 w-40" />
              <LoadingBlock className="mt-5 h-40 w-40 rounded-full mx-auto" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <LoadingBlock className="h-6 w-44" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <LoadingBlock
                    key={index}
                    className="h-32 w-full"
                  />
                )
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card padding="lg">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <XCircle size={27} />
              </div>

              <h1 className="mt-5 text-xl font-bold text-gray-900">
                Unable to load dashboard
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {error}
              </p>

              <Button
                className="mt-6"
                onClick={fetchStats}
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <ShieldCheck size={14} />
                StayNest Administration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Monitor users, properties, bookings, and
                platform activity from one place.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={fetchStats}
              icon={RefreshCw}
              loading={loading}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Main statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            title="Total Users"
            value={users.total || 0}
            subtitle={`${users.students || 0} students`}
          />

          <StatCard
            icon={Building2}
            iconClass="bg-indigo-50 text-indigo-600"
            title="Total Properties"
            value={properties.total || 0}
            subtitle={`${properties.approved || 0} approved`}
          />

          <StatCard
            icon={CalendarCheck2}
            iconClass="bg-emerald-50 text-emerald-600"
            title="Total Bookings"
            value={bookings.total || 0}
            subtitle={`${bookings.confirmed || 0} confirmed`}
          />

          <StatCard
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
            title="Pending Properties"
            value={properties.pending || 0}
            subtitle="Awaiting approval"
          />
        </section>

        {/* Platform overview */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card
            padding="lg"
            className="lg:col-span-2 overflow-hidden"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BarChart3 size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Platform Overview
                    </h2>

                    <p className="text-sm text-gray-500">
                      A quick snapshot of StayNest activity.
                    </p>
                  </div>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <TrendingUp size={14} />
                Live overview
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <OverviewMetric
                icon={Users}
                label="Students"
                value={users.students || 0}
                description="Registered students"
              />

              <OverviewMetric
                icon={UserCog}
                label="Owners"
                value={users.owners || 0}
                description="Property owners"
              />

              <OverviewMetric
                icon={ShieldCheck}
                label="Admins"
                value={users.admins || 0}
                description="Platform admins"
              />
            </div>
          </Card>

          {/* Approval rate */}
          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheck2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Property Approval
                </h2>

                <p className="text-sm text-gray-500">
                  Current approval rate
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-center">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#10b981 ${propertyApprovalRate * 3.6}deg, #f3f4f6 0deg)`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-bold text-gray-900">
                    {propertyApprovalRate}%
                  </span>

                  <span className="mt-1 text-xs font-medium text-gray-500">
                    approved
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <MiniStat
                label="Approved"
                value={properties.approved || 0}
              />

              <MiniStat
                label="Pending"
                value={properties.pending || 0}
              />

              <MiniStat
                label="Rejected"
                value={properties.rejected || 0}
              />
            </div>
          </Card>
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access the main administration tools.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              to="/admin/properties"
              icon={Building2}
              iconClass="bg-blue-50 text-blue-600"
              title="Manage Properties"
              description="Review, approve, reject, and manage properties."
            />

            <ActionCard
              to="/admin/users"
              icon={Users}
              iconClass="bg-purple-50 text-purple-600"
              title="Manage Users"
              description="View users and manage their platform roles."
            />

            <ActionCard
              to="/admin/bookings"
              icon={CalendarCheck2}
              iconClass="bg-emerald-50 text-emerald-600"
              title="Manage Bookings"
              description="Review booking activity and statuses."
            />

            <ActionCard
              to="/admin/dashboard"
              icon={BarChart3}
              iconClass="bg-amber-50 text-amber-600"
              title="Dashboard Overview"
              description="View the latest platform statistics."
            />
          </div>
        </section>

        {/* Users + Properties */}
        <section className="grid gap-6 lg:grid-cols-2">
          <OverviewCard
            title="Users Overview"
            icon={Users}
          >
            <OverviewRow
              icon={Users}
              label="Students"
              value={users.students || 0}
            />

            <OverviewRow
              icon={UserCog}
              label="Owners"
              value={users.owners || 0}
            />

            <OverviewRow
              icon={ShieldCheck}
              label="Admins"
              value={users.admins || 0}
            />

            <OverviewRow
              icon={Users}
              label="Total Users"
              value={users.total || 0}
              bold
            />
          </OverviewCard>

          <OverviewCard
            title="Properties Overview"
            icon={Building2}
          >
            <OverviewRow
              icon={Clock3}
              label="Pending"
              value={properties.pending || 0}
              valueClass="text-amber-600"
            />

            <OverviewRow
              icon={CheckCircle2}
              label="Approved"
              value={properties.approved || 0}
              valueClass="text-emerald-600"
            />

            <OverviewRow
              icon={XCircle}
              label="Rejected"
              value={properties.rejected || 0}
              valueClass="text-red-600"
            />

            <OverviewRow
              icon={Building2}
              label="Total Properties"
              value={properties.total || 0}
              bold
            />
          </OverviewCard>
        </section>

        {/* Booking overview */}
        <Card padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Booking Overview
                </h2>

                <p className="text-sm text-gray-500">
                  Current booking activity across StayNest.
                </p>
              </div>
            </div>

            <Link
              to="/admin/bookings"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BookingMetric
              icon={CalendarCheck2}
              label="Total"
              value={bookings.total || 0}
              iconClass="bg-blue-50 text-blue-600"
            />

            <BookingMetric
              icon={Clock3}
              label="Pending"
              value={bookings.pending || 0}
              iconClass="bg-amber-50 text-amber-600"
            />

            <BookingMetric
              icon={CheckCircle2}
              label="Confirmed"
              value={bookings.confirmed || 0}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <BookingMetric
              icon={CheckCircle2}
              label="Completed"
              value={bookings.completed || 0}
              iconClass="bg-indigo-50 text-indigo-600"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProgressCard
              label="Confirmation rate"
              value={bookingConfirmationRate}
              description={`${bookings.confirmed || 0} of ${bookings.total || 0} bookings confirmed`}
            />

            <ProgressCard
              label="Pending bookings"
              value={pendingPercentage}
              description={`${bookings.pending || 0} bookings currently pending`}
              inverse
            />
          </div>
        </Card>
      </main>
    </div>
  );
};

// --------------------------------
// Stat Card
// --------------------------------

const StatCard = ({
  icon: Icon,
  iconClass,
  title,
  value,
  subtitle,
}) => {
  return (
    <Card
      padding="sm"
      hover
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {subtitle}
      </p>
    </Card>
  );
};

// --------------------------------
// Overview Metric
// --------------------------------

const OverviewMetric = ({
  icon: Icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm ring-1 ring-gray-200">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p className="text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
};

// --------------------------------
// Action Card
// --------------------------------

const ActionCard = ({
  to,
  icon: Icon,
  iconClass,
  title,
  description,
}) => {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <ArrowRight
          size={18}
          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
        />
      </div>

      <h3 className="mt-5 text-base font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
        Open
        <ArrowRight size={14} />
      </span>
    </Link>
  );
};

// --------------------------------
// Overview Card
// --------------------------------

const OverviewCard = ({
  title,
  icon: Icon,
  children,
}) => {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
          <Icon size={19} />
        </div>

        <h2 className="text-lg font-bold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </Card>
  );
};

// --------------------------------
// Overview Row
// --------------------------------

const OverviewRow = ({
  icon: Icon,
  label,
  value,
  bold = false,
  valueClass = "text-gray-900",
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          <Icon size={15} />
        </div>

        <span
          className={
            bold
              ? "text-sm font-bold text-gray-900"
              : "text-sm text-gray-600"
          }
        >
          {label}
        </span>
      </div>

      <span
        className={`text-sm font-bold ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
};

// --------------------------------
// Mini Stat
// --------------------------------

const MiniStat = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-gray-50 p-3 text-center">
      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
};

// --------------------------------
// Booking Metric
// --------------------------------

const BookingMetric = ({
  icon: Icon,
  iconClass,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={18} />
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-500">
        {label}
      </p>
    </div>
  );
};

// --------------------------------
// Progress Card
// --------------------------------

const ProgressCard = ({
  label,
  value,
  description,
  inverse = false,
}) => {
  const percentage = Math.min(
    Math.max(Number(value) || 0, 0),
    100
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-gray-700">
          {label}
        </span>

        <span className="text-sm font-bold text-gray-900">
          {percentage}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${
            inverse
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default AdminDashboard;