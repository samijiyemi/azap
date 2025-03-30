require("dotenv").config();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);

const crypto = require("crypto");

exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/auth/login");
    }

    const recentTransactions = await Transaction.find({
      $or: [{ sender: req.session.userId }, { recipient: req.session.userId }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("sender", "name")
      .populate("recipient", "name");

    console.log(`Dashboard: User balance: ${user.balance}`); // Debug log

    const formatCurrency = (amount, currency = "NGN") => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
      }).format(amount);
    };

    res.render("dashboard", {
      user,
      recentTransactions,
      userName: req.session.userName || user.name,
      formatCurrency,
      formatDate: res.locals.formatDate,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).render("error", { error: err.message });
  }
};

exports.sendMoneyPage = (req, res) => {
  res.render("sendmoney", { error: null });
};

exports.sendMoney = async (req, res) => {
  try {
    const { amount, recipientEmail } = req.body;
    const sender = await User.findById(req.session.userId);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      return res.render("sendmoney", { error: "Recipient not found" });
    }
    if (sender.balance < amount) {
      return res.render("sendmoney", { error: "Insufficient funds" });
    }
    if (sender._id.equals(recipient._id)) {
      return res.render("sendmoney", {
        error: "Cannot send money to yourself",
      });
    }

    const transaction = new Transaction({
      type: "transfer",
      amount: parseFloat(amount),
      sender: sender._id,
      recipient: recipient._id,
      description: `Transfer to ${recipient.name}`,
    });

    const transfer = await Paystack.transfer.create({
      source: "balance",
      reason: transaction.description,
      amount: amount * 100, // Convert to kobo
      recipient: recipient.email,
    });

    transaction.paystackReference = transfer.data.reference;
    transaction.paystackFee = transfer.data.fee / 100;

    sender.balance -= parseFloat(amount);
    recipient.balance += parseFloat(amount);

    await Promise.all([
      sender.save(),
      recipient.save(),
      transaction.updateStatus("completed"),
    ]);

    res.redirect("/payment/dashboard");
  } catch (err) {
    res.render("sendmoney", { error: err.message });
  }
};

// New Funding Methods
exports.fundWalletPage = (req, res) => {
  res.render("fund-wallet", {
    paymentUrl: null,
    error: null,
    success: null,
  });
};

exports.initializeFunding = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.session.userId);
    console.log("Funding user:", user); // Debug log

    if (!amount || amount <= 0) {
      return res.render("fund-wallet", {
        paymentUrl: null,
        error: "Please enter a valid amount",
        success: null,
      });
    }

    user.balance += parseFloat(amount); // Update user balance before payment
    console.log(`User balance before payment: ${user.balance}`); // Debug log
    await user.save(); // Save user balance

    const payment = await Paystack.transaction.initialize({
      email: user.email,
      amount: parseFloat(amount) * 100, // Convert to kobo
      callback_url: `${req.protocol}://${req.get(
        "host"
      )}/payment/verify-funding`,
      metadata: {
        userId: user._id.toString(),
        type: "wallet_funding",
      },
    });

    res.render("fund-wallet", {
      paymentUrl: payment.data.authorization_url,
      error: null,
      success: "Payment initialized successfully",
    });
  } catch (err) {
    res.render("fund-wallet", {
      paymentUrl: null,
      error: "Failed to initialize payment: " + err.message,
      success: null,
    });
  }
};

exports.verifyFunding = async (req, res) => {
  try {
    const { reference } = req.params;

    console.log("Verifying funding with reference:", reference); // Debug log

    const verification = await Paystack.transaction.verify({ reference });
    console.log("Paystack verification response:", verification.data); // Debug log

    if (verification.data.status === "success") {
      const user = await User.findById(req.session.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const amount = verification.data.amount / 100; // Convert from kobo
      console.log(`Adding ${amount} NGN to user ${user._id}`); // Debug log

      const transaction = new Transaction({
        type: "transfer",
        amount,
        recipient: user._id,
        description: "Wallet funding",
        paystackReference: reference,
        paystackFee: verification.data.fees / 100,
        status: "completed", // Ensure status is set to completed
      });

      user.balance += amount;
      console.log(`New balance before save: ${user.balance}`); // Debug log

      await Promise.all([user.save(), transaction.save()]);

      console.log(`Balance updated successfully. New balance: ${user.balance}`); // Debug log
      res.redirect("/payment/dashboard");
    } else {
      throw new Error(
        "Payment verification failed: " + verification.data.status
      );
    }
  } catch (err) {
    console.error("Funding verification error:", err);
    res.render("fund-wallet", {
      paymentUrl: null,
      error: "Payment verification failed: " + err.message,
      success: null,
    });
  }
};

exports.receiveMoneyPage = (req, res) => {
  res.render("receive", { paymentUrl: null, error: null });
};

exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.session.userId);

    const payment = await Paystack.transaction.initialize({
      email: user.email,
      amount: amount * 100, // Convert to kobo
      callback_url: `${req.protocol}://${req.get("host")}/payment/verify`,
    });

    res.render("receive", {
      paymentUrl: payment.data.authorization_url,
      error: null,
    });
  } catch (err) {
    res.render("receive", {
      paymentUrl: null,
      error: "Failed to initialize payment: " + err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const verification = await Paystack.transaction.verify({ reference });

    if (verification.data.status === "success") {
      const user = await User.findById(req.session.userId);
      const amount = verification.data.amount / 100; // Convert from kobo

      const transaction = new Transaction({
        type: "transfer",
        amount,
        recipient: user._id,
        description: "Account funding",
        paystackReference: reference,
        paystackFee: verification.data.fees / 100,
      });

      user.balance += amount;
      await Promise.all([user.save(), transaction.updateStatus("completed")]);

      res.redirect("/payment/dashboard");
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (err) {
    res.render("receive", {
      paymentUrl: null,
      error: "Payment verification failed: " + err.message,
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    // Verify Paystack signature
    const signature = req.headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    // Handle different Paystack events
    switch (event.event) {
      case "charge.success":
        if (
          event.data.metadata &&
          event.data.metadata.type === "wallet_funding"
        ) {
          const reference = event.data.reference;
          const existingTransaction = await Transaction.findOne({
            paystackReference: reference,
          });

          if (!existingTransaction) {
            const user = await User.findById(event.data.metadata.userId);
            if (!user) {
              console.error(
                "User not found for webhook:",
                event.data.metadata.userId
              );
              return res
                .status(200)
                .send("Webhook received but user not found");
            }

            const amount = event.data.amount / 100; // Convert from kobo
            const transaction = new Transaction({
              type: "transfer",
              amount,
              recipient: user._id,
              description: "Wallet funding via webhook",
              paystackReference: reference,
              paystackFee: event.data.fees / 100,
              status: "completed",
            });

            user.balance += amount;
            await Promise.all([user.save(), transaction.save()]);
            console.log(`Wallet funded for user ${user._id}: ${amount} NGN`);
          }
        }
        break;

      case "transfer.success":
        const transferReference = event.data.reference;
        const transaction = await Transaction.findOne({
          paystackReference: transferReference,
        });
        if (transaction && transaction.status === "pending") {
          await transaction.updateStatus("completed");
          console.log(`Transfer completed: ${transferReference}`);
        }
        break;

      case "transfer.failed":
      case "transfer.reversed":
        const failedTransferRef = event.data.reference;
        const failedTransaction = await Transaction.findOne({
          paystackReference: failedTransferRef,
        });
        if (failedTransaction && failedTransaction.status === "pending") {
          await failedTransaction.updateStatus("failed");
          console.log(`Transfer failed: ${failedTransferRef}`);
        }
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    // Respond with 200 to acknowledge receipt
    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(400).send("Webhook processing failed");
  }
};
