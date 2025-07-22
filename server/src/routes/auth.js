const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const upload = require("../config/multer");
const { requireAuth } = require("../middlewares/auth");
const verifyRecaptcha = require("../middlewares/recaptcha");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avatars", public_id: publicId },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

router.post("/signup", verifyRecaptcha, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email & password required" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", verifyRecaptcha, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = Date.now() + 3600_000;
      await user.save();

      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: !!process.env.SMTP_SECURE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&id=${user._id}`;
      await transport.sendMail({
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "Password Reset",
        html: `<p>Reset your password <a href="${resetUrl}">here</a>. Expires in 1h.</p>`,
      });
    }
    res.json({ message: "If that email exists, reset link sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process reset request" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { id, token, newPassword } = req.body;
  if (!id || !token || !newPassword) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const user = await User.findById(id);
    if (
      !user ||
      !user.resetPasswordToken ||
      user.resetPasswordExpires < Date.now() ||
      crypto.createHash("sha256").update(token).digest("hex") !==
        user.resetPasswordToken
    ) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reset failed" });
  }
});

router.get("/profile", requireAuth, (req, res) => {
  const { name, email, avatarUrl } = req.user;
  res.json({ name, email, avatarUrl });
});

router.put(
  "/profile",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (req.body.name) {
        req.user.name = req.body.name.trim();
      }
      if (req.file?.buffer) {
        const publicId = `user_${req.user._id}_${Date.now()}`;
        const result = await uploadToCloudinary(req.file.buffer, publicId);
        req.user.avatarUrl = result.secure_url;
      }
      await req.user.save();
      res.json({ message: "Profile updated", avatarUrl: req.user.avatarUrl });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Profile update failed" });
    }
  }
);

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ message: "Logged out" });
});

module.exports = router;
