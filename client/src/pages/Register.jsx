import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { useToast } from "../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const Register = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      newErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone number must contain 10 digits.";
    }

    if (!password) {
      newErrors.password = "Please create a password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      success(
        "Registration successful",
        "Your StayNest account has been created.",
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      console.error("Registration error:", err);

      showError(
        "Registration failed",
        err.message || "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-gray-50">
      <div className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
        {/* ========================================
            LEFT BRAND PANEL
        ======================================== */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-11">
          {/* Decorative shapes */}
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

          <div className="relative z-10">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Home size={22} strokeWidth={2} />
              </span>

              <span className="text-2xl font-bold tracking-tight">
                StayNest
              </span>
            </Link>

            {/* Main message */}
            <div className="mt-14 max-w-md xl:mt-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100 sm:text-sm">
                Your next stay starts here
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[1.12] tracking-tight xl:text-[2.8rem]">
                Find a place you&apos;ll love to stay.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-blue-100 xl:text-base">
                Discover PGs, hostels and co-living spaces that fit your
                location, budget and lifestyle.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-9 space-y-4">
              <Benefit text="Discover properties that match your needs" />
              <Benefit text="Compare rooms, pricing and amenities" />
              <Benefit text="Book securely through StayNest" />
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-10 text-xs text-blue-100">
            © {new Date().getFullYear()} StayNest. Find your place.
          </div>
        </section>

        {/* ========================================
            RIGHT REGISTRATION AREA
        ======================================== */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-14">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="mb-7 flex items-center justify-center lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Home size={20} strokeWidth={2} />
                </span>

                <span className="text-2xl font-bold tracking-tight">
                  Stay<span className="text-blue-600">Nest</span>
                </span>
              </Link>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-9">
              {/* Heading */}
              <div className="mb-7">
                <p className="text-sm font-semibold text-blue-600">
                  Create your account
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Join StayNest
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Create your student account and start discovering your next
                  stay.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
                {/* Name */}
                <FormField
                  label="Full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={User}
                  error={errors.name}
                  required
                />

                {/* Email */}
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email}
                  required
                />

                {/* Phone */}
                <FormField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  icon={Phone}
                  error={errors.phone}
                  maxLength={10}
                />

                {/* Password */}
                <PasswordField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  visible={showPassword}
                  setVisible={setShowPassword}
                  error={errors.password}
                  required
                />

                {/* Confirm Password */}
                <PasswordField
                  label="Confirm password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  visible={showConfirmPassword}
                  setVisible={setShowConfirmPassword}
                  error={errors.confirmPassword}
                  required
                />

                {/* Account information */}
                <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Student account
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-gray-600">
                      New registrations are created as student accounts.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight size={17} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-6 border-t border-gray-100 pt-5 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <LockKeyhole size={13} aria-hidden="true" />
              <span>Your account credentials are securely protected.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

/* ========================================
   Form Field
======================================== */

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required = false,
  maxLength,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-gray-800"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <Icon
          size={18}
          strokeWidth={1.9}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={name === "email" ? "email" : name}
          className={[
            "min-h-11 w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "transition focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-blue-500",
          ].join(" ")}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

/* ========================================
   Password Field
======================================== */

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  setVisible,
  error,
  required = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-gray-800"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          strokeWidth={1.9}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />

        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className={[
            "min-h-11 w-full rounded-xl border bg-white py-2.5 pl-11 pr-12 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "transition focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-blue-500",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

/* ========================================
   Benefit
======================================== */

const Benefit = ({ text }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <CheckCircle2 size={16} strokeWidth={2} />
      </span>

      <span className="text-sm text-blue-50">{text}</span>
    </div>
  );
};

export default Register;
