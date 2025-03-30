const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

exports.loginPage = (req, res) => {
  res.render("auth/login", { error: null });
};

exports.registerPage = (req, res) => {
  res.render("auth/register", { error: null });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("auth/register", { error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    res.redirect("/auth/login");
  } catch (err) {
    res.render("auth/register", {
      error: "Registration failed: " + err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("auth/login", { error: "Invalid email or password" });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.redirect("/payment/dashboard");
  } catch (err) {
    res.render("auth/login", { error: "Login failed: " + err.message });
  }
};

// Updated logout controller
exports.logout = (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.redirect("/payment/dashboard"); // Redirect to dashboard if logout fails
      }

      // Clear the session cookie
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict",
      });

      // Redirect to login page with success message
      res.redirect("/auth/login");
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.redirect("/payment/dashboard");
  }
};

// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

module.exports = exports;
