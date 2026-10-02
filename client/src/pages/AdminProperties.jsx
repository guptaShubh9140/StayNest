import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
} from "../lib/api";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
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

const formatLabel = (value, fallback = "—") => {
  if (!value) return fallback;

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AdminProperties = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // Approve modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [propertyToApprove, setPropertyToApprove] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [propertyToReject, setPropertyToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
  } = useToast();

  // --------------------------------------------------
  // Fetch pending properties
  // --------------------------------------------------

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getPendingProperties(token);

      setProperties(data.properties || []);
    } catch (error) {
      console.error("Admin properties error:", error);

      const errorMessage =
        error.message || "Failed to load pending properties.";

      setError(errorMessage);

      showError("Unable to load properties", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const summary = useMemo(() => {
    const totalRooms = properties.reduce((sum, property) => {
      return (
        sum +
        (property.rooms || []).reduce(
          (roomSum, room) => roomSum + Number(room.totalRooms || 0),
          0
        )
      );
    }, 0);

    const totalAvailableRooms = properties.reduce((sum, property) => {
      return (
        sum +
        (property.rooms || []).reduce(
          (roomSum, room) => roomSum + Number(room.availableRooms || 0),
          0
        )
      );
    }, 0);

    return {
      pending: properties.length,
      totalRooms,
      totalAvailableRooms,
      owners: new Set(
        properties
          .map((property) => property.owner?._id)
          .filter(Boolean)
      ).size,
    };
  }, [properties]);

  // --------------------------------------------------
  // Approve property
  // --------------------------------------------------

  const handleApprove = (propertyId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setPropertyToApprove(propertyId);
    setApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    if (approveLoading) return;

    setApproveModalOpen(false);
    setPropertyToApprove(null);
  };

  const confirmApprove = async () => {
    if (!propertyToApprove) return;

    const token = localStorage.getItem("token");

    if (!token) {
      closeApproveModal();
      navigate("/login");
      return;
    }

    try {
      setApproveLoading(true);
      setActionLoading(propertyToApprove);

      await approveProperty(propertyToApprove, token);

      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyToApprove)
      );

      setApproveModalOpen(false);
      setPropertyToApprove(null);

      showSuccess(
        "Property approved",
        "The property has been approved successfully."
      );
    } catch (error) {
      console.error("Approve property error:", error);

      showError(
        "Unable to approve property",
        error.message || "Failed to approve property."
      );
    } finally {
      setApproveLoading(false);
      setActionLoading(null);
    }
  };

  // --------------------------------------------------
  // Reject property
  // --------------------------------------------------

  const handleReject = (propertyId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setPropertyToReject(propertyId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (rejectLoading) return;

    setRejectModalOpen(false);
    setPropertyToReject(null);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!propertyToReject) return;

    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      showWarning(
        "Rejection reason required",
        "Please enter a rejection reason."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      closeRejectModal();
      navigate("/login");
      return;
    }

    try {
      setRejectLoading(true);
      setActionLoading(propertyToReject);

      await rejectProperty(
        propertyToReject,
        trimmedReason,
        token
      );

      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyToReject)
      );

      setRejectModalOpen(false);
      setPropertyToReject(null);
      setRejectionReason("");

      showSuccess(
        "Property rejected",
        "The property has been rejected successfully."
      );
    } catch (error) {
      console.error("Reject property error:", error);

      showError(
        "Unable to reject property",
        error.message || "Failed to reject property."
      );
    } finally {
      setRejectLoading(false);
      setActionLoading(null);
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

          <div className="mt-8 space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} padding="none" className="overflow-hidden">
                <div className="grid lg:grid-cols-[300px_1fr]">
                  <LoadingBlock className="h-64 rounded-none lg:h-full" />

                  <div className="space-y-4 p-6">
                    <LoadingBlock className="h-7 w-2/3" />
                    <LoadingBlock className="h-4 w-1/3" />
                    <LoadingBlock className="h-16 w-full" />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, item) => (
                        <LoadingBlock
                          key={item}
                          className="h-16"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
            title="Unable to load properties"
            description={error}
            onRetry={fetchProperties}
            retryLabel="Reload Properties"
          />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-8 lg:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <ShieldCheck size={14} />
                  Property moderation
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Manage Properties
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Review property submissions, verify listing information,
                  and approve or reject properties before they become visible
                  to students.
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                icon={ArrowLeft}
                onClick={() => navigate("/admin/dashboard")}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </section>

          {/* Summary */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Review
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {summary.pending}
                  </p>

                  <p className="mt-1 text-xs text-amber-600">
                    Awaiting admin action
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={21} />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Rooms
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {summary.totalRooms}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Across pending listings
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={21} />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Available Rooms
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {summary.totalAvailableRooms}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    Currently available
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Home size={21} />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Owners
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {summary.owners}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    With pending submissions
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users size={21} />
                </div>
              </div>
            </Card>
          </section>

          {/* Section header */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Properties Awaiting Review
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review listing details before approving them.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchProperties}
            >
              Refresh
            </Button>
          </div>

          {/* Empty */}
          {properties.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={CheckCircle2}
                title="All caught up"
                description="There are currently no properties waiting for approval."
                action={
                  <Button
                    variant="secondary"
                    icon={ArrowLeft}
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {properties.map((property) => {
                const owner = property.owner;

                const location =
                  property.address?.area ||
                  property.address?.city ||
                  "Location not available";

                const rooms = property.rooms || [];

                const totalRooms = rooms.reduce(
                  (sum, room) =>
                    sum + Number(room.totalRooms || 0),
                  0
                );

                const availableRooms = rooms.reduce(
                  (sum, room) =>
                    sum + Number(room.availableRooms || 0),
                  0
                );

                const lowestRent = rooms.reduce(
                  (lowest, room) => {
                    const rent = Number(room.monthlyRent || 0);

                    if (!rent) return lowest;

                    return lowest === null
                      ? rent
                      : Math.min(lowest, rent);
                  },
                  null
                );

                const isLoading =
                  actionLoading === property._id;

                return (
                  <Card
                    key={property._id}
                    padding="none"
                    className="overflow-hidden"
                  >
                    <div className="grid lg:grid-cols-[320px_1fr]">

                      {/* Image */}
                      <div className="relative min-h-64 bg-gray-100 lg:min-h-full">
                        {property.images?.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.name}
                            className="h-full min-h-64 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-64 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center">
                              <Building2
                                size={38}
                                className="mx-auto text-gray-400"
                              />

                              <p className="mt-2 text-sm font-medium text-gray-500">
                                No image available
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
                          <Clock3 size={13} />
                          Pending Review
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 lg:p-7">

                        {/* Title */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                              {property.name || "Unnamed Property"}
                            </h3>

                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                              <MapPin
                                size={16}
                                className="shrink-0 text-blue-600"
                              />

                              <span>
                                {location}
                                {property.address?.city &&
                                property.address?.area
                                  ? `, ${property.address.city}`
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                            <Clock3 size={13} />
                            Needs Review
                          </span>
                        </div>

                        {/* Description */}
                        {property.description && (
                          <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                            {property.description}
                          </p>
                        )}

                        {/* Property info */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                              Property Type
                            </p>

                            <p className="mt-1 text-sm font-bold capitalize text-gray-900">
                              {formatLabel(
                                property.propertyType,
                                "PG"
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                              Gender
                            </p>

                            <p className="mt-1 text-sm font-bold capitalize text-gray-900">
                              {formatLabel(
                                property.gender,
                                "Unisex"
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                              Room Types
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                              {rooms.length}
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                              City
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-gray-900">
                              {property.address?.city || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Room summary */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Building2 size={17} />
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Total Rooms
                              </p>

                              <p className="text-sm font-bold text-gray-900">
                                {totalRooms}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <CheckCircle2 size={17} />
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Available
                              </p>

                              <p className="text-sm font-bold text-gray-900">
                                {availableRooms}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                              <Building2 size={17} />
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Starting Rent
                              </p>

                              <p className="text-sm font-bold text-gray-900">
                                {lowestRent !== null
                                  ? `₹${lowestRent.toLocaleString("en-IN")}`
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Owner */}
                        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                              <Users size={17} />
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                Owner Information
                              </h4>

                              <p className="text-xs text-gray-500">
                                Submitted by property owner
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                              <Users
                                size={15}
                                className="shrink-0 text-gray-400"
                              />

                              <span className="truncate">
                                {owner?.name || "—"}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                              <Mail
                                size={15}
                                className="shrink-0 text-gray-400"
                              />

                              <span className="truncate">
                                {owner?.email || "—"}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                              <Phone
                                size={15}
                                className="shrink-0 text-gray-400"
                              />

                              <span className="truncate">
                                {owner?.phone || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                          <Button
                            variant="danger"
                            icon={X}
                            loading={isLoading && rejectLoading}
                            disabled={isLoading}
                            onClick={() =>
                              handleReject(property._id)
                            }
                          >
                            Reject Property
                          </Button>

                          <Button
                            variant="primary"
                            icon={Check}
                            loading={isLoading && approveLoading}
                            disabled={isLoading}
                            onClick={() =>
                              handleApprove(property._id)
                            }
                          >
                            Approve Property
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={approveModalOpen}
        onClose={closeApproveModal}
        onConfirm={confirmApprove}
        title="Approve Property"
        description="Are you sure you want to approve this property? It will become available to users after approval."
        confirmText="Approve Property"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="success"
        loading={approveLoading}
      />

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        title="Reject Property"
        description="Please provide a clear reason for rejecting this property."
        confirmText="Reject Property"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="danger"
        loading={rejectLoading}
      >
        <div>
          <label
            htmlFor="property-rejection-reason"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Rejection Reason
          </label>

          <textarea
            id="property-rejection-reason"
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(event.target.value)
            }
            placeholder="Explain what needs to be corrected..."
            rows={5}
            disabled={rejectLoading}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <p className="mt-2 text-xs leading-5 text-gray-500">
            This reason will be visible to the property owner so they
            can make the required corrections.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AdminProperties;