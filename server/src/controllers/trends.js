require("dotenv").config();
const axios = require("axios");
const KEY = process.env.NEWSAPI_KEY;

const categoryMap = {
  Cybersecurity: "cybersecurity",
  Engineering: "engineering",
  Nursing: "nursing healthcare",
  Agriculture: "agriculture",
  Education: "education",
};

exports.listByCategory = async (req, res) => {
  const cat = req.query.cat;
  if (!cat || !KEY)
    return res.status(400).json({ error: "Missing category or NEWSAPI_KEY" });

  const q = categoryMap[cat] || cat;
  try {
    const { data } = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: { q, language: "en", pageSize: 20, apiKey: KEY },
    });
    const articles = data.articles.map((a, i) => ({
      id: i + 1,
      category: cat,
      title: a.title,
      summary: a.description || "",
      published: a.publishedAt,
      url: a.url,
      source: a.source.name,
      image: a.urlToImage,
    }));
    res.json(articles);
  } catch (err) {
    console.error("NewsAPI error:", err.message);
    res.status(502).json({ error: "Failed to fetch live trends" });
  }
};
