// src/config/multer.js
const multer = require("multer");
module.exports = multer({ storage: multer.memoryStorage() });
