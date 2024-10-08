const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book');
const userIdMiddleware = require('../controllers/userId');
const multer = require('../middleware/multer');

// Route pour ajouter un livre
router.post('/', userIdMiddleware, multer, bookController.createBook);

// Route pour récupérer tous les livres
router.get('/', bookController.getAllBooks);

// Route pour récupérer un livre par ID
router.get('/:id', bookController.getBookById);

// Route pour modifier un livre
router.put('/:id', userIdMiddleware, multer, bookController.updateBook);

// Route pour supprimer un livre
router.delete('/:id', userIdMiddleware, bookController.deleteBook);

module.exports = router;
