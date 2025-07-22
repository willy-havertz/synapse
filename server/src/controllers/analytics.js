// server/src/controllers/analytics.js
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
require("dotenv").config();

// Path to your service account JSON
const KEY_FILE = process.env.GA4_KEY_FILE || "./ga4-service-account.json";
const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
if (!PROPERTY_ID) {
  console.error("Missing GA4_PROPERTY_ID in .env");
  process.exit(1);
}

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: KEY_FILE,
});

function formatDate(d) {
  // GA4 expects YYYY-MM-DD
  return new Date(d).toISOString().slice(0, 10);
}

exports.overview = async (req, res) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
    });
    // map metrics into key:value object
    const overview = {};
    response.metricHeaders.forEach((h, i) => {
      overview[h.name] = Number(response.rows[0].metricValues[i].value);
    });
    res.json(overview);
  } catch (err) {
    console.error("GA4 overview error:", err);
    res.status(502).json({ error: "GA4 overview failed" });
  }
};

exports.visitors = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ error: "Missing date range" });

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: formatDate(start), endDate: formatDate(end) }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      limit: 10000,
    });
    const data = response.rows.map((r) => ({
      date: r.dimensionValues[0].value,
      visitors: Number(r.metricValues[0].value),
    }));
    res.json(data);
  } catch (err) {
    console.error("GA4 visitors error:", err);
    res.status(502).json({ error: "GA4 visitors failed" });
  }
};

exports.topPages = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ error: "Missing date range" });

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: formatDate(start), endDate: formatDate(end) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });
    const data = response.rows.map((r) => ({
      page: r.dimensionValues[0].value,
      views: Number(r.metricValues[0].value),
    }));
    res.json(data);
  } catch (err) {
    console.error("GA4 topPages error:", err);
    res.status(502).json({ error: "GA4 top-pages failed" });
  }
};

exports.sources = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ error: "Missing date range" });

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: formatDate(start), endDate: formatDate(end) }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 5,
    });
    const data = response.rows.map((r) => ({
      source: r.dimensionValues[0].value,
      value: Number(r.metricValues[0].value),
    }));
    res.json(data);
  } catch (err) {
    console.error("GA4 sources error:", err);
    res.status(502).json({ error: "GA4 sources failed" });
  }
};
