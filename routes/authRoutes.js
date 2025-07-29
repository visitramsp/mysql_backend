const express = require("express");
const {
  getUserDetail,
  createCustomer,
  loginCustomer,
  logoutCustomer,
  updateCustomer,
} = require("../controllers/userContrroler");
const validate = require("../middleware/validateRequest");
const { userRegister } = require("../helpers/validation");
const { verifyToken } = require("../middleware/JWT");
const upload = require("../middleware/uploadImage");

const router = express.Router();

router.get("/get", verifyToken, getUserDetail);
router.post("/create", validate(userRegister), createCustomer);
router.post("/login", loginCustomer);
router.post("/logout", verifyToken, logoutCustomer);
router.post(
  "/customer/update",
  verifyToken,
  upload.single("profile_picture"),
  updateCustomer
);

module.exports = router;
