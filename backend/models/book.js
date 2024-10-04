const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: String, required: true },
  genre: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL de l'image
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model('Book', bookSchema);
