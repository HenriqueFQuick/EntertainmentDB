const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const routes = express.Router();

const AuthController = require('./app/controllers/AuthController');
const ProjectController = require('./app/controllers/ProjectController');

const authMiddleware = require('./app/middlewares/auth')

//AuthController
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

//ProjectController
routes.get('/projects', authMiddleware, ProjectController.index)
routes.get('/projects/:projectId', authMiddleware, ProjectController.show)
routes.post('/projects', authMiddleware, ProjectController.create)
routes.put('/projects/:projectId', authMiddleware, ProjectController.update)
routes.delete('/projects/:projectId', authMiddleware, ProjectController.delete)

//ROTAS PARA TESTES INICIAIS
routes.get('/index', AuthController.index)
routes.get('/indexTask', ProjectController.indexTask)

module.exports = routes