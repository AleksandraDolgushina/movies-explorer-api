const { celebrate, Joi } = require('celebrate');
const { createUser, login, logout } = require('../controllers/users');
const NotFoundError = require('../errors/not-found-err');
const router = require('express').Router();

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.post('/signout', logout);

router.use('/', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

module.exports = router;