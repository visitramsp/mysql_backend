// middleware/validateRequest.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error, "error");

      const rawMessage = error.details[0].message;
      const cleanedMessage = rawMessage.replace(/"/g, "");
      console.log(cleanedMessage, "error.details[0]");
      return res.status(200).json({
        status: true,
        status_code: 200,
        message: cleanedMessage,
      });
    }
    next();
  };
};

module.exports = validate;
