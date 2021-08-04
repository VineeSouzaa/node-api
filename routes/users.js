const express = require('express')
const router = express.Router()
const mysql = require("../mysql").pool
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require('express-validator')
const auth = require("../middlewares/auth")

const usersController = require('../controllers/usersController')

router.get('/', auth, usersController.getUsers)

router.post(
    '/',
    body('name').isString(),
    body('email').isString(),
    // body('email').custom(function(value) {

    //     mysql.getConnection((err,conn,next) => {

    //         if(err) {
    //             return res.status(500).send({
    //                 'message': 'houve um erro ao conectar com o servidor',
    //                 'error': error.sqlMessage
    //             })
    //         }

    //         conn.query(
    //             "SELECT * FROM USERS WHERE MAIL = ?",
    //             [
    //                 value
    //             ],
    //             (err,result,fields) => {
                    
    //                 if(err) { 
    //                     return res.status(500).send({
    //                         'message': 'houve um erro ao conectar com o servidor',
    //                         'error': error.sqlMessage
    //                     })
    //                 }
                   
    //                 if(result.length > 0) {
    //                     return Promise.reject('Este e-mail já está sendo utilizado.')
    //                 } else { 
    //                     return Promise.resolve()
    //                 }
             
    //             }
    //         )

    //     })

    // }),
    body('password').isString(),
    body('telephones').custom((telephones) => {

        for(let phone of telephones) {
            if(!typeof phone.number == 'number' || !typeof phone.area_code == 'number') {
                return Promise.reject('Telefone não cumpre os requisitos necessários.')
            }
        }

        return Promise.resolve()

    }),
    (req,res) => {

        const errors = validationResult(req)

        if(errors.isEmpty()) {

            mysql.getConnection((err,conn,next) => {

                if(err) {
                    return res.status(500).send({
                        'message': 'houve um erro ao conectar com o servidor',
                        'error': error.sqlMessage
                    })
                }
        
                bcrypt.hash(req.body.password,2,(err,hash) => {

                    if(err) {
                        return res.status(500).send({
                            'message': 'Houve um erro ao encriptografar a senha',
                            'erro': err
                        })
                    }

                    conn.query(
                        "INSERT INTO USERS (NAME,MAIL,PASSWORD) VALUES (?,?,?)",
                        [
                            req.body.name,
                            req.body.email,
                            hash
                        ],
                        (err,result,fields) => {
                        
                            conn.release()
            
                            if(err) {
                                return res.status(500).send({
                                    message: 'Houve um erro ao incluir o usuário.',
                                    error: err.sqlMessage
                                })
                            } else { 
            
                                new Promise( (resolve,reject) => {
            
                                    for(let phone of req.body.telephones) {
                                    
                                        conn.query(
                                            "INSERT INTO PHONES (USER,PHONE,AREA_CODE) VALUES (?,?,?)",
                                            [
                                                result.insertId,
                                                phone.number,
                                                phone.area_code
                                            ]
                                        ),
                                        (err,resut,fields) => {
                
                                            conn.release()
                
                                            if(err) {
                                                return res.status(500).send({
                                                    'message': 'Houve um erro ao incluir o telefone.',
                                                    'error': err.sqlMessage
                                                })
                                            }
                
                                        }
                
                                    }
            
                                    resolve()
            
                                }).then(() => {
                                    res.send({
                                        'message': 'Criado com sucesso.',
                                        'fields': fields
                                    })
                                })

                            }
            
                        }
                    )
                })
                    
            })

        } else {
            return res.status(400).json({
                message : 'Existem erros na requisição.',
                erros   : errors.array()
            })
        }
    }
)

router.post('/login', (req,res) => {

    mysql.getConnection((err,conn,next) => {

        if(err) {
            return res.status(500).send({
                'message': 'houve um erro ao conectar com o servidor',
                'error': error.sqlMessage
            })
        }

        conn.query(
            "SELECT * FROM USERS WHERE MAIL = ?",
            [
                req.body.email,
            ],
            (err,result,fields) => {

                conn.release()
                
                if(err) {
                    return res.status(500).send({
                        'message': 'Houve um erro ao realizar o login.',
                        'error': error.sqlMessage
                    })
                }
                
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
            }
        )

    })

})

module.exports = router