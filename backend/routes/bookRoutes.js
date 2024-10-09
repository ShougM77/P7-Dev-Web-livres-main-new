// importation du module express
const express = require("express");

// controller
const bookController = require("../controllers/books");

// importation middleware auth
const auth = require("../middleware/auth");

/* multer - importation middleware upload & modificationImage */
const { upload, modificationImage } = require('../middleware/multer');


// création d'un routeur express
const router = express.Router();

// récupération de tous les livres
router.get("/", bookController.getAllBooks);

// récupération des trois livres les mieux notés
router.get("/bestrating", bookController.getBestThree);

// récupération d'un livre
router.get("/:id", bookController.getBook);

// enregistrement d'un livre
router.post("/", auth, upload, modificationImage, bookController.createBook);

// mise à jour d'un livre
router.put("/:id", auth, upload, modificationImage, bookController.updateBook);

// suppression d'un livre
router.delete("/:id", auth, bookController.deleteBook);

// notation d'un livre
router.post("/:id/rating", auth, bookController.rateBook);

// exportation du routeur
module.exports = router;
