const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');

// Ajout livre avec image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, author, description } = req.body;

    if (!title || !author || !description) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    let imageUrl = '';

    if (req.file) {
      // Définir le chemin de l'image originale et optimisée
      const originalImagePath = req.file.path;
      const optimizedImagePath = path.join(__dirname, '../images', `optimized-${req.file.filename}`);

      // Optimiser l'image
      await sharp(originalImagePath)
        .resize(800)
        .toFile(optimizedImagePath);

      // Supprimer image originale
      fs.unlinkSync(originalImagePath);

      // Définir l'URL de l'image optimisée
      imageUrl = `${req.protocol}://${req.get('host')}/images/optimized-${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Une image est requise.' });
    }

    const book = new Book({
      title,
      author,
      description,
      imageUrl,
    });

    console.log('Livre à enregistrer:', book);

    await book.save();
    res.status(201).json({ message: 'Livre ajouté !', book });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre:', error);
    res.status(500).send('Erreur lors de l’ajout du livre.');
  }
});

// Ajouter une notation
router.post('/:id/rate', async (req, res) => {
  try {
    const { userId, rating } = req.body;

    if (!userId || rating === undefined) {
      return res.status(400).json({ message: 'userId et rating sont requis.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Livre non trouvé !');

    // Ajouter la notation
    book.ratings.push({ userId, rating });

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
