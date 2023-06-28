const mysql = require('mysql');
require('dotenv').config();

// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
// Export the connection for use in other files

module.exports = connection;
