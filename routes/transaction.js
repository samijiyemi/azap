const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

router.get("/", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const transactions = await Transaction.find({
    $or: [{ sender: req.session.userId }, { recipient: req.session.userId }],
  })
    .populate("sender", "name")
    .populate("recipient", "name")
    .sort({ createdAt: -1 });

  res.render("transactions", { transactions });
});

module.exports = router;
