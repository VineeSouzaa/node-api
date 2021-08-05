var mysql = require('mysql')

var pool = mysql.createPool({
    'user' : process.env.MYSQL_USER,
    'database': process.env.MYSQL_DATABASE,
    'host': process.env.MYSQL_HOST,
    'password': process.env.MYSQL_PASSWORD,
    'port' : process.env.MYSQL_PORT
})

exports.pool = pool

exports.executeQuery = async (query,params) => { 

    return new Promise((resolve) => {
        
        pool.getConnection((err,conn) => {

            if(err) {
                throw err
            }

            conn.query(
                query,
                params,
                (error,result) => {
                    conn.release()
                    resolve(result)
                }
            )
 
        })

    })
}
