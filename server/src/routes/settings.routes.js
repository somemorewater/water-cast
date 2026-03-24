const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const {
  getSettings,
  updateSettings,
} = require("../controllers/settings.controller");

const router = express.Router();

router.get("/", requireAuth, asyncHandler(getSettings));
router.put("/", requireAuth, asyncHandler(updateSettings));

module.exports = router;
