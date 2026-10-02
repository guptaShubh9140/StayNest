import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
} from "../lib/api";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getMyProfile(token);

      setProfile(data.user);

      setName(data.user.name || "");
      setPhone(data.user.phone || "");
    } catch (error) {
      console.error(
        "Profile error:",
        error
      );

      setError(
        error.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      const data = await updateMyProfile(
        {
          name: name.trim(),
          phone: phone.trim(),
        },
        token
      );

      setProfile(data.user);

      // Keep localStorage user information updated
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setSuccess(
        "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="text-gray-600 mt-1">
            View and update your StayNest profile.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3 cursor-not-allowed"
              />

              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>

              <input
                type="text"
                value={profile?.role || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3 capitalize cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/bookings")
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;