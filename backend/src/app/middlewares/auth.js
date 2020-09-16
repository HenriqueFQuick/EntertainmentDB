const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;//recupera a autorizacao do header authorization

    if(!authHeader)//verifica se a autorizacao foi informada
        return res.status(401).send({ error: 'No token provided' })
    
    const parts = authHeader.split(' ')

    if(!parts.length ===2)//verifica se a autorizacao tem 2 partes ( Bearer <token> )
        return res.status(401).send({ error: 'Token error' })

    const [ scheme, token ] = parts

    if(!/^Bearer$/i.test(scheme))//verificar se o scheme eh igual a 'Bearer'
        return res.status(401).send({ error: 'Token malformated' })

    jwt.verify(token, authConfig.secret, (err, decoded) => {

        if(err) return res.status(401).send({ error: 'Token invalid' })//se a funcao verify retornar erro, significa que o token gerado nao foi com o secret cadastrado na aplicacao

        req.userId = decoded.id;//retornar o userId para fazer verificacoes em outras rotas mais facilmente

        return next();

    })
}