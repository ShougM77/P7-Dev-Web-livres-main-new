require('dotenv').config(); // Charger les variables d'environnement

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Importer le middleware CORS
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Utiliser CORS pour autoriser les requêtes cross-origin
app.use(cors());

app.use(express.json());

// Connexion MongoDB (toujours en dur comme vous l'avez demandé)
mongoose.connect(
  'mongodb+srv://Mongotest:Mongotest@cluster0.4rsri.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée :', error));

// Utiliser les routes pour les utilisateurs
app.use('/api/auth', userRoutes);

// Utiliser les routes pour les livres
app.use('/api/books', bookRoutes);

// Servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

// Gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée !' });
});

module.exports = app;
