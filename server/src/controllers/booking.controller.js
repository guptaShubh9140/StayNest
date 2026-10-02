const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Property = require("../models/Property");

const createBooking = async (req, res) => {
  try {
    const { propertyId, roomId, startDate, endDate } = req.body;

    // 1. Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get student ID from authenticated user
    const studentId = req.user._id || req.user.id || req.user.userId;

    if (!studentId) {
      console.error("Authenticated user does not contain an ID:", req.user);

      return res.status(401).json({
        success: false,
        message: "Invalid authentication user",
      });
    }

    // 2. Only students can create bookings
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can create bookings",
      });
    }

    // 3. Validate required fields
    if (!propertyId || !roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "propertyId, roomId, startDate and endDate are required",
      });
    }

    // 4. Validate MongoDB IDs
    if (
      !mongoose.Types.ObjectId.isValid(propertyId) ||
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid propertyId, roomId or studentId",
      });
    }

    // 5. Validate dates
    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);

    if (
      Number.isNaN(bookingStart.getTime()) ||
      Number.isNaN(bookingEnd.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate",
      });
    }

    if (bookingEnd <= bookingStart) {
      return res.status(400).json({
        success: false,
        message: "endDate must be after startDate",
      });
    }

    // 6. Find approved and active property
    const property = await Property.findOne({
      _id: propertyId,
      isApproved: true,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or not available",
      });
    }

    // 7. Find selected room
    const room = property.rooms.id(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found in this property",
      });
    }

    // 8. Check room availability
    if (room.availableRooms === undefined || room.availableRooms <= 0) {
      return res.status(400).json({
        success: false,
        message: "No rooms are currently available",
      });
    }

    // 9. Check existing active booking
    const existingBooking = await Booking.findOne({
      student: studentId,
      property: propertyId,
      room: roomId,
      status: {
        $in: ["pending", "confirmed"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this room",
      });
    }

    // 10. Create booking
    const booking = await Booking.create({
      student: studentId,
      property: property._id,
      room: room._id,

      startDate: bookingStart,
      endDate: bookingEnd,

      // Price snapshot
      monthlyRent: room.monthlyRent,
      securityDeposit: room.securityDeposit,

      status: "pending",
      paymentStatus: "pending",
    });

    // 11. Return successful response
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    console.log("OWNER USER:", req.user);

    // Get owner ID from authenticated user
    const ownerId = req.user._id || req.user.id || req.user.userId;

    console.log("OWNER ID:", ownerId);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Owner ID not found in authentication",
      });
    }

    // Find properties owned by this owner
    const properties = await Property.find({
      owner: ownerId,
    }).select("_id name");

    console.log("OWNER PROPERTIES:", properties);

    if (!properties.length) {
      return res.status(200).json({
        success: true,
        message: "No properties found for this owner",
        bookings: [],
      });
    }

    // Get property IDs
    const propertyIds = properties.map((property) => property._id);

    // Find bookings for owner's properties
    const bookings = await Booking.find({
      property: { $in: propertyIds },
    })
      .populate("student", "name email")
      .populate("property", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get owner bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner bookings",
    });
  }
};

const getAdminBookings = async (req, res) => {
  try {
    // Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Only admins can access all bookings
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all bookings",
      });
    }

    // Get all bookings
    const bookings = await Booking.find({})
      .populate("student", "name email")
      .populate("property", "name propertyType owner")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all bookings",
    });
  }
};

const confirmBooking = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Only owner or admin can confirm
    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only owners or admins can confirm bookings",
      });
    }

    // 3. Validate booking ID
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // 4. Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 5. Booking must be pending
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be confirmed because its current status is "${booking.status}"`,
      });
    }

    // 6. If user is owner, verify property ownership
    if (req.user.role === "owner") {
      const property = await Property.findOne({
        _id: booking.property,
        owner:
          req.user._id ||
          req.user.id ||
          req.user.userId,
      });

      if (!property) {
        return res.status(403).json({
          success: false,
          message: "You are not the owner of this property",
        });
      }
    }

    // 7. Confirm booking
    booking.status = "confirmed";

    await booking.save();

    // 8. Return response
    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("Confirm booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm booking",
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Only owner or admin can reject
    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only owners or admins can reject bookings",
      });
    }

    // 3. Validate booking ID
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // 4. Get rejection reason
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // 5. Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 6. Only pending bookings can be rejected
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be rejected because its current status is "${booking.status}"`,
      });
    }

    // 7. Verify property ownership for owner
    if (req.user.role === "owner") {
      const ownerId =
        req.user._id ||
        req.user.id ||
        req.user.userId;

      const property = await Property.findOne({
        _id: booking.property,
        owner: ownerId,
      });

      if (!property) {
        return res.status(403).json({
          success: false,
          message: "You are not the owner of this property",
        });
      }
    }

    // 8. Reject booking
    booking.status = "rejected";
    booking.rejectionReason = reason.trim();

    await booking.save();

    // 9. Return response
    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      reason: reason.trim(),
      booking,
    });
  } catch (error) {
    console.error("Reject booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject booking",
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    // 1. Authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Only owner or admin
    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only owners or admins can complete bookings",
      });
    }

    // 3. Validate booking ID
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // 4. Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 5. Only confirmed bookings can be completed
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be completed because its current status is "${booking.status}"`,
      });
    }

    // 6. Verify owner owns the property
    if (req.user.role === "owner") {
      const ownerId =
        req.user._id ||
        req.user.id ||
        req.user.userId;

      const property = await Property.findOne({
        _id: booking.property,
        owner: ownerId,
      });

      if (!property) {
        return res.status(403).json({
          success: false,
          message: "You are not the owner of this property",
        });
      }
    }

    // 7. Complete booking
    booking.status = "completed";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully",
      booking,
    });
  } catch (error) {
    console.error("Complete booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete booking",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view their bookings",
      });
    }

    const studentId = req.user._id || req.user.id || req.user.userId;

    const bookings = await Booking.find({
      student: studentId,
    })
      .populate("property", "name propertyType address images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view bookings",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const studentId = req.user._id || req.user.id || req.user.userId;

    const booking = await Booking.findOne({
      _id: id,
      student: studentId,
    })
      .populate("property", "name propertyType address images amenities")
      .populate("student", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can cancel bookings",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const studentId = req.user._id || req.user.id || req.user.userId;

    const booking = await Booking.findOne({
      _id: id,
      student: studentId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Don't allow cancellation of completed bookings
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    // Only pending or confirmed bookings can be cancelled
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
      });
    }

    // Change booking status
    booking.status = "cancelled";

    await booking.save();

    // Return room availability
    const property = await Property.findById(booking.property);

    if (property) {
      const room = property.rooms.id(booking.room);

      if (room) {
        room.availableRooms += 1;

        // Prevent availability from exceeding total rooms
        if (room.availableRooms > room.totalRooms) {
          room.availableRooms = room.totalRooms;
        }

        await property.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

module.exports = {
  createBooking,
  getOwnerBookings,
  getAdminBookings,
  confirmBooking,
  rejectBooking,
  completeBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};