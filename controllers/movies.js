const Movie = require('../models/movies');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const CopyrightError = require('../errors/copyright-err');

module.exports.getMovie = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.send({ movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie === null) {
        throw new NotFoundError('Такого фильма нет');
      }
      if (card.owner.equals(req.user._id)) {
        Card.findByIdAndRemove(req.params.movieId)
          .then((movie) => res.send({ movie }));
      } else {
        throw new CopyrightError('Невозможно удалить фильм');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Некорректный запрос'));
      }
      return next(err);
    });
};