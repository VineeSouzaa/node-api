const mysql = require("../mysql")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../mysql").pool

exports.get = (req,res) => {

    mysql.executeQuery(
        "SELECT * FROM users"
    ).then( async (result) => {

        let userList = [] 

        if(result) {
            for(let user of result) {

                let phones = []
    
                await mysql.executeQuery(
                    "SELECT * FROM phones WHERE user = ?",
                    [user.id]
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
        }

        res.send(userList)

    })

}

exports.store = (req,res,errors) => {

    if(errors.isEmpty()) {

        bcrypt.hash(
            req.body.password,
            2,
            (err,hash) => {

                if(err) {
                    return res.status(500).send({
                        'message': 'Houve um erro ao encriptografar a senha',
                        'erro': err
                    })
                }

                mysql.executeQuery(          
                    "INSERT INTO users (name,mail,password) VALUES (?,?,?)",
                    [
                        req.body.name,
                        req.body.email,
                        hash
                    ]
                ).then( async (result) => {

                    if(result) {

                        for(let phone of req.body.telephones) { 
                            await mysql.executeQuery(
                                "INSERT INTO phones (user,phone,area_code) VALUES (?,?,?)",
                                [
                                    result.insertId,
                                    phone.number,
                                    phone.area_code
                                ]
                            )
                        }

                        await mysql.executeQuery(
                            "SELECT * FROM users WHERE id = ?",
                            [
                                result.insertId
                            ],
                        ).then((result) => {

                            res.send({
                                id: result[0].id,
                                created_at: result[0].created_at,
                                modified_at: result[0].modified_at
                            })
                        })

                    }

                })
            }
        )
    } else {
        return res.status(400).json({
            message : 'Existem erros na requisição.',
            erros   : errors.array()
        })
    }

}

exports.login = (req,res) => {

    mysql.executeQuery(
        "SELECT * FROM users WHERE MAIL = ?",
        [
            req.body.email,
        ],
    ).then((result) => {

        if(result.length > 0) {

            bcrypt.compare(req.body.password,result[0].password, (err,same) => {

                if(err) {
                    return res.status(500).send({
                        message: 'houve um erro interno',
                        error: err
                    })
                } 

                if(same) {

                    res.send({
                        message: 'Usuário validado com sucesso.',
                        token: jwt.sign(
                            {
                                id: result[0].id,
                                email: result[0].mail
                            },
                            process.env.SECRET
                        )  
                    })

                } else {
                    res.status(401).send({
                        message: 'usuário não encontrado. Verifique o email ou senha digitada.'
                    })
                }

            })

        } else {
            return res.status(401).send({
                message: 'usuário não encontrado. Verifique o email ou senha digitada.'
            })
        }

    })
}