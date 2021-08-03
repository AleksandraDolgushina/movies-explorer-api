const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUsers, patchUser } = require('../controllers/users');

router.get('/users/me', getUsers);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

module.exports = router;