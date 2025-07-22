// server/src/routes/weather.js
const express = require("express");
const router = express.Router();
const { getWeather } = require("../controllers/weatherController");

// matches GET /api/weather?loc=…
router.get("/", async (req, res) => {
  const loc = req.query.loc;
  if (!loc) return res.status(400).json({ error: "loc query is required" });
  try {
    const data = await getWeather(loc);
    res.json(data);
  } catch (err) {
    console.error("weather error:", err);
    res.status(502).json({ error: "Failed to fetch weather data" });
  }
});

module.exports = router;
