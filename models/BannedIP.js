const mongoose = require("mongoose");

const bannedSchema = new mongoose.Schema({
  ip: String,
  fingerprint: String,
  reason: String,
  expiresAt: Date
});

module.exports = mongoose.model("BannedIP", bannedSchema);