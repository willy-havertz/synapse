const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message"); 

// Middleware
function auth(req, res, next) {
  try {
    req.user = jwt.verify(
      req.header("Authorization").split(" ")[1],
      process.env.JWT_SECRET
    );
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Fetch last 50 messages
router.get("/:room", auth, async (req, res) => {
  const msgs = await Message.find({ room: req.params.room })
    .sort({ createdAt: 1 })
    .limit(50);
  res.json(msgs);
});

module.exports = router;
