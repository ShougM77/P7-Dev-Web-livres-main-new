const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      grade: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  ],
  averageRating: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model('Book', bookSchema);
