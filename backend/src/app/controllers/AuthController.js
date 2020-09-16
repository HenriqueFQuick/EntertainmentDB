const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const authConfig = require('../../config/auth')
const mailer = require('../../modules/mailer')

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

        const user = await User.findOne({ email }).select('+password')//procurar usuario com este email(unico)

        if(!user)
            return res.status(400).send({error: 'User not found'})

        if(!await bcrypt.compare(password, user.password))//comparar as senhas com o bcrypt pois ambas estao criptografadas
            return res.status(400).send({ error: 'Invalid password'})

        user.password = undefined//definir como undefined apenas para nao ser retornado para quem fez a requisicao

        return res.send({ user, token: generateToken({id: user.id})});
    },
    async forgotPassword(req, res){
        const { email } = req.body;

        try{

            const user = await User.findOne({ email })//procurar usuario com este email(unico)

            if(!user)
                return res.status(400).send({error: 'User not found'})

            const token = crypto.randomBytes(20).toString('hex')//Gerar um token novo para a recuperacao de senha

            const now = new Date()
            now.setHours(now.getHours() + 1)//Setar uma data de expiracao de token para ser 1h apos a requisicao

            await User.findByIdAndUpdate(user.id, {//Enviar email com o novo token para ser usado (Quando criar o frontend, podera enviar um link para a pagina a ser utilizada)
                '$set':{
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            })

            mailer.sendMail({
                to: email,
                from: 'henrique.fquick@gmail.com',
                template: 'auth/forgot_password',//template criado
                context: { token } //variavel utilizada no template
            }, (err) => {
                if(err) return res.status(400).send({ error: 'Cannot send forgot password email'})
            })

            return res.send();

        }catch(err){
            res.status(400).send({error: 'Error on forgot password. Try Again', detail: err})
        }
    },
    async resetPassword(req, res){
        const { email, token, password } = req.body

        try{

            const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')//procurar usuario com este email(unico)

            if(!user)
                return res.status(400).send({error: 'User not found'})

            if(token !== user.passwordResetToken)//Conferir se o token de reset de senha eh o mesmo que esta sendo enviado
                return res.status(400).send({error: 'Token invalid'})

            const now = new Date()
            
            if(now > user.passwordResetExpires)//Verificar se o token nao expirou
                return res.status(400).send({error: 'Token expired, generate a new one'})

            user.password = password

            await user.save();

            return res.send();

        }catch(err){
            console.log(err)
            res.status(400).send({error: 'Error on reset password. Try Again', detail: err})
        }

    },
    async index(req, res){
        //rota de teste para listar os usuarios cadastrados
        return res.send(await User.find({}) )
    }
}