const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer'); // Middleware Multer pour les fichiers
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');

// Ajout d'un nouveau livre avec image
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, author, year, genre, rating } = req.body;

    // Validation des champs obligatoires
    if (!title || !author || !year || !genre) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    let imageUrl = '';

    if (req.file) {
      // Définir les chemins pour l'image originale et optimisée
      const originalImagePath = req.file.path;
      const optimizedImagePath = path.join(__dirname, '../images', `optimized-${req.file.filename}`);

      // Optimiser l'image avec Sharp
      await sharp(originalImagePath)
        .resize(800)
        .toFile(optimizedImagePath);

      // Supprimer l'image originale après optimisation
      if (fs.existsSync(originalImagePath)) {
        fs.unlinkSync(originalImagePath);
      }

      // Construire l'URL de l'image optimisée
      imageUrl = `${req.protocol}://${req.get('host')}/images/optimized-${req.file.filename}`;
    }

    // Créer un nouvel objet Book avec les données reçues
    const newBook = new Book({
      title,
      author,
      year,
      genre,
      imageUrl,
      ratings: rating ? [{ userId: localStorage.getItem('userId'), rating: parseInt(rating, 10) }] : [],
      averageRating: rating ? parseInt(rating, 10) : 0,
    });

    await newBook.save();
    res.status(201).json({ message: 'Livre ajouté avec succès !', book: newBook });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre:', error);
    res.status(500).json({ message: 'Erreur lors de l’ajout du livre.' });
  }
});

// Mise à jour d'un livre existant
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, author, year, genre, rating } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé.' });
    }

    let imageUrl = book.imageUrl;

    if (req.file) {
      // Définir les chemins pour l'image originale et optimisée
      const originalImagePath = req.file.path;
      const optimizedImagePath = path.join(__dirname, '../images', `optimized-${req.file.filename}`);

      // Optimiser l'image
      await sharp(originalImagePath)
        .resize(800)
        .toFile(optimizedImagePath);

      // Supprimer l'image originale après optimisation
      if (fs.existsSync(originalImagePath)) {
        fs.unlinkSync(originalImagePath);
      }

      // Mettre à jour l'URL de l'image optimisée
      imageUrl = `${req.protocol}://${req.get('host')}/images/optimized-${req.file.filename}`;
    }

    // Mettre à jour les données du livre
    book.title = title || book.title;
    book.author = author || book.author;
    book.year = year || book.year;
    book.genre = genre || book.genre;
    book.imageUrl = imageUrl;

    if (rating) {
      const userRating = book.ratings.find((r) => r.userId === localStorage.getItem('userId'));
      if (userRating) {
        userRating.rating = parseInt(rating, 10);
      } else {
        book.ratings.push({ userId: localStorage.getItem('userId'), rating: parseInt(rating, 10) });
      }

      // Recalculer la note moyenne
      const totalRating = book.ratings.reduce((sum, r) => sum + r.rating, 0);
      book.averageRating = totalRating / book.ratings.length;
    }

    await book.save();
    res.status(200).json({ message: 'Livre mis à jour avec succès !', book });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du livre.' });
  }
});

module.exports = router;
