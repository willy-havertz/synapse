// server/src/models/Event.js

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
