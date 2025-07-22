const mongoose = require("mongoose");

module.exports = function connectDB(uri) {
  return mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(" MongoDB connected successfully"))
    .catch((err) => console.error(" MongoDB error:", err));
};
