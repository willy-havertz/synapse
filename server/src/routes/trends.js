const router = require("express").Router();
const axios = require("axios");

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const NEWSAPI = "https://newsapi.org/v2/everything";

router.get("/", async (req, res) => {
  const { cat, start, end } = req.query;
  if (!cat) return res.status(400).json({ error: "Missing cat" });
  try {
    const { data } = await axios.get(NEWSAPI, {
      params: {
        apiKey: NEWSAPI_KEY,
        q: cat,
        from: start,
        to: end,
        sortBy: "popularity",
        language: "en",
      },
    });
    const trends = data.articles.map((a, i) => ({
      id: i,
      title: a.title,
      summary: a.description || "",
      published: a.publishedAt,
      url: a.url,
      source: a.source.name,
    }));
    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "News fetch failed" });
  }
});

module.exports = router;
