import { useState } from "react";
import {
  ChevronDown,
  Filter,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

const DEFAULT_FILTERS = {
  city: "",
  area: "",
  propertyType: "",
  gender: "",
  roomType: "",
  minRent: "",
  maxRent: "",
  amenities: "",
  sort: "newest",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50";

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 pr-10 text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50";

const labelClass = "mb-2 block text-sm font-semibold text-gray-800";

const PropertyFilters = ({ filters, setFilters }) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "sort" && value !== ""
  ).length;

  const renderSelect = ({
    id,
    label,
    value,
    onChange,
    children,
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          {children}
        </select>

        <ChevronDown
          size={17}
          strokeWidth={2}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );

  const filterContent = (
    <div className="space-y-5">
      {/* Location */}
      <div>
        <label htmlFor="property-city" className={labelClass}>
          City
        </label>

        <div className="relative">
          <MapPin
            size={17}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />

          <input
            id="property-city"
            type="text"
            placeholder="e.g. Bangalore"
            value={filters.city}
            onChange={(event) =>
              updateFilter("city", event.target.value)
            }
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Area */}
      <div>
        <label htmlFor="property-area" className={labelClass}>
          Area
        </label>

        <input
          id="property-area"
          type="text"
          placeholder="e.g. Bellandur"
          value={filters.area}
          onChange={(event) =>
            updateFilter("area", event.target.value)
          }
          className={inputClass}
        />
      </div>

      {/* Property Type */}
      {renderSelect({
        id: "property-type",
        label: "Property Type",
        value: filters.propertyType,
        onChange: (value) => updateFilter("propertyType", value),
        children: (
          <>
            <option value="">All Types</option>
            <option value="pg">PG</option>
            <option value="hostel">Hostel</option>
            <option value="coliving">Co-Living</option>
          </>
        ),
      })}

      {/* Gender */}
      {renderSelect({
        id: "property-gender",
        label: "Gender Preference",
        value: filters.gender,
        onChange: (value) => updateFilter("gender", value),
        children: (
          <>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </>
        ),
      })}

      {/* Room Type */}
      {renderSelect({
        id: "property-room",
        label: "Room Type",
        value: filters.roomType,
        onChange: (value) => updateFilter("roomType", value),
        children: (
          <>
            <option value="">All Rooms</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </>
        ),
      })}

      {/* Monthly Rent */}
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-800">
          Monthly Rent
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              ₹
            </span>

            <input
              type="number"
              min="0"
              placeholder="Min"
              aria-label="Minimum monthly rent"
              value={filters.minRent}
              onChange={(event) =>
                updateFilter("minRent", event.target.value)
              }
              className={`${inputClass} pl-8`}
            />
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              ₹
            </span>

            <input
              type="number"
              min="0"
              placeholder="Max"
              aria-label="Maximum monthly rent"
              value={filters.maxRent}
              onChange={(event) =>
                updateFilter("maxRent", event.target.value)
              }
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label htmlFor="property-amenities" className={labelClass}>
          Amenities
        </label>

        <input
          id="property-amenities"
          type="text"
          placeholder="wifi,laundry,parking"
          value={filters.amenities}
          onChange={(event) =>
            updateFilter("amenities", event.target.value)
          }
          className={inputClass}
        />

        <p className="mt-1.5 text-xs leading-5 text-gray-400">
          Separate multiple amenities with commas.
        </p>
      </div>

      {/* Sort */}
      {renderSelect({
        id: "property-sort",
        label: "Sort By",
        value: filters.sort,
        onChange: (value) => updateFilter("sort", value),
        children: (
          <>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rentLow">Price: Low to High</option>
            <option value="rentHigh">Price: High to Low</option>
          </>
        ),
      })}

      {/* Clear */}
      <button
        type="button"
        onClick={clearFilters}
        disabled={activeFilterCount === 0}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <SlidersHorizontal
                    size={19}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Filters
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Refine your search
                  </p>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>

          <div className="p-5">{filterContent}</div>
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex min-h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open property filters"
        >
          <span className="flex items-center gap-2.5">
            <Filter
              size={19}
              strokeWidth={2}
              className="text-gray-600"
              aria-hidden="true"
            />

            Filters
          </span>

          <span className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}

            <ChevronDown
              size={17}
              className="rotate-[-90deg] text-gray-400"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Property filters"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <SlidersHorizontal
                    size={19}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Filters
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Refine your property search
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close filters"
              >
                <X size={19} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {filterContent}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                  className="min-h-12 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="min-h-12 flex-[1.5] rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyFilters;