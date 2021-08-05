const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const mysql = require("../mysql")
const auth = require("../middlewares/auth")
const usersController = require('../controllers/usersController')

router.get('/', auth, usersController.get)

router.post('/login', usersController.login)

router.post(
    '/',
    body('name').isString().withMessage("O nome tem que ser um texto."),
    body('email').isEmail().withMessage("E-mail inválido."),
    body('email').custom( async (value) => {
 
        await mysql.executeQuery(
            "SELECT * FROM users WHERE MAIL = ?",[value]
        ).then((result) => {
           
            if(result.length) {
                return Promise.reject('Este e-mail já está sendo utilizado.')
            }

        })

    }),
    body('password').isString().withMessage("A senha tem que ser um texto."),
    body('telephones').custom( (telephones) => {

        for(let phone of telephones) {
            if(typeof phone.number != 'number' || typeof phone.area_code != 'number') {
                return Promise.reject()
            } 
        }

        return Promise.resolve()

    }).withMessage("Telefone não cumpre os requisitos necessários."),
    (req,res) => {

        const errors = validationResult(req)
        usersController.store(req,res,errors)
    }
)

module.exports = router