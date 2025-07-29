const connectToDatabase = require("../db");

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
      success: true,
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
      success: false,
      message: error.message,
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, mobile_number, role, age } = req.body;
    if (!name || !email || !mobile_number || !role || !age) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, email, mobile_number, role,age) are required",
      });
    }

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

      return res.status(409).json({
        success: false,
        message: `User already exists with the same ${duplicateField.join(
          ", "
        )}`,
      });
    }

    const query = `
      INSERT INTO customers ( name, email, mobile_number, role,age)
      VALUES (?, ?, ?, ?, ?)
    `;

    await connection.query(query, [name, email, mobile_number, role, age]);
    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      response_code: 201,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      response_code: 500,
    });
  }
};

module.exports = { getUserDetail, createCustomer };
