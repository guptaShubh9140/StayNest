const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");

// ----------------------------------------
// Get Admin Dashboard Statistics
// ----------------------------------------

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalOwners,
      totalAdmins,

      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,

      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
    ] = await Promise.all([
      // Users
      User.countDocuments(),

      User.countDocuments({
        role: "student",
      }),

      User.countDocuments({
        role: "owner",
      }),

      User.countDocuments({
        role: "admin",
      }),

      // Properties
      Property.countDocuments(),

      Property.countDocuments({
        approvalStatus: "pending",
      }),

      Property.countDocuments({
        approvalStatus: "approved",
      }),

      Property.countDocuments({
        approvalStatus: "rejected",
      }),

      // Bookings
      Booking.countDocuments(),

      Booking.countDocuments({
        status: "pending",
      }),

      Booking.countDocuments({
        status: "confirmed",
      }),

      Booking.countDocuments({
        status: "completed",
      }),
    ]);

    res.status(200).json({
      success: true,

      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          owners: totalOwners,
          admins: totalAdmins,
        },

        properties: {
          total: totalProperties,
          pending: pendingProperties,
          approved: approvedProperties,
          rejected: rejectedProperties,
        },

        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get admin stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching admin statistics",
    });
  }
};

// ----------------------------------------
// Get Pending Properties
// ----------------------------------------

const getPendingProperties = async (
  req,
  res
) => {
  try {
    const properties =
      await Property.find({
        approvalStatus: "pending",
      })
        .populate(
          "owner",
          "name email phone"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(
      "Get pending properties error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching pending properties",
    });
  }
};

// ----------------------------------------
// Approve Property
// ----------------------------------------

const approveProperty = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const property =
      await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.approvalStatus =
      "approved";

    property.isApproved = true;

    property.rejectionReason = "";

    await property.save();

    res.status(200).json({
      success: true,
      message:
        "Property approved successfully",
      property,
    });
  } catch (error) {
    console.error(
      "Approve property error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while approving property",
    });
  }
};

// ----------------------------------------
// Reject Property
// ----------------------------------------

const rejectProperty = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { reason } = req.body;

    const property =
      await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.approvalStatus =
      "rejected";

    property.isApproved = false;

    property.rejectionReason =
      reason ||
      "Property does not meet StayNest requirements";

    await property.save();

    res.status(200).json({
      success: true,
      message:
        "Property rejected successfully",
      property,
    });
  } catch (error) {
    console.error(
      "Reject property error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while rejecting property",
    });
  }
};

// ----------------------------------------
// Get All Users
// ----------------------------------------

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching users",
    });
  }
};

// ----------------------------------------
// Update User Role
// ----------------------------------------

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "student",
      "owner",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing admin roles
    // through this basic user-management UI.
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin role cannot be changed from user management",
      });
    }

    // Prevent an admin from accidentally
    // assigning the admin role.
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin role cannot be assigned from user management",
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update user role error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating user role",
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getPendingProperties,
  approveProperty,
  rejectProperty,
};