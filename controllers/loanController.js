const Loan = require("../models/Loan");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.loanPage = async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");
  const loans = await Loan.find({ user: req.session.userId });
  res.render("loan", { loans });
};

exports.requestLoan = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.session.userId);

    // Simple loan eligibility check
    if (user.balance < amount * 0.1) {
      throw new Error("Insufficient balance for loan collateral");
    }

    const loan = new Loan({
      user: req.session.userId,
      amount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await loan.save();
    res.redirect("/loan");
  } catch (err) {
    res.render("loan", { error: err.message });
  }
};

// ... other imports

exports.requestLoan = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.session.userId);

    if (user.balance < amount * 0.1) {
      throw new Error("Insufficient balance for loan collateral");
    }

    const loan = new Loan({
      user: req.session.userId,
      amount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const transaction = new Transaction({
      type: "loan_request",
      amount,
      loan: loan._id,
      description: `Loan request of ${amount} NGN`,
    });

    user.balance += amount;

    await Promise.all([
      loan.save(),
      transaction.updateStatus("completed"),
      user.save(),
    ]);

    res.redirect("/loan");
  } catch (err) {
    res.render("loan", { error: err.message });
  }
};
