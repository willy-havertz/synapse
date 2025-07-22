// models/Conversation.js
const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // group name (if isGroup)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  avatarUrl: { type: String }, // group avatar
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
