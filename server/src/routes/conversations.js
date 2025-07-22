// routes/conversations.js
const express = require("express");
const Conversation = require("../models/Conversation");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all your conversations
router.get("/", auth, async (req, res) => {
  const convos = await Conversation.find({ participants: req.user }).populate(
    "participants",
    "name avatarUrl"
  );
  res.json(convos);
});

// Create one‑to‑one (or fetch existing)
router.post("/private", auth, async (req, res) => {
  const { otherUserId } = req.body;
  let convo = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [req.user, otherUserId] },
  });
  if (!convo) {
    convo = await Conversation.create({
      participants: [req.user, otherUserId],
    });
  }
  res.json(convo);
});

// Create group
router.post("/group", auth, async (req, res) => {
  const { name, memberIds } = req.body; // include yourself
  const convo = await Conversation.create({
    isGroup: true,
    name,
    participants: memberIds,
    avatarUrl: "/group.png",
  });
  res.json(convo);
});

// Join existing group
router.post("/group/join", auth, async (req, res) => {
  const { conversationId } = req.body;
  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.isGroup) return res.status(404).send("Not found");
  if (!convo.participants.includes(req.user)) {
    convo.participants.push(req.user);
    await convo.save();
  }
  res.json(convo);
});

module.exports = router;
