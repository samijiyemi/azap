const mongoose = require("mongoose");

const exchangeListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amountUSD: { type: Number, required: true },
  rate: { type: Number, required: true },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ExchangeListing", exchangeListingSchema);
