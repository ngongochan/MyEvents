const mysql = require('mysql2');

require('dotenv').config();

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: process.env.MYSQL,
    password: process.env.MYSQL_KEY,
    database: 'MyEvents'
});

module.exports = pool.promise();
