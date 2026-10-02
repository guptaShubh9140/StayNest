import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Home,
  ImageOff,
  MapPin,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import {
  getOwnerProperties,
  deleteProperty,
} from "../lib/api";

import { useToast } from "../components/ui/Toast";
import Modal from "../components/ui/Modal";

const OwnerProperties = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    success: showSuccess,
    error: showError,
  } = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ========================================
  // FETCH PROPERTIES
  // ========================================

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getOwnerProperties(token);

      setProperties(data.properties || []);
    } catch (err) {
      console.error("Owner properties error:", err);

      const errorMessage =
        err.message || "Failed to load properties";

      setError(errorMessage);

      showError(
        "Unable to load properties",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = (propertyId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setPropertyToDelete(propertyId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteModalOpen(false);
    setPropertyToDelete(null);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete || deleteLoading) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteProperty(
        propertyToDelete,
        token
      );

      setProperties((previous) =>
        previous.filter(
          (property) =>
            property._id !== propertyToDelete
        )
      );

      setDeleteModalOpen(false);
      setPropertyToDelete(null);

      showSuccess(
        "Property deleted",
        "The property has been deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete property error:",
        err
      );

      showError(
        "Unable to delete property",
        err.message ||
          "Failed to delete property."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ========================================
  // SUMMARY
  // ========================================

  const summary = useMemo(() => {
    return properties.reduce(
      (acc, property) => {
        const status =
          String(
            property.approvalStatus || "pending"
          ).toLowerCase();

        acc.total += 1;

        if (status === "approved") {
          acc.approved += 1;
        }

        if (status === "pending") {
          acc.pending += 1;
        }

        if (status === "rejected") {
          acc.rejected += 1;
        }

        return acc;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      }
    );
  }, [properties]);

  // ========================================
  // HELPERS
  // ========================================

  const getStatusInfo = (status) => {
    switch (
      String(status || "pending").toLowerCase()
    ) {
      case "approved":
        return {
          label: "Approved",
          title: "Property is live",
          description:
            "Your property has been approved and is available to students.",
          icon: CheckCircle2,
          badgeClass:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          panelClass:
            "border-emerald-100 bg-emerald-50/70 text-emerald-900",
          iconClass:
            "bg-white text-emerald-600",
        };

      case "rejected":
        return {
          label: "Rejected",
          title: "Changes required",
          description:
            "Your property was not approved by the admin.",
          icon: XCircle,
          badgeClass:
            "border-red-200 bg-red-50 text-red-700",
          panelClass:
            "border-red-100 bg-red-50/70 text-red-900",
          iconClass:
            "bg-white text-red-600",
        };

      case "pending":
      default:
        return {
          label: "Pending",
          title: "Awaiting approval",
          description:
            "Your property is waiting for admin review.",
          icon: Clock3,
          badgeClass:
            "border-amber-200 bg-amber-50 text-amber-700",
          panelClass:
            "border-amber-100 bg-amber-50/70 text-amber-900",
          iconClass:
            "bg-white text-amber-600",
        };
    }
  };

  const getPropertyStats = (property) => {
    const rooms = property.rooms || [];

    const totalRooms = rooms.reduce(
      (total, room) =>
        total +
        Number(room.totalRooms || 0),
      0
    );

    const availableRooms = rooms.reduce(
      (total, room) =>
        total +
        Number(room.availableRooms || 0),
      0
    );

    const lowestRent = rooms.length
      ? Math.min(
          ...rooms.map((room) =>
            Number(room.monthlyRent || 0)
          )
        )
      : 0;

    return {
      roomTypes: rooms.length,
      totalRooms,
      availableRooms,
      lowestRent,
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
            <div className="h-52 rounded-3xl bg-gray-200" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-white shadow-sm"
                  />
                )
              )}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <div className="h-52 bg-gray-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-6 w-2/3 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-100" />
                      <div className="h-24 rounded-2xl bg-gray-100" />
                      <div className="h-10 rounded-xl bg-gray-100" />
                    </div>
                  </div>
                )
              )}
            </div>
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
              Unable to load properties
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchProperties}
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

  // ========================================
  // MAIN
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ========================================
            HERO
        ======================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-5 py-8 text-white shadow-xl sm:px-8 sm:py-10 lg:px-10 lg:py-11">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                <Building2 size={14} />
                Owner Properties
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                My Properties
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                Manage your PGs, hostels and co-living
                properties from one place.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/properties/new"
                    )
                  }
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
                >
                  <Plus size={17} />

                  <span>
                    Add New Property
                  </span>

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>

                <button
                  type="button"
                  onClick={fetchProperties}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>

              </div>
            </div>

            <div className="hidden shrink-0 lg:flex">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md">
                <Building2
                  size={58}
                  strokeWidth={1.5}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================
            SUMMARY
        ======================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            label="Total Properties"
            value={summary.total}
            description="All your properties"
            icon={Building2}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            label="Approved"
            value={summary.approved}
            description="Currently live"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            label="Pending"
            value={summary.pending}
            description="Waiting for review"
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            label="Rejected"
            value={summary.rejected}
            description="Needs attention"
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {properties.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No properties yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't added any properties yet.
              Add your first property to start receiving
              booking requests.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/owner/properties/new"
                )
              }
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Your First Property
            </button>

          </section>
        ) : (
          <>
            {/* ========================================
                SECTION HEADER
            ======================================== */}

            <section className="mt-8">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Your Properties
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    View and manage every property from
                    your owner account.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                  <Building2 size={14} />
                  {properties.length}{" "}
                  {properties.length === 1
                    ? "property"
                    : "properties"}
                </span>

              </div>

              {/* ========================================
                  PROPERTY GRID
              ======================================== */}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {properties.map((property) => {

                  const status =
                    String(
                      property.approvalStatus ||
                        "pending"
                    ).toLowerCase();

                  const statusInfo =
                    getStatusInfo(status);

                  const StatusIcon =
                    statusInfo.icon;

                  const stats =
                    getPropertyStats(property);

                  const city =
                    property.address?.city;

                  const area =
                    property.address?.area;

                  const location =
                    [area, city]
                      .filter(Boolean)
                      .join(", ") ||
                    "Location not available";

                  const imageUrl =
                    property.images?.[0];

                  return (
                    <article
                      key={property._id}
                      className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
                    >

                      {/* IMAGE */}

                      <div className="relative h-56 overflow-hidden bg-gray-100">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              property.name ||
                              "Property"
                            }
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                            <ImageOff size={34} />

                            <p className="mt-2 text-sm font-medium">
                              No image available
                            </p>
                          </div>
                        )}

                        {/* Image overlay */}

                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Status */}

                        <div className="absolute left-4 top-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-sm backdrop-blur-sm ${statusInfo.badgeClass}`}
                          >
                            <StatusIcon
                              size={13}
                              strokeWidth={2.4}
                            />

                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Property type */}

                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur-md">
                            {property.propertyType ||
                              "PG"}
                          </span>
                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        {/* Title */}

                        <div className="min-w-0">

                          <h3 className="truncate text-xl font-bold tracking-tight text-gray-900">
                            {property.name ||
                              "Unnamed Property"}
                          </h3>

                          <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <span className="line-clamp-2">
                              {location}
                            </span>
                          </div>

                        </div>

                        {/* Tags */}

                        <div className="mt-4 flex flex-wrap gap-2">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                            {property.propertyType ||
                              "PG"}
                          </span>

                          {property.gender && (
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                              {property.gender}
                            </span>
                          )}

                        </div>

                        {/* Stats */}

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <PropertyStat
                            icon={Home}
                            label="Room Types"
                            value={stats.roomTypes}
                          />

                          <PropertyStat
                            icon={Users}
                            label="Total Rooms"
                            value={stats.totalRooms}
                          />

                          <PropertyStat
                            icon={CheckCircle2}
                            label="Available"
                            value={
                              stats.availableRooms
                            }
                            valueClass={
                              stats.availableRooms >
                              0
                                ? "text-emerald-600"
                                : "text-gray-900"
                            }
                          />

                          <PropertyStat
                            icon={WalletIcon}
                            label="Starting Rent"
                            value={
                              stats.lowestRent >
                              0
                                ? `₹${stats.lowestRent.toLocaleString(
                                    "en-IN"
                                  )}`
                                : "Not set"
                            }
                          />

                        </div>

                        {/* Approval panel */}

                        <div
                          className={`mt-4 rounded-2xl border p-4 ${statusInfo.panelClass}`}
                        >
                          <div className="flex gap-3">

                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusInfo.iconClass}`}
                            >
                              <StatusIcon
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-bold">
                                {statusInfo.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 opacity-80">
                                {statusInfo.description}
                              </p>

                              {status ===
                                "approved" && (
                                <p className="mt-2 text-xs font-semibold">
                                  Your property is live.
                                </p>
                              )}

                              {status ===
                                "pending" && (
                                <p className="mt-2 text-xs font-semibold">
                                  No action is required
                                  until review.
                                </p>
                              )}

                              {status ===
                                "rejected" && (
                                <>
                                  <p className="mt-2 text-xs font-semibold">
                                    Update the property
                                    and resubmit it.
                                  </p>

                                  {property.rejectionReason && (
                                    <div className="mt-3 rounded-xl border border-red-200 bg-white/80 p-3">
                                      <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
                                        Admin's Rejection
                                        Reason
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-red-800">
                                        {
                                          property.rejectionReason
                                        }
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}

                            </div>
                          </div>
                        </div>

                        {/* Actions */}

                        <div className="mt-5 grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/owner/properties/edit/${property._id}`
                              )
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Edit3 size={15} />

                            {status ===
                            "rejected"
                              ? "Fix & Resubmit"
                              : "Edit"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/owner/properties/${property._id}/rooms`
                              )
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            <Settings2 size={15} />
                            Rooms
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/properties/${property._id}`
                              )
                            }
                            className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            <Eye size={15} />
                            Preview Property
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                property._id
                              )
                            }
                            className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete Property
                          </button>

                        </div>

                      </div>
                    </article>
                  );
                })}

              </div>
            </section>
          </>
        )}

        <div className="h-6 sm:h-10" />
      </main>

      {/* ========================================
          DELETE MODAL
      ======================================== */}

      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete Property"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

/* ========================================
   SUMMARY CARD
======================================== */

const SummaryCard = ({
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
          <Icon
            size={22}
            strokeWidth={1.9}
          />
        </div>

      </div>
    </div>
  );
};

/* ========================================
   PROPERTY STAT
======================================== */

const PropertyStat = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-gray-900",
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon size={14} />
        <p className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p
        className={`mt-1.5 text-sm font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
};

/* ========================================
   WALLET ICON
======================================== */

const WalletIcon = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v9a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7" />
      <path d="M16 14h.01" />
    </svg>
  );
};

export default OwnerProperties;