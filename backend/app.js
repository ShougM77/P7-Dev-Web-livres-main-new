// importation du module express
const express = require("express");

// création de l'application express
const app = express();

// accès au chemin des fichiers
const path = require('path');

// chargement des variables d'environnement
require('dotenv').config();

// importation des routes pour les livres et utilisateurs
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");

// importation de mongoose pour connecter à MongoDB
const mongoose = require('mongoose');

// connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion réussie à MongoDB !'))
  .catch(() => console.log('Échec de la connexion à MongoDB !'));

// parse les données JSON dans les requêtes
app.use(express.json());

// middleware pour gérer les CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:;");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// routes pour les livres, utilisateurs et images
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// exportation de l'application
module.exports = app;
