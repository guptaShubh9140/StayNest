import { NavLink } from "react-router-dom";

const MobileMenu = ({
  open,
  onClose,
  items = [],
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
      />

      <aside className="relative h-full w-[min(85%,20rem)] bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <span className="text-lg font-bold text-gray-900">
            StayNest
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            ×
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                  transition
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `
                }
              >
                {Icon && (
                  <Icon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                )}

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default MobileMenu;