const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const NotFoundError = require('../errors/not-found-err');
const routerUser = require('./users');
const routerMovie = require('./movies');
const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }).unknown(true),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.use(auth);

router.use(routerUser);
router.use(routerMovie);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

module.exports = router;