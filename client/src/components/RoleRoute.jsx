import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // User is not logged in
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // User role is not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;