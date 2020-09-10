const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const routes = express.Router();

const AuthController = require('./controllers/AuthController');


routes.post('/register',celebrate({
    [Segments.BODY]:Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.required(),
        createdAt: Joi.date()
    })
}) , AuthController.create);

module.exports = routes