import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Info,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";

import {
  getOwnerPropertyById,
  updateProperty,
} from "../lib/api";

import { useToast } from "../components/ui/Toast";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const createRoom = () => ({
  roomType: "single",
  totalRooms: 1,
  availableRooms: 1,
  monthlyRent: 0,
  securityDeposit: 0,
});

const LoadingBlock = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
    />
  );
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatRoomType = (type) => {
  const labels = {
    single: "Single",
    double: "Double",
    triple: "Triple",
  };

  return labels[type] || type;
};

const ManageRooms = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
  } = useToast();

  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [removeModalOpen, setRemoveModalOpen] =
    useState(false);

  const [roomToRemove, setRoomToRemove] =
    useState(null);

  // --------------------------------
  // Load property
  // --------------------------------

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const data = await getOwnerPropertyById(
          id,
          token
        );

        const propertyData =
          data.property || data;

        setProperty(propertyData);
        setRooms(propertyData.rooms || []);
      } catch (error) {
        console.error(
          "Manage rooms error:",
          error
        );

        const errorMessage =
          error.message ||
          "Failed to load rooms.";

        setError(errorMessage);

        showError(
          "Unable to load rooms",
          errorMessage
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  // --------------------------------
  // Room changes
  // --------------------------------

  const handleRoomChange = (
    index,
    field,
    value
  ) => {
    setRooms((prev) => {
      const updatedRooms = [...prev];

      updatedRooms[index] = {
        ...updatedRooms[index],
        [field]: value,
      };

      return updatedRooms;
    });

    setError("");
  };

  // --------------------------------
  // Add room
  // --------------------------------

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      createRoom(),
    ]);
  };

  // --------------------------------
  // Remove room
  // --------------------------------

  const removeRoom = (index) => {
    if (rooms.length === 1) {
      showWarning(
        "Room type required",
        "A property must have at least one room type."
      );

      return;
    }

    setRoomToRemove(index);
    setRemoveModalOpen(true);
  };

  // --------------------------------
  // Confirm remove
  // --------------------------------

  const confirmRemoveRoom = () => {
    if (roomToRemove === null) {
      return;
    }

    setRooms((prev) =>
      prev.filter(
        (_, roomIndex) =>
          roomIndex !== roomToRemove
      )
    );

    setRemoveModalOpen(false);
    setRoomToRemove(null);

    showSuccess(
      "Room type removed",
      "The room type has been removed. Save your changes to apply them."
    );
  };

  const closeRemoveModal = () => {
    setRemoveModalOpen(false);
    setRoomToRemove(null);
  };

  // --------------------------------
  // Statistics
  // --------------------------------

  const roomStats = useMemo(() => {
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

    const occupiedRooms =
      totalRooms - availableRooms;

    const lowestRent = rooms.length
      ? Math.min(
          ...rooms.map((room) =>
            Number(room.monthlyRent || 0)
          )
        )
      : 0;

    const highestRent = rooms.length
      ? Math.max(
          ...rooms.map((room) =>
            Number(room.monthlyRent || 0)
          )
        )
      : 0;

    return {
      roomTypes: rooms.length,
      totalRooms,
      availableRooms,
      occupiedRooms,
      lowestRent,
      highestRent,
    };
  }, [rooms]);

  // --------------------------------
  // Save
  // --------------------------------

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");

    if (rooms.length === 0) {
      const message =
        "At least one room type is required.";

      setError(message);

      showWarning(
        "Room type required",
        message
      );

      return;
    }

    for (const room of rooms) {
      if (!room.roomType) {
        const message =
          "Room type is required.";

        setError(message);

        showWarning(
          "Room type required",
          message
        );

        return;
      }

      if (Number(room.totalRooms) < 1) {
        const message =
          "Total rooms must be at least 1.";

        setError(message);

        showWarning(
          "Invalid total rooms",
          message
        );

        return;
      }

      if (Number(room.availableRooms) < 0) {
        const message =
          "Available rooms cannot be negative.";

        setError(message);

        showWarning(
          "Invalid available rooms",
          message
        );

        return;
      }

      if (
        Number(room.availableRooms) >
        Number(room.totalRooms)
      ) {
        const message =
          "Available rooms cannot be greater than total rooms.";

        setError(message);

        showWarning(
          "Invalid room availability",
          message
        );

        return;
      }

      if (Number(room.monthlyRent) < 0) {
        const message =
          "Monthly rent cannot be negative.";

        setError(message);

        showWarning(
          "Invalid monthly rent",
          message
        );

        return;
      }

      if (
        Number(room.securityDeposit) < 0
      ) {
        const message =
          "Security deposit cannot be negative.";

        setError(message);

        showWarning(
          "Invalid security deposit",
          message
        );

        return;
      }
    }

    try {
      setSaving(true);

      await updateProperty(
        id,
        {
          rooms: rooms.map((room) => ({
            roomType: room.roomType,
            totalRooms: Number(
              room.totalRooms
            ),
            availableRooms: Number(
              room.availableRooms
            ),
            monthlyRent: Number(
              room.monthlyRent
            ),
            securityDeposit: Number(
              room.securityDeposit
            ),
          })),
        },
        token
      );

      showSuccess(
        "Rooms updated",
        "Room details have been updated successfully."
      );

      navigate("/owner/properties");
    } catch (error) {
      console.error(
        "Save rooms error:",
        error
      );

      const errorMessage =
        error.message ||
        "Failed to update rooms.";

      setError(errorMessage);

      showError(
        "Unable to update rooms",
        errorMessage
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <LoadingBlock className="h-4 w-36" />
            <LoadingBlock className="mt-5 h-9 w-64" />
            <LoadingBlock className="mt-3 h-5 w-full max-w-xl" />
          </div>
        </div>

        <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <LoadingBlock className="h-9 w-9" />
                  <LoadingBlock className="mt-4 h-7 w-20" />
                  <LoadingBlock className="mt-2 h-4 w-28" />
                </div>
              )
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <LoadingBlock className="h-6 w-48" />
            <LoadingBlock className="mt-3 h-4 w-72" />

            <div className="mt-6 space-y-5">
              {Array.from({ length: 2 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <LoadingBlock className="h-5 w-40" />

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      {Array.from({
                        length: 5,
                      }).map(
                        (_, fieldIndex) => (
                          <LoadingBlock
                            key={fieldIndex}
                            className="h-11 w-full"
                          />
                        )
                      )}
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

  // --------------------------------
  // Property load error
  // --------------------------------

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50/70">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Card padding="lg">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Info size={26} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-gray-900">
                Unable to load rooms
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {error}
              </p>

              <Button
                className="mt-6"
                onClick={() =>
                  navigate("/owner/properties")
                }
                icon={ArrowLeft}
              >
                Back to Properties
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate("/owner/properties")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </button>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Building2 size={14} />
                Room Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Manage Rooms
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 sm:text-base">
                <Building2 size={16} />
                {property?.name || "Your Property"}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
              <ShieldCheck
                size={17}
                className="text-emerald-600"
              />
              Keep availability and pricing up to date.
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <Info
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Please review your room details
              </p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            padding="sm"
            hover
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BedDouble size={21} />
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomStats.roomTypes}
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Room Types
                </p>
              </div>
            </div>
          </Card>

          <Card
            padding="sm"
            hover
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 size={21} />
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomStats.totalRooms}
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Total Rooms
                </p>
              </div>
            </div>
          </Card>

          <Card
            padding="sm"
            hover
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomStats.availableRooms}
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Available Rooms
                </p>
              </div>
            </div>
          </Card>

          <Card
            padding="sm"
            hover
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CircleDollarSign size={21} />
              </div>

              <div>
                <p className="text-xl font-bold text-gray-900">
                  {roomStats.lowestRent > 0
                    ? formatCurrency(
                        roomStats.lowestRent
                      )
                    : "₹0"}
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Starting Monthly Rent
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main card */}
        <Card padding="lg">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Wallet size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Room Types
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Update availability, rent, and security
                    deposit for each room type.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addRoom}
            >
              Add Room Type
            </Button>
          </div>

          {/* Rooms */}
          <div className="space-y-4">
            {rooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BedDouble size={26} />
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-900">
                  No room types added
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Add at least one room type before saving
                  this property.
                </p>

                <Button
                  type="button"
                  className="mt-5"
                  icon={Plus}
                  onClick={addRoom}
                >
                  Add Room Type
                </Button>
              </div>
            ) : (
              rooms.map((room, index) => {
                const total =
                  Number(room.totalRooms) || 0;

                const available =
                  Number(room.availableRooms) || 0;

                const occupied = Math.max(
                  total - available,
                  0
                );

                const availabilityPercentage =
                  total > 0
                    ? Math.round(
                        (available / total) * 100
                      )
                    : 0;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition hover:border-gray-300 hover:shadow-sm sm:p-5"
                  >
                    {/* Room header */}
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-gray-200">
                          <BedDouble size={19} />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            Room Type {index + 1}
                          </h3>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatRoomType(
                              room.roomType
                            )}{" "}
                            room configuration
                          </p>
                        </div>
                      </div>

                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeRoom(index)
                          }
                          className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 sm:self-auto"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                      <Select
                        label="Room Type"
                        value={room.roomType}
                        onChange={(e) =>
                          handleRoomChange(
                            index,
                            "roomType",
                            e.target.value
                          )
                        }
                        options={[
                          {
                            value: "single",
                            label: "Single",
                          },
                          {
                            value: "double",
                            label: "Double",
                          },
                          {
                            value: "triple",
                            label: "Triple",
                          },
                        ]}
                      />

                      <Input
                        label="Total Rooms"
                        type="number"
                        min="1"
                        value={room.totalRooms}
                        onChange={(e) =>
                          handleRoomChange(
                            index,
                            "totalRooms",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Available Rooms"
                        type="number"
                        min="0"
                        value={room.availableRooms}
                        onChange={(e) =>
                          handleRoomChange(
                            index,
                            "availableRooms",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Monthly Rent"
                        type="number"
                        min="0"
                        value={room.monthlyRent}
                        onChange={(e) =>
                          handleRoomChange(
                            index,
                            "monthlyRent",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Security Deposit"
                        type="number"
                        min="0"
                        value={
                          room.securityDeposit
                        }
                        onChange={(e) =>
                          handleRoomChange(
                            index,
                            "securityDeposit",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Availability information */}
                    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                            <Users
                              size={14}
                              className="text-gray-400"
                            />
                            {total} total
                          </span>

                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                            <CheckCircle2
                              size={14}
                            />
                            {available} available
                          </span>

                          <span className="inline-flex items-center gap-1.5 font-medium text-gray-500">
                            <Building2
                              size={14}
                            />
                            {occupied} occupied
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold ${
                            availabilityPercentage >
                            50
                              ? "text-emerald-600"
                              : availabilityPercentage >
                                  0
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {availabilityPercentage}% available
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            availabilityPercentage >
                            50
                              ? "bg-emerald-500"
                              : availabilityPercentage >
                                  0
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.max(
                                availabilityPercentage,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing overview */}
          {rooms.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <CircleDollarSign size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-blue-700">
                      Rent Range
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatCurrency(
                        roomStats.lowestRent
                      )}{" "}
                      —{" "}
                      {formatCurrency(
                        roomStats.highestRent
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm">
                    <Users size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      Occupancy
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {roomStats.occupiedRooms} occupied
                      {" · "}
                      {roomStats.availableRooms} available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Ready to save your room changes?
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Make sure room availability and pricing are
                  accurate before saving.
                </p>
              </div>

              <div className="flex w-full gap-3 sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() =>
                    navigate("/owner/properties")
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  loading={saving}
                  icon={Save}
                  className="flex-1 sm:min-w-48 sm:flex-none"
                  onClick={handleSave}
                >
                  Save Room Changes
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Remove confirmation */}
      <Modal
        open={removeModalOpen}
        onClose={closeRemoveModal}
        onConfirm={confirmRemoveRoom}
        title="Remove Room Type"
        description="Are you sure you want to remove this room type? The change will be applied when you save the room changes."
        confirmText="Remove"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="danger"
      />
    </div>
  );
};

export default ManageRooms;