const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ValidationError = require('../errors/validation-err');
const DuplicateError = require('../errors/duplicate-err');
const AuthentificationError = require('../errors/authentification-err');
const NotFoundError = require('../errors/not-found-err');
const { JWT_SECRET = 'dev-secret' } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new DuplicateError('Пользователь с указанным email уже существует');
      }
      throw err;
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Такого пользователя нет');
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 3600000 * 24 * 7,
      }).send({
        _id: user._id,
        email: user.email,
        name: user.name,
      });
    })
    .catch(() => {
      next(new AuthentificationError('Неправильный адрес почты или пароль'));
    });
};

module.exports.logout = (req, res, next) => {
  const { email } = req.body;
  return User.findOne({ email })
    .then((user) => {
      res
        .clearCookie('jwt', {
          httpOnly: true,
          sameSite: true,
        })
        .status(200)
        .send(user);
    })
    .catch(next);
};