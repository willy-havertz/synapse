// server/src/middleware/track.js

const Event = require("../models/Event"); // we’ll create this in a moment

/**
 * A very‑simple “track every API call” middleware.
 * You can customize `type` and `payload` however you like.
 */
module.exports = async function track(req, res, next) {
  try {
    // Only track our /api/ calls
    if (req.path.startsWith("/api/")) {
      const type =
        req.method === "GET"
          ? "pageview"
          : req.method === "POST"
          ? "event"
          : req.method;

      const payload = {
        path: req.path,
        method: req.method,
        // capture any query or body data as you see fit:
        ...(Object.keys(req.query).length && { query: req.query }),
        ...(req.body && Object.keys(req.body).length && { body: req.body }),
      };

      // fire-and-forget
      Event.create({ type, payload }).catch((err) =>
        console.error("track(): could not record event", err)
      );
    }
  } catch (err) {
    console.error("track() middleware error:", err);
  } finally {
    return next();
  }
};
