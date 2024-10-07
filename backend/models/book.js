const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { 
    type: Number, 
    required: true,
    min: 1, // Minimum rating
    max: 5, // Maximum rating
  },
});

const bookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, index: true }, // Indexation pour recherche plus rapide
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL de l'image
  ratings: [ratingSchema], // Sous-document pour les évaluations
  averageRating: { type: Number, default: 0 },
});

// Méthode pour recalculer la moyenne des évaluations
bookSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
};

module.exports = mongoose.model('Book', bookSchema);
