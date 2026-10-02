const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  createProperty,
  getProperties,
  getPropertyById,
  getOwnerPropertyById,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
} = require("../controllers/property.controller");

const router = express.Router();

router.get("/", getProperties);

router.get(
  "/owner",
  protect,
  authorize("owner", "admin"),
  getOwnerProperties
);

router.get(
  "/owner/:id",
  protect,
  authorize("owner", "admin"),
  getOwnerPropertyById
);

router.get("/:id", getPropertyById);

router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  createProperty
);

router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  updateProperty
);

router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteProperty
);

module.exports = router;