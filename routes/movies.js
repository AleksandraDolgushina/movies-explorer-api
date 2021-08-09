const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const validator = require('validator');
const ValidationError = require('../errors/validation-err');
const { deleteMovie, getMovie, createMovie } = require('../controllers/movies');

const methodValidation = (value) => {
  const method = validator.isURL(value, { require_protocol: true });
  if (!method) {
    return new ValidationError('Введены некорректные данные');
  }
  return value;
};

router.get('/movies', getMovie);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.number().integer(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(methodValidation, 'Validation Link'),
    trailer: Joi.string().required().custom(methodValidation, 'Validation Link'),
    thumbnail: Joi.string().required().custom(methodValidation, 'Validation Link'),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

module.exports = router;