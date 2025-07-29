const mysql = require("mysql2/promise");

let connection;

async function connectToDatabase() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "users",
    });

    console.log("✅ Connected to MySQL Database");
  }
  return connection;
}

module.exports = connectToDatabase;
