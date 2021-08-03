var mysql = require('mysql')

var connectionPool = mysql.createPool({
    'user' : process.env.MYSQL_USER,
    'database': process.env.MYSQL_DATABASE,
    'host': process.env.MYSQL_HOST,
    'port' : process.env.MYSQL_PORT
})

exports.pool = connectionPool
