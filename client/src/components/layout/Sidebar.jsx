import { NavLink } from "react-router-dom";

const Sidebar = ({ items = [], title = "StayNest" }) => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
        <div className="border-b border-gray-100 px-5 py-5">
          <p className="text-lg font-bold tracking-tight text-gray-900">
            {title}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Manage your StayNest account
          </p>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Dashboard navigation"
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium
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

                {item.badge && (
                  <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;