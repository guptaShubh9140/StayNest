const User = require("../models/User");

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
};

const getStudentDashboard = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the student dashboard",
    user: req.user,
  });
};

const getMyProfile = async (req, res) => {
  try {
    const userId =
      req.user._id ||
      req.user.id ||
      req.user.userId;

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};


const updateMyProfile = async (req, res) => {
  try {
    const userId =
      req.user._id ||
      req.user.id ||
      req.user.userId;

    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};


module.exports = {
  getCurrentUser,
  getStudentDashboard,
  getMyProfile,
  updateMyProfile,
};
