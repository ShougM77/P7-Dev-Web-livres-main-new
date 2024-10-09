// import de multer
const multer = require("multer");

// import de sharp
const sharp = require("sharp");

// dictionnaire mime types
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp'
};

// configuration stockage en mémoire
const storage = multer.memoryStorage();

// initialisation de multer
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        // types mimetypes acceptés
        if (MIME_TYPES[file.mimetype]) {
            callback(null, true);
        } else {
            // types mimetypes refusés
            callback(new Error('type de fichier non pris en charge'), false);
        }
    }
}).single('image');

// suppression de l'extension de fichier
const suppressionExtension = (nomFichier) => {
    // récupération du dernier point (avant l'extension)
    const indexExtension = nomFichier.lastIndexOf('.');

    // suppression de l'extension
    return nomFichier.substring(0, indexExtension);
};

// conversion en webp et redimensionnement
const modificationImage = (req, res, next) => {
    // vérification présence d'une image
    if (!req.file) {
        return next();
    } else {
        // suppression des espaces et remplacement par des underscores
        const name = suppressionExtension(req.file.originalname).split(" ").join("_") + Date.now() + ".webp";

        // conversion en webp avec sharp
        sharp(req.file.buffer)
            .webp({ lossless: true, quality: 80 })  // conversion en webp (80% qualité)
            .resize({ width: 404, height: 568 })   // redimensionnement
            .toFile(`images/${name}`, (error, info) => {  // enregistrement dans images/
                if (error) {
                    return res.status(500).json({ error });
                }

                // mise à jour du nom de fichier
                req.file.filename = name;

                next();
            });
    }
};

module.exports = { upload, modificationImage };
