import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tight text-blue-600 transition hover:text-blue-700"
            >
              StayNest
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Find verified PGs, hostels and co-living spaces near your
              college or workplace. Discover a comfortable place to stay
              with confidence.
            </p>

            <div className="mt-6">
              <Link
                to="/properties"
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                Find a Stay
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">Explore</h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/properties"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Properties
              </Link>

              <Link
                to="/login"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Students */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              For Students
            </h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/properties"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Find a Stay
              </Link>

              <Link
                to="/bookings"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                My Bookings
              </Link>

              <Link
                to="/profile"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Owners */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              For Owners
            </h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/owner/dashboard"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Owner Dashboard
              </Link>

              <Link
                to="/owner/properties"
                className="block text-sm text-gray-500 transition hover:translate-x-0.5 hover:text-blue-600"
              >
                Manage Properties
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} StayNest. All rights reserved.</p>

          <p className="text-left sm:text-right">
            Built for a simpler way to find your next stay.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;