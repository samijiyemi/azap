const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplaceController");

router.get("/", marketplaceController.marketplacePage);
router.post("/create", marketplaceController.createListing);
router.post("/complete", marketplaceController.completeExchange);

module.exports = router;
