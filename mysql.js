var mysql = require('mysql')

var mysql = mysql.createPool({
    'user' : process.env.MYSQL_USER,
    'database': process.env.MYSQL_DATABASE,
    'host': process.env.MYSQL_HOST,
    'port' : process.env.MYSQL_PORT
})

exports.pool = mysql

exports.executeQuery = (query,params) => { 

    return new Promise((resolve) => {
        
        mysql.getConnection((err,conn,next) => {

            if(err) {
                return res.status(500).send({
                    'message': 'houve um erro ao conectar com o servidor',
                    'error': error.sqlMessage
                })
            }

            conn.query(
                query,
                params, 
                (err,result,fields) => {

                    conn.release()

                    if(err) {
                        return res.status(500).send({
                            message: 'Houve um erro ao executar a query.',
                            error: err.sqlMessage
                        })
                    } 

                    resolve(result)

                }
            )

        })

    })
}
