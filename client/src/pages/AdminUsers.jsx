import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
  UserRound,
} from "lucide-react";

import { getAllUsers, updateUserRole } from "../lib/api";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

const LoadingBlock = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
};

const formatRole = (role) => {
  if (!role) return "Unknown";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // Role change modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const {
    success: showSuccess,
    error: showError,
  } = useToast();

  // --------------------------------------------------
  // Fetch users
  // --------------------------------------------------

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getAllUsers(token);

      setUsers(data.users || []);
    } catch (error) {
      console.error("Admin users error:", error);

      const errorMessage =
        error.message || "Failed to load users.";

      setError(errorMessage);

      showError("Unable to load users", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --------------------------------------------------
  // User statistics
  // --------------------------------------------------

  const stats = useMemo(() => {
    const students = users.filter(
      (user) => user.role === "student"
    ).length;

    const owners = users.filter(
      (user) => user.role === "owner"
    ).length;

    const admins = users.filter(
      (user) => user.role === "admin"
    ).length;

    return {
      total: users.length,
      students,
      owners,
      admins,
    };
  }, [users]);

  // --------------------------------------------------
  // Change role
  // --------------------------------------------------

  const handleRoleChange = (userId, selectedRole) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const user = users.find(
      (item) => item._id === userId
    );

    if (!user) {
      return;
    }

    // No need to open modal if role is unchanged
    if (user.role === selectedRole) {
      return;
    }

    setUserToUpdate(user);
    setNewRole(selectedRole);
    setRoleModalOpen(true);
  };

  // --------------------------------------------------
  // Close modal
  // --------------------------------------------------

  const closeRoleModal = () => {
    if (roleLoading) return;

    setRoleModalOpen(false);
    setUserToUpdate(null);
    setNewRole("");
  };

  // --------------------------------------------------
  // Confirm role change
  // --------------------------------------------------

  const confirmRoleChange = async () => {
    if (!userToUpdate || !newRole) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      closeRoleModal();
      navigate("/login");
      return;
    }

    try {
      setRoleLoading(true);
      setActionLoading(userToUpdate._id);

      const data = await updateUserRole(
        userToUpdate._id,
        newRole,
        token
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userToUpdate._id
            ? {
                ...user,
                role: data.user.role,
              }
            : user
        )
      );

      setRoleModalOpen(false);
      setUserToUpdate(null);
      setNewRole("");

      showSuccess(
        "User role updated",
        `The user's role has been changed to ${newRole}.`
      );
    } catch (error) {
      console.error("Update role error:", error);

      showError(
        "Unable to update user role",
        error.message || "Failed to update user role."
      );
    } finally {
      setRoleLoading(false);
      setActionLoading(null);
    }
  };

  // --------------------------------------------------
  // Role styling
  // --------------------------------------------------

  const getRoleStyles = (role) => {
    switch (role) {
      case "admin":
        return {
          wrapper:
            "border-purple-200 bg-purple-50 text-purple-700",
          icon: "bg-purple-100 text-purple-600",
        };

      case "owner":
        return {
          wrapper:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: "bg-blue-100 text-blue-600",
        };

      default:
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: "bg-emerald-100 text-emerald-600",
        };
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <LoadingBlock className="h-48 rounded-3xl" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingBlock
                key={index}
                className="h-28 rounded-2xl"
              />
            ))}
          </div>

          <Card padding="none" className="mt-8 overflow-hidden">
            <div className="hidden border-b bg-gray-50 p-5 md:grid md:grid-cols-5 md:gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingBlock
                  key={index}
                  className="h-4"
                />
              ))}
            </div>

            <div className="space-y-5 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid gap-4 md:grid-cols-5"
                >
                  {Array.from({ length: 5 }).map(
                    (_, item) => (
                      <LoadingBlock
                        key={item}
                        className="h-10"
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            title="Unable to load users"
            description={error}
            onRetry={fetchUsers}
            retryLabel="Reload Users"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-8 lg:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <ShieldCheck size={14} />
                  User management
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Manage Users
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  View StayNest users and manage their platform
                  roles from one centralized admin workspace.
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                icon={ArrowLeft}
                onClick={() =>
                  navigate("/admin/dashboard")
                }
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </section>

          {/* Statistics */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    All registered accounts
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users size={21} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Students
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.students}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    Student accounts
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserRound size={21} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Owners
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.owners}
                  </p>

                  <p className="mt-1 text-xs text-blue-600">
                    Property owners
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2Icon />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Administrators
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.admins}
                  </p>

                  <p className="mt-1 text-xs text-purple-600">
                    Protected accounts
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <ShieldCheck size={21} />
                </div>
              </div>
            </Card>
          </section>

          {/* Users */}
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Platform Users
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review user accounts and update eligible roles.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={fetchUsers}
              >
                Refresh
              </Button>
            </div>

            {users.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No users found"
                description="There are currently no users in the StayNest system."
              />
            ) : (
              <Card padding="none" className="overflow-hidden">
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px]">
                    <thead className="border-b border-gray-200 bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                          User
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                          Contact
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                          Role
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                          Access
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => {
                        const isAdmin =
                          user.role === "admin";

                        const isLoading =
                          actionLoading === user._id;

                        const roleStyles =
                          getRoleStyles(user.role);

                        return (
                          <tr
                            key={user._id}
                            className="transition hover:bg-slate-50/70"
                          >
                            {/* User */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                                  {user.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "U"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-gray-900">
                                    {user.name ||
                                      "Unnamed User"}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-500">
                                    ID:{" "}
                                    {user._id?.slice(
                                      -8
                                    ) || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="px-6 py-5">
                              <div className="space-y-1.5">
                                <div className="flex max-w-[240px] items-center gap-2 text-sm text-gray-600">
                                  <Mail
                                    size={14}
                                    className="shrink-0 text-gray-400"
                                  />

                                  <span className="truncate">
                                    {user.email || "—"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Phone
                                    size={14}
                                    className="shrink-0 text-gray-400"
                                  />

                                  <span>
                                    {user.phone || "No phone"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${roleStyles.wrapper}`}
                              >
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full ${roleStyles.icon}`}
                                >
                                  <UserCog size={12} />
                                </span>

                                {formatRole(user.role)}
                              </span>
                            </td>

                            {/* Access */}
                            <td className="px-6 py-5">
                              {isAdmin ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600">
                                  <ShieldCheck size={14} />
                                  Protected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                  <CheckCircle2 size={14} />
                                  Role editable
                                </span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="px-6 py-5 text-right">
                              {isAdmin ? (
                                <span className="text-sm font-medium text-gray-400">
                                  Protected
                                </span>
                              ) : (
                                <div className="relative inline-flex">
                                  <select
                                    value={user.role}
                                    disabled={isLoading}
                                    onChange={(event) =>
                                      handleRoleChange(
                                        user._id,
                                        event.target.value
                                      )
                                    }
                                    className="min-h-10 appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-gray-700 outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                  >
                                    <option value="student">
                                      Student
                                    </option>

                                    <option value="owner">
                                      Owner
                                    </option>
                                  </select>

                                  <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-gray-100 md:hidden">
                  {users.map((user) => {
                    const isAdmin =
                      user.role === "admin";

                    const isLoading =
                      actionLoading === user._id;

                    const roleStyles =
                      getRoleStyles(user.role);

                    return (
                      <div
                        key={user._id}
                        className="p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2">
                              <div>
                                <h3 className="truncate font-bold text-gray-900">
                                  {user.name ||
                                    "Unnamed User"}
                                </h3>

                                <p className="mt-0.5 text-xs text-gray-500">
                                  ID:{" "}
                                  {user._id?.slice(
                                    -8
                                  ) || "—"}
                                </p>
                              </div>

                              <span
                                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${roleStyles.wrapper}`}
                              >
                                <UserCog size={12} />
                                {formatRole(user.role)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3 rounded-xl bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail
                              size={15}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="truncate">
                              {user.email || "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone
                              size={15}
                              className="shrink-0 text-gray-400"
                            />

                            <span>
                              {user.phone || "No phone number"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          {isAdmin ? (
                            <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
                              <ShieldCheck size={17} />
                              Administrator account is protected
                            </div>
                          ) : (
                            <div>
                              <label
                                htmlFor={`role-${user._id}`}
                                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                              >
                                Change Role
                              </label>

                              <div className="relative">
                                <select
                                  id={`role-${user._id}`}
                                  value={user.role}
                                  disabled={isLoading}
                                  onChange={(event) =>
                                    handleRoleChange(
                                      user._id,
                                      event.target.value
                                    )
                                  }
                                  className="min-h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                  <option value="student">
                                    Student
                                  </option>

                                  <option value="owner">
                                    Owner
                                  </option>
                                </select>

                                <ChevronDown
                                  size={17}
                                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </section>
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        open={roleModalOpen}
        onClose={closeRoleModal}
        onConfirm={confirmRoleChange}
        title="Change User Role"
        description={
          userToUpdate
            ? `Are you sure you want to change ${userToUpdate.name}'s role to ${formatRole(
                newRole
              )}?`
            : "Are you sure you want to change this user's role?"
        }
        confirmText="Change Role"
        cancelText="Cancel"
        showCancel
        showConfirm
        variant="default"
        loading={roleLoading}
      />
    </>
  );
};

const Building2Icon = () => {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
};

export default AdminUsers;