const express = require("express");
const multer = require("multer");
const { Configuration, OpenAIApi } = require("openai");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// initialize OpenAI client
const conf = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(conf);

router.post("/analyze", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // convert buffer → base64
  const b64 = req.file.buffer.toString("base64");
  // prepend data URI so GPT knows it’s an image
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  // craft a single‐shot JSON prompt
  const system = `You are a photo beauty analyzer.  When I send you an image (as base64), you will reply *only* with valid JSON* having exactly these keys:
  • beautyScore: number from 0.0 to 10.0  
  • confidence: string as "XX%"  
  • features: array of { label: string, value: number } - each 0.0-10.0  
  • mood: string  
  • recommendations: array of strings  
  
Do not wrap your JSON in backticks or markdown—just raw JSON.`;

  const user = `Here is the image: ${dataUri}`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // or your preferred vision‑capable model
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });

    // GPT should reply with JSON only
    const raw = completion.data.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return res.json(parsed);
  } catch (err) {
    console.error("❌ AI analysis error:", err);
    return res
      .status(500)
      .json({ error: "Failed to analyze image. " + err.message });
  }
});

module.exports = router;
