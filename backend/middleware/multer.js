const multer = require('multer');
const path = require('path');

// Chemin du répertoire images dans le répertoire backend
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Utiliser __dirname pour la résolution correcte du chemin
    cb(null, path.join(__dirname, '../images/')); // Correction du chemin
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;
