const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  confirmBooking,
  rejectBooking,
  completeBooking,
  getAdminBookings,
} = require("../controllers/booking.controller");

// Student routes
router.post("/", protect, authorize("student"), createBooking);

router.get("/my-bookings", protect, authorize("student"), getMyBookings);

// Owner routes
router.get("/owner", protect, authorize("owner"), getOwnerBookings);

// Admin routes
router.get("/admin", protect, authorize("admin"), getAdminBookings);

// Booking actions
router.patch("/:id/cancel", protect, authorize("student"), cancelBooking);

router.patch(
  "/:id/confirm",
  protect,
  authorize("owner", "admin"),
  confirmBooking,
);

router.patch(
  "/:id/reject",
  protect,
  authorize("owner", "admin"),
  rejectBooking,
);

router.patch(
  "/:id/complete",
  protect,
  authorize("owner", "admin"),
  completeBooking,
);

// IMPORTANT: Keep dynamic :id route AFTER named routes
router.get("/:id", protect, getBookingById);

module.exports = router;
