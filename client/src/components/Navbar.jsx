import { useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import NotificationBell from "./notifications/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    user = null;
  }

  const isLoggedIn = Boolean(token && user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const desktopLinkClass = (path) => `
    inline-flex items-center gap-2 rounded-xl px-3 py-2
    text-sm font-semibold transition-all duration-200
    ${
      isActive(path)
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
    }
  `;

  const mobileLinkClass = (path) => `
    flex min-h-11 items-center justify-between rounded-xl
    px-4 py-3 text-sm font-semibold transition-all duration-200
    ${
      isActive(path)
        ? "bg-blue-50 text-blue-600"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }
  `;

  const roleLabel = {
    student: "Student",
    owner: "Owner",
    admin: "Admin",
  };

  return (
    <nav
      className="
        sticky top-0 z-50 border-b border-gray-200
        bg-white/90 shadow-sm backdrop-blur-xl
      "
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================
            Main Navbar
        ========================== */}
        <div className="flex min-h-16 items-center justify-between gap-3">
          {/* =========================
              Logo
          ========================== */}
          <Link
            to="/"
            onClick={closeMenu}
            className="
              group flex shrink-0 items-center gap-2
              rounded-xl focus:outline-none
              focus:ring-2 focus:ring-blue-500
              focus:ring-offset-2
            "
          >
            <div
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl bg-blue-600 text-white
                shadow-sm transition-all duration-200
                group-hover:bg-blue-700
                group-hover:shadow-md
              "
            >
              <Building2
                size={20}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </div>

            <span
              className="
                text-xl font-bold tracking-tight
                text-gray-900 sm:text-2xl
              "
            >
              Stay<span className="text-blue-600">Nest</span>
            </span>
          </Link>

          {/* =========================
              Desktop Navigation
          ========================== */}
          <div className="hidden items-center gap-1 md:flex">
            {/* Home */}
            <Link
              to="/"
              className={desktopLinkClass("/")}
            >
              <Home
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>Home</span>
            </Link>

            {/* Properties */}
            <Link
              to="/properties"
              className={desktopLinkClass("/properties")}
            >
              <Building2
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>Properties</span>
            </Link>

            {/* =========================
                Student
            ========================== */}
            {user?.role === "student" && (
              <Link
                to="/bookings"
                className={desktopLinkClass("/bookings")}
              >
                <CalendarDays
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>My Bookings</span>
              </Link>
            )}

            {/* =========================
                Owner
            ========================== */}
            {user?.role === "owner" && (
              <>
                <Link
                  to="/owner/dashboard"
                  className={desktopLinkClass(
                    "/owner/dashboard"
                  )}
                >
                  <LayoutDashboard
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/owner/properties"
                  className={desktopLinkClass(
                    "/owner/properties"
                  )}
                >
                  <Building2
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>My Properties</span>
                </Link>
              </>
            )}

            {/* =========================
                Admin
            ========================== */}
            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={desktopLinkClass(
                    "/admin/dashboard"
                  )}
                >
                  <LayoutDashboard
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/admin/users"
                  className={desktopLinkClass(
                    "/admin/users"
                  )}
                >
                  <Users
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>Users</span>
                </Link>

                <Link
                  to="/admin/properties"
                  className={desktopLinkClass(
                    "/admin/properties"
                  )}
                >
                  <Building2
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>Properties</span>
                </Link>

                <Link
                  to="/admin/bookings"
                  className={desktopLinkClass(
                    "/admin/bookings"
                  )}
                >
                  <CalendarDays
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>Bookings</span>
                </Link>
              </>
            )}
          </div>

          {/* =========================
              Desktop Right Section
          ========================== */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Logged Out */}
            {!isLoggedIn && (
              <Link
                to="/login"
                className="
                  inline-flex min-h-10 items-center
                  justify-center rounded-xl bg-blue-600
                  px-4 py-2.5 text-sm font-semibold
                  text-white shadow-sm transition-all
                  duration-200 hover:bg-blue-700
                  hover:shadow-md focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                  focus:ring-offset-2
                "
              >
                Login
              </Link>
            )}

            {/* Logged In */}
            {isLoggedIn && (
              <>
                {/* Notifications */}
                <div className="mr-1">
                  <NotificationBell />
                </div>

                {/* User */}
                <Link
                  to="/profile"
                  className="
                    group flex items-center gap-2.5
                    rounded-xl border border-transparent
                    px-2 py-1.5 transition
                    hover:border-gray-200
                    hover:bg-gray-50
                  "
                >
                  <div
                    className="
                      flex h-9 w-9 shrink-0 items-center
                      justify-center rounded-xl
                      bg-blue-50 text-blue-600
                      transition group-hover:bg-blue-100
                    "
                  >
                    <User
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="hidden min-w-0 lg:block">
                    <p
                      className="
                        max-w-28 truncate text-sm
                        font-semibold text-gray-900
                      "
                    >
                      {user?.name || "User"}
                    </p>

                    <p
                      className="
                        text-xs capitalize text-gray-500
                      "
                    >
                      {roleLabel[user?.role] || user?.role}
                    </p>
                  </div>
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    inline-flex min-h-10 items-center
                    justify-center gap-2 rounded-xl
                    border border-gray-200 bg-white
                    px-3 py-2 text-sm font-semibold
                    text-gray-600 transition-all
                    duration-200 hover:border-red-200
                    hover:bg-red-50 hover:text-red-600
                    focus:outline-none
                    focus:ring-2 focus:ring-red-500
                    focus:ring-offset-2
                  "
                >
                  <LogOut
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span className="hidden lg:inline">
                    Logout
                  </span>
                </button>
              </>
            )}
          </div>

          {/* =========================
              Mobile Menu Button
          ========================== */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={menuOpen}
            className="
              inline-flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl border border-gray-200
              bg-white text-gray-700 transition-all
              duration-200 hover:bg-gray-50
              hover:text-gray-900
              focus:outline-none focus:ring-2
              focus:ring-blue-500 md:hidden
            "
          >
            {menuOpen ? (
              <X
                size={21}
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={21}
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* =========================
            Mobile Navigation
        ========================== */}
        {menuOpen && (
          <div
            className="
              border-t border-gray-100 py-4
              md:hidden
            "
          >
            <div className="space-y-1">
              {/* Home */}
              <Link
                to="/"
                onClick={closeMenu}
                className={mobileLinkClass("/")}
              >
                <span className="flex items-center gap-3">
                  <Home
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Home
                </span>

                <ChevronRight
                  size={16}
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </Link>

              {/* Properties */}
              <Link
                to="/properties"
                onClick={closeMenu}
                className={mobileLinkClass(
                  "/properties"
                )}
              >
                <span className="flex items-center gap-3">
                  <Building2
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Properties
                </span>

                <ChevronRight
                  size={16}
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </Link>

              {/* =========================
                  Student
              ========================== */}
              {user?.role === "student" && (
                <Link
                  to="/bookings"
                  onClick={closeMenu}
                  className={mobileLinkClass(
                    "/bookings"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <CalendarDays
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    My Bookings
                  </span>

                  <ChevronRight
                    size={16}
                    className="text-gray-400"
                    aria-hidden="true"
                  />
                </Link>
              )}

              {/* =========================
                  Owner
              ========================== */}
              {user?.role === "owner" && (
                <>
                  <Link
                    to="/owner/dashboard"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/owner/dashboard"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Dashboard
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to="/owner/properties"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/owner/properties"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Building2
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      My Properties
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>
                </>
              )}

              {/* =========================
                  Admin
              ========================== */}
              {user?.role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/admin/dashboard"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Dashboard
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to="/admin/users"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/admin/users"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Users
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Users
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to="/admin/properties"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/admin/properties"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Building2
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Properties
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to="/admin/bookings"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/admin/bookings"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <CalendarDays
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Bookings
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>
                </>
              )}

              {/* =========================
                  Logged Out
              ========================== */}
              {!isLoggedIn && (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="
                    mt-3 flex min-h-11
                    items-center justify-center
                    rounded-xl bg-blue-600
                    px-4 py-3 text-sm font-semibold
                    text-white shadow-sm transition
                    hover:bg-blue-700
                    focus:outline-none
                    focus:ring-2 focus:ring-blue-500
                    focus:ring-offset-2
                  "
                >
                  Login
                </Link>
              )}

              {/* =========================
                  Logged In
              ========================== */}
              {isLoggedIn && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {/* User Information */}
                  <div
                    className="
                      mb-3 flex items-center gap-3
                      rounded-2xl border border-gray-100
                      bg-gray-50 px-4 py-3
                    "
                  >
                    <div
                      className="
                        flex h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-xl bg-blue-100
                        text-blue-600
                      "
                    >
                      <User
                        size={19}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate text-sm font-bold
                          text-gray-900
                        "
                      >
                        {user?.name || "User"}
                      </p>

                      <p
                        className="
                          mt-0.5 text-xs capitalize
                          text-gray-500
                        "
                      >
                        {roleLabel[user?.role] ||
                          user?.role}
                      </p>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div
                    className="
                      mb-1 flex items-center
                      justify-between rounded-xl
                      px-4 py-3
                    "
                  >
                    <span
                      className="
                        flex items-center gap-3
                        text-sm font-semibold
                        text-gray-700
                      "
                    >
                      <span
                        className="
                          flex h-8 w-8 items-center
                          justify-center rounded-lg
                          bg-gray-100
                        "
                      >
                        <span className="text-xs">
                          🔔
                        </span>
                      </span>
                      Notifications
                    </span>

                    <NotificationBell />
                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className={mobileLinkClass(
                      "/profile"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <User
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Profile
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      mt-1 flex min-h-11 w-full
                      items-center gap-3 rounded-xl
                      px-4 py-3 text-left text-sm
                      font-semibold text-red-600
                      transition hover:bg-red-50
                      focus:outline-none
                      focus:ring-2 focus:ring-red-500
                      focus:ring-offset-2
                    "
                  >
                    <LogOut
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;