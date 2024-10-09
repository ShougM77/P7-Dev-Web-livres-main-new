//IMPORTATION DE MULTER
const multer = require("multer");

//IMPORTATION DE SHARP
const sharp = require("sharp");

//DICTIONNAIRE MIME_TYPES
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp'
}

    //CONFIGURATION STOCKAGE MÉMOIRE
    const storage = multer.memoryStorage();

    //INITIALISATION DE MULTER
    const upload = multer(
    {
        storage: storage,
        fileFilter: (req,file,callback) => {

            //TYPES MIMES ACCEPTÉS
            if(MIME_TYPES[file.mimetype])
            {
                callback(null, true);
            }
            //TYPES MIMES REFUSÉS 
            else
            {
                callback(new Error('Type de fichier non pris en charge'),false);
            }  
        }
    }).single('image');


    //SUPPRESSION DE L'EXTENSION
    const suppressionExtension = (nomFichier) => {

        //RÉCUPÉRATION DE L'INDEX DU DERNIER POINT (CELUI AVANT L'EXTENSION DU FICHIER)
        const indexExtension = nomFichier.lastIndexOf('.');

        //SUPPRESSION DE L'EXTENSION
        return nomFichier.substring(0,indexExtension);
    }    
    

    //CONVERSION EN WEBP - REDIMENSIONNEMENT
    const modificationImage = (req,res,next) => {

        //VÉRIFICATION TÉLÉCHARGEMENT IMAGE
        if(!req.file)
        {
            //return res.status(400).json({ message: "Aucune image téléchargée" });
            return next();
        }
        //UNE IMAGE A ÉTÉ TÉLÉCHARGÉE
        else
        {
            //SUPPRESSION DES ESPACES ET REMPLACEMENT PAR DES UNDERSCORES
            const name = suppressionExtension(req.file.originalname).split(" ").join("_") + Date.now() + ".webp";

            //SHARP
            sharp(req.file.buffer)
            .webp({ lossless: true, quality: 80 })         //CONVERSION EN WEBP AVEC 80% DE LA QUALITÉ
            .resize( {width : 404, height: 568} )          //REDIMENSIONNEMENT
            .toFile(`images/${name}`, (error, info) =>     //ENREGISTREMENT DANS images/
            {
                if(error)
                {
                    return res.status(500).json( {error} );
                }

                // MISE À JOUR DU NOM DU FICHIER
                req.file.filename = name;

                next();
            });  
        }
    }

module.exports = {upload, modificationImage};