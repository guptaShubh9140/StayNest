const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const crypto = require("crypto");

const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    // --------------------------------
    // 1. Check authentication
    // --------------------------------
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Only students can make payments
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can create payment orders",
      });
    }

    // --------------------------------
    // 2. Get booking ID
    // --------------------------------
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // --------------------------------
    // 3. Get student ID
    // --------------------------------
    const studentId = req.user._id || req.user.id || req.user.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student ID not found",
      });
    }

    // --------------------------------
    // 4. Find booking
    // --------------------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      student: studentId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // --------------------------------
    // 5. Booking must be confirmed
    // --------------------------------
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Payment can only be made for confirmed bookings. Current status: "${booking.status}"`,
      });
    }

    // --------------------------------
    // 6. Prevent duplicate payment
    // --------------------------------
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    // --------------------------------
    // 7. Prevent duplicate Razorpay order
    // --------------------------------
    if (booking.razorpayOrderId) {
      const amountInPaise = Math.round(
        (booking.monthlyRent + booking.securityDeposit) * 100,
      );

      return res.status(200).json({
        success: true,
        message: "Razorpay order already exists",
        order: {
          id: booking.razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
          receipt: `staynest_${booking._id}`,
        },
        bookingId: booking._id,
      });
    }

    // --------------------------------
    // 8. Calculate payment amount
    // --------------------------------
    const totalAmount = booking.monthlyRent + booking.securityDeposit;

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking payment amount",
      });
    }

    // Convert INR to paise
    const amountInPaise = Math.round(totalAmount * 100);

    // --------------------------------
    // 9. Create Razorpay order
    // --------------------------------
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `staynest_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        studentId: studentId.toString(),
        propertyId: booking.property.toString(),
      },
    });

    // --------------------------------
    // 10. Save Razorpay order ID
    // --------------------------------
    booking.razorpayOrderId = razorpayOrder.id;

    await booking.save();

    // --------------------------------
    // 11. Send response
    // --------------------------------
    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    // --------------------------------
    // 1. Check authentication
    // --------------------------------
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Only students can verify their payments
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can verify payments",
      });
    }

    // --------------------------------
    // 2. Get payment details
    // --------------------------------
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // --------------------------------
    // 3. Validate booking ID
    // --------------------------------
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // --------------------------------
    // 4. Get student ID
    // --------------------------------
    const studentId =
      req.user._id ||
      req.user.id ||
      req.user.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student ID not found",
      });
    }

    // --------------------------------
    // 5. Find student's booking
    // --------------------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      student: studentId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // --------------------------------
    // 6. Check Razorpay order ID
    // --------------------------------
    if (!booking.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "No Razorpay order found for this booking",
      });
    }

    if (
      booking.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match",
      });
    }

    // --------------------------------
    // 7. Prevent duplicate verification
    // --------------------------------
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment is already verified",
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
      });
    }

    // --------------------------------
    // 8. Generate expected signature
    // --------------------------------
    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          booking.razorpayOrderId +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");

    // --------------------------------
    // 9. Compare signatures
    // --------------------------------
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // --------------------------------
    // 10. Save payment information
    // --------------------------------
    booking.razorpayPaymentId =
      razorpay_payment_id;

    booking.razorpaySignature =
      razorpay_signature;

    booking.paymentStatus = "paid";

    await booking.save();

    // --------------------------------
    // 11. Send response
    // --------------------------------
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.razorpayPaymentId,
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
