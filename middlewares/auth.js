const jwt = require('jsonwebtoken')

module.exports = (req,res,next ) => {

    try {
        const decode = jwt.verify(
            req.body.token,
            process.env.SECRET
        )
    }
    catch {
        return res.status(403).send({
            message: 'Login expirado, realize a autenticação novamente.'
        })
    }

}