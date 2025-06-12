const mysql = require('mysql2');

// need to put in .env file 
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'MyEvents'
});

module.exports = pool.promise();
