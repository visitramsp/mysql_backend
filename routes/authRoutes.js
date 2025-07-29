const express = require("express");
const {
  getUserDetail,
  createCustomer,
} = require("../controllers/userContrroler");

const router = express.Router();

router.get("/get", getUserDetail);
router.post("/create", createCustomer);

module.exports = router;
