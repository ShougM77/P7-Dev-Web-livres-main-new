const multer = require('multer');
const path = require('path');

// Définir les types de fichiers autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Configurer le stockage avec Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Répertoire de destination pour les images
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension); // Générer un nom de fichier unique
  },
});

module.exports = multer({ storage: storage }).single('image');
