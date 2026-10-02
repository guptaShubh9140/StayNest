import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Image,
  Info,
  MapPin,
  MapPinned,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { getPropertyById, updateProperty } from "../lib/api";

import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const createRoom = () => ({
  roomType: "single",
  totalRooms: 1,
  availableRooms: 1,
  monthlyRent: "",
  securityDeposit: "",
});

const LoadingBlock = ({ className = "" }) => {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
  );
};

const SectionHeader = ({ icon: Icon, title, description, badge }) => {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={21} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>

          {badge && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
  } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    propertyType: "pg",

    address: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
    },

    location: {
      latitude: "",
      longitude: "",
    },

    gender: "unisex",

    amenities: "",

    rooms: [],

    images: "",

    rules: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

        const data = await getPropertyById(id);

        const property = data.property || data;

        setFormData({
          name: property.name || "",

          description: property.description || "",

          propertyType: property.propertyType || "pg",

          address: {
            street: property.address?.street || "",
            area: property.address?.area || "",
            city: property.address?.city || "",
            state: property.address?.state || "",
            pincode: property.address?.pincode || "",
          },

          location: {
            latitude: property.location?.latitude ?? "",
            longitude: property.location?.longitude ?? "",
          },

          gender: property.gender || "unisex",

          amenities: property.amenities?.join(", ") || "",

          rooms:
            property.rooms?.map((room) => ({
              roomType: room.roomType,
              totalRooms: room.totalRooms,
              availableRooms: room.availableRooms,
              monthlyRent: room.monthlyRent,
              securityDeposit: room.securityDeposit || 0,
            })) || [],

          images: property.images?.join(", ") || "",

          rules: property.rules?.join(", ") || "",
        });
      } catch (error) {
        console.error("Fetch property error:", error);

        const errorMessage = error.message || "Failed to load property.";

        setError(errorMessage);

        showError("Unable to load property", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  // --------------------------------
  // Normal fields
  // --------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------
  // Address
  // --------------------------------

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  // --------------------------------
  // Location
  // --------------------------------

  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  // --------------------------------
  // Room changes
  // --------------------------------

  const handleRoomChange = (index, e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const rooms = [...prev.rooms];

      rooms[index] = {
        ...rooms[index],
        [name]: value,
      };

      return {
        ...prev,
        rooms,
      };
    });
  };

  // --------------------------------
  // Add room
  // --------------------------------

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, createRoom()],
    }));
  };

  // --------------------------------
  // Remove room
  // --------------------------------

  const removeRoom = (index) => {
    if (formData.rooms.length === 1) {
      showWarning("Room type required", "At least one room type is required.");

      return;
    }

    setFormData((prev) => ({
      ...prev,

      rooms: prev.rooms.filter((_, roomIndex) => roomIndex !== index),
    }));
  };

  // --------------------------------
  // Submit
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.name.trim()) {
      setError("Property name is required.");

      showWarning("Property name required", "Please enter a property name.");

      return;
    }

    if (!formData.description.trim()) {
      setError("Property description is required.");

      showWarning(
        "Description required",
        "Please enter a description for the property.",
      );

      return;
    }

    if (!formData.address.city.trim()) {
      setError("City is required.");

      showWarning("City required", "Please enter the property city.");

      return;
    }

    if (!formData.address.state.trim()) {
      setError("State is required.");

      showWarning("State required", "Please enter the property state.");

      return;
    }

    if (!formData.address.pincode.trim()) {
      setError("Pincode is required.");

      showWarning("Pincode required", "Please enter the property pincode.");

      return;
    }

    if (formData.rooms.length === 0) {
      setError("At least one room type is required.");

      showWarning("Room type required", "Please add at least one room type.");

      return;
    }

    for (const room of formData.rooms) {
      if (!room.monthlyRent) {
        setError("Monthly rent is required for every room type.");

        showWarning(
          "Monthly rent required",
          "Please enter the monthly rent for every room type.",
        );

        return;
      }

      if (!room.securityDeposit) {
        setError("Security deposit is required for every room type.");

        showWarning(
          "Security deposit required",
          "Please enter the security deposit for every room type.",
        );

        return;
      }
    }

    try {
      setSaving(true);

      const propertyData = {
        name: formData.name.trim(),

        description: formData.description.trim(),

        propertyType: formData.propertyType,

        address: {
          street: formData.address.street.trim(),
          area: formData.address.area.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
        },

        location: {
          latitude:
            formData.location.latitude !== ""
              ? Number(formData.location.latitude)
              : undefined,

          longitude:
            formData.location.longitude !== ""
              ? Number(formData.location.longitude)
              : undefined,
        },

        gender: formData.gender,

        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        rooms: formData.rooms.map((room) => ({
          roomType: room.roomType,

          totalRooms: Number(room.totalRooms),

          availableRooms: Number(room.availableRooms),

          monthlyRent: Number(room.monthlyRent),

          securityDeposit: Number(room.securityDeposit),
        })),

        images: formData.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        rules: formData.rules
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await updateProperty(id, propertyData, token);

      showSuccess(
        "Property updated",
        "Your property has been updated successfully.",
      );

      navigate("/owner/properties");
    } catch (error) {
      console.error("Update property error:", error);

      const errorMessage = error.message || "Failed to update property.";

      setError(errorMessage);

      showError("Unable to update property", errorMessage);
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
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <LoadingBlock className="h-6 w-48" />

              <LoadingBlock className="mt-3 h-4 w-72" />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <LoadingBlock className="h-11 w-full" />
                <LoadingBlock className="h-11 w-full" />
                <LoadingBlock className="h-11 w-full" />
                <LoadingBlock className="h-11 w-full" />
              </div>
            </div>
          ))}
        </main>
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
            onClick={() => navigate("/owner/properties")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back to Properties
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Building2 size={14} />
                Property Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Edit Property
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Update your property details, rooms, pricing, amenities, and
                rules.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
              <ShieldCheck size={17} className="text-emerald-600" />
              Changes will be saved to your property.
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <Info size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Please review your form</p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card padding="lg">
            <SectionHeader
              icon={Building2}
              title="Basic Information"
              description="Keep your property's main information accurate."
              badge="Required"
            />

            <div className="grid gap-5">
              <Input
                label="Property Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: StayNest Premium PG"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Property Description
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the property, facilities, nearby landmarks, and what students can expect..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Select
                  label="Property Type"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  options={[
                    {
                      value: "pg",
                      label: "PG",
                    },
                    {
                      value: "hostel",
                      label: "Hostel",
                    },
                    {
                      value: "coliving",
                      label: "Co-Living",
                    },
                  ]}
                />

                <Select
                  label="Suitable For"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    {
                      value: "unisex",
                      label: "Unisex",
                    },
                    {
                      value: "male",
                      label: "Male",
                    },
                    {
                      value: "female",
                      label: "Female",
                    },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card padding="lg">
            <SectionHeader
              icon={MapPin}
              title="Property Address"
              description="Update the location details students will see."
              badge="Required"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Street / Building"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="House number, street, building name"
                />
              </div>

              <Input
                label="Area"
                name="area"
                value={formData.address.area}
                onChange={handleAddressChange}
                placeholder="Example: Bellandur"
              />

              <Input
                label="City"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                placeholder="Example: Bangalore"
                required
              />

              <Input
                label="State"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                placeholder="Example: Karnataka"
                required
              />

              <Input
                label="Pincode"
                name="pincode"
                value={formData.address.pincode}
                onChange={handleAddressChange}
                placeholder="Example: 560103"
                required
              />
            </div>
          </Card>

          {/* Location */}
          <Card padding="lg">
            <SectionHeader
              icon={MapPinned}
              title="Map Location"
              description="Optional latitude and longitude."
              badge="Optional"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Latitude"
                type="number"
                step="any"
                name="latitude"
                value={formData.location.latitude}
                onChange={handleLocationChange}
                placeholder="Example: 12.9352"
              />

              <Input
                label="Longitude"
                type="number"
                step="any"
                name="longitude"
                value={formData.location.longitude}
                onChange={handleLocationChange}
                placeholder="Example: 77.6245"
              />
            </div>
          </Card>

          {/* Rooms */}
          <Card padding="lg">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                icon={Wallet}
                title="Rooms & Pricing"
                description="Manage room types, availability, and pricing."
                badge="Required"
              />

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

            <div className="space-y-4">
              {formData.rooms.map((room, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-gray-200">
                        <Users size={17} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Room Type {index + 1}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Manage capacity and pricing
                        </p>
                      </div>
                    </div>

                    {formData.rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(index)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    <Select
                      label="Room Type"
                      name="roomType"
                      value={room.roomType}
                      onChange={(e) => handleRoomChange(index, e)}
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
                      name="totalRooms"
                      value={room.totalRooms}
                      onChange={(e) => handleRoomChange(index, e)}
                    />

                    <Input
                      label="Available"
                      type="number"
                      min="0"
                      name="availableRooms"
                      value={room.availableRooms}
                      onChange={(e) => handleRoomChange(index, e)}
                    />

                    <Input
                      label="Monthly Rent"
                      type="number"
                      min="0"
                      name="monthlyRent"
                      value={room.monthlyRent}
                      onChange={(e) => handleRoomChange(index, e)}
                      required
                    />

                    <Input
                      label="Security Deposit"
                      type="number"
                      min="0"
                      name="securityDeposit"
                      value={room.securityDeposit}
                      onChange={(e) => handleRoomChange(index, e)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Amenities */}
          <Card padding="lg">
            <SectionHeader
              icon={CheckCircle2}
              title="Amenities"
              description="Update the facilities available at your property."
            />

            <Input
              label="Amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, AC, Laundry, Parking, CCTV, Power Backup"
              hint="Separate each amenity with a comma."
            />

            {formData.amenities.trim() && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.amenities
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {amenity}
                    </span>
                  ))}
              </div>
            )}
          </Card>

          {/* Images */}
          <Card padding="lg">
            <SectionHeader
              icon={Image}
              title="Property Images"
              description="Update the image URLs displayed for your property."
              badge="Optional"
            />

            <Input
              label="Image URLs"
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              hint="Separate multiple image URLs with commas."
            />

            {formData.images.trim() && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-700">
                <div className="flex items-start gap-2">
                  <Image size={15} className="mt-0.5 shrink-0" />

                  <span>
                    Make sure your image URLs are publicly accessible.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Rules */}
          <Card padding="lg">
            <SectionHeader
              icon={FileText}
              title="Property Rules"
              description="Update the rules residents should know."
              badge="Optional"
            />

            <Input
              label="Rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="No smoking, No pets, Visitors allowed, Maintain cleanliness"
              hint="Separate each rule with a comma."
            />

            {formData.rules.trim() && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.rules
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((rule, index) => (
                    <span
                      key={`${rule}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {rule}
                    </span>
                  ))}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="sticky bottom-3 z-10">
            <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-gray-900/5 backdrop-blur sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">
                    Finished making changes?
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Save your latest property information.
                  </p>
                </div>

                <div className="flex w-full gap-3 sm:w-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                    onClick={() => navigate("/owner/properties")}
                    icon={X}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    loading={saving}
                    className="flex-1 sm:min-w-48 sm:flex-none"
                    icon={Save}
                  >
                    Update Property
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProperty;
