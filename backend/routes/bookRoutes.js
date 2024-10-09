//IMPORTATION DU MODULE EXPRESS
const express = require("express");

//CONTROLLER
const bookController = require("../controllers/books");

//IMPORTATION MIDDLEWARE AUTH
const auth = require("../middleware/auth");

/* MULTER - IMPORTATION MIDDLEWARE UPLOAD & MODIFICATIONIMAGE*/

    const {upload, modificationImage} = require('../middleware/multer');
    
/* FIN MULTER */

//CRÉATION D'UN ROUTEUR EXPRESS
const router = express.Router();

/* MÉTHODES */

    //RÉCUPÉRATION DE TOUS LES LIVRES
    router.get("/", bookController.getAllBooks);

    //RÉCUPÉRATION DES TROIS LIVRES LES MIEUX NOTÉS
    router.get("/bestrating", bookController.getBestThree);

    //RÉCUPÉRATION D'UN LIVRE
    router.get("/:id", bookController.getBook);

    //ENREGISTREMENT D'UN LIVRE
    router.post("/", auth, upload, modificationImage, bookController.createBook);

    //MISE À JOUR D'UN LIVRE
    router.put("/:id", auth, upload, modificationImage, bookController.updateBook);

    //SUPPRESSION D'UN LIVRE
    router.delete("/:id", auth, bookController.deleteBook);

    //NOTATION D'UN LIVRE
    router.post("/:id/rating", auth, bookController.rateBook);

/* FIN MÉTHODES */

//EXPORTATION DU ROUTEUR
module.exports = router;