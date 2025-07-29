const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Customer = sequelize.define("customers", {
  fullname: DataTypes.STRING,
  email: DataTypes.STRING,
  mobile_number: DataTypes.STRING,
  age: DataTypes.INTEGER,
  status: DataTypes.BOOLEAN,
});

module.exports = Customer;
