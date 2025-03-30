const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");

router.get("/", loanController.loanPage);
router.post("/request", loanController.requestLoan);

module.exports = router;
