const mysql = require("../mysql")

exports.getUsers = (req,res) => {

    mysql.executeQuery(
        "SELECT * FROM USERS"
    ).then( async (result) => {

        let userList = [] 

        for(let user of result) {

            let phones = []

            await mysql.executeQuery(
                "SELECT * FROM PHONES WHERE USER = 29",
            ).then((telephones) => {

                for(let phone of telephones) {
                    phones.push({
                        number: phone.phone,
                        area_code: phone.area_code
                    })
                }
       
            })

            userList.push({
                id: user.id,
                email: user.mail,
                created_at: user.created_at,
                modified_at: user.modified_at,
                telephones: phones
            })

        }

        res.send(userList)

    })

    // mysql.getConnection((err,conn,next) => {

    //     if(err) {
    //         return res.status(500).send({
    //             'message': 'houve um erro ao conectar com o servidor',
    //             'error': error.sqlMessage
    //         })
    //     }

    //     conn.query(
    //         "SELECT * FROM USERS",
    //         (err,result,fields) => {

    //             if(err) {
    //                 return res.status(500).send({
    //                     message: 'Houve um erro ao recuperar usuários.',
    //                     error: err.sqlMessage
    //                 })
    //             } 

    //             userList = []

    //             for(let user of result) {

    //                 telephoneList = []

    //                 conn.query(
    //                     "SELECT * FROM PHONES WHERE USER = ?",[user.id],
    //                     (err,result,fields) => {

    //                         conn.release()

    //                         if(err) {
    //                             return res.status(500).send({
    //                                 message: 'Houve um erro ao recuperar os telefones.',
    //                                 error: err.sqlMessage
    //                             })
    //                         }
                            
    //                         for(let phone of result) {
    //                             telephoneList.push({
    //                                 number: phone.phone,
    //                                 area_code: phone.area_code
    //                             })
    //                         }

    //                     }
    //                 )

    //                 userList.push({
    //                     id: user.id,
    //                     email: user.mail,
    //                     created_at: user.created_at,
    //                     modified_at: user.modified_at,
    //                     telephones: null
    //                 })
    //             }

    //             res.send(userList)

    //         }
    //     )
  
    // })
}