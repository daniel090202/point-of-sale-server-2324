const mysql = require('mysql');

const { HOST, USER, PASSWORD, DATABASE } = process.env;

// Database connection to PHP MyAdmin on localhost
const connection = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
})

module.exports = connection;