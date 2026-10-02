const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getPendingProperties,
  approveProperty,
  rejectProperty,
} = require("../controllers/admin.controller");

const router = express.Router();

// --------------------------------
// Dashboard statistics
// --------------------------------

router.get(
  "/stats",
  protect,
  authorize("admin"),
  getAdminStats
);

// --------------------------------
// Users
// --------------------------------

router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

router.patch(
  "/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole
);

// --------------------------------
// Properties
// --------------------------------

router.get(
  "/properties/pending",
  protect,
  authorize("admin"),
  getPendingProperties
);

router.patch(
  "/properties/:id/approve",
  protect,
  authorize("admin"),
  approveProperty
);

router.patch(
  "/properties/:id/reject",
  protect,
  authorize("admin"),
  rejectProperty
);

module.exports = router;