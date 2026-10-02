const Skeleton = ({
  className = "",
  variant = "default",
}) => {
  const variants = {
    default: "rounded-lg",
    text: "h-4 rounded-md",
    title: "h-7 rounded-md",
    circle: "rounded-full",
    button: "h-11 rounded-xl",
  };

  return (
    <div
      aria-hidden="true"
      className={`
        animate-pulse
        bg-gray-200
        ${variants[variant] || variants.default}
        ${className}
      `}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton className="h-48 w-full" />

      <div className="space-y-3 p-5">
        <Skeleton
          variant="title"
          className="w-3/4"
        />

        <Skeleton
          variant="text"
          className="w-1/2"
        />

        <Skeleton
          variant="text"
          className="w-full"
        />

        <div className="flex items-center justify-between gap-4 pt-2">
          <Skeleton
            variant="text"
            className="h-5 w-24"
          />

          <Skeleton
            variant="button"
            className="w-28"
          />
        </div>
      </div>
    </div>
  );
};

export const SkeletonProperty = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Skeleton className="h-52 w-full" />

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton
            variant="title"
            className="w-2/3"
          />

          <Skeleton
            variant="circle"
            className="h-8 w-8"
          />
        </div>

        <Skeleton
          variant="text"
          className="w-1/2"
        />

        <Skeleton
          variant="text"
          className="w-3/4"
        />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <div className="flex items-end justify-between gap-4 pt-2">
          <div className="space-y-2">
            <Skeleton
              variant="text"
              className="h-3 w-20"
            />

            <Skeleton
              variant="title"
              className="h-6 w-28"
            />
          </div>

          <Skeleton
            variant="button"
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable = ({
  rows = 5,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <Skeleton
          variant="title"
          className="w-40"
        />
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map(
          (_, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-5"
            >
              <Skeleton
                variant="text"
                className="w-28"
              />

              <Skeleton
                variant="text"
                className="w-24"
              />

              <Skeleton
                variant="text"
                className="w-20"
              />

              <Skeleton
                variant="text"
                className="hidden w-24 sm:block"
              />

              <Skeleton
                variant="text"
                className="hidden w-20 sm:block"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Dashboard heading */}
      <div className="space-y-2">
        <Skeleton
          variant="title"
          className="w-56"
        />

        <Skeleton
          variant="text"
          className="w-80"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <Skeleton
                variant="circle"
                className="h-10 w-10"
              />

              <Skeleton
                variant="text"
                className="mt-4 w-24"
              />

              <Skeleton
                variant="title"
                className="mt-2 w-20"
              />
            </div>
          )
        )}
      </div>

      {/* Dashboard content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-2xl" />

        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export default Skeleton;