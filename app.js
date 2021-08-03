const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const userRoutes = require('./routes/users')

app.use(bodyParser.json())
app.use('/users',userRoutes)

app.use((req,res) => {
    res.status(200).send({
        mensagem : "OK"
    })
})

module.exports = app