const ExchangeListing = require("../models/ExchangeListing");
const axios = require("axios");

exports.marketplacePage = async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  try {
    const listings = await ExchangeListing.find({ status: "active" }).populate(
      "user",
      "name"
    );

    const rateResponse = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD?access_key=${process.env.EXCHANGE_RATE_API_KEY}`
    );
    const currentRate = rateResponse.data.rates.NGN;

    res.render("marketplace", {
      listings,
      currentRate,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
      error: req.query.error || null, // Check for query param from redirect
      success: req.query.success || null, // Check for query param from redirect
    });
  } catch (err) {
    res.render("marketplace", {
      listings: [],
      currentRate: 0,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
      error: "Failed to load marketplace: " + err.message,
      success: null,
    });
  }
};

exports.createListing = async (req, res) => {
  try {
    const { amountUSD, rate, address } = req.body;
    const user = await User.findById(req.session.userId);

    if (!amountUSD || !rate || !address) {
      throw new Error("All fields are required");
    }

    const listing = new ExchangeListing({
      user: req.session.userId,
      amountUSD: parseFloat(amountUSD),
      rate: parseFloat(rate),
      address,
    });

    await listing.save();

    const listings = await ExchangeListing.find({ status: "active" }).populate(
      "user",
      "name"
    );

    const rateResponse = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD?access_key=${process.env.EXCHANGE_RATE_API_KEY}`
    );
    const currentRate = rateResponse.data.rates.NGN;

    res.render("marketplace", {
      listings,
      currentRate,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
      error: null,
      success: "Listing created successfully",
    });
  } catch (err) {
    const listings = await ExchangeListing.find({ status: "active" }).populate(
      "user",
      "name"
    );
    const rateResponse = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD?access_key=${process.env.EXCHANGE_RATE_API_KEY}`
    );
    const currentRate = rateResponse.data.rates.NGN;

    res.render("marketplace", {
      listings,
      currentRate,
      mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
      error: err.message,
      success: null,
    });
  }
};

exports.completeExchange = async (req, res) => {
  try {
    // ... (existing logic remains the same until the end)

    await Promise.all([
      buyer.save(),
      seller.save(),
      listing.save(),
      transaction.updateStatus("completed"),
    ]);

    req.flash("success", "Exchange completed successfully");
    res.redirect("/marketplace");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/marketplace");
  }
};
