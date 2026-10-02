import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Heart,
  ImageOff,
  MapPin,
  Star,
} from "lucide-react";

const PropertyCard = ({ property }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const firstRoom = property.rooms?.[0];

  const imageUrl = property.images?.[0];

  const propertyType = property.propertyType
    ? property.propertyType
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Property";

  const gender = property.gender
    ? property.gender
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

  const availableRooms =
    property.rooms?.reduce(
      (total, room) => total + Number(room.availableRooms || 0),
      0
    ) || 0;

  const handleFavorite = () => {
    setIsFavorite((current) => !current);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {/* Image loading placeholder */}
        {imageUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={property.name || "StayNest property"}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                <ImageOff
                  size={25}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-3 text-xs font-medium text-gray-500">
                No image available
              </p>
            </div>
          </div>
        )}

        {/* Image gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {/* Verified */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check
                size={10}
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>

            Verified
          </span>

          {/* Favorite */}
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={
              isFavorite
                ? `Remove ${property.name || "property"} from favorites`
                : `Save ${property.name || "property"} to favorites`
            }
            aria-pressed={isFavorite}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isFavorite
                ? "text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart
              size={19}
              strokeWidth={1.9}
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Property type */}
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-gray-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {propertyType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title + Gender */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-gray-900">
            {property.name || "Unnamed Property"}
          </h2>

          {gender && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
              {gender}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin
            size={16}
            strokeWidth={1.8}
            className="shrink-0 text-gray-400"
            aria-hidden="true"
          />

          <span className="line-clamp-1">
            {property.address?.area || "Area"},{" "}
            {property.address?.city || "Location"}
          </span>
        </div>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Star
              size={13}
              strokeWidth={1.8}
              fill="currentColor"
              aria-hidden="true"
            />
            4.5
          </span>

          <span className="text-xs text-gray-400">
            Verified property
          </span>
        </div>

        {/* Description */}
        {property.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
            {property.description}
          </p>
        )}

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs font-medium capitalize text-gray-600"
              >
                {amenity}
              </span>
            ))}

            {property.amenities.length > 3 && (
              <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price + Availability */}
        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500">
              Starting from
            </p>

            {firstRoom ? (
              <p className="mt-0.5 text-xl font-bold tracking-tight text-gray-900">
                ₹
                {Number(firstRoom.monthlyRent || 0).toLocaleString(
                  "en-IN"
                )}

                <span className="ml-1 text-xs font-medium text-gray-500">
                  /month
                </span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-gray-500">
                Price unavailable
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              Availability
            </p>

            <p
              className={`mt-0.5 text-sm font-semibold ${
                availableRooms > 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {availableRooms > 0
                ? `${availableRooms} room${
                    availableRooms > 1 ? "s" : ""
                  } available`
                : "Currently full"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/properties/${property._id}`}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details

          <ArrowRight
            size={16}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
};

export default PropertyCard;