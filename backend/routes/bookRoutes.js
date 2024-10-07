const express = require('express');
const router = express.Router();
const multer = require('multer'); // Middleware pour le téléchargement de fichiers
const upload = multer({ dest: 'images/' }); // Dossier temporaire pour les fichiers
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');

// Route pour récupérer tous les livres
router.get('/', async (req, res) => {
  console.log('GET /api/books appelé');
  try {
    const books = await Book.find();
    console.log('Livres récupérés avec succès:', books);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres.' });
  }
});

// Ajout d'un nouveau livre avec image
router.post('/', upload.single('image'), async (req, res) => {
  console.log('POST /api/books appelé avec données:', req.body);

  // Vérifiez le fichier téléchargé
  if (req.file) {
    console.log('Fichier reçu:', req.file);
  } else {
    console.log('Aucun fichier reçu.');
  }

  try {
    const { title, author, year, genre, rating, userId } = req.body; // Récupération des données

    // Validation des champs obligatoires
    if (!title || !author || !year || !genre || !userId) {
      console.error('Champs manquants lors de l\'ajout du livre:', { title, author, year, genre, userId });
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    let imageUrl = '';

    // Traitement de l'image si un fichier est reçu
    if (req.file) {
      const originalImagePath = req.file.path;
      const optimizedImagePath = path.join(__dirname, '../images', `optimized-${req.file.filename}`);

      console.log('Optimisation de l\'image:', originalImagePath);

      // Optimiser l'image avec Sharp
      await sharp(originalImagePath)
        .resize(800)
        .toFile(optimizedImagePath);

      // Supprimer l'image originale après optimisation
      if (fs.existsSync(originalImagePath)) {
        fs.unlinkSync(originalImagePath);
        console.log('Image originale supprimée:', originalImagePath);
      }

      imageUrl = `${req.protocol}://${req.get('host')}/images/optimized-${req.file.filename}`;
      console.log('URL de l\'image générée:', imageUrl);
    }

    // Création d'un nouvel objet livre
    const newBook = new Book({
      title,
      author,
      year,
      genre,
      imageUrl,
      userId,
      ratings: rating ? [{ userId, grade: parseInt(rating, 10) }] : [],
    });

    // Sauvegarde du livre dans la base de données
    await newBook.save();
    console.log('Livre ajouté avec succès:', newBook);
    res.status(201).json({ message: 'Livre ajouté avec succès !', book: newBook });
  } catch (error) {
    console.error('Erreur lors de l’ajout du livre:', error);
    res.status(500).json({ message: 'Erreur lors de l’ajout du livre.' });
  }
});

// Autres routes (par exemple, pour mettre à jour ou supprimer un livre) peuvent être ajoutées ici

module.exports = router;
