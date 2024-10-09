//IMPORTATION DU MODULE EXPRESS
const express = require("express");

//CRÉATION DE L'APPLICATION EXPRESS
const app = express();

//ACCÈS AU PATH DU SERVEUR
const path = require('path');

//CHARGEMENT VARIABLES D'ENVIRONNEMENT
require('dotenv').config();

//IMPORTATION DES ROUTES POUR LES LIVRES ET LES UTILISATEURS
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");

//IMPORTATION DU MODULE MONGOOSE POUR LA CONNEXION À LA BASE DE DONNÉES MONGODB
const mongoose = require('mongoose');

//CONNEXION À LA BASE DE DONNÉES
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//REMPLACEMENT DE BODY PARSER POUR ACCÉDER AU CORPS DE LA REQUÊTE
app.use(express.json());

//MIDDLEWARE POUR GÉRER LES CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:;");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//UTILISATION DES ROUTES POUR LES IMAGES, LES LIVRES ET LES UTILISATEURS
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

//EXPORTATION DE L'APPLICATION
module.exports = app;
