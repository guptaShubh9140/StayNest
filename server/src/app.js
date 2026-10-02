const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const propertyRoutes = require("./routes/property.routes");
const adminRoutes = require("./routes/admin.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

app.use(cors());


app.use(
  "/api/v1/webhooks",
  webhookRoutes
);

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StayNest API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/properties", propertyRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/bookings", bookingRoutes);

app.use("/api/v1/payments", paymentRoutes);

module.exports = app;