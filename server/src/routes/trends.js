const router = require("express").Router();
const axios = require("axios");

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
if (!NEWSAPI_KEY) {
  console.error("Missing environment variable: NEWSAPI_KEY");
  // Optionally throw here:
  // throw new Error("NEWSAPI_KEY is required");
}

const NEWSAPI = "https://newsapi.org/v2/everything";

router.get("/", async (req, res) => {
  const { cat, start, end } = req.query;

  // 1. Validate required `cat`
  if (!cat) {
    return res
      .status(400)
      .json({ error: "Missing required query param `cat`" });
  }

  // 2. (Optional) Validate date formats if provided
  const isoDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (start && !isoDate(start)) {
    return res
      .status(400)
      .json({ error: "`start` must be in YYYY-MM-DD format" });
  }
  if (end && !isoDate(end)) {
    return res
      .status(400)
      .json({ error: "`end` must be in YYYY-MM-DD format" });
  }

  try {
    // 3. Fetch from NewsAPI, sending key in header to bypass Cloudflare challenge
    const response = await axios.get(NEWSAPI, {
      params: {
        q: cat,
        from: start,
        to: end,
        sortBy: "popularity",
        language: "en",
      },
      headers: {
        "X-Api-Key": NEWSAPI_KEY,
      },
      timeout: 5000, // fail fast if NewsAPI is unresponsive
    });

    // 4. Transform and return
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
    // 5. Detailed logging
    if (err.response) {
      // NewsAPI returned non-2xx
      console.error(
        `NewsAPI ${err.response.status} at ${NEWSAPI}:`,
        err.response.data
      );
      return res.status(err.response.status).json({ error: err.response.data });
    } else if (err.request) {
      // No response (network, DNS)
      console.error("No response from NewsAPI:", err.message);
      return res
        .status(502)
        .json({ error: "Bad gateway: NewsAPI no response" });
    } else {
      // Something went wrong setting up the request
      console.error("Error fetching from NewsAPI:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
