const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["pg", "hostel", "coliving"],
      default: "pg",
    },

    address: {
      street: {
        type: String,
        required: true,
      },

      area: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    location: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },

    amenities: {
      type: [String],
      default: [],
    },

    rooms: {
      type: [
        {
          roomType: {
            type: String,
            enum: ["single", "double", "triple"],
            required: true,
          },

          totalRooms: {
            type: Number,
            required: true,
            min: 1,
          },

          availableRooms: {
            type: Number,
            required: true,
            min: 0,
          },

          monthlyRent: {
            type: Number,
            required: true,
            min: 0,
          },

          securityDeposit: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    rules: {
      type: [String],
      default: [],
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
