const express = require("express");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const {
  getUserProfile,
  toggleFollow,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/:id", optionalAuth, asyncHandler(getUserProfile));
router.post("/:id/follow", requireAuth, asyncHandler(toggleFollow));

module.exports = router;
