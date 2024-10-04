const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');

// Ajout d'un livre
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, author, year, genre, rating, userId } = req.body;

    // Validation des champs obligatoires
    if (!title || !author || !year || !genre) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérification de la présence d'une image
    if (!req.file) {
      return res.status(400).json({ message: 'Une image est requise.' });
    }

    // Optimisation de l'image
    const originalImagePath = req.file.path;
    const optimizedImagePath = path.join(__dirname, '../images', `optimized-${req.file.filename}`);

    await sharp(originalImagePath)
      .resize(800)
      .toFile(optimizedImagePath);

    // Suppression de l'image originale
    fs.unlinkSync(originalImagePath);

    // Définir l'URL de l'image optimisée
    const imageUrl = `${req.protocol}://${req.get('host')}/images/optimized-${req.file.filename}`;

    // Créer un nouvel objet Book
    const newBook = new Book({
      title,
      author,
      year,
      genre,
      ratings: rating && userId ? [{ userId, rating: parseInt(rating, 10) }] : [],
    });

    await newBook.save();
    res.status(201).json({ message: 'Livre ajouté avec succès !', book: newBook });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre:', error);
    res.status(500).send('Erreur lors de l’ajout du livre.');
  }
});

// Ajouter une notation à un livre
router.post('/:id/rate', async (req, res) => {
  try {
    const { userId, rating } = req.body;

    // Validation des champs requis
    if (!userId || rating === undefined) {
      return res.status(400).json({ message: 'userId et rating sont requis.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Livre non trouvé !');

    // Ajouter la notation
    book.ratings.push({ userId, rating: parseInt(rating, 10) });

    // Recalculer la note moyenne
    const averageRating = book.ratings.reduce((sum, r) => sum + r.rating, 0) / book.ratings.length;
    book.averageRating = averageRating;

    await book.save();
    res.status(200).json({ message: 'Notation ajoutée !', book });
  } catch (error) {
    console.error('Erreur lors de l’ajout de la notation:', error);
    res.status(500).send('Erreur lors de l’ajout de la notation.');
  }
});

module.exports = router;
