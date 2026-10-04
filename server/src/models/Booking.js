const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Move-in date is always required
    startDate: {
      type: Date,
      required: true,
    },

    // Move-out date is optional.
    // null means the student has not decided yet.
    endDate: {
      type: Date,
      required: false,
      default: null,
    },

    // Selected stay duration
    // "open-ended" means the student will decide later.
    stayDuration: {
      type: String,
      enum: ["1", "3", "6", "12", "open-ended"],
      default: "open-ended",
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rejected", "completed"],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);