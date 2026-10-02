import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { getProperties } from "../lib/api";

import PropertyFilters from "../components/properties/PropertyFilters";
import PropertyGrid from "../components/properties/PropertyGrid";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";

const initialFilters = {
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

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Validate rent range before API request
      if (
        filters.minRent &&
        filters.maxRent &&
        Number(filters.minRent) > Number(filters.maxRent)
      ) {
        setError(
          "Minimum rent cannot be greater than maximum rent.",
        );

        setProperties([]);
        setTotal(0);
        setPages(1);
        return;
      }

      const data = await getProperties({
        ...filters,
        page,
        limit: 9,
      });

      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (error) {
      console.error("Fetch properties error:", error);

      setError(
        error.message ||
          "Unable to load properties. Please try again.",
      );

      setProperties([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(filters.city) ||
    Boolean(filters.area) ||
    Boolean(filters.propertyType) ||
    Boolean(filters.gender) ||
    Boolean(filters.roomType) ||
    Boolean(filters.minRent) ||
    Boolean(filters.maxRent) ||
    Boolean(filters.amenities);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          Page Header
      ====================================================== */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border border-blue-100
                bg-blue-50 px-3.5 py-1.5
                text-xs font-semibold text-blue-700
              "
            >
              <Search
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />

              StayNest Properties
            </div>

            <h1
              className="
                mt-4 text-3xl font-bold
                tracking-tight text-gray-950
                sm:text-4xl lg:text-5xl
              "
            >
              Find a place you&apos;ll love to stay.
            </h1>

            <p
              className="
                mt-4 max-w-2xl
                text-sm leading-6 text-gray-600
                sm:text-base
              "
            >
              Discover verified PGs, hostels and
              co-living spaces near your college or
              workplace.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          Discovery Area
      ====================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Search Summary */}
        <section
          className="
            mb-6 rounded-2xl border
            border-gray-200 bg-white
            p-4 shadow-sm sm:p-5
          "
        >
          <div
            className="
              flex flex-col gap-4
              lg:flex-row lg:items-center
              lg:justify-between
            "
          >
            {/* Search information */}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  hidden h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-blue-50
                  text-blue-600 sm:flex
                "
              >
                <Search
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[11px] font-bold
                    uppercase tracking-wider
                    text-gray-400
                  "
                >
                  Search
                </p>

                <p
                  className="
                    truncate text-sm font-semibold
                    text-gray-900 sm:text-base
                  "
                >
                  {filters.city || filters.area
                    ? [
                        filters.area,
                        filters.city,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "All available properties"}
                </p>
              </div>
            </div>

            {/* Active filters */}
            <div className="flex flex-wrap items-center gap-2">
              {filters.propertyType && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    capitalize text-gray-600
                  "
                >
                  {filters.propertyType}
                </span>
              )}

              {filters.gender && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    capitalize text-gray-600
                  "
                >
                  {filters.gender}
                </span>
              )}

              {filters.roomType && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    capitalize text-gray-600
                  "
                >
                  {filters.roomType} room
                </span>
              )}

              {filters.minRent && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    text-gray-600
                  "
                >
                  ₹
                  {Number(
                    filters.minRent,
                  ).toLocaleString("en-IN")}
                  +
                </span>
              )}

              {filters.maxRent && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    text-gray-600
                  "
                >
                  Up to ₹
                  {Number(
                    filters.maxRent,
                  ).toLocaleString("en-IN")}
                </span>
              )}

              {filters.amenities && (
                <span
                  className="
                    rounded-full border
                    border-gray-200 bg-gray-50
                    px-3 py-1.5
                    text-xs font-semibold
                    text-gray-600
                  "
                >
                  {filters.amenities}
                </span>
              )}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            Discovery Layout
        ====================================================== */}
        <div
          className="
            lg:grid lg:grid-cols-[280px_minmax(0,1fr)]
            lg:items-start lg:gap-8
          "
        >
          {/* Filters */}
          <PropertyFilters
            filters={filters}
            setFilters={handleFiltersChange}
          />

          {/* Results */}
          <section className="mt-5 min-w-0 lg:mt-0">
            {/* Results Header */}
            <div
              className="
                mb-5 flex items-end
                justify-between gap-4
              "
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="
                      text-lg font-bold
                      text-gray-950 sm:text-xl
                    "
                  >
                    Available properties
                  </h2>

                  {!loading && !error && (
                    <span
                      className="
                        rounded-full bg-blue-50
                        px-2.5 py-1
                        text-[11px] font-bold
                        text-blue-600
                      "
                    >
                      {total}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Find a place that matches your
                  preferences.
                </p>
              </div>

              {!loading && !error && (
                <div
                  className="
                    hidden items-center gap-2
                    rounded-xl border
                    border-gray-200 bg-white
                    px-3 py-2 text-xs
                    font-medium text-gray-500
                    shadow-sm sm:flex
                  "
                >
                  <SlidersHorizontal
                    size={15}
                    aria-hidden="true"
                  />

                  {total}{" "}
                  {total === 1
                    ? "property"
                    : "properties"}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <PropertyGrid
                properties={[]}
                loading
              />
            )}

            {/* Error */}
            {!loading && error && (
              <ErrorState
                title="We couldn't load the properties"
                description={error}
                onRetry={fetchProperties}
              />
            )}

            {/* Results */}
            {!loading && !error && (
              <PropertyGrid
                properties={properties}
              />
            )}

            {/* Pagination */}
            {!loading &&
              !error &&
              pages > 1 && (
                <div
                  className="
                    mt-8 flex items-center
                    justify-between gap-3
                    rounded-2xl border
                    border-gray-200 bg-white
                    p-3 shadow-sm sm:p-4
                  "
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                      )
                    }
                  >
                    <span className="hidden sm:inline">
                      Previous
                    </span>
                  </Button>

                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">
                      Page {page} of {pages}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {total} total properties
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronRight}
                    iconPosition="right"
                    disabled={page >= pages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          pages,
                          current + 1,
                        ),
                      )
                    }
                  >
                    <span className="hidden sm:inline">
                      Next
                    </span>
                  </Button>
                </div>
              )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default Properties;