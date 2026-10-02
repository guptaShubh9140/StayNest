const crypto = require("crypto");

const Booking = require("../models/Booking");

const handleRazorpayWebhook = async (req, res) => {
  try {
    console.log("========== RAZORPAY WEBHOOK RECEIVED ==========");
    console.log("Webhook request received");
    
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Webhook secret not configured",
      });
    }

    // IMPORTANT:
    // req.body must be the raw request body Buffer.
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (generatedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    console.log("Razorpay webhook received:", event.event);

    // Handle successful captured payment
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Payment data missing",
        });
      }

      const razorpayPaymentId = payment.id;

      const razorpayOrderId = payment.order_id;

      if (!razorpayPaymentId || !razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: "Payment identifiers missing",
        });
      }

      const booking = await Booking.findOne({
        razorpayOrderId,
      });

      if (!booking) {
        console.warn("Booking not found for Razorpay order:", razorpayOrderId);

        // Return 200 so Razorpay doesn't keep retrying
        // an event for a booking that does not exist.
        return res.status(200).json({
          success: true,
          message: "Webhook received",
        });
      }

      if (booking.paymentStatus !== "paid") {
        booking.paymentStatus = "paid";

        booking.razorpayPaymentId = razorpayPaymentId;

        await booking.save();

        console.log("Booking payment updated:", booking._id.toString());
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  handleRazorpayWebhook,
};
