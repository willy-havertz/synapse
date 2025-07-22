require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const setupCors = require("./config/cors");
const helmet = require("./config/helmet");
const upload = require("./config/multer"); // ← our new in-memory multer
const setupSocket = require("./config/socket");

const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

const authRoutes = require("./routes/auth");
const trendsRoutes = require("./routes/trends");
const analyticsRoutes = require("./routes/analytics");
const weatherRouter = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 5000;

// 1) SECURITY HEADERS
app.use(helmet);

// 2) CORS
app.use(setupCors(process.env.CLIENT_URL));

// 3) JSON PARSER
app.use(express.json());

// 4) ROUTES
app.use("/api/weather", weatherRouter);
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");
app.use("/api/user", authRoutes); // also expose /api/user/profile
app.use("/api/trends", trendsRoutes);
app.use("/api/analytics", analyticsRoutes);

// 5) PHOTO ANALYSIS (uses same in-memory multer)
app.post("/api/photo/analyze", upload.single("photo"), async (req, res) => {
  // Your req.file.buffer is here
  // …do analysis…
  res.json({
    success: true,
    analysis: {
      /* … */
    },
  });
});

// 6) CHAT ENDPOINTS
app.post("/api/chat/private", async (req, res) => {
  /* … */
});
app.post("/api/chat/group", async (req, res) => {
  /* … */
});
app.post("/api/chat/group/join", async (req, res) => {
  /* … */
});
app.get("/api/chat/conversations/:userId", async (req, res) => {
  /* … */
});
app.get("/api/chat/messages/:conversationId", async (req, res) => {
  /* … */
});

(async () => {
  await connectDB(process.env.MONGO_URI);
  const allowed = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean);
  const server = setupSocket(app, allowed);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
