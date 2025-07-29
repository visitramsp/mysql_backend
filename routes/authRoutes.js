const express = require("express");
const {
  getUserDetail,
  createCustomer,
  loginCustomer,
  logoutCustomer,
} = require("../controllers/userContrroler");
const validate = require("../middleware/validateRequest");
const { userRegister } = require("../helpers/validation");
const { verifyToken } = require("../middleware/JWT");

const router = express.Router();

router.get("/get", verifyToken, getUserDetail);
router.post("/create", validate(userRegister), createCustomer);
router.post("/login", loginCustomer);
router.post("/logout", verifyToken, logoutCustomer);

module.exports = router;
