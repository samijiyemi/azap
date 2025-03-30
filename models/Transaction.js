const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Basic transaction details
    type: {
      type: String,
      enum: ["transfer", "exchange", "loan_request", "loan_repayment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD"],
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    transactionReference: {
      type: String,
      unique: true,
    },

    // User relationships
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type !== "loan_request";
      },
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "transfer" || this.type === "exchange";
      },
    },

    // Related entities
    exchangeListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeListing",
      required: function () {
        return this.type === "exchange";
      },
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: function () {
        return this.type === "loan_request" || this.type === "loan_repayment";
      },
    },

    // Paystack integration
    paystackReference: String,
    paystackFee: Number,

    // Additional details
    description: String,
    exchangeRate: {
      type: Number,
      required: function () {
        return this.type === "exchange";
      },
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    failedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate total amount including fees
transactionSchema.virtual("totalAmount").get(function () {
  return this.amount + (this.paystackFee || 0);
});

// Index for faster queries
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ recipient: 1, createdAt: -1 });

// Pre-save middleware to generate transaction reference
transactionSchema.pre("save", async function (next) {
  if (!this.transactionReference) {
    this.transactionReference = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }
  next();
});

// Method to update transaction status
transactionSchema.methods.updateStatus = async function (status) {
  this.status = status;
  if (status === "completed") this.completedAt = new Date();
  if (status === "failed") this.failedAt = new Date();
  return await this.save();
};

module.exports = mongoose.model("Transaction", transactionSchema);
