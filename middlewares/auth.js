const jwt = require('jsonwebtoken')

module.exports = (req,res,next ) => {

    try {
        const decode = jwt.verify(
            req.headers.authorization.split(' ')[1],
            process.env.SECRET
        )
        next()
    }
    catch {
        return res.status(401).send({
            message: 'Login expirado, realize a autenticação novamente.'
        })
    }

}