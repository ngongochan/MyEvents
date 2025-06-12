const mysql = require('mysql2');

// need to put in .env file 
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'MyEvents'
});

module.exports = pool.promise();
