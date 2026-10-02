import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch (error) {
    user = null;
  }

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoDashboard = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (user?.role === "owner") {
      navigate("/owner/dashboard");
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 max-w-lg w-full text-center">

        <div className="text-6xl font-bold text-red-600">
          403
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Access Denied
        </h1>

        <p className="text-gray-600 mt-3">
          You don't have permission to access this page.
        </p>

        {user?.role && (
          <p className="text-sm text-gray-500 mt-2">
            Your current role:{" "}
            <span className="font-semibold capitalize">
              {user.role}
            </span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">

          <button
            onClick={handleGoDashboard}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleGoHome}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Go Home
          </button>

        </div>
      </div>
    </div>
  );
};

export default Unauthorized;