const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  getCurrentUser,
  getStudentDashboard,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", protect, getCurrentUser);

router.get(
  "/student-dashboard",
  protect,
  authorize("student"),
  getStudentDashboard
);

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.put(
  "/profile",
  protect,
  updateMyProfile
);

module.exports = router;