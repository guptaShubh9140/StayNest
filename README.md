# StayNest 🏠

> A full-stack PG, hostel and co-living booking platform built with React, Node.js, Express.js and MongoDB.

StayNest is a full-stack property discovery and booking platform designed for students looking for PGs, hostels and co-living spaces.

The platform provides separate experiences for **Students, Property Owners and Administrators**, including property discovery, room management, booking workflows, notifications, property approval and Razorpay test-mode payments.

---

## ✨ Features

### 👨‍🎓 Student

- User registration and login
- JWT-based authentication
- Browse approved properties
- Search and filter properties
- View detailed property information
- View rooms, rent, security deposit and availability
- Create property bookings
- View booking history
- Cancel bookings
- Track booking status
- Razorpay payment integration
- Track payment status
- Profile management
- Booking and payment notifications

### 🏠 Property Owner

- Owner authentication
- Owner dashboard
- Create properties
- Edit properties
- Delete properties
- Manage rooms and pricing
- Manage room availability
- View booking requests
- Confirm bookings
- Reject bookings with a reason
- Complete bookings
- View property approval status
- Receive booking notifications

### 🛡️ Administrator

- Admin dashboard
- Platform statistics
- User management
- Role management
- Property approval management
- Approve properties
- Reject properties with a reason
- Booking management
- View users, properties and bookings
- Protected admin routes

---

## 💳 Payment

StayNest integrates **Razorpay Test Mode** for the booking payment workflow.

Payment flow:

```text
Confirmed Booking
       ↓
     Pay Now
       ↓
Create Razorpay Order
       ↓
Razorpay Checkout
       ↓
Test Payment
       ↓
Payment Verification
       ↓
Payment Status Updated