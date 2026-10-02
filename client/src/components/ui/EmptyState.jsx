import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "Nothing here yet",
  description = "There is no data to display.",
  action,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon
          size={26}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900 sm:text-lg">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;