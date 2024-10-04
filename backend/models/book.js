const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true }, // Année de publication
  genre: { type: String, required: true }, // Genre du livre
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { 
        type: Number, 
        required: true,
        min: 1, // Note minimale
        max: 5, // Note maximale
      },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

// Méthode pour calculer la moyenne des notes
bookSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((acc, ratingObj) => acc + ratingObj.rating, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0; // Si pas de notes
  }
};

// Middleware qui calcule la moyenne avant de sauvegarder un livre
bookSchema.pre('save', function (next) {
  this.calculateAverageRating();
  next();
});

module.exports = mongoose.model('Book', bookSchema);
