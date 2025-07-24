// routes/trends.js
const router = require("express").Router();
const axios = require("axios");

const KEY = process.env.NEWSDATA_API_KEY;
if (!KEY) console.error("Missing NEWSDATA_API_KEY");

const LATEST_URL = "https://newsdata.io/api/1/latest";

router.get("/", async (req, res) => {
  const { q = "general", from_date, to_date } = req.query;

  const params = {
    apikey: KEY,
    q,
    language: "en",
  };
  if (from_date) params.from_date = from_date;
  if (to_date) params.to_date = to_date;

  console.log("→ Newsdata.io /latest params:", params);

  try {
    const { data } = await axios.get(LATEST_URL, {
      params,
      timeout: 5000,
    });

    const trends = (data.results || []).map((item, idx) => ({
      id: String(idx),
      title: item.title,
      summary: item.description || item.content || "",
      published: item.pubDate,
      url: item.link,
      source: item.source_id,
    }));

    res.json(trends);
  } catch (err) {
    console.error(
      "Newsdata.io /latest error:",
      err.response?.data || err.message
    );
    if (err.response) {
      return res
        .status(err.response.status)
        .json({ error: err.response.data?.message || "Newsdata error" });
    }
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

module.exports = router;
