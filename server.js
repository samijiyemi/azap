const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("./config/db");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const marketplaceRoutes = require("./routes/marketplace");
const loanRoutes = require("./routes/loan");
const transactionRoutes = require("./routes/transaction");
const authController = require("./controllers/authController");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "samisgoodiguess",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       sameSite: "strict",
//     },
//   })
// );

// app.use(
//   session({
//     secret: "qEas5ns3gxl41G",
//     cookie: { maxAge: 86400000, secure: true },
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// After session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  })
);
app.use(flash());

// Make session and flash available to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Make session available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// EJS Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Define global helper functions
app.locals.formatCurrency = function (amount, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
app.locals.formatDate = function (date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", authRoutes);
app.use("/payment", authController.isAuthenticated, paymentRoutes);
app.use("/marketplace", authController.isAuthenticated, marketplaceRoutes);
app.use("/loan", authController.isAuthenticated, loanRoutes);
app.use("/transactions", authController.isAuthenticated, transactionRoutes);

app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .render("error", { error: "Something went wrong!", status: 500 });
});

const PORT = process.env.PORT || 3000;
// console.log(app.locals);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
