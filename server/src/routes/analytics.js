const express = require("express");
const router = express.Router();
const AnalyticsEvent = require("../models/AnalyticsEvent");

router.post("/event", async (req, res) => {
  const { eventType, path, referrer, timestamp } = req.body;
  // Basic validation
  if (!eventType || !path || !timestamp) {
    return res
      .status(400)
      .json({ error: "eventType, path and timestamp are required." });
  }

  try {
    const evt = new AnalyticsEvent({
      eventType,
      path,
      referrer: referrer || "",
      timestamp: new Date(timestamp),
    });
    await evt.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("AnalyticsEvent.save error:", err);
    res.status(500).json({ error: "Could not record event." });
  }
});


router.get("/overview", async (req, res) => {
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  try {
    const match = {
      timestamp: { $gte: startDate, $lte: endDate },
    };
    // total events
    const total = await AnalyticsEvent.countDocuments(match);
    // distinct pageviews
    const pageviews = await AnalyticsEvent.countDocuments({
      ...match,
      eventType: "pageview",
    });
    // for illustration, number of unique paths viewed:
    const uniquePages = await AnalyticsEvent.distinct("path", {
      ...match,
      eventType: "pageview",
    }).then((arr) => arr.length);

    res.json({
      totalEvents: total,
      pageviews,
      uniquePages,
      // add more overview metrics here...
    });
  } catch (err) {
    console.error("GET /overview error:", err);
    res.status(500).json({ error: "Failed to fetch overview." });
  }
});


router.get("/visitors", async (req, res) => {
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  try {
    const data = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "pageview",
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          visitors: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          visitors: 1,
          _id: 0,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.error("GET /visitors error:", err);
    res.status(500).json({ error: "Failed to fetch visitors data." });
  }
});


router.get("/top-pages", async (req, res) => {
  const { start, end, limit = 5 } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  try {
    const data = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "pageview",
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          page: "$_id",
          views: 1,
          _id: 0,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.error("GET /top-pages error:", err);
    res.status(500).json({ error: "Failed to fetch top pages." });
  }
});


router.get("/sources", async (req, res) => {
  const { start, end } = req.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  try {
    const data = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: "pageview",
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$referrer",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          source: { $ifNull: ["$_id", "Direct"] },
          value: 1,
          _id: 0,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.error("GET /sources error:", err);
    res.status(500).json({ error: "Failed to fetch sources." });
  }
});

module.exports = router;
