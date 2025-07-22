// routes/messages.js
const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const router = express.Router();

// Get messages for a conversation
router.get("/:conversationId", auth, async (req, res) => {
  const msgs = await Message.find({ conversation: req.params.conversationId })
    .sort("createdAt")
    .populate("sender", "name avatarUrl");
  res.json(msgs);
});

module.exports = router;
