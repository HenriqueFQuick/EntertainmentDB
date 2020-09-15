const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const authConfig = require('../config/auth')

//gerar um token com o secret cadastrado e com o parametro informado, expirando em 1 dia
function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

module.exports = {
    async create(req, res){

        const { email } = req.body

        try {

            if(await User.findOne({ email }))//procura se ja existe um usuario cadastrado com o email informado
                return res.status(400).send({ error: "User already exists"})

            const user = await User.create(req.body)//criar um usuario com as informacoes recebidas no body da requisicao
            
            user.password = undefined//definir como undefined apenas para nao ser retornado para quem fez a requisicao

            return res.send({ user, token: generateToken({id: user.id}) });

        }catch(err) {
            return res.status(400).send(err.message)
        }
    },
    async authenticate(req, res){
        const {email, password} = req.body;

        const user = await User.findOne({ email }).select('+password')//procurar usuario com este email(unico) e essa senha

        if(!user)
            return res.status(400).send({error: 'User not found'})

        if(!await bcrypt.compare(password, user.password))//comparar as senhas com o bcrypt pois ambas estao criptografadas
            return res.status(400).send({ error: 'Invalid password'})

        user.password = undefined//definir como undefined apenas para nao ser retornado para quem fez a requisicao

        return res.send({ user, token: generateToken({id: user.id})});
    },
    async index(req, res){
        //rota de teste para listar os usuarios cadastrados
        return res.send(await User.find({}) )
    }
}