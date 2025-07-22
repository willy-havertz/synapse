const cors = require("cors");

module.exports = function setupCors(clientUrl) {
  const ALLOWED = [
    clientUrl,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean);

  return cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED.includes(origin)),
    credentials: true,
  });
};
