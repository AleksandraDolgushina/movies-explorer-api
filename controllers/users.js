const User = require('../models/user');
const ValidationError = require('../errors/validation-err');
const DuplicateError = require('../errors/duplicate-err');
const AuthentificationError = require('../errors/authentification-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    // eslint-disable-next-line no-unused-vars
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
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      }).send({ token });
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