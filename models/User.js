const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  name: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
