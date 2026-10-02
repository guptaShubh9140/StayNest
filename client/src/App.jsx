import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Bookings from "./pages/Bookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";

import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProperties from "./pages/OwnerProperties";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import ManageRooms from "./pages/ManageRooms";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";

import RoleRoute from "./components/RoleRoute";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          <Route path="/bookings" element={<Bookings />} />

          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Owner Routes */}
        <Route element={<RoleRoute allowedRoles={["owner"]} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />

          <Route path="/owner/properties" element={<OwnerProperties />} />

          <Route path="/owner/properties/new" element={<AddProperty />} />

          <Route path="/owner/properties/edit/:id" element={<EditProperty />} />

          <Route path="/owner/properties/:id/rooms" element={<ManageRooms />} />
        </Route>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/properties" element={<AdminProperties />} />

          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
