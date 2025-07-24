const router = require("express").Router();
const axios = require("axios");

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
if (!NEWSAPI_KEY) {
  console.error("Missing environment variable: NEWSAPI_KEY");
}

const NEWSAPI = "https://newsapi.org/v2/everything";

router.get("/", async (req, res) => {
  const { cat, start, end } = req.query;
  if (!cat) return res.status(400).json({ error: "Missing `cat`" });

  // Validate dates...
  const isoDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (start && !isoDate(start))
    return res.status(400).json({ error: "`start` invalid" });
  if (end && !isoDate(end))
    return res.status(400).json({ error: "`end` invalid" });

  try {
    const response = await axios.get(NEWSAPI, {
      params: {
        q: cat,
        from: start,
        to: end,
        sortBy: "popularity",
        language: "en",
      },
      headers: {
        // 1. Your API key
        "X-Api-Key": NEWSAPI_KEY,
        // 2. Make it look like a real browser
        "User-Agent": "Mozilla/5.0 (Node.js) NewsFetcher/1.0",
        Accept: "application/json",
      },
      timeout: 5000,
    });

    const trends = response.data.articles.map((a, i) => ({
      id: i,
      title: a.title,
      summary: a.description || "",
      published: a.publishedAt,
      url: a.url,
      source: a.source.name,
    }));
    res.json(trends);
  } catch (err) {
    if (err.response) {
      console.error(`NewsAPI ${err.response.status}:`, err.response.data);
      const msg = err.response.data?.message || err.response.data;
      return res.status(err.response.status).json({ error: msg });
    } else if (err.request) {
      console.error("No response from NewsAPI:", err.message);
      return res.status(502).json({ error: "Bad gateway" });
    } else {
      console.error("Error fetching NewsAPI:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
