// server/src/models/PageView.js
const mongoose = require("mongoose");

const PageViewSchema = new mongoose.Schema({
  path: String,
  source: String, // e.g. req.get("Referer") or "Direct"
  timestamp: { type: Date, default: Date.now, index: true },
});
module.exports = mongoose.model("PageView", PageViewSchema);
