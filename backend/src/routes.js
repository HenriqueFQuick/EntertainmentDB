const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const TestController = require('./controllers/TestController');

const routes = express.Router();

routes.get('/testeGet', TestController.index)

routes.post('/testePost', celebrate({
    [Segments.BODY]:Joi.object().keys({
        movie: Joi.string().required(),
        actor: Joi.string().required()
    })
}) ,TestController.index)

module.exports = routes