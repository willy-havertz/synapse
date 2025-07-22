// server/src/models/Trend.js
const mongoose = require("mongoose");

const TrendSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  category: { type: String, required: true, index: true },
  published: { type: Date, required: true, default: Date.now, index: true },
  url: { type: String },
});

module.exports = mongoose.model("Trend", TrendSchema);
