import { SearchX } from "lucide-react";

import PropertyCard from "./PropertyCard";
import { SkeletonProperty } from "../ui/Skeleton";

const PropertyGrid = ({ properties, loading = false }) => {
  // Loading state
  if (loading) {
    return (
      <section aria-label="Loading properties" aria-busy="true">
        <div className="mb-5">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-28 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonProperty key={index} />
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <section
        aria-label="No properties found"
        className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <SearchX
            size={27}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-gray-900">
          No properties found
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          We couldn't find any properties matching your current
          search or filters. Try adjusting your preferences.
        </p>

        <p className="mt-4 text-xs font-medium text-gray-400">
          Try changing your location, rent range, or property type.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Available properties">
      {/* Results Header */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Available Properties
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"} found
          </p>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
          />
        ))}
      </div>
    </section>
  );
};

export default PropertyGrid;