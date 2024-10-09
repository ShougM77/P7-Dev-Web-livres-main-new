// importation du module express
const express = require("express");

// création du routeur express
const router = express.Router();

// controller
const userController = require("../controllers/userId");

// routes
router.post("/signup", userController.createUser);  // enregistrement d'un utilisateur
router.post("/login", userController.logUser);      // connexion d'un utilisateur

// exportation du routeur
module.exports = router;
