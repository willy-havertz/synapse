// server/src/middlewares/recaptcha.js
const axios = require("axios");

async function verifyRecaptcha(req, res, next) {
  const token = req.body.recaptcha;
  if (!token) {
    return res.status(400).json({ error: "reCAPTCHA token missing" });
  }

  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    // verify with Google
    const resp = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token,
          remoteip: req.ip,
        },
      }
    );
    if (!resp.data.success) {
      return res
        .status(403)
        .json({
          error: "reCAPTCHA verification failed",
          details: resp.data["error-codes"],
        });
    }
    next();
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    res.status(500).json({ error: "reCAPTCHA verification error" });
  }
}

module.exports = verifyRecaptcha;
