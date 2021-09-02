const Movie = require('../models/movies');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const CopyrightError = require('../errors/copyright-err');

module.exports.getMovie = (req, res, next) => {
  Movie.find({owner: req.user._id })
    .then((movies) => res.send({ movies }))
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
      throw err;
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findByIdAndRemove(req.params.movieId)
    .then((movie) => {
      if (movie === null) {
        throw new NotFoundError('Такого фильма нет');
      }
      if (String(movie.owner) !== req.user._id) {
        throw new CopyrightError('Невозможно удалить фильм');
      }
      res.send({ movie });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Некорректный запрос'));
      }
      return next(err);
    });
};