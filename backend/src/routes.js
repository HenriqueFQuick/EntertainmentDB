const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const routes = express.Router();

const AuthController = require('./app/controllers/AuthController');
const projectController = require('./app/controllers/ProjectController');

const authMiddleware = require('./app/middlewares/auth')


routes.post('/register',celebrate({
    [Segments.BODY]:Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.required(),
        createdAt: Joi.date()
    })
}) , AuthController.create);

routes.post('/authenticate', AuthController.authenticate)

routes.post('/forgot_password', AuthController.forgotPassword)

routes.post('/reset_password', AuthController.resetPassword)



//ROTAS PARA TESTES INICIAIS
routes.get('/teste', authMiddleware, projectController.index)
routes.get('/index', AuthController.index)

module.exports = routes