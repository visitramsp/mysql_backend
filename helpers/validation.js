const Joi = require("joi");

const phonePattern = /^[6-9]\d{9}$/;
const userRegister = Joi.object({
  name: Joi.string()
    .min(3)
    .max(25)
    .trim()
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  mobile_number: Joi.string()
    .trim()
    .required()
    .regex(phonePattern)
    .messages({
      "string.pattern.base":
        "Invalid Mobile number format. It should be in the format +xx-xxxxxxxxxx",
      "any.required": "Mobile number is required",
      "string.empty": "Mobile number must not be empty",
    })
    .label("Mobile Number"),
  age: Joi.number().required("Age is Required"),
  role: Joi.string().optional(),
  profile_picture: Joi.string().optional(),
  address: Joi.string().optional(),
});

module.exports = { userRegister };
