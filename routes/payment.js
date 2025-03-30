const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
};

// Dashboard route
router.get("/dashboard", isAuthenticated, paymentController.dashboard);

// Send money routes
router.get("/send", isAuthenticated, paymentController.sendMoneyPage);
router.post("/send", isAuthenticated, paymentController.sendMoney);

// Fund wallet routes
router.get("/fund", isAuthenticated, paymentController.fundWalletPage);
router.post("/fund", isAuthenticated, paymentController.initializeFunding);

// Payment verification route
router.get("/verify", paymentController.verifyPayment); // No auth required as it's a callback

// Additional routes for transaction history
router.get("/transactions", isAuthenticated, async (req, res) => {
  try {
    const transactions = await require("../models/Transaction")
      .find({
        $or: [{ user: req.session.userId }, { recipient: req.session.userId }],
      })
      .sort({ createdAt: -1 })
      .populate("recipient", "name");
    res.render("transactions", { transactions });
  } catch (err) {
    res.status(500).send("Error fetching transactions");
  }
});

module.exports = router;
