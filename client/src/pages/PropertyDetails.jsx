import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Heart,
  ImageOff,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { getPropertyById } from "../lib/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const getRoomDescription = (room) => {
  if (!room) return "";

  if (room.description) {
    return room.description;
  }

  const parts = [];

  if (room.roomType) {
    parts.push(
      room.roomType
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    );
  }

  if (room.capacity) {
    parts.push(`${room.capacity} guest${room.capacity > 1 ? "s" : ""}`);
  }

  return parts.join(" • ");
};

const formatPropertyType = (value) => {
  if (!value) return "Property";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatGender = (value) => {
  if (!value) return "All";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getMinimumEndDate = (startDate) => {
  if (!startDate) return "";

  const date = new Date(`${startDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [property, setProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const [favorite, setFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPropertyById(id);

        if (!response?.property) {
          throw new Error("Property not found.");
        }

        setProperty(response.property);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this property."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const images = property?.images || [];
  const rooms = property?.rooms || [];
  const amenities = property?.amenities || [];
  const rules = property?.rules || [];

  const availableRoomsCount = useMemo(() => {
    return rooms.reduce((total, room) => {
      return total + Number(room.availableRooms || 0);
    }, 0);
  }, [rooms]);

  const availableRooms = useMemo(() => {
    return rooms.filter((room) => Number(room.availableRooms || 0) > 0);
  }, [rooms]);

  const startingRent = useMemo(() => {
    const rents = availableRooms
      .map((room) => Number(room.monthlyRent))
      .filter((rent) => Number.isFinite(rent));

    if (rents.length === 0) {
      return null;
    }

    return Math.min(...rents);
  }, [availableRooms]);

  const minimumEndDate = useMemo(
    () => getMinimumEndDate(startDate),
    [startDate]
  );

  const currentImage = images[selectedImage];

  const propertyLocation = [
    property?.address?.area,
    property?.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const fullLocation = [
    property?.address?.street,
    property?.address?.area,
    property?.address?.city,
    property?.address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const owner = property?.owner;

  const selectRoom = (room) => {
    if (Number(room.availableRooms || 0) <= 0) {
      return;
    }

    setSelectedRoom(room);
    setBookingError("");
    setBookingSuccess("");
    setBookingConfirmation(null);
  };

  const handlePreviousImage = () => {
    if (images.length <= 1) return;

    setImageError(false);

    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;

    setImageError(false);

    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setBookingError("");
    setBookingSuccess("");
    setBookingConfirmation(null);

    if (endDate && value >= endDate) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setBookingError("");
    setBookingSuccess("");
    setBookingConfirmation(null);
  };

  const handleBookNow = async () => {
    setBookingError("");
    setBookingSuccess("");
    setBookingConfirmation(null);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/properties/${property._id}`,
        },
      });

      return;
    }

    if (!selectedRoom) {
      const message = "Please select a room before requesting a booking.";
      setBookingError(message);
      showError(message);
      return;
    }

    if (Number(selectedRoom.availableRooms || 0) <= 0) {
      const message = "This room is currently unavailable.";
      setBookingError(message);
      showError(message);
      return;
    }

    if (!startDate) {
      const message = "Please select a move-in date.";
      setBookingError(message);
      showError(message);
      return;
    }

    if (!endDate) {
      const message = "Please select an end date.";
      setBookingError(message);
      showError(message);
      return;
    }

    if (endDate <= startDate) {
      const message = "End date must be after the move-in date.";
      setBookingError(message);
      showError(message);
      return;
    }

    try {
      setBookingLoading(true);

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property._id,
          roomId: selectedRoom._id,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to create booking."
        );
      }

      const confirmation = {
        bookingId:
          data?.booking?._id ||
          data?.booking?.id ||
          data?._id ||
          data?.id ||
          "Created",
        propertyName: property.name,
        roomType: selectedRoom.roomType,
        startDate,
        endDate,
        monthlyRent: selectedRoom.monthlyRent,
        securityDeposit: selectedRoom.securityDeposit,
      };

      setBookingConfirmation(confirmation);

      const message =
        data?.message ||
        "Booking request submitted successfully. Waiting for owner confirmation.";

      setBookingSuccess(message);
      success(message);
    } catch (err) {
      const message =
        err?.message || "Unable to create the booking. Please try again.";

      setBookingError(message);
      showError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-32 rounded bg-gray-200" />

            <div className="mt-6 grid gap-3 lg:grid-cols-[1.6fr_0.7fr]">
              <div className="h-[420px] rounded-3xl bg-gray-200" />

              <div className="grid grid-cols-2 gap-3">
                <div className="h-[204px] rounded-2xl bg-gray-200" />
                <div className="h-[204px] rounded-2xl bg-gray-200" />
                <div className="h-[204px] rounded-2xl bg-gray-200" />
                <div className="h-[204px] rounded-2xl bg-gray-200" />
              </div>
            </div>

            <div className="mt-8 h-10 w-2/3 rounded bg-gray-200" />
            <div className="mt-4 h-5 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Property unavailable"
            description={
              error ||
              "We couldn't find this property. It may have been removed or is no longer available."
            }
            onRetry={() => window.location.reload()}
          />

          <div className="mt-6 text-center">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to properties
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">
          <Link
            to="/properties"
            className="font-medium transition hover:text-blue-600"
          >
            Properties
          </Link>

          <ChevronRight size={15} />

          <span className="truncate text-gray-900">
            {property.name || "Property details"}
          </span>
        </div>

        {/* Gallery */}
        <section aria-label="Property photos">
          <div className="grid gap-3 lg:grid-cols-[1.55fr_0.8fr]">
            <div className="group relative min-h-[300px] overflow-hidden rounded-3xl bg-gray-100 sm:min-h-[420px] lg:min-h-[500px]">
              {currentImage && !imageError ? (
                <img
                  src={currentImage}
                  alt={`${property.name || "Property"} ${
                    selectedImage + 1
                  }`}
                  className="h-full min-h-[300px] w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:min-h-[420px] lg:min-h-[500px]"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center sm:min-h-[420px] lg:min-h-[500px]">
                  <div className="text-center text-gray-400">
                    <ImageOff size={42} className="mx-auto" />
                    <p className="mt-3 text-sm font-medium">
                      No image available
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
                <Link
                  to="/properties"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
                  aria-label="Back to properties"
                >
                  <ArrowLeft size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => setFavorite((value) => !value)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 backdrop-blur-md transition ${
                    favorite
                      ? "bg-white text-red-500"
                      : "bg-black/35 text-white hover:bg-black/50"
                  }`}
                  aria-label={
                    favorite
                      ? "Remove property from favorites"
                      : "Add property to favorites"
                  }
                >
                  <Heart
                    size={19}
                    fill={favorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    {selectedImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {[1, 2, 3, 4].map((offset) => {
                const imageIndex = selectedImage + offset;
                const image = images[imageIndex];

                return (
                  <button
                    key={`${offset}-${imageIndex}`}
                    type="button"
                    onClick={() => {
                      if (image) {
                        setSelectedImage(imageIndex);
                        setImageError(false);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl bg-gray-100 text-left ${
                      image ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${property.name || "Property"} preview`}
                        className="h-full min-h-[120px] w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[120px] items-center justify-center text-gray-300">
                        <ImageOff size={26} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(index);
                    setImageError(false);
                  }}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Main content */}
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            {/* Header */}
            <section>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <ShieldCheck size={14} />
                  Verified
                </span>

                {property.propertyType && (
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    {formatPropertyType(property.propertyType)}
                  </span>
                )}

                {property.gender && (
                  <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {formatGender(property.gender)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                    {property.name}
                  </h1>

                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <span>{fullLocation || "Location available on request"}</span>
                  </div>
                </div>

                {property.rating !== undefined &&
                  property.rating !== null && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <Star
                        size={17}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="font-bold text-gray-900">
                        {Number(property.rating).toFixed(1)}
                      </span>
                    </div>
                  )}
              </div>
            </section>

            {/* Quick facts */}
            <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  Property type
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatPropertyType(property.propertyType)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users size={18} />
                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  Suitable for
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatGender(property.gender)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Wallet size={18} />
                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  Room types
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {rooms.length || 0} option{rooms.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={18} />
                </div>

                <p className="mt-3 text-xs font-medium text-gray-500">
                  Availability
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {availableRoomsCount} room
                  {availableRoomsCount === 1 ? "" : "s"}
                </p>
              </div>
            </section>

            {/* About */}
            <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  About
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-gray-950">
                  About this property
                </h2>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {property.description ||
                  "This property provides comfortable accommodation with convenient facilities for students and working professionals."}
              </p>
            </section>

            {/* Amenities */}
            <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Facilities
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-gray-950">
                Amenities
              </h2>

              {amenities.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <Check size={16} strokeWidth={2.5} />
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        {String(amenity)
                          .replace(/[-_]/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
                  No amenities have been listed for this property.
                </div>
              )}
            </section>

            {/* Rules */}
            <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Info size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                    Guidelines
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-gray-950">
                    House rules
                  </h2>
                </div>
              </div>

              {rules.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {rules.map((rule, index) => (
                    <div
                      key={`${rule}-${index}`}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
                        <Check size={14} />
                      </span>

                      <p className="text-sm leading-6 text-gray-600">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  No specific house rules have been listed.
                </p>
              )}
            </section>

            {/* Owner */}
            <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Contact
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-gray-950">
                Property owner
              </h2>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-extrabold text-white">
                    {(owner?.name || "O").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      {owner?.name || "Property Owner"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Property owner
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {owner?.email && (
                    <a
                      href={`mailto:${owner.email}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Mail size={16} />
                      Email
                    </a>
                  )}

                  {owner?.phone && (
                    <a
                      href={`tel:${owner.phone}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}
                </div>
              </div>

              {(owner?.email || owner?.phone) && (
                <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
                  {owner?.email && (
                    <p>
                      <span className="font-semibold text-gray-800">
                        Email:
                      </span>{" "}
                      {owner.email}
                    </p>
                  )}

                  {owner?.phone && (
                    <p className="mt-1">
                      <span className="font-semibold text-gray-800">
                        Phone:
                      </span>{" "}
                      {owner.phone}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card padding="none" className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Book your stay
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-gray-950">
                      {startingRent !== null
                        ? formatCurrency(startingRent)
                        : "Price unavailable"}
                    </p>

                    {startingRent !== null && (
                      <p className="mt-1 text-sm text-gray-500">
                        starting monthly rent
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-sm font-bold text-green-600">
                      {availableRoomsCount} room
                      {availableRoomsCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* Rooms */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-gray-900">
                      Choose a room
                    </h2>

                    <span className="text-xs font-medium text-gray-500">
                      {availableRooms.length} available
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {rooms.length > 0 ? (
                      rooms.map((room, index) => {
                        const available =
                          Number(room.availableRooms || 0) > 0;

                        const selected =
                          selectedRoom?._id === room._id;

                        return (
                          <button
                            key={room._id || index}
                            type="button"
                            disabled={!available}
                            onClick={() => selectRoom(room)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-100"
                                : available
                                ? "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                                : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-gray-900">
                                    {formatPropertyType(room.roomType)}
                                  </p>

                                  {selected && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                                      <Check size={11} />
                                      Selected
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {getRoomDescription(room) ||
                                    "Comfortable accommodation option"}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="font-extrabold text-gray-900">
                                  {formatCurrency(room.monthlyRent)}
                                </p>

                                <p className="mt-0.5 text-[11px] text-gray-500">
                                  / month
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                              <span
                                className={`text-xs font-semibold ${
                                  available
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {available
                                  ? `${room.availableRooms} available`
                                  : "Currently unavailable"}
                              </span>

                              {room.securityDeposit !== undefined &&
                                room.securityDeposit !== null && (
                                  <span className="text-xs text-gray-500">
                                    Deposit{" "}
                                    {formatCurrency(room.securityDeposit)}
                                  </span>
                                )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
                        <p className="text-sm font-semibold text-gray-700">
                          No rooms available
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          This property currently has no listed rooms.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected room summary */}
                {selectedRoom && (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Selected room
                        </p>

                        <p className="mt-1 font-bold text-gray-900">
                          {formatPropertyType(selectedRoom.roomType)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRoom(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-gray-700"
                        aria-label="Clear selected room"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white px-3 py-2.5">
                        <p className="text-[11px] text-gray-500">Monthly rent</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatCurrency(selectedRoom.monthlyRent)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2.5">
                        <p className="text-[11px] text-gray-500">
                          Security deposit
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {selectedRoom.securityDeposit !== undefined
                            ? formatCurrency(selectedRoom.securityDeposit)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-6">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Select your dates
                  </h2>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <CalendarDays size={14} />
                        Move-in date
                      </span>

                      <input
                        type="date"
                        min={getTodayDate()}
                        value={startDate}
                        onChange={(event) =>
                          handleStartDateChange(event.target.value)
                        }
                        className="min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <CalendarDays size={14} />
                        End date
                      </span>

                      <input
                        type="date"
                        min={minimumEndDate || getTodayDate()}
                        value={endDate}
                        onChange={(event) =>
                          handleEndDateChange(event.target.value)
                        }
                        disabled={!startDate}
                        className="min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </label>
                  </div>
                </div>

                {/* Price summary */}
                {selectedRoom && (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Monthly rent</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(selectedRoom.monthlyRent)}
                      </span>
                    </div>

                    {selectedRoom.securityDeposit !== undefined &&
                      selectedRoom.securityDeposit !== null && (
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Security deposit
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(selectedRoom.securityDeposit)}
                          </span>
                        </div>
                      )}

                    <div className="my-3 border-t border-gray-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        Initial amount
                      </span>

                      <span className="text-lg font-extrabold text-gray-950">
                        {formatCurrency(
                          Number(selectedRoom.monthlyRent || 0) +
                            Number(selectedRoom.securityDeposit || 0)
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-gray-500">
                      This is an informational estimate. The final payment
                      amount is determined by the booking and payment flow.
                    </p>
                  </div>
                )}

                {/* Booking errors */}
                {bookingError && (
                  <div className="mt-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <CircleAlert
                      size={19}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Booking request couldn't be submitted
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700">
                        {bookingError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success */}
                {bookingSuccess && (
                  <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check size={17} strokeWidth={2.5} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Booking request submitted
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-700">
                          {bookingSuccess}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {bookingConfirmation && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Booking details
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {bookingConfirmation.propertyName}
                        </p>
                      </div>

                      <StatusBadge status="pending" />
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Booking ID</span>
                        <span className="font-semibold text-gray-800">
                          {bookingConfirmation.bookingId}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Room</span>
                        <span className="font-semibold text-gray-800">
                          {formatPropertyType(
                            bookingConfirmation.roomType
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Move-in</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(bookingConfirmation.startDate)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">End date</span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(bookingConfirmation.endDate)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/bookings"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                    >
                      View my bookings
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                <Button
                  type="button"
                  size="lg"
                  fullWidth
                  loading={bookingLoading}
                  disabled={
                    !selectedRoom ||
                    Number(selectedRoom.availableRooms || 0) <= 0 ||
                    !!bookingConfirmation
                  }
                  onClick={handleBookNow}
                  className="mt-5"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {bookingConfirmation
                    ? "Booking Requested"
                    : "Request Booking"}
                </Button>

                <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-gray-500">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                  <span>
                    Your request is sent to the property owner for
                    confirmation. Payment is handled after confirmation.
                  </span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Mobile sticky booking CTA */}
      {!bookingConfirmation && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-500">
                {selectedRoom
                  ? formatPropertyType(selectedRoom.roomType)
                  : "Select a room"}
              </p>

              <p className="text-base font-extrabold text-gray-950">
                {selectedRoom
                  ? `${formatCurrency(selectedRoom.monthlyRent)} / month`
                  : startingRent !== null
                  ? `From ${formatCurrency(startingRent)} / month`
                  : "Price unavailable"}
              </p>
            </div>

            <Button
              size="md"
              loading={bookingLoading}
              disabled={
                !selectedRoom ||
                Number(selectedRoom.availableRooms || 0) <= 0
              }
              onClick={handleBookNow}
              icon={ArrowRight}
              iconPosition="right"
            >
              Request
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PropertyDetails;