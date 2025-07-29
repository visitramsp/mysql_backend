const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Customer = sequelize.define("customers", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  mobile_number: DataTypes.STRING,
  age: DataTypes.FLOAT,
  password: DataTypes.INTEGER,
  role: DataTypes.INTEGER,
});

module.exports = Customer;
