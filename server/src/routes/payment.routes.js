const express = require("express");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/payment.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/create-order/:bookingId",
  protect,
  createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  verifyRazorpayPayment
);

module.exports = router;