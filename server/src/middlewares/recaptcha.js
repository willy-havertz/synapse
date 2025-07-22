// server/src/middlewares/recaptcha.js
require("dotenv").config(); // ← ensure RECAPTCHA_SECRET_KEY is loaded
const axios = require("axios");

async function verifyRecaptcha(req, res, next) {
  // your front‑end is POSTing { recaptchaToken: "…" }
  const token = req.body.recaptchaToken;
  if (!token) {
    return res.status(400).json({ error: "reCAPTCHA token missing" });
  }

  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret,
          response: token,
          remoteip: req.ip, // optional
        },
      }
    );

    if (!data.success) {
      return res.status(403).json({
        error: "reCAPTCHA verification failed",
        details: data["error-codes"],
      });
    }

    // pass validation
    next();
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    res.status(500).json({ error: "reCAPTCHA verification error" });
  }
}

module.exports = verifyRecaptcha;
