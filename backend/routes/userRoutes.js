//IMPORTATION DU MODULE EXPRESS
const express = require("express");

//CRÉATION D'UN ROUTEUR EXPRESS
const router = express.Router();

//CONTROLLER
const userController = require("../controllers/userId");

/* MÉTHODES */

    //ENREGISTREMENT D'UN UTILISATEUR
    router.post("/signup", userController.createUser);

    //CONNEXION D'UN UTILISATEUR
    router.post("/login", userController.logUser);

/* FIN MÉTHODES */

//EXPORTATION DU ROUTEUR
module.exports = router;