const Book = require('../models/book');

// Créer un livre
exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id; // Supprimer l'ID s'il est présent dans la requête
    const book = new Book({
      ...bookObject,
      userId: req.userId, // Récupérer l'ID de l'utilisateur via le middleware
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null,
    });

    await book.save();
    res.status(201).json({ message: 'Livre ajouté avec succès !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Récupérer tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('userId');
    const formattedBooks = books.map(book => ({
      ...book.toObject(),
      userId: book.userId._id.toString(), // Convertir l'ObjectId en string
      ratings: book.ratings.map(rating => ({
        ...rating,
        userId: rating.userId ? rating.userId.toString() : null,
      })),
    }));
    res.status(200).json(formattedBooks);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Récupérer un livre par ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('userId');
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé !' });
    }
    res.status(200).json({
      ...book.toObject(),
      userId: book.userId._id.toString(),
      ratings: book.ratings.map(rating => ({
        ...rating,
        userId: rating.userId ? rating.userId.toString() : null,
      })),
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Mettre à jour un livre
exports.updateBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body };

    const book = await Book.findByIdAndUpdate(req.params.id, bookObject, { new: true });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Supprimer un livre
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Livre supprimé avec succès !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};
