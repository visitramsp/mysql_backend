const jwt = require("jsonwebtoken");
const connectToDatabase = require("../db");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const jsonWebTokenCreate = (user) => {
  if (!user?.email) {
    throw new Error(
      "Invalid user object. Email is required for token generation."
    );
  }
  const payload = { ...user };
  // const token = jwt.sign(payload, secretKey, { expiresIn: "5h" });
  const token = jwt.sign(payload, secretKey);
  return token;
};

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token Not Found" });
  const token = req.headers.authorization.split(" ")[0];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secretKey);
    // Attach user information to the request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ status: false, message: "Unauthorized: No token provided" });
//   }
//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const email = decoded.email;
//     console.log(decoded, "decoded");
//     const connection = await connectToDatabase();
//     const [users] = await connection.query(
//       "SELECT * FROM customers WHERE email = ?",
//       [email]
//     );
//     // const user = await uerRegistrationModel.findOne({ email: decoded.email });
//     if (!users || !users.is_login) {
//       return res
//         .status(401)
//         .json({ status: false, message: "Invalid token------" });
//     }
//     req.users = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ status: false, message: "Invalid token" });
//   }
// };

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized: No token provided",
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    // 2. Decode and verify token
    const decoded = jwt.verify(token, secretKey);
    const email = decoded.email;

    // 3. Connect to DB and check if user is logged in
    const connection = await connectToDatabase();
    const [users] = await connection.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (!users.length || users[0].is_login !== 1) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid token or user not logged in",
      });
    }
    req.user = users[0];
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({
      status: false,
      message: "Invalid token",
    });
  }
};

module.exports = { jsonWebTokenCreate, jwtAuthMiddleware, verifyToken };
