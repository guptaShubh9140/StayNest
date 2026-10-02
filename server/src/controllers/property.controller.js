const Property = require("../models/Property");

// ==========================================
// CREATE PROPERTY
// ==========================================

const createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      propertyType,
      address,
      location,
      gender,
      amenities,
      rooms,
      images,
      rules,
    } = req.body;

    // Get logged-in user ID
    const ownerId = req.user._id || req.user.id || req.user.userId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Validate required fields
    if (
      !name ||
      !description ||
      !address ||
      !address.street ||
      !address.area ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Required property details are missing",
      });
    }

    // Validate rooms
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one room type is required",
      });
    }

    const property = await Property.create({
      owner: ownerId,

      name: name.trim(),

      description: description.trim(),

      propertyType,

      address,

      location,

      gender,

      amenities: amenities || [],

      rooms,

      images: images || [],

      rules: rules || [],

      // New properties require admin approval
      approvalStatus: "pending",

      isApproved: false,

      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating property",
    });
  }
};

// ==========================================
// GET APPROVED PROPERTIES
// ==========================================

const getProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      gender,
      propertyType,
      minRent,
      maxRent,
      amenities,
      roomType,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    // Validate rent filters
    if (minRent && Number.isNaN(Number(minRent))) {
      return res.status(400).json({
        success: false,
        message: "minRent must be a valid number",
      });
    }

    if (maxRent && Number.isNaN(Number(maxRent))) {
      return res.status(400).json({
        success: false,
        message: "maxRent must be a valid number",
      });
    }

    if (minRent && maxRent && Number(minRent) > Number(maxRent)) {
      return res.status(400).json({
        success: false,
        message: "minRent cannot be greater than maxRent",
      });
    }

    // Only approved and active properties
    const query = {
      approvalStatus: "approved",
      isApproved: true,
      isActive: true,
    };

    // City filter
    if (city) {
      query["address.city"] = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    // Area filter
    if (area) {
      query["address.area"] = {
        $regex: area.trim(),
        $options: "i",
      };
    }

    // Gender filter
    if (gender) {
      query.gender = gender.toLowerCase();
    }

    // Property type filter
    if (propertyType) {
      query.propertyType = propertyType.toLowerCase();
    }

    // Amenity filter
    if (amenities) {
      const amenityList = amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      query.amenities = {
        $all: amenityList,
      };
    }

    // Room type filter
    if (roomType) {
      query.rooms = {
        $elemMatch: {
          roomType: roomType.toLowerCase(),
        },
      };
    }

    // Rent filter
    if (minRent || maxRent) {
      const rentFilter = {};

      if (minRent) {
        rentFilter.$gte = Number(minRent);
      }

      if (maxRent) {
        rentFilter.$lte = Number(maxRent);
      }

      query.rooms = {
        ...(query.rooms || {}),

        $elemMatch: {
          ...(query.rooms?.$elemMatch || {}),
          monthlyRent: rentFilter,
        },
      };
    }

    // Pagination
    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    let sortOption = {};

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    } else if (sort === "rentLow") {
      sortOption = {
        "rooms.monthlyRent": 1,
      };
    } else if (sort === "rentHigh") {
      sortOption = {
        "rooms.monthlyRent": -1,
      };
    } else {
      sortOption = {
        createdAt: -1,
      };
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "name email")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),

      Property.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      properties,
    });
  } catch (error) {
    console.error("Search properties error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while searching properties",
    });
  }
};

// ==========================================
// GET PROPERTY BY ID
// ==========================================

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({
      _id: id,
      approvalStatus: "approved",
      isApproved: true,
      isActive: true,
    }).populate("owner", "name email phone");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching property",
    });
  }
};

const getOwnerPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerId = req.user._id || req.user.id || req.user.userId;

    const property = await Property.findOne({
      _id: id,
      owner: ownerId,
    }).populate("owner", "name email phone");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get owner property by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching property",
    });
  }
};

// ==========================================
// UPDATE PROPERTY
// ==========================================

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    // Owner can update only their own property
    if (
      req.user.role === "owner" &&
      property.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own property",
      });
    }

    // Only allow editable property fields
    const allowedFields = [
      "name",
      "description",
      "propertyType",
      "address",
      "location",
      "gender",
      "amenities",
      "rooms",
      "images",
      "rules",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // If owner edits property, keep ownership
    // and approval fields protected.
    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating property",
    });
  }
};

// ==========================================
// DELETE PROPERTY
// ==========================================

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    // Owner can delete only their own property
    if (
      req.user.role === "owner" &&
      property.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own property",
      });
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting property",
    });
  }
};

// ==========================================
// GET OWNER PROPERTIES
// ==========================================

const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id || req.user.userId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const properties = await Property.find({
      owner: ownerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error("Get owner properties error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner properties",
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getOwnerPropertyById,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
};
