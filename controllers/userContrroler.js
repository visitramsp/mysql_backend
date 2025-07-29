const connectToDatabase = require("../db");
const bcrypt = require("bcryptjs");
const { sendEmailOTP } = require("../helpers/sendEmail");
const { jsonWebTokenCreate } = require("../middleware/JWT");
const getUserDetail = async (req, res, next) => {
  try {
    const connection = await connectToDatabase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM customers 
      WHERE name LIKE ? OR email LIKE ?
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.query(query, [
      `%${search}%`,
      `%${search}%`,
      limit,
      offset,
    ]);
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM customers WHERE name LIKE ? OR email LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: true,
      message: "User list retrieved successfully",
      response_code: 200,
      data: rows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      response_code: 500,
      message: error.message,
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, mobile_number, age } = req.body;
    const connection = await connectToDatabase();
    const [existing] = await connection.query(
      `SELECT * FROM customers WHERE name = ? OR email = ? OR mobile_number = ?`,
      [name, email, mobile_number]
    );

    if (existing.length > 0) {
      const existingUser = existing[0];
      let duplicateField = [];

      if (existingUser.name === name) duplicateField.push(name);
      if (existingUser.email === email) duplicateField.push(email);
      if (existingUser.mobile_number === mobile_number)
        duplicateField.push(mobile_number);

      return res.status(200).json({
        status: false,
        response_code: 200,
        message: `User already exists with the same ${duplicateField.join(
          ", "
        )}`,
      });
    }
    let role = "user";
    const last4Digits = mobile_number.slice(-4);
    const password = `${name}${last4Digits}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const params = { name, email, password };
    await sendEmailOTP(params);
    const query = `
      INSERT INTO customers ( name, email, mobile_number, role,age,password)
      VALUES (?, ?, ?, ?, ?,?)
    `;

    await connection.query(query, [
      name,
      email,
      mobile_number,
      role,
      age,
      hashedPassword,
    ]);
    return res.status(201).json({
      status: true,
      message: "Customer created successfully",
      response_code: 201,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
      response_code: 500,
    });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        response_code: 400,
        message: "Email and password are required",
      });
    }
    const connection = await connectToDatabase();
    const [rows] = await connection.query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: false,
        response_code: 401,
        message: "Invalid email or password",
      });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        response_code: 401,
        message: "Invalid email or password",
      });
    }

    await connection.query(
      "UPDATE customers SET is_login = true WHERE id = ?",
      [user.id]
    );
    const token = jsonWebTokenCreate(user);
    return res.status(200).json({
      status: true,
      response_code: 200,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        age: user.age,
        role: user.role,
        is_login: 1,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      response_code: 500,
      message: error.message,
    });
  }
};

const logoutCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await connectToDatabase();
    const [result] = await connection.query(
      "UPDATE customers SET is_login = false WHERE id = ?",
      [userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        response_code: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      response_code: 200,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      response_code: 500,
      message: error.message,
    });
  }
};

module.exports = {
  getUserDetail,
  createCustomer,
  loginCustomer,
  logoutCustomer,
};
