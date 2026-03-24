const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const {
  createStream,
  endStream,
  listLiveStreams,
  getStream,
} = require("../controllers/stream.controller");

const router = express.Router();

router.get("/live", asyncHandler(listLiveStreams));
router.get("/:id", asyncHandler(getStream));
router.post("/", requireAuth, asyncHandler(createStream));
router.post("/:id/end", requireAuth, asyncHandler(endStream));

module.exports = router;
