const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["pageview", "click", "custom"], // adjust as you like
    },
    path: { type: String, required: true },
    referrer: { type: String, default: "" },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
