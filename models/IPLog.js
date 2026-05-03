const mongoose = require("mongoose");

const ipSchema = new mongoose.Schema({
  ip: String,
  fingerprint: String,
  roomId: String,
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("IPLog", ipSchema);